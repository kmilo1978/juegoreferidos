# Plataforma Integral de Fidelización, Gamificación y Marketing Gastronómico en Mesa & Kiosko

> **Manifiesto Técnico Oficial, Arquitectura de Software Modular, Guía Operativa de Sala y Documentación Funcional Exhaustiva**  
> *Versión 3.0 — 100% White-Label / Marca Blanca Personalizable para Negocios Gastronómicos y de Hospitalidad.*

---

## 1. El Manifiesto del Sistema (Filosofía de Conversión y Retorno de Inversión)

Este sistema transforma un principio operativo crítico de la industria de alimentos y bebidas:

> **"El momento de la cuenta nunca más debe ser un punto de dolor o una despedida fría; es el instante de mayor receptividad y euforia para convertir al comensal en un cliente recurrente y embajador de marca."**

Tradicionalmente, pedir una reseña en Google, entregar una tarjeta de papel o solicitar que el cliente siga las redes sociales resulta ineficiente y molesto. Este ecosistema convierte ese momento en un **intercambio interactivo de alto valor mutuo**:

### Los 7 Pilares del Retorno de Inversión (ROI):

1. **Captura de Leads Calificados (Base de Datos Real y Propia):**  
   El cliente registra voluntariamente su **Nombre y WhatsApp verificado** bajo consentimiento legal de tratamiento de datos (*Habeas Data*). No es un seguidor anónimo en redes sociales de terceros: es un cliente real que consumió en tu sala y cuya relación ahora te pertenece.
2. **Generación de Contenido Orgánico Masivo (UGC en Redes Sociales):**  
   Para activar la mecánica de juego, el comensal comparte una foto o video de su experiencia en sus **Historias de Instagram** o por el **WhatsApp de mesa**. El restaurante no regala nada: **el cliente paga su beneficio con visibilidad orgánica ante cientos de sus amigos y familiares**.
3. **Embudo Inteligente de Reputación (Filtro 5★ vs. Contención Privada):**
   - **Calificaciones de 4 y 5 Estrellas:** Se enrutan de manera automatizada hacia **Google My Business / Google Maps Reviews**, catapultando el posicionamiento SEO local y atrayendo nuevos clientes de forma pasiva.
   - **Calificaciones de 1 a 3 Estrellas:** Se interceptan mediante un **canal privado directo al WhatsApp del Administrador o Gerente**, permitiendo resolver inconformidades de inmediato antes de que se conviertan en reseñas públicas destructivas.
4. **Cupón Digital Anticopia con Validación por PIN de Caja:**  
   Vouchers digitales con código alfanumérico único (`REST-XXXX-VIP`), contador de vigencia en tiempo real y código QR de alta resolución. La quema del cupón requiere un **PIN de autorización de 4 dígitos** ingresado por el personal de sala o caja, eliminando el fraude y garantizando trazabilidad total.
5. **Fidelización por Sellos Digitales (Tarjeta VIP de 15 Sellos):**  
   Sustituye las tarjetas de cartón que los clientes pierden u olvidan. La tarjeta digital almacena el saldo en la nube asociado al número de WhatsApp del comensal, otorgando premios gastronómicos progresivos en hitos estratégicos (visitas 5, 10 y 15).
6. **Misiones de Embajadores y Gran Desafío Mensual (Inspiración Screpy):**  
   Un centro de misiones gamificadas donde el cliente suma sellos adicionales por acciones de marketing: dejar reseñas en Bing Places o Trustpilot, crear videos en TikTok, unirse a la Comunidad VIP de WhatsApp o referir amigos. Al completar el desafío, obtiene un **Premio Garantizado de la Casa** y un **Boleto VIP para el Sorteo Mensual de una Cena Degustación para 2 Personas**.
7. **Ecosistema Modular Omnicanal (Mesa, Kiosko, Portal WiFi y Hermes):**  
   Una infraestructura abierta capaz de operar en mesas físicas mediante QR/NFC, en empaques a domicilio, en tablets fijas de autoservicio (Kiosko) y como **Portal Cautivo WiFi** para conceder acceso a internet a cambio de fidelización.

