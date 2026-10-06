# Guía Técnica de Sistemas — Implementación Paso a Paso

> Documento operativo para integradores y desarrolladores. Describe **cómo está
> construido realmente** cada sistema (no el ideal), con rutas de archivo, flujo
> de datos y los pasos concretos para activarlo. Complementa al
> `DOCUMENTACION_Y_MANIFIESTO.md` (que explica el *qué* y el *porqué* de negocio).

**Stack:** React 19 + TypeScript + Vite + Tailwind v4 (frontend `src/`) · Node HTTP nativo (backend `server/`) · persistencia en `server/db.json`.

**Verificación local:**
```bash
node node_modules/typescript/bin/tsc --noEmit   # 0 errores
npm test                                         # 23/23 (backend)
node node_modules/vite/bin/vite.js build         # build de producción
```

---

## 0. Mapa de sistemas

| Sistema | Frontend | Backend | Estado |
|---------|----------|---------|--------|
| Configuración de juego / pasos | `src/lib/funnelSteps.ts`, `src/lib/gameConfigService.ts`, `src/admin/pages/GameMode.tsx` | `/api/game-config` (`server/modules/loyalty.js`) | Funcional |
| Minijuegos (6) | `src/components/qr-game/Step*Game.tsx` | — (lógica en cliente) | Funcional |
| Marca / branding dinámico | `src/lib/brandService.ts`, `src/admin/pages/AdminConfig.tsx` | `/api/config` (`server/modules/config.js`) | Funcional |
| Seguridad / PIN de caja | `src/lib/tableSecurityService.ts`, `src/components/qr-game/PinAuthModal.tsx` | `/api/auth/*` (`server/modules/auth.js`) | Funcional |
| Sellos / fidelización | `src/lib/stampService.ts`, `src/components/qr-game/StepDigitalStamps.tsx` | `/api/stamps/*` (`server/modules/loyalty.js`) | Funcional |
| Reputación (reseñas) | `src/components/qr-game/StepFeedback.tsx` | `/api/reputation/*` (`server/modules/reputation.js`) | Funcional |
| Misiones | `src/components/qr-game/StepMissions.tsx`, `MissionsModal.tsx` | `/api/missions/*` (`server/modules/missions.js`) | Funcional |
| Portal WiFi / Kiosko | `KioskCaptivePortalModal.tsx` | `/api/portal/*` (`server/modules/captive-portal.js`) | Funcional |
| Push (notificaciones) | `PushNotificationPrompt.tsx`, `oneSignalService.ts` | `/api/push/*` (`server/modules/push.js`) | Requiere OneSignal |
| **Composio** (Sheets/CRM) | `src/lib/composioService.ts`, `src/admin/pages/Composio.tsx` | `/api/integrations/composio/*` (`server/modules/config.js`) | **Híbrido / parcial** |
| **Hermes** (conector omnicanal) | `src/admin/pages/Hermes.tsx` | `/api/hermes/*` (`server/modules/hermes.js`) | **Conector + monitor** |
| Supabase (opcional) | `src/lib/supabaseService.ts` | — (REST directo) | Opcional |

---

## 1. Configuración de juego y pasos del embudo

**Fuente única de verdad de los pasos:** `src/lib/funnelSteps.ts`
- `FUNNEL_STEPS` define los 8 pasos canónicos (id, número, nombre, si se puede desactivar).
- `normalizeActiveStepIds()` tolera configuraciones antiguas y descarta ids inválidos.

**Flujo de activación de pasos:**
1. El admin entra a **GameMode** (`src/admin/pages/GameMode.tsx`) y activa/desactiva pasos y elige el minijuego.
2. Al guardar → `POST /api/game-config` con `{ activeSteps, gameMode, ... }` (requiere token admin).
3. El backend (`server/modules/loyalty.js`) mergea y persiste en `db.settings.gameConfig`.
4. La app del comensal (`src/App.tsx`) sincroniza cada 4s con `GameConfigService.syncFromBackend()` y respeta `isStepActive()` para saltar pasos inactivos.

**Pasos para añadir un paso nuevo:** definirlo en `FUNNEL_STEPS`, renderizarlo en `App.tsx` bajo su `currentStep`, y añadir su id al checklist de `GameMode.tsx` (que ya deriva de `FUNNEL_STEPS`).

---

## 2. Minijuegos

Seis minijuegos autónomos en `src/components/qr-game/`: Ruleta, Precisión (cronómetro), Raspa y Gana, Memoria, Descubre y Gana, Jackpot y Plinko. Cada uno:
- Recibe `onWinPrize(prizeName, prizeValue)` y lo llama al ganar.
- Decide el premio por **probabilidad ponderada** configurable (o por habilidad en Memory).
- El juego activo se elige en el panel (`GamesHub`) y se guarda en `gameConfig.gameMode`; la app lo resuelve en el Paso 3.

**Confetti y color de marca:** usan `brandConfettiColors()` de `brandService.ts`, que resuelve `--gold` en runtime para que el confetti siga el color configurado.

