import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SubscriptionManager from './SubscriptionManager';
import BillingHistory from './BillingHistory';
import { getProfile, updateProfile } from '../api';
import { User, Mail, FileText, Loader, Key, MessageSquare, Crown, Copy, Eye, EyeOff, Save, KeyRound, Camera } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tabs from '@radix-ui/react-tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(200, 'Bio must be under 200 characters').optional(),
});

function Profile({ user, setUser, onLogout }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [mockApiKey, setMockApiKey] = useState('qz_live_593021948x19d9fa02');
  const { isPremium } = useSubscription();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      bio: '',
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();
      if (response.data) {
        setValue('fullName', response.data.fullName || '');
        setValue('email', response.data.email || '');
        setValue('bio', response.data.bio || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    setMessage('');

    try {
      await updateProfile(data);
      setMessage('Profile updated successfully!');
      setUser({ ...user, ...data });
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const generateNewKey = () => {
    // Generate a secure-looking random key
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let newKey = 'qz_live_';
    for (let i = 0; i < 24; i++) {
      newKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setMockApiKey(newKey);
    setApiKeyVisible(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mockApiKey);
    alert('API Key copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-slate font-bold mt-4">Loading...</p>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-xl mx-auto px-4 py-8">
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-2xl font-extrabold text-ink">Profile</h1>
        <p className="text-slate font-semibold mt-1">Manage your account</p>
      </motion.div>

      {/* Avatar */}
      <motion.div variants={itemVariants} className="flex justify-center mb-10 relative">
        <div className="relative">
          {/* Pulsing ring */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-brand-400 blur-md -z-10"
          />
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-400 to-purple-500 shadow-xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300 border-4 border-white dark:border-slate-800 z-10 relative">
            <span className="text-4xl font-black text-white">{user.username[0].toUpperCase()}</span>
          </div>
          {/* Edit Badge */}
          <button
            className="absolute bottom-0 right-0 p-2 rounded-full bg-white shadow-md border-2 border-slate-100 hover:bg-slate-50 transition-colors z-20 text-slate hover:text-brand-500 cursor-pointer group"
            title="Change Avatar (Coming Soon)"
            onClick={() => alert('Avatar upload coming soon!')}
          >
            <Camera className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </motion.div>

      {/* Tabs Layout Container */}
      <Tabs.Root defaultValue="general" className="mt-8 flex flex-col w-full">
        {/* Tab List */}
        <motion.div variants={itemVariants} className="overflow-x-auto pb-2 mb-6">
          <Tabs.List className="flex border-b-2 border-slate-200">
            <Tabs.Trigger
              value="general"
              className="px-6 py-3 font-bold text-slate hover:text-brand-500 data-[state=active]:text-brand-600 data-[state=active]:border-b-4 data-[state=active]:border-brand-500 transition-colors whitespace-nowrap"
            >
              General Info
            </Tabs.Trigger>
            <Tabs.Trigger
              value="billing"
              className="px-6 py-3 font-bold text-slate hover:text-brand-500 data-[state=active]:text-brand-600 data-[state=active]:border-b-4 data-[state=active]:border-brand-500 transition-colors whitespace-nowrap"
            >
              Plan & Billing
            </Tabs.Trigger>
            {isPremium && (
              <Tabs.Trigger
                value="developer"
                className="px-6 py-3 font-bold text-slate flex items-center gap-2 hover:text-purple-500 data-[state=active]:text-purple-600 data-[state=active]:border-b-4 data-[state=active]:border-purple-500 transition-colors whitespace-nowrap"
              >
                VIP Features <Crown className="w-4 h-4 text-gold" />
              </Tabs.Trigger>
            )}
          </Tabs.List>
        </motion.div>

        {/* --- GENERAL TAB --- */}
        <Tabs.Content value="general" className="focus:outline-none focus:ring-0">
          <motion.div variants={itemVariants} className="card relative overflow-hidden">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-brand-400 to-purple-500" />
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              {message && (
                <div
                  className={`p-4 rounded-2xl font-bold text-sm text-center border-2 ${message.includes('success')
                    ? 'bg-green-50 text-brand-500 border-brand-500'
                    : 'bg-red-50 text-danger border-danger'
                    }`}
                >
                  {message}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate mb-2 uppercase tracking-wide">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={user.username}
                    disabled
                    className="input-field pl-10 opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate mb-2 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    {...register('fullName')}
                    className={`input-field pl-10 ${errors.fullName ? 'border-red-500' : ''}`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.fullName && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate mb-2 uppercase tracking-wide">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    {...register('email')}
                    className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate mb-2 uppercase tracking-wide">
                  Bio
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                    <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                  <textarea
                    {...register('bio')}
                    rows="3"
                    className={`input-field pl-10 resize-none ${errors.bio ? 'border-red-500' : ''}`}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                {errors.bio && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.bio.message}</p>}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-accent w-full text-base disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </form>
          </motion.div>
        </Tabs.Content>

        {/* --- BILLING TAB --- */}
        <Tabs.Content value="billing" className="focus:outline-none focus:ring-0">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            <motion.div variants={itemVariants}>
              <h2 className="text-xl font-extrabold text-ink mb-4">Subscription</h2>
              <SubscriptionManager />
            </motion.div>
            <motion.div variants={itemVariants}>
              <h2 className="text-xl font-extrabold text-ink mb-4">Billing History</h2>
              <BillingHistory />
            </motion.div>
          </motion.div>
        </Tabs.Content>

        {/* --- VIP FEATURES TAB --- */}
        {isPremium && (
          <Tabs.Content value="developer" className="focus:outline-none focus:ring-0">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
              {/* API Keys Feature */}
              <motion.div variants={itemVariants} className="card p-6 border-2 border-brand-200 bg-brand-50/50 hover:bg-white transition-colors relative overflow-hidden">
                <div className="absolute top-0 w-full h-1 left-0 bg-gradient-to-r from-brand-400 to-purple-500" />
                <h2 className="text-xl font-extrabold text-ink mb-2 flex items-center gap-2">
                  <KeyRound className="w-6 h-6 text-brand-500" /> Production API Keys
                </h2>
                <p className="text-sm font-semibold text-slate mb-6">
                  Generate secure tokens to authenticate your external requests to the Quizzer Platform APIs. Keep these secret.
                </p>

                <div className="p-4 bg-white border-2 border-slate-200 rounded-xl mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-inner">
                  <div className="flex-1 w-full flex items-center justify-between bg-slate-100 rounded-lg px-4 py-3 font-mono text-sm tracking-wide text-ink overflow-hidden">
                    <span className={`${!apiKeyVisible ? 'blur-sm select-none' : ''}`}>
                      {mockApiKey}
                    </span>
                    <button
                      onClick={() => setApiKeyVisible(!apiKeyVisible)}
                      className="ml-4 p-1 rounded-md hover:bg-slate-200 transition-colors text-slate-500"
                      title={apiKeyVisible ? "Hide Key" : "Reveal Key"}
                    >
                      {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="btn-secondary whitespace-nowrap px-4 py-2 flex items-center gap-2 shrink-0"
                  >
                    <Copy className="w-4 h-4" /> Copy Key
                  </button>
                </div>

                <div className="flex justify-start">
                  <button onClick={generateNewKey} className="btn-primary py-2 px-5 text-sm flex items-center gap-2">
                    <Key className="w-4 h-4" /> Generate New Key
                  </button>
                </div>
              </motion.div>

              {/* Priority Support Feature */}
              <motion.div variants={itemVariants} className="card p-6 border-2 border-purple-200 bg-purple-50/50 hover:bg-white transition-colors relative overflow-hidden">
                <div className="absolute top-0 w-full h-1 left-0 bg-gradient-to-r from-purple-500 to-pink-500" />
                <h2 className="text-xl font-extrabold text-ink mb-2 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-purple-500" /> Concierge Support
                </h2>
                <p className="text-sm font-semibold text-slate mb-6">
                  Skip the queue. As a Premium member, you get priority engineering and data ingestion support 24x7.
                </p>
                <div className="flex justify-start">
                  <button className="btn-accent py-2 px-5 text-sm" onClick={() => alert('Opening priority chat widget...')}>
                    Contact Engineering
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </Tabs.Content>
        )}
      </Tabs.Root>
    </motion.div >
  );
}

export default Profile;
