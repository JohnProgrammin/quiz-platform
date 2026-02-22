import { useCallback } from 'react';

/**
 * Reusable React Hook for playing an audio click sound effect.
 * Uses the Web Audio API to generate a clean, gamified "pop" sound
 * dynamically without needing external MP3 files.
 */
export const useSound = () => {
    const playClickSound = useCallback(() => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            // Pleasant short gamified "pop" sound
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.08);
        } catch (error) {
            console.warn('Audio playback not supported:', error);
        }
    }, []);

    return { playClickSound };
};

export default useSound;
