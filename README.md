# 🎁 Motor de Fidelización, Juego QR & Referidos para Restaurantes

> Sistema interactivo de gamificación en mesa, captura de leads calificados, bucle viral de referidos por WhatsApp y embudo de reputación para Google Maps.
> **Arquitectura ligera: frontend React (app del comensal + panel de administración) y un backend Node.js sin dependencias con persistencia local en `db.json`.**

---

## 🏗️ Arquitectura

Este proyecto tiene **tres piezas**:

| Pieza | Qué es | Cómo se sirve |
|-------|--------|---------------|
| **App del comensal** | La web-app de 8 pasos (ruleta, sellos, misiones, reputación) | `index.html` → `src/App.tsx` |
| **Panel de administración** | Dashboard del dueño/cajero (mesas, premios, push, WiFi, geofencing, NFC) | `admin.html` → `src/admin/` |
| **Backend API** | Servidor Node.js nativo (0 dependencias de runtime) | `server/` en el puerto `3001` |

El frontend (Vite) habla con el backend a través de `/api/*`. En desarrollo, Vite proxya `/api` a `http://localhost:3001`. En producción se usa `VITE_API_URL` o el mismo host.

**Persistencia:** el backend guarda el estado en `server/db.json` (se genera solo la primera vez). Los secretos (PINs, API keys) **no** van en el código ni en `db.json`: se configuran por variables de entorno (ver `server/.env.example`).

> Nota: integraciones como Google Sheets, Supabase, WhatsApp/Meta y el geofencing en segundo plano (app nativa) quedan listas para conectar pero requieren credenciales/hardware propios (ver `PENDIENTES.md`).

> 📘 **Guía técnica paso a paso de cada sistema** (configuración de juego, marca, PIN, Composio, Hermes, portal WiFi, push, etc.): ver [`GUIA_TECNICA_SISTEMAS.md`](./GUIA_TECNICA_SISTEMAS.md).

---

## 🚀 Características Principales

1. **📱 Interacción Táctil en Sala (NFC + QR):**
   - El comensal acerca su teléfono al chip NFC o escanea el QR al pedir la cuenta.
   - Carga instantánea como Web App (PWA) en menos de 1 segundo sin descargar aplicaciones.
   - Detección automática de mesa o modo flexible *"Consumo de Hoy"*.

2. **📸 Subida de Historia en Instagram con Compresión Automática:**
   - Para desbloquear la ruleta, el cliente comparte una foto etiquetando al restaurante.
   - Compresor móvil integrado que reduce fotos de 15 MB a 180 KB en 0.2 segundos (cero cuelgues en iPhone o Android).
   - Incluye botón de prueba rápida (*Modo Demo*).

3. **🎰 Ruleta de Premios con Aceleración por Hardware (GPU):**
   - Animación fluida a 60 FPS con física Bézier realista de 5.2 segundos (7 vueltas de emoción).
   - Aguja triangular dorada de alta precisión.
   - Ponderación matemática de probabilidades (descuentos, café gratis, postres o cena mayor).
   - Disparo de confeti festivo con `canvas-confetti`.

4. **🔒 Voucher Digital Anticopia con Validación PIN de 4 Dígitos:**
   - Código único alfanumérico (`VIP-XXXXX`) y código QR dorado con isotipo de marca.
   - Botón de cobro protegido con un **teclado numérico táctil de 4 dígitos** para meseros o cajeras.

5. **📊 Persistencia Local Ligera (`db.json`) con Sincronización Opcional:**
   - Backend Node.js sin dependencias; el estado se guarda en `server/db.json`.
   - Cada premio ganado y cada canje en caja quedan registrados con fecha y hora.
   - Conectores opcionales a Google Sheets / Supabase disponibles para sincronizar en la nube (requieren tus credenciales).

6. **⭐ Embudo Inteligente de Reputación:**
   - **4 a 5 estrellas:** Redirección automática a **Google Maps Reviews** para multiplicar reseñas positivas.
   - **1 a 3 estrellas:** Enrutamiento privado a **WhatsApp** de la gerencia para resolver quejas internamente.

7. **👥 Bucle Viral «Refer-a-Friend» (Recomienda a un Amigo):**
   - Tras ganar, el cliente puede regalarle a un amigo un pase de bienvenida con 1 toque en WhatsApp.
   - Adquisición orgánica de clientes nuevos a costo \$0.

---

## 📁 Estructura del Proyecto

