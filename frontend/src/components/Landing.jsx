import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useScrollReveal, useStaggerReveal } from '../hooks/useScrollReveal';
import LanguageSwitcher from './LanguageSwitcher';
import { SEO } from './SEO';
import PublicHeader from './PublicHeader';
import { useSound } from '../hooks/useSound';
import {
  CardGiftcard,
  Search,
  MenuBook,
  CloudUpload,
  AutoAwesome,
  EmojiEvents,
  CheckCircle,
  Star,
  TrendingUp,
} from '@mui/icons-material';

function AnimatedCounter({ end, duration = 2000, suffix = '', isVisible }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

function Landing() {
  const { t } = useTranslation();
  const { playClickSound } = useSound();
  const [heroRef, heroVisible] = useScrollReveal({ threshold: 0.05 });
  const [featuresHeadRef, featuresHeadVisible] = useScrollReveal();
  const [setFeatureRef, visibleFeatures] = useStaggerReveal(3, { staggerDelay: 150 });
  const [howHeadRef, howHeadVisible] = useScrollReveal();
  const [setStepRef, visibleSteps] = useStaggerReveal(3, { staggerDelay: 200 });
  const [pricingHeadRef, pricingHeadVisible] = useScrollReveal();
  const [setPricingRef, visiblePricing] = useStaggerReveal(3, { staggerDelay: 150 });
  const [statsRef, statsVisible] = useScrollReveal();
  const [testimonialRef, testimonialVisible] = useScrollReveal();
  const [setTestimonialRef, visibleTestimonials] = useStaggerReveal(3, { staggerDelay: 150 });
  const [ctaRef, ctaVisible] = useScrollReveal();
  const [demoPhase, setDemoPhase] = useState(0);
  const [questionText, setQuestionText] = useState('');
  const [visibleOptions, setVisibleOptions] = useState(new Set());
  const [showBadge, setShowBadge] = useState(false);
  const [progressWidth, setProgressWidth] = useState(40);

  // Helper function for animation delays
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Premium animated demo sequence with Framer-level timing
  useEffect(() => {
    let isMounted = true;

    const runDemoSequence = async () => {
      while (isMounted) {
        // Phase 1: Type question with natural speed (0-1.8s)
        // Use translation for demo question based on current language
        const fullQuestion = t('landing.demo.question');
        for (let i = 0; i <= fullQuestion.length; i++) {
          if (!isMounted) return;
          setQuestionText(fullQuestion.slice(0, i));
          await sleep(60); // Slightly slower for better readability
        }

        // Phase 1.5: Let question settle (1.8-2.0s)
        await sleep(200);

        // Phase 2: Show options with staggered spring timing (2.0-3.2s)
        await sleep(100);
        for (let i = 0; i < 4; i++) {
          if (!isMounted) return;
          setVisibleOptions((prev) => new Set([...prev, i]));
          await sleep(250); // Faster stagger for springy feel
        }

        // Phase 2.5: Let options settle (3.2-3.5s)
        await sleep(300);

        // Phase 3: Highlight correct answer with glow (3.5-5.2s)
        if (!isMounted) return;
        setDemoPhase(3);
        await sleep(1700); // Hold longer to show the glow effect

        // Phase 4: Smooth progress bar fill (5.2-6.5s)
        if (!isMounted) return;
        setProgressWidth(60);
        await sleep(1300);

        // Phase 5: Show achievement badge (6.5-7.2s)
        if (!isMounted) return;
        setShowBadge(true);
        await sleep(700);

        // Phase 6: Hold result state (7.2-8.5s)
        await sleep(1300);

        // Reset for next loop with fade out effect (8.5-9.0s)
        if (!isMounted) return;
        setDemoPhase(0);
        setQuestionText('');
        setVisibleOptions(new Set());
        setShowBadge(false);
        setProgressWidth(40);

        // Brief pause before loop restarts (9.0-9.5s)
        await sleep(500);
      }
    };

    runDemoSequence();

    return () => {
      isMounted = false;
    };
  }, [t]);

  const features = [
    {
      icon: <CardGiftcard className="w-7 h-7" />,
      title: t('landing.features.startFree'),
      description: t('landing.features.startFreeDesc'),
      color: 'text-success',
      bg: 'bg-green-50',
    },
    {
      icon: <Search className="w-7 h-7" />,
      title: t('landing.features.findWeaknesses'),
      description: t('landing.features.findWeaknessesDesc'),
      color: 'text-brand-500',
      bg: 'bg-blue-50',
    },
    {
      icon: <MenuBook className="w-7 h-7" />,
      title: t('landing.features.personalized'),
      description: t('landing.features.personalizedDesc'),
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
  ];

  const steps = [
    {
      number: '1',
      title: t('landing.steps.uploadNotes'),
      description: t('landing.steps.uploadNotesDesc'),
      icon: <CloudUpload className="w-8 h-8" />,
      color: 'bg-brand-400',
    },
    {
      number: '2',
      title: t('landing.steps.generateQuiz'),
      description: t('landing.steps.generateQuizDesc'),
      icon: <AutoAwesome className="w-8 h-8" />,
      color: 'bg-warning',
    },
    {
      number: '3',
      title: t('landing.steps.learnImprove'),
      description: t('landing.steps.learnImproveDesc'),
      icon: <EmojiEvents className="w-8 h-8" />,
      color: 'bg-brand-500',
    },
  ];

  const pricingTiers = [
    {
      name: t('landing.pricing.free'),
      price: 'Free',
      description: t('landing.pricing.freeDesc'),
      icon: <CardGiftcard className="w-7 h-7" />,
      color: 'text-success',
      bg: 'bg-white',
      border: 'border-2 border-border',
      features: [
        t('landing.pricing.freeFeature1'),
        t('landing.pricing.freeFeature2'),
        t('landing.pricing.freeFeature3'),
        t('landing.pricing.freeFeature4'),
        t('landing.pricing.freeFeature5'),
      ],
      cta: t('landing.pricing.getStarted'),
      href: '/signup',
      badge: '',
    },
    {
      name: t('landing.pricing.pro'),
      price: '₦5,000',
      period: `/ ${t('pricing.mo', 'mo')} `,
      description: t('pricing.forSeriousLearners') || 'Perfect for serious learners wanting to master any topic',
      icon: <AutoAwesome className="w-7 h-7" />,
      color: 'text-brand-500',
      bg: 'bg-white',
      border: 'border-2 border-brand-500 ring-4 ring-brand-500/10',
      features: [
        t('landing.pricing.proFeature1', 'Unlimited quizzes'),
        t('landing.pricing.proFeature2', 'Unlimited notes & uploads'),
        t('landing.pricing.proFeature3', 'Upload PPTX files'),
        t('landing.pricing.proFeature4', 'AI-powered feedback on answers'),
        t('landing.pricing.proFeature5', 'Identify weak topics automatically'),
        t('landing.pricing.proFeature6', 'Focused mastery quizzes'),
        t('landing.pricing.proFeature7', 'Pre-quiz AI teaching summaries'),
        t('landing.pricing.proFeature8', 'Enhanced analytics & insights'),
      ],
      cta: t('landing.pricing.upgradePro'),
      href: '/signup',
      badge: t('landing.pricing.mostPopular'),
      highlighted: true,
    },
    {
      name: t('landing.pricing.premium'),
      price: '₦10,000',
      period: `/ ${t('pricing.mo', 'mo')} `,
      description: t('pricing.forMasterySeekers') || 'Everything in Pro, plus 1-on-1 AI tutoring',
      icon: <EmojiEvents className="w-7 h-7" />,
      color: 'text-amber-500',
      bg: 'bg-white',
      border: 'border-2 border-border',
      features: [
        t('landing.pricing.premiumFeature1', 'Everything in Pro'),
        t('landing.pricing.premiumFeature2', 'Unlimited AI Teaching sessions'),
        t('landing.pricing.premiumFeature3', '1-on-1 conversational tutoring'),
        t('landing.pricing.premiumFeature4', 'Ask AI any question you want'),
        t('landing.pricing.premiumFeature5', 'Custom quiz settings'),
        t('landing.pricing.premiumFeature6', 'Advanced analytics'),
        t('landing.pricing.premiumFeature7', 'Priority support'),
      ],
      cta: t('landing.pricing.goPremium'),
      href: '/signup',
      badge: '',
    },
  ];

  const testimonials = [
    {
      name: t('landing.testimonials.sarah.name'),
      role: t('landing.testimonials.sarah.role'),
      text: t('landing.testimonials.sarah.text'),
      avatar: 'S',
      color: 'bg-danger',
    },
    {
      name: t('landing.testimonials.james.name'),
      role: t('landing.testimonials.james.role'),
      text: t('landing.testimonials.james.text'),
      avatar: 'J',
      color: 'bg-brand-400',
    },
    {
      name: t('landing.testimonials.priya.name'),
      role: t('landing.testimonials.priya.role'),
      text: t('landing.testimonials.priya.text'),
      avatar: 'P',
      color: 'bg-brand-500',
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <SEO
        title="FloraQuiz | AI Study Platform & Quiz Generator"
        description="Generate quizzes from notes instantly. Improve your grades with AI-powered personalized studying."
      />

      {/* ── Navbar (Duolingo-style responsive) ── */}
      <PublicHeader />

      {/* ── Gamified Hero (Upwork-Inspired Left-Aligned) ── */}
      <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 px-4 bg-white overflow-hidden min-h-[90vh] flex flex-col justify-center border-b-2 border-slate-100">

        <div ref={heroRef} className={`reveal ${heroVisible ? 'visible' : ''} max-w-[72rem] mx-auto relative z-10 w-full`}>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">

            {/* Left Column: Typography & CTAs */}
            <div className="flex flex-col items-start text-left">
              <h1 className="text-5xl sm:text-7xl lg:text-[5rem] font-black text-ink mb-6 tracking-tight leading-[1.05]">
                {t('landing.hero.title')}
                <br />
                <span className="text-brand-500">
                  {t('landing.hero.titleSpan')}
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate font-bold max-w-xl mb-10 leading-relaxed text-left w-full">
                {t('landing.hero.subtitle')}
                <br />
                <strong className="text-ink font-extrabold">{t('landing.hero.subtitleStrong')}</strong> — {t('landing.hero.subtitleCta')}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Link to="/signup" className="w-full sm:w-auto" onClick={playClickSound}>
                  <button className="relative w-full sm:w-auto px-10 py-5 bg-brand-500 text-white font-extrabold text-lg rounded-2xl border-none hover:bg-brand-400 active:translate-y-1 transition-all flex items-center justify-center gap-3 uppercase tracking-wide">
                    {t('landing.hero.startLearning')}
                  </button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto" onClick={playClickSound}>
                  <button className="relative w-full sm:w-auto px-10 py-5 bg-white text-brand-500 font-extrabold text-lg rounded-2xl border-2 border-slate-200 hover:bg-slate-50 active:translate-y-1 transition-all flex items-center justify-center gap-3 uppercase tracking-wide">
                    {t('landing.hero.alreadyHaveAccount')}
                  </button>
                </Link>
              </div>
            </div>

            {/* Animated quiz demo with premium gamified flat UI */}
            <div className="relative w-full max-w-lg mx-auto lg:max-w-none" aria-label="Animated quiz demo">
              {/* Removed blurred glow backdrop for cleaner flat look */}

              <div className="p-6 sm:p-8 bg-white border-2 border-slate-200 border-b-4 rounded-3xl">
                {/* Browser-like header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-100">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 ml-2 uppercase tracking-wider">floraquiz.com</span>
                </div>

                {/* Question area - strict flat design */}
                <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 mb-6 border-2 border-slate-100">
                  <p className="text-base sm:text-xl font-black text-ink mb-1 min-h-8 leading-snug">
                    {questionText}
                    {questionText.length > 0 && questionText.length < 55 && (
                      <span className="animate-pulse ml-1 text-brand-500">|</span>
                    )}
                  </p>
                  <p className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-wider">{t('landing.demo.category')}</p>
                </div>

                {/* Options with tactile "chunky" flat design */}
                <div className="space-y-3 mb-6">
                  {[
                    t('landing.demo.optionA'),
                    t('landing.demo.optionB'),
                    t('landing.demo.optionC'),
                    t('landing.demo.optionD'),
                  ].map((opt, i) => (
                    <div
                      key={i}
                      className={`demo-option p-4 rounded-2xl border-2 flex items-center gap-4 font-bold text-sm cursor-pointer transition-all ${visibleOptions.has(i) ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        } ${demoPhase === 3 && i === 1
                          ? 'border-brand-500 bg-brand-50 text-brand-600 border-b-4'
                          : 'border-slate-200 border-b-4 bg-white hover:bg-slate-50 text-slate-600'
                        }`}
                      style={{
                        '--delay': `${i * 0.25}s`,
                      }}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-all flex-shrink-0 border-2 ${demoPhase === 3 && i === 1
                          ? 'bg-brand-500 text-white border-brand-500'
                          : 'bg-white text-slate-400 border-slate-200'
                          }`}
                      >
                        {['A', 'B', 'C', 'D'][i]}
                      </span>
                      <span className="flex-1 text-base">{opt}</span>
                      {demoPhase === 3 && i === 1 && (
                        <CheckCircle className="w-6 h-6 text-brand-500" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Flat, solid progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('landing.demo.questionProgress')}</p>
                    <p className="text-xs font-black text-brand-500">{Math.round((progressWidth - 40) / 0.2)}%</p>
                  </div>
                  <div className="overflow-hidden h-3 bg-slate-100 rounded-full">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>
                </div>

                {/* Score badge with stark, flat design */}
                {showBadge && (
                  <div className="flex gap-4 items-center">
                    <div className="demo-badge inline-flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-2xl text-sm font-black border-2 border-brand-600 border-b-4">
                      <CheckCircle className="w-5 h-5" />
                      <span>{t('landing.demo.correctBadge')}</span>
                    </div>
                    <div className="text-sm font-black text-brand-500 bg-brand-50 px-3 py-1.5 rounded-xl border-2 border-brand-200">
                      {t('landing.demo.xpReward')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Proof Carousel Removed due to heavy layout bugs */}

        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 sm:py-28 px-4 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div ref={featuresHeadRef} className={`reveal ${featuresHeadVisible ? 'visible' : ''} text-center flex flex-col items-center mb-16`}>
            <span className="text-sm font-black text-brand-500 uppercase tracking-widest block">{t('landing.features.why')}</span>
            <h2 className="text-3xl sm:text-4xl font-black text-ink mt-3 mb-4 text-center">
              {t('landing.features.title')}
            </h2>
            <p className="text-slate font-semibold max-w-xl text-center">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto">
            {/* Flat Tactile Card 1: AI Study Tools */}
            <div
              ref={setFeatureRef(0)}
              className={`reveal-scale ${visibleFeatures.has(0) ? 'visible' : ''} bg-white border-2 border-slate-200 border-b-[6px] hover:border-b-2 hover:translate-y-1 transition-all rounded-3xl p-8 flex flex-col justify-between cursor-default`}
            >
              <div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border-2 border-b-4 bg-green-50 border-green-200 text-green-600">
                  {features[0].icon}
                </div>
                <h3 className="text-2xl font-black text-ink mb-3">{features[0].title}</h3>
                <p className="text-slate font-medium leading-relaxed mb-8">{features[0].description}</p>
              </div>

              {/* Flat Graphic - Notes to Flashcards */}
              <div className="h-40 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center overflow-hidden relative">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-white border-2 border-slate-200 border-b-4 rounded-xl flex flex-col p-3 gap-2">
                    <div className="w-full h-1 bg-slate-200 rounded-full"></div>
                    <div className="w-3/4 h-1 bg-slate-200 rounded-full"></div>
                    <div className="w-full h-1 bg-slate-200 rounded-full"></div>
                  </div>
                  <span className="text-2xl font-black text-brand-500">→</span>
                  <div className="w-20 h-16 bg-brand-50 border-2 border-brand-200 border-b-4 rounded-xl flex items-center justify-center">
                    <span className="font-black text-brand-500 text-xs">A / B</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Flat Tactile Card 2: Personalization */}
            <div
              ref={setFeatureRef(1)}
              className={`reveal-scale ${visibleFeatures.has(1) ? 'visible' : ''} bg-white border-2 border-slate-200 border-b-[6px] hover:border-b-2 hover:translate-y-1 transition-all rounded-3xl p-8 flex flex-col justify-between cursor-default`}
              style={{ transitionDelay: '100ms' }}
            >
              <div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border-2 border-b-4 bg-blue-50 border-blue-200 text-blue-600">
                  {features[1].icon}
                </div>
                <h3 className="text-2xl font-black text-ink mb-2">{features[1].title}</h3>
                <p className="text-slate font-medium leading-relaxed mb-8">{features[1].description}</p>
              </div>

              {/* Flat Graphic - Progression */}
              <div className="h-40 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-end justify-center overflow-hidden p-6 gap-3">
                <div className="w-8 bg-blue-100 border-2 border-blue-200 border-b-0 rounded-t-lg h-1/3"></div>
                <div className="w-8 bg-blue-200 border-2 border-blue-300 border-b-0 rounded-t-lg h-2/3"></div>
                <div className="w-8 bg-blue-500 border-2 border-blue-600 border-b-0 rounded-t-lg h-full"></div>
              </div>
            </div>

            {/* Flat Tactile Card 3: Gamification */}
            <div
              ref={setFeatureRef(2)}
              className={`reveal-scale ${visibleFeatures.has(2) ? 'visible' : ''} bg-white border-2 border-slate-200 border-b-[6px] hover:border-b-2 hover:translate-y-1 transition-all rounded-3xl p-8 flex flex-col justify-between cursor-default`}
              style={{ transitionDelay: '200ms' }}
            >
              <div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border-2 border-b-4 bg-amber-50 border-amber-200 text-amber-600">
                  {features[2].icon}
                </div>
                <h3 className="text-2xl font-black text-ink mb-2">{features[2].title}</h3>
                <p className="text-slate font-medium leading-relaxed mb-8">{features[2].description}</p>
              </div>

              {/* Flat Graphic - Mastery Bar */}
              <div className="h-40 rounded-2xl bg-slate-50 border-2 border-slate-100 flex flex-col items-center justify-center p-6 gap-4">
                <div className="w-full bg-white border-2 border-slate-200 border-b-4 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Mastery</span>
                    <span className="text-xs font-black text-amber-500">98%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full w-[98%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-20 sm:py-28 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div ref={howHeadRef} className={`reveal ${howHeadVisible ? 'visible' : ''} text-center flex flex-col items-center mb-16`}>
            <span className="text-sm font-black text-brand-500 uppercase tracking-widest block">{t('landing.steps.how')}</span>
            <h2 className="text-3xl sm:text-4xl font-black text-ink mt-3 mb-4 text-center">
              {t('landing.steps.title')}
            </h2>
            <p className="text-slate font-semibold max-w-xl text-center">
              {t('landing.steps.subtitle')}
            </p>
          </div>

          <div className="flex flex-col gap-24 py-10 w-full max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <div
                key={i}
                ref={setStepRef(i)}
                className={`reveal-scale ${visibleSteps.has(i) ? 'visible' : ''} flex flex-col ${i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 sm:gap-20`}
              >
                {/* Text Content */}
                <div className="w-full md:w-1/2">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <span className="text-brand-600">{step.icon}</span>
                    <span className="text-sm font-black text-brand-500 bg-brand-50 px-4 py-1.5 rounded-full uppercase tracking-widest border-2 border-brand-200 border-b-4">
                      {t('landing.steps.how')} {step.number}
                    </span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black text-ink mb-4 leading-tight">{step.title}</h3>
                  <p className="text-slate text-lg font-medium leading-relaxed">{step.description}</p>
                </div>

                {/* Flat Tactile Illustration */}
                <div className="w-full md:w-1/2 flex justify-center">
                  <div className={`relative w-full max-w-sm aspect-square rounded-[3rem] ${step.bg || 'bg-slate-50'} border-4 ${step.border || 'border-slate-200'} border-b-[8px] flex items-center justify-center p-8 overflow-hidden`}>

                    {/* Different flat graphic based on step step */}
                    {i === 0 && (
                      <img src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&h=400&fit=crop" alt="Upload notes" className="w-full h-full object-cover rounded-[3rem]" />
                    )}

                    {i === 1 && (
                      <img src="https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=400&h=400&fit=crop" alt="Generate quiz" className="w-full h-full object-cover rounded-[3rem]" />
                    )}

                    {i === 2 && (
                      <img src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=400&fit=crop" alt="Master topics" className="w-full h-full object-cover rounded-[3rem]" />
                    )}

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 sm:py-28 px-4 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div ref={pricingHeadRef} className={`reveal ${pricingHeadVisible ? 'visible' : ''} text-center flex flex-col items-center mb-16`}>
            <span className="text-sm font-black text-brand-500 uppercase tracking-widest block">{t('landing.pricing.label')}</span>
            <h2 className="text-3xl sm:text-4xl font-black text-ink mt-3 mb-4 text-center">
              {t('landing.pricing.title')}
            </h2>
            <p className="text-slate font-semibold max-w-xl text-center">
              {t('landing.pricing.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-end">
            {pricingTiers.map((tier, i) => (
              <div
                key={i}
                ref={setPricingRef(i)}
                className={`reveal-scale ${visiblePricing.has(i) ? 'visible' : ''} ${tier.highlighted ? 'z-10 bg-brand-900 rounded-[2rem] border-4 border-brand-800 border-b-[8px] transform md:-translate-y-4' : 'z-0 bg-white rounded-[2rem] border-2 border-slate-200 border-b-[6px]'} transition-transform duration-300 hover:-translate-y-2`}
              >
                <div className={`relative p-8 h-full rounded-[2rem] ${tier.highlighted ? 'text-white' : ''}`}>
                  {/* Badge */}
                  {tier.badge && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black border-2 border-b-4 ${tier.highlighted ? 'bg-amber-400 text-amber-900 border-amber-500' : 'bg-brand-500 text-white border-brand-600'}`}>
                        <AutoAwesome className="w-3.5 h-3.5" />
                        {tier.badge}
                      </div>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border-2 border-b-4 ${tier.highlighted ? 'bg-brand-800 border-brand-700 text-amber-400' : `${tier.bg} border-slate-200 text-brand-600`}`}>
                    {tier.icon}
                  </div>

                  {/* Tier name */}
                  <h3 className={`text-2xl font-black mb-2 ${tier.highlighted ? 'text-white' : 'text-ink'}`}>{tier.name}</h3>
                  <p className={`font-medium text-sm mb-6 h-10 ${tier.highlighted ? 'text-white/90' : 'text-slate'}`}>{tier.description}</p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className={`text-5xl font-black tracking-tight flex items-baseline ${tier.highlighted ? 'text-white' : 'text-ink'}`}>
                      {tier.price}
                      {tier.period && <span className={`text-lg font-bold ml-1 tracking-normal ${tier.highlighted ? 'text-white/80' : 'text-slate'}`}>{tier.period}</span>}
                    </div>
                    {tier.nairaPrice && (
                      <div className="mt-3">
                        <span className={`inline-flex items-center gap-1.5 border px-4 py-1.5 rounded-full text-sm font-black border-b-[3px] ${tier.highlighted ? 'bg-white/20 border-white/30 text-white' : 'bg-green-50 border-green-200 text-green-700'}`}>
                          🇳🇬 {tier.nairaPrice}/mo
                        </span>
                        <p className={`text-xs mt-2 font-medium ${tier.highlighted ? 'text-white/80' : 'text-slate'}`}>{t('pricing.payInNairaInfo') || 'Pay in Naira · Billed monthly'}</p>
                      </div>
                    )}
                  </div>

                  <div className={`w-full h-px mb-8 ${tier.highlighted ? 'bg-white/20' : 'bg-slate-100'}`} />

                  {/* Features */}
                  <ul className="space-y-4 mb-10">
                    {tier.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tier.highlighted ? 'text-white' : 'text-brand-500'}`} />
                        <span className={`font-medium text-sm ${tier.highlighted ? 'text-white' : 'text-ink'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    to={tier.href}
                    onClick={playClickSound}
                    className={`mt-4 block w-full text-center py-4 rounded-2xl font-black transition-all border-none ${tier.highlighted ? 'bg-brand-500 text-white border-b-4 border-brand-600 hover:bg-brand-400 active:border-b-0 active:translate-y-1' : 'bg-brand-500 text-white border-b-4 border-brand-600 hover:bg-brand-400 active:border-b-0 active:translate-y-1'}`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-20 sm:py-24 px-4 bg-slate-50 border-t-2 border-slate-200">
        <div
          ref={statsRef}
          className={`reveal-scale ${statsVisible ? 'visible' : ''} max-w-6xl mx-auto`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            {[
              { value: 1000, suffix: '+', label: t('landing.stats.quizzesGenerated'), icon: '🚀', color: 'text-blue-500' },
              { value: 500, suffix: '+', label: t('landing.stats.activeStudents'), icon: '🔥', color: 'text-brand-500' },
              { value: 95, suffix: '%', label: t('landing.stats.passRate'), icon: '🌟', color: 'text-amber-500' },
              { value: 10, suffix: 'K+', label: t('landing.stats.questionsCreated'), icon: '🧩', color: 'text-purple-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-white border-2 border-slate-200 border-b-4 rounded-[2rem] p-6 hover:-translate-y-1 transition-transform cursor-default">
                <div className="text-3xl mb-3">{stat.icon}</div>
                <div className={`text-3xl sm:text-5xl font-black mb-2 ${stat.color}`}>
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} isVisible={statsVisible} />
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-20 sm:py-28 px-4 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div ref={testimonialRef} className={`reveal ${testimonialVisible ? 'visible' : ''} text-center flex flex-col items-center mb-16`}>
            <span className="text-sm font-black text-amber-500 uppercase tracking-widest block">{t('landing.testimonials.label')}</span>
            <h2 className="text-3xl sm:text-4xl font-black text-ink mt-3 mb-4 text-center">
              {t('landing.testimonials.title')}
            </h2>
          </div>

          {/* Premium Grid Wall of Love */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                ref={setTestimonialRef(i)}
                className={`reveal-scale ${visibleTestimonials.has(i) ? 'visible' : ''} bg-white rounded-3xl p-8 border border-slate-100 transition-shadow duration-300 h-full flex flex-col`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-full ${t.color} flex items-center justify-center shrink-0`}>
                    <span className="text-lg font-black text-white">{t.avatar}</span>
                  </div>
                  <div>
                    <div className="font-black text-ink">{t.name}</div>
                    <div className="text-sm font-semibold text-slate/70">{t.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-ink font-medium leading-relaxed flex-grow">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Minimal Footer ── */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <span className="text-3xl font-black text-white tracking-tight">floraquiz<span className="text-brand-500">.</span></span>
          </Link>

          <p className="max-w-md mx-auto mb-8 font-medium">
            Learn anything instantly. Just upload your notes, and we'll generate the perfect practice quizzes.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-12 font-bold text-sm">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>

          <div className="w-full h-px bg-slate-800 mb-8" />

          <p className="text-xs font-semibold text-slate-500">
            © {new Date().getFullYear()} FloraQuiz. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