---

## 3. Marca / branding dinámico

**Servicio:** `src/lib/brandService.ts`
- `getBrandConfig()` lee `localStorage["juegoreferidos_brand_identity"]` o cae a `clientConfig`.
- `saveBrandConfig()` persiste y aplica EN VIVO: `applyBrandColors()` publica las variables CSS `--gold`, `--gold-light`, `--primary-color`; `applyBrandFonts()` carga fuentes de Google.
- Toda la UI usa `var(--gold)` → cambiar el color en el panel propaga el dorado a toda la app.

**Flujo:** AdminConfig → `saveBrandConfig()` → localStorage + `POST /api/config` (backend) → el comensal lo recibe en el sync de `/api/config`.

---

## 4. Seguridad / PIN de caja

**Servicio:** `src/lib/tableSecurityService.ts`
- `authenticatePin(pin)` devuelve el rol (`owner`/`admin`/`cashier`) o `null`. Compara **solo** contra los PINs configurados (sin PINs de respaldo ni backdoors).
- Defaults de fábrica (hasta que el dueño los cambie): dueño `8888`, admin `5555`, cajero `1978`.
- `verifyCashierPin(pin)` = `authenticatePin(pin) !== null`.

**Validación del canje (`PinAuthModal`):**
- El comensal/cajero abre el modal desde "Validar en caja" (`StepPrizeClaim`).
- Prop `demoMode`: en **producción** (`false`) el PIN NO se muestra ni se autollena — el cajero debe teclearlo. En **demo** (`?demo=true`) se muestra y se puede autollenar para demostraciones.
- Tras validar, `handlePinSuccess` marca el cupón como usado y sincroniza a Sheets/Supabase (fire-and-forget).

---

## 5. Integración Composio — estado real y activación

### 5.1 Qué hace hoy (verificado)
Composio es una integración **híbrida parcial**:
- **Cliente real** (`src/lib/composioService.ts`):
  - `recordWonPrize(lead)` (llamado en `App.tsx` al ganar): si hay `apiKey` + `enabled`, hace `POST https://backend.composio.dev/api/v1/actions/GOOGLESHEETS_APPEND_ROW/execute` (header `x-api-key`). Si no, cae a un **webhook de Google Apps Script** (`POST` con `action:"CREATE_PRIZE"`, `mode:"no-cors"`).
  - `validateCashierPin(code, pin)` (llamado tras validar en caja): envía `action:"VALIDATE_PIN"` al mismo webhook. **No valida el PIN** (eso es local); solo sincroniza el canje. Devuelve `false` si no hay webhook o si falla.
- **Panel admin** (`src/admin/pages/Composio.tsx`): UI para 8 conectores (Drive, Supabase, GitHub, Sheets, WhatsApp, Gmail, Notion, Slack). Guarda config vía `POST /api/config`.
- **Backend de diagnóstico** (`/api/integrations/composio/test-*` en `server/modules/config.js`): **SIMULADO** — devuelve latencias aleatorias y `status:"connected"` sin conectar con nada.

### 5.2 Qué es real vs placeholder
| Pieza | Estado |
|-------|--------|
| `recordWonPrize` → Google Sheets (vía Composio o webhook) | **Real** |
| `validateCashierPin` → marca canje en Sheets | **Real** (si hay webhook) |
| Conectores Drive/Supabase/GitHub/WhatsApp/Gmail/Notion/Slack | UI + test **simulado** (sin código de disparo real) |
| `syncBrandWithComposio` | **Placeholder** (solo `console.log`) |
| `/api/integrations/composio/test-*` | **Simulado** (latencia aleatoria) |

### 5.3 Config (de dónde salen las credenciales)
- Defaults en `src/config/clientConfig.ts` (sección `composio`): `enabled:false`, `apiKey:""`, `endpoints.googleSheetWebhookUrl:""`. **De fábrica no requiere credenciales y la API de Composio está desactivada.**
- Override en runtime: `localStorage["juegoreferidos_composio_config"]` o el panel (`/api/config`). La `apiKey` se enmascara al leerla por `/api/config`.

### 5.4 Activación paso a paso

**Opción A — Google Apps Script (recomendada, gratis, sin Composio):**
1. Abre `google-apps-script/Code.gs`, pégalo en un proyecto de Apps Script enlazado a tu Google Sheet.
2. Despliega como **Web App** (ejecutar como tú, acceso "cualquiera") y copia la URL `/exec`.
3. Pega esa URL en el panel Composio (campo webhook) o en `clientConfig.composio.endpoints.googleSheetWebhookUrl`.
4. Listo: `recordWonPrize` y `validateCashierPin` escriben en la hoja (acciones `CREATE_PRIZE` y `VALIDATE_PIN`).

