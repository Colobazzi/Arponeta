import React, { useState, useEffect } from 'react';
import { createMatch, updateMatch, subscribePlayers, updatePlayer, removePlayer } from '../firebase';
import { Copy, Share2, Trash2, Star } from 'lucide-react';

export default function AdminPanel({ matchId, matchData, onBack }) {
  const [rivals, setRivals] = useState([]);
  const [mvps, setMvps] = useState([]);
  const [players, setPlayers] = useState([]);
  const [newMatchForm, setNewMatchForm] = useState({
    rival: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: '10:00',
    cancha: 'Platense futbol',
    partido: '$112.000'
  });
  const [creatingMatch, setCreatingMatch] = useState(false);

  useEffect(() => {
    if (matchId) {
      const unsubscribe = subscribePlayers(matchId, setPlayers);
      return unsubscribe;
    }
  }, [matchId]);

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (!newMatchForm.rival.trim()) {
      alert('Ingresa el nombre del rival');
      return;
    }

    setCreatingMatch(true);
    try {
      const newId = await createMatch({
        rival: newMatchForm.rival,
        fecha: newMatchForm.fecha,
        hora: newMatchForm.hora,
        cancha: newMatchForm.cancha,
        partido: newMatchForm.partido,
        mvps: []
      });

      // Agregar rival a lista
      setRivals([...rivals, newMatchForm.rival]);
      setNewMatchForm({
        rival: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '10:00',
        cancha: 'Platense futbol',
        partido: '$112.000'
      });

      alert(`Convocatoria creada! ID: ${newId}`);
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setCreatingMatch(false);
  };

  const handleAddMVP = async (mvpName) => {
    if (!matchId) {
      alert('Crea una convocatoria primero');
      return;
    }
    if (!mvpName.trim()) return;

    const newMvps = [...mvps, mvpName];
    setMvps(newMvps);

    try {
      await updateMatch(matchId, { mvps: newMvps });
    } catch (error) {
      alert('Error al agregar MVP: ' + error.message);
      setMvps(mvps.filter(m => m !== mvpName));
    }
  };

  const handleRemoveMVP = async (mvpName) => {
    const newMvps = mvps.filter(m => m !== mvpName);
    setMvps(newMvps);

    try {
      await updateMatch(matchId, { mvps: newMvps });
    } catch (error) {
      alert('Error: ' + error.message);
      setMvps(mvps);
    }
  };

  const handlePlayerNoShow = async (playerId) => {
    try {
      await removePlayer(matchId, playerId);
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const getPlayersByPosition = () => {
    const positions = ['Arquero', 'Defensa', 'Medio-Delantero'];
    const grouped = {};

    positions.forEach(pos => {
      grouped[pos] = players.filter(p => p.position === pos).slice(0, getMaxByPosition(pos));
    });

    return grouped;
  };

  const getMaxByPosition = (position) => {
    if (position === 'Arquero') return 1;
    if (position === 'Defensa') return 3;
    if (position === 'Medio-Delantero') return 4;
    return 0;
  };

  const convocados = getPlayersByPosition();
  const totalConvocados = Object.values(convocados).reduce((sum, arr) => sum + arr.length, 0);
  const recambios = players.slice(totalConvocados);

  const shareUrl = `${window.location.origin}?match=${matchId}`;
  const adminUrl = `${window.location.origin}?match=${matchId}&admin=true`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">🐋 Panel de Admin</h1>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              ← Volver
            </button>
          </div>

          {!matchId && (
            <form onSubmit={handleCreateMatch} className="space-y-4">
              <input
                type="text"
                placeholder="Rival (ej: Padilla FC)"
                value={newMatchForm.rival}
                onChange={(e) => setNewMatchForm({ ...newMatchForm, rival: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={newMatchForm.fecha}
                  onChange={(e) => setNewMatchForm({ ...newMatchForm, fecha: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="time"
                  value={newMatchForm.hora}
                  onChange={(e) => setNewMatchForm({ ...newMatchForm, hora: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={creatingMatch}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {creatingMatch ? 'Creando...' : '✨ Crear Convocatoria'}
              </button>
            </form>
          )}

          {matchId && matchData && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                vs {matchData.rival || 'Rival'}
              </h2>
              <p className="text-gray-700 mb-2">
                📅 {matchData.fecha} | 🕐 {matchData.hora} | 📍 {matchData.cancha}
              </p>
              <p className="text-gray-600 text-sm">Precio: {matchData.partido}</p>
            </div>
          )}
        </div>

        {matchId && (
          <>
            {/* MVPs */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">⭐ MVPs (2 lugares garantizados)</h2>
              <div className="space-y-3">
                {mvps.map((mvp, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400"
                  >
                    <span className="font-semibold text-gray-800">{mvp}</span>
                    <button
                      onClick={() => handleRemoveMVP(mvp)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                <div className="flex gap-2 mt-4">
                  <input
                    id="mvp-input"
                    type="text"
                    placeholder="Nombre del MVP"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddMVP(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('mvp-input');
                      handleAddMVP(input.value);
                      input.value = '';
                    }}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition font-semibold"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>

            {/* Share Links */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📤 Compartir Convocatoria</h2>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      alert('Link copiado!');
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Copy size={18} />
                  </button>
                </div>
                <button
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Anotar aquí: ${shareUrl}`)}`)}
                  className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-semibold"
                >
                  Compartir por WhatsApp
                </button>
              </div>
            </div>

            {/* Convocados */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                📋 Convocados ({totalConvocados}/8)
              </h2>
              <div className="space-y-4">
                {['Arquero', 'Defensa', 'Medio-Delantero'].map(position => (
                  <div key={position}>
                    <h3 className="font-bold text-gray-700 mb-2">{position}s ({getMaxByPosition(position)})</h3>
                    <div className="space-y-1 mb-3">
                      {convocados[position]?.map(player => (
                        <div
                          key={player.id}
                          className="flex justify-between items-center bg-green-50 p-3 rounded-lg border-l-4 border-green-500"
                        >
                          <div className="font-semibold text-gray-800">{player.name}</div>
                          <button
                            onClick={() => handlePlayerNoShow(player.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                            title="Marcar como no juega"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recambio */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🔄 Recambio</h2>
              <div className="space-y-2">
                {recambios.length === 0 ? (
                  <p className="text-gray-500 italic">Sin recambio aún</p>
                ) : (
                  recambios.map((player, idx) => (
                    <div
                      key={player.id}
                      className="flex justify-between items-center bg-blue-50 p-3 rounded-lg"
                    >
                      <div>
                        <span className="font-semibold text-gray-800 mr-3">#{idx + 1}</span>
                        <span className="text-gray-700">{player.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({player.position})</span>
                      </div>
                      <button
                        onClick={() => handlePlayerNoShow(player.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
