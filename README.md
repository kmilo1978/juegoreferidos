# 🎁 Motor de Fidelización, Juego QR & Referidos para Restaurantes

> Sistema interactivo de gamificación en mesa, captura de leads calificados, bucle viral de referidos por WhatsApp y embudo de reputación para Google Maps.  
> **Arquitectura ligera sin costos de servidores: opera 100% con Google Sheets como base de datos en tiempo real.**

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

5. **📊 Base de Datos Gratuita con Google Sheets en Tiempo Real:**
   - Cero servidores o bases de datos SQL de pago.
   - Cada premio ganado se escribe automáticamente en tu Google Sheets.
   - Al digitar el PIN en caja, la columna **¿Validado en Caja?** pasa de **NO** a **SÍ** con fecha y hora.

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
├── google-apps-script/
│   └── Code.gs               # Script webhook para Google Sheets (doPost)
├── src/
│   ├── assets/               # Logos, isotipos dorados y fotografías
│   ├── components/
│   │   ├── qr-game/          # Los 9 módulos del juego (Ruleta, PIN, Voucher, Feedback, etc.)
│   │   └── shared/           # Animaciones suaves Reveal
│   ├── context/              # Soporte bilingüe (Español / Inglés)
│   ├── data/                 # Configuración de URLs, WhatsApp y redes (site.ts)
│   ├── lib/                  # Compresor de fotos móviles y utilidades
│   ├── App.tsx               # Aplicación principal del juego
│   ├── index.css             # Estilos y variables de diseño
│   └── main.tsx              # Punto de entrada de React
├── DOCUMENTACION_Y_MANIFIESTO.md  # Manifiesto completo y manual de replicación
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

### 3. Iniciar en modo desarrollo
```bash
npm run dev
# o con bun:
bun dev
```
Abre en tu navegador: `http://localhost:5173`.

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
