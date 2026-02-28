import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useSound } from '../hooks/useSound';

const PublicHeader = () => {
    const { t } = useTranslation();
    const [scrolled, setScrolled] = useState(false);
    const { playClickSound } = useSound();

    useEffect(() => {
        const handleScroll = () => {
            // Trigger header faster - show white bg at 100px scroll
            setScrolled(window.scrollY > 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToPricing = (e) => {
        e.preventDefault();
        const pricingElement = document.getElementById('pricing');

        // If pricing section exists on current page, scroll to it
        if (pricingElement) {
            pricingElement.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Otherwise navigate to home and scroll to pricing
            window.location.href = '/#pricing';
        }
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-white border-b-2 border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] py-1 sm:py-2'
                : 'bg-transparent py-4 sm:py-6'
                }`}
        >
            <div className="max-w-[72rem] mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-14 sm:h-16">
                    {/* Refined Upwork-style logo sizing */}
                    <Link to="/" className="flex items-center gap-2">
                        <span className={`text-xl sm:text-2xl font-black tracking-tight transition-colors duration-300 ${scrolled ? 'text-brand-500' : 'text-slate-800'}`}>
                            floraquiz<span className={scrolled ? 'text-brand-300' : 'text-brand-500'}>.</span>
                        </span>
                    </Link>

                    {/* Desktop Right */}
                    <div className="hidden md:flex items-center gap-4 lg:gap-8">
                        {/* Pricing link - hide when scrolled (when login buttons appear) */}
                        <div className={`flex items-center gap-6 font-bold text-sm tracking-wide transition-all duration-300 ${scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                            <a href="#pricing" onClick={scrollToPricing} className="hover:text-brand-500 transition-colors cursor-pointer text-slate-500">
                                Pricing
                            </a>
                        </div>

                        <LanguageSwitcher />

                        <div className={`flex items-center gap-3 transition-all duration-300 ${scrolled ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
                            <Link
                                to="/login"
                                className="text-slate-400 hover:text-slate-600 font-bold uppercase text-sm transition-colors py-2 px-4"
                            >
                                {t('auth.login', 'LOG IN')}
                            </Link>
                            <Link to="/signup" className="btn-primary text-sm py-2 px-6" onClick={playClickSound}>
                                {t('landing.nav.getStarted', 'GET STARTED')}
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Right */}
                    <div className="md:hidden flex items-center gap-4">
                        <div className="flex items-center gap-4 font-bold text-sm">
                            <a href="#pricing" onClick={scrollToPricing} className={`hover:text-brand-500 transition-colors cursor-pointer ${scrolled ? 'text-slate-600' : 'text-slate-500'}`}>
                                Pricing
                            </a>
                        </div>
                        <LanguageSwitcher />
                        <div className={`transition-all duration-300 flex items-center ${scrolled ? 'opacity-100 scale-100 w-auto' : 'opacity-0 scale-95 pointer-events-none w-0 overflow-hidden'}`}>
                            <Link to="/signup" className="btn-primary text-xs py-2 px-4 whitespace-nowrap border-none" onClick={playClickSound}>
                                {t('landing.nav.getStarted', 'GET STARTED')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default PublicHeader;
