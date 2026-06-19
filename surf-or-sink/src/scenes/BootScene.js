class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Boot' });
    }

    create() {
        // Load both locale JSON files, store in window.locales, then start Preload
        const v = Date.now();
        Promise.all([
            fetch('./locales/pt.json?v=' + v).then(r => r.json()),
            fetch('./locales/en.json?v=' + v).then(r => r.json()),
            fetch('./locales/es.json?v=' + v).then(r => r.json()),
            fetch('./locales/fr.json?v=' + v).then(r => r.json())
        ]).then(([ptData, enData, esData, frData]) => {
            window.locales['pt'] = ptData;
            window.locales['en'] = enData;
            window.locales['es'] = esData;
            window.locales['fr'] = frData;
            this.scene.start('Preload');
        }).catch(err => {
            // Fallback: define minimal locales inline if fetch fails (e.g. opened as file://)
            console.warn('Could not fetch locale files, using inline fallback:', err);
            window.locales['pt'] = {
                title: 'Surfa ou Afunda',
                play: 'Jogar',
                score: 'Pontuação',
                lives: 'Vidas',
                gameover: 'Fim de Jogo',
                restart: 'Reiniciar (R)',
                lang_button: 'EN',
                instructions: 'Usa ↑↓ para surfar. Desvia das rochas e tubarões!',
                best: 'Melhor',
                pause: 'PAUSA',
                resume: 'Continuar',
                menu: 'Menu',
                go: 'JÁ!',
                tutorial_hint: 'Desvia rochas\ne tubarões!',
                combo: 'COMBO',
                pu_life: 'Vida Extra!', pu_shield: 'Invencível!', pu_slow: 'Câmara Lenta!',
                faster: 'MAIS RÁPIDO!', coin: '+Moeda!',
                enter_name: 'O teu nome...', save_score: 'Guardar',
                saved_ok: '✓ Guardado no ranking!', saved_err: 'Erro ao guardar.',
                leaderboard: '🏆 Ranking', lb_title: '🏆 TOP 10',
                lb_empty: 'Sem pontuações ainda!', lb_loading: 'A carregar...', lb_close: 'Fechar'
            };
            window.locales['en'] = {
                title: 'Surf or Sink', play: 'Play', score: 'Score', lives: 'Lives',
                gameover: 'Game Over', restart: 'Restart (R)', lang_button: 'ES',
                instructions: 'Use ↑↓ to surf. Dodge rocks and sharks!',
                best: 'Best', pause: 'PAUSE', resume: 'Continue', menu: 'Menu', go: 'GO!',
                tutorial_hint: 'Dodge rocks\nand sharks!', combo: 'COMBO',
                pu_life: 'Extra Life!', pu_shield: 'Invincible!', pu_slow: 'Slow-Mo!',
                faster: 'FASTER!', coin: '+Coin!',
                enter_name: 'Your name...', save_score: 'Save',
                saved_ok: '✓ Saved to leaderboard!', saved_err: 'Error saving score.',
                leaderboard: '🏆 Ranking', lb_title: '🏆 TOP 10',
                lb_empty: 'No scores yet!', lb_loading: 'Loading...', lb_close: 'Close'
            };
            window.locales['es'] = {
                title: 'Surfea o Húndete', play: 'Jugar', score: 'Puntuación', lives: 'Vidas',
                gameover: 'Fin del Juego', restart: 'Reiniciar (R)', lang_button: 'FR',
                instructions: 'Usa ↑↓ para surfear. ¡Esquiva rocas y tiburones!',
                best: 'Mejor', pause: 'PAUSA', resume: 'Continuar', menu: 'Menú', go: '¡YA!',
                tutorial_hint: '¡Esquiva rocas\ny tiburones!', combo: 'COMBO',
                pu_life: '¡Vida Extra!', pu_shield: '¡Invencible!', pu_slow: '¡Cámara Lenta!',
                faster: '¡MÁS RÁPIDO!', coin: '+¡Moneda!',
                enter_name: 'Tu nombre...', save_score: 'Guardar',
                saved_ok: '✓ ¡Guardado en el ranking!', saved_err: 'Error al guardar.',
                leaderboard: '🏆 Ranking', lb_title: '🏆 TOP 10',
                lb_empty: '¡Aún no hay puntuaciones!', lb_loading: 'Cargando...', lb_close: 'Cerrar'
            };
            window.locales['fr'] = {
                title: 'Surfe ou Coule', play: 'Jouer', score: 'Score', lives: 'Vies',
                gameover: 'Partie Terminée', restart: 'Recommencer (R)', lang_button: 'PT',
                instructions: 'Utilise ↑↓ pour surfer. Évite les rochers et les requins !',
                best: 'Meilleur', pause: 'PAUSE', resume: 'Continuer', menu: 'Menu', go: 'GO !',
                tutorial_hint: 'Évite les rochers\net les requins !', combo: 'COMBO',
                pu_life: 'Vie Bonus !', pu_shield: 'Invincible !', pu_slow: 'Ralenti !',
                faster: 'PLUS VITE !', coin: '+Pièce !',
                enter_name: 'Ton nom...', save_score: 'Enregistrer',
                saved_ok: '✓ Enregistré au classement !', saved_err: 'Erreur d\'enregistrement.',
                leaderboard: '🏆 Classement', lb_title: '🏆 TOP 10',
                lb_empty: 'Pas encore de scores !', lb_loading: 'Chargement...', lb_close: 'Fermer'
            };
            this.scene.start('Preload');
        });
    }
}
