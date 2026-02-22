import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import { Send, CheckCircle } from '@mui/icons-material';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl font-black text-ink mb-4">Get in Touch</h1>
          <p className="text-slate text-lg mb-12">
            Have questions or feedback? We'd love to hear from you. Fill out the form below and we'll respond as soon as possible.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-ink font-bold mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-ink font-bold mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-ink font-bold mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-ink font-bold mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-4 bg-brand-500 text-white font-black text-lg rounded-2xl hover:bg-brand-400 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send Message
            </button>
          </form>

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

export default Contact;
