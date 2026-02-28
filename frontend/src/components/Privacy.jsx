import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PublicHeader from './PublicHeader';

function Privacy() {
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
            Privacy Policy
          </h1>
          <p className="text-xl text-slate font-semibold leading-relaxed">
            We are committed to protecting your privacy and ensuring transparency about how we use your data.
          </p>
          <p className="text-sm text-muted font-bold mt-6 uppercase tracking-widest">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20 space-y-16">
        {/* Introduction */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <p className="text-lg text-slate font-medium leading-relaxed">
            FloraQuiz ("we", "us", "our", or "Company") operates the FloraQuiz website and mobile platform (the "Service"). This Privacy Policy explains how we collect, use, share, and safeguard your information.
          </p>
        </motion.div>

        {/* Information Collection */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-black text-ink mb-6">Information We Collect</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-black text-ink mb-2">Personal Data</h3>
              <p className="text-slate font-medium leading-relaxed">
                Name, email address, username, and account profile information
              </p>
            </div>
            <div>
              <h3 className="font-black text-ink mb-2">Usage Data</h3>
              <p className="text-slate font-medium leading-relaxed">
                Quiz attempts, performance metrics, learning progress, and interaction data
              </p>
            </div>
            <div>
              <h3 className="font-black text-ink mb-2">Device Data</h3>
              <p className="text-slate font-medium leading-relaxed">
                Device type, operating system, browser type, IP address, and device identifiers
              </p>
            </div>
            <div>
              <h3 className="font-black text-ink mb-2">Communication Data</h3>
              <p className="text-slate font-medium leading-relaxed">
                Messages you send through contact forms, support tickets, or chat features
              </p>
            </div>
          </div>
        </motion.div>

        {/* Data Usage */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-black text-ink mb-6">How We Use Your Data</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-black text-ink mb-2">Service Provision</h3>
              <p className="text-slate font-medium leading-relaxed">
                To deliver, maintain, and improve our Service and learning platform
              </p>
            </div>
            <div>
              <h3 className="font-black text-ink mb-2">Personalization</h3>
              <p className="text-slate font-medium leading-relaxed">
                To create personalized quizzes and learning paths tailored to you
              </p>
            </div>
            <div>
              <h3 className="font-black text-ink mb-2">Communication</h3>
              <p className="text-slate font-medium leading-relaxed">
                To send service updates, security alerts, and support responses
              </p>
            </div>
            <div>
              <h3 className="font-black text-ink mb-2">Analytics</h3>
              <p className="text-slate font-medium leading-relaxed">
                To analyze usage patterns and improve our platform features
              </p>
            </div>
            <div>
              <h3 className="font-black text-ink mb-2">Legal Compliance</h3>
              <p className="text-slate font-medium leading-relaxed">
                To comply with legal obligations and protect against fraud
              </p>
            </div>
          </div>
        </motion.div>

        {/* Data Security */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-black text-ink mb-6">Data Security</h2>
          <p className="text-lg text-slate font-medium leading-relaxed mb-6">
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
              <li key={i} className="text-slate font-medium leading-relaxed">
                • {point}
              </li>
            ))}
          </ul>
          <p className="text-lg text-slate font-medium leading-relaxed mt-6">
            However, no method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
          </p>
        </motion.div>

        {/* Data Retention */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-black text-ink mb-6">Data Retention & Deletion</h2>
          <p className="text-lg text-slate font-medium leading-relaxed mb-6">
            We retain your personal data for as long as your account is active or as needed to provide you with our Service. You have the right to request deletion of your account and associated data at any time.
          </p>
          <p className="text-lg text-slate font-medium leading-relaxed">
            Upon deletion, we will remove your personal data within 30 days, except where we are required to retain it by law. Usage data may be anonymized and retained for analytics purposes.
          </p>
        </motion.div>

        {/* Your Rights */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-black text-ink mb-6">Your Privacy Rights</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-black text-ink mb-2">Right to Access</h3>
              <p className="text-slate font-medium leading-relaxed">
                You can request a copy of the personal data we hold about you
              </p>
            </div>
            <div>
              <h3 className="font-black text-ink mb-2">Right to Correction</h3>
              <p className="text-slate font-medium leading-relaxed">
                You can request we correct inaccurate or incomplete data
              </p>
            </div>
            <div>
              <h3 className="font-black text-ink mb-2">Right to Deletion</h3>
              <p className="text-slate font-medium leading-relaxed">
                You can request deletion of your account and associated data
              </p>
            </div>
            <div>
              <h3 className="font-black text-ink mb-2">Right to Opt-Out</h3>
              <p className="text-slate font-medium leading-relaxed">
                You can opt out of marketing communications at any time
              </p>
            </div>
            <div>
              <h3 className="font-black text-ink mb-2">Right to Data Portability</h3>
              <p className="text-slate font-medium leading-relaxed">
                You can request your data in a portable, machine-readable format
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-black text-ink mb-6">Privacy Questions?</h2>
          <p className="text-lg text-slate font-medium leading-relaxed mb-6">
            If you have questions about this Privacy Policy or our privacy practices, please contact us:
          </p>
          <div className="space-y-4">
            <p className="text-slate font-bold">
              📧 Email:{' '}
              <a href="mailto:privacy@floraquiz.com" className="text-brand-500 hover:text-brand-400 font-black">
                privacy@floraquiz.com
              </a>
            </p>
            <p className="text-slate font-bold">
              🌐 Contact Form:{' '}
              <Link to="/contact" className="text-brand-500 hover:text-brand-400 font-black">
                Visit our contact page
              </Link>
            </p>
            <p className="text-slate font-bold">📍 We'll respond to all privacy requests within 30 days</p>
          </div>
        </motion.div>

        {/* Updates */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-black text-ink mb-6">Changes to This Policy</h2>
          <p className="text-lg text-slate font-medium leading-relaxed">
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. We will notify you of material changes by posting the updated policy on this page and updating the "Last updated" date.
          </p>
        </motion.div>
      </section>

      {/* Footer Navigation */}
      <footer className="bg-white border-t-2 border-slate-100 py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
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
