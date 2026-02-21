import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// High-quality placeholder images for the students/professionals
const CAROUSEL_DATA = [
    {
        id: 1,
        name: 'Sophia Brown',
        role: 'Teacher',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        color: 'bg-orange-500',
    },
    {
        id: 2,
        name: 'Natalie Ramirez',
        role: 'Software Engineer',
        image: 'https://images.unsplash.com/photo-1531123897727-8f129e1eb7ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        color: 'bg-blue-500',
    },
    {
        id: 3,
        name: 'James Whitman',
        role: 'Researcher',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        color: 'bg-purple-500',
    },
    {
        id: 4,
        name: 'David Chen',
        role: 'Medical Student',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        color: 'bg-green-500',
    },
    {
        id: 5,
        name: 'Aisha Patel',
        role: 'Product Designer',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        color: 'bg-pink-500',
    }
];

// Helper to determine active, previous, and next positions
const getCardPositions = (activeIndex, total) => {
    const prev = (activeIndex - 1 + total) % total;
    const next = (activeIndex + 1) % total;
    return { prev, next };
};

const LiquidGlassCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    // Auto-advance loop
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((current) => (current + 1) % CAROUSEL_DATA.length);
        }, 3500); // Wait 3.5 seconds before transitioning
        return () => clearInterval(timer);
    }, []);

    const total = CAROUSEL_DATA.length;
    const { prev, next } = getCardPositions(activeIndex, total);

    // Framer Motion variants for 3D depth and positioning
    const cardVariants = {
        active: {
            x: 0,
            scale: 1.1,
            zIndex: 30,
            filter: 'blur(0px)',
            opacity: 1,
            transition: { type: 'spring', stiffness: 200, damping: 20 }
        },
        prev: {
            x: '-60%',
            scale: 0.85,
            zIndex: 20,
            filter: 'blur(1px)',
            opacity: 0.7,
            transition: { type: 'spring', stiffness: 200, damping: 20 }
        },
        next: {
            x: '60%',
            scale: 0.85,
            zIndex: 20,
            filter: 'blur(1px)',
            opacity: 0.7,
            transition: { type: 'spring', stiffness: 200, damping: 20 }
        },
        hiddenLeft: {
            x: '-80%',
            scale: 0.7,
            zIndex: 10,
            filter: 'blur(4px)',
            opacity: 0,
            transition: { type: 'spring', stiffness: 200, damping: 20 }
        },
        hiddenRight: {
            x: '80%',
            scale: 0.7,
            zIndex: 10,
            filter: 'blur(4px)',
            opacity: 0,
            transition: { type: 'spring', stiffness: 200, damping: 20 }
        }
    };

    const getVariant = (index) => {
        if (index === activeIndex) return 'active';
        if (index === prev) return 'prev';
        if (index === next) return 'next';

        // For off-screen cards, decide if they hide to the left or right
        // Simple logic: if it's right before 'prev', hide left. Else hide right.
        const beforePrev = (prev - 1 + total) % total;
        if (index === beforePrev) return 'hiddenLeft';
        return 'hiddenRight';
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto h-[350px] sm:h-[450px] flex items-center justify-center overflow-visible mt-12 mb-10 pt-4 px-4 sm:px-0 pointer-events-none">
            <AnimatePresence initial={false}>
                {CAROUSEL_DATA.map((item, index) => {
                    const variant = getVariant(index);
                    const isActive = variant === 'active';

                    return (
                        <motion.div
                            key={item.id}
                            variants={cardVariants}
                            animate={variant}
                            initial="hiddenRight"
                            className="absolute w-56 sm:w-64 h-72 sm:h-80 rounded-[2rem] overflow-hidden shadow-2xl"
                            style={{
                                // Enhanced shadow for the active card
                                boxShadow: isActive
                                    ? '0 30px 60px -12px rgba(0, 0, 0, 0.25), 0 18px 36px -18px rgba(0, 0, 0, 0.15)'
                                    : '0 10px 30px -10px rgba(0,0,0,0.1)'
                            }}
                        >
                            {/* Background Image Container */}
                            <div className="absolute inset-0 bg-slate-200">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Top Gradient for subtle contrast near edges */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent pointer-events-none" />

                            {/* LIQUID GLASS OVERLAY (Lower Third) */}
                            <div className="absolute bottom-0 left-0 right-0 h-1/2 flex flex-col justify-end p-5 pt-10">
                                {/* The heavy blur / refraction shield */}
                                <div
                                    className="absolute inset-x-0 bottom-0 h-full backdrop-blur-xl bg-white/10 dark:bg-black/10 transition-colors duration-500"
                                    style={{
                                        // Safari compatibility for heavy blur
                                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                                        maskImage: 'linear-gradient(to bottom, transparent, black 30%)',
                                        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%)',
                                    }}
                                />

                                {/* Text Content - Positioned absolutely inside the glass area to remain crisp */}
                                <div className="relative z-10 text-center transform translate-y-1">
                                    <h3 className="text-white text-xl sm:text-2xl font-black tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                                        {item.name}
                                    </h3>
                                    <p className="text-white/90 text-sm sm:text-base font-semibold tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                                        {item.role}
                                    </p>
                                </div>
                            </div>

                            {/* Soft Inner Border to accentuate the glass feeling */}
                            <div className="absolute inset-0 border border-white/20 rounded-[2rem] pointer-events-none z-20" />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default LiquidGlassCarousel;
