import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PublicHeader from './PublicHeader';
import { Mail, MessageSquare, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast.success('Message sent! We\'ll get back to you soon.');
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Get in Touch
          </h1>
          <p className="text-xl text-slate font-semibold leading-relaxed">
            Have questions or feedback? We'd love to hear from you. Send us a message and we'll get back to you as quickly as possible.
          </p>
        </motion.div>
      </section>

      {/* Contact Methods */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
          className="space-y-8"
        >
          <h2 className="text-3xl font-black text-ink">Ways to Reach Us</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-brand-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-black text-ink mb-1">Email</h3>
                <p className="text-slate font-medium">support@floraquiz.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MessageSquare className="w-6 h-6 text-brand-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-black text-ink mb-1">Contact Form</h3>
                <p className="text-slate font-medium">Use the form below to send us your message</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Contact Form + Illustration */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16"
        >
          {/* Form */}
          <div>
            <h2 className="text-3xl font-black text-ink mb-8">Send us a Message</h2>

            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-green-50 border-2 border-green-200 rounded-2xl flex items-start gap-4"
              >
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-black text-green-900 mb-1">Message Sent!</h4>
                  <p className="text-sm text-green-800 font-medium">
                    Thank you for reaching out. We'll be in touch soon.
                  </p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-black text-ink uppercase tracking-widest mb-3">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 font-medium transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-black text-ink uppercase tracking-widest mb-3">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 font-medium transition-all"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-black text-ink uppercase tracking-widest mb-3">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="What is this about?"
                  className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 font-medium transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-black text-ink uppercase tracking-widest mb-3">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us more..."
                  rows="6"
                  className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 font-medium resize-none transition-all"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 bg-brand-500 text-white font-black text-lg rounded-2xl hover:bg-brand-400 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </motion.button>
            </form>
          </div>

          {/* SVG Illustration Placeholder */}
          <div className="relative w-full aspect-square bg-gradient-to-br from-brand-50 to-slate-50 rounded-3xl border-2 border-slate-200 flex items-center justify-center sticky top-24">
            <div className="text-center space-y-3">
              <p className="text-slate font-bold">Your contact SVG illustration</p>
              <p className="text-muted font-medium text-sm">(recommended: 400×400px)</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={itemVariants}
          className="space-y-8"
        >
          <h2 className="text-3xl font-black text-ink">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards and digital payment methods including Paystack for Nigerian users.',
              },
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes! You can cancel your subscription at any time from your account settings. No questions asked.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'We offer a 7-day money-back guarantee if you\'re not satisfied with your subscription.',
              },
              {
                q: 'How quickly will you respond to my message?',
                a: 'We aim to respond to all messages within 24 hours during business days.',
              },
              {
                q: 'Do you have a mobile app?',
                a: 'FloraQuiz is fully responsive on mobile. Native apps are coming soon!',
              },
            ].map((faq, i) => (
              <div key={i}>
                <h3 className="font-black text-ink mb-2">{faq.q}</h3>
                <p className="text-slate font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
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
            <Link to="/privacy" className="text-slate font-bold hover:text-brand-500 transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Contact;
