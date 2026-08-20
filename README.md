# 🐋 Arponeta - Sistema de Anotación

Sistema web funcional para gestionar anotaciones de jugadores en tu equipo de fútbol 8 "Arponeta". Resuelve el problema del WhatsApp caótico con una plataforma en tiempo real.

## ✨ Características

✅ **Admin Panel**: Crea convocatorias, agrega MVPs, ve todo en vivo
✅ **Formulario Fácil**: Los jugadores se anotan con 2 clicks (nombre + posición)
✅ **Lista en Vivo**: Todos ven actualizado en tiempo real quién se anotó
✅ **Posiciones Automáticas**: Sistema inteligente que ordena por posición
✅ **Recambios Ordenados**: Respeta el orden exacto de anotación
✅ **MVPs Destacados**: Con estrella visual para identificarlos
✅ **Compartible**: Link única para cada convocatoria
✅ **Mobile-First**: Optimizado para teléfono (donde juega el fútbol)

## 🚀 Setup en 5 Minutos

### Paso 1: Crear proyecto en Firebase

1. Accede a [Firebase Console](https://console.firebase.google.com)
2. Click en "Crear un proyecto"
3. Nombre: "arponeta" (o lo que quieras)
4. Acepta los términos y crea
5. Espera a que se cree (1-2 minutos)

### Paso 2: Activar Realtime Database

1. En el menú izquierdo, ve a **Build > Realtime Database**
2. Click "Create Database"
3. Selecciona ubicación: **sudamerica (São Paulo)** (o la más cercana)
4. Selecciona **Empezar en modo de prueba**
5. Click "Enable"

### Paso 3: Conseguir las credenciales

1. Click en el ícono de **⚙️ Configuración** (arriba a la izquierda)
2. Click en **Configuración del Proyecto**
3. Baja a **Tus apps** y haz click en **</>** (si no hay, click en "Registrar app")
4. Copia todo lo que ves en `const firebaseConfig = { ... }`

### Paso 4: Configurar el código

1. Clona o descarga este proyecto
2. Abre `.env.example` y renómbralo a `.env`
3. Pega los valores que copiaste de Firebase:
   - `apiKey` → `REACT_APP_FIREBASE_API_KEY`
   - `authDomain` → `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `REACT_APP_FIREBASE_PROJECT_ID`
   - `storageBucket` → `REACT_APP_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `REACT_APP_FIREBASE_APP_ID`
   - `databaseURL` → `REACT_APP_FIREBASE_DATABASE_URL`

### Paso 5: Instalar y correr

```bash
npm install
npm start
```

Se abre automáticamente en `http://localhost:3000`

## 📤 Deploy en Vercel (Gratis)

Para que tu equipo acceda desde cualquier lado:

1. Sube el código a GitHub
2. Accede a [Vercel](https://vercel.com)
3. Click "Import Project" → selecciona tu repo
4. En **Environment Variables**, agrega las mismas variables del `.env`
5. Click "Deploy"
6. ¡Listo! Tenés tu URL pública

## 🎮 Cómo Usar

### Para ti (Admin)

1. Entra en la app
2. Click "Crear Nueva Convocatoria"
3. Llena:
   - Rival
   - Fecha
   - Hora
   - (El resto es opcional)
4. Se abre el panel de admin donde puedes:
   - Agregar 2 MVPs (con estrella)
   - Copiar el link para compartir
   - Ver la lista en vivo
   - Marcar jugadores como "no juega" (sube el siguiente)

### Para los jugadores

1. Reciben tu link por WhatsApp
2. Entran y ven la lista en vivo
3. Llenan: nombre + posición
4. Clickean "Anotarme"
5. ¡Aparecen automáticamente en la lista!

## 🏆 Lógica de Anotación

```
Convocados (8 lugares):
  - 1 Arquero
  - 3 Defensas
  - 4 Medios-Delanteros

Recambio: Ordenados por hora de anotación (FIFO)

MVPs: Los 2 primeros lugares están garantizados
      (si se bajan, su lugar no sube, solo el recambio)
```

## 📱 Características Avanzadas

### Cambiar posiciones de jugadores
Desde el admin, si necesitas cambiar a un jugador de posición, marca como "no juega" y vuelve a anotarse.

### Resetear convocatoria
Borra todos los jugadores desde Firebase Console → Realtime Database.

### Histórico de jugadores
En el futuro podemos agregar: histórico de asistencia, estadísticas, etc.

## 🔧 Stack Técnico

- **Frontend**: React 18 + Tailwind CSS
- **Backend**: Firebase Realtime Database
- **Auth**: Firebase Auth (anónimo)
- **Hosting**: Vercel (recomendado) o cualquier CDN
- **Real-time**: Firebase Realtime Database (30+ updates/seg)

## 🐛 Troubleshooting

**"Error: Firebase is not initialized"**
→ Chequea que el `.env` tiene todas las variables

**"No funciona en tiempo real"**
→ Verifica que Realtime Database está activada en Firebase

**"El link no funciona para otros"**
→ Asegúrate de haber deployado en Vercel, no solo local

**"Se cuelga en el formulario"**
→ Recarga la página, a veces hay lag de Firebase

## 📞 Soporte

Si algo no funciona:
1. Chequea la consola del navegador (F12 → Console)
2. Verifica que Firebase está configurado correctamente
3. Prueba con `npm start` para modo desarrollo

## 🚀 Mejoras Futuras

- [ ] Foto de perfil para cada jugador
- [ ] Estadísticas de asistencia
- [ ] Sistema de ratings/puntos
- [ ] Notificaciones cuando abres el formulario
- [ ] Historial de partidos
- [ ] Disponibilidad automática (calendario)

---

**Hecho con ❤️ para que el futbolito sea organizado y sin quilombos en WhatsApp** ⚽
