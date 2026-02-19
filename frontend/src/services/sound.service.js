export const soundService = {
    playTone: (freq, type, duration) => {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    },

    playSuccess: () => {
        // Ascending major arpeggio
        setTimeout(() => soundService.playTone(440, 'sine', 0.1), 0);
        setTimeout(() => soundService.playTone(554, 'sine', 0.1), 100);
        setTimeout(() => soundService.playTone(659, 'sine', 0.2), 200);
    },

    playError: () => {
        // Low descending
        setTimeout(() => soundService.playTone(150, 'sawtooth', 0.2), 0);
        setTimeout(() => soundService.playTone(100, 'sawtooth', 0.3), 150);
    },

    playClick: () => {
        soundService.playTone(800, 'sine', 0.05);
    },

    playCheck: () => {
        soundService.playTone(1200, 'sine', 0.1);
    },

    playComplete: () => {
        // Victory fanfare
        const now = 0;
        [523, 523, 523, 659, 783, 659, 783, 1046].forEach((freq, i) => {
            setTimeout(() => soundService.playTone(freq, 'square', 0.15), i * 150);
        });
    }
};
