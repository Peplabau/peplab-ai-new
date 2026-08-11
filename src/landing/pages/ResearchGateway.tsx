import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject, type TouchEvent } from 'react';
import gsap from 'gsap';
import {
  ArrowRight,
  Beaker,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Dna,
  FlaskConical,
  Layers,
  Scale,
  Shield,
  Truck,
} from 'lucide-react';
import CountUp from '@/landing/components/new-landing/CountUp';
import OzcaniumAnalyticsName from '@/components/OzcaniumAnalyticsName';
import WriteInText from '@/landing/components/new-landing/WriteInText';
import { SEO } from '@/landing/components/SEO';
import { RESEARCH_GATEWAY_SEO } from '@/landing/lib/seo-keywords';
import LandingFooter from '@/landing/components/LandingFooter';
import { getStaticProducts } from '@/landing/lib/static-data';
import { coaArchiveUrl, shopPageUrl } from '@/landing/lib/site';
import { siteHostname } from '@/lib/domain';
import TrustpilotReviews from '@/sections/TrustpilotReviews';

const COUNT_DURATION = 1.75;
const COUNT_BASE_DELAY = 0.55;
const BATCH_NO = 'BN88LAB';

const COA_TEST_CARDS = [
  {
    id: 'hplc',
    title: 'HPLC Purity',
    result: '99.20%',
    note: 'Area % by RP-HPLC',
  },
  {
    id: 'lcms',
    title: 'LC-MS Identity',
    result: 'Confirmed',
    note: 'MW matches expected sequence',
  },
  {
    id: 'assay',
    title: 'Content Assay',
    result: '10.2mg',
    note: 'Net peptide vs 10mg label',
  },
] as const;

const HERO_META_STATS = [
  { icon: Shield, kind: 'count' as const, end: 99, prefix: '≥', suffix: '%', label: 'Purity' },
  { icon: Beaker, kind: 'text' as const, value: 'HPLC', label: 'Tested' },
  { icon: Layers, kind: 'count' as const, end: 60, suffix: '+', label: 'Batches' },
  { icon: Truck, kind: 'text' as const, value: 'AusPost', label: 'Express' },
] as const;

const TICKER_ITEMS = [
  { id: 'Batch BN88LAB · Lot A', hplc: '99.20%', lcms: 'LC-MS pass', assay: '10.2mg' },
  { id: 'Batch BN88LAB · Lot B', hplc: '99.42%', lcms: 'LC-MS pass', assay: '10.1mg' },
  { id: 'Batch BN88LAB · Lot C', hplc: '99.68%', lcms: 'LC-MS pass', assay: '10.3mg' },
  { id: 'Batch BN88LAB · Lot D', hplc: '99.31%', lcms: 'LC-MS pass', assay: '10.0mg' },
  { id: 'Batch BN88LAB · Lot E', hplc: '99.55%', lcms: 'LC-MS pass', assay: '10.2mg' },
] as const;

const COA_SLIDE_COUNT = 5;
const COA_AUTO_ADVANCE_MS = 5000;

const PEPTIDE_KNOWLEDGE = [
  {
    icon: Beaker,
    title: 'Research peptides',
    text: 'Synthetic sequences for in-vitro work — binding assays, cell culture, method validation. Supplied as research material only, not for injection or oral use.',
  },
  {
    icon: FlaskConical,
    title: 'Why we run three tests',
    text: 'HPLC gives you purity. It does not confirm the sequence is correct or that the vial contains the fill weight on the label. LC-MS and a content assay cover those gaps.',
  },
  {
    icon: Layers,
    title: 'Matching batch to COA',
    text: 'Your dispatch note lists a batch ID. Look that number up in our COA archive — the HPLC, LC-MS, and assay figures on the certificate should match the lot you received.',
  },
  {
    icon: Shield,
    title: 'After it arrives',
    text: 'Store lyophilised peptide at −20°C or colder until reconstitution. Handle under your lab SOPs. The COA goes in your records; it does not change the research-only status of the material.',
  },
] as const;

const APPROACH = [
  {
    icon: FlaskConical,
    title: 'HPLC purity',
    text: 'Reverse-phase HPLC reports area-% purity. Most labs check this line first — we publish the raw figure on every batch COA, not a rounded marketing number.',
  },
  {
    icon: Dna,
    title: 'LC-MS identity',
    text: 'Mass spec confirms observed molecular weight against the ordered sequence. Catches synthesis errors and label mix-ups that a clean chromatogram alone would not.',
  },
  {
    icon: Scale,
    title: 'Content assay',
    text: 'Quantitative assay for net peptide in the vial. If the label says 10mg, the assay should read close to that — separate from how pure the sample is.',
  },
] as const;

