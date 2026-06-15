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

        // ── Background wave layer (800x400) — softer, for extra parallax depth ──
        const waveBackGfx = this.make.graphics({ add: false });
        waveBackGfx.fillStyle(0x1e6aaa, 0); // transparent base
        for (let wi = 0; wi < 7; wi++) {
            const wy = 60 + wi * 52;
            waveBackGfx.lineStyle(6, 0x6fc8ee, 0.22);
            waveBackGfx.beginPath();
            for (let x = 0; x <= 800; x += 6) {
                const yy = wy + Math.sin((x / 800) * Math.PI * 3 + wi * 0.9) * 12;
                if (x === 0) waveBackGfx.moveTo(x, yy);
                else waveBackGfx.lineTo(x, yy);
            }
            waveBackGfx.strokePath();
        }
        waveBackGfx.generateTexture('wave_back', 800, 400);
        waveBackGfx.destroy();

        // ── Star power-up (28x28) — invincibility ───────────────────────────────
        const starGfx = this.make.graphics({ add: false });
        const starPts = [];
        const cx = 14, cy = 15;
        for (let s = 0; s < 10; s++) {
            const r = (s % 2 === 0) ? 13 : 5.5;
            const ang = -Math.PI / 2 + s * Math.PI / 5;
            starPts.push({ x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r });
        }
        starGfx.fillStyle(0xffd23f);
        starGfx.fillPoints(starPts, true);
        starGfx.lineStyle(2, 0xff9900, 1);
        starGfx.strokePoints(starPts, true);
        starGfx.fillStyle(0xfff3b0, 0.8);
        starGfx.fillCircle(11, 11, 3);
        starGfx.generateTexture('star', 28, 30);
        starGfx.destroy();

        // ── Turtle power-up (40x30) — slow-motion ──────────────────────────────
        const turtleGfx = this.make.graphics({ add: false });
        // Flippers
        turtleGfx.fillStyle(0x2e8b57);
        turtleGfx.fillEllipse(9, 9, 12, 8);
        turtleGfx.fillEllipse(9, 23, 12, 8);
        turtleGfx.fillEllipse(31, 11, 11, 7);
        turtleGfx.fillEllipse(31, 21, 11, 7);
        // Head
        turtleGfx.fillStyle(0x3aa869);
        turtleGfx.fillCircle(35, 16, 5);
        // Shell
        turtleGfx.fillStyle(0x1f6b41);
        turtleGfx.fillEllipse(20, 16, 26, 22);
        turtleGfx.fillStyle(0x2e8b57);
        turtleGfx.fillEllipse(20, 16, 18, 14);
        // Shell pattern
        turtleGfx.lineStyle(1.5, 0x14512f, 1);
        turtleGfx.strokeEllipse(20, 16, 18, 14);
        turtleGfx.beginPath();
        turtleGfx.moveTo(20, 6); turtleGfx.lineTo(20, 26);
        turtleGfx.moveTo(11, 16); turtleGfx.lineTo(29, 16);
        turtleGfx.strokePath();
        // Eye
        turtleGfx.fillStyle(0x000000);
        turtleGfx.fillCircle(37, 14, 1.4);
        turtleGfx.generateTexture('turtle', 42, 32);
        turtleGfx.destroy();

        // ── Jellyfish obstacle (36x46) — medusa ────────────────────────────────
        const jellyGfx = this.make.graphics({ add: false });
        // Dome
        jellyGfx.fillStyle(0xd96fe0, 0.92);
        jellyGfx.slice(18, 18, 16, Math.PI, 0, true);
        jellyGfx.fillPath();
        jellyGfx.fillStyle(0xe89bf0, 0.9);
        jellyGfx.slice(18, 18, 16, Math.PI, 0, true);
        jellyGfx.fillPath();
        jellyGfx.fillStyle(0xc24fd0, 0.95);
        jellyGfx.fillRect(2, 17, 32, 4);
        // Highlight
        jellyGfx.fillStyle(0xffffff, 0.5);
        jellyGfx.fillEllipse(13, 11, 7, 5);
        // Tentacles
        jellyGfx.lineStyle(2, 0xc24fd0, 0.9);
        for (let t = 0; t < 5; t++) {
            const tx = 5 + t * 7;
            jellyGfx.beginPath();
            jellyGfx.moveTo(tx, 20);
            for (let yy = 20; yy <= 44; yy += 4) {
                const off = Math.sin((yy / 6) + t) * 3;
                jellyGfx.lineTo(tx + off, yy);
            }
            jellyGfx.strokePath();
        }
        jellyGfx.generateTexture('jellyfish', 36, 46);
        jellyGfx.destroy();

        // ── Boat obstacle (90x60) — barco ──────────────────────────────────────
        const boatGfx = this.make.graphics({ add: false });
        // Sail
        boatGfx.fillStyle(0xffffff, 0.95);
        boatGfx.fillTriangle(45, 4, 45, 38, 14, 38);
        boatGfx.fillStyle(0xff5566, 0.9);
        boatGfx.fillTriangle(49, 8, 49, 36, 74, 36);
        // Mast
        boatGfx.fillStyle(0x6b4423);
        boatGfx.fillRect(44, 4, 3, 36);
        // Hull
        boatGfx.fillStyle(0x8a4b1f);
        boatGfx.fillPoints([
            { x: 6,  y: 40 },
            { x: 84, y: 40 },
            { x: 74, y: 56 },
            { x: 16, y: 56 },
        ], true);
        boatGfx.fillStyle(0xb06a30);
        boatGfx.fillRect(10, 40, 70, 5);
        boatGfx.generateTexture('boat', 90, 60);
        boatGfx.destroy();

        // ── Giant wave obstacle (130x300) — onda gigante (forces a jump up) ────
        const bigWaveGfx = this.make.graphics({ add: false });
        // Main wave body (tall, occupies lower portion)
        bigWaveGfx.fillStyle(0x176aa8, 0.96);
        bigWaveGfx.fillPoints([
            { x: 0,   y: 90  },
            { x: 40,  y: 40  },
            { x: 80,  y: 30  },
            { x: 110, y: 60  },
            { x: 130, y: 110 },
            { x: 130, y: 300 },
            { x: 0,   y: 300 },
        ], true);
        // Curl shadow
        bigWaveGfx.fillStyle(0x0f4f82, 0.9);
        bigWaveGfx.slice(78, 70, 36, Math.PI * 1.1, Math.PI * 1.95, false);
        bigWaveGfx.fillPath();
        // Foam crest
        bigWaveGfx.fillStyle(0xffffff, 0.92);
        bigWaveGfx.fillEllipse(80, 30, 44, 20);
        bigWaveGfx.fillEllipse(108, 52, 30, 16);
        bigWaveGfx.fillEllipse(50, 44, 28, 14);
        // Foam streaks
        bigWaveGfx.lineStyle(3, 0xbfe6ff, 0.6);
        for (let wi = 0; wi < 5; wi++) {
            const wy = 130 + wi * 34;
            bigWaveGfx.beginPath();
            for (let x = 6; x <= 124; x += 6) {
                const yy = wy + Math.sin((x / 18) + wi) * 5;
                if (x === 6) bigWaveGfx.moveTo(x, yy);
                else bigWaveGfx.lineTo(x, yy);
            }
            bigWaveGfx.strokePath();
        }
        bigWaveGfx.generateTexture('bigwave', 130, 300);
        bigWaveGfx.destroy();

        // ── Coin collectible (24x24) ──────────────────────────────────────────────
        const coinGfx = this.make.graphics({ add: false });
        coinGfx.fillStyle(0xb8860b);
        coinGfx.fillCircle(12, 12, 11);
        coinGfx.fillStyle(0xffd700);
        coinGfx.fillCircle(12, 12, 9);
        coinGfx.fillStyle(0xffe566);
        coinGfx.fillCircle(12, 12, 6);
        coinGfx.lineStyle(1.5, 0xb8860b, 1);
        coinGfx.strokeCircle(12, 12, 9);
        coinGfx.fillStyle(0xffffff, 0.75);
        coinGfx.fillEllipse(8, 8, 5, 3);
        coinGfx.generateTexture('coin', 24, 24);
        coinGfx.destroy();

        // All done — go to Menu
        loadText.setText('Ready!');
        bar.width = 400;
        this.time.delayedCall(200, () => {
            this.scene.start('Menu');
        });
    }
}
