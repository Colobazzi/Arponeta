import React, { useState } from 'react';
import { registerPlayer, subscribePlayers } from '../firebase';

export default function PlayerForm({ matchId, matchData }) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('Defensa');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (matchId) {
      const unsubscribe = subscribePlayers(matchId, setPlayers);
      return unsubscribe;
    }
  }, [matchId]);

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

    // Validar que no se repita
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      setError('¡Ya estás anotado!');
      return;
    }

    setSubmitting(true);
    try {
      await registerPlayer(matchId, {
        name: name.trim(),
        position: position
      });

      setSubmitted(true);
      setName('');
      setPosition('Defensa');

      // Reset mensaje después de 3 segundos
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError('Error al anotarse: ' + err.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-blue-600 shadow-2xl">
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {submitted ? '✅ ¡Anotado!' : '📝 Anotarse'}
        </h2>

        {submitted && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded mb-4">
            <p className="text-green-800 font-semibold">
              ¡Bienvenido {name}! Chequea la lista de arriba para ver dónde entraste
            </p>
          </div>
        )}

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