const VERIFY_STEPS = [
  {
    step: '01',
    title: 'HPLC run',
    text: 'Sample tested by RP-HPLC. Batches below our ≥99% cut-off are rejected. The percentage on your COA is the lab result — we do not adjust it.',
  },
  {
    step: '02',
    title: 'LC-MS check',
    text: 'Molecular weight verified against the expected sequence. Any mismatch stops the batch before it is listed or shipped.',
  },
  {
    step: '03',
    title: 'Content assay',
    text: 'Net peptide quantity measured against the stated fill. A 10mg vial should assay near 10mg — not 7mg of a 99% pure compound.',
  },
  {
    step: '04',
    title: 'COA issued',
    text: 'All three results compiled under one batch ID and posted to the archive. Same ID prints on your dispatch paperwork.',
  },
] as const;

const COMPARE_ROWS: { id: string; label: ReactNode; us: boolean; them: boolean }[] = [
  { id: 'hplc', label: 'HPLC purity % on every COA', us: true, them: false },
  { id: 'lcms', label: 'LC-MS identity verification', us: true, them: false },
  { id: 'assay', label: 'Peptide content assay (dose check)', us: true, them: false },
  { id: 'batch', label: 'Batch-specific COA per shipment', us: true, them: false },
  {
    id: 'lab',
    label: (
      <>
        Independent third-party lab (<OzcaniumAnalyticsName />)
      </>
    ),
    us: true,
    them: false,
  },
  { id: 'public', label: 'Public COA access before you order', us: true, them: false },
];

const FAQ = [
  {
    id: 'what-are-peptides',
    q: 'What are research peptides?',
    a: 'Short amino acid chains made for lab use — binding studies, cell assays, reference standards. They are not medicines, supplements, or products for human or animal use.',
  },
  {
    id: 'storage',
    q: 'How should I store them?',
    a: 'Keep lyophilised material at −20°C or below until you reconstitute. After that, follow your lab\'s own handling and expiry rules. We ship with a batch COA for your records.',
  },
  {
    id: 'hplc',
    q: 'What does the HPLC line on the COA mean?',
    a: 'It is the area-% purity from reverse-phase HPLC — e.g. 99.20% means that fraction of the integrated peak is your target peptide. We will not release a batch below ≥99%.',
  },
  {
    id: 'verify-coa',
    q: 'How do I match my order to a COA?',
    a: 'The batch number on your dispatch note is the link. Search that ID in our COA archive — you should see HPLC, LC-MS, and assay results for that exact lot.',
  },
  {
    id: 'lcms',
    q: 'What does LC-MS add that HPLC does not?',
    a: 'HPLC tells you how clean the sample is. LC-MS tells you the molecular weight matches what you ordered — so you know the sequence is right, not just the purity.',
  },
  {
    id: 'assay',
    q: 'What is the content assay?',
    a: 'A separate measurement of how much peptide is actually in the vial versus the label claim. A 99% pure sample can still be under-filled; the assay catches that.',
  },
  {
    id: 'research-only',
    q: 'Why research-only?',
    a: 'These materials are for in-vitro laboratory work. We do not make medical or performance claims. COAs are for traceability in your lab documentation.',
  },
  {
    id: 'shipping',
    q: 'Do you ship outside Australia?',
    a: 'No — Australia only. Domestic dispatch lets us run Mon–Fri same-day cut-offs on AusPost Express and keep support response times consistent.',
  },
] as const;

function HplcChart({ pathRef }: { pathRef: RefObject<SVGPathElement | null> }) {
  return (
    <div className="rg-hplc-chart" aria-hidden>
      <svg viewBox="0 0 360 110" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="rg-hplc-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="55%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        <text x="4" y="12" fill="#6B7280" fontSize="7" fontWeight="600">
          MAU
        </text>
        <text x="320" y="108" fill="#6B7280" fontSize="7" fontWeight="600">
          RT (MIN)
        </text>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <line
            key={n}
            x1={(n - 1) * 40 + 20}
            y1="18"
            x2={(n - 1) * 40 + 20}
            y2="92"
            stroke="rgba(244,246,250,0.05)"
            strokeWidth="1"
          />
        ))}
        <line x1="0" y1="92" x2="360" y2="92" stroke="rgba(244,246,250,0.1)" strokeWidth="1" />
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <text
            key={`x-${n}`}
            x={(n - 1) * 40 + 20}
            y="104"
            textAnchor="middle"
            fill="#6B7280"
            fontSize="6"
          >
            {n}
          </text>
        ))}
        <path
          ref={pathRef}
          d="M0,92 L52,92 L68,24 L82,92 L320,92"
          fill="none"
          stroke="url(#rg-hplc-line)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <rect x="158" y="14" width="34" height="15" rx="3" fill="rgba(244,246,250,0.08)" />
        <text x="175" y="25" textAnchor="middle" fill="#F4F6FA" fontSize="7" fontWeight="700">
          MAIN
        </text>
        <rect
          x="188"
          y="32"
          width="96"
          height="18"
          rx="4"
          fill="rgba(139,92,246,0.18)"
          stroke="rgba(139,92,246,0.45)"
          strokeWidth="1"
        />
        <text x="236" y="44" textAnchor="middle" fill="#C4B5FD" fontSize="7" fontWeight="600">
          Peak 1 · RT 5.63 · 99.20%
        </text>
      </svg>
    </div>
  );
}

