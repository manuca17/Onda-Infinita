class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Shop' });
    }

    create() {
        const W = 800, H = 400;

        this.add.tileSprite(W / 2, H / 2, W, H, 'sky');
        this.add.tileSprite(W / 2, H / 2, W, H, 'ocean').setAlpha(0.85);
        this.add.tileSprite(W / 2, H / 2, W, H, 'wave').setAlpha(0.5);
        this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.52);

        // Title
        this.add.text(W / 2, 28, window.t('shop'), {
            fontSize: '30px', fontFamily: 'Arial Black, Arial', fontStyle: 'bold',
            fill: '#ffe44d', stroke: '#003366', strokeThickness: 5
        }).setOrigin(0.5);

        // Coin display
        this.coinText = this.add.text(W / 2, 56, '💰 ' + window.coins + ' ' + window.t('coins'), {
            fontSize: '17px', fontFamily: 'Arial', fill: '#ffd700',
            stroke: '#003366', strokeThickness: 3
        }).setOrigin(0.5);

        // Close button (top-right)
        const closeBg = this.add.rectangle(W - 44, 22, 66, 32, 0x882222)
            .setStrokeStyle(2, 0x550000).setInteractive({ useHandCursor: true });
        this.add.text(W - 44, 22, window.t('shop_close'), {
            fontSize: '14px', fontFamily: 'Arial Black, Arial', fill: '#ffffff'
        }).setOrigin(0.5);
        closeBg.on('pointerover', () => closeBg.setFillStyle(0xaa3333));
        closeBg.on('pointerout',  () => closeBg.setFillStyle(0x882222));
        closeBg.on('pointerdown', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Menu'));
        });

        const items = [
            { key: 'extraLife',   icon: '🪴', nameKey: 'shop_life_name',   descKey: 'shop_life_desc',   cost: 30, x: 160 },
            { key: 'shield',      icon: '⭐',        nameKey: 'shop_shield_name', descKey: 'shop_shield_desc', cost: 50, x: 400 },
            { key: 'doubleScore', icon: '🚀',  nameKey: 'shop_score_name',  descKey: 'shop_score_desc',  cost: 80, x: 640 },
        ];
        items.forEach(item => this._buildCard(item));

        this.cameras.main.fadeIn(300, 0, 0, 0);
    }

    _buildCard(item) {
        const H = 400;
        const cardW = 200, cardH = 260, cardY = H / 2 + 20;
        const isActive  = !!window.shopBoosts[item.key];
        const canAfford = !isActive && window.coins >= item.cost;

        // Card bg
        const borderCol = isActive ? 0x44ff88 : 0x4aaad4;
        this.add.rectangle(item.x, cardY, cardW, cardH, 0x081e3a, 0.96)
            .setStrokeStyle(2, borderCol);

        // Icon
        this.add.text(item.x, cardY - 103, item.icon, { fontSize: '34px' }).setOrigin(0.5);

        // Name
        this.add.text(item.x, cardY - 66, window.t(item.nameKey), {
            fontSize: '15px', fontFamily: 'Arial Black, Arial', fontStyle: 'bold',
            fill: '#ffffff', stroke: '#002244', strokeThickness: 3,
            align: 'center', wordWrap: { width: 180 }
        }).setOrigin(0.5);

        // Description
        this.add.text(item.x, cardY - 20, window.t(item.descKey), {
            fontSize: '12px', fontFamily: 'Arial', fill: '#aaddff',
            align: 'center', wordWrap: { width: 178 }
        }).setOrigin(0.5);

        // Cost
        this.add.text(item.x, cardY + 55, '💰 ' + item.cost, {
            fontSize: '16px', fontFamily: 'Arial Black, Arial',
            fill: canAfford ? '#ffd700' : '#777777',
            stroke: '#002244', strokeThickness: 3
        }).setOrigin(0.5);

        // Buy / Active button
        const btnCol = isActive ? 0x229944 : (canAfford ? 0xe6a817 : 0x444444);
        const btnBorder = isActive ? 0x117733 : (canAfford ? 0x8b6500 : 0x222222);
        const btn = this.add.rectangle(item.x, cardY + 95, 140, 38, btnCol)
            .setStrokeStyle(2, btnBorder);
        const btnLabel = isActive ? window.t('shop_active') : window.t('shop_buy');
        this.add.text(item.x, cardY + 95, btnLabel, {
            fontSize: '15px', fontFamily: 'Arial Black, Arial', fontStyle: 'bold',
            fill: '#ffffff', stroke: '#002244', strokeThickness: 3
        }).setOrigin(0.5);

        if (canAfford) {
            btn.setInteractive({ useHandCursor: true });
            btn.on('pointerover', () => btn.setFillStyle(0xffbc1f));
            btn.on('pointerout',  () => btn.setFillStyle(0xe6a817));
            btn.on('pointerdown', () => {
                window.coins -= item.cost;
                window.saveCoins();
                window.shopBoosts[item.key] = true;
                window.saveBoosts();
                this.cameras.main.fadeOut(180, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart());
            });
        }
    }
}
