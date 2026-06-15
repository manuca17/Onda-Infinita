class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
    }

    create() {
        const W = 800;
        const H = 400;

        // ── Reset state ────────────────────────────────────────────────────────
        this.score         = 0;
        this.lives         = 3;
        this.paused        = false;
        this.invincible    = false;
        this.gameEnded     = false;
        this.countingDown  = false;

        // Progressive difficulty
        this.baseSpeed     = -300;          // starting obstacle speed
        this.obstacleSpeed = this.baseSpeed; // recomputed each frame from elapsed time
        this.elapsedSec    = 0;

        // Slow-motion (turtle power-up): scales everything except the player
        this.slowFactor    = 1;
        this.slowTimer     = null;

        // Combo / score multiplier
        this.comboTime     = 0;
        this.multiplier    = 1;

        // Day/night cycle & milestones
        this.milestones    = new Set();

        // ── Parallax background layers (2 wave layers for depth) ───────────────
        this.skyLayer      = this.add.tileSprite(W / 2, H / 2, W, H, 'sky');
        this.oceanLayer    = this.add.tileSprite(W / 2, H / 2, W, H, 'ocean').setAlpha(0.85);
        this.waveBackLayer = this.add.tileSprite(W / 2, H / 2, W, H, 'wave_back').setAlpha(0.7);
        this.waveLayer     = this.add.tileSprite(W / 2, H / 2, W, H, 'wave').setAlpha(0.9);

        // ── Surfer sprite ──────────────────────────────────────────────────────
        this.surfer = this.physics.add.sprite(120, 200, 'surfer_idle');
        this.surfer.setDisplaySize(70, 100);
        this.surfer.setCollideWorldBounds(true);
        this.surfer.setDepth(10);
        this.surfer.body.setSize(660, 870);
        this.surfer.body.setOffset(180, 77);

        // ── Groups ─────────────────────────────────────────────────────────────
        this.obstacles       = this.physics.add.group();
        this.powerups        = this.physics.add.group();
        this.coins           = this.physics.add.group();
        this.obstacleCounter = 0;

        // ── Overlaps ───────────────────────────────────────────────────────────
        this.physics.add.overlap(this.surfer, this.obstacles, this.hitObstacle,   null, this);
        this.physics.add.overlap(this.surfer, this.powerups,  this.collectPowerup, null, this);
        this.physics.add.overlap(this.surfer, this.coins,     this.collectCoin,    null, this);

        // ── HUD ───────────────────────────────────────────────────────────────
        this.scoreText = this.add.text(16, 16, window.t('score') + ': 0', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            stroke: '#003366',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(20);

        this.comboText = this.add.text(16, 44, '', {
            fontSize: '18px',
            fontFamily: 'Arial Black, Arial',
            fontStyle: 'bold',
            fill: '#ffe44d',
            stroke: '#003366',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(20);

        this.hearts = [];
        for (let i = 0; i < 3; i++) {
            const heart = this.add.image(780 - i * 32, 20, 'heart')
                .setScrollFactor(0).setDepth(20);
            this.hearts.push(heart);
        }

        // ── Slow-motion blue tint overlay ──────────────────────────────────────
        this.slowOverlay = this.add.rectangle(W / 2, H / 2, W, H, 0x2288ff, 0.14)
            .setScrollFactor(0).setDepth(18).setVisible(false);

        // ── Pause overlay (depth 30) ───────────────────────────────────────────
        this.pauseOverlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.58)
            .setScrollFactor(0).setDepth(30).setVisible(false);

        this.pauseTitle = this.add.text(W / 2, H / 2 - 65, window.t('pause'), {
            fontSize: '48px',
            fontFamily: 'Arial Black, Arial',
            fontStyle: 'bold',
            fill: '#ffe44d',
            stroke: '#003366',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(31).setVisible(false);

        this.resumeBtn = this.add.rectangle(W / 2, H / 2 + 5, 230, 52, 0x22cc55)
            .setStrokeStyle(3, 0x009933).setScrollFactor(0).setDepth(31).setVisible(false)
            .setInteractive({ useHandCursor: true });
        this.resumeBtnText = this.add.text(W / 2, H / 2 + 5, window.t('resume'), {
            fontSize: '22px',
            fontFamily: 'Arial Black, Arial',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#006622',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(32).setVisible(false);
        this.resumeBtn.on('pointerover', () => this.resumeBtn.setFillStyle(0x33dd66));
        this.resumeBtn.on('pointerout',  () => this.resumeBtn.setFillStyle(0x22cc55));
        this.resumeBtn.on('pointerdown', () => this.togglePause());

        this.menuBtn = this.add.rectangle(W / 2, H / 2 + 68, 230, 52, 0x2255aa)
            .setStrokeStyle(3, 0x003388).setScrollFactor(0).setDepth(31).setVisible(false)
            .setInteractive({ useHandCursor: true });
        this.menuBtnText = this.add.text(W / 2, H / 2 + 68, window.t('menu'), {
            fontSize: '22px',
            fontFamily: 'Arial Black, Arial',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#001144',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(32).setVisible(false);
        this.menuBtn.on('pointerover', () => this.menuBtn.setFillStyle(0x3366cc));
        this.menuBtn.on('pointerout',  () => this.menuBtn.setFillStyle(0x2255aa));
        this.menuBtn.on('pointerdown', () => this.menuGoBack());

        // ── Countdown text (depth 50) ──────────────────────────────────────────
        this.countdownText = this.add.text(W / 2, H / 2, '', {
            fontSize: '100px',
            fontFamily: 'Arial Black, Arial',
            fontStyle: 'bold',
            fill: '#ffe44d',
            stroke: '#003366',
            strokeThickness: 8,
            shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 8, fill: true }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(50).setVisible(false);

        // ── Input ─────────────────────────────────────────────────────────────
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd    = this.input.keyboard.addKeys({
            up:   Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S
        });
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.pKey   = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

        // ── Splash particles ───────────────────────────────────────────────────
        this.splashParticles = this.add.particles(0, 0, 'splash', {
            speed:    { min: 60, max: 180 },
            angle:    { min: 0, max: 360 },
            scale:    { start: 1, end: 0 },
            lifespan: 500,
            quantity: 10,
            emitting: false
        }).setDepth(15);

        // ── Camera fade in ─────────────────────────────────────────────────────
        this.cameras.main.fadeIn(400, 0, 0, 0);

        this.bgMusic = this.sound.add('bgmusic', { loop: true, volume: window.musicVolume });
        this.bgMusic.play();

        // ── Initial countdown before gameplay begins ───────────────────────────
        this.countingDown = true;
        this.time.delayedCall(450, () => {
            this.startCountdown(() => this.beginGame());
        });
    }

    // ── Start spawners after countdown ─────────────────────────────────────────
    beginGame() {
        this.spawnEvent = this.time.addEvent({
            delay: Phaser.Math.Between(1500, 2500),
            loop: false,
            callback: this.scheduleNextSpawn,
            callbackScope: this
        });
        this.powerupEvent = this.time.addEvent({
            delay: Phaser.Math.Between(6000, 9000),
            loop: false,
            callback: this.scheduleNextPowerup,
            callbackScope: this
        });
        this.coinEvent = this.time.addEvent({
            delay: Phaser.Math.Between(2000, 4000),
            loop: false,
            callback: this.scheduleNextCoin,
            callbackScope: this
        });
    }

    // ── Countdown: 3 → 2 → 1 → GO! ─────────────────────────────────────────────
    startCountdown(onComplete) {
        const steps  = ['3', '2', '1', window.t('go')];
        const colors = ['#ffe44d', '#ffe44d', '#ffe44d', '#44ff88'];
        let i = 0;

        const showNext = () => {
            if (i >= steps.length) {
                this.countdownText.setVisible(false);
                this.countingDown = false;
                if (onComplete) onComplete();
                return;
            }
            const isGo = (i === steps.length - 1);
            this.countdownText
                .setText(steps[i])
                .setColor(colors[i])
                .setScale(0.5)
                .setAlpha(1)
                .setVisible(true);
            i++;
            this.tweens.add({
                targets:  this.countdownText,
                scaleX:   isGo ? 2.0 : 1.6,
                scaleY:   isGo ? 2.0 : 1.6,
                alpha:    0,
                duration: isGo ? 650 : 800,
                ease:     'Power2',
                onComplete: () => this.time.delayedCall(60, showNext)
            });
        };
        showNext();
    }

    // ── Obstacle spawn scheduling (interval shrinks gradually) ─────────────────
    scheduleNextSpawn() {
        if (this.gameEnded) return;
        this.spawnObstacle();
        const reduce = Math.min(this.elapsedSec * 8, 700);
        const delay  = Math.max(500, Phaser.Math.Between(1200, 2600) - reduce);
        this.spawnEvent = this.time.addEvent({
            delay,
            loop: false,
            callback: this.scheduleNextSpawn,
            callbackScope: this
        });
    }

    // ── Spawn one obstacle (weighted random type) ──────────────────────────────
    spawnObstacle() {
        if (this.gameEnded) return;

        const type = this.pickObstacleType();
        const speed = this.obstacleSpeed * this.slowFactor;
        let obs;

        if (type === 'bigwave') {
            // Giant wave — tall, covers the bottom, forces the player to move up
            obs = this.obstacles.create(920, 250, 'bigwave');
            obs.setDepth(8);
            obs.body.allowGravity = false;
            obs.body.setSize(110, 230);
            obs.body.setOffset(10, 70);
            obs.setVelocityX(speed * 0.85);
        } else if (type === 'shark') {
            obs = this.obstacles.create(870, Phaser.Math.Between(80, 320), 'shark_img');
            obs.setDepth(9);
            obs.body.allowGravity = false;
            obs.setDisplaySize(110, 65);
            obs.body.setSize(850, 600);
            obs.body.setOffset(87, 212);
            obs.setVelocityX(speed);
        } else if (type === 'jellyfish') {
            const y = Phaser.Math.Between(90, 300);
            obs = this.obstacles.create(870, y, 'jellyfish');
            obs.setDepth(9);
            obs.body.allowGravity = false;
            obs.body.setSize(26, 34);
            obs.body.setOffset(5, 6);
            obs.setVelocityX(speed * 0.9);
            // Gentle vertical bob handled in update
            obs.setData('bob', true);
            obs.setData('baseY', y);
            obs.setData('phase', Math.random() * Math.PI * 2);
        } else if (type === 'boat') {
            const y = Phaser.Math.Between(70, 260);
            obs = this.obstacles.create(880, y, 'boat');
            obs.setDepth(9);
            obs.body.allowGravity = false;
            obs.body.setSize(72, 34);
            obs.body.setOffset(9, 22);
            obs.setVelocityX(speed * 0.9);
        } else if (type === 'jumpshark') {
            const startX = Phaser.Math.Between(380, 680);
            obs = this.obstacles.create(startX, 440, 'shark_img');
            obs.setDepth(9);
            obs.setDisplaySize(110, 65);
            obs.body.setSize(850, 600);
            obs.body.setOffset(87, 212);
            obs.body.allowGravity = true;
            obs.body.setGravityY(520);
            obs.setVelocityX(speed * 0.25);
            obs.setVelocityY(-530);
            obs.setFlipY(true);
        } else {
            // rock
            obs = this.obstacles.create(860, Phaser.Math.Between(80, 320), 'rock');
            obs.setDepth(9);
            obs.body.allowGravity = false;
            obs.body.setSize(40, 32);
            obs.body.setOffset(5, 5);
            obs.setVelocityX(speed);
        }

        obs.setData('type', type);
    }

    // ── Weighted obstacle picker ───────────────────────────────────────────────
    pickObstacleType() {
        this.obstacleCounter++;
        const table = [
            { type: 'rock',      w: 30 },
            { type: 'shark',     w: 22 },
            { type: 'jellyfish', w: 16 },
            { type: 'boat',      w: 12 },
            { type: 'bigwave',   w: 10 },
            { type: 'jumpshark', w: 10 }
        ];
        const total = table.reduce((s, e) => s + e.w, 0);
        let r = Math.random() * total;
        for (const e of table) {
            if (r < e.w) return e.type;
            r -= e.w;
        }
        return 'rock';
    }

    // ── Power-up spawn scheduling ──────────────────────────────────────────────
    scheduleNextPowerup() {
        if (this.gameEnded) return;
        this.spawnPowerup();
        this.powerupEvent = this.time.addEvent({
            delay: Phaser.Math.Between(7000, 12000),
            loop: false,
            callback: this.scheduleNextPowerup,
            callbackScope: this
        });
    }

    spawnPowerup() {
        if (this.gameEnded) return;

        // Choose a type; heart only when the player is missing a life
        const pool = ['star', 'turtle'];
        if (this.lives < 3) pool.push('heart');
        const type = Phaser.Utils.Array.GetRandom(pool);

        const texKey = (type === 'heart') ? 'heart' : type;
        const y   = Phaser.Math.Between(90, 300);
        const pu  = this.powerups.create(860, y, texKey);
        pu.setDepth(9);
        pu.body.allowGravity = false;
        pu.setVelocityX(-180 * this.slowFactor);

        if (type === 'heart')  pu.setDisplaySize(30, 30);
        if (type === 'star')   pu.setDisplaySize(32, 34);
        if (type === 'turtle') pu.setDisplaySize(44, 34);

        pu.setData('type', type);
        pu.setData('baseY', y);
        pu.setData('phase', Math.random() * Math.PI * 2);

        // Gentle pulsing glow so power-ups stand out
        this.tweens.add({
            targets: pu,
            scaleX:  pu.scaleX * 1.12,
            scaleY:  pu.scaleY * 1.12,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // ── Power-up collection ────────────────────────────────────────────────────
    collectPowerup(surfer, pu) {
        if (this.gameEnded) return;
        const type = pu.getData('type');
        pu.destroy();
        window.playJumpSound && window.playJumpSound();
        this.splashParticles.emitParticleAt(surfer.x, surfer.y, 6);

        if (type === 'heart') {
            this.gainLife();
            this.floatText(window.t('pu_life'), '#ff5577');
        } else if (type === 'star') {
            this.activateShield(3000);
            this.floatText(window.t('pu_shield'), '#ffe44d');
        } else if (type === 'turtle') {
            this.activateSlow(4000);
            this.floatText(window.t('pu_slow'), '#88ffcc');
        }
    }

    floatText(msg, color) {
        const t = this.add.text(this.surfer.x, this.surfer.y - 60, msg, {
            fontSize: '18px',
            fontFamily: 'Arial Black, Arial',
            fontStyle: 'bold',
            fill: color,
            stroke: '#002244',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(40);
        this.tweens.add({
            targets: t,
            y: t.y - 40,
            alpha: 0,
            duration: 1100,
            ease: 'Power1',
            onComplete: () => t.destroy()
        });
    }

    // ── Power-up effects ───────────────────────────────────────────────────────
    gainLife() {
        if (this.lives >= 3) return;
        this.lives++;
        const h = this.hearts[this.lives - 1];
        h.setVisible(true).setAlpha(1).setScale(0);
        this.tweens.add({ targets: h, scaleX: 1, scaleY: 1, duration: 300, ease: 'Back.easeOut' });
    }

    activateShield(ms) {
        this.invincible = true;
        if (this.shieldTimer) this.shieldTimer.remove(false);
        if (this.invTween) this.invTween.stop();
        this.surfer.setTint(0xffe44d);
        this.invTween = this.tweens.add({
            targets: this.surfer,
            alpha: 0.35,
            duration: 150,
            yoyo: true,
            repeat: -1
        });
        this.shieldTimer = this.time.delayedCall(ms, () => {
            if (this.invTween) { this.invTween.stop(); this.invTween = null; }
            this.surfer.setAlpha(1);
            this.surfer.clearTint();
            this.invincible = false;
        });
    }

    activateSlow(ms) {
        this.setSlowFactor(0.4);
        this.slowOverlay.setVisible(true);
        if (this.slowTimer) this.slowTimer.remove(false);
        this.slowTimer = this.time.delayedCall(ms, () => {
            this.setSlowFactor(1);
            this.slowOverlay.setVisible(false);
        });
    }

    // Scales velocities of obstacles & power-ups; the player is never affected
    setSlowFactor(f) {
        if (f === this.slowFactor) return;
        const ratio = f / this.slowFactor;
        this.obstacles.getChildren().forEach(o => { if (o.body) o.body.velocity.x *= ratio; });
        this.powerups.getChildren().forEach(p => { if (p.body) p.body.velocity.x *= ratio; });
        this.coins.getChildren().forEach(c => { if (c.body) c.body.velocity.x *= ratio; });
        this.slowFactor = f;
    }

    // ── Collision handler ─────────────────────────────────────────────────────
    hitObstacle(surfer, obstacle) {
        if (this.invincible || this.gameEnded) return;

        obstacle.destroy();
        window.playHitSound();
        this.splashParticles.emitParticleAt(surfer.x, surfer.y, 12);

        // Reset combo
        this.comboTime  = 0;
        this.multiplier = 1;
        this.updateComboText();

        this.lives--;
        if (this.lives >= 0 && this.hearts[this.lives]) {
            this.tweens.add({
                targets:  this.hearts[this.lives],
                alpha:    0,
                scaleX:   0,
                scaleY:   0,
                duration: 300,
                ease:     'Back.easeIn',
                onComplete: () => { this.hearts[this.lives].setVisible(false); }
            });
        }

        if (this.lives <= 0) { this.endGame(); return; }

        this.invincible = true;
        this.tweens.add({
            targets:  this.surfer,
            alpha:    0.3,
            duration: 120,
            yoyo:     true,
            repeat:   6,
            onComplete: () => { this.surfer.setAlpha(1); }
        });
        this.surfer.setTint(0xff4444);
        this.time.delayedCall(300, () => { this.surfer.clearTint(); });
        this.time.delayedCall(2000, () => {
            // Don't cancel an active shield
            if (!this.shieldTimer || this.shieldTimer.getProgress() >= 1) {
                this.invincible = false;
            }
        });
    }

    // ── Combo indicator ────────────────────────────────────────────────────────
    updateComboText() {
        if (this.multiplier > 1) {
            this.comboText.setText('x' + this.multiplier + ' ' + window.t('combo'));
        } else {
            this.comboText.setText('');
        }
    }

    // ── End game with death animation ──────────────────────────────────────────
    endGame() {
        if (this.gameEnded) return;
        this.gameEnded = true;

        if (this.spawnEvent)   this.spawnEvent.remove(false);
        if (this.powerupEvent) this.powerupEvent.remove(false);
        if (this.coinEvent)    this.coinEvent.remove(false);

        this.bgMusic.stop();
        window.playGameOverSound();

        // Freeze everything in the world
        this.surfer.body.setVelocity(0, 0);
        this.surfer.body.setAllowGravity(false);
        this.surfer.setTint(0xff5555);
        this.obstacles.getChildren().forEach(o => { if (o.body) o.setVelocityX(0); });
        this.powerups.getChildren().forEach(p => { if (p.body) p.setVelocityX(0); });
        this.coins.getChildren().forEach(c => { if (c.body) c.setVelocityX(0); });

        this.splashParticles.emitParticleAt(this.surfer.x, this.surfer.y, 16);

        // Death animation: knock-back, then tumble off the board into the water
        const fallTargetY = this.surfer.y + 260; // sink below the screen
        this.tweens.add({
            targets:  this.surfer,
            y:        this.surfer.y - 35,
            angle:    -25,
            duration: 220,
            ease:     'Quad.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets:  this.surfer,
                    y:        fallTargetY,
                    angle:    130,
                    alpha:    0.15,
                    duration: 750,
                    ease:     'Quad.easeIn',
                    onComplete: () => {
                        this.cameras.main.fadeOut(450, 0, 0, 0);
                        this.cameras.main.once('camerafadeoutcomplete', () => {
                            this.scene.start('GameOver', { score: Math.floor(this.score) });
                        });
                    }
                });
            }
        });
    }

    // ── Pause / resume ─────────────────────────────────────────────────────────
    togglePause() {
        if (!this.paused) {
            this.paused = true;
            this.physics.pause();
            this.bgMusic.pause();
            this.pauseOverlay.setVisible(true);
            this.pauseTitle.setVisible(true);
            this.resumeBtn.setVisible(true);
            this.resumeBtnText.setVisible(true);
            this.menuBtn.setVisible(true);
            this.menuBtnText.setVisible(true);
        } else {
            this.paused = false;
            this.pauseOverlay.setVisible(false);
            this.pauseTitle.setVisible(false);
            this.resumeBtn.setVisible(false);
            this.resumeBtnText.setVisible(false);
            this.menuBtn.setVisible(false);
            this.menuBtnText.setVisible(false);
            this.countingDown = true;
            this.startCountdown(() => {
                this.physics.resume();
                this.bgMusic.resume();
            });
        }
    }

    menuGoBack() {
        this.bgMusic.stop();
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('Menu');
        });
    }

    // ── Coin spawning ──────────────────────────────────────────────────────────
    scheduleNextCoin() {
        if (this.gameEnded) return;
        this.spawnCoin();
        this.coinEvent = this.time.addEvent({
            delay: Phaser.Math.Between(2000, 4000),
            loop: false,
            callback: this.scheduleNextCoin,
            callbackScope: this
        });
    }

    spawnCoin() {
        if (this.gameEnded) return;
        const y = Phaser.Math.Between(80, 340);
        const coin = this.coins.create(870, y, 'coin');
        coin.setDepth(9);
        coin.body.allowGravity = false;
        coin.setDisplaySize(22, 22);
        coin.setVelocityX(this.obstacleSpeed * 0.75 * this.slowFactor);
        coin.setData('baseY', y);
        coin.setData('phase', Math.random() * Math.PI * 2);
        this.tweens.add({
            targets: coin, scaleX: 0.15, duration: 350,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
    }

    collectCoin(surfer, coin) {
        if (this.gameEnded) return;
        coin.destroy();
        const bonus = 15 * this.multiplier;
        this.score += bonus;
        this.splashParticles.emitParticleAt(surfer.x, surfer.y, 5);
        this.floatText('+' + bonus, '#ffd700');
        window.playJumpSound && window.playJumpSound();
    }

    // ── Day/night cycle ────────────────────────────────────────────────────────
    lerpColor(c1, c2, t) {
        t = Math.max(0, Math.min(1, t));
        const r1=(c1>>16)&0xff, g1=(c1>>8)&0xff, b1=c1&0xff;
        const r2=(c2>>16)&0xff, g2=(c2>>8)&0xff, b2=c2&0xff;
        return (Math.round(r1+(r2-r1)*t)<<16)|(Math.round(g1+(g2-g1)*t)<<8)|Math.round(b1+(b2-b1)*t);
    }

    updateDayNight() {
        let skyTint, seaTint;
        if (this.score < 200) {
            skyTint = 0xffffff;
            seaTint = 0xffffff;
        } else if (this.score < 500) {
            const t = (this.score - 200) / 300;
            skyTint = this.lerpColor(0xffffff, 0xff8844, t);
            seaTint = this.lerpColor(0xffffff, 0xff6633, t);
        } else {
            const t = Math.min((this.score - 500) / 300, 1);
            skyTint = this.lerpColor(0xff8844, 0x334488, t);
            seaTint = this.lerpColor(0xff6633, 0x112255, t);
        }
        this.skyLayer.setTint(skyTint);
        this.oceanLayer.setTint(seaTint);
        this.waveBackLayer.setTint(skyTint);
        this.waveLayer.setTint(seaTint);
    }

    // ── Speed milestones ───────────────────────────────────────────────────────
    checkMilestones() {
        for (const threshold of [200, 500, 1000]) {
            if (this.score >= threshold && !this.milestones.has(threshold)) {
                this.milestones.add(threshold);
                this.triggerMilestone();
            }
        }
    }

    triggerMilestone() {
        this.cameras.main.flash(350, 255, 200, 80);
        const W = 800, H = 400;
        const msg = this.add.text(W / 2, H / 2, window.t('faster'), {
            fontSize: '54px',
            fontFamily: 'Arial Black, Arial',
            fontStyle: 'bold',
            fill: '#ff4400',
            stroke: '#ffffff',
            strokeThickness: 7,
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 10, fill: true }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(45).setScale(0.2).setAlpha(0);

        this.tweens.add({
            targets: msg, scaleX: 1, scaleY: 1, alpha: 1,
            duration: 280, ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: msg, alpha: 0, y: H / 2 - 70,
                    duration: 600, delay: 500, ease: 'Power2',
                    onComplete: () => msg.destroy()
                });
            }
        });
    }

    // ── Update loop ────────────────────────────────────────────────────────────
    update(time, delta) {
        if (!this.countingDown && !this.gameEnded) {
            if (Phaser.Input.Keyboard.JustDown(this.escKey) ||
                Phaser.Input.Keyboard.JustDown(this.pKey)) {
                this.togglePause();
            }
        }

        if (this.paused || this.gameEnded || this.countingDown) return;

        // ── Progressive difficulty: speed scales with score ────────────────────
        this.elapsedSec += delta / 1000;
        this.obstacleSpeed = this.baseSpeed - Math.min(this.score * 0.5, 400);

        // ── Parallax scrolling (scaled by slow-mo and current speed) ───────────
        const s = this.slowFactor;
        const speedRatio = Math.abs(this.obstacleSpeed) / Math.abs(this.baseSpeed);
        this.skyLayer.tilePositionX      += 0.5 * s * speedRatio;
        this.oceanLayer.tilePositionX    += 1.5 * s * speedRatio;
        this.waveBackLayer.tilePositionX += 1.2 * s * speedRatio;
        this.waveLayer.tilePositionX     += 3.0 * s * speedRatio;

        // ── Surfer movement ─────────────────────────────────────────────────────
        const upPressed   = this.cursors.up.isDown   || this.wasd.up.isDown;
        const downPressed = this.cursors.down.isDown || this.wasd.down.isDown;

        if (upPressed) {
            this.surfer.setVelocityY(-220);
            if (this.surfer.texture.key !== 'surfer_crouch') {
                this.surfer.setTexture('surfer_crouch');
                this.surfer.setFlipX(true);
                this.surfer.setDisplaySize(70, 100);
                this.surfer.body.setSize(660, 870);
                this.surfer.body.setOffset(180, 77);
            }
            window.playJumpSound && (this._jumpPlayed ? null : (window.playJumpSound(), this._jumpPlayed = true));
        } else if (downPressed) {
            this.surfer.setVelocityY(220);
            if (this.surfer.texture.key !== 'surfer_crouch') {
                this.surfer.setTexture('surfer_crouch');
                this.surfer.setFlipX(true);
                this.surfer.setDisplaySize(70, 100);
                this.surfer.body.setSize(660, 870);
                this.surfer.body.setOffset(180, 77);
            }
            this._jumpPlayed = false;
        } else {
            this.surfer.setVelocityY(0);
            if (this.surfer.texture.key !== 'surfer_idle') {
                this.surfer.setTexture('surfer_idle');
                this.surfer.setFlipX(false);
                this.surfer.setDisplaySize(70, 100);
                this.surfer.body.setSize(660, 870);
                this.surfer.body.setOffset(180, 77);
            }
            this._jumpPlayed = false;
        }

        // Clamp surfer Y
        if (this.surfer.y < 50)  { this.surfer.y = 50;  this.surfer.setVelocityY(0); }
        if (this.surfer.y > 370) { this.surfer.y = 370; this.surfer.setVelocityY(0); }

        // ── Combo multiplier grows the longer you survive untouched ────────────
        this.comboTime += delta;
        const newMult = Math.min(1 + Math.floor(this.comboTime / 8000), 5);
        if (newMult !== this.multiplier) {
            this.multiplier = newMult;
            this.updateComboText();
            if (this.multiplier > 1) {
                this.comboText.setScale(1.5);
                this.tweens.add({ targets: this.comboText, scaleX: 1, scaleY: 1, duration: 250, ease: 'Back.easeOut' });
            }
        }

        // ── Score increment (scaled by combo multiplier) ───────────────────────
        this.score += (delta / 100) * this.multiplier;
        this.scoreText.setText(window.t('score') + ': ' + Math.floor(this.score));

        // ── Day/night & milestones ─────────────────────────────────────────────
        this.updateDayNight();
        this.checkMilestones();

        // ── Jellyfish bobbing & off-screen cleanup ──────────────────────────────
        this.obstacles.getChildren().forEach(obs => {
            if (obs.getData('bob')) {
                obs.y = obs.getData('baseY') + Math.sin(time * 0.004 + obs.getData('phase')) * 16;
            }
            if (obs.x < -150 || obs.y > 460) obs.destroy();
        });
        this.powerups.getChildren().forEach(pu => {
            pu.y = pu.getData('baseY') + Math.sin(time * 0.003 + pu.getData('phase')) * 12;
            if (pu.x < -80) pu.destroy();
        });
        this.coins.getChildren().forEach(coin => {
            coin.y = coin.getData('baseY') + Math.sin(time * 0.004 + coin.getData('phase')) * 10;
            if (coin.x < -80) coin.destroy();
        });
    }
}
