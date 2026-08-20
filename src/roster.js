// Lógica central del equipo: quién entra y quién queda de recambio.
// Vive en un solo archivo para que el panel de admin y la lista pública
// SIEMPRE muestren exactamente lo mismo.

export const POSICIONES = ['Arquero', 'Defensa', 'Medio-Delantero'];

export const FORMACION = {
  'Arquero': 1,
  'Defensa': 3,
  'Medio-Delantero': 4,
};

export const TOTAL_TITULARES = Object.values(FORMACION).reduce((a, b) => a + b, 0); // 8

const normalizar = (texto) => (texto || '').trim().toLowerCase();

/**
 * Arma el equipo a partir de la lista de anotados.
 *
 * Reglas:
 *  1. Orden de anotación (timestamp) manda. El que se anota primero, entra primero.
 *  2. Los MVP tienen lugar garantizado: van al frente de la fila de SU posición.
 *  3. Cada posición tiene un cupo (1 arquero, 3 defensas, 4 medio-delanteros).
 *  4. Todo el que no entró queda de recambio, ordenado por hora de anotación.
 *
 * @param {Array} players  jugadores anotados (con name, position, timestamp, id)
 * @param {Array} mvps     nombres de los MVP de la fecha anterior
 */
export function armarEquipo(players = [], mvps = []) {
  const ordenados = [...players].sort(
    (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
  );

  const nombresMvp = (mvps || []).map(normalizar);
  const esMvp = (jugador) => nombresMvp.includes(normalizar(jugador?.name));

  const convocados = {};
  const idsConvocados = new Set();

  POSICIONES.forEach((posicion) => {
    const delPuesto = ordenados.filter((p) => p.position === posicion);

    // Los MVP primero (respetando su orden entre ellos), después el resto.
    const fila = [...delPuesto.filter(esMvp), ...delPuesto.filter((p) => !esMvp(p))];

    const elegidos = fila.slice(0, FORMACION[posicion]);
    convocados[posicion] = elegidos;
    elegidos.forEach((p) => idsConvocados.add(p.id));
  });

  // Recambio = todos los que NO entraron, en orden de anotación.
  // (Antes esto se calculaba cortando la lista por cantidad, lo que hacía
  //  desaparecer jugadores y duplicar otros cuando sobraban de una posición.)
  const recambios = ordenados.filter((p) => !idsConvocados.has(p.id));

  const totalConvocados = POSICIONES.reduce(
    (suma, posicion) => suma + convocados[posicion].length,
    0
  );

  return { convocados, recambios, totalConvocados, ordenados, esMvp };
}
