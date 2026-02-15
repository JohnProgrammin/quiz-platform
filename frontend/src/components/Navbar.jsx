import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Sparkles, LogOut, Menu, X, BarChart3 } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import LanguageSwitcher from './LanguageSwitcher';

function Navbar({ user, onLogout }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const { tier, isPro, isPremium } = useSubscription();

  const isActive = (path) => location.pathname === path;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileOpen]);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navItems = [
    { path: '/dashboard', icon: <Home className="w-5 h-5" />, label: 'Home' },
    { path: '/notes', icon: <FileText className="w-5 h-5" />, label: 'Notes' },
    { path: '/analytics', icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' },
    ...(isPremium ? [{
      path: '/teaching',
      icon: <Sparkles className="w-5 h-5" />,
      label: 'AI Teaching',
      badge: 'PREMIUM'
    }] : []),
  ];

  return (
    <>
      <nav className={`bg-white sticky top-0 z-50 transition-all duration-200 border-b-2 border-gray-100 ${
        scrolled ? 'shadow-md' : ''
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-3 flex-shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center group-hover:shadow-lg transition-all">
                <span className="text-lg font-black text-white">Q</span>
              </div>
              <span className="text-2xl font-black gradient-text tracking-tight hidden sm:inline">floraquiz</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-brand-100 text-brand-600 shadow-sm'
                      : 'text-slate hover:text-ink hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white ml-1">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop right side */}
            <div className="hidden lg:flex items-center gap-3">
              <LanguageSwitcher />

              <Link
                to="/profile"
                className={`flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 ${
                  isActive('/profile')
                    ? 'bg-brand-100 text-brand-600 shadow-sm'
                    : 'text-slate hover:text-ink hover:bg-gray-100'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0 text-white">
                  <span className="text-xs font-black">{user.username[0].toUpperCase()}</span>
                </div>
                <span className="max-w-[100px] truncate">{user.username}</span>
                {(isPro || isPremium) && (
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ml-1 ${
                    isPremium ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' : 'bg-brand-500 text-white'
                  }`}>
                    {isPremium ? 'PREMIUM' : 'PRO'}
                  </span>
                )}
              </Link>

              <button
                onClick={onLogout}
                className="p-2 text-slate hover:text-ink hover:bg-red-50 rounded-xl transition-all duration-200"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-ink hover:bg-gray-100 rounded-xl transition-all"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 mobile-menu-overlay lg:hidden bg-black/30" />
      )}

      {/* Mobile menu panel */}
      <div
        ref={menuRef}
        className={`fixed top-16 right-0 w-72 max-w-[85vw] h-[calc(100vh-4rem)] bg-white border-l-2 border-gray-100 z-50 transform transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* User info */}
          <div className="p-6 border-b-2 border-gray-100 bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0 text-white shadow-md">
                <span className="text-base font-black">{user.username[0].toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <div className="font-black text-ink truncate">{user.username}</div>
                <div className="text-sm font-semibold text-slate mt-0.5">
                  {isPremium ? '👑 Premium' : isPro ? '⭐ Pro' : 'Free Tier'}
                </div>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-brand-100 text-brand-600 shadow-sm'
                    : 'text-ink hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white ml-auto">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}

            <Link
              to="/profile"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                isActive('/profile')
                  ? 'bg-brand-100 text-brand-600 shadow-sm'
                  : 'text-ink hover:bg-gray-100'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-brand-200 flex items-center justify-center">
                <span className="text-[10px] font-black text-brand-600">{user.username[0].toUpperCase()}</span>
              </div>
              <span>Profile</span>
            </Link>
          </div>

          {/* Logout & Language */}
          <div className="p-4 border-t-2 border-gray-100 space-y-2 bg-gray-50">
            <div className="flex items-center justify-between px-4 py-3 rounded-xl">
              <span className="text-sm font-semibold text-slate">Language</span>
              <LanguageSwitcher />
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-danger hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
