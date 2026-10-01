# 🎨 DESIGN.md — Sistema de Diseño · Fidelización & Gamificación en Mesa (Marca Blanca)

> Este archivo es la **guía oficial de diseño** del proyecto. Antes de modificar cualquier componente visual, consulta este documento. Esto garantiza que todo luzca coherente, elegante y con la identidad de la marca.

---

## 1. 🎯 Filosofía de Diseño

| Principio | Descripción |
|---|---|
| **Claridad > Decoración** | Cada elemento debe cumplir una función. Lo que no aporta, no está. |
| **Espacio como lujo** | El aire entre elementos no es desperdicio — es elegancia. Mínimo `gap-4` entre secciones. |
| **Jerarquía visual clara** | Un solo punto de atención por pantalla. El CTA principal siempre en dorado. |
| **Mobile-first** | Todo se diseña para pantallas de ~390px primero. |
| **Contraste obligatorio** | Texto oscuro `#121115` sobre fondos dorados. Texto claro `#e6e1e7` sobre fondos oscuros. |

---

## 2. 🎨 Paleta de Colores

### Fondos
| Token | Valor HEX | Uso |
|---|---|---|
| `surface` | `#141317` | Fondo principal de la app |
| `surface-container-low` | `#1c1b1f` | Tarjetas y paneles |
| `surface-container` | `#201f23` | Fondos de inputs y chips |
| `surface-container-high` | `#2b292e` | Bordes de separación |
| `surface-container-highest` | `#363439` | Hover states oscuros |
| `surface-container-lowest` | `#0f0e12` | Cabecera (header) |

### Colores de Marca (Dorado)
| Token | Valor HEX | Uso |
|---|---|---|
| `gold` | `#f2be71` | Color principal de la marca. Botones CTA, barras completadas, íconos activos. |
| `gold-light` | `#ffddb1` | Gradientes suaves, texto destacado sobre fondo oscuro. |
| `gold-deep` | `#684400` | Fondos de badges y pills doradas. |

### Colores de Texto
| Token | Valor HEX | Uso |
|---|---|---|
| `on-surface` | `#e6e1e7` | Texto principal sobre fondos oscuros |
| `on-surface-variant` | `#ccc3d8` | Texto secundario, subtítulos, leyendas |
| `obsidian` | `#121115` | Texto **obligatorio** sobre cualquier fondo dorado |

### Colores de Estado
| Color | HEX | Uso |
|---|---|---|
| Éxito | `#10b981` | WiFi activo, confirmaciones, pasos completados |
| Error | `#ffb4ab` | Mensajes de error |
| Fuego / Urgencia | `#ff8c42` | Cronómetro activo, botón de detener temporizador |
| Lila (especial) | `#d1bcff` | Gradiente del paso activo en la barra de progreso |

---

## 3. ✍️ Tipografía

| Clase CSS | Fuente | Tamaño | Uso |
|---|---|---|---|
| `font-headline-xl` | Epilogue | 36px | Títulos de página principal (desktop) |
| `font-headline-xl-mobile` | Epilogue | 28px | Títulos en móvil |
| `font-headline-lg` | Epilogue | 24px | Subtítulos importantes |
| `font-headline-md` | Epilogue | 20px | Nombres de secciones |
| `font-headline-sm` | Epilogue | 16px | Títulos de tarjetas y encabezados de componentes |
| `font-body-lg` | Manrope | 16px | Texto de párrafo extenso |
| `font-body-md` | Manrope | 14px | Texto de párrafo estándar |
| `font-body-sm` | Manrope | 12px | Leyendas, notas al pie |
| `font-label-sm` | Manrope | 10px | Etiquetas de chips, badges, monospaced |

> **Regla de oro:** Títulos → **Epilogue**. Cuerpo → **Manrope**. Nunca mezclar en el mismo bloque de texto.

---

## 4. 🧩 Componentes Reutilizables

### Botones

| Clase | Apariencia | Cuándo usar |
|---|---|---|
| `.btn-gold` | Gradiente dorado, texto negro `#121115` | **Acción principal** de cada pantalla — máximo uno por paso |
| `.btn-outline-gold` | Borde dorado, fondo oscuro, texto dorado | Acción secundaria importante |
| `.btn-dark` | Fondo `#201f23`, texto dorado | Acción auxiliar o botón "volver" |
| `.btn-purple` | Gradiente lila, texto blanco | Premio especial o acción extraordinaria |
| Deshabilitado | `bg-[#1c1b1f] border-[#363439] text-[#737373] opacity-60 cursor-not-allowed` | Acciones bloqueadas antes de completar requisito |

**Alturas estándar:**
- CTA principal (avanzar de paso): `h-14 rounded-2xl`
- Acción secundaria: `h-12 rounded-full`
- Chip / acción pequeña: `h-9 rounded-full`

### Tarjetas / Cards

```css
/* Tarjeta base */
rounded-2xl bg-[#1c1b1f] border border-[#363439] p-5 sm:p-6

/* Tarjeta con destaque dorado */
rounded-2xl bg-[#1c1b1f] border border-[#f2be71]/30 p-5 sm:p-6
```

### Badges y Pills

| Clase | Uso |
|---|---|
| `.badge-gold` | Etiqueta de estado VIP, logro desbloqueado |
| `.pill-gold` | Indicador de paso activo, contadores |