---

## 2. Flujo Completo del Comensal: Las 7 Pantallas ("Una Pantalla, Un Objetivo")

Para evitar la sobrecarga cognitiva y garantizar que el comensal nunca abandone el embudo, la interfaz sigue la regla de oro de diseño de producto: **cada pantalla persigue un único objetivo claro y sin distracciones**.

```
[ PASO 1: Tus Datos ]
         │
         ▼
[ PASO 2: Instagram / WhatsApp ]
         │
         ▼
[ PASO 3: Selección / Ruleta de Premios ]
         │
         ▼
[ PASO 4: Voucher de Premio + PIN de Caja ]
         │
         ▼
[ PASO 5: Calificar Experiencia (Embudo Google vs WhatsApp) ]
         │
         ▼
[ PASO 6: Segunda Oportunidad (Estados WhatsApp + Reto 10s) ]
         │
         ▼
[ PASO 7: Centro de Misiones & Tarjeta de 15 Sellos + Cena 2P ]
```

### Pantalla 1: Identificación y Consentimiento Legal (`StepUserData.tsx`)
- **Objetivo:** Registro ultra-rápido en menos de 15 segundos.
- **Campos:** Nombre y Apellido, Número de WhatsApp (con selector de código de país internacional predeterminado en `+57`) y correo electrónico opcional.
- **Seguridad Legal:** Casilla obligatoria de consentimiento para tratamiento de datos personales conforme a la ley de privacidad, con enlace directo a la política del restaurante.
- **Control Anti-Fraude:** Verificación automática de número de teléfono; si el cliente ya jugó en las últimas 24 horas, el sistema le muestra su cupón activo en lugar de permitir giros duplicados.

### Pantalla 2: Interacción Social y UGC (`StepInstagramStory.tsx`)
- **Objetivo:** Difusión viral de la marca en redes sociales.
- **Mecánica:** Muestra al comensal una vista previa de la tarjeta gastronómica oficial y le solicita subir una historia a Instagram etiquetando la cuenta del restaurante, o enviar la foto de su mesa al WhatsApp oficial.
- **Facilidad de Uso:** Botón directo que abre la aplicación de Instagram o WhatsApp en el teléfono del cliente con el texto pre-configurado y listo para publicar.

### Pantalla 3: Selección de Experiencia & Ruleta de la Suerte (`StepRouletteWheel.tsx`)
- **Objetivo:** Generar dopamina, entretenimiento y emoción en mesa.
- **Componentes:**
  * Ruleta interactiva de 8 segmentos renderizada con gráficos vectoriales y aceleración por hardware (GPU).
  * Probabilidades matemáticas controladas desde el backend (sumatoria exacta al 100%).
  * Aguja triangular con física de rebote sonoro y desaceleración fluida tipo Bezier.
  * Botón central interactivo con retroalimentación háptica.
- **Modos Alternativos:** Permite configurar desde el backend si la sala juega a la Ruleta o al Reto del Cronómetro de 10 segundos como juego principal.

### Pantalla 4: Voucher Digital de Premio & Validación en Caja (`StepPrizeClaim.tsx`)
- **Objetivo:** Entrega del beneficio con máxima seguridad operativa y cero fraude.
- **Componentes del Ticket:**
  * Nombre del beneficio ganado (ej. *Postre Artesanal de Autor Gratis*, *Bebida de Cortesía*, *Descuento en Cuenta*).
  * Código alfanumérico único anti-falsificación (ej. `#REST-8492-VIP`).
  * Código QR de alta densidad legible por el datáfono, escáner o cámara del personal.
  * Reloj de cuenta regresiva (20 minutos) para exigir el canje durante la visita activa.
