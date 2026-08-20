# ⚡ Setup Rápido - 5 minutos

## Paso 1️⃣ Firebase (2 min)

1. Ve a https://console.firebase.google.com
2. **"Crear un proyecto"** → nombre: "arponeta"
3. Espera a que se cree
4. Menú izquierdo → **Build → Realtime Database**
5. **"Create Database"** → Ubicación: **São Paulo** → **Modo de prueba**
6. ⚙️ **Configuración** → **Configuración del Proyecto**
7. Baja a **"Tus apps"** → Click en **</>** 
8. **COPÍA ESTO:**
```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  databaseURL: "..."
};
```

## Paso 2️⃣ Código (2 min)

1. Abre tu terminal
2. ```bash
   git clone <este-repo> arponeta-web
   cd arponeta-web
   ```
3. Abre `.env.example` con un editor
4. **Renómbralo a `.env`**
5. Pega tus valores de Firebase (el paso anterior):
```
REACT_APP_FIREBASE_API_KEY=tu_api_key_aqui
REACT_APP_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu_proyecto_id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
REACT_APP_FIREBASE_APP_ID=tu_app_id
REACT_APP_FIREBASE_DATABASE_URL=https://tu_proyecto.firebaseio.com
```

## Paso 3️⃣ Instalar (1 min)

```bash
npm install
npm start
```

**¡Listo!** Se abre en http://localhost:3000

---

## 🚀 Deploy Gratis en Vercel

1. Sube tu código a GitHub (si no está)
2. Ve a https://vercel.com → **"Add New"** → **"Project"**
3. Importa tu repo
4. En **Environment Variables**, copia las 7 variables del `.env`
5. **Deploy**
6. Tenés tu URL pública para compartir ✨

---

## ❓ Problemas?

**Firebase no funciona**
- Verifica que Realtime Database está creado
- Chequea que la `databaseURL` es correcta

**"npm install" falla**
- Instala Node.js si no lo tenés: https://nodejs.org
- Prueba: `npm install --legacy-peer-deps`

**Vercel sigue dando error**
- Recarga la página después de deploy
- Chequea que las variables del `.env` están bien en Vercel

---

## 📖 Después: Cómo Usar

1. **Creas una convocatoria** en http://localhost:3000
2. **Copias el link** y lo mandas por WhatsApp
3. **Los jugadores entran** y se anotan
4. **Ves la lista en vivo** actualizada cada 1 segundo

¡Eso es todo! No más quilombos en WhatsApp ⚽🐋
