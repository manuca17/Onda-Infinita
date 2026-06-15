(function () {
    const firebaseConfig = {
        apiKey:            'AIzaSyBZ85bVM0QXn9C5QSAlCZtBCwmbo0rqUls',
        authDomain:        'leaderboardjogo.firebaseapp.com',
        projectId:         'leaderboardjogo',
        storageBucket:     'leaderboardjogo.firebasestorage.app',
        messagingSenderId: '493415887462',
        appId:             '1:493415887462:web:d4a8158512ed21b4a573a7'
    };

    firebase.initializeApp(firebaseConfig);
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