- **Modal de Autorización con PIN Visible (`PinAuthModal.tsx`):**
  * Al pulsar el botón dorado *"🎁 Canjear en Mesa / Caja (Personal Autorizado)"*, se despliega un popup de seguridad.
  * **Tarjeta Dorada Destacada con el PIN:** Exhibe de manera clara y luminosa el código de turno autorizado (`1978` o el PIN rotativo configurado).
  * **Botón de 1 Toque `⚡ Usar PIN`:** Permite al personal autocompletar y quemar el cupón instantáneamente para agilizar demostraciones y horas pico.
  * **Teclado Táctil Numérico:** Permite digitar manualmente los 4 números.
  * **Sincronización Inmediata:** Al autorizar, se realiza un llamado al endpoint `POST /api/validate-pin`, marcando el premio como `UTILIZADO` en la base de datos y acreditando automáticamente el sello en la tarjeta de fidelidad.

### Pantalla 5: Embudo Inteligente de Reputación (`StepFeedback.tsx`)
- **Objetivo:** Multiplicar reseñas públicas 5 estrellas en Google y blindar el restaurante ante críticas negativas.
- **Selector de Calificación:** 5 emblemas dorados interactivos de 1 a 5 estrellas.
- **Algoritmo de Enrutamiento:**
  * **Calificación Excelente (4 o 5 Estrellas):** Dirige inmediatamente al comensal a la ficha de reseñas de **Google My Business / Google Maps**. Cuenta con un mecanismo de detección de retorno que felicita al cliente al regresar al navegador y le desbloquea la Segunda Oportunidad.
  * **Calificación a Mejorar (1 a 3 Estrellas):** Abre un canal de sugerencia privada que envía el comentario directo al WhatsApp de la gerencia, conteniendo la inconformidad dentro del ámbito privado y permitiendo una disculpa o cortesía en sala antes de que el cliente abandone el local.

### Pantalla 6: Segunda Oportunidad — Reto del Cronómetro 10s (`StepSecondChancePrecision.tsx`)
- **Objetivo:** Segunda ronda de viralidad y fidelización por compartir en Estados de WhatsApp.
- **Requisito de Desbloqueo:** El comensal comparte la experiencia en sus **Estados de WhatsApp** con el texto y foto sugeridos por la cafetería.
- **Reto de Precisión al Milisegundo:**
  * Cronómetro digital gigante de alta precisión: `00:00.00`.
  * El comensal debe presionar el botón y detener el reloj exactamente en **10.00 segundos**.
  * Rango de tolerancia configurable (Fácil: ±80ms, Medio: ±40ms, Difícil: ±15ms).
  * Cuenta con hasta 3 intentos por comensal.
- **Premio Manual Programable:** El administrador puede programar de forma manual el premio de la 2ª oportunidad desde el backend (nombre del producto, valor comercial en dinero, fotografía gourmet y términos de reclamo).

### Pantalla 7: Centro de Misiones & Tarjeta de 15 Sellos (`StepMissions.tsx`)
- **Objetivo:** Retención a largo plazo y conversión en clientes embajadores.
- **Tarjeta Digital de 15 Sellos VIP:**
  * Tira persistente y visualmente destacada de 15 círculos con iconos de café y postres.
  * Los sellos acumulados brillan en color dorado esmeralda con alto contraste.
  * Hitos de recompensa automáticos cada 5 visitas (Premio Nivel Bronce en sello 5, Nivel Plata en sello 10 y Nivel Oro en sello 15).
- **Catálogo de Misiones de Embajador (Estilo Screpy):**
  * Tareas opcionales que otorgan sellos inmediatos:
    1. 🎵 **Video en TikTok** (+3 sellos)
    2. 🌐 **Reseña en Bing Places & Maps** (+2 sellos)
    3. 💬 **Unirse al Grupo VIP de WhatsApp** (+2 sellos)
    4. ⭐ **Reseña en Trustpilot o Facebook** (+2 sellos)
    5. 👥 **Recomendar a 3 Amigos por WhatsApp** (+3 sellos)
  * El comensal envía el enlace o captura de evidencia, la cual se revisa y aprueba desde el panel administrativo con acreditación en 1 clic.
