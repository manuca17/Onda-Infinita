class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOver' });
    }

    create() {
        const W = 800;
        const H = 400;

        // ── Retrieve score from scene data ─────────────────────────────────────
        const finalScore = this.scene.settings.data?.score ?? 0;

        // ── Best score (localStorage) ──────────────────────────────────────────
        const prevBest = parseInt(localStorage.getItem('surforsink_best') || '0', 10);
        const newBest  = Math.max(finalScore, prevBest);
        if (finalScore > prevBest) {
            localStorage.setItem('surforsink_best', String(newBest));
        }
        const isNewBest = finalScore > prevBest && finalScore > 0;

        // ── Background ─────────────────────────────────────────────────────────
        // Darkened ocean background (draw a simple gradient-like rectangle)
        this.add.rectangle(W / 2, H / 2, W, H, 0x081830);

        // Wave stripes for atmosphere
        const g = this.add.graphics();
        g.lineStyle(2, 0x1a4a88, 0.4);
        for (let y = 20; y < H; y += 28) {
            g.beginPath();
            for (let x = 0; x <= W; x += 5) {
                const wy = y + Math.sin((x / W) * Math.PI * 5 + y * 0.05) * 6;
                if (x === 0) g.moveTo(x, wy);
                else g.lineTo(x, wy);
            }
            g.strokePath();
        }

        // ── Game Over title ────────────────────────────────────────────────────
        const titleTxt = this.add.text(W / 2, 60, window.t('gameover'), {
            fontSize: '52px',
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ff4455',
            stroke: '#330011',
            strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 6, fill: true }
        }).setOrigin(0.5);

        // Slight shake animation for the title
        this.tweens.add({
            targets: titleTxt,
            x: W / 2 + 4,
            duration: 80,
            yoyo: true,
            repeat: 3,
            ease: 'Sine.easeInOut'
        });

        // ── Score display ──────────────────────────────────────────────────────
        this.add.text(W / 2, 150, window.t('score') + ': ' + finalScore, {
            fontSize: '32px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            stroke: '#003366',
            strokeThickness: 4
        }).setOrigin(0.5);

        // ── Best score ─────────────────────────────────────────────────────────
        const bestLabel = isNewBest
            ? '🏆 ' + window.t('best') + ': ' + newBest + ' ★'
            : window.t('best') + ': ' + newBest;

        const bestTxt = this.add.text(W / 2, 200, bestLabel, {
            fontSize: '22px',
            fontFamily: 'Arial',
            fill: isNewBest ? '#ffe44d' : '#aaddff',
            stroke: '#002244',
            strokeThickness: 3
        }).setOrigin(0.5);

        if (isNewBest) {
            this.tweens.add({
                targets: bestTxt,
                scaleX: 1.08,
                scaleY: 1.08,
                duration: 600,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // ── Restart button ─────────────────────────────────────────────────────
        const restartBg = this.add.rectangle(W / 2 - 115, 285, 200, 50, 0x22cc55)
            .setStrokeStyle(3, 0x009933)
            .setInteractive({ useHandCursor: true });

        const restartTxt = this.add.text(W / 2 - 115, 285, window.t('restart'), {
            fontSize: '20px',
            fontFamily: 'Arial Black, Arial',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#006622',
            strokeThickness: 3
        }).setOrigin(0.5);

        restartBg.on('pointerover', () => {
            restartBg.setFillStyle(0x33dd66);
            this.tweens.add({ targets: [restartBg, restartTxt], scaleX: 1.05, scaleY: 1.05, duration: 80 });
        });
        restartBg.on('pointerout', () => {
            restartBg.setFillStyle(0x22cc55);
            this.tweens.add({ targets: [restartBg, restartTxt], scaleX: 1, scaleY: 1, duration: 80 });
        });
        restartBg.on('pointerdown', () => this.restartGame());

        // ── Menu button ────────────────────────────────────────────────────────
        const menuBg = this.add.rectangle(W / 2 + 115, 285, 160, 50, 0x2255aa)
            .setStrokeStyle(3, 0x003388)
            .setInteractive({ useHandCursor: true });

        const menuTxt = this.add.text(W / 2 + 115, 285, window.t('menu'), {
            fontSize: '20px',
            fontFamily: 'Arial Black, Arial',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#001144',
            strokeThickness: 3
        }).setOrigin(0.5);

        menuBg.on('pointerover', () => {
            menuBg.setFillStyle(0x3366cc);
            this.tweens.add({ targets: [menuBg, menuTxt], scaleX: 1.05, scaleY: 1.05, duration: 80 });
        });
        menuBg.on('pointerout', () => {
            menuBg.setFillStyle(0x2255aa);
            this.tweens.add({ targets: [menuBg, menuTxt], scaleX: 1, scaleY: 1, duration: 80 });
        });
        menuBg.on('pointerdown', () => this.goMenu());

        // ── R key to restart ───────────────────────────────────────────────────
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        // ── Camera fade in ─────────────────────────────────────────────────────
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    restartGame() {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('Game');
        });
    }

    goMenu() {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('Menu');
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.restartGame();
        }
    }
}
