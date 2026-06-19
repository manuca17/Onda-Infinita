// Global music volume (persisted)
window.musicVolume = parseFloat(localStorage.getItem('surforsink_volume') ?? '0.5');

// Coin wallet (persisted)
window.coins = parseInt(localStorage.getItem('surforsink_coins') || '0', 10);
window.saveCoins = function() { localStorage.setItem('surforsink_coins', String(window.coins)); };

// Shop boosts (single-use, consumed at run start)
window.shopBoosts = JSON.parse(localStorage.getItem('surforsink_boosts') || '{}');
window.saveBoosts = function() { localStorage.setItem('surforsink_boosts', JSON.stringify(window.shopBoosts)); };

// Global language and translation system
window.currentLang = 'pt';
window.locales = {};
window.t = function(key) {
    return window.locales[window.currentLang]?.[key] || key;
};

// Global AudioContext for sound effects
window.audioCtx = null;

function initAudio() {
    if (!window.audioCtx) {
        window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

window.playHitSound = function() {
    initAudio();
    const ctx = window.audioCtx;
    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch(e) {
        // ignore audio errors
    }
};

window.playGameOverSound = function() {
    initAudio();
    const ctx = window.audioCtx;
    try {
        const notes = [400, 300, 200, 150];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.2);
            osc.start(ctx.currentTime + i * 0.2);
            osc.stop(ctx.currentTime + i * 0.2 + 0.2);
        });
    } catch(e) {
        // ignore audio errors
    }
};

window.playJumpSound = function() {
    initAudio();
    const ctx = window.audioCtx;
    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    } catch(e) {
        // ignore audio errors
    }
};

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 400,
    backgroundColor: '#1a6fa8',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, PreloadScene, MenuScene, GameScene, GameOverScene, ShopScene]
};

const game = new Phaser.Game(config);
