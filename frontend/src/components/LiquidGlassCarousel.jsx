import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// High-quality placeholder images matching the gamified aesthetic (flat backgrounds/characters)
const CAROUSEL_DATA = [
    {
        id: 1,
        name: 'Sophia',
        role: 'Spanish Learner',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 2,
        name: 'Natalie',
        role: 'Med Student',
        image: 'https://images.unsplash.com/photo-1531123897727-8f129e1eb7ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 3,
        name: 'James',
        role: 'History Buff',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 4,
        name: 'David',
        role: 'Biology Pro',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 5,
        name: 'Aisha',
        role: 'Math whiz',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    }
];

const FlashcardCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(1);
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
    const cardWidth = 300;
    const offset = 160;

    const getCardProps = (index) => {
        let diff = index - activeIndex;
        // Adjust for seamless wrapping
        if (diff > Math.floor(total / 2)) diff -= total;
        if (diff < -Math.floor(total / 2)) diff += total;

        const isCenter = diff === 0;
        const isLeft = diff === -1;
        const isRight = diff === 1;

        // Visual properties based on position (Flat Gamified Style)
        let x = 0;
        let scale = 0.9;
        let zIndex = 10 - Math.abs(diff);
        let opacity = 1;

        if (isCenter) {
            x = 0;
            scale = 1;
            zIndex = 30;
        } else if (isLeft) {
            x = -offset;
            scale = 0.85;
            zIndex = 20;
        } else if (isRight) {
            x = offset;
            scale = 0.85;
            zIndex = 20;
        } else {
            // Hide cards that are further away
            x = diff < 0 ? -(offset * 1.5) : (offset * 1.5);
            scale = 0.7;
            opacity = 0;
            zIndex = 0;
        }

        return { x, scale, zIndex, opacity, isCenter };
    };

    // Snappy Apple-esque spring matching Duolingo's quick UI bounces
    const springConfig = { type: "spring", stiffness: 400, damping: 25, mass: 1 };

    return (
        <div
            className="relative w-full overflow-hidden py-16 flex items-center justify-center select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative w-full max-w-4xl h-[400px] flex items-center justify-center">
                <AnimatePresence initial={false}>
                    {CAROUSEL_DATA.map((item, index) => {
                        const { x, scale, zIndex, opacity, isCenter } = getCardProps(index);

                        return (
                            <motion.div
                                key={item.id}
                                className="absolute cursor-grab active:cursor-grabbing origin-center flex flex-col bg-white"
                                animate={{
                                    x,
                                    scale,
                                    zIndex,
                                    opacity,
                                }}
                                transition={springConfig}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDragEnd={handleDragEnd}
                                onClick={() => !isCenter && setActiveIndex(index)}
                                style={{
                                    width: cardWidth,
                                    height: 380,
                                    borderRadius: '1.5rem',
                                    border: '2px solid #e2e8f0',
                                    borderBottomWidth: '6px',
                                    borderBottomColor: '#cbd5e1',
                                    // Remove extreme shadow for a flat card
                                    boxShadow: isCenter ? '0 10px 25px -5px rgba(0, 0, 0, 0.05)' : 'none',
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Image Half */}
                                <motion.div
                                    className="w-full h-2/3 bg-slate-100 border-b-2 border-slate-200"
                                    animate={{
                                        scale: isCenter ? 1 : 1.05
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        draggable="false"
                                    />
                                </motion.div>

                                {/* Text/Flat Info Block */}
                                <div className="w-full h-1/3 flex flex-col items-center justify-center bg-white px-4">
                                    <h3 className="text-ink text-xl font-black mb-1">
                                        {item.name}
                                    </h3>
                                    <p className="text-brand-500 text-sm font-bold uppercase tracking-wide">
                                        {item.role}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FlashcardCarousel;
