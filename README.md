# Surf or Sink / Surfa ou Afunda

An endless runner browser game built with Phaser 3.

## How to Play

**Play online:** [manuca17.github.io/Onda-Infinita](https://manuca17.github.io/Onda-Infinita/) — no install needed, just open the link in your browser.

Or run it locally with a local HTTP server (needed so the locale files load), e.g. inside the project root:

```bash
python -m http.server 8765
```

then open <http://localhost:8765>.

- **↑ / W** — move up
- **↓ / S** — move down
- **ESC** — pause / resume
- **R** — restart (on Game Over screen)
- Dodge rocks and sharks to survive!
- Score increases over time; obstacles speed up every 15 seconds.
- You have 3 lives.

## Language

Click the language button on the menu to cycle through Portuguese, English, Spanish and French (PT → EN → ES → FR).

## Tech Stack

- [Phaser 3.80](https://phaser.io/) — game framework (CDN)
- Web Audio API — synthesized sound effects
- localStorage — best score, coins and settings persistence
- Firebase Firestore — online leaderboard (optional, see below)
- No build step required

## Project Structure

```
.
├── index.html
├── assets/                  # images & music
├── locales/                 # pt / en / es / fr translations
└── src/
    ├── main.js
    ├── firebase.js
    ├── config.example.js    # copy to config.js with your Firebase keys
    └── scenes/
        ├── BootScene.js
        ├── PreloadScene.js
        ├── MenuScene.js
        ├── GameScene.js
        ├── GameOverScene.js
        └── ShopScene.js
```

## Leaderboard setup (optional)

The online leaderboard uses Firebase. Copy `src/config.example.js` to `src/config.js`
and fill in your own Firebase web config. Without it the game runs normally and the
leaderboard is simply disabled. `src/config.js` is gitignored so keys are never committed.