---

## 5. 📐 Espaciado y Layout

### Reglas de espaciado

| Situación | Clase Tailwind | Valor real |
|---|---|---|
| Entre **secciones grandes** de una pantalla | `gap-6` o `gap-8` | 24–32px |
| Entre **elementos** dentro de una tarjeta | `gap-4` o `gap-5` | 16–20px |
| Entre ícono y texto en fila | `gap-2` | 8px |
| **Padding horizontal** de pantalla | `px-4 sm:px-6` | 16–24px |
| **Padding interno** de tarjetas | `p-5 sm:p-6` | 20–24px |
| **Padding de la cabecera** (header) | `pt-3 pb-4` | 12–16px |
| Gap entre filas de la cabecera | `gap-3` | 12px |

### Ancho máximo
Toda la app usa `max-w-lg mx-auto` → máximo **512px** centrado. Ideal para móvil y QR de mesa.

---

## 6. 📱 Estructura de la Cabecera (GameHeader)

La cabecera tiene **3 zonas fijas** en orden vertical:

```
┌──────────────────────────────────────┐
│  ● MESA 1    [ES | EN]    [WiFi][↺]  │  ← Fila 1: utilidades
│                                      │
│            [LOGO 48px]               │  ← Fila 2: marca
│         Tu Restaurante & Café        │
│                                      │
│  [7/8 · 7. Sellos VIP]         88%   │  ← Fila 3: progreso
│  ████████████████░░░░░░░░░░░░░░░░░   │
└──────────────────────────────────────┘
```

**Regla:** No saturar la cabecera. Si necesitas añadir algo, evalúa si puede ir dentro del contenido del paso en vez de en la cabecera.

---

## 7. 🔄 Flujo de 8 Pasos (UX)

El flujo es **lineal y guiado**. Cada paso habilita el siguiente solo cuando se completa la acción requerida:

| Paso | Pantalla | Requisito para avanzar |
|---|---|---|
| 1 | Datos del participante | Nombre y WhatsApp completados |
| 2 | Redes sociales (Instagram) | Foto o evidencia enviada |
| 3 | Ruleta de la suerte | Haber girado la ruleta |
| 4 | Premio + Código | Automático (pantalla informativa) |
| 5 | Calificación Google | Automático (pantalla informativa) |
| **6** | **Reto 2ª Oportunidad** | **Jugar al menos 1 intento** (botón bloqueado antes) |
| 7 | Tarjeta de 15 Sellos VIP | Automático (pantalla informativa) |
| 8 | Misiones VIP | Pantalla final |

> **Regla crítica:** Bloquear el avance **solo** cuando hay interacción obligatoria (Pasos 3 y 6). Las pantallas informativas no se bloquean — el usuario siempre puede continuar.

---

## 8. ♿ Reglas de Contraste (Accesibilidad)

> Estas reglas están codificadas en `src/index.css` vía clases globales y **nunca deben violarse**.

1. **Fondo dorado** (`btn-gold`, `badge-gold`, `pill-gold`, `gold-solid`) → texto siempre `#121115`
2. **Fondo oscuro** → texto `#e6e1e7` (principal) o `#ccc3d8` (secundario)
3. **Nunca** texto blanco sobre dorado
4. **Nunca** texto gris sobre dorado
5. Iconos Lucide sobre fondos dorados → `stroke: #121115`

---

## 9. 🎬 Animaciones Permitidas

| Tipo | Implementación | Cuándo usar |
|---|---|---|
| Entrada suave de bloque | `<Reveal delay={N}>` | Cada sección al aparecer en pantalla |
| Botón al presionar | `active:scale-95` | Todos los botones interactivos |
| Hover de brillo | `hover:brightness-105` | Botones de acción secundaria |
| Confetti | `confetti({ particleCount, spread })` | Solo al ganar un premio real |
| Ping de estado | `animate-ping` | Indicador de mesa activa en cabecera |
| Pulso suave | `animate-pulse` | Cronómetro en marcha, WiFi activo |

---

## 10. 🛑 Lo que NUNCA se debe hacer

- ❌ Texto blanco o gris claro sobre fondo dorado
- ❌ Más de **1 botón dorado** por pantalla (solo el CTA principal)
- ❌ Colores fuera de la paleta definida (no inventar HEX propios)
- ❌ Padding o margin sin consultar la tabla de espaciado (§5)
- ❌ Añadir elementos a la cabecera sin leer la sección §6
- ❌ Bloquear botones de avance en pantallas puramente informativas
- ❌ Usar `position: fixed` para la cabecera — siempre `sticky top-0`
- ❌ Texto en más de 3 líneas dentro de un botón — simplificar la copia

---

## 11. 📁 Archivos Clave del Diseño

| Archivo | Propósito |
|---|---|
| `src/index.css` | Tokens de color, tipografía, clases globales de botones y badges |
| `src/config/clientConfig.ts` | Marca blanca: nombre, logo, colores, canales de contacto |
| `src/components/qr-game/GameHeader.tsx` | Cabecera global con barra de progreso interactiva de 8 pasos |
| `src/components/shared/Reveal.tsx` | Componente de animación de entrada para secciones |
| `tailwind.config.*` | Configuración de Tailwind (tokens extendidos desde `@theme` en CSS) |

---

*Última actualización: 2026-09-30 · Versión 1.0*
