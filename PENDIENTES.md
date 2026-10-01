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
| **2.3** | **Capacitación Rápida al Personal de Caja y Meseros** | Entrenar a meseros y cajeros en el uso de los PINs de validación de 4 dígitos (`4321` / `9395`) para quemar cupones de ruleta y registrar sellos de visita de forma rápida. | Capacitación |
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