- **Gran Desafío Embajador & Concurso Mensual:**
  * Al completar las misiones o llenar su tarjeta, el comensal gana un **Premio Gourmet Garantizado** de la casa y recibe un **Boleto VIP Oficial** (ej. `#CENA2-8492-VIP`) para el **Sorteo Mensual de una Cena Degustación para 2 Personas**.
- **Pantalla de Cierre:** Tarjeta de agradecimiento elegante con botón `Comenzar Nueva Experiencia` para resetear la mesa de cara al siguiente comensal.

---

## 3. Módulo de Portal Cautivo WiFi & Modo Kiosko Digital

La plataforma unifica la experiencia de autoservicio en tabletas y la bienvenida de red en un solo módulo tecnológico:

### A. Como Portal Cautivo WiFi de Sala
- **Funcionamiento:** Cuando un cliente llega al local y selecciona la red WiFi para comensales (`SSID: Clientes VIP`), el punto de acceso (Access Point / Router) redirige la navegación hacia `http://localhost:5173/?modo=wifi`.
- **Experiencia de Entrada:** El teléfono del cliente muestra la pantalla de bienvenida con la marca, logotipo y ambientación del restaurante.
- **Intercambio de Valor:** El cliente ingresa su Nombre y WhatsApp a cambio de **120 minutos de navegación libre de alta velocidad** y la acreditación de su **primer sello digital de bienvenida**.
- **Endpoints REST Dedicados:**
  * `GET /api/portal/status`: Retorna el nombre de la red WiFi, logo de marca, mensaje de bienvenida y mesas libres.
  * `POST /api/portal/connect`: Registra al comensal con el origen `PORTAL_CAUTIVO_WIFI` y concede el tiempo de sesión.

### B. Como Modo Kiosko / Tótem de Autoservicio
- **Funcionamiento:** Se instala en una tablet o iPad fija en el mostrador, recepción o barra mediante la URL `http://localhost:5173/?modo=kiosko`.
- **Botón de Pantalla Completa (`⛶`):** Permite fijar el navegador en modo quiosco comercial, ocultando la barra de pestañas y botones del sistema operativo para evitar que los clientes salgan de la aplicación.
- **Soporte de URLs Universales:** La plataforma detecta automáticamente cualquiera de las siguientes variantes en la URL:
  * `?modo=kiosko`
  * `?modo=wifi`
  * `?kiosko=1`
  * `?portal=1`
  * `?wifi=1`

---

## 4. Servidor Backend Modular Extensible (Arquitectura 0 Dependencias en Puerto 3001)

El backend está construido bajo una **arquitectura tipo Lego de cero dependencias externas**, utilizando exclusivamente las APIs nativas de Node.js / Bun (`node:http`, `node:fs`, `node:path`), garantizando portabilidad absoluta y arranque en menos de 50 milisegundos:

```
server/
├── index.js                  # Servidor HTTP central, CORS y despachador de módulos
├── state.js                  # Base de datos local (db.json), carga, guardado y logging
├── db.json                   # Base de datos JSON reactiva con persistencia en disco
├── modules/
│   ├── tables.js             # Módulo 1: Gestión de 10 mesas en vivo y tokens
│   ├── loyalty.js            # Módulo 2: Ruleta, cupones, PIN, sellos y sorteo
│   ├── missions.js           # Módulo 3: Catálogo y revisión de misiones
│   ├── hermes.js             # Módulo 4: Conexión con Hermes (IA, CRM, POS)
│   ├── reputation.js         # Módulo 5: Embudo de reseñas Google y quejas
│   ├── config.js             # Módulo 6: Identidad de marca, RBAC y finanzas
│   ├── push.js               # Módulo 7: Web Push notifications y plantillas
│   └── captive-portal.js     # Módulo 8: Portal Cautivo WiFi y Kiosko
└── views/
    └── dashboard.js          # Panel visual administrativo HTML/CSS/JS (13 Pestañas)
```

### Endpoints REST Disponibles:

