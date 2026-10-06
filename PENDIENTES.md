# 📋 Lista de Tareas y Pendientes del Proyecto
### SaaS de Gamificación, Fidelización en Mesa & Viralidad Gastronómica
*Actualizado al: 1 de octubre de 2026*

Este documento consolida la hoja de ruta y los siguientes pasos estratégicos para la puesta en marcha, operación diaria y expansión del sistema.

---

## 🎯 1. Prioridad Alta (Inmediata / Próximos Pasos Operativos)

| # | Tarea | Descripción y Objetivo | Área |
| :---: | :--- | :--- | :--- |
| **1.1** | **Dominio Público con Certificado SSL (HTTPS)** | Desplegar el frontend y backend en un servidor con HTTPS (ej: Vercel, Netlify o VPS con dominio propio como `club.turestaurante.com`). <br>*Nota:* Web Push y ServiceWorkers requieren HTTPS obligatorio para funcionar en móviles fuera de la red local. | Infraestructura |
| **1.2** | **Conexión Real de WhatsApp API (Hermes IA)** | Configurar las credenciales definitivas de Meta Cloud API o Twilio para que los mensajes de bienvenida, validación de fotos de pedidos y entrega de cupones se envíen automáticamente al WhatsApp del cliente sin requerir acción manual. | Canales |
| **1.3** | **Sincronización Automática con Google Sheets** | Activar el conector de Google Apps Script / Composio para volcar en tiempo real los boletos del Sorteo VIP de fin de mes y los datos de clientes directamente a una hoja de cálculo en Google Drive. | Base de Datos |
| **1.4** | **Prueba Piloto en Sala con Comensales Reales** | Probar la lectura de los códigos QR de las mesas 1 a 10 con diferentes dispositivos (iPhone con Safari y Android con Chrome) sentados en el restaurante para validar la velocidad y fluidez. | Operaciones |

---

## ⚙️ 2. Prioridad Media (Automatización y Hardware en Local)

| # | Tarea | Descripción y Objetivo | Área |
| :---: | :--- | :--- | :--- |
| **2.1** | **Instalación de Portal Cautivo en Router (MikroTik / UniFi)** | Cargar la plantilla HTML optimizada del portal cautivo en el router del local para que los clientes que se conecten al Wi-Fi sean redirigidos automáticamente al minijuego de mesa antes de navegar. | Red / Wi-Fi |
| **2.2** | **Impresión de Habladores Acrílicos de Mesa** | Generar y enviar a imprenta los diseños de mesa con los códigos QR dorados de autor para las 10 mesas del restaurante y el hablador de barra/caja. | Diseño / Sala |
| **2.3** | **Capacitación Rápida al Personal de Caja y Meseros** | Entrenar a meseros y cajeros en el uso del PIN de validación de caja (configurable en el panel) para quemar cupones de ruleta y registrar sellos de visita de forma rápida. <br>*Nota de seguridad:* los PINs de ejemplo antiguos (`4321`, `9395`, `0000`, `1234`) fueron **eliminados**; el PIN solo se revela en modo demo (`?demo=true`). | Capacitación |
| **2.4** | **Sincronización Definitiva con Supabase Cloud** | Vincular las llaves de base de datos PostgreSQL en la pestaña *Bases de Datos* para contar con respaldo seguro en la nube de todas las sesiones y premios ganados. | Base de Datos |

---

## 🚀 3. Prioridad Baja (Escalabilidad & Nuevas Funcionalidades)

| # | Tarea | Descripción y Objetivo | Área |
| :---: | :--- | :--- | :--- |
| **3.1** | **Soporte Multi-Sucursal (SaaS Multi-Tenant)** | Permitir que una misma marca con varios locales (ej: Sede Norte, Sede Poblado) pueda alternar de sucursal desde el mismo dashboard con métricas consolidadas. | Arquitectura |
| **3.2** | **PWA "Agregar a Pantalla de Inicio" Mejorada** | Añadir botón automático invitando a comensales VIP frecuentes a guardar el icono de la pastelería/restaurante en el escritorio de su celular. | Experiencia Móvil |
| **3.3** | **Exportación de Reportes Ejecutivos en PDF / Excel** | Botón para descargar un resumen mensual imprimible con el ROI, clientes captados, efectividad de ruleta, aperturas de push y calificación en Google Maps. | Reportes |
| **3.4** | **Módulo de Fidelización por Niveles (Bronce, Plata, Oro)** | Recompensas escalonadas automáticas según la cantidad de visitas registradas en el mes (gamificación avanzada). | Fidelización |

---

## ✅ Resumen de Lo Que Ya Está 100% Terminado y Operativo

