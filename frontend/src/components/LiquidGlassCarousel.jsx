import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// High-quality placeholder images matching the professional aesthetic requested
const CAROUSEL_DATA = [
    {
        id: 1,
        name: 'Sophia Brown',
        role: 'Teacher',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 2,
        name: 'Natalie Ramirez',
        role: 'Software Engineer',
        image: 'https://images.unsplash.com/photo-1531123897727-8f129e1eb7ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 3,
        name: 'James Whitman',
        role: 'Researcher',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 4,
        name: 'David Chen',
        role: 'Medical Student',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 5,
        name: 'Aisha Patel',
        role: 'Product Designer',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    }
];

const LiquidGlassCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(1); // Start with the second item active
    const [isHovered, setIsHovered] = useState(false);

    // Auto-advance loop, pauses on hover
    useEffect(() => {
        if (isHovered) return;
        const timer = setInterval(() => {
            setActiveIndex((current) => (current + 1) % CAROUSEL_DATA.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [isHovered]);

    const handleNext = () => {
        setActiveIndex((current) => (current + 1) % CAROUSEL_DATA.length);
    };

    const handlePrev = () => {
        setActiveIndex((current) => (current - 1 + CAROUSEL_DATA.length) % CAROUSEL_DATA.length);
    };

    const handleDragEnd = (event, info) => {
        const threshold = 50;
        if (info.offset.x > threshold) {
            handlePrev();
        } else if (info.offset.x < -threshold) {
            handleNext();
        }
    };

    const total = CAROUSEL_DATA.length;

    // Layout Calculation Constants
    const cardWidth = 320;
    const offset = 180;

    const getCardProps = (index) => {
        // Calculate relative position to active index
        let diff = index - activeIndex;
        // Adjust for seamless wrapping
        if (diff > Math.floor(total / 2)) diff -= total;
        if (diff < -Math.floor(total / 2)) diff += total;

        const isCenter = diff === 0;
        const isLeft = diff === -1;
        const isRight = diff === 1;

        // Visual properties based on position
        let x = 0;
        let scale = 0.85;
        let zIndex = 10 - Math.abs(diff);
        let opacity = 1;
        let brightness = 1;

        if (isCenter) {
            x = 0;
            scale = 1.05;
            zIndex = 30;
            brightness = 1;
        } else if (isLeft) {
            x = -offset;
            scale = 0.85;
            zIndex = 20;
            brightness = 0.6; // Darken flanking cards slightly to push focus to center
        } else if (isRight) {
            x = offset;
            scale = 0.85;
            zIndex = 20;
            brightness = 0.6;
        } else {
            // Hide cards that are further away
            x = diff < 0 ? -(offset * 1.5) : (offset * 1.5);
            scale = 0.7;
            opacity = 0;
            zIndex = 0;
        }

        return { x, scale, zIndex, opacity, brightness, isCenter };
    };

    // Spring physics configuration for Apple-like smoothness
    const springConfig = { type: "spring", stiffness: 300, damping: 30, mass: 1 };

    return (
        <div
            className="relative w-full overflow-hidden py-24 flex items-center justify-center select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Optional SVG Filter for advanced chromatic/liquid distortion (requires Firefox/Safari) - can be ignored by Chrome while standard blur works */}
            <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
                <filter id="liquid-distortion">
                    <feTurbulence type="fractalNoise" baseFrequency="0.01 0.02" numOctaves="1" result="noise" />
                    <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" in="noise" result="coloredNoise" />
                    <feDisplacementMap in="SourceGraphic" in2="coloredNoise" scale="10" xChannelSelector="R" yChannelSelector="G" result="displacement" />
                </filter>
            </svg>

            <div className="relative w-full max-w-4xl h-[400px] flex items-center justify-center perspective-1000">
                <AnimatePresence initial={false}>
                    {CAROUSEL_DATA.map((item, index) => {
                        const { x, scale, zIndex, opacity, brightness, isCenter } = getCardProps(index);

                        return (
                            <motion.div
                                key={item.id}
                                className="absolute cursor-grab active:cursor-grabbing origin-center"
                                animate={{
                                    x,
                                    scale,
                                    zIndex,
                                    opacity,
                                    filter: `brightness(${brightness})`,
                                }}
                                transition={springConfig}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDragEnd={handleDragEnd}
                                onClick={() => !isCenter && setActiveIndex(index)}
                                style={{
                                    width: cardWidth,
                                    height: 400,
                                    // Massive premium squircle rounding matching the reference
                                    borderRadius: '3rem',
                                    // Heavy 3D shadow for active card
                                    boxShadow: isCenter
                                        ? '0 30px 60px -12px rgba(0, 0, 0, 0.4), 0 18px 36px -18px rgba(0, 0, 0, 0.2)'
                                        : '0 10px 30px -10px rgba(0, 0, 0, 0.2)',
                                    overflow: 'hidden',
                                    backgroundColor: '#fff'
                                }}
                            >
                                {/* Background Image */}
                                <motion.div
                                    className="absolute inset-0 w-full h-full"
                                    animate={{
                                        scale: isCenter ? 1 : 1.1 // Slight inner scale shift
                                    }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        draggable="false"
                                    />
                                </motion.div>

                                {/* Premium Liquid Glass Layer */}
                                <div className="absolute bottom-0 left-0 w-full h-[45%] flex flex-col justify-end pb-8">
                                    {/* The glass refraction shield */}
                                    <div
                                        className="absolute inset-0 w-full h-full backdrop-blur-3xl bg-white/20 dark:bg-black/10"
                                        style={{
                                            // Extreme glassmorphism blur and saturation
                                            WebkitBackdropFilter: 'blur(30px) saturate(200%) contrast(120%)',
                                            // Optional Safari SVG filter reference
                                            // filter: 'url(#liquid-distortion)',
                                            // Soft gradient mask so the glass fades out seamlessly at the top
                                            maskImage: 'linear-gradient(to top, black 50%, transparent 100%)',
                                            WebkitMaskImage: 'linear-gradient(to top, black 50%, transparent 100%)',
                                        }}
                                    />

                                    {/* Top edge subtle highlight on the glass */}
                                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50" />

                                    {/* Subject Details */}
                                    <div className="relative z-10 w-full text-center px-4 transform translate-y-1">
                                        <h3 className="text-white text-2xl sm:text-3xl font-bold tracking-tight mb-1 drop-shadow-md">
                                            {item.name}
                                        </h3>
                                        <p className="text-white/90 text-sm sm:text-base font-medium tracking-wide drop-shadow-sm mix-blend-overlay">
                                            {item.role}
                                        </p>
                                    </div>
                                </div>

                                {/* Subtle inner border stroke (Apple hardware style) */}
                                <div className="absolute inset-0 rounded-[3rem] border border-white/20 pointer-events-none mix-blend-overlay" />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LiquidGlassCarousel;
