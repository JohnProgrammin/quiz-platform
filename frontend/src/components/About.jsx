import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PublicHeader from './PublicHeader';

function About() {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-5xl sm:text-6xl font-black text-ink mb-6 leading-tight">
            About FloraQuiz
          </h1>
          <p className="text-xl text-slate font-semibold leading-relaxed">
            We believe every student deserves a personalized tutor available 24/7. FloraQuiz uses advanced AI to transform how you study.
          </p>
        </motion.div>
      </section>

      {/* Content Sections */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20 space-y-16">
        {/* Our Mission */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          <div>
            <h2 className="text-4xl font-black text-ink mb-6">Our Mission</h2>
            <p className="text-lg text-slate font-medium leading-relaxed mb-6">
              We're democratizing quality education by making personalized, AI-powered learning accessible to every student on the planet.
            </p>
            <p className="text-lg text-slate font-medium leading-relaxed">
              Traditional studying is broken. Millions spend hours passively reading notes, hoping something sticks. We're changing that using advanced AI to create personalized quizzes that actually wire your brain for mastery.
            </p>
          </div>

          {/* SVG Space */}
          <div className="relative w-full aspect-square bg-gradient-to-br from-brand-50 to-slate-50 rounded-3xl border-2 border-slate-200 flex items-center justify-center">
            <div className="text-center space-y-3">
              <p className="text-slate font-bold">Your mission SVG illustration</p>
              <p className="text-muted font-medium text-sm">(recommended: 400×400px)</p>
            </div>
          </div>
        </motion.div>

        {/* Why We Do This */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-4xl font-black text-ink mb-8">Why This Matters</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-ink mb-2">Smarter Learning</h3>
              <p className="text-lg text-slate font-medium leading-relaxed">
                AI-generated quizzes tailored to your exact content. No more guessing what to study.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-black text-ink mb-2">Faster Results</h3>
              <p className="text-lg text-slate font-medium leading-relaxed">
                Students improve grades in weeks, not months. Our system finds your weak spots instantly.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-black text-ink mb-2">Lasting Mastery</h3>
              <p className="text-lg text-slate font-medium leading-relaxed">
                Spaced repetition ensures information sticks. You'll remember what you learn for months.
              </p>
            </div>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-4xl font-black text-ink mb-8">How It Works</h2>
          <div className="space-y-12">
            {[
              {
                num: '1',
                title: 'Upload Your Notes',
                description: 'Throw your messy PDFs, docs, or raw text at us. Our system instantly understands your material.',
              },
              {
                num: '2',
                title: 'AI Generates Quizzes',
                description: 'We create personalized, high-yield quizzes tailored to your content and learning goals.',
              },
              {
                num: '3',
                title: 'Master with Precision',
                description: 'Get instant feedback, identify weak topics, and practice focused mastery quizzes until you dominate.',
              },
            ].map((step, i) => (
              <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="inline-flex items-center gap-3 mb-6">
                    <span className="w-12 h-12 rounded-full bg-brand-500 text-white font-black text-lg flex items-center justify-center">
                      {step.num}
                    </span>
                    <span className="text-sm font-black text-brand-500 uppercase tracking-widest">Step {step.num}</span>
                  </div>
                  <h3 className="text-3xl font-black text-ink mb-4">{step.title}</h3>
                  <p className="text-lg text-slate font-medium leading-relaxed">{step.description}</p>
                </div>

                {/* SVG Space */}
                <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="relative w-full aspect-square bg-gradient-to-br from-brand-50 to-slate-50 rounded-3xl border-2 border-slate-200 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <p className="text-slate font-bold">Step {step.num} SVG</p>
                      <p className="text-muted font-medium text-sm">(400×400px)</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Our Values */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-4xl font-black text-ink mb-8">Our Values</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-ink mb-2">Innovation</h3>
              <p className="text-lg text-slate font-medium leading-relaxed">
                We push boundaries with cutting-edge AI technology to reimagine education.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-black text-ink mb-2">Precision</h3>
              <p className="text-lg text-slate font-medium leading-relaxed">
                Every quiz is laser-focused on your specific knowledge gaps.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-black text-ink mb-2">Accessibility</h3>
              <p className="text-lg text-slate font-medium leading-relaxed">
                Quality education should be available to everyone, everywhere.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-black text-ink mb-2">Student-First</h3>
              <p className="text-lg text-slate font-medium leading-relaxed">
                Everything we build is designed around what helps you learn best.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 bg-brand-500">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl font-black text-white mb-6">Ready to Transform Your Learning?</h2>
          <p className="text-lg text-white/90 font-semibold mb-8">
            Join thousands of students who are already crushing their goals.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-4 bg-white text-brand-500 font-black text-lg rounded-2xl hover:bg-slate-50 transition-colors"
          >
            Get Started Free
          </Link>
        </motion.div>
      </section>

      {/* Footer Navigation */}
      <footer className="bg-white border-t-2 border-slate-100 py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
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
