import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import { Lock, Shield, PrivacyTip } from '@mui/icons-material';

function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-black text-ink mb-8">Privacy Policy</h1>

          <div className="prose max-w-none text-slate text-lg leading-relaxed space-y-6">
            <p>Last updated: {new Date().toLocaleDateString()}</p>

            <h2 className="text-3xl font-black text-ink mt-12 mb-4">Introduction</h2>
            <p>
              FloraQuiz ("we", "our", or "us") operates the FloraQuiz mobile application and website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>

            <h2 className="text-3xl font-black text-ink mt-12 mb-4 flex items-center gap-3">
              <PrivacyTip className="w-8 h-8 text-brand-500" />
              Information Collection and Use
            </h2>
            <p>
              We collect several different types of information for various purposes to provide and improve our Service to you.
            </p>

            <h3 className="text-2xl font-bold text-ink mt-8 mb-4">Types of Data Collected:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-brand-500 flex-shrink-0 mt-1" />
                <span>Personal Data: Name, email address, and account information</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-brand-500 flex-shrink-0 mt-1" />
                <span>Usage Data: Quizzes generated, performance metrics, and learning progress</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-brand-500 flex-shrink-0 mt-1" />
                <span>Device Data: Device type, operating system, and browser information</span>
              </li>
              <li className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-brand-500 flex-shrink-0 mt-1" />
                <span>Cookies: We use cookies to enhance your experience</span>
              </li>
            </ul>

            <h2 className="text-3xl font-black text-ink mt-12 mb-4">Use of Data</h2>
            <p>
              FloraQuiz uses the collected data for various purposes:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-brand-500 flex-shrink-0 mt-1" />
                <span>To provide and maintain our Service</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-brand-500 flex-shrink-0 mt-1" />
                <span>To notify you about changes to our Service</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-brand-500 flex-shrink-0 mt-1" />
                <span>To allow you to participate in interactive features</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-brand-500 flex-shrink-0 mt-1" />
                <span>To provide customer support</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-brand-500 flex-shrink-0 mt-1" />
                <span>To gather analysis or valuable information so we can improve our Service</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-brand-500 flex-shrink-0 mt-1" />
                <span>To monitor the usage of our Service</span>
              </li>
            </ul>

            <h2 className="text-3xl font-black text-ink mt-12 mb-4">Security of Data</h2>
            <p>
              The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
            </p>

            <h2 className="text-3xl font-black text-ink mt-12 mb-4">Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
            </p>

            <h2 className="text-3xl font-black text-ink mt-12 mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through our contact form or at support@floraquiz.com
            </p>
          </div>

          <div className="mt-12">
            <Link to="/" className="text-brand-500 font-bold hover:text-brand-400">
              ← Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Privacy;
