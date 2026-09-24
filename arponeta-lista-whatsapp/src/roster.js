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

// ──────────────────────────────────────────────────────────────
//  Texto para mandar al grupo de WhatsApp
// ──────────────────────────────────────────────────────────────

const EMOJI_POSICION = {
  'Arquero': '🧤',
  'Defensa': '🛡️',
  'Medio-Delantero': '⚽',
};

const DIAS_SEMANA = [
  'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
];

/** "2026-09-27" → "domingo 27/09". Se arma a mano para que no corra un día por zona horaria. */
export function formatearFecha(fecha) {
  if (!fecha) return '';
  const partes = String(fecha).split('-');
  if (partes.length !== 3) return String(fecha);

  const [anio, mes, dia] = partes.map(Number);
  if (!anio || !mes || !dia) return String(fecha);

  const d = new Date(anio, mes - 1, dia);
  if (isNaN(d.getTime())) return String(fecha);

  const dd = String(dia).padStart(2, '0');
  const mm = String(mes).padStart(2, '0');
  return `${DIAS_SEMANA[d.getDay()]} ${dd}/${mm}`;
}

/**
 * Arma la lista completa en texto plano, lista para copiar y pegar en WhatsApp.
 * Usa *asteriscos* para negrita y _guiones bajos_ para itálica, que es el
 * formato que entiende WhatsApp.
 */
export function textoParaWhatsApp({ matchData, players, mvps, link }) {
  const { convocados, recambios, totalConvocados, esMvp } = armarEquipo(players, mvps);
  const info = matchData || {};
  const lineas = [];

  // Encabezado
  lineas.push(`*🐋 ARPONETA vs ${info.rival || 'Rival'}*`);

  const cuando = [
    info.fecha ? `📅 ${formatearFecha(info.fecha)}` : '',
    info.hora ? `🕐 ${info.hora}` : ''
  ].filter(Boolean).join(' · ');
  if (cuando) lineas.push(cuando);
  if (info.cancha) lineas.push(`📍 ${info.cancha}`);
  if (info.partido) lineas.push(`💵 ${info.partido}`);
  lineas.push('');

  // Estado del equipo
  const faltan = TOTAL_TITULARES - totalConvocados;
  lineas.push(
    faltan > 0
      ? `*⚠️ EQUIPO (${totalConvocados}/${TOTAL_TITULARES}) — falta${faltan > 1 ? 'n' : ''} ${faltan}*`
      : `*✅ EQUIPO COMPLETO (${TOTAL_TITULARES}/${TOTAL_TITULARES})*`
  );
  lineas.push('');

  // Titulares por posición
  POSICIONES.forEach((posicion) => {
    const lista = convocados[posicion] || [];
    const cupo = FORMACION[posicion];
    const libres = cupo - lista.length;
    const plural = cupo > 1 ? 's' : '';

    let titulo = `${EMOJI_POSICION[posicion] || '•'} _${posicion}${plural}_`;
    if (libres > 0) titulo += ` (falta${libres > 1 ? 'n' : ''} ${libres})`;
    lineas.push(titulo);

    if (lista.length === 0) {
      lineas.push('—');
    } else {
      lista.forEach((jugador, i) => {
        lineas.push(`${i + 1}. ${jugador.name}${esMvp(jugador) ? ' ⭐' : ''}`);
      });
    }
    lineas.push('');
  });

  // Recambio
  lineas.push('*🔄 RECAMBIO* (por orden de anotación)');
  if (recambios.length === 0) {
    lineas.push('—');
  } else {
    recambios.forEach((jugador, i) => {
      lineas.push(`${i + 1}. ${jugador.name} (${jugador.position})`);
    });
  }

  if (normalizarMvps(mvps).length > 0) {
    lineas.push('');
    lineas.push('⭐ = MVP, lugar garantizado');
  }

  if (link) {
    lineas.push('');
    lineas.push(`👉 ${link}`);
  }

  return lineas.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
