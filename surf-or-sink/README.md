# Surf or Sink / Surfa ou Afunda

An endless runner browser game built with Phaser 3.

## How to Play

Open `index.html` in a browser (use a local HTTP server, e.g. `npx serve .`).

- **↑ / W** — move up
- **↓ / S** — move down
- **ESC** — pause / resume
- **R** — restart (on Game Over screen)
- Dodge rocks and sharks to survive!
- Score increases over time; obstacles speed up every 15 seconds.
- You have 3 lives.

## Language

Click the language button (EN / PT) on the menu to toggle between English and Portuguese.

## Tech Stack

- [Phaser 3.80](https://phaser.io/) — game framework (CDN)
- Web Audio API — synthesized sound effects
- localStorage — best score persistence
- No build step required

## File Structure

```
surf-or-sink/
├── index.html
├── README.md
├── .gitignore
├── locales/
│   ├── pt.json
│   └── en.json
└── src/
    ├── main.js
    └── scenes/
        ├── BootScene.js
        ├── PreloadScene.js
        ├── MenuScene.js
        ├── GameScene.js
        └── GameOverScene.js
```
