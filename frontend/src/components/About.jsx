import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PublicHeader from './PublicHeader';
import { Lightbulb, Zap, Target, Users, Code, Heart } from 'lucide-react';

function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  };

  const values = [
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: 'Innovation',
      description: 'We push boundaries with cutting-edge AI technology to reimagine education.',
      color: 'from-blue-400 to-blue-300',
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Precision',
      description: 'Every quiz is laser-focused on your specific knowledge gaps.',
      color: 'from-brand-400 to-brand-300',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Accessibility',
      description: 'Quality education should be available to everyone, everywhere.',
      color: 'from-purple-400 to-purple-300',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Student-First',
      description: 'Everything we build is designed around what helps you learn best.',
      color: 'from-rose-400 to-rose-300',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-to-b from-brand-50 to-white border-b-2 border-slate-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto text-center"
        >
          <span className="inline-block text-sm font-black text-brand-500 uppercase tracking-widest bg-brand-50 px-4 py-2 rounded-full border-2 border-brand-200 mb-6">
            Our Story
          </span>
          <h1 className="text-5xl sm:text-6xl font-black text-ink mb-6 leading-tight">
            Revolutionizing How Students Learn
          </h1>
          <p className="text-lg sm:text-xl text-slate font-semibold max-w-2xl mx-auto leading-relaxed">
            At FloraQuiz, we believe every student deserves a personalized tutor available 24/7. We're building the future of adaptive learning.
          </p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            {/* Mission Content */}
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl font-black text-ink mb-6">Our Mission</h2>
              <p className="text-lg text-slate font-medium leading-relaxed mb-6">
                We're on a mission to democratize quality education by making personalized, AI-powered learning accessible to every student on the planet.
              </p>
              <p className="text-lg text-slate font-medium leading-relaxed mb-8">
                Traditional studying is broken. Millions spend hours passively reading and re-reading notes, hoping it sticks. We're changing that by using advanced AI to create personalized quizzes that wire your brain for mastery.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-ink mb-1">Smarter Learning</h3>
                    <p className="text-slate font-medium">AI-generated quizzes tailored to your exact content</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-ink mb-1">Faster Results</h3>
                    <p className="text-slate font-medium">Students improve grades in weeks, not months</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-ink mb-1">Lasting Mastery</h3>
                    <p className="text-slate font-medium">Spaced repetition ensures information sticks</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* SVG Illustration Placeholder */}
            <motion.div variants={itemVariants}>
              <div className="relative w-full aspect-square bg-gradient-to-br from-brand-50 via-slate-50 to-blue-50 rounded-[2rem] border-2 border-slate-200 border-b-4 flex items-center justify-center overflow-hidden">
                <div className="text-center space-y-4 px-6">
                  <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto">
                    <Lightbulb className="w-8 h-8 text-brand-500/50" />
                  </div>
                  <p className="text-slate font-bold text-sm">
                    Your mission illustration will go here
                  </p>
                  <p className="text-muted font-medium text-xs">
                    Upload your SVG (recommended: 400x400px)
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-4 bg-surface">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-ink mb-4">Our Values</h2>
            <p className="text-lg text-slate font-semibold max-w-2xl mx-auto">
              These principles guide every decision we make and every feature we build.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {values.map((value, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white rounded-[2rem] border-2 border-slate-200 border-b-4 p-8 hover:border-brand-400 transition-all hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 text-white`}>
                  {value.icon}
                </div>
                <h3 className="text-2xl font-black text-ink mb-3">{value.title}</h3>
                <p className="text-slate font-medium leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How We Solve It */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-ink mb-4">How We Solve It</h2>
            <p className="text-lg text-slate font-semibold max-w-2xl mx-auto">
              Our three-step system turns chaos into clarity.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="space-y-16"
          >
            {[
              {
                num: '1',
                title: 'Upload Your Content',
                description: 'Throw your messy PDFs, notes, or raw text at us. Our system instantly processes and understands your material.',
                placeholder: 'Your step 1 SVG illustration here',
              },
              {
                num: '2',
                title: 'AI Generates Quizzes',
                description: 'Our advanced AI creates personalized, high-yield quizzes tailored to your exact content and learning goals.',
                placeholder: 'Your step 2 SVG illustration here',
              },
              {
                num: '3',
                title: 'Master with Precision',
                description: 'Get instant feedback, identify weak topics, and practice focused mastery quizzes until you dominate.',
                placeholder: 'Your step 3 SVG illustration here',
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${i % 2 === 1 ? 'lg:grid-cols-2 lg:auto-cols-fr' : ''}`}
                style={i % 2 === 1 ? { direction: 'rtl' } : {}}
              >
                {/* Content */}
                <div style={i % 2 === 1 ? { direction: 'ltr' } : {}}>
                  <div className="inline-flex items-center gap-3 mb-6">
                    <span className="w-12 h-12 rounded-full bg-brand-500 text-white font-black text-lg flex items-center justify-center">
                      {step.num}
                    </span>
                    <span className="text-sm font-black text-brand-500 uppercase tracking-widest">Step {step.num}</span>
                  </div>
                  <h3 className="text-3xl font-black text-ink mb-4">{step.title}</h3>
                  <p className="text-lg text-slate font-medium leading-relaxed">{step.description}</p>
                </div>

                {/* SVG Placeholder */}
                <div>
                  <div className="relative w-full aspect-square bg-gradient-to-br from-brand-50 via-slate-50 to-purple-50 rounded-[2rem] border-2 border-slate-200 border-b-4 flex items-center justify-center overflow-hidden">
                    <div className="text-center space-y-4 px-6">
                      <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto">
                        <Code className="w-8 h-8 text-brand-500/50" />
                      </div>
                      <p className="text-slate font-bold text-sm">{step.placeholder}</p>
                      <p className="text-muted font-medium text-xs">SVG (400x400px recommended)</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-brand-500 to-brand-600">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-4xl font-black text-white mb-6">Join Thousands of Successful Students</h2>
          <p className="text-lg text-white/90 font-semibold mb-8">
            Start transforming your grades today. No credit card required.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-600 font-black text-lg rounded-2xl hover:bg-slate-50 transition-all border-b-4 border-slate-300 hover:border-b-2 hover:translate-y-1"
          >
            Get Started Free
          </Link>
        </motion.div>
      </section>

      {/* Footer Navigation */}
      <footer className="bg-white border-t-2 border-slate-100 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link to="/" className="text-brand-500 font-black text-lg hover:text-brand-400 transition-colors">
            ← Back to home
          </Link>
          <div className="flex items-center gap-8">
            <Link to="/contact" className="text-slate font-bold hover:text-brand-500 transition-colors">
              Contact
            </Link>
            <Link to="/privacy" className="text-slate font-bold hover:text-brand-500 transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default About;