| Método | Endpoint | Módulo | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Dashboard | Interfaz gráfica completa del panel de control |
| `GET` | `/api/metrics` | Config | Estadísticas generales, clientes y métricas de conversión |
| `GET` | `/api/tables` | Tables | Estado de las 10 mesas en vivo (Disponible, Jugando, Premio Pendiente) |
| `POST` | `/api/tables/:id/reset` | Tables | Libera remotamente una mesa para el próximo comensal |
| `GET` | `/api/game-config` | Loyalty | Configuración de juego activa, premios y probabilidades |
| `POST` | `/api/game-config` | Loyalty | Actualiza mecánica de juego, ruleta o reto 10s |
| `POST` | `/api/prizes` | Loyalty | Registra un nuevo cupón ganado por un cliente |
| `POST` | `/api/validate-pin` | Loyalty | Quema y valida el cupón con el PIN de caja (1978) |
| `GET` | `/api/stamps/:phone` | Loyalty | Consulta el saldo de sellos y visitas de un cliente |
| `POST` | `/api/second-chance-config` | Loyalty | Guarda premio manual y dificultad de la 2ª oportunidad |
| `GET` | `/api/contest` | Loyalty | Consulta lista de participantes clasificados a la Cena para 2 |
| `POST` | `/api/contest/draw` | Loyalty | Ejecuta el sorteo aleatorio oficial del ganador de la cena |
| `GET` | `/api/missions` | Missions | Lista misiones activas y evidencias enviadas |
| `POST` | `/api/missions/config` | Missions | Guarda checklist de misiones activas y sellos asignados |
| `POST` | `/api/missions/submit` | Missions | El comensal envía enlace o evidencia de misión |
| `POST` | `/api/missions/review` | Missions | Administrador aprueba o rechaza misión (+sellos) |
| `GET` | `/api/hermes/config` | Hermes | Obtiene parámetros de conexión con Hermes |
| `POST` | `/api/hermes/config` | Hermes | Guarda API Key, URL, modo y eventos de Hermes |
| `POST` | `/api/hermes/test` | Hermes | Realiza un ping de diagnóstico con latencia milimétrica |
| `POST` | `/api/integrations/hermes/webhook` | Hermes | Receptor oficial de eventos entrantes desde Hermes |
| `GET` | `/api/reputation/config` | Reputation | Configuración de URL de Google Maps y WhatsApp privado |
| `POST` | `/api/reputation/feedback` | Reputation | Registra calificación del comensal y sugerencia |
| `POST` | `/api/push/subscribe` | Push | Registra suscripción Web Push del navegador |
| `POST` | `/api/push/broadcast` | Push | Envía notificación push masiva inmediata o programada |
| `GET/POST`| `/api/push/drafts` | Push | Gestión de borradores y plantillas de ofertas push |
| `GET` | `/api/portal/status` | Portal | Estado del portal cautivo, SSID y bienvenida |
| `POST` | `/api/portal/connect` | Portal | Conexión WiFi, registro y concesión de 120 minutos |

---

## 5. Módulo de Integración con Hermes (Agente IA, CRM & POS)

El panel incorpora una sección especializada para interconectar el ecosistema del restaurante con **Hermes**:

### Modos de Operación Disponibles:
1. **🤖 Hermes Agent (Agente Autónomo de Inteligencia Artificial):** Permite que un agente inteligente atienda consultas de comensales 24/7 (consultar cuántos sellos llevan, recomendar postres o gestionar reservas).
2. **💬 Hermes CRM / WhatsApp Omnicanal:** Sincroniza en tiempo real los números telefónicos, historial de visitas y etiquetas VIP entre la base de datos de sala y el CRM.
3. **🛒 Hermes POS / Sistema de Punto de Venta & Caja:** Enlaza la validación de cupones con PIN de caja y el registro de ventas con el datáfono o software de facturación.
4. **🔗 Hermes Custom Webhook:** Envía peticiones HTTP POST estructuradas en milisegundos ante eventos clave.

