import { SEO } from '@/components/SEO';

export default function ComingSoon() {
  return (
    <main className="min-h-screen min-h-dvh bg-[#070A12] text-[#F4F6FA] flex items-center justify-center px-6">
      <SEO
        title="PEPLAB | Coming soon"
        description="PEPLAB is coming soon."
        noIndex
      />
      <h1
        className="text-4xl sm:text-5xl font-extrabold tracking-tight"
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
    </main>
  );
}
