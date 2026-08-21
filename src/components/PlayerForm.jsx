import React, { useState, useEffect } from 'react';
import { registerPlayer, subscribePlayers, esperarUid } from '../firebase';

export default function PlayerForm({ matchId }) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('Defensa');
  const [submitting, setSubmitting] = useState(false);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');
  const [uid, setUid] = useState(null);

  // uid de ESTE dispositivo (login anónimo de Firebase)
  useEffect(() => {
    let vivo = true;
    esperarUid().then((valor) => {
      if (vivo) setUid(valor);
    });
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    if (!matchId) return;
    const unsubscribe = subscribePlayers(matchId, setPlayers);
    return unsubscribe;
  }, [matchId]);

  // ¿Este dispositivo ya anotó a alguien?
  const miAnotacion = uid ? players.find((p) => p.uid === uid || p.id === uid) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Ingresa tu nombre');
      return;
    }

    if (name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    if (players.some((p) => (p.name || '').toLowerCase() === name.trim().toLowerCase())) {
      setError('Ya hay alguien anotado con ese nombre');
      return;
    }

    setSubmitting(true);
    try {
      await registerPlayer(matchId, {
        name: name.trim(),
        position: position
      });
      setName('');
    } catch (err) {
      // Si las reglas de Firebase rechazan la escritura, casi siempre es
      // porque este dispositivo ya tiene una anotación.
      const esPermiso = (err?.code || '').includes('permission');
      setError(
        esPermiso
          ? 'Este dispositivo ya anotó a alguien. Solo se permite una anotación por celular.'
          : 'Error al anotarse: ' + err.message
      );
    }
    setSubmitting(false);
  };

  // ── Ya anotado: no mostramos el formulario ──
  if (miAnotacion) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-green-600 shadow-2xl">
        <div className="max-w-2xl mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">✅ Ya estás anotado</h2>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-3">
            <p className="text-green-900 font-semibold text-lg">
              {miAnotacion.name}
            </p>
            <p className="text-green-800 text-sm">{miAnotacion.position}</p>
          </div>

          <p className="text-sm text-gray-600">
            Mirá la lista de arriba para ver si quedaste de titular o de recambio.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Si al final no podés ir, avisale al que arma la lista para que te saque.
          </p>
        </div>
      </div>
    );
  }

  // ── Todavía cargando el uid ──
  if (!uid) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-blue-600 shadow-2xl">
        <div className="max-w-2xl mx-auto p-6">
          <p className="text-gray-500 italic">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-blue-600 shadow-2xl">
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">📝 Anotarse</h2>
        <p className="text-xs text-gray-500 mb-4">
          Una anotación por celular: anotate solo a vos mismo.
        </p>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded mb-4">
            <p className="text-red-800 font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tu nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Posición donde juegas
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              disabled={submitting}
            >
              <option value="Arquero">🧤 Arquero</option>
              <option value="Defensa">🛡️ Defensa</option>
              <option value="Medio-Delantero">⚽ Medio-Delantero</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? '⏳ Anotando...' : '✨ Anotarme'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          ⏱️ Tu hora de anotación se registra automáticamente
        </p>
      </div>
    </div>
  );
}
