class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Preload' });
    }

    preload() {
        this.load.image('surfer_idle',   'assets/surfer1.png');
        this.load.image('surfer_crouch', 'assets/surfer2.png');
        this.load.image('shark_img',     'assets/shark.png');
        this.load.audio('bgmusic',   'assets/Sonic The Hedgehog OST - Green Hill Zone.mp3');
        this.load.audio('drowning', 'assets/Sonic 1 Music_ Drowning.mp3');
    }

    create() {
        const W = 800;
        const H = 400;

        // Show loading bar background
        const barBg = this.add.rectangle(W / 2, H / 2, 400, 30, 0x003366);
        const bar = this.add.rectangle(W / 2 - 200, H / 2, 0, 26, 0x00aaff);
        bar.setOrigin(0, 0.5);
        const loadText = this.add.text(W / 2, H / 2 - 30, 'Loading...', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        const steps = 5;
        let step = 0;
        const advance = () => {
            step++;
            bar.width = (step / steps) * 400;
        };

        // ── Sky texture (800x400) ──────────────────────────────────────────────
        const skyGfx = this.make.graphics({ add: false });
        skyGfx.fillStyle(0x87ceeb); // light blue top
        skyGfx.fillRect(0, 0, 800, 200);
        skyGfx.fillStyle(0x4aa8d8); // slightly deeper blue lower sky
        skyGfx.fillRect(0, 200, 800, 200);
        // Sun
        skyGfx.fillStyle(0xfffaaa);
        skyGfx.fillCircle(100, 60, 35);
        skyGfx.fillStyle(0xffee44);
        skyGfx.fillCircle(100, 60, 25);
        // Clouds
        skyGfx.fillStyle(0xffffff, 0.9);
        skyGfx.fillEllipse(250, 70, 100, 40);
        skyGfx.fillEllipse(290, 60, 80, 35);
        skyGfx.fillEllipse(220, 65, 70, 30);
        skyGfx.fillEllipse(600, 90, 110, 40);
        skyGfx.fillEllipse(640, 80, 80, 35);
        skyGfx.fillEllipse(570, 85, 70, 30);
        skyGfx.generateTexture('sky', 800, 400);
        skyGfx.destroy();
        advance();

        // ── Ocean texture (800x400) ─────────────────────────────────────────────
        const oceanGfx = this.make.graphics({ add: false });
        oceanGfx.fillStyle(0x1a5f9e);
        oceanGfx.fillRect(0, 0, 800, 400);
        // Subtle depth gradient bands
        oceanGfx.fillStyle(0x1e6aaa, 0.5);
        oceanGfx.fillRect(0, 100, 800, 80);
        oceanGfx.fillStyle(0x145090, 0.4);
        oceanGfx.fillRect(0, 280, 800, 120);
        oceanGfx.generateTexture('ocean', 800, 400);
        oceanGfx.destroy();
        advance();

        // ── Wave texture (800x400) ──────────────────────────────────────────────
        const waveGfx = this.make.graphics({ add: false });
        waveGfx.fillStyle(0x1a5f9e);
        waveGfx.fillRect(0, 0, 800, 400);
        // Wave lines
        const waveColors = [0x5bbfea, 0x4aaad4, 0x3d98c0, 0x2e7faa];
        for (let wi = 0; wi < 12; wi++) {
            const wy = 30 + wi * 32;
            const col = waveColors[wi % waveColors.length];
            waveGfx.lineStyle(3, col, 0.7);
            waveGfx.beginPath();
            for (let x = 0; x <= 800; x += 5) {
                const yy = wy + Math.sin((x / 800) * Math.PI * 6 + wi) * 8;
                if (x === 0) waveGfx.moveTo(x, yy);
                else waveGfx.lineTo(x, yy);
            }
            waveGfx.strokePath();
        }
        // Foam highlights
        waveGfx.lineStyle(2, 0xffffff, 0.35);
        for (let wi = 0; wi < 8; wi++) {
            const wy = 15 + wi * 48;
            waveGfx.beginPath();
            for (let x = 0; x <= 800; x += 5) {
                const yy = wy + Math.sin((x / 800) * Math.PI * 4 + wi * 0.7) * 5;
                if (x === 0) waveGfx.moveTo(x, yy);
                else waveGfx.lineTo(x, yy);
            }
            waveGfx.strokePath();
        }
        waveGfx.generateTexture('wave', 800, 400);
        waveGfx.destroy();
        advance();


        // ── Rock texture (50x40) ────────────────────────────────────────────────
        const rockGfx = this.make.graphics({ add: false });
        rockGfx.fillStyle(0x555566);
        rockGfx.fillPoints([
            { x: 10, y: 38 },
            { x: 2,  y: 22 },
            { x: 8,  y: 10 },
            { x: 20, y: 4  },
            { x: 34, y: 2  },
            { x: 44, y: 10 },
            { x: 48, y: 24 },
            { x: 40, y: 36 },
            { x: 25, y: 40 },
        ], true);
        // Highlight
        rockGfx.fillStyle(0x777788);
        rockGfx.fillPoints([
            { x: 14, y: 22 },
            { x: 18, y: 8  },
            { x: 28, y: 6  },
            { x: 36, y: 14 },
            { x: 28, y: 20 },
        ], true);
        // Dark crack
        rockGfx.lineStyle(1, 0x333344, 1);
        rockGfx.beginPath();
        rockGfx.moveTo(20, 10);
        rockGfx.lineTo(25, 22);
        rockGfx.lineTo(30, 28);
        rockGfx.strokePath();
        rockGfx.generateTexture('rock', 50, 40);
        rockGfx.destroy();
        advance();


        // ── Heart texture (24x24) ───────────────────────────────────────────────
        const heartGfx = this.make.graphics({ add: false });
        heartGfx.fillStyle(0xff2244);
        heartGfx.fillCircle(7, 8, 7);
        heartGfx.fillCircle(17, 8, 7);
        heartGfx.fillTriangle(1, 11, 23, 11, 12, 23);
        // Shine
        heartGfx.fillStyle(0xff88aa, 0.7);
        heartGfx.fillCircle(8, 6, 3);
        heartGfx.generateTexture('heart', 24, 24);
        heartGfx.destroy();
        advance();

        // ── Particle texture (8x8) ──────────────────────────────────────────────
        const particleGfx = this.make.graphics({ add: false });
        particleGfx.fillStyle(0xffffff, 1);
        particleGfx.fillCircle(4, 4, 4);
        particleGfx.generateTexture('particle', 8, 8);
        particleGfx.destroy();

        // ── Water splash particle (8x8, blue) ──────────────────────────────────
        const splashGfx = this.make.graphics({ add: false });
        splashGfx.fillStyle(0x44aaff, 1);
        splashGfx.fillCircle(4, 4, 4);
        splashGfx.generateTexture('splash', 8, 8);
        splashGfx.destroy();

        // All done — go to Menu
        loadText.setText('Ready!');
        bar.width = 400;
        this.time.delayedCall(200, () => {
            this.scene.start('Menu');
        });
    }
}