function CoaTestCards() {
  return (
    <div className="rg-coa-tests" aria-label="COA test results">
      {COA_TEST_CARDS.map((test) => (
        <article key={test.id} className="rg-coa-test-card">
          <div className="rg-coa-test-copy">
            <span className="rg-coa-test-title">{test.title}</span>
            <span className="rg-coa-test-note">{test.note}</span>
          </div>
          <div className="rg-coa-test-result-wrap">
            <span className="rg-coa-test-result">{test.result}</span>
            <span className="rg-coa-test-pass ">
              <Check className="w-3 h-3 text-[#36ea51]" strokeWidth={2.5} />
              Pass
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function CoaSlideDeck({ pathRef }: { pathRef: RefObject<SVGPathElement | null> }) {
  const [slide, setSlide] = useState(0);
  const [autoPaused, setAutoPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);

  const goTo = (index: number) => {
    setSlide((index + COA_SLIDE_COUNT) % COA_SLIDE_COUNT);
  };

  const step = (delta: -1 | 1) => goTo(slide + delta);

  const pauseAuto = (ms?: number) => {
    setAutoPaused(true);
    if (resumeTimerRef.current != null) {
      window.clearTimeout(resumeTimerRef.current);
    }
    if (ms != null) {
      resumeTimerRef.current = window.setTimeout(() => {
        setAutoPaused(false);
        resumeTimerRef.current = null;
      }, ms);
    }
  };

  const resumeAuto = () => {
    if (resumeTimerRef.current != null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    setAutoPaused(false);
  };

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current != null) {
        window.clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (autoPaused) return;

    let reduced = false;
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      /* ignore */
    }
    if (reduced) return;

    const id = window.setInterval(() => {
      setSlide((current) => (current + 1) % COA_SLIDE_COUNT);
    }, COA_AUTO_ADVANCE_MS);

    return () => window.clearInterval(id);
  }, [autoPaused]);

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    pauseAuto();
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) {
      pauseAuto(COA_AUTO_ADVANCE_MS);
      return;
    }
    const end = event.changedTouches[0]?.clientX ?? start;
    const delta = end - start;
    if (Math.abs(delta) < 40) {
      pauseAuto(COA_AUTO_ADVANCE_MS);
      return;
    }
    step(delta > 0 ? -1 : 1);
    pauseAuto(COA_AUTO_ADVANCE_MS);
  };

  const manualStep = (delta: -1 | 1) => {
    step(delta);
    pauseAuto(COA_AUTO_ADVANCE_MS);
  };

  const manualGoTo = (index: number) => {
    goTo(index);
    pauseAuto(COA_AUTO_ADVANCE_MS);
  };

  return (
    <div className="rg-hplc-wrap rg-hero-card">
      <div className="rg-coa-slides-head">
        <span className="rg-coa-slides-label">Sample certificate · {BATCH_NO}</span>
        <span className="rg-coa-slides-counter">
          {String(slide + 1).padStart(2, '0')} / {String(COA_SLIDE_COUNT).padStart(2, '0')}
        </span>
      </div>
      <div
        className="rg-hplc-card rg-coa-slides-card"
        onMouseEnter={() => pauseAuto()}
        onMouseLeave={resumeAuto}
      >
        <div
          className="rg-coa-slides-viewport"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          aria-live="polite"
        >
          {/* Slide 1 — Cover */}
          <div
            className={`rg-coa-slide${slide === 0 ? ' rg-coa-slide--active' : ''}`}
            role="group"
            aria-roledescription="slide"
            aria-label="Certificate cover"
            aria-hidden={slide !== 0}
          >
            <div className="rg-hplc-panel-inner">
              <div className="rg-hplc-card-head">
                <Shield className="w-4 h-4 text-[#45ff34]" strokeWidth={2} />
                <span className="rg-hplc-card-label">
                  Certificate of Analysis{' '}
                  <span className="rg-hplc-lab">
                    <span className="text-white">Tested by</span>{' '}
                    <OzcaniumAnalyticsName />
                  </span>
                </span>
                <span className="text-[#10B981] rg-hplc-badge">Independent</span>
              </div>
              <div className="rg-coa-cover-body">
                <p className="rg-coa-cover-batch">{BATCH_NO}</p>
                <p className="rg-coa-cover-title">Certificate of Analysis</p>
                <p className="rg-coa-cover-lead">
                  Each lot is tested for HPLC purity, LC-MS identity, and net peptide content before dispatch.
                  Results are issued under the batch number below.
                </p>
                <div className="rg-hplc-meta rg-coa-cover-meta">
                  <div className="rg-hplc-meta-item">
                    <span className="rg-hplc-meta-label">Batch</span>
                    <span className="rg-hplc-meta-value">{BATCH_NO}</span>
                  </div>
                  <div className="rg-hplc-meta-item">
                    <span className="rg-hplc-meta-label">Tests</span>
                    <span className="rg-hplc-meta-value">3-test COA</span>
                  </div>
                  <div className="rg-hplc-meta-item">
                    <span className="rg-hplc-meta-label">Tested</span>
                    <span className="rg-hplc-meta-value">28 May 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 2 — HPLC */}
          <div
            className={`rg-coa-slide${slide === 1 ? ' rg-coa-slide--active' : ''}`}
            role="group"
            aria-roledescription="slide"
            aria-label="HPLC purity"
            aria-hidden={slide !== 1}
          >
            <div className="rg-hplc-panel-inner">
              <div className="rg-hplc-card-head">
                <FlaskConical className="w-4 h-4 text-[#8B5CF6]" strokeWidth={2} />
                <span className="rg-hplc-card-label">
                  HPLC Purity Test <span className="rg-hplc-lab">Chromatogram excerpt</span>
                </span>
              </div>
              <HplcChart pathRef={pathRef} />
              <div className="rg-hplc-purity-row">
                <div>
                  <span className="rg-hplc-purity-label">HPLC purity</span>
                  <span className="rg-hplc-purity-value rg-hplc-purity-count">
                    <CountUp
                      end={99.2}
                      decimals={1}
                      suffix="%"
                      delay={0.2}
                      duration={1.2}
                      className="rg-hplc-purity-accent"
                    />
                  </span>
                  <span className="rg-hplc-purity-note">RP-HPLC · ≥99% release spec</span>
                </div>
                <span className="rg-hplc-verified color-green">
                  <Check className="w-3.5 h-3.5 color-green" strokeWidth={2.5} />
                  Pass
                </span>
              </div>
            </div>
          </div>

          {/* Slide 3 — LC-MS */}
          <div
            className={`rg-coa-slide${slide === 2 ? ' rg-coa-slide--active' : ''}`}
            role="group"
            aria-roledescription="slide"
            aria-label="LC-MS identity"
            aria-hidden={slide !== 2}
          >
            <div className="rg-hplc-panel-inner rg-coa-slide-centered">
              <div className="rg-coa-slide-icon-wrap">
                <Dna className="w-8 h-8 text-[#A78BFA]" strokeWidth={1.5} />
              </div>
              <p className="rg-coa-slide-eyebrow">LC-MS Identity Test</p>
              <p className="rg-coa-slide-result">Confirmed</p>
              <p className="rg-coa-slide-desc">
                Observed molecular weight matches the expected sequence. Picks up wrong-sequence or mislabelled
                material that HPLC alone would not flag.
              </p>
              <span className="rg-hplc-verified">
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                MW confirmed
              </span>
            </div>
          </div>

          {/* Slide 4 — Assay */}
          <div
            className={`rg-coa-slide${slide === 3 ? ' rg-coa-slide--active' : ''}`}
            role="group"
            aria-roledescription="slide"
            aria-label="Peptide content assay"
            aria-hidden={slide !== 3}
          >
            <div className="rg-hplc-panel-inner rg-coa-slide-centered">
              <div className="rg-coa-slide-icon-wrap">
                <Scale className="w-8 h-8 text-[#A78BFA]" strokeWidth={1.5} />
              </div>
              <p className="rg-coa-slide-eyebrow">Peptide Content Assay</p>
              <p className="rg-coa-slide-result">10.2mg</p>
              <p className="rg-coa-slide-desc">
                Net peptide measured at 10.2mg against a 10mg label claim. Confirms fill weight — not just how
                clean the sample is.
              </p>
              <span className="rg-hplc-verified">
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                Within spec
              </span>
            </div>
          </div>

          {/* Slide 5 — Verified + archive */}
          <div
            className={`rg-coa-slide${slide === 4 ? ' rg-coa-slide--active' : ''}`}
            role="group"
            aria-roledescription="slide"
            aria-label="Verified summary"
            aria-hidden={slide !== 4}
          >
            <div className="rg-hplc-panel-inner">
              <div className="rg-hplc-card-head">
                <Shield className="w-4 h-4 text-[#45ff34]" strokeWidth={2} />
                <span className="rg-hplc-card-label">
                  Verified batch <span className="rg-hplc-lab">{BATCH_NO}</span>
                </span>
                <span className="rg-hplc-badge">Complete</span>
              </div>
              <CoaTestCards />
              <div className="rg-coa-verified-stamp">
                <Check className="w-4 h-4" strokeWidth={2.5} />
                COA verified · <OzcaniumAnalyticsName /> · {BATCH_NO}
              </div>
              <a href={coaArchiveUrl()} className="rg-hplc-archive">
                <span className="rg-hplc-archive-label">COA archive</span>
                <span className="rg-hplc-archive-url">{siteHostname()}/coa</span>
                <span className="rg-hplc-archive-cta">
                  View full archive <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className="rg-coa-slides-controls">
          <button
            type="button"
            className="rg-coa-slides-nav"
            onClick={() => manualStep(-1)}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <div className="rg-coa-slides-dots" role="tablist" aria-label="COA slides">
            {Array.from({ length: COA_SLIDE_COUNT }, (_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={slide === index}
                aria-label={`Slide ${index + 1}`}
                className={`rg-coa-slides-dot${slide === index ? ' rg-coa-slides-dot--active' : ''}`}
                onClick={() => manualGoTo(index)}
              />
            ))}
          </div>
          <button
            type="button"
            className="rg-coa-slides-nav"
            onClick={() => manualStep(1)}
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

const VERIFICATION_TEST_ICONS = {
  hplc: FlaskConical,
  lcms: Dna,
  assay: Scale,
} as const;

function VerificationSection() {
  return (
    <section id="verification" className="rg-section rg-verification">
      <div className="rg-container">
        <div className="rg-verification-panel">
          <div className="rg-verification-grid">
            <div className="rg-verification-copy">
              <p className="rg-verification-eyebrow">
                <Shield className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />
                COA proof
              </p>

              <h2 className="rg-verification-heading">
                <span className="rg-verification-heading-line">Three tests.</span>
                <span className="rg-verification-heading-accent">One published COA.</span>
              </h2>

              <p className="rg-verification-lead">
                HPLC, LC-MS, and a content assay on every batch — results published under the batch ID before
                you place an order.
              </p>

              <div className="rg-verification-contrast">
                <div className="rg-verification-vs rg-verification-vs--weak">
                  <span className="rg-verification-vs-label">Typical supplier</span>
                  <p>One HPLC number on a generic sheet, or the same PDF attached to every shipment.</p>
                </div>
                <div className="rg-verification-vs rg-verification-vs--strong">
                  <span className="rg-verification-vs-label">PEPLAB</span>
                  <p>Three test lines, one batch ID, published per lot — same ID on your dispatch note.</p>
                </div>
              </div>

              <a href={coaArchiveUrl()} className="rg-verification-cta">
                Browse COA archive
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="rg-verification-visual">
              <div className="rg-verification-stack" aria-label="Three COA tests">
                {COA_TEST_CARDS.map((test, index) => {
                  const Icon = VERIFICATION_TEST_ICONS[test.id];
                  return (
                    <article key={test.id} className="rg-verification-test">
                      <span className="rg-verification-test-num">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="rg-verification-test-icon">
                        <Icon className="w-4 h-4 text-[#A78BFA]" strokeWidth={1.75} />
                      </div>
                      <div className="rg-verification-test-copy">
                        <h3 className="rg-verification-test-title">{test.title}</h3>
                        <p className="rg-verification-test-note">{test.note}</p>
                      </div>
                      <div className="rg-verification-test-result-wrap">
                        <span className="rg-verification-test-result">{test.result}</span>
                        <span className="rg-verification-test-pass">
                          <Check className="w-3 h-3 text-[#36ea51]" strokeWidth={2.5} />
                          Pass
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="rg-verification-stamp">
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                COA verified · <OzcaniumAnalyticsName /> · {BATCH_NO}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PeptideKnowledgeSection() {
  return (
    <section id="knowledge" className="rg-section rg-knowledge">
      <div className="rg-container">
        <div className="rg-knowledge-panel">
          <div className="rg-section-header">
            <p className="rg-eyebrow">Before you order</p>
            <h2 className="rg-heading">How to read what we publish</h2>
            <p className="rg-lead mx-auto">
              What the three COA lines mean, how batch numbers tie to your shipment, and what research-only
              actually implies in practice.
            </p>
          </div>
          <div className="rg-knowledge-grid">
            {PEPTIDE_KNOWLEDGE.map((item, index) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rg-knowledge-card">
                  <span className="rg-knowledge-num">{String(index + 1).padStart(2, '0')}</span>
                  <div className="rg-knowledge-icon">
                    <Icon className="w-5 h-5 text-[#8B5CF6]" strokeWidth={1.75} />
                  </div>
                  <h3 className="rg-card-title">{item.title}</h3>
                  <p className="rg-card-text">{item.text}</p>
                </article>
              );
            })}
          </div>
          <p className="rg-section-note">Research use only. Not for human or veterinary application.</p>
        </div>
      </div>
    </section>
  );
}

function FaqOrderSection({
  openFaq,
  setOpenFaq,
}: {
  openFaq: string | null;
  setOpenFaq: (id: string | null) => void;
}) {
  return (
    <section id="faq" className="rg-section rg-faq-order">
      <div className="rg-container">
        <div className="rg-faq-order-grid">
          <div className="rg-faq-order-faq">
            <p className="rg-eyebrow">FAQ</p>
            <h2 className="rg-heading">COA questions, answered.</h2>
            <p className="rg-lead rg-faq-order-lead">
              HPLC, LC-MS, content assay, and how batch IDs work.
            </p>
            <div className="rg-faq-list">
              {FAQ.map((item, index) => {
                const open = openFaq === item.id;
                return (
                  <article key={item.id} className={`rg-faq-item${open ? ' rg-faq-item--open' : ''}`}>
                    <h3 className="m-0">
                      <button
                        type="button"
                        className="rg-faq-trigger"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? null : item.id)}
                      >
                        <span className="rg-faq-qnum">Q.{String(index + 1).padStart(2, '0')}</span>
                        <span>{item.q}</span>
                        <ChevronDown className="rg-faq-chevron" strokeWidth={2} />
                      </button>
                    </h3>
                    {open && <p className="rg-faq-answer">{item.a}</p>}
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="rg-faq-order-cta">
            <div className="rg-faq-order-cta-panel">
              <p className="rg-faq-order-cta-badge">
                <span className="rg-hero-badge-dot" aria-hidden />
                Ready to order
              </p>
              <h2 className="rg-faq-order-cta-title">
                Check the COA first.
                <span className="rg-faq-order-cta-accent">Then order.</span>
              </h2>
              <p className="rg-faq-order-cta-lead">
                Batch numbers are on every dispatch note. COAs are public before you buy — no recycled
                certificates, no guessing which lot you got.
              </p>
              <div className="rg-faq-order-cta-actions">
                <a href={shopPageUrl()} className="rg-btn rg-btn--primary rg-btn--cool">
                  Shop <span className="rg-btn-accent-word">now</span>
                  <ArrowRight className="w-4 h-4 rg-btn-arrow" />
                </a>
                <a href={coaArchiveUrl()} className="rg-btn rg-btn--outline">
                  Review COAs first
                </a>
              </div>
              <p className="rg-faq-order-cta-trust">
                Secure checkout · Card · Apple Pay · Google Pay · Crypto · Dispatched from Australia
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function BatchTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="rg-ticker">
      <div className="rg-ticker-inner">
        <span className="rg-ticker-label">
          <span className="rg-ticker-live-dot" aria-hidden />
          Live batch feed
        </span>
        <div className="rg-ticker-scroll" aria-hidden>
          <div className="rg-ticker-track">
            {items.map((item, i) => (
              <span key={`${item.id}-${i}`} className="rg-ticker-item">
                <Check className="w-3 h-3" strokeWidth={2.5} />
                {item.id}
                <span className="rg-ticker-dot">·</span>
                <span className="rg-ticker-purity">
                  {item.hplc} · {item.lcms} · {item.assay}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResearchHero() {
  const heroRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [catalogCount, setCatalogCount] = useState(60);

  const metaStats = useMemo(
    () =>
      HERO_META_STATS.map((item) =>
        item.kind === 'count' && item.label === 'Batches'
          ? { ...item, end: catalogCount }
          : item,
      ),
    [catalogCount],
  );

  useEffect(() => {
    setCatalogCount(getStaticProducts().length || 60);
  }, []);

  const labelDelay = (index: number) => COUNT_BASE_DELAY + index * 0.14 + COUNT_DURATION + 0.06;

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    let reduced = false;
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      /* ignore */
    }

    const ctx = gsap.context(() => {
      const reveals = hero.querySelectorAll('.rg-hero-reveal');
      const words = hero.querySelectorAll<HTMLElement>('.rg-reveal-word');
      const card = hero.querySelector('.rg-hero-card');
      const accentLine = hero.querySelector('.rg-hero-accent-line');

      if (reduced) {
        if (words.length) gsap.set(words, { opacity: 1, yPercent: 0, clearProps: 'transform' });
        if (reveals.length) gsap.set(reveals, { opacity: 1, x: 0, y: 0, clearProps: 'all' });
        if (card) gsap.set(card, { opacity: 1, x: 0, clearProps: 'all' });
        if (accentLine) gsap.set(accentLine, { opacity: 1, scaleX: 1, clearProps: 'all' });
        return;
      }

      if (words.length) {
        gsap.set(words, { yPercent: 110, opacity: 0 });
        gsap.to(words, {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.045,
          delay: 0.12,
          ease: 'power3.out',
          clearProps: 'transform',
        });
      }

      if (reveals.length) {
        gsap.fromTo(
          reveals,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.95,
            stagger: 0.09,
            ease: 'power3.out',
            clearProps: 'transform',
          },
        );
      }

      if (card) {
        gsap.fromTo(
          card,
          { y: 36, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, delay: 0.05, ease: 'power3.out', clearProps: 'transform' },
        );
      }

      if (accentLine) {
        gsap.fromTo(
          accentLine,
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            duration: 0.85,
            delay: 0.45,
            ease: 'power2.inOut',
            transformOrigin: 'left center',
          },
        );
      }

      const path = pathRef.current;
      if (path) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 2,
          delay: 0.7,
          ease: 'power2.inOut',
        });
      }
    }, hero);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="rg-hero nl-hero relative overflow-x-hidden overflow-y-visible">
      <div className="nl-hero-vignette pointer-events-none" aria-hidden />
      <div className="nl-hero-glow rg-hero-glow pointer-events-none" aria-hidden />
      <div className="rg-hero-orb rg-hero-orb--purple pointer-events-none" aria-hidden />
      <div className="rg-hero-orb rg-hero-orb--pink pointer-events-none" aria-hidden />

      <div className="nl-container relative z-10 flex flex-col min-h-0">
        <div className="rg-hero-grid nl-hero-grid grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 flex-1">
          {/* Certificate first — top on mobile, left on desktop */}
          <div className="rg-hero-visual nl-hero-visual relative flex flex-col items-center w-full">
            <CoaSlideDeck pathRef={pathRef} />
          </div>

          <div className="rg-hero-copy lg:pl-4">
            <p className="rg-hero-eyebrow rg-hero-reveal">
              <span className="rg-hero-eyebrow-dot" aria-hidden />
              <WriteInText text="Peptides Australia" delay={0.08} charDelay={0.022} />
            </p>

            <h1 className="rg-hero-title">
              <span className="rg-hero-line">
                <span className="rg-reveal-word-wrap">
                  <span className="rg-reveal-word">PEPLAB PEPTIDES</span>
                </span>
              </span>
              <span className="rg-hero-accent-row">
                <span className="rg-reveal-word-wrap">
                  <span className="rg-reveal-word rg-hero-accent">WHERE PURITY MEETS POWER</span>
                </span>
              </span>
            </h1>

            <p className="rg-hero-lead">
              <WriteInText
                text="Third-party tested. Result published. Same-day dispatch Mon–Fri. AusPost Express Australia-wide."
                delay={0.2}
                charDelay={0.012}
              />
            </p>

            <div className="rg-hero-accent-line rg-hero-reveal" aria-hidden />

            <div className="rg-hero-actions rg-hero-reveal">
              <a href={shopPageUrl()} className="rg-btn rg-btn--primary rg-btn--cool">
                Shop <span className="rg-btn-accent-word">now</span>
                <ArrowRight className="w-4 h-4 rg-btn-arrow" />
              </a>
            </div>
          </div>
        </div>

        <div className="nl-hero-meta-block rg-hero-meta-block mt-6 lg:mt-8 shrink-0">
          <div className="nl-hero-meta-row">
            <div className="nl-hero-meta-left">
              {metaStats.map((item, i) => (
                <div key={item.label} className="nl-hero-meta-stat-wrap">
                  {i > 0 && <span className="nl-hero-meta-divider" aria-hidden />}
                  <div className="nl-hero-meta-stat rg-hero-meta-stat">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--nl-accent)] mb-1.5" strokeWidth={1.75} />
                    <p className="text-sm sm:text-base font-bold text-[var(--nl-text)] leading-none tabular-nums">
                      {item.kind === 'count' ? (
                        <CountUp
                          end={item.end}
                          prefix={'prefix' in item ? item.prefix : ''}
                          suffix={item.suffix}
                          delay={COUNT_BASE_DELAY + i * 0.14}
                          duration={COUNT_DURATION}
                        />
                      ) : (
                        <WriteInText
                          text={item.value}
                          delay={COUNT_BASE_DELAY + i * 0.14}
                          charDelay={0.055}
                        />
                      )}
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--nl-text-muted)] mt-1 font-semibold">
                      <WriteInText text={item.label} delay={labelDelay(i)} charDelay={0.03} />
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="nl-spec-bar nl-hero-meta-spec rg-hero-spec-bar rounded-xl border border-[var(--nl-border)] bg-[var(--nl-bg-elevated)] px-4 py-3 flex flex-wrap items-center justify-center lg:justify-end gap-x-3 sm:gap-x-4 gap-y-2 text-[10px] sm:text-xs font-mono">
              <span className="text-[#36ea51] font-bold uppercase tracking-wider">{BATCH_NO}</span>
              <span className="text-[var(--nl-border-strong)] hidden sm:inline">|</span>
              <span className="text-[#FFFFFF]">
                HPLC{' '}
                <span className="text-[#36ea51] font-semibold tabular-nums">99.2%</span>
              </span>
              <span className="text-[var(--nl-border-strong)] hidden sm:inline">|</span>
              <span className="text-[#FFFFFF]">
                LC-MS <span className="text-[#36ea51] font-semibold">Pass</span>
              </span>
              <span className="text-[var(--nl-border-strong)] hidden sm:inline">|</span>
              <span className="text-[#FFFFFF]">
                Assay <span className="text-[#36ea51] font-semibold">10.2mg</span>
              </span>
              <span className="text-[var(--nl-border-strong)] hidden sm:inline">|</span>
              <span className="text-[#FFFFFF  ]">
                Lab <OzcaniumAnalyticsName className="font-semibold" />
              </span>
              <span className="text-[var(--nl-border-strong)] hidden sm:inline">|</span>
              <span className="text-[#36ea51] font-bold">COA Verified</span>
            </div>
          </div>
        </div>
      </div>

      <BatchTicker />
    </section>
  );
}

export default function ResearchGateway() {
  const [openFaq, setOpenFaq] = useState<string | null>('hplc');

  return (
    <div className="nl-new-landing rg-page">
      <SEO
        title={RESEARCH_GATEWAY_SEO.title}
        description={RESEARCH_GATEWAY_SEO.description}
        keywords={RESEARCH_GATEWAY_SEO.keywords}
      />

      <main id="main-content" className="relative pt-16 sm:pt-20 lg:pt-24">
        <ResearchHero />

        <VerificationSection />

        <div className="rg-trustpilot-wrap">
          <TrustpilotReviews variant="landing" />
        </div>

        <PeptideKnowledgeSection />

        <section id="approach" className="rg-section rg-section--alt">
          <div className="rg-container">
            <div className="rg-section-header">
              <p className="rg-eyebrow">What&apos;s on your COA</p>
              <h2 className="rg-heading">Three lines on every certificate.</h2>
              <p className="rg-lead mx-auto">
                Tested independently by <OzcaniumAnalyticsName /> — HPLC purity, LC-MS identity, and net peptide
                content on each batch COA.
              </p>
            </div>
            <div className="rg-approach-grid rg-approach-grid--coa">
              {APPROACH.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="rg-approach-card">
                    <div className="rg-approach-icon">
                      <Icon className="w-5 h-5 text-[#8B5CF6]" strokeWidth={1.75} />
                    </div>
                    <h3 className="rg-card-title">{item.title}</h3>
                    <p className="rg-card-text">{item.text}</p>
                  </article>
                );
              })}
            </div>
            <p className="rg-section-note">Lab results as published — we do not round or rewrite them.</p>
          </div>
        </section>

        <section id="process" className="rg-section">
          <div className="rg-container">
            <div className="rg-section-header">
              <p className="rg-eyebrow">Testing protocol</p>
              <h2 className="rg-heading">From sample to published COA.</h2>
              <p className="rg-lead mx-auto">
                Nothing lists until HPLC, LC-MS, and the content assay all pass. Four steps, one batch ID.
              </p>
            </div>
            <div className="rg-steps">
              {VERIFY_STEPS.map((step) => (
                <article key={step.step} className="rg-step">
                  <span className="rg-step-num">{step.step}</span>
                  <h3 className="rg-card-title">{step.title}</h3>
                  <p className="rg-card-text">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rg-section rg-section--alt">
          <div className="rg-container">
            <div className="rg-section-header">
              <p className="rg-eyebrow">Compare</p>
              <h2 className="rg-heading">What most COAs leave out.</h2>
              <p className="rg-lead mx-auto">
                A single HPLC line is common. Identity confirmation, fill-weight assay, and per-batch publishing
                are not.
              </p>
            </div>
            <div className="rg-compare-wrap">
              <table className="rg-compare">
                <thead>
                  <tr>
                    <th scope="col">Criteria</th>
                    <th scope="col" className="rg-compare-us">
                      PEPLAB
                    </th>
                    <th scope="col">Typical suppliers</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row) => (
                    <tr key={row.id}>
                      <td>{row.label}</td>
                      <td>{row.us ? <Check className="rg-check yes" /> : '—'}</td>
                      <td>{row.them ? <Check className="rg-check yes" /> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="rg-section rg-section--alt">
          <div className="rg-container">
            <div className="rg-section-header">
              <p className="rg-eyebrow">Resources</p>
              <h2 className="rg-heading">Where to go next.</h2>
            </div>
            <div className="rg-resource-grid">
              <a href={coaArchiveUrl()} className="rg-resource-card">
                <span className="rg-resource-num">01</span>
                <h3 className="rg-card-title">COA archive</h3>
                <p className="rg-card-text">
                  Look up any batch by ID — HPLC, LC-MS, and assay results are all there before you order.
                </p>
                <span className="rg-resource-link">
                  Open COA archive <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </a>
              <a href={shopPageUrl()} className="rg-resource-card">
                <span className="rg-resource-num">02</span>
                <h3 className="rg-card-title">Research catalogue</h3>
                <p className="rg-card-text">
                  Full listing with batch COAs linked from each product page.
                </p>
                <span className="rg-resource-link">
                  View catalogue <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </a>
              <a href={shopPageUrl()} className="rg-resource-card">
                <span className="rg-resource-num">03</span>
                <h3 className="rg-card-title">Shop &amp; dispatch</h3>
                <p className="rg-card-text">
                  Mon–Fri same-day dispatch on AusPost Express. Batch ID on your packing slip.
                </p>
                <span className="rg-resource-link">
                  Go to shop <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </a>
            </div>
          </div>
        </section>

        <FaqOrderSection openFaq={openFaq} setOpenFaq={setOpenFaq} />

        <LandingFooter hideCta />
      </main>
    </div>
  );
}
