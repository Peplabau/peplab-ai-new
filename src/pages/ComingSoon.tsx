import { SEO } from '@/components/SEO';
import { CONFIG } from '@/lib/config';

export default function ComingSoon() {
  return (
    <main className="min-h-screen min-h-dvh bg-[#070A12] text-[#F4F6FA] flex items-center justify-center px-6">
      <SEO
        title="PEPLAB | Coming soon"
        description="PEPLAB is preparing the next drop of research peptides. Check back shortly."
        noIndex
      />
      <div className="w-full max-w-md text-center">
        <p className="text-[11px] tracking-[0.28em] uppercase text-[#A9B3C7] mb-4">PEPLAB Australia</p>
        <h1
          className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4"
          style={{
            fontFamily: 'Sora, Inter, sans-serif',
            background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Coming soon
        </h1>
        <p className="text-sm text-[#A9B3C7] leading-relaxed mb-8">
          We are updating the storefront. Research peptides, HPLC-tested batches and COAs will be back here shortly.
        </p>
        <a
          href={`mailto:${CONFIG.SUPPORT_EMAIL}`}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#2ED1B4]/10 border border-[#2ED1B4]/30 text-[#2ED1B4] text-xs font-semibold hover:bg-[#2ED1B4]/15"
        >
          {CONFIG.SUPPORT_EMAIL}
        </a>
      </div>
    </main>
  );
}
