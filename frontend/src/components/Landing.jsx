import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useScrollReveal, useStaggerReveal } from '../hooks/useScrollReveal';
import LanguageSwitcher from './LanguageSwitcher';
import { SEO } from './SEO';
import {
  Upload, Sparkles, Trophy, Brain, Zap, Target,
  BookOpen, BarChart3, ArrowRight, CheckCircle, Star,
  Users, FileText, Shield, Crown, Gift, Wand2
} from 'lucide-react';
import LiquidGlassCarousel from './LiquidGlassCarousel';

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
  const [scrolled, setScrolled] = useState(false);
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

  // Scroll listener for header behavior (Duolingo-style)
  // Show header CTA after user scrolls past hero section
  useEffect(() => {
    const handleScroll = () => {
      // Trigger header when scrolled more than 400px (past hero CTAs)
      setScrolled(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Gift className="w-7 h-7" />,
      title: t('landing.features.startFree'),
      description: t('landing.features.startFreeDesc'),
      color: 'text-success',
      bg: 'bg-green-50',
    },
    {
      icon: <Target className="w-7 h-7" />,
      title: t('landing.features.findWeaknesses'),
      description: t('landing.features.findWeaknessesDesc'),
      color: 'text-brand-500',
      bg: 'bg-blue-50',
    },
    {
      icon: <BookOpen className="w-7 h-7" />,
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
      icon: <Upload className="w-8 h-8" />,
      color: 'bg-brand-400',
    },
    {
      number: '2',
      title: t('landing.steps.generateQuiz'),
      description: t('landing.steps.generateQuizDesc'),
      icon: <Wand2 className="w-8 h-8" />,
      color: 'bg-warning',
    },
    {
      number: '3',
      title: t('landing.steps.learnImprove'),
      description: t('landing.steps.learnImproveDesc'),
      icon: <Trophy className="w-8 h-8" />,
      color: 'bg-brand-500',
    },
  ];

  const pricingTiers = [
    {
      name: t('landing.pricing.free'),
      price: 'Free',
      description: t('landing.pricing.freeDesc'),
      icon: <Gift className="w-7 h-7" />,
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
      icon: <Sparkles className="w-7 h-7" />,
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
      icon: <Crown className="w-7 h-7" />,
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
      <nav className={`fixed top - 0 left - 0 right - 0 z - 50 transition - all duration - 300 ${scrolled ? 'bg-white/95 backdrop-blur-md border-b-2 border-border shadow-sm' : 'bg-transparent'
        } `}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-brand-500 tracking-tight">floraquiz</span>
            </Link>

            {/* Desktop: Always show both buttons */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher />
              <Link
                to="/login"
                className="px-5 py-2 font-bold text-ink hover:text-brand-500 transition-colors text-sm"
              >
                {t('auth.login').toUpperCase()}
              </Link>
              <Link to="/signup" className="btn-primary text-sm py-2 px-5">
                {t('landing.nav.getStarted').toUpperCase()}
              </Link>
            </div>

            {/* Mobile: Show language switcher and GET STARTED after scroll (Duolingo pattern) */}
            {scrolled && (
              <div className="md:hidden flex items-center gap-2">
                <LanguageSwitcher />
                <Link to="/signup" className="btn-primary text-sm py-2 px-5">
                  {t('landing.nav.getStarted').toUpperCase()}
                </Link>
              </div>
            )}

            {/* Mobile: Always show language switcher (not scrolled) */}
            {!scrolled && (
              <div className="md:hidden">
                <LanguageSwitcher />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Playful Gamified Hero ── */}
      <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 px-4 bg-white overflow-hidden min-h-[90vh] flex flex-col justify-center border-b-2 border-slate-100">

        <div ref={heroRef} className={`reveal ${heroVisible ? 'visible' : ''} `}>
          <div className="max-w-6xl mx-auto text-center relative z-10 flex flex-col items-center">

            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-50 border-2 border-brand-200 mb-8 font-bold text-brand-600 uppercase tracking-widest text-xs">
              <span className="flex h-2.5 w-2.5 rounded-full bg-brand-500"></span>
              FloraQuiz 2.0 is Here
            </div>

            <h1 className="text-5xl sm:text-7xl font-black text-ink mb-6 tracking-tight leading-[1.1]">
              {t('landing.hero.title')}
              <br />
              <span className="text-brand-500">
                {t('landing.hero.titleSpan')}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate font-bold max-w-2xl mx-auto mb-12 leading-relaxed">
              {t('landing.hero.subtitle')}
              <br />
              <strong className="text-ink font-extrabold">{t('landing.hero.subtitleStrong')}</strong> — {t('landing.hero.subtitleCta')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 w-full max-w-md mx-auto sm:max-w-none">
              <Link to="/signup" className="w-full sm:w-auto">
                <button className="relative w-full sm:w-auto px-10 py-5 bg-brand-500 text-white font-extrabold text-lg rounded-2xl shadow-btn-brand border-none hover:bg-brand-400 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 uppercase tracking-wide">
                  {t('landing.hero.startLearning')}
                </button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <button className="relative w-full sm:w-auto px-10 py-5 bg-white text-brand-500 font-extrabold text-lg rounded-2xl shadow-card border-2 border-slate-200 hover:bg-slate-50 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 uppercase tracking-wide">
                  {t('landing.hero.alreadyHaveAccount')}
                </button>
              </Link>
            </div>

            {/* Social Proof & Liquid Glass Carousel */}
            <div className="w-full flex flex-col items-center justify-center mb-24">
              <p className="text-sm sm:text-base font-bold text-slate/80 tracking-wide uppercase mb-2">
                Join over 500+ people who are learning with FloraQuiz
              </p>
              <LiquidGlassCarousel />
            </div>

            {/* Animated quiz demo with premium motion graphics */}
            <div className="relative max-w-3xl mx-auto" aria-label="Animated quiz demo">
              {/* Glow backdrop */}
              <div className="absolute -inset-4 bg-brand-400/5 rounded-3xl blur-2xl -z-10" />

              <div className="card p-6 sm:p-8 shadow-sm border border-border/50 bg-white">
                {/* Browser-like header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/40">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs font-bold text-slate ml-2">floraquiz.com — quiz in progress</span>
                </div>

                {/* Question area */}
                <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 mb-6 border border-border/40">
                  <p className="text-base sm:text-lg font-extrabold text-ink mb-1 min-h-8 leading-relaxed">
                    {questionText}
                    {questionText.length > 0 && questionText.length < 55 && (
                      <span className="animate-pulse ml-1 text-brand-500">|</span>
                    )}
                  </p>
                  <p className="text-xs font-semibold text-slate/60 mt-2">{t('landing.demo.category')}</p>
                </div>

                {/* Options with premium animations */}
                <div className="space-y-3 mb-6">
                  {[
                    t('landing.demo.optionA'),
                    t('landing.demo.optionB'),
                    t('landing.demo.optionC'),
                    t('landing.demo.optionD'),
                  ].map((opt, i) => (
                    <div
                      key={i}
                      className={`demo - option p - 4 rounded - 2xl border - 2 flex items - center gap - 4 font - bold text - sm cursor - pointer transition - all ${visibleOptions.has(i)
                          ? 'opacity-100'
                          : 'opacity-0 pointer-events-none'
                        } ${demoPhase === 3 && i === 1
                          ? 'border-brand-500 bg-blue-50 text-brand-600 demo-correct shadow-sm'
                          : 'border-border/60 bg-white hover:bg-surface text-slate'
                        } `}
                      style={{
                        '--delay': `${i * 0.25} s`,
                      }}
                    >
                      <span
                        className={`w - 8 h - 8 rounded - lg flex items - center justify - center font - black text - xs transition - all flex - shrink - 0 ${demoPhase === 3 && i === 1
                            ? 'bg-brand-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600'
                          } `}
                      >
                        {['A', 'B', 'C', 'D'][i]}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {demoPhase === 3 && i === 1 && (
                        <CheckCircle className="checkmark-icon w-5 h-5 text-brand-500 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Enhanced progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-semibold text-slate/70">{t('landing.demo.questionProgress')}</p>
                    <p className="text-xs font-bold text-brand-500">{Math.round((progressWidth - 40) / 0.2)}%</p>
                  </div>
                  <div className="progress-bar overflow-hidden h-2 bg-slate-200/50 rounded-full border border-border/30">
                    <div
                      className={`progress - bar - fill h - full transition - all ${demoPhase >= 4 ? 'demo-progress' : ''} `}
                      style={{
                        width: `${progressWidth}% `,
                      }}
                    />
                  </div>
                </div>

                {/* Score badge with premium animation */}
                {showBadge && (
                  <div className="flex gap-3 items-center">
                    <div
                      className="demo-badge inline-flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{t('landing.demo.correctBadge')}</span>
                    </div>
                    <div className="text-sm font-bold text-brand-500">{t('landing.demo.xpReward')}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 sm:py-28 px-4 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div ref={featuresHeadRef} className={`reveal ${featuresHeadVisible ? 'visible' : ''} text - center mb - 16`}>
            <span className="text-sm font-black text-brand-500 uppercase tracking-widest">{t('landing.features.why')}</span>
            <h2 className="text-3xl sm:text-4xl font-black text-ink mt-3 mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-slate font-semibold max-w-xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="bento-grid w-full">
            {/* Bento Card 1 - Large Span */}
            <div
              ref={setFeatureRef(0)}
              className={`reveal - scale ${visibleFeatures.has(0) ? 'visible' : ''} bento - card bento - col - span - 2 sm: bento - row - span - 2 p - 10 flex flex - col justify - between`}
            >
              <div>
                <div className={`w - 16 h - 16 rounded - 2xl ${features[0].bg} flex items - center justify - center mb - 6 ${features[0].color} shadow - sm border border - white / 50`}>
                  {features[0].icon}
                </div>
                <h3 className="text-3xl font-black text-ink mb-3">{features[0].title}</h3>
                <p className="text-slate text-lg font-medium leading-relaxed max-w-md">{features[0].description}</p>
              </div>

              {/* Abstract Graphic Element for Premium Feel */}
              <div className="mt-10 h-48 rounded-2xl bg-gradient-to-tr from-green-50 to-emerald-100/50 border border-green-200/50 flex items-center justify-center overflow-hidden relative">
                <div className="absolute w-64 h-64 bg-green-400/20 blur-3xl rounded-full" />
                <div className="glass-panel px-6 py-4 rounded-xl flex items-center gap-4 animate-float">
                  <span className="text-2xl">🌱</span>
                  <div>
                    <div className="h-2 w-24 bg-slate-200 rounded-full mb-2"></div>
                    <div className="h-2 w-16 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div
              ref={setFeatureRef(1)}
              className={`reveal - scale ${visibleFeatures.has(1) ? 'visible' : ''} bento - card p - 8 flex flex - col justify - between`}
            >
              <div>
                <div className={`w - 14 h - 14 rounded - 2xl ${features[1].bg} flex items - center justify - center mb - 6 ${features[1].color} shadow - sm border border - white / 50`}>
                  {features[1].icon}
                </div>
                <h3 className="text-2xl font-black text-ink mb-2">{features[1].title}</h3>
                <p className="text-slate font-medium leading-relaxed">{features[1].description}</p>
              </div>
              <div className="mt-8 h-32 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 relative overflow-hidden flex items-end">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNFMEU3RkYiLz48L3N2Zz4=')] opacity-50" />
                <div className="w-full h-1/2 bg-gradient-to-t from-blue-500/10 to-transparent" />
              </div>
            </div>

            {/* Bento Card 3 */}
            <div
              ref={setFeatureRef(2)}
              className={`reveal - scale ${visibleFeatures.has(2) ? 'visible' : ''} bento - card p - 8 bg - gradient - to - br from - amber - 500 to - orange - 400 text - white`}
            >
              <div className={`w - 14 h - 14 rounded - full bg - white / 20 backdrop - blur - md flex items - center justify - center mb - 6 text - white border border - white / 30`}>
                {features[2].icon}
              </div>
              <h3 className="text-2xl font-black mb-2 drop-shadow-sm">{features[2].title}</h3>
              <p className="text-white/90 font-medium leading-relaxed">{features[2].description}</p>

              <div className="mt-8 relative">
                <div className="glass-panel border-white/20 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate/80">Mastery</span>
                    <span className="text-xs font-black text-brand-500">98%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-brand-500 h-1.5 rounded-full w-[98%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 sm:py-28 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div ref={howHeadRef} className={`reveal ${howHeadVisible ? 'visible' : ''} text - center mb - 16`}>
            <span className="text-sm font-black text-brand-500 uppercase tracking-widest">{t('landing.steps.how')}</span>
            <h2 className="text-3xl sm:text-4xl font-black text-ink mt-3 mb-4">
              {t('landing.steps.title')}
            </h2>
            <p className="text-slate font-semibold max-w-xl mx-auto">
              {t('landing.steps.subtitle')}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-16 relative items-start">
            {/* Left Column: Scrolling Steps */}
            <div className="w-full lg:w-1/2 space-y-12 sm:space-y-24 py-10 lg:py-20">
              {steps.map((step, i) => (
                <div
                  key={i}
                  ref={setStepRef(i)}
                  className={`reveal ${visibleSteps.has(i) ? 'visible' : ''} flex gap - 6 sm: gap - 8 group`}
                >
                  {/* Vertical Progress Line Logic Container */}
                  <div className="relative flex flex-col items-center">
                    <div className={`w - 14 h - 14 sm: w - 16 sm: h - 16 rounded - 2xl ${step.color} flex items - center justify - center text - white relative z - 10 shadow - lg group - hover: scale - 110 transition - transform duration - 500`}>
                      {step.icon}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-200 mt-4 absolute top-16 bottom-[-2rem]" />
                    )}
                  </div>

                  <div className="pt-2">
                    <div className="inline-flex items-center gap-2 mb-3">
                      <span className="text-sm font-black text-brand-500 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-widest">Step {step.number}</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-ink mb-4">{step.title}</h3>
                    <p className="text-slate text-lg font-medium leading-relaxed max-w-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Clean SVG Visuals */}
            <div className="hidden lg:block w-1/2 sticky top-32 h-[600px] bg-slate-50 border border-slate-200 rounded-[3rem] overflow-hidden p-8 flex items-center justify-center">
              <div className="w-full h-full relative flex items-center justify-center">
                {/* SVG Illustration mimicking a clean App Window */}
                <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[120%] h-auto opacity-90 drop-shadow-xl">
                  {/* Backdrop shapes */}
                  <rect x="20" y="20" width="300" height="240" rx="16" fill="#f0fdf4" />

                  {/* Main Window */}
                  <rect x="60" y="50" width="280" height="200" rx="12" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                  {/* Window Controls */}
                  <circle cx="80" cy="65" r="4" fill="#f87171" />
                  <circle cx="95" cy="65" r="4" fill="#fbbf24" />
                  <circle cx="110" cy="65" r="4" fill="#34d399" />
                  {/* Content Rectangles */}
                  <rect x="80" y="90" width="240" height="14" rx="4" fill="#f1f5f9" />
                  <rect x="80" y="120" width="180" height="14" rx="4" fill="#f1f5f9" />
                  <rect x="80" y="150" width="200" height="14" rx="4" fill="#f1f5f9" />

                  {/* Sparkling / Magic UI element */}
                  <rect x="240" y="40" width="100" height="100" rx="16" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" className="drop-shadow-sm" />
                  <path d="M290 80L286 86L280 90L286 94L290 100L294 94L300 90L294 86L290 80Z" fill="#58cc02" />
                  <path d="M275 75L273 78L270 80L273 82L275 85L277 82L280 80L277 78L275 75Z" fill="#58cc02" />

                  {/* Checkbox confirmation element */}
                  <rect x="40" y="180" width="90" height="70" rx="12" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" className="drop-shadow-sm" />
                  <path d="M72 225L82 235L98 210" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 sm:py-28 px-4 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div ref={pricingHeadRef} className={`reveal ${pricingHeadVisible ? 'visible' : ''} text - center mb - 16`}>
            <span className="text-sm font-black text-brand-500 uppercase tracking-widest">{t('landing.pricing.label')}</span>
            <h2 className="text-3xl sm:text-4xl font-black text-ink mt-3 mb-4">
              {t('landing.pricing.title')}
            </h2>
            <p className="text-slate font-semibold max-w-xl mx-auto">
              {t('landing.pricing.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            {pricingTiers.map((tier, i) => (
              <div
                key={i}
                ref={setPricingRef(i)}
                className={`reveal - scale ${visiblePricing.has(i) ? 'visible' : ''} ${tier.highlighted ? 'z-10 bg-brand-50 rounded-[2rem] border-4 border-brand-500 shadow-card transform md:-translate-y-4' : 'z-0 bg-white rounded-[2rem] border-2 border-slate-200 border-b-[6px] border-b-slate-300'} `}
              >
                <div className={`relative p - 8 h - full rounded - [2rem] transition - transform duration - 300`}>
                  {/* Badge */}
                  {tier.badge && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <div className="inline-flex items-center gap-1.5 bg-brand-500 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg">
                        <Sparkles className="w-3.5 h-3.5" />
                        {tier.badge}
                      </div>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w - 14 h - 14 rounded - 2xl ${tier.bg} flex items - center justify - center mb - 6 ${tier.color} shadow - [0_4px_20px_ - 4px_rgba(0, 0, 0, 0.1)] border border - slate - 100`}>
                    {tier.icon}
                  </div>

                  {/* Tier name */}
                  <h3 className="text-2xl font-black text-ink mb-2">{tier.name}</h3>
                  <p className="text-slate font-medium text-sm mb-6 h-10">{tier.description}</p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="text-5xl font-black text-ink tracking-tight flex items-baseline">
                      {tier.price}
                      {tier.period && <span className="text-lg font-bold text-slate ml-1 tracking-normal">{tier.period}</span>}
                    </div>
                    {tier.nairaPrice && (
                      <div className="mt-3">
                        <span className="inline-flex items-center gap-1.5 bg-green-50/80 border border-green-200 text-green-700 text-sm font-black px-4 py-1.5 rounded-full">
                          🇳🇬 {tier.nairaPrice}/mo
                        </span>
                        <p className="text-xs text-slate mt-2 font-medium">{t('pricing.payInNairaInfo') || 'Pay in Naira · Billed monthly'}</p>
                      </div>
                    )}
                  </div>

                  <div className="w-full h-px bg-slate-100 mb-8" />

                  {/* Features */}
                  <ul className="space-y-4 mb-10">
                    {tier.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle className={`w - 5 h - 5 flex - shrink - 0 mt - 0.5 ${tier.highlighted ? 'text-brand-500' : 'text-slate-400'} `} />
                        <span className="text-ink font-medium text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    to={tier.href}
                    className={`mt - 4 block w - full text - center py - 4 rounded - 2xl font - black transition - all border - none ${tier.highlighted ? 'bg-brand-500 text-white shadow-btn-brand active:shadow-none active:translate-y-1 hover:bg-brand-400' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-b-4 border-slate-300 active:border-b-0 active:translate-y-1'} `}
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
      <section className="py-20 sm:py-24 px-4 bg-brand-900 border-t-[8px] border-brand-800 text-white">
        <div
          ref={statsRef}
          className={`reveal - scale ${statsVisible ? 'visible' : ''} max - w - 6xl mx - auto`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 1000, suffix: '+', label: t('landing.stats.quizzesGenerated') },
              { value: 500, suffix: '+', label: t('landing.stats.activeStudents') },
              { value: 95, suffix: '%', label: t('landing.stats.passRate') },
              { value: 10, suffix: 'K+', label: t('landing.stats.questionsCreated') },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl sm:text-5xl font-black mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} isVisible={statsVisible} />
                </div>
                <div className="text-sm sm:text-base font-bold text-slate">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 sm:py-28 px-4 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div ref={testimonialRef} className={`reveal ${testimonialVisible ? 'visible' : ''} text - center mb - 16`}>
            <span className="text-sm font-black text-amber-500 uppercase tracking-widest">{t('landing.testimonials.label')}</span>
            <h2 className="text-3xl sm:text-4xl font-black text-ink mt-3 mb-4">
              {t('landing.testimonials.title')}
            </h2>
          </div>

          {/* Premium Masonry Wall of Love */}
          <div className="columns-1 md:columns-3 gap-6 space-y-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                ref={setTestimonialRef(i)}
                className={`reveal - scale ${visibleTestimonials.has(i) ? 'visible' : ''} break-inside - avoid bg - white rounded - 3xl p - 8 border border - slate - 100 shadow - [0_8px_30px_rgb(0, 0, 0, 0.04)] hover: shadow - [0_8px_30px_rgb(0, 0, 0, 0.08)] transition - shadow duration - 300`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w - 12 h - 12 rounded - full ${t.color} flex items - center justify - center shadow - inner`}>
                    <span className="text-lg font-black text-white">{t.avatar}</span>
                  </div>
                  <div>
                    <div className="font-black text-ink">{t.name}</div>
                    <div className="text-sm font-semibold text-slate/70">{t.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-ink font-medium leading-relaxed">"{t.text}"</p>
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
            <Link to="/features" className="hover:text-white transition-colors">Features</Link>
            <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
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
