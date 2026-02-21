import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../contexts/SubscriptionContext';
import {
    Home, FileText, BarChart3, Sparkles,
    LogOut, Crown, ChevronLeft, ChevronRight, User, Zap, Globe
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

function DashboardLayout({ user, onLogout, children }) {
    const { t } = useTranslation();
    const location = useLocation();
    const [expanded, setExpanded] = useState(false);
    const { tier, isPro, isPremium } = useSubscription();

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const navItems = [
        { path: '/dashboard', icon: Home, label: t('navbar.home') },
        { path: '/notes', icon: FileText, label: t('navbar.notes') },
        { path: '/analytics', icon: BarChart3, label: t('navbar.analytics') },
        ...(isPremium ? [{
            path: '/teaching',
            icon: Sparkles,
            label: t('navbar.aiTeaching'),
            badge: '✨'
        }] : []),
    ];

    const userInitial = user?.username?.[0]?.toUpperCase() || '?';

    return (
        <div className="sidebar-layout">
            {/* ── Desktop Sidebar ── */}
            <aside className={`sidebar ${expanded ? 'sidebar-expanded' : ''}`}>
                {/* Logo */}
                <Link
                    to="/dashboard"
                    className="flex items-center gap-3 mb-8 no-underline"
                    style={{ width: expanded ? '100%' : '56px', justifyContent: expanded ? 'flex-start' : 'center' }}
                >
                    <div className="w-12 h-12 rounded-2xl bg-brand-400 flex items-center justify-center flex-shrink-0"
                        style={{ boxShadow: '0 4px 0 #4CAD00' }}>
                        <span className="text-xl font-black text-white">Q</span>
                    </div>
                    {expanded && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-xl font-black text-white tracking-tight"
                        >
                            floraquiz
                        </motion.span>
                    )}
                </Link>

                {/* Navigation Items */}
                <nav className="flex-1 flex flex-col gap-2 w-full">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={expanded ? `sidebar-nav-item-expanded ${isActive(item.path) ? 'active' : ''}` : `sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
                            title={!expanded ? item.label : undefined}
                        >
                            <item.icon className="w-6 h-6 flex-shrink-0" />
                            {expanded && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.05 }}
                                >
                                    {item.label}
                                </motion.span>
                            )}
                            {expanded && item.badge && (
                                <span className="ml-auto text-xs">{item.badge}</span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Expand/Collapse Toggle */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="sidebar-nav-item mt-4 hover:bg-white/10"
                    style={{ width: expanded ? '100%' : undefined, justifyContent: expanded ? 'flex-end' : 'center' }}
                >
                    {expanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>

                {/* Language Switcher */}
                <div className="mt-2 w-full flex justify-center">
                    <LanguageSwitcher inSidebar={expanded} />
                </div>

                {/* User Section */}
                <div className="mt-4 w-full">
                    <Link
                        to="/profile"
                        className={expanded
                            ? `sidebar-nav-item-expanded ${isActive('/profile') ? 'active' : ''}`
                            : `sidebar-nav-item ${isActive('/profile') ? 'active' : ''}`}
                        title={!expanded ? user?.username : undefined}
                    >
                        <div className="w-9 h-9 rounded-full bg-brand-400 flex items-center justify-center flex-shrink-0 relative">
                            <span className="text-sm font-black text-white">{userInitial}</span>
                            {(isPro || isPremium) && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold flex items-center justify-center">
                                    <Crown className="w-2.5 h-2.5 text-owl-dark" />
                                </div>
                            )}
                        </div>
                        {expanded && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="min-w-0 flex-1"
                            >
                                <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                                <p className="text-xs text-muted">
                                    {isPremium ? '👑 Premium' : isPro ? '⭐ Pro' : 'Free'}
                                </p>
                            </motion.div>
                        )}
                    </Link>

                    {/* Logout */}
                    <button
                        onClick={onLogout}
                        className={expanded
                            ? 'sidebar-nav-item-expanded text-heart hover:bg-heart/10 mt-1'
                            : 'sidebar-nav-item text-heart hover:bg-heart/10 mt-1'}
                        title={!expanded ? t('navbar.logout') : undefined}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {expanded && <span>{t('navbar.logout')}</span>}
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className={`sidebar-content main-content ${expanded ? 'sidebar-expanded-content' : ''}`}>

                {/* Global Glowing Background Elements */}
                <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-400 rounded-full blur-[120px] opacity-[0.08]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600 rounded-full blur-[150px] opacity-[0.05]" />
                    <div className="absolute top-[40%] left-[60%] w-[20%] h-[20%] bg-amber-400 rounded-full blur-[100px] opacity-[0.04]" />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* ── Mobile Bottom Tab Bar ── */}
            <div className="mobile-tab-bar">
                {navItems.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`mobile-tab-item ${isActive(item.path) ? 'active' : ''}`}
                    >
                        <item.icon className="w-6 h-6" />
                        <span>{item.label}</span>
                    </Link>
                ))}
                <Link
                    to="/profile"
                    className={`mobile-tab-item ${isActive('/profile') ? 'active' : ''}`}
                >
                    <User className="w-6 h-6" />
                    <span>{t('navbar.profile')}</span>
                </Link>
                {/* Language toggle in mobile bar */}
                <div className="mobile-tab-item relative">
                    <LanguageSwitcher inSidebar={false} upwards={true} />
                    <span className="text-[10px] font-black mt-0.5 opacity-70">{t('navbar.language')}</span>
                </div>

                {/* Mobile Sign Out */}
                <button
                    onClick={onLogout}
                    className="mobile-tab-item text-danger/70 hover:text-danger active:text-danger"
                >
                    <LogOut className="w-6 h-6" />
                    <span>{t('auth.signout')}</span>
                </button>
            </div>
        </div>
    );
}

export default DashboardLayout;