**Opción B — Composio real (Google Sheets gestionado):**
1. Crea cuenta en `app.composio.dev` y vincula Google Sheets.
2. Obtén la API Key (`comp_live_...`).
3. Pégala en el panel Composio (guarda en `/api/config`) y pon `enabled:true`.
4. Verifica que la acción `GOOGLESHEETS_APPEND_ROW` esté habilitada para tu entidad.

> **Nota de seguridad:** hoy la `apiKey` de Composio viaja desde el navegador (header `x-api-key`). Para producción conviene proxyear la llamada por el backend (pendiente; hoy el backend no hace la llamada real). La Opción A (webhook) no expone ninguna credencial sensible.

---

## 6. Hermes — estado real

### 6.1 Qué es hoy (verificado)
Hermes se presenta como "agente IA & WhatsApp omnicanal", pero **el backend NO ejecuta IA**. Es un **conector/monitor**:
- `GET/POST /api/hermes/config` (`server/modules/hermes.js`): guarda/lee la config (`apiUrl`, `apiKey`, `agentId`, `mode`, `events`).
- `POST /api/hermes/test`: **ping HTTP real** a `apiUrl` con `Authorization: Bearer`, timeout 6s, mide latencia y actualiza `status`.
- `POST /api/integrations/hermes/webhook`: receptor "eco" que cuenta eventos entrantes (`eventsDispatched`).
- Panel `src/admin/pages/Hermes.tsx`: formulario (endpoint, agentId, modo, token, prompt) + botón de ping + monitor de estado.

En resumen: Hermes es el **canal de salida/monitoreo** hacia un sistema externo (CRM/POS/WhatsApp API). No genera contenido ni demos por sí mismo.

### 6.2 Generador de demo en vivo personalizado "desde la calle" — IMPLEMENTADO

**Objetivo:** un comercial, frente a un cliente potencial, introduce unos datos (nombre del restaurante, logo, color, teléfono) y genera al instante un demo personalizado de la app para mostrarlo.

**Estado: implementado** (no corresponde a Hermes, que es un conector; se construyó como herramienta de ventas independiente reutilizando piezas existentes).

**Cómo funciona (paso a paso):**
1. **Página del generador** — `src/admin/pages/DemoGenerator.tsx`, ruta `/demo-generator` (menú lateral: "Generador de Demo (Ventas)"). Formulario con nombre, color, WhatsApp, URL de logo (opcional) y eslogan (opcional).
2. **Enlace autoconfigurable** — produce `…/?demo=true&brand=&color=&tel=&logo=&tagline=`. Un solo enlace, sin backend ni login.
3. **Branding por querystring** — `getUrlBrandOverride()` en `src/config/clientConfig.ts` lee esos parámetros y los mezcla sobre la marca de `localStorage`, persistiéndolos. Corre antes de la auto-init de `brandService` (garantizado por el orden de import), así la app abre ya personalizada.
4. **Compartir** — la página entrega QR (`api.qrserver.com`, sin dependencias nuevas), botón Copiar, Abrir y **enviar por WhatsApp** (`wa.me` con mensaje pre-redactado).

**Validaciones de los parámetros** (en `getUrlBrandOverride`):
- `color` → acepta con/sin `#`, valida `/^#[0-9a-fA-F]{6}$/`.
- `logo` → solo acepta URLs `https?://`.
- `tel` → limpia todo lo que no sea dígito.
- `ig` → antepone `@` si falta.

**Pendiente / opcional (a confirmar con el negocio):**
- **Subida de archivo de logo** (hoy el logo se pasa como URL ya hospedada; subir un archivo requeriría almacenamiento + endpoint).
- **Rol de Hermes (opcional):** una vez generado el enlace, Hermes podría ser el canal que lo **envía por WhatsApp** automáticamente al cliente — eso sí encaja con su naturaleza de conector.

---

## 7. Portal WiFi / Kiosko, Push, Sellos, Reputación, Misiones (resumen)

- **Portal WiFi** (`captive-portal.js`): registra dispositivos, concede acceso temporal y expira sesiones vencidas (`sweepExpiredDevices`). Fail-closed salvo `DEMO_MODE`.
- **Push** (`push.js` + `oneSignalService.ts`): requiere credenciales de OneSignal; sin ellas, los prompts no envían.
- **Sellos** (`loyalty.js` + `stampService.ts`): tarjeta de 15 visitas asociada al WhatsApp del comensal.
- **Reputación** (`reputation.js`): enruta 4-5★ a Google Maps y 1-3★ a WhatsApp privado de gerencia; configurable.
- **Misiones** (`missions.js`): catálogo de retos sociales; el envío de evidencia se revisa y suma sellos.

---

## 8. Notas de seguridad vigentes

- PIN de caja: sin backdoors; solo valida contra el PIN configurado. El PIN solo se revela en modo demo (`?demo=true`).
- Endpoints de escritura del backend están protegidos por token admin (lista `PROTECTED` en `server/index.js`).
- Rate-limiting en login (5 intentos/IP → 429) y expiración de sesión admin (12h) implementados.
- `apiKey` de Composio en el cliente: pendiente de proxyear por backend para producción.
