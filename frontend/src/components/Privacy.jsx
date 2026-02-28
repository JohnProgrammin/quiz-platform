import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PublicHeader from './PublicHeader';
import { Lock, Shield, Eye, Database, CheckCircle } from 'lucide-react';

function Privacy() {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  };

  const sections = [
    {
      icon: <Eye className="w-6 h-6" />,
      id: 'information-collection',
      title: 'Information We Collect',
      items: [
        {
          subtitle: 'Personal Data',
          description: 'Name, email address, username, and account profile information',
        },
        {
          subtitle: 'Usage Data',
          description: 'Quiz attempts, performance metrics, learning progress, and interaction data',
        },
        {
          subtitle: 'Device Data',
          description: 'Device type, operating system, browser type, IP address, and device identifiers',
        },
        {
          subtitle: 'Communication Data',
          description: 'Messages you send through contact forms, support tickets, or chat features',
        },
      ],
    },
    {
      icon: <Database className="w-6 h-6" />,
      id: 'data-usage',
      title: 'How We Use Your Data',
      items: [
        {
          subtitle: 'Service Provision',
          description: 'To deliver, maintain, and improve our Service and learning platform',
        },
        {
          subtitle: 'Personalization',
          description: 'To create personalized quizzes and learning paths tailored to you',
        },
        {
          subtitle: 'Communication',
          description: 'To send service updates, security alerts, and support responses',
        },
        {
          subtitle: 'Analytics',
          description: 'To analyze usage patterns and improve our platform features',
        },
        {
          subtitle: 'Legal Compliance',
          description: 'To comply with legal obligations and protect against fraud',
        },
      ],
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
          className="max-w-4xl mx-auto text-center"
        >
          <span className="inline-block text-sm font-black text-brand-500 uppercase tracking-widest bg-brand-50 px-4 py-2 rounded-full border-2 border-brand-200 mb-6">
            Your Privacy Matters
          </span>
          <h1 className="text-5xl sm:text-6xl font-black text-ink mb-6 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-lg sm:text-xl text-slate font-semibold max-w-2xl mx-auto leading-relaxed">
            We are committed to protecting your privacy and ensuring transparency about how we use your data.
          </p>
          <p className="text-sm text-muted font-bold mt-6 uppercase tracking-widest">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>
      </section>

      {/* Introduction */}
      <section className="py-20 px-4 bg-white border-b-2 border-slate-100">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-brand-50 border-2 border-brand-200 rounded-[2rem] p-8 sm:p-10">
            <div className="flex items-start gap-4 mb-6">
              <Shield className="w-8 h-8 text-brand-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-black text-ink mb-4">Introduction</h2>
                <p className="text-slate font-medium leading-relaxed mb-4">
                  FloraQuiz ("we", "us", "our", or "Company") operates the FloraQuiz website and mobile platform (the "Service"). This Privacy Policy explains how we collect, use, share, and safeguard your information.
                </p>
                <p className="text-slate font-medium leading-relaxed">
                  Please read this Privacy Policy carefully. If you disagree with our practices, please do not use our Service. By accessing and using FloraQuiz, you acknowledge that you have read and understand this policy.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Key Sections */}
      <section className="py-20 px-4 bg-surface">
        <div className="max-w-4xl mx-auto space-y-16">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={itemVariants}
              id={section.id}
            >
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-300 flex items-center justify-center text-white flex-shrink-0">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-ink">{section.title}</h2>
                </div>
              </div>

              <div className="space-y-6 ml-16">
                {section.items.map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:border-brand-400 transition-all">
                    <h3 className="font-black text-ink mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-brand-500" />
                      {item.subtitle}
                    </h3>
                    <p className="text-slate font-medium leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Security & Retention */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Security */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={itemVariants}
          >
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-300 flex items-center justify-center text-white flex-shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-ink">Data Security</h2>
              </div>
            </div>

            <div className="ml-16 space-y-6">
              <div className="bg-surface rounded-2xl border-2 border-slate-200 p-8">
                <p className="text-slate font-medium leading-relaxed mb-4">
                  The security of your personal data is important to us. We implement industry-standard security measures including:
                </p>
                <ul className="space-y-3">
                  {[
                    'End-to-end encryption for data in transit (TLS/SSL)',
                    'Encrypted storage for sensitive information',
                    'Regular security audits and vulnerability assessments',
                    'Access controls and authentication systems',
                    'Compliance with international data protection standards',
                  ].map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-brand-500 flex-shrink-0 mt-1" />
                      <span className="text-slate font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-slate font-medium leading-relaxed mt-6">
                  However, no method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security. You use our Service at your own risk.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Data Retention */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={itemVariants}
          >
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-300 flex items-center justify-center text-white flex-shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-ink">Data Retention & Deletion</h2>
              </div>
            </div>

            <div className="ml-16">
              <div className="bg-surface rounded-2xl border-2 border-slate-200 p-8">
                <p className="text-slate font-medium leading-relaxed mb-4">
                  We retain your personal data for as long as your account is active or as needed to provide you with our Service. You have the right to request deletion of your account and associated data at any time.
                </p>
                <p className="text-slate font-medium leading-relaxed">
                  Upon deletion, we will remove your personal data within 30 days, except where we are required to retain it by law. Usage data may be anonymized and retained for analytics purposes.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Your Rights & Contact */}
      <section className="py-20 px-4 bg-surface">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Your Rights */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={itemVariants}
          >
            <h2 className="text-3xl font-black text-ink mb-8">Your Privacy Rights</h2>

            <div className="space-y-4">
              {[
                {
                  title: 'Right to Access',
                  desc: 'You can request a copy of the personal data we hold about you',
                },
                {
                  title: 'Right to Correction',
                  desc: 'You can request we correct inaccurate or incomplete data',
                },
                {
                  title: 'Right to Deletion',
                  desc: 'You can request deletion of your account and associated data',
                },
                {
                  title: 'Right to Opt-Out',
                  desc: 'You can opt out of marketing communications at any time',
                },
                {
                  title: 'Right to Data Portability',
                  desc: 'You can request your data in a portable, machine-readable format',
                },
              ].map((right, i) => (
                <div key={i} className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:border-brand-400 transition-all">
                  <h3 className="font-black text-ink mb-2">{right.title}</h3>
                  <p className="text-slate font-medium">{right.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={itemVariants}
            className="bg-brand-50 border-2 border-brand-200 rounded-[2rem] p-8 sm:p-10"
          >
            <h2 className="text-3xl font-black text-ink mb-6">Privacy Questions or Concerns?</h2>
            <p className="text-slate font-medium leading-relaxed mb-6">
              If you have questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="space-y-3 text-slate font-bold">
              <p>📧 Email: <a href="mailto:privacy@floraquiz.com" className="text-brand-500 hover:text-brand-400 font-black">privacy@floraquiz.com</a></p>
              <p>🌐 Contact Form: <Link to="/contact" className="text-brand-500 hover:text-brand-400 font-black">Visit our contact page</Link></p>
              <p>📍 We'll respond to all privacy requests within 30 days</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Policy Updates */}
      <section className="py-20 px-4 bg-white border-b-2 border-slate-100">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-black text-ink mb-6">Changes to This Policy</h2>
          <div className="bg-surface rounded-2xl border-2 border-slate-200 p-8">
            <p className="text-slate font-medium leading-relaxed mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes by posting the updated policy on this page and updating the "Last updated" date.
            </p>
            <p className="text-slate font-medium leading-relaxed">
              Your continued use of FloraQuiz following the posting of revised Privacy Policy means that you accept and agree to the changes. We encourage you to review this policy periodically to stay informed about how we protect your privacy.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Footer Navigation */}
      <footer className="bg-white py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link to="/" className="text-brand-500 font-black text-lg hover:text-brand-400 transition-colors">
            ← Back to home
          </Link>
          <div className="flex items-center gap-8">
            <Link to="/about" className="text-slate font-bold hover:text-brand-500 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-slate font-bold hover:text-brand-500 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Privacy;
