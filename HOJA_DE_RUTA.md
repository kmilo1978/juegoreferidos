# 🗺️ Hoja de Ruta del Proyecto

> Documento vivo con todo lo pendiente. Actualizado tras la Etapa 1.5.

---

## ✅ Hecho hasta ahora

### Etapa 1 — De demo a producción (MERGEADA a `main`, PR #1)
- Seguridad: backdoor de PIN eliminado, secretos a `.env` y enmascarados en `/api/config`, auth por token, CORS por entorno.
- Portal WiFi sin fail-open + handshake real al router (MikroTik/UniFi).
- Sellos: backend como fuente de verdad, anti-duplicado diario.
- Hermes ping HTTP real; geofencing web real; opciones nativas rotuladas.
- Cliente API central (apiClient) + 16 URLs hardcodeadas eliminadas.
- 11 pruebas de integración (Vitest), README actualizado.

### Etapa 1.5 — Endurecimiento (rama `fix/etapa-1.5-endurecimiento`, pendiente de merge)
- 0 errores de TypeScript (antes 11 preexistentes).
- Rate-limiting en el login (5 intentos / IP, bloqueo 429).
- Expiración activa de sesiones WiFi (barrido periódico).
- Caducidad de sesión admin en el frontend (re-pide PIN ante 401).
- Suite ampliada a 23 pruebas.

---

## ⏸️ Etapa 2 — Integraciones externas (PAUSADA — requiere credenciales/hardware tuyos)

> El código ya quedó "listo para conectar" en la Etapa 1. Esto es configuración y prueba con datos reales, no programación nueva grande. Se retoma cuando tengas lo necesario.

| # | Tarea | Qué necesitas aportar | Dónde se conecta |
|---|-------|----------------------|------------------|
| 2.1 | **Despliegue con dominio + HTTPS** | Hosting (Vercel/Netlify/VPS) y dominio | Frontend + backend; definir `VITE_API_URL` y `ALLOWED_ORIGINS` |
| 2.2 | **WhatsApp real (Hermes)** | Credenciales Meta Cloud API o Twilio | `server/.env` → `HERMES_API_URL`, `HERMES_API_KEY` |
| 2.3 | **Router WiFi físico** | MikroTik o UniFi en la red del local + credenciales | `captive-portal.js` (handshake ya implementado, falta probarlo con hardware) |
| 2.4 | **Geofencing en segundo plano** | Build nativo con Capacitor + cuenta OneSignal + publicar en tiendas | Opciones 2 y 3 del panel de Geofencing (hoy rotuladas "Etapa 2") |
| 2.5 | **Base de datos en la nube** | Llaves de Supabase y/o webhook de Google Sheets | Pestaña Bases de Datos / Composio |
| 2.6 | **Composio / conectores** | API key de Composio | Pestaña Composio |

---

## 🎯 Etapa 3 — Frontend funcional, modular y personalización REAL (SIGUIENTE)

> Objetivo del usuario: *"que todo el frontend sea funcional y modular; que cada elemento de personalización realmente se aplique; poder escoger de verdad qué funcionalidades van y cuáles no, y que se vea en el simulador; que los colores de marca se apliquen a todo el sistema."*

### Diagnóstico técnico (por qué hoy NO funciona del todo)

Tras revisar el código, estos son los problemas de raíz:

1. **Color de marca aplicado a medias.** `brandService.applyBrandColors()` solo inyecta 3 variables CSS (`--gold`, `--gold-light`, `--bg-cream`) y `App.tsx` setea `--primary-color`. Pero el sistema usa **decenas de colores hex escritos a mano** (ej. `#f2be71`, `#121115`) directamente en el JSX de los componentes, que **no** leen esas variables. Resultado: cambiar el color de marca solo afecta a unos pocos elementos, no "a todo el sistema".
   → **Causa raíz:** no hay un sistema de *design tokens* central; los colores están hardcodeados por todos lados.

2. **Activar/desactivar funcionalidades funciona a medias.** `GameMode.tsx` (panel) tiene un checklist de 9 módulos (`gameModules` con `active: true/false`) y `App.tsx` tiene `isStepActive(stepId)` que SÍ lee `gameConfig.activeSteps`. PERO:
   - El checklist del panel ofrece módulos que **no existen** como paso real en la app (ej. `step_dice` "Dados", `step_betting` "Mesa de Apuestas") — son opciones que no renderizan nada.
   - No todos los pasos de la app respetan `isStepActive` de forma consistente (el paso de la ruleta/juego principal no se puede desactivar realmente).
   → **Causa raíz:** la lista de módulos del panel y los pasos reales de la app no están sincronizados por una única fuente de verdad.

3. **Simulador (Demo) no refleja la configuración real.** Hay que verificar que `Demo.tsx` renderice la app del comensal con la MISMA config (colores, pasos activos) que se guardó, en vivo. (Pendiente de revisar a fondo.)

4. **Dos sistemas de config solapados.** Conviven `clientConfig`, `brandService`, `CentralSystemConfigService` y el backend `/api/config`. Hay riesgo de que la fuente de verdad no sea única.

### Plan propuesto (orden recomendado)

**Fase 3.0 — Documento de diseño (cimiento).**
- [ ] Incorporar el MD de diseño del usuario como **fuente de verdad única** (unificar/anexar con el `DESIGN.md` existente para no contradecir).
- [ ] Definir el catálogo de *tokens*: colores (primario, secundario, acento, fondos, texto, estados), tipografía, espaciados, radios.

**Fase 3.1 — Sistema de design tokens.**
- [ ] Centralizar los tokens en variables CSS (`:root`) y mapearlos en el `@theme` de Tailwind v4.
- [ ] Reemplazar los hex hardcodeados de los componentes por las variables/clases de token (migración gradual, componente por componente, verificando en el simulador).
- [ ] Que `applyBrandColors` genere TODA la paleta derivada (primario → hover, claro, contraste de texto accesible) y la inyecte completa.

**Fase 3.2 — Personalización que se aplica de verdad.**
- [ ] Al cambiar el color de marca en el panel → se refleja en app comensal + panel + simulador en vivo.
- [ ] Verificar contraste automático (texto legible sobre el color elegido) según reglas del `DESIGN.md`.

**Fase 3.3 — Modularidad real de funcionalidades.**
- [ ] Una sola fuente de verdad para los pasos/juegos disponibles (eliminar módulos "fantasma" del checklist o implementarlos de verdad).
- [ ] Que CADA paso respete `isStepActive` de forma consistente (incluido el juego principal).
- [ ] Elegir el minijuego activo (ruleta / precisión / raspa / memoria / plinko / etc.) y que la app comensal muestre exactamente ese.

**Fase 3.4 — Simulador fiel.**
- [ ] El simulador (Demo) debe renderizar la app comensal con la config guardada (pasos activos, minijuego elegido, colores, textos) y actualizarse al cambiar la config.

**Fase 3.5 — Verificación.**
- [ ] `tsc` 0, pruebas, build; revisión visual en el simulador de cada combinación.

### Pregunta resuelta: ¿agregar el MD de diseño ahora?
**Sí, agrégalo ahora** (Fase 3.0). Es el cimiento de todo lo demás: define los tokens que harán que "el color de marca llegue a todo" sea automático en vez de parche por parche. Si el MD nuevo reemplaza al `DESIGN.md` actual, hay que consolidarlos en un solo documento fuente de verdad.

---

## 📌 Pendientes administrativos inmediatos
- [ ] Crear PR y merge de la Etapa 1.5: https://github.com/kmilo1978/juegoreferidos/pull/new/fix/etapa-1.5-endurecimiento