### Checklist de Eventos Sincronizados con Hermes:
- ✅ Nuevo Premio Ganado (Ruleta o Reto 10s).
- ✅ Canje y Quema de Cupón con PIN en Caja.
- ✅ Registro de Comensal & Sellos de Fidelidad.
- ✅ Calificaciones de Google Maps y Sugerencias Privadas.
- ✅ Misiones y Evidencias de Embajadores.

---

## 6. Módulo de Notificaciones Web Push (Alertas VIP de Sala)

Permite reactivar clientes sin depender de costos por mensaje de texto SMS o restricciones de plantillas pagas de WhatsApp:

- **Suscripción en 1 Toque:** Al conectarse al Kiosko o ganar un premio, el navegador solicita permiso de notificaciones push de forma nativa (*Web Push API / Service Worker*).
- **Segmentación Inteligente:** Permite enviar campañas a "Todos los Suscriptores" o a "Comensales Activos".
- **Plantillas Predefinidas de Marketing:**
  * ⚡ *Happy Hour 2x1 en Bebidas (3:00 a 6:00 PM)*
  * 🍰 *Postre de Cortesía en tu Visita de Hoy*
  * ⏳ *Cupón Flash 50% en Segundo Producto*
  * 🌟 *Sellos Dobles de Fin de Semana*
- **Programación:** Soporta disparo inmediato o programación diferida con fecha y hora exacta.

---

## 7. Control de Acceso por Roles (RBAC de 3 Niveles)

El sistema protege los parámetros sensibles del negocio mediante un esquema de control de acceso por roles:

```
[ Dueño Master (PIN: 8888) ]
       │── Control Total de Marca, Finanzas y Probabilidades
       ▼
[ Administrador / Gerente (PIN: 5555) ]
       │── Operaciones, Aprobación de Misiones, Push y Liberación de Mesas
       ▼
[ Cajero / Personal de Sala (PIN: 1978) ]
       └── Uso Diario: Validación de Cupones con PIN y Canje de Sellos
```

- **👑 Dueño Master (PIN: `8888`):** Acceso total a finanzas, cálculo de costos de premios, probabilidades matemáticas de la ruleta, configuración de identidad de marca y llaves de bases de datos.
- **👔 Administrador / Gerente (PIN: `5555`):** Gestión de operaciones en vivo, revisión y aprobación de misiones de embajadores, sorteo de la cena mensual, lanzamiento de ofertas push y liberación de mesas.
- **💳 Cajero / Mesero (PIN: `1978`):** Perfil operativo restringido para uso exclusivo en mesa y caja; solo permite validar cupones y registrar sellos.

---

## 8. Guía Operativa de Ejecución y Puertos Locales

Para ejecutar la plataforma completa en tu entorno de desarrollo o servidor local:

### Comandos de Terminal:

```bash
# 1. Iniciar Servidor Frontend (Vite + React + Tailwind)
bun run dev
# Disponible en: http://localhost:5173/

# 2. Iniciar Servidor Backend Modular (Node / Bun)
bun server/index.js
# Disponible en: http://localhost:3001/

# 3. Compilar para Producción con 0 Errores
bun run build
```

### URLs Clave de Acceso Rápido:
- **Pantalla Principal del Comensal:** [http://localhost:5173/](http://localhost:5173/)
- **Modo Kiosko / Portal WiFi:** [http://localhost:5173/?modo=kiosko](http://localhost:5173/?modo=kiosko)
- **Panel Administrativo del Backend:** [http://localhost:3001/](http://localhost:3001/)
- **Consulta de Estado del Portal Cautivo:** [http://localhost:3001/api/portal/status](http://localhost:3001/api/portal/status)

---

## 9. Conclusión y Valor Comercial

Este ecosistema transforma una operación gastronómica tradicional en un **motor automatizado de fidelización, reputación y marketing de referidos**:
- Elimina el gasto en tarjetas de fidelidad de papel y en publicidad tradicional no medible.
- Convierte el tráfico presencial de la sala en una base de datos propia, calificada y reactivable.
- Dispara las reseñas 5 estrellas en Google de forma constante y orgánica.
- Proporciona al dueño y al equipo de sala una herramienta intuitiva, rápida, elegante y segura.