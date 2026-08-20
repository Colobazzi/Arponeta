import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, update, remove, onValue, query, orderByChild } from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);

// Auto login anónimo
onAuthStateChanged(auth, (user) => {
  if (!user) {
    signInAnonymously(auth).catch(err => console.error('Auth error:', err));
  }
});

export const createMatch = async (matchData) => {
  try {
    const matchesRef = ref(database, 'matches');
    const newMatchRef = push(matchesRef);
    const matchId = newMatchRef.key;

    await set(newMatchRef, {
      ...matchData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      id: matchId,
      status: 'open'
    });

    return matchId;
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
};

export const registerPlayer = async (matchId, playerData) => {
  try {
    const playersRef = ref(database, `matches/${matchId}/players`);
    const newPlayerRef = push(playersRef);

    await set(newPlayerRef, {
      ...playerData,
      timestamp: Date.now(),
      id: newPlayerRef.key
    });

    return newPlayerRef.key;
  } catch (error) {
    console.error('Error registering player:', error);
    throw error;
  }
};

export const subscribeToMatch = (matchId, callback) => {
  const matchRef = ref(database, `matches/${matchId}`);
  return onValue(matchRef, (snapshot) => {
    callback(snapshot.val());
  });
};

export const subscribePlayers = (matchId, callback) => {
  const playersRef = ref(database, `matches/${matchId}/players`);
  const playerQuery = query(playersRef, orderByChild('timestamp'));
  return onValue(playerQuery, (snapshot) => {
    const players = [];
    snapshot.forEach((child) => {
      players.push(child.val());
    });
    callback(players);
  });
};

export const updatePlayer = async (matchId, playerId, updates) => {
  try {
    const playerRef = ref(database, `matches/${matchId}/players/${playerId}`);
    await update(playerRef, updates);
  } catch (error) {
    console.error('Error updating player:', error);
    throw error;
  }
};

export const updateMatch = async (matchId, updates) => {
  try {
    const matchRef = ref(database, `matches/${matchId}`);
    await update(matchRef, {
      ...updates,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Error updating match:', error);
    throw error;
  }
};

export const removePlayer = async (matchId, playerId) => {
  try {
    const playerRef = ref(database, `matches/${matchId}/players/${playerId}`);
    await remove(playerRef);
  } catch (error) {
    console.error('Error removing player:', error);
    throw error;
  }
};
