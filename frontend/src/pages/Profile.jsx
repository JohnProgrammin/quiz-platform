import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button, Tabs, PageTransition } from '../components';
import { updateProfile } from '../api';
import { User, Settings, Lock, LogOut, Save, Edit2, Download } from 'lucide-react';
import { staggerContainer, staggerItem } from '../lib/animations';

/**
 * Profile & Settings Page
 * User profile, preferences, and account management
 */
export const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    username: 'Alex Chen',
    email: 'alex@example.com',
    fullName: 'Alex Chen',
    bio: 'Learning enthusiast 📚',
    avatar: '👨‍💼',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      setProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const tabs = [
    { label: 'Profile', value: 'profile' },
    { label: 'Preferences', value: 'preferences' },
    { label: 'Account', value: 'account' },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50 p-4 md:p-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={staggerItem}>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile Settings</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="max-w-3xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <Tabs
            defaultValue="profile"
            tabs={tabs}
            children={(activeTab) => {
              if (activeTab === 'profile') {
                return (
                  <motion.div
                    className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm"
                    variants={staggerItem}
                  >
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
                      <motion.div
                        className="text-7xl"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {profile.avatar}
                      </motion.div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{profile.username}</p>
                        <p className="text-gray-600">{profile.email}</p>
                      </div>
                      {!isEditing && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEditing(true)}
                          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-100 text-brand-700 font-semibold hover:bg-brand-200 transition-colors"
                        >
                          <Edit2 size={18} />
                          Edit Profile
                        </motion.button>
                      )}
                    </div>

                    {/* Profile Form */}
                    <motion.div className="space-y-6" variants={staggerContainer} initial="hidden" animate="visible">
                      {/* Full Name */}
                      <motion.div variants={staggerItem}>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                      </motion.div>

                      {/* Username */}
                      <motion.div variants={staggerItem}>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Username</label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                      </motion.div>

                      {/* Email */}
                      <motion.div variants={staggerItem}>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={true}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 cursor-not-allowed text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
                      </motion.div>

                      {/* Bio */}
                      <motion.div variants={staggerItem}>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Bio</label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          disabled={!isEditing}
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                          placeholder="Tell us about yourself..."
                        />
                      </motion.div>

                      {/* Action Buttons */}
                      {isEditing && (
                        <motion.div
                          variants={staggerItem}
                          className="flex gap-3 pt-6 border-t border-gray-200"
                        >
                          <Button
                            variant="primary"
                            onClick={handleSave}
                            isLoading={loading}
                            className="flex items-center gap-2"
                          >
                            <Save size={18} />
                            Save Changes
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setFormData(profile);
                              setIsEditing(false);
                            }}
                          >
                            Cancel
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                );
              }

              if (activeTab === 'preferences') {
                return (
                  <motion.div
                    className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm space-y-6"
                    variants={staggerItem}
                  >
                    <motion.div
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200"
                      whileHover={{ scale: 1.02 }}
                      variants={staggerItem}
                    >
                      <div>
                        <p className="font-semibold text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-600">Get updates on achievements and streaks</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-brand-600" />
                    </motion.div>

                    <motion.div
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200"
                      whileHover={{ scale: 1.02 }}
                      variants={staggerItem}
                    >
                      <div>
                        <p className="font-semibold text-gray-900">Sound Effects</p>
                        <p className="text-sm text-gray-600">Play sounds for correct answers</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-brand-600" />
                    </motion.div>

                    <motion.div
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200"
                      whileHover={{ scale: 1.02 }}
                      variants={staggerItem}
                    >
                      <div>
                        <p className="font-semibold text-gray-900">Daily Reminders</p>
                        <p className="text-sm text-gray-600">Remind me to practice daily</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-brand-600" />
                    </motion.div>

                    <motion.div
                      variants={staggerItem}
                      className="pt-6 border-t border-gray-200"
                    >
                      <Button variant="primary" className="w-full">
                        Save Preferences
                      </Button>
                    </motion.div>
                  </motion.div>
                );
              }

              if (activeTab === 'account') {
                return (
                  <motion.div
                    className="space-y-4"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Change Password */}
                    <motion.div
                      className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm"
                      variants={staggerItem}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <Lock className="w-6 h-6 text-brand-600" />
                        <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
                      </div>
                      <div className="space-y-4">
                        <input
                          type="password"
                          placeholder="Current password"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
                        />
                        <input
                          type="password"
                          placeholder="New password"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
                        />
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
                        />
                        <Button variant="primary">Update Password</Button>
                      </div>
                    </motion.div>

                    {/* Export Data */}
                    <motion.div
                      className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm"
                      variants={staggerItem}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <Download className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">Export Data</h3>
                      </div>
                      <p className="text-gray-600 mb-4">Download all your learning data as JSON</p>
                      <Button variant="secondary">Export My Data</Button>
                    </motion.div>

                    {/* Logout */}
                    <motion.div
                      className="bg-red-50 rounded-xl p-8 border-2 border-red-200"
                      variants={staggerItem}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <LogOut className="w-6 h-6 text-red-600" />
                        <h3 className="text-lg font-bold text-gray-900">Sign Out</h3>
                      </div>
                      <p className="text-gray-600 mb-4">You'll be logged out of all devices</p>
                      <Button variant="danger" onClick={handleLogout}>
                        Sign Out
                      </Button>
                    </motion.div>
                  </motion.div>
                );
              }
            }}
          />
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Profile;