```
juegoreferidos/
├── server/                   # BACKEND Node.js (0 dependencias de runtime)
│   ├── index.js              # Punto de entrada + router + auth + CORS
│   ├── state.js              # Estado en memoria, persistencia db.json, env
│   ├── modules/              # Un módulo por dominio
│   │   ├── auth.js           # Login por PIN + token de sesión
│   │   ├── tables.js         # Mesas en tiempo real
│   │   ├── loyalty.js        # Sellos, ruleta, validación PIN, concurso
│   │   ├── missions.js       # Misiones gamificadas
│   │   ├── hermes.js         # Conector WhatsApp IA (ping real)
│   │   ├── reputation.js     # Embudo de reseñas
│   │   ├── config.js         # Configuración, métricas, backups
│   │   ├── push.js           # Web Push + Geofencing
│   │   ├── captive-portal.js # Portal cautivo WiFi (MikroTik/UniFi)
│   │   └── nfc.js            # Asistente NFC/QR por mesa
│   ├── __tests__/            # Pruebas de integración (Vitest)
│   ├── .env.example          # Plantilla de variables de entorno
│   └── db.example.json       # Estructura de ejemplo (sin secretos)
├── src/
│   ├── admin/                # PANEL de administración (admin.html)
│   ├── assets/               # Logos, isotipos dorados y fotografías
│   ├── components/
│   │   ├── qr-game/          # Módulos del juego (Ruleta, PIN, Voucher, etc.)
│   │   └── shared/           # Animaciones suaves Reveal
│   ├── context/              # Soporte bilingüe (Español / Inglés)
│   ├── lib/                  # apiClient, servicios y utilidades
│   ├── App.tsx               # App del comensal
│   ├── index.css             # Estilos y variables de diseño
│   └── main.tsx              # Punto de entrada de React
├── .env.example              # Variables del frontend (VITE_API_URL, etc.)
├── package.json
└── vite.config.ts
```

---

## 🛠️ Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/kmilo1978/juegoreferidos.git
cd juegoreferidos
```

### 2. Instalar dependencias
```bash
npm install
# o con bun:
bun install
```

### 3. Configurar variables de entorno (opcional en dev)
```bash
# Backend: copia la plantilla y ajusta PINs / credenciales
cp server/.env.example server/.env

# Frontend: copia la plantilla (en dev puede quedar vacío)
cp .env.example .env
```

### 4. Iniciar el backend (API en el puerto 3001)
```bash
# Con las variables del .env (Node 20+):
node --env-file=server/.env server/index.js
# o sin .env (usa valores por defecto de desarrollo):
npm run server
```

### 5. Iniciar el frontend en modo desarrollo
```bash
npm run dev
# o con bun:
bun dev
```
Abre en tu navegador:
- App del comensal: `http://localhost:5173`
- Panel de administración: `http://localhost:5173/admin`

> El frontend proxya automáticamente `/api` al backend en `http://localhost:3001`.

### 6. Ejecutar las pruebas
```bash
npm test
```
Corre la suite de integración del backend (autenticación, canje de PIN sin backdoor, sellos anti-duplicado, saneo de secretos, portal cautivo).

---

## 🔐 Seguridad

- **PINs y API keys** se definen por variables de entorno (`server/.env`), nunca en el código ni en `db.json`.
- **Endpoints administrativos** (escritura) requieren un token de sesión: el panel hace login con el PIN (`POST /api/auth/login`) y envía `Authorization: Bearer <token>`.
- **`GET /api/config`** nunca devuelve PINs ni claves (se enmascaran como `***`).
- **CORS** se restringe con `ALLOWED_ORIGINS` en producción.
- `server/db.json` y los `.env` están en `.gitignore` (no se versionan).

---

## ⚙️ Configuración para un Nuevo Negocio (en 3 Pasos)

1. **Configurar Datos del Negocio en `src/data/site.ts`:**
   - Actualiza el número de WhatsApp oficial.
   - Coloca el enlace directo de reseñas de Google Maps de tu negocio.
   - Pega la URL del Webhook de Google Sheets.
2. **Desplegar el Webhook de Google Sheets:**
   - Sigue las instrucciones dentro de `google-apps-script/Code.gs`.
   - Crea tu hoja de cálculo y copia la URL generada.
3. **Personalizar Premios y Probabilidades en `src/components/qr-game/gameTypes.ts`:**
   - Edita los nombres, porcentajes y condiciones de cada premio asegurando que sumen 100%.

Para el manual exhaustivo de replicación en otros negocios (pizzerías, hamburgueserías, bares), consulta el archivo [`DOCUMENTACION_Y_MANIFIESTO.md`](./DOCUMENTACION_Y_MANIFIESTO.md).

---

## 📄 Licencia

Desarrollado para uso propio y distribución comercial en restaurantes y comercios.
