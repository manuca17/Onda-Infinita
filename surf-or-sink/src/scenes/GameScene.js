class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
    }

    create() {
        const W = 800;
        const H = 400;

        // ── Reset state ────────────────────────────────────────────────────────
        this.score        = 0;
        this.lives        = 3;
        this.paused       = false;
        this.invincible   = false;
        this.obstacleSpeed = -300;
        this.gameEnded    = false;

        // ── Parallax background layers ─────────────────────────────────────────
        this.skyLayer   = this.add.tileSprite(W / 2, H / 2, W, H, 'sky');
        this.oceanLayer = this.add.tileSprite(W / 2, H / 2, W, H, 'ocean').setAlpha(0.85);
        this.waveLayer  = this.add.tileSprite(W / 2, H / 2, W, H, 'wave').setAlpha(0.9);

        // ── Surfer sprite ──────────────────────────────────────────────────────
        this.surfer = this.physics.add.sprite(120, 200, 'surfer', '0');
        this.surfer.setCollideWorldBounds(true);
        this.surfer.setDepth(10);
        // Custom physics body (smaller than the texture)
        this.surfer.body.setSize(30, 50);
        this.surfer.body.setOffset(5, 5);

        // ── Animations ────────────────────────────────────────────────────────
        if (!this.anims.exists('surf_idle')) {
            this.anims.create({
                key: 'surf_idle',
                frames: [{ key: 'surfer', frame: '0' }],
                frameRate: 1,
                repeat: -1
            });
        }
        if (!this.anims.exists('surf_move')) {
            this.anims.create({
                key: 'surf_move',
                frames: [
                    { key: 'surfer', frame: '0' },
                    { key: 'surfer', frame: '1' }
                ],
                frameRate: 8,
                repeat: -1
            });
        }
        this.surfer.play('surf_idle');

        // ── Obstacle group ─────────────────────────────────────────────────────
        this.obstacles = this.physics.add.group();

        // ── Obstacle spawner ───────────────────────────────────────────────────
        this.obstacleCounter = 0;
        this.spawnEvent = this.time.addEvent({
            delay: Phaser.Math.Between(1500, 2500),
            loop: false,
            callback: this.scheduleNextSpawn,
            callbackScope: this
        });

        // ── Speed increase every 15 seconds ───────────────────────────────────
        this.time.addEvent({
            delay: 15000,
            loop: true,
            callback: () => {
                this.obstacleSpeed = Math.floor(this.obstacleSpeed * 1.1);
            }
        });

        // ── Overlap: surfer hits obstacle ──────────────────────────────────────
        this.physics.add.overlap(
            this.surfer,
            this.obstacles,
            this.hitObstacle,
            null,
            this
        );

        // ── HUD ───────────────────────────────────────────────────────────────
        this.scoreText = this.add.text(16, 16, window.t('score') + ': 0', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            stroke: '#003366',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(20);

        // Lives display (hearts top-right)
        this.hearts = [];
        for (let i = 0; i < 3; i++) {
            const heart = this.add.image(780 - i * 32, 20, 'heart')
                .setScrollFactor(0)
                .setDepth(20);
            this.hearts.push(heart);
        }

        // ── Pause overlay ─────────────────────────────────────────────────────
        this.pauseOverlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.55)
            .setScrollFactor(0)
            .setDepth(30)
            .setVisible(false);

        this.pauseText = this.add.text(W / 2, H / 2 - 20, window.t('pause'), {
            fontSize: '48px',
            fontFamily: 'Arial Black, Arial',
            fontStyle: 'bold',
            fill: '#ffe44d',
            stroke: '#003366',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(31).setVisible(false);

        this.resumeText = this.add.text(W / 2, H / 2 + 40, window.t('resume'), {
            fontSize: '22px',
            fontFamily: 'Arial',
            fill: '#cceeff',
            stroke: '#002244',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(31).setVisible(false);

        // ── Input ─────────────────────────────────────────────────────────────
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up:   Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S
        });
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // ── Particle emitter for splashes ──────────────────────────────────────
        // Created fresh each hit via on-demand emitters
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
    }

    // ── Spawn scheduling ───────────────────────────────────────────────────────
    scheduleNextSpawn() {
        this.spawnObstacle();
        this.spawnEvent = this.time.addEvent({
            delay: Phaser.Math.Between(1200, 2600),
            loop: false,
            callback: this.scheduleNextSpawn,
            callbackScope: this
        });
    }

    // ── Spawn one obstacle ────────────────────────────────────────────────────
    spawnObstacle() {
        if (this.gameEnded) return;

        const isShark = (this.obstacleCounter % 3 === 2);
        this.obstacleCounter++;

        const key = isShark ? 'shark' : 'rock';
        const y   = Phaser.Math.Between(80, 320);
        const obs = this.obstacles.create(860, y, key);
        obs.setDepth(9);
        obs.body.allowGravity = false;
        obs.setVelocityX(this.obstacleSpeed);

        if (isShark) {
            obs.body.setSize(60, 28);
            obs.body.setOffset(4, 8);
        } else {
            obs.body.setSize(40, 32);
            obs.body.setOffset(5, 5);
        }
    }

    // ── Collision handler ─────────────────────────────────────────────────────
    hitObstacle(surfer, obstacle) {
        if (this.invincible || this.gameEnded) return;

        // Destroy the obstacle
        obstacle.destroy();

        // Sound
        window.playHitSound();

        // Splash particles at impact point
        this.splashParticles.emitParticleAt(surfer.x, surfer.y, 12);

        // Lose a life
        this.lives--;
        if (this.lives >= 0 && this.hearts[this.lives]) {
            this.tweens.add({
                targets: this.hearts[this.lives],
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 300,
                ease: 'Back.easeIn',
                onComplete: () => {
                    this.hearts[this.lives].setVisible(false);
                }
            });
        }

        if (this.lives <= 0) {
            this.endGame();
            return;
        }

        // Flash surfer red
        this.invincible = true;
        this.tweens.add({
            targets: this.surfer,
            alpha: 0.3,
            duration: 120,
            yoyo: true,
            repeat: 6,
            onComplete: () => {
                this.surfer.setAlpha(1);
            }
        });

        // Tint red momentarily
        this.surfer.setTint(0xff4444);
        this.time.delayedCall(300, () => {
            this.surfer.clearTint();
        });

        // Invincibility window
        this.time.delayedCall(2000, () => {
            this.invincible = false;
        });
    }

    // ── End game ───────────────────────────────────────────────────────────────
    endGame() {
        if (this.gameEnded) return;
        this.gameEnded = true;

        window.playGameOverSound();

        this.surfer.setVelocity(0, 0);
        this.surfer.setTint(0xff0000);

        // Stop all obstacles
        this.obstacles.getChildren().forEach(obs => obs.setVelocityX(0));

        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameOver', { score: Math.floor(this.score) });
        });
    }

    // ── Toggle pause ───────────────────────────────────────────────────────────
    togglePause() {
        this.paused = !this.paused;

        if (this.paused) {
            this.physics.pause();
            this.pauseOverlay.setVisible(true);
            this.pauseText.setVisible(true);
            this.resumeText.setVisible(true);
        } else {
            this.physics.resume();
            this.pauseOverlay.setVisible(false);
            this.pauseText.setVisible(false);
            this.resumeText.setVisible(false);
        }
    }

    // ── Update loop ────────────────────────────────────────────────────────────
    update(time, delta) {
        // ESC toggles pause
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.togglePause();
        }

        if (this.paused || this.gameEnded) return;

        // ── Parallax scrolling ──────────────────────────────────────────────
        this.skyLayer.tilePositionX   += 0.5;
        this.oceanLayer.tilePositionX += 1.5;
        this.waveLayer.tilePositionX  += 3.0;

        // ── Surfer movement ─────────────────────────────────────────────────
        const upPressed   = this.cursors.up.isDown   || this.wasd.up.isDown;
        const downPressed = this.cursors.down.isDown || this.wasd.down.isDown;

        if (upPressed) {
            this.surfer.setVelocityY(-220);
            if (this.surfer.anims.currentAnim?.key !== 'surf_move') {
                this.surfer.play('surf_move');
            }
            window.playJumpSound && (this._jumpPlayed ? null : (window.playJumpSound(), this._jumpPlayed = true));
        } else if (downPressed) {
            this.surfer.setVelocityY(220);
            if (this.surfer.anims.currentAnim?.key !== 'surf_move') {
                this.surfer.play('surf_move');
            }
            this._jumpPlayed = false;
        } else {
            this.surfer.setVelocityY(0);
            if (this.surfer.anims.currentAnim?.key !== 'surf_idle') {
                this.surfer.play('surf_idle');
            }
            this._jumpPlayed = false;
        }

        // Clamp surfer Y
        if (this.surfer.y < 50) {
            this.surfer.y = 50;
            this.surfer.setVelocityY(0);
        }
        if (this.surfer.y > 370) {
            this.surfer.y = 370;
            this.surfer.setVelocityY(0);
        }

        // ── Score increment ──────────────────────────────────────────────────
        this.score += delta / 100;
        this.scoreText.setText(window.t('score') + ': ' + Math.floor(this.score));

        // ── Clean up off-screen obstacles ────────────────────────────────────
        this.obstacles.getChildren().forEach(obs => {
            if (obs.x < -100) {
                obs.destroy();
            }
        });
    }
}
