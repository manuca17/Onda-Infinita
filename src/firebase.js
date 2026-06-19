(function () {
    // Without a config.js (e.g. on a public deploy where the Firebase keys are
    // not committed) the leaderboard is simply disabled instead of crashing.
    if (!window.firebaseConfig || !window.firebaseConfig.apiKey || window.firebaseConfig.apiKey === 'COLOCA_AQUI') {
        console.warn('Firebase config em falta — leaderboard desativado.');
        window.submitScore   = async function () { return false; };
        window.getLeaderboard = async function () { return []; };
        return;
    }

    firebase.initializeApp(window.firebaseConfig);
    const db = firebase.firestore();

    window.submitScore = async function (name, score) {
        try {
            await db.collection('scores').add({
                name:  (name || 'Anónimo').trim().substring(0, 20),
                score: Math.floor(score),
                date:  firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (e) {
            console.error('submitScore error:', e);
            return false;
        }
    };

    window.getLeaderboard = async function (limit = 10) {
        try {
            const snap = await db.collection('scores')
                .orderBy('score', 'desc')
                .limit(limit)
                .get();
            return snap.docs.map(d => d.data());
        } catch (e) {
            console.error('getLeaderboard error:', e);
            return [];
        }
    };
})();
