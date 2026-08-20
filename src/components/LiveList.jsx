import React, { useState, useEffect } from 'react';
import { subscribePlayers } from '../firebase';
import { Star } from 'lucide-react';

export default function LiveList({ matchId, matchData }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!matchId) return;
    const unsubscribe = subscribePlayers(matchId, setPlayers);
    return unsubscribe;
  }, [matchId]);

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

  const isMVP = (playerName) => {
    return matchData?.mvps?.includes(playerName);
  };

  const convocados = getPlayersByPosition();
  const totalConvocados = Object.values(convocados).reduce((sum, arr) => sum + arr.length, 0);
  const recambios = players.slice(totalConvocados);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 mx-4 mt-4 max-w-2xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          🐋 Arponeta vs {matchData?.rival || 'Rival'}
        </h1>
        <p className="text-gray-600 mt-2">
          📅 {matchData?.fecha} | 🕐 {matchData?.hora} | 📍 {matchData?.cancha}
        </p>
      </div>

      <div className="space-y-6">
        {/* Convocados */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            ✅ Convocados ({totalConvocados}/8)
          </h2>

          <div className="space-y-3">
            {['Arquero', 'Defensa', 'Medio-Delantero'].map(position => (
              <div key={position}>
                <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase">
                  {position}s - {convocados[position]?.length || 0}/{getMaxByPosition(position)}
                </h3>
                <div className="space-y-1">
                  {convocados[position]?.length === 0 ? (
                    <div className="text-gray-400 italic text-sm px-3 py-2">Sin anotaciones</div>
                  ) : (
                    convocados[position].map((player, idx) => (
                      <div
                        key={player.id}
                        className={`flex items-center px-4 py-2 rounded-lg font-semibold text-gray-800 ${
                          isMVP(player.name)
                            ? 'bg-yellow-100 border-l-4 border-yellow-500'
                            : 'bg-green-100 border-l-4 border-green-500'
                        }`}
                      >
                        <span className="mr-3 text-gray-600">#{idx + 1}</span>
                        <span>{player.name}</span>
                        {isMVP(player.name) && (
                          <Star
                            size={18}
                            className="ml-auto text-yellow-600 fill-yellow-600"
                            title="MVP de la fecha anterior"
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recambio */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🔄 Recambio ({recambios.length})
          </h2>
          <div className="space-y-1">
            {recambios.length === 0 ? (
              <div className="text-gray-400 italic text-sm px-3 py-2">Sin recambio</div>
            ) : (
              recambios.map((player, idx) => (
                <div
                  key={player.id}
                  className="flex items-center px-4 py-2 rounded-lg bg-blue-100 border-l-4 border-blue-500 font-semibold text-gray-800"
                >
                  <span className="mr-3 text-gray-600">#{idx + 1}</span>
                  <span>{player.name}</span>
                  <span className="ml-auto text-xs text-gray-500">({player.position})</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Spots disponibles */}
        {totalConvocados < 8 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
            <p className="text-amber-800 font-semibold">
              ⚠️ Aún hay {8 - totalConvocados} lugar(es) disponible(s)
            </p>
          </div>
        )}

        {totalConvocados === 8 && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <p className="text-green-800 font-semibold">
              ✅ Equipo completo! Recambios ordenados por hora de anotación
            </p>
          </div>
        )}
      </div>

      {/* Aviso en vivo */}
      <div className="mt-6 text-center text-xs text-gray-500 animate-pulse">
        🟢 En vivo - actualizándose automáticamente
      </div>
    </div>
  );
}
