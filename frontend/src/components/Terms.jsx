import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PublicHeader from './PublicHeader';

function Terms() {
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
            Terms of Service
          </h1>
          <p className="text-xl text-slate font-semibold leading-relaxed">
            Please read these terms carefully. By accessing and using FloraQuiz, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
          <p className="text-sm text-muted font-bold mt-6 uppercase tracking-widest">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20 space-y-16">
        {/* Acceptance of Terms */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-black text-ink mb-6">1. Acceptance of Terms</h2>
          <p className="text-lg text-slate font-medium leading-relaxed">
            By accessing and using the FloraQuiz platform ("Service"), you acknowledge that you have read, understood, and agree to be bound by all the terms and conditions of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </motion.div>

        {/* User Eligibility */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-black text-ink mb-6">2. User Eligibility</h2>
          <div className="space-y-4">
            <p className="text-lg text-slate font-medium leading-relaxed">
              You represent and warrant that:
            </p>
            <ul className="space-y-3">
              {[
                'You are at least 13 years of age (or have parental consent if under 18)',
                'You have the right and authority to enter into this agreement',
                'You are not accessing the Service for any illegal or unauthorized purpose',
                'Your use will not violate any applicable laws or regulations',
              ].map((item, i) => (
                <li key={i} className="text-slate font-medium leading-relaxed">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Account Responsibility */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-black text-ink mb-6">3. Account and Security</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-black text-ink mb-2">Account Registration</h3>
              <p className="text-slate font-medium leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
              </p>
            </div>
            <div>
              <h3 className="font-black text-ink mb-2">Account Termination</h3>
              <p className="text-slate font-medium leading-relaxed">
                FloraQuiz reserves the right to terminate your account and access to the Service at any time, for any reason, with or without notice.
              </p>
            </div>
          </div>
        </motion.div>

        {/* User Content and Conduct */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-black text-ink mb-6">4. User Content and Conduct</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-black text-ink mb-2">Your Responsibility</h3>
              <p className="text-slate font-medium leading-relaxed">
                You retain all rights to any content you submit, upload, or create on FloraQuiz. By uploading content, you grant FloraQuiz a worldwide, non-exclusive, royalty-free license to use, copy, modify, and display that content for the purpose of providing the Service.
              </p>
            </div>
            <div>
              <h3 className="font-black text-ink mb-2">Prohibited Conduct</h3>
              <p className="text-slate font-medium leading-relaxed mb-3">
                You agree not to:
              </p>
              <ul className="space-y-2">
                {[
                  'Upload, post, or transmit content that is illegal, harmful, or infringes on intellectual property rights',
                  'Harass, abuse, or threaten other users',
                  'Attempt to gain unauthorized access to the Service',
                  'Use automated tools or scripts to access the Service',
                  'Engage in any form of cheating, plagiarism, or academic dishonesty',
                  'Reverse engineer or attempt to circumvent security measures',
                ].map((item, i) => (
                  <li key={i} className="text-slate font-medium">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Intellectual Property */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-black text-ink mb-6">5. Intellectual Property Rights</h2>
          <div className="space-y-4">
            <p className="text-lg text-slate font-medium leading-relaxed">
              The FloraQuiz Service, including its content, features, and functionality, is owned by FloraQuiz and its licensors. All rights are reserved. You may not reproduce, distribute, or transmit the content without our prior written permission. User-generated content does not become the property of FloraQuiz.
            </p>
          </div>
        </motion.div>

        {/* Subscription and Payments */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-black text-ink mb-6">6. Subscriptions and Payments</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-black text-ink mb-2">Billing</h3>
              <p className="text-slate font-medium leading-relaxed">
                If you subscribe to a paid plan, you agree to pay the fees as stated. Billing occurs at the beginning of your subscription period and continues on a monthly or annual basis unless you cancel. All fees are in Nigerian Naira and include applicable taxes.
              </p>
            </div>
            <div>
              <h3 className="font-black text-ink mb-2">Refund Policy</h3>
              <p className="text-slate font-medium leading-relaxed">
                We offer a 7-day money-back guarantee for new subscribers. After 7 days, subscription fees are non-refundable. Cancellations must be made before the next billing cycle to prevent charges.
              </p>
            </div>
            <div>
              <h3 className="font-black text-ink mb-2">Cancellation</h3>
              <p className="text-slate font-medium leading-relaxed">
                You can cancel your subscription at any time from your account settings. Cancellation takes effect at the end of your current billing period.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer of Warranties */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-black text-ink mb-6">7. Disclaimer of Warranties</h2>
          <p className="text-lg text-slate font-medium leading-relaxed">
            FloraQuiz is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, regarding the Service. FloraQuiz disclaims all warranties including but not limited to merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee that the Service will be uninterrupted, error-free, or secure.
          </p>
        </motion.div>

        {/* Limitation of Liability */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-black text-ink mb-6">8. Limitation of Liability</h2>
          <p className="text-lg text-slate font-medium leading-relaxed">
            To the fullest extent permitted by law, FloraQuiz and its officers, directors, employees, and agents will not be liable for any indirect, incidental, special, or consequential damages arising out of or related to your use of the Service, even if advised of the possibility of such damages.
          </p>
        </motion.div>

        {/* Indemnification */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-black text-ink mb-6">9. Indemnification</h2>
          <p className="text-lg text-slate font-medium leading-relaxed">
            You agree to indemnify and hold harmless FloraQuiz and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising out of or related to your use of the Service or violation of these Terms.
          </p>
        </motion.div>

        {/* Changes to Terms */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-black text-ink mb-6">10. Changes to Terms</h2>
          <p className="text-lg text-slate font-medium leading-relaxed">
            FloraQuiz may update these Terms from time to time. We will notify you of material changes by posting the updated Terms on this page and updating the "Last updated" date. Your continued use of the Service after any changes constitutes your acceptance of the new Terms.
          </p>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-black text-ink mb-6">11. Contact Us</h2>
          <p className="text-lg text-slate font-medium leading-relaxed mb-6">
            If you have any questions about these Terms, please contact us:
          </p>
          <div className="space-y-4">
            <p className="text-slate font-bold">
              📧 Email:{' '}
              <a href="mailto:support@floraquiz.com" className="text-brand-500 hover:text-brand-400 font-black">
                support@floraquiz.com
              </a>
            </p>
            <p className="text-slate font-bold">
              🌐 Contact Form:{' '}
              <Link to="/contact" className="text-brand-500 hover:text-brand-400 font-black">
                Visit our contact page
              </Link>
            </p>
            <p className="text-slate font-bold">📍 We'll respond to all inquiries within 30 days</p>
          </div>
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
            <Link to="/privacy" className="text-slate font-bold hover:text-brand-500 transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Terms;
