class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Menu' });
    }

    create() {
        const W = 800;
        const H = 400;

        // ── Animated background ────────────────────────────────────────────────
        this.skyLayer   = this.add.tileSprite(W / 2, H / 2, W, H, 'sky');
        this.oceanLayer = this.add.tileSprite(W / 2, H / 2, W, H, 'ocean').setAlpha(0.85);
        this.waveLayer  = this.add.tileSprite(W / 2, H / 2, W, H, 'wave').setAlpha(0.9);

        // ── Title ──────────────────────────────────────────────────────────────
        this.titleText = this.add.text(W / 2, 80, window.t('title'), {
            fontSize: '52px',
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffe44d',
            stroke: '#003366',
            strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#001122', blur: 4, fill: true }
        }).setOrigin(0.5);

        // Subtle bounce tween for title
        this.tweens.add({
            targets: this.titleText,
            y: 86,
            duration: 1800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // ── Best score ─────────────────────────────────────────────────────────
        const best = parseInt(localStorage.getItem('surforsink_best') || '0', 10);
        this.bestText = this.add.text(W / 2, 138, window.t('best') + ': ' + best, {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#aaddff',
            stroke: '#003366',
            strokeThickness: 3
        }).setOrigin(0.5);

        // ── Play button ────────────────────────────────────────────────────────
        this.playBtnBg = this.add.rectangle(W / 2, 210, 200, 54, 0x22cc55, 1)
            .setStrokeStyle(3, 0x009933)
            .setInteractive({ useHandCursor: true });

        this.playBtnText = this.add.text(W / 2, 210, window.t('play'), {
            fontSize: '28px',
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#006622',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.playBtnBg.on('pointerover', () => {
            this.playBtnBg.setFillStyle(0x33dd66);
            this.tweens.add({ targets: [this.playBtnBg, this.playBtnText], scaleX: 1.05, scaleY: 1.05, duration: 100 });
        });
        this.playBtnBg.on('pointerout', () => {
            this.playBtnBg.setFillStyle(0x22cc55);
            this.tweens.add({ targets: [this.playBtnBg, this.playBtnText], scaleX: 1, scaleY: 1, duration: 100 });
        });
        this.playBtnBg.on('pointerdown', () => this.startGame());

        // ── Language toggle button ─────────────────────────────────────────────
        this.langBtnBg = this.add.rectangle(W - 50, 20, 60, 30, 0xffffff, 0.9)
            .setStrokeStyle(2, 0x003366)
            .setInteractive({ useHandCursor: true });

        this.langBtnText = this.add.text(W - 50, 20, window.t('lang_button'), {
            fontSize: '16px',
            fontFamily: 'Arial Black, Arial',
            fontStyle: 'bold',
            fill: '#003366'
        }).setOrigin(0.5);

        this.langBtnBg.on('pointerover', () => this.langBtnBg.setFillStyle(0xddeeff));
        this.langBtnBg.on('pointerout', () => this.langBtnBg.setFillStyle(0xffffff));
        this.langBtnBg.on('pointerdown', () => {
            window.currentLang = (window.currentLang === 'pt') ? 'en' : 'pt';
            this.refreshTexts();
        });

        // ── Instructions ───────────────────────────────────────────────────────
        this.instructionsText = this.add.text(W / 2, 290, window.t('instructions'), {
            fontSize: '15px',
            fontFamily: 'Arial',
            fill: '#cceeff',
            stroke: '#002244',
            strokeThickness: 2,
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5);

        // SPACE hint
        this.spaceText = this.add.text(W / 2, 340, '[ SPACE ]', {
            fontSize: '14px',
            fontFamily: 'Arial',
            fill: '#88bbdd',
            stroke: '#002244',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.tweens.add({
            targets: this.spaceText,
            alpha: 0.2,
            duration: 900,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // ── Keyboard ───────────────────────────────────────────────────────────
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // ── Camera fade in ─────────────────────────────────────────────────────
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    refreshTexts() {
        this.titleText.setText(window.t('title'));
        this.playBtnText.setText(window.t('play'));
        this.langBtnText.setText(window.t('lang_button'));
        this.instructionsText.setText(window.t('instructions'));
        const best = parseInt(localStorage.getItem('surforsink_best') || '0', 10);
        this.bestText.setText(window.t('best') + ': ' + best);
    }

    startGame() {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('Game');
        });
    }

    update() {
        // Scroll background layers at different speeds for parallax
        this.skyLayer.tilePositionX   += 0.3;
        this.oceanLayer.tilePositionX += 1.0;
        this.waveLayer.tilePositionX  += 2.0;

        // Check for SPACE to start
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.startGame();
        }
    }
}
