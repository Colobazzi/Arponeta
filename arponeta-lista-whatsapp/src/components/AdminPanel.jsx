import React, { useState, useEffect } from 'react';
import { createMatch, updateMatch, subscribePlayers, removePlayer } from '../firebase';
import { Copy, Trash2 } from 'lucide-react';
import { armarEquipo, normalizarMvps, textoParaWhatsApp, POSICIONES, FORMACION, TOTAL_TITULARES } from '../roster';

// Dominio PÚBLICO de la app (el de producción).
// Vercel también genera dominios de preview tipo "...-git-main-colito.vercel.app",
// pero esos están protegidos con login de Vercel: si compartís uno de esos,
// a los jugadores les pide registrarse. Por eso el link para compartir siempre
// se arma con este dominio fijo, no con el que tengas abierto en el navegador.
// Si algún día le cambiás el nombre al proyecto en Vercel, actualizá esta línea.
const SITIO_PUBLICO = 'https://arponetasistanotacionn.vercel.app';

/** Copia al portapapeles. Tiene plan B para navegadores viejos de celular. */
async function copiarAlPortapapeles(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = texto;
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

export default function AdminPanel({ matchId, matchData, onMatchCreated, onBack }) {
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
  const [mvpName, setMvpName] = useState('');
  const [mvpPosition, setMvpPosition] = useState('Defensa');
  const [textoEditado, setTextoEditado] = useState(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!matchId) return;
    const unsubscribe = subscribePlayers(matchId, setPlayers);
    return unsubscribe;
  }, [matchId]);

  // Los MVP viven en Firebase, no solo en memoria: si recargás, siguen ahí.
  useEffect(() => {
    setMvps(normalizarMvps(matchData?.mvps));
  }, [matchData]);

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (!newMatchForm.rival.trim()) {
      alert('Ingresa el nombre del rival');
      return;
    }

    setCreatingMatch(true);
    try {
      const newId = await createMatch({
        rival: newMatchForm.rival.trim(),
        fecha: newMatchForm.fecha,
        hora: newMatchForm.hora,
        cancha: newMatchForm.cancha,
        partido: newMatchForm.partido,
        mvps: []
      });

      // Avisar al App para que cambie de pantalla y escuche esta convocatoria.
      if (onMatchCreated) onMatchCreated(newId);
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setCreatingMatch(false);
  };

  const handleAddMVP = async () => {
    if (!matchId) {
      alert('Crea una convocatoria primero');
      return;
    }

    const nombre = mvpName.trim();
    if (!nombre) return;

    const yaEsta = mvps.some(
      (m) => m.name.trim().toLowerCase() === nombre.toLowerCase()
    );
    if (yaEsta) {
      alert('Ese MVP ya está cargado');
      return;
    }

    const nuevos = [...mvps, { name: nombre, position: mvpPosition }];
    setMvps(nuevos);
    setMvpName('');

    try {
      await updateMatch(matchId, { mvps: nuevos });
    } catch (error) {
      alert('Error al agregar MVP: ' + error.message);
      setMvps(mvps);
    }
  };

  const handleRemoveMVP = async (nombre) => {
    const nuevos = mvps.filter((m) => m.name !== nombre);
    setMvps(nuevos);

    try {
      await updateMatch(matchId, { mvps: nuevos });
    } catch (error) {
      alert('Error: ' + error.message);
      setMvps(mvps);
    }
  };

  const handlePlayerNoShow = async (playerId) => {
    if (!window.confirm('¿Sacar a este jugador de la lista?')) return;
    try {
      await removePlayer(matchId, playerId);
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const { convocados, recambios, totalConvocados, esMvp, mvpsSinPosicion } =
    armarEquipo(players, mvps);

  const shareUrl = matchId ? `${SITIO_PUBLICO}?match=${matchId}` : '';

  // Lista en texto plano, lista para pegar en WhatsApp.
  const textoGenerado = textoParaWhatsApp({
    matchData,
    players,
    mvps,
    link: shareUrl
  });
  const textoFinal = textoEditado !== null ? textoEditado : textoGenerado;

  const handleCopiarLista = async () => {
    const ok = await copiarAlPortapapeles(textoFinal);
    if (ok) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } else {
      alert('No se pudo copiar solo. Seleccioná el texto del recuadro y copialo a mano.');
    }
  };

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
              <input
                type="text"
                placeholder="Cancha"
                value={newMatchForm.cancha}
                onChange={(e) => setNewMatchForm({ ...newMatchForm, cancha: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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

          {matchId && !matchData && (
            <p className="text-gray-500 italic">Cargando convocatoria...</p>
          )}
        </div>

        {matchId && (
          <>
            {/* MVPs */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">⭐ MVPs</h2>
              <p className="text-sm text-gray-500 mb-4">
                Lugar garantizado: ocupan su puesto en el equipo desde ahora, sin
                necesidad de anotarse.
              </p>
              <div className="space-y-3">
                {mvps.length === 0 && (
                  <p className="text-gray-400 italic text-sm">Sin MVPs cargados</p>
                )}

                {mvps.map((mvp, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400"
                  >
                    <div>
                      <span className="font-semibold text-gray-800">{mvp.name}</span>
                      {mvp.position ? (
                        <span className="text-sm text-gray-600 ml-2">
                          ({mvp.position})
                        </span>
                      ) : (
                        <span className="text-sm text-red-600 ml-2">
                          ⚠️ sin posición — no ocupa lugar
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveMVP(mvp.name)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                {mvpsSinPosicion.length > 0 && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-lg text-sm text-red-800">
                    Hay {mvpsSinPosicion.length} MVP(s) cargado(s) antes de que
                    existiera el campo de posición. Borralos y volvé a agregarlos
                    eligiendo la posición, así ocupan su lugar en la lista.
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <input
                    type="text"
                    placeholder="Nombre del MVP"
                    value={mvpName}
                    onChange={(e) => setMvpName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMVP();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <select
                    value={mvpPosition}
                    onChange={(e) => setMvpPosition(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    {POSICIONES.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddMVP}
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
                  onClick={() =>
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(`Anotate acá: ${shareUrl}`)}`
                    )
                  }
                  className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-semibold"
                >
                  Compartir por WhatsApp
                </button>
              </div>
            </div>

            {/* Lista en texto para mandar al grupo */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-start gap-3 mb-1">
                <h2 className="text-2xl font-bold text-gray-800">📄 Lista para el grupo</h2>
                {textoEditado !== null && (
                  <button
                    onClick={() => setTextoEditado(null)}
                    className="shrink-0 text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-semibold hover:bg-gray-200 transition border border-gray-300"
                  >
                    ↻ Regenerar
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-4">
                La lista completa en texto, para que no tengan que entrar al link.
                Se actualiza sola. Podés editarla antes de mandarla.
              </p>

              <textarea
                value={textoFinal}
                onChange={(e) => setTextoEditado(e.target.value)}
                rows={16}
                spellCheck={false}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <button
                  onClick={handleCopiarLista}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition text-white ${
                    copiado ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {copiado ? (
                    '✅ ¡Copiado!'
                  ) : (
                    <>
                      <Copy size={18} /> Copiar lista
                    </>
                  )}
                </button>
                <button
                  onClick={() =>
                    window.open(`https://wa.me/?text=${encodeURIComponent(textoFinal)}`)
                  }
                  className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-bold"
                >
                  Mandar por WhatsApp
                </button>
              </div>
            </div>

            {/* Convocados */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                📋 Convocados ({totalConvocados}/{TOTAL_TITULARES})
              </h2>
              <div className="space-y-4">
                {POSICIONES.map((position) => (
                  <div key={position}>
                    <h3 className="font-bold text-gray-700 mb-2">
                      {position}s ({convocados[position]?.length || 0}/{FORMACION[position]})
                    </h3>
                    <div className="space-y-1 mb-3">
                      {convocados[position]?.length === 0 ? (
                        <div className="text-gray-400 italic text-sm px-3 py-2">
                          Sin anotaciones
                        </div>
                      ) : (
                        convocados[position].map((player) => (
                          <div
                            key={player.id}
                            className={`flex justify-between items-center p-3 rounded-lg border-l-4 ${
                              esMvp(player)
                                ? 'bg-yellow-50 border-yellow-500'
                                : 'bg-green-50 border-green-500'
                            }`}
                          >
                            <div className="font-semibold text-gray-800">
                              {esMvp(player) && '⭐ '}
                              {player.name}
                              {player.reservaMvp && (
                                <span className="text-xs font-normal text-gray-500 ml-2">
                                  lugar guardado (MVP)
                                </span>
                              )}
                            </div>
                            {player.reservaMvp ? (
                              <button
                                onClick={() => handleRemoveMVP(player.name)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                title="Sacar el lugar guardado"
                              >
                                <Trash2 size={18} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePlayerNoShow(player.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                title="Marcar como no juega"
                              >
                                <Trash2 size={18} />
                              </button>
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                🔄 Recambio ({recambios.length})
              </h2>
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
                        onClick={() =>
                          player.reservaMvp
                            ? handleRemoveMVP(player.name)
                            : handlePlayerNoShow(player.id)
                        }
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
