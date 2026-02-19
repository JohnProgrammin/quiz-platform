import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useScrollReveal, useStaggerReveal } from '../hooks/useScrollReveal';
import LanguageSwitcher from './LanguageSwitcher';
import {
  Upload, Sparkles, Trophy, Brain, Zap, Target,
  BookOpen, BarChart3, ArrowRight, CheckCircle, Star,
  Users, FileText, Shield, Crown, Gift, Wand2
} from 'lucide-react';

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
      period: '/month',
      description: 'Perfect for serious learners wanting to master any topic',
      icon: <Sparkles className="w-7 h-7" />,
      color: 'text-brand-500',
      bg: 'bg-white',
      border: 'border-2 border-brand-500 ring-4 ring-brand-500/10',
      features: [
        'Unlimited quizzes',
        'Unlimited notes & uploads',
        'AI-powered feedback on answers',
        'Identify weak topics automatically',
        'Focused mastery quizzes',
        'Pre-quiz AI teaching summaries',
        'Enhanced analytics & insights',
      ],
      cta: t('landing.pricing.upgradePro'),
      href: '/signup',
      badge: t('landing.pricing.mostPopular'),
      highlighted: true,
    },
    {
      name: t('landing.pricing.premium'),
      price: '₦10,000',
      period: '/month',
      description: 'Everything in Pro, plus 1-on-1 AI tutoring',
      icon: <Crown className="w-7 h-7" />,
      color: 'text-amber-500',
      bg: 'bg-white',
      border: 'border-2 border-border',
      features: [
        'Everything in Pro',
        'Unlimited AI Teaching sessions',
        '1-on-1 conversational tutoring',
        'Ask AI any question you want',
        'Custom quiz settings',
        'Advanced analytics',
        'Priority support',
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
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* ── Navbar (Duolingo-style responsive) ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md border-b-2 border-border shadow-sm' : 'bg-transparent'
        }`}>
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

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-100 rounded-full opacity-30 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-100 rounded-full opacity-30 blur-3xl" />

        <div ref={heroRef} className={`reveal ${heroVisible ? 'visible' : ''}`}>
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-ink leading-tight mb-6">
              {t('landing.hero.title')}
              <br />
              <span className="text-brand-500">{t('landing.hero.titleSpan')}</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate font-semibold max-w-2xl mx-auto mb-10 leading-relaxed">
              {t('landing.hero.subtitle')}
              <br />
              <strong className="text-ink">{t('landing.hero.subtitleStrong')}</strong> — {t('landing.hero.subtitleCta')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/signup" className="btn-primary text-lg px-8 py-4">
                {t('landing.hero.startLearning').toUpperCase()}
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4 flex items-center gap-2">
                {t('landing.hero.alreadyHaveAccount').toUpperCase()}
              </Link>
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
                      className={`demo-option p-4 rounded-2xl border-2 flex items-center gap-4 font-bold text-sm cursor-pointer transition-all ${visibleOptions.has(i)
                        ? 'opacity-100'
                        : 'opacity-0 pointer-events-none'
                        } ${demoPhase === 3 && i === 1
                          ? 'border-brand-500 bg-blue-50 text-brand-600 demo-correct shadow-sm'
                          : 'border-border/60 bg-white hover:bg-surface text-slate'
                        }`}
                      style={{
                        '--delay': `${i * 0.25}s`,
                      }}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-all flex-shrink-0 ${demoPhase === 3 && i === 1
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600'
                          }`}
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
                      className={`progress-fill h-full transition-all ${demoPhase >= 4 ? 'demo-progress' : ''}`}
                      style={{
                        width: `${progressWidth}%`,
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
          <div ref={featuresHeadRef} className={`reveal ${featuresHeadVisible ? 'visible' : ''} text-center mb-16`}>
            <span className="text-sm font-black text-brand-500 uppercase tracking-widest">{t('landing.features.why')}</span>
            <h2 className="text-3xl sm:text-4xl font-black text-ink mt-3 mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-slate font-semibold max-w-xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                ref={setFeatureRef(i)}
                className={`reveal-scale ${visibleFeatures.has(i) ? 'visible' : ''} card p-8 hover:shadow-sm transition-shadow`}
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-5 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-extrabold text-ink mb-2">{feature.title}</h3>
                <p className="text-slate font-semibold leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 sm:py-28 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div ref={howHeadRef} className={`reveal ${howHeadVisible ? 'visible' : ''} text-center mb-16`}>
            <span className="text-sm font-black text-brand-500 uppercase tracking-widest">{t('landing.steps.how')}</span>
            <h2 className="text-3xl sm:text-4xl font-black text-ink mt-3 mb-4">
              {t('landing.steps.title')}
            </h2>
            <p className="text-slate font-semibold max-w-xl mx-auto">
              {t('landing.steps.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div
                key={i}
                ref={setStepRef(i)}
                className={`reveal ${visibleSteps.has(i) ? 'visible' : ''} text-center relative`}
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-surface" />
                )}
                <div className={`w-20 h-20 rounded-full ${step.color} flex items-center justify-center mx-auto mb-6 text-white relative z-10`}>
                  {step.icon}
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface border-2 border-border text-sm font-black text-slate -mt-3 mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-extrabold text-ink mb-2">{step.title}</h3>
                <p className="text-slate font-semibold max-w-xs mx-auto leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 sm:py-28 px-4 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div ref={pricingHeadRef} className={`reveal ${pricingHeadVisible ? 'visible' : ''} text-center mb-16`}>
            <span className="text-sm font-black text-brand-500 uppercase tracking-widest">{t('landing.pricing.label')}</span>
            <h2 className="text-3xl sm:text-4xl font-black text-ink mt-3 mb-4">
              {t('landing.pricing.title')}
            </h2>
            <p className="text-slate font-semibold max-w-xl mx-auto">
              {t('landing.pricing.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <div
                key={i}
                ref={setPricingRef(i)}
                className={`reveal-scale ${visiblePricing.has(i) ? 'visible' : ''} rounded-2xl p-8 transition-all hover:shadow-sm ${tier.bg} ${tier.border} ${tier.highlighted ? 'md:scale-105 shadow-xl' : ''
                  }`}
              >
                {/* Badge */}
                {tier.badge && (
                  <div className="flex justify-center mb-4">
                    <div className="inline-flex items-center gap-1 bg-brand-500 text-white px-3 py-1 rounded-full text-xs font-black">
                      ⭐ {tier.badge}
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl ${tier.bg} flex items-center justify-center mx-auto mb-4 ${tier.color}`}>
                  {tier.icon}
                </div>

                {/* Tier name */}
                <h3 className="text-2xl font-extrabold text-ink text-center mb-2">{tier.name}</h3>
                <p className="text-slate font-semibold text-center text-sm mb-6">{tier.description}</p>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="text-4xl font-black text-ink">
                    {tier.price}
                    {tier.period && <span className="text-lg text-slate">{tier.period}</span>}
                  </div>
                  {tier.nairaPrice && (
                    <div className="mt-1.5">
                      <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-sm font-black px-3 py-1 rounded-full">
                        🇳🇬 {tier.nairaPrice}/mo
                      </span>
                    </div>
                  )}
                  {tier.nairaPrice && (
                    <p className="text-[11px] text-muted mt-1.5 font-semibold">Pay in Naira · Billed monthly</p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate font-semibold text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link
                  to={tier.href}
                  className={tier.highlighted ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-20 sm:py-24 px-4 bg-ink text-white">
        <div
          ref={statsRef}
          className={`reveal-scale ${statsVisible ? 'visible' : ''} max-w-6xl mx-auto`}
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
          <div ref={testimonialRef} className={`reveal ${testimonialVisible ? 'visible' : ''} text-center mb-16`}>
            <span className="text-sm font-black text-amber-500 uppercase tracking-widest">{t('landing.testimonials.label')}</span>
            <h2 className="text-3xl sm:text-4xl font-black text-ink mt-3 mb-4">
              {t('landing.testimonials.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                ref={setTestimonialRef(i)}
                className={`reveal-scale ${visibleTestimonials.has(i) ? 'visible' : ''} card p-6`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-full ${t.color} flex items-center justify-center`}>
                    <span className="text-sm font-black text-white">{t.avatar}</span>
                  </div>
                  <div>
                    <div className="font-extrabold text-ink">{t.name}</div>
                    <div className="text-sm font-bold text-slate">{t.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-slate font-semibold leading-relaxed">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 sm:py-28 px-4 bg-white">
        <div
          ref={ctaRef}
          className={`reveal-scale ${ctaVisible ? 'visible' : ''} max-w-3xl mx-auto text-center`}
        >
          <h2 className="text-3xl sm:text-5xl font-black text-ink mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-lg text-slate font-semibold mb-8 max-w-lg mx-auto">
            {t('landing.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="btn-primary text-lg px-10 py-4">
              {t('landing.cta.cta').toUpperCase()}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-4 bg-ink text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-lg font-extrabold text-brand-500">floraquiz</span>
        </div>
        <p className="text-slate font-semibold text-sm">
          {t('landing.footer')}
        </p>
      </footer>
    </div>
  );
}

export default Landing;
