#!/usr/bin/env bash
# Apply peplab.ai-specific static + env files to a project copy.
# Run from the repo root:  bash deploy/peplab-ai/apply.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
AI="$ROOT/deploy/peplab-ai"

cp "$AI/index.html" "$ROOT/index.html"
cp "$AI/public/robots.txt" "$ROOT/public/robots.txt"
cp "$AI/public/sitemap.xml" "$ROOT/public/sitemap.xml"
cp "$AI/.env.example" "$ROOT/.env.example"

echo "Applied peplab.ai deploy files:"
echo "  index.html"
echo "  public/robots.txt"
echo "  public/sitemap.xml"
echo "  .env.example"
echo ""
echo "Next: copy .env.example → .env, add Supabase keys, deploy to Vercel with peplab.ai domain only."
