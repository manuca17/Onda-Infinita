class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Boot' });
    }

    create() {
        // Load both locale JSON files, store in window.locales, then start Preload
        Promise.all([
            fetch('./locales/pt.json').then(r => r.json()),
            fetch('./locales/en.json').then(r => r.json())
        ]).then(([ptData, enData]) => {
            window.locales['pt'] = ptData;
            window.locales['en'] = enData;
            this.scene.start('Preload');
        }).catch(err => {
            // Fallback: define minimal locales inline if fetch fails (e.g. opened as file://)
            console.warn('Could not fetch locale files, using inline fallback:', err);
            window.locales['pt'] = {
                title: 'Surfa ou Afunda',
                play: 'Jogar',
                score: 'Pontuação',
                lives: 'Vidas',
                gameover: 'Fim de Jogo',
                restart: 'Reiniciar (R)',
                lang_button: 'EN',
                instructions: 'Usa ↑↓ para surfar. Desvia das rochas e tubarões!',
                best: 'Melhor',
                pause: 'PAUSA',
                resume: 'Continuar',
                menu: 'Menu',
                go: 'JÁ!',
                tutorial_hint: 'Desvia rochas\ne tubarões!',
                combo: 'COMBO',
                pu_life: 'Vida Extra!',
                pu_shield: 'Invencível!',
                pu_slow: 'Câmara Lenta!'
            };
            window.locales['en'] = {
                title: 'Surf or Sink',
                play: 'Play',
                score: 'Score',
                lives: 'Lives',
                gameover: 'Game Over',
                restart: 'Restart (R)',
                lang_button: 'PT',
                instructions: 'Use ↑↓ to surf. Dodge rocks and sharks!',
                best: 'Best',
                pause: 'PAUSE',
                resume: 'Continue',
                menu: 'Menu',
                go: 'GO!',
                tutorial_hint: 'Dodge rocks\nand sharks!',
                combo: 'COMBO',
                pu_life: 'Extra Life!',
                pu_shield: 'Invincible!',
                pu_slow: 'Slow-Mo!'
            };
            this.scene.start('Preload');
        });
    }
}
