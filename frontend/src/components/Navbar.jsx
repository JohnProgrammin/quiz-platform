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
      <nav className={`bg-white border-b-2 border-border sticky top-0 z-50 transition-shadow duration-200 ${
        scrolled ? 'shadow-sm' : ''
      }`}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xl font-extrabold gradient-text tracking-tight">floraquiz</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    isActive(item.path)
                      ? 'bg-brand-50 text-brand-500'
                      : 'text-slate hover:text-ink hover:bg-surface'
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
            <div className="hidden md:flex items-center gap-2">
              <LanguageSwitcher />

              <Link
                to="/profile"
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm transition-all ${
                  isActive('/profile')
                    ? 'bg-brand-50 text-brand-500'
                    : 'text-slate hover:text-ink hover:bg-surface'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-warning flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-black text-white">{user.username[0].toUpperCase()}</span>
                </div>
                <span className="max-w-[120px] truncate">{user.username}</span>
                {(isPro || isPremium) && (
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                    isPremium ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' : 'bg-brand-500 text-white'
                  }`}>
                    {isPremium ? 'PREMIUM' : 'PRO'}
                  </span>
                )}
              </Link>

              <button
                onClick={onLogout}
                className="p-2 text-slate hover:text-danger hover:bg-red-50 rounded-xl transition-all"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-ink hover:bg-surface rounded-xl transition-all"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 mobile-menu-overlay md:hidden" />
      )}

      {/* Mobile menu panel */}
      <div
        ref={menuRef}
        className={`fixed top-14 right-0 w-72 max-w-[85vw] h-[calc(100vh-3.5rem)] bg-white border-l-2 border-border z-50 transform transition-transform duration-300 ease-out md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* User info */}
          <div className="p-5 border-b-2 border-border">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-warning flex items-center justify-center flex-shrink-0">
                <span className="text-base font-black text-white">{user.username[0].toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-ink truncate">{user.username}</div>
                <div className="text-sm font-semibold text-slate">
                  {isPremium ? '👑 Premium' : isPro ? '⭐ Pro' : 'Free Tier'}
                </div>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive(item.path)
                    ? 'bg-brand-50 text-brand-500'
                    : 'text-ink hover:bg-surface'
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                isActive('/profile')
                  ? 'bg-brand-50 text-brand-500'
                  : 'text-ink hover:bg-surface'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-slate flex items-center justify-center">
                <span className="text-[10px] font-black text-white">{user.username[0].toUpperCase()}</span>
              </div>
              <span>Profile</span>
            </Link>
          </div>

          {/* Logout & Language */}
          <div className="p-4 border-t-2 border-border space-y-2">
            <div className="flex items-center px-4 py-3 rounded-xl">
              <LanguageSwitcher />
              <span className="text-sm font-semibold text-slate ml-2">Change Language</span>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-danger hover:bg-red-50 transition-all"
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
