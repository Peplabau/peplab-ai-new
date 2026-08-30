-- Limited admin: turn the public landing page on/off without full admin access.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS can_manage_landing boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.can_manage_landing IS
  'When true, the user can open a restricted admin panel to toggle landing_page_settings only.';

CREATE OR REPLACE FUNCTION public.set_landing_page_enabled(p_enabled boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_is_admin boolean := false;
  v_can_landing boolean := false;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT COALESCE(is_admin, false), COALESCE(can_manage_landing, false)
  INTO v_is_admin, v_can_landing
  FROM public.profiles
  WHERE id = v_user_id;

  IF NOT v_is_admin AND NOT v_can_landing THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authorized');
  END IF;

  INSERT INTO public.site_settings (key, value)
  VALUES ('landing_page_settings', jsonb_build_object('enabled', p_enabled))
  ON CONFLICT (key) DO UPDATE
  SET value = COALESCE(public.site_settings.value, '{}'::jsonb)
    || jsonb_build_object('enabled', p_enabled);

  RETURN jsonb_build_object('ok', true, 'enabled', p_enabled);
END;
$$;

REVOKE ALL ON FUNCTION public.set_landing_page_enabled(boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_landing_page_enabled(boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.grant_landing_access(
  p_email text,
  p_enabled boolean DEFAULT true,
  p_full_name text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_target public.profiles%ROWTYPE;
  v_email text := lower(trim(p_email));
BEGIN
  IF v_admin_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_admin_id AND is_admin = true
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authorized');
  END IF;

  IF v_email IS NULL OR v_email = '' OR v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_email');
  END IF;

  SELECT * INTO v_target
  FROM public.profiles
  WHERE lower(email) = v_email
  LIMIT 1;

  IF v_target.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'profile_not_found');
  END IF;

  UPDATE public.profiles
  SET
    can_manage_landing = COALESCE(p_enabled, true),
    full_name = CASE
      WHEN p_full_name IS NOT NULL AND trim(p_full_name) <> '' THEN trim(p_full_name)
      ELSE full_name
    END
  WHERE id = v_target.id;

  RETURN jsonb_build_object(
    'ok', true,
    'user_id', v_target.id,
    'email', v_target.email,
    'can_manage_landing', COALESCE(p_enabled, true)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.grant_landing_access(text, boolean, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.grant_landing_access(text, boolean, text) TO authenticated;
