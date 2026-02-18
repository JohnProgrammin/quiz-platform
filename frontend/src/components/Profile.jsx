import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SubscriptionManager from './SubscriptionManager';
import BillingHistory from './BillingHistory';
import { getProfile, updateProfile } from '../api';
import { User, Mail, FileText, Loader } from 'lucide-react';

function Profile({ user, setUser, onLogout }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    bio: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();
      setFormData({
        fullName: response.data.fullName || '',
        email: response.data.email || '',
        bio: response.data.bio || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await updateProfile(formData);
      setMessage('Profile updated successfully!');
      setUser({ ...user, ...formData });
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setSaving(false);
    }
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
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-ink">Profile</h1>
        <p className="text-slate font-semibold mt-1">Manage your account</p>
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-8">
        <div className="w-24 h-24 rounded-full bg-warning flex items-center justify-center">
          <span className="text-4xl font-black text-white">{user.username[0].toUpperCase()}</span>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
            <input
              type="text"
              value={user.username}
              disabled
              className="input-field opacity-60 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate mb-2 uppercase tracking-wide">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="input-field"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate mb-2 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate mb-2 uppercase tracking-wide">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows="3"
              className="input-field resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-accent w-full text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-extrabold text-ink mb-4">Subscription</h2>
        <SubscriptionManager />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-extrabold text-ink mb-4">Billing History</h2>
        <BillingHistory />
      </div>
    </div>
  );
}

export default Profile;
