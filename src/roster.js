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
 * Acepta el formato viejo de MVPs (["ian", "colo"]) y el nuevo
 * ([{ name: "ian", position: "Defensa" }]), para no romper las
 * convocatorias que ya estaban creadas.
 */
export function normalizarMvps(mvps) {
  return (mvps || [])
    .map((m) =>
      typeof m === 'string'
        ? { name: m, position: null }
        : { name: m?.name, position: m?.position || null }
    )
    .filter((m) => m.name && m.name.trim());
}

/**
 * Arma el equipo a partir de la lista de anotados.
 *
 * Reglas:
 *  1. Orden de anotación (timestamp) manda. El que se anota primero, entra primero.
 *  2. Los MVP tienen lugar garantizado: si el admin les cargó posición, YA ocupan
 *     su lugar en el equipo aunque todavía no hayan pasado por el formulario.
 *  3. Cada posición tiene un cupo (1 arquero, 3 defensas, 4 medio-delanteros).
 *  4. Todo el que no entró queda de recambio, ordenado por hora de anotación.
 *
 * @param {Array} players  jugadores anotados (con name, position, timestamp, id)
 * @param {Array} mvps     MVPs de la fecha anterior (strings u objetos {name, position})
 */
export function armarEquipo(players = [], mvps = []) {
  const listaMvps = normalizarMvps(mvps);
  const nombresMvp = listaMvps.map((m) => normalizar(m.name));
  const esMvp = (jugador) => nombresMvp.includes(normalizar(jugador?.name));

  const ordenados = [...players].sort(
    (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
  );

  // Un MVP con posición cargada ocupa su lugar desde el minuto cero.
  // Si además se anota por el formulario, gana el registro real y no se duplica.
  const yaSeAnoto = (nombre) =>
    ordenados.some((p) => normalizar(p.name) === normalizar(nombre));

  const reservasMvp = listaMvps
    .filter((m) => m.position && !yaSeAnoto(m.name))
    .map((m) => ({
      id: `mvp-${normalizar(m.name)}`,
      name: m.name,
      position: m.position,
      timestamp: 0,
      reservaMvp: true, // no pasó por el formulario, el lugar está guardado
    }));

  const todos = [...reservasMvp, ...ordenados];

  const convocados = {};
  const idsConvocados = new Set();

  POSICIONES.forEach((posicion) => {
    const delPuesto = todos.filter((p) => p.position === posicion);

    // Los MVP primero (respetando su orden entre ellos), después el resto.
    const fila = [...delPuesto.filter(esMvp), ...delPuesto.filter((p) => !esMvp(p))];

    const elegidos = fila.slice(0, FORMACION[posicion]);
    convocados[posicion] = elegidos;
    elegidos.forEach((p) => idsConvocados.add(p.id));
  });

  // Recambio = todos los que NO entraron, en orden de anotación.
  // (Antes esto se calculaba cortando la lista por cantidad, lo que hacía
  //  desaparecer jugadores y duplicar otros cuando sobraban de una posición.)
  const recambios = todos.filter((p) => !idsConvocados.has(p.id));

  const totalConvocados = POSICIONES.reduce(
    (suma, posicion) => suma + convocados[posicion].length,
    0
  );

  // MVPs que el admin cargó sin posición: no ocupan lugar hasta que se anoten.
  const mvpsSinPosicion = listaMvps.filter((m) => !m.position);

  return {
    convocados,
    recambios,
    totalConvocados,
    ordenados,
    esMvp,
    mvpsSinPosicion,
  };
}
