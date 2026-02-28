import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PublicHeader from './PublicHeader';
import { Mail, MessageSquare, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
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

  const contactMethods = [
    {
      icon: <Mail className="w-8 h-8" />,
      title: 'Email',
      description: 'Get help via email',
      value: 'support@floraquiz.com',
      color: 'from-blue-400 to-blue-300',
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Live Chat',
      description: 'Chat with our team',
      value: 'Available on platform',
      color: 'from-green-400 to-green-300',
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: 'Phone Support',
      description: 'Call us during business hours',
      value: '+234 (0) 123 4567',
      color: 'from-purple-400 to-purple-300',
    },
  ];

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
            Get in Touch
          </span>
          <h1 className="text-5xl sm:text-6xl font-black text-ink mb-6 leading-tight">
            We're Here to Help
          </h1>
          <p className="text-lg sm:text-xl text-slate font-semibold max-w-2xl mx-auto leading-relaxed">
            Have questions, feedback, or need support? We love hearing from our community. Reach out and we'll respond as quickly as possible.
          </p>
        </motion.div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 px-4 bg-surface">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {contactMethods.map((method, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white rounded-[2rem] border-2 border-slate-200 border-b-4 p-8 hover:border-brand-400 transition-all hover:-translate-y-1 text-center"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-6 text-white mx-auto`}>
                  {method.icon}
                </div>
                <h3 className="text-2xl font-black text-ink mb-3">{method.title}</h3>
                <p className="text-slate font-medium mb-4">{method.description}</p>
                <p className="font-black text-brand-500 text-lg">{method.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form + Illustration */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start"
          >
            {/* Form */}
            <motion.div variants={itemVariants}>
              <div className="bg-white rounded-[2rem] border-2 border-slate-200 p-8 sm:p-10">
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
                    className="w-full px-8 py-4 bg-brand-500 text-white font-black text-lg rounded-2xl hover:bg-brand-400 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 border-b-4 border-brand-600 hover:border-b-2 hover:translate-y-1"
                  >
                    <Send className="w-5 h-5" />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </motion.button>
                </form>
              </div>
            </motion.div>

            {/* SVG Illustration Placeholder */}
            <motion.div variants={itemVariants}>
              <div className="relative w-full aspect-square bg-gradient-to-br from-brand-50 via-slate-50 to-purple-50 rounded-[2rem] border-2 border-slate-200 border-b-4 flex items-center justify-center overflow-hidden sticky top-24">
                <div className="text-center space-y-4 px-6">
                  <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto">
                    <MessageSquare className="w-8 h-8 text-brand-500/50" />
                  </div>
                  <p className="text-slate font-bold text-lg">Your contact illustration goes here</p>
                  <p className="text-muted font-medium text-sm">
                    Upload your SVG (recommended: 400x400px)
                  </p>
                  <p className="text-muted font-medium text-xs mt-4">
                    💡 Suggestion: An illustration of someone writing a message or communicating would work great!
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-surface">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-ink mb-4">Quick Answers</h2>
            <p className="text-lg text-slate font-semibold max-w-2xl mx-auto">
              Can't find what you're looking for? Check these common questions.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="space-y-4"
          >
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
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white rounded-2xl border-2 border-slate-200 p-6 sm:p-8 hover:border-brand-400 transition-all"
              >
                <h3 className="font-black text-ink text-lg mb-3">{faq.q}</h3>
                <p className="text-slate font-medium leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer Navigation */}
      <footer className="bg-white border-t-2 border-slate-100 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
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