- [x] **Frontend Comensal Completo:** Registro de mesa, minijuego de Ruleta de la Fortuna y Reto del Cronómetro de 10.00s, voucher con código único y código QR.
- [x] **Tarjeta Digital de 15 Sellos & Sorteo VIP de Fin de Mes:** Acumulación de visitas, generación de boletos numerados y canjes automáticos en los sellos 5, 10 y 15.
- [x] **Embudo de Reputación y Reseñas:** Desvío automático de calificaciones bajas (1-3★) al WhatsApp privado de gerencia y altas (4-5★) a Google Maps.
- [x] **Módulo de Misiones VIP (Paso 8):** Misiones sociales con TripAdvisor, TikTok, Instagram y viralidad por WhatsApp.
- [x] **Panel de Control Dashboard Completo:**
  - 10 Mesas en vivo con zonas personalizables.
  - Validación de premios y caja registradora con PINs de seguridad.
  - Gestor de marcas con previsualizaciones y pesos/tamaños recomendados de logos y banners.
  - Simulador multidispositivo (iPhone, Samsung, Xiaomi, Pixel, iPad) con rotación y cambio de fases.
  - **Notificaciones Push:** Historial con horarios y fechas exactas, métricas de aperturas reales (Open Rate %), calendario y horarios personalizables con ventana segura, y base de datos de suscriptores y dados de baja.
  - **Botón de Darse de Baja (Opt-Out):** En la aplicación móvil y en el panel, registrando bajas con motivo y fecha en la base de datos.
  - **Modo Día y Modo Noche:** Conmutador en barra superior y lateral con persistencia en memoria y paleta bistro clara.
- [x] **Backend Modular :3001:** Servidor ultraligero con persistencia en `db.json` y soporte de portal cautivo CNA.
- [x] **Sincronización Total de Código:** Repositorios sincronizados en GitHub y réplicas locales limpias.

---

## 🔧 Constancia Técnica — Estado de Integraciones (actualizado 6 oct 2026)

Tras las Etapas 1 → 6c (seguridad, modularidad, bugs de frontend, modales/PIN, documentación y Generador de Demo), el núcleo del producto está terminado y verificado (tsc 0 errores, 32/32 tests, build OK). Lo que resta para dejar de ser "demo" es **conectar las integraciones externas a servicios reales**. El código del lado del backend ya está listo y probado con su camino de respaldo (fallback); falta el servicio/credenciales del otro lado.

### Pendiente real por integración

| Integración | Estado hoy | Qué falta para que sea "real" | Bloqueante |
| :--- | :--- | :--- | :--- |
| **Hermes (WhatsApp omnicanal)** | Conector + monitor con ping real; endpoint `POST /api/hermes/send-demo` implementado con fallback a `wa.me`. | Un endpoint Hermes externo (Meta Cloud API / Twilio / gateway propio) que acepte la acción `SEND_WHATSAPP`. Configurar `apiUrl` + `apiKey` en el panel de Hermes. | Credenciales del proveedor WhatsApp |
| **Composio (Sheets/CRM)** | Híbrido/parcial: la `apiKey` viaja desde el navegador (`x-api-key`); el backend aún no hace la llamada real. | Proxear la llamada por el backend (no exponer la apiKey en el cliente) y conectar una entidad/acción real (`GOOGLESHEETS_APPEND_ROW`). | Cuenta Composio + entidad conectada |
| **Push / OneSignal** | Wiring listo; sin credenciales no envía. | Credenciales de OneSignal (App ID + REST API Key) y HTTPS en producción (requisito de Web Push). | Cuenta OneSignal + dominio HTTPS |
| **Portal WiFi / Kiosko (MikroTik/UniFi)** | Handshake con el router real, fail-closed (no finge éxito). | Router/controlador real configurado + plantilla del portal cargada en el equipo. | Hardware de red en sitio |
| **Supabase (opcional)** | Servicio cableado, no obligatorio. | Proyecto Supabase real + llaves PostgreSQL en la pestaña *Bases de Datos*. | Proyecto Supabase (si se usa) |

### Subida de logo del demo — nota de despliegue
El Generador de Demo guarda logos subidos en `public/uploads/` (ignorado por git salvo `.gitkeep`). En producción, asegurar que:
- La carpeta `public/uploads/` sea **escribible** por el proceso del backend.
- El host sirva la ruta `/uploads/*` (en dev la sirve el backend; en prod suele servirla el host del frontend junto a `public/`).
- Frontend y backend compartan ese directorio o el logo se sirva desde el mismo origen donde se genera el demo (la URL guardada es absoluta sobre ese `origin`).

### Orden recomendado para "hacer reales" las integraciones
1. **Hermes** → mayor impacto comercial: el enlace de demo se envía solo por WhatsApp.
2. **Composio** → los registros de clientes y boletos caen en Google Sheets/CRM en tiempo real.
3. **Push / OneSignal** → requiere además el dominio HTTPS (tarea 1.1).
4. **Portal WiFi** y **Supabase** → dependen de hardware/cuenta en sitio.

> **Para avanzar con cualquiera de estas se necesitan las credenciales o el servicio externo correspondiente.** Sin eso, el backend queda listo y probado solo en su camino de respaldo, pero no se puede verificar el envío/sincronización real.
