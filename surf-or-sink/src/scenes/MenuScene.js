class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Menu' });
    }

    create() {
        const W = 800;
        const H = 400;

        // ── Animated background (2 wave layers for parallax depth) ─────────────
        this.skyLayer      = this.add.tileSprite(W / 2, H / 2, W, H, 'sky');
        this.oceanLayer    = this.add.tileSprite(W / 2, H / 2, W, H, 'ocean').setAlpha(0.85);
        this.waveBackLayer = this.add.tileSprite(W / 2, H / 2, W, H, 'wave_back').setAlpha(0.7);
        this.waveLayer     = this.add.tileSprite(W / 2, H / 2, W, H, 'wave').setAlpha(0.9);

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

        // ── Leaderboard button ─────────────────────────────────────────────────
        this.lbBtnBg = this.add.rectangle(W / 2, 372, 140, 30, 0xb8860b, 1)
            .setStrokeStyle(2, 0x7a5800)
            .setInteractive({ useHandCursor: true });

        this.lbBtnText = this.add.text(W / 2, 372, window.t('leaderboard'), {
            fontSize: '14px',
            fontFamily: 'Arial Black, Arial',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#5a3800',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.lbBtnBg.on('pointerover', () => this.lbBtnBg.setFillStyle(0xd4a020));
        this.lbBtnBg.on('pointerout',  () => this.lbBtnBg.setFillStyle(0xb8860b));
        this.lbBtnBg.on('pointerdown', () => this._showLeaderboard());

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

        // ── Volume control ─────────────────────────────────────────────────────
        this._buildVolumeControl(W);

        // ── Animated tutorial panel ────────────────────────────────────────────
        this._buildTutorial(W);

        // ── Keyboard ───────────────────────────────────────────────────────────
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // ── Camera fade in ─────────────────────────────────────────────────────
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    // ── Volume control row ─────────────────────────────────────────────────────
    _buildVolumeControl(W) {
        const y = 252;

        this.add.text(W / 2 - 72, y, '♪', {
            fontSize: '18px', fontFamily: 'Arial', fill: '#aaddff',
            stroke: '#002244', strokeThickness: 2
        }).setOrigin(0.5);

        const minusBtn = this.add.text(W / 2 - 38, y, '−', {
            fontSize: '26px', fontFamily: 'Arial Black, Arial', fill: '#ffffff',
            stroke: '#002244', strokeThickness: 3
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.volumeText = this.add.text(W / 2, y, Math.round(window.musicVolume * 100) + '%', {
            fontSize: '17px', fontFamily: 'Arial', fill: '#ffe44d',
            stroke: '#002244', strokeThickness: 3
        }).setOrigin(0.5);

        const plusBtn = this.add.text(W / 2 + 42, y, '+', {
            fontSize: '26px', fontFamily: 'Arial Black, Arial', fill: '#ffffff',
            stroke: '#002244', strokeThickness: 3
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const changeVol = (delta) => {
            window.musicVolume = Math.min(1, Math.max(0, Math.round((window.musicVolume + delta) * 10) / 10));
            localStorage.setItem('surforsink_volume', window.musicVolume);
            this.volumeText.setText(Math.round(window.musicVolume * 100) + '%');
        };

        minusBtn.on('pointerover', () => minusBtn.setColor('#ffe44d'));
        minusBtn.on('pointerout',  () => minusBtn.setColor('#ffffff'));
        minusBtn.on('pointerdown', () => changeVol(-0.1));

        plusBtn.on('pointerover', () => plusBtn.setColor('#ffe44d'));
        plusBtn.on('pointerout',  () => plusBtn.setColor('#ffffff'));
        plusBtn.on('pointerdown', () => changeVol(0.1));
    }

    // ── Animated tutorial ──────────────────────────────────────────────────────
    _buildTutorial(W) {
        const panelY  = 300;
        const panelH  = 68;
        const panelW  = 580;
        const panelLeft = W / 2 - panelW / 2;

        // Panel background with wave lines
        const gfx = this.add.graphics();
        gfx.fillStyle(0x0d3a6b, 0.82);
        gfx.fillRoundedRect(panelLeft, panelY - panelH / 2, panelW, panelH, 10);
        gfx.lineStyle(2, 0x4aaad4, 0.9);
        gfx.strokeRoundedRect(panelLeft, panelY - panelH / 2, panelW, panelH, 10);
        gfx.lineStyle(1, 0x5bbfea, 0.25);
        for (let wi = 0; wi < 3; wi++) {
            const wy = panelY - 18 + wi * 18;
            gfx.beginPath();
            for (let x = panelLeft + 10; x <= panelLeft + panelW - 10; x += 4) {
                const yy = wy + Math.sin((x / 70) + wi * 1.3) * 4;
                if (x === panelLeft + 10) gfx.moveTo(x, yy);
                else gfx.lineTo(x, yy);
            }
            gfx.strokePath();
        }

        const surferX    = panelLeft + 88;
        const surferBaseY = panelY - 3;

        // Mini surfer sprite
        this.tutSurfer = this.add.image(surferX, surferBaseY, 'surfer_idle')
            .setDisplaySize(28, 40).setDepth(5);

        // Arrow keys hint below surfer
        this.add.text(surferX, surferBaseY + 26, '↑  ↓', {
            fontSize: '11px',
            fill: '#aaddff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(5);

        // Hint text in center-right of panel
        this.tutHintText = this.add.text(W / 2 + 50, panelY, window.t('tutorial_hint'), {
            fontSize: '13px',
            fill: '#cceeff',
            fontFamily: 'Arial',
            align: 'center',
            wordWrap: { width: 240 }
        }).setOrigin(0.5).setDepth(5).setAlpha(0.9);

        // Mini rock — starts just off the right edge of the panel
        this.tutRock = this.add.image(panelLeft + panelW + 20, surferBaseY + 5, 'rock')
            .setDisplaySize(32, 25).setDepth(5);

        // SPACE hint below panel
        this.spaceText = this.add.text(W / 2, panelY + panelH / 2 + 22, '[ SPACE ]', {
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

        // Kick off animation loop after short delay
        this.time.delayedCall(400, () => this._runTutAnim(surferX, surferBaseY, panelLeft + panelW - 10));
    }

    _runTutAnim(surferX, surferBaseY, rockStartX) {
        // Reset positions
        this.tutRock.x = rockStartX;
        this.tutRock.setAlpha(1);
        this.tutSurfer.setTexture('surfer_idle').setFlipX(false).setDisplaySize(28, 40);
        this.tutSurfer.y = surferBaseY;

        // Phase 1: rock glides toward surfer
        this.tweens.add({
            targets: this.tutRock,
            x: surferX + 52,
            duration: 1350,
            ease: 'Linear',
            onComplete: () => {
                // Surfer dodges upward
                this.tutSurfer.setTexture('surfer_crouch').setFlipX(true).setDisplaySize(28, 40);
                this.tweens.add({
                    targets: this.tutSurfer,
                    y: surferBaseY - 24,
                    duration: 210,
                    ease: 'Power2Out',
                    onComplete: () => {
                        // Phase 2: rock finishes passing
                        this.tweens.add({
                            targets: this.tutRock,
                            x: surferX - 90,
                            duration: 580,
                            ease: 'Linear',
                            onComplete: () => {
                                this.tutRock.setAlpha(0);
                                // Surfer settles back down
                                this.tweens.add({
                                    targets: this.tutSurfer,
                                    y: surferBaseY,
                                    duration: 210,
                                    ease: 'Power2In',
                                    onComplete: () => {
                                        this.tutSurfer.setTexture('surfer_idle').setFlipX(false).setDisplaySize(28, 40);
                                        this.time.delayedCall(950, () => this._runTutAnim(surferX, surferBaseY, rockStartX));
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    _showLeaderboard() {
        const canvas = document.querySelector('canvas');
        const r = canvas.getBoundingClientRect();

        const panel = document.createElement('div');
        panel.style.cssText = `
            position: fixed;
            left: ${r.left}px; top: ${r.top}px;
            width: ${r.width}px; height: ${r.height}px;
            background: rgba(4, 16, 40, 0.97);
            color: #fff; font-family: Arial, sans-serif;
            z-index: 1000; display: flex; flex-direction: column;
            align-items: center; padding: 22px 30px; box-sizing: border-box;
        `;

        panel.innerHTML = `
            <div style="font-size: 22px; font-weight: bold; color: #ffe44d; margin-bottom: 14px;">
                ${window.t('lb_title')}
            </div>
            <div id="lb-rows" style="width: 100%; flex: 1; font-size: 15px; color: #aaddff;">
                ${window.t('lb_loading')}
            </div>
            <button id="lb-close-btn" style="
                margin-top: 14px; padding: 8px 28px; background: #2255aa;
                color: #fff; border: none; border-radius: 8px;
                cursor: pointer; font-size: 15px; font-weight: bold;
            ">${window.t('lb_close')}</button>
        `;

        document.body.appendChild(panel);

        const medals = ['🥇', '🥈', '🥉'];

        window.getLeaderboard().then(scores => {
            const el = document.getElementById('lb-rows');
            if (!el) return;
            if (scores.length === 0) {
                el.innerHTML = `<p style="text-align:center;margin-top:20px">${window.t('lb_empty')}</p>`;
                return;
            }
            el.innerHTML = scores.map((s, i) => `
                <div style="
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 7px 14px; margin-bottom: 4px; border-radius: 6px;
                    background: ${i % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'transparent'};
                ">
                    <span style="color:${i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'#aaddff'}">
                        ${medals[i] || '#' + (i + 1)}&nbsp;&nbsp;${s.name}
                    </span>
                    <span style="font-weight:bold;color:#fff">${s.score}</span>
                </div>
            `).join('');
        });

        this.input.enabled = false;

        const close = () => {
            panel.remove();
            this.input.enabled = true;
        };

        document.getElementById('lb-close-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            close();
        });
        this.events.once('shutdown', close);
    }

    refreshTexts() {
        this.titleText.setText(window.t('title'));
        this.playBtnText.setText(window.t('play'));
        this.langBtnText.setText(window.t('lang_button'));
        this.tutHintText.setText(window.t('tutorial_hint'));
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
        this.skyLayer.tilePositionX      += 0.3;
        this.oceanLayer.tilePositionX    += 1.0;
        this.waveBackLayer.tilePositionX += 0.8;
        this.waveLayer.tilePositionX     += 2.0;

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.startGame();
        }
    }
}
