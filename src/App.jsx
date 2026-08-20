import React, { useState, useEffect } from 'react';
import { subscribeToMatch } from './firebase';
import AdminPanel from './components/AdminPanel';
import PlayerForm from './components/PlayerForm';
import LiveList from './components/LiveList';
import './App.css';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [matchId, setMatchId] = useState(null);
  const [matchData, setMatchData] = useState(null);

  // Chequea si viene de URL con matchId
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlMatchId = params.get('match');
    const adminMode = params.get('admin') === 'true';

    if (urlMatchId) {
      setMatchId(urlMatchId);
      setCurrentView(adminMode ? 'admin' : 'join');
    }
  }, []);

  // Subscribe a match data si existe
  useEffect(() => {
    if (!matchId) return;

    const unsubscribe = subscribeToMatch(matchId, (data) => {
      setMatchData(data);
    });

    return unsubscribe;
  }, [matchId]);

  // Se llama DESDE el panel, cuando la convocatoria ya se guardó en Firebase.
  const handleMatchCreated = (newMatchId) => {
    if (!newMatchId) return;
    setMatchId(newMatchId);
    // Deja el id en la URL: si recargás la página, no perdés el panel.
    window.history.replaceState({}, '', `?match=${newMatchId}&admin=true`);
  };

  const handleBackToHome = () => {
    setMatchId(null);
    setMatchData(null);
    setCurrentView('home');
    window.history.replaceState({}, '', window.location.pathname);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {currentView === 'home' && (
        <Home onGoToAdmin={() => setCurrentView('admin')} />
      )}

      {currentView === 'admin' && (
        <AdminPanel
          matchId={matchId}
          matchData={matchData}
          onMatchCreated={handleMatchCreated}
          onBack={handleBackToHome}
        />
      )}

      {currentView === 'join' && matchId && (
        <>
          <LiveList matchId={matchId} matchData={matchData} />
          <PlayerForm matchId={matchId} matchData={matchData} />
        </>
      )}
    </div>
  );
}

function Home({ onGoToAdmin }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🐋</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Arponeta</h1>
        <p className="text-gray-600 mb-8">Sistema de anotación para el equipo</p>

        <button
          onClick={onGoToAdmin}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition mb-3"
        >
          📋 Crear Nueva Convocatoria
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Versión 1.0 - Futbolito con amor
        </p>
      </div>
    </div>
  );
}
