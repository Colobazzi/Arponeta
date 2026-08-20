import React, { useState, useEffect } from 'react';
import { subscribePlayers } from '../firebase';
import { Star } from 'lucide-react';
import { armarEquipo, POSICIONES, FORMACION, TOTAL_TITULARES } from '../roster';

export default function LiveList({ matchId, matchData }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!matchId) return;
    const unsubscribe = subscribePlayers(matchId, setPlayers);
    return unsubscribe;
  }, [matchId]);

  const { convocados, recambios, totalConvocados, esMvp } = armarEquipo(
    players,
    matchData?.mvps
  );

  return (
    // pb-96 deja aire abajo para que el formulario fijo no tape la lista
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 mx-4 mt-4 max-w-2xl md:mx-auto pb-8">
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
            ✅ Convocados ({totalConvocados}/{TOTAL_TITULARES})
          </h2>

          <div className="space-y-3">
            {POSICIONES.map((position) => (
              <div key={position}>
                <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase">
                  {position}s - {convocados[position]?.length || 0}/{FORMACION[position]}
                </h3>
                <div className="space-y-1">
                  {convocados[position]?.length === 0 ? (
                    <div className="text-gray-400 italic text-sm px-3 py-2">Sin anotaciones</div>
                  ) : (
                    convocados[position].map((player, idx) => (
                      <div
                        key={player.id}
                        className={`flex items-center px-4 py-2 rounded-lg font-semibold text-gray-800 ${
                          esMvp(player)
                            ? 'bg-yellow-100 border-l-4 border-yellow-500'
                            : 'bg-green-100 border-l-4 border-green-500'
                        }`}
                      >
                        <span className="mr-3 text-gray-600">#{idx + 1}</span>
                        <span>{player.name}</span>
                        {esMvp(player) && (
                          <Star
                            size={18}
                            className="ml-auto text-yellow-600 fill-yellow-600"
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
        {totalConvocados < TOTAL_TITULARES && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
            <p className="text-amber-800 font-semibold">
              ⚠️ Aún hay {TOTAL_TITULARES - totalConvocados} lugar(es) disponible(s)
            </p>
          </div>
        )}

        {totalConvocados === TOTAL_TITULARES && (
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

      {/* Espacio para que el formulario fijo de abajo no tape el final */}
      <div className="h-80" />
    </div>
  );
}
