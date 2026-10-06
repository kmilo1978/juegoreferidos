import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Code2,
  ShieldCheck,
  Database,
  Cpu,
  Smartphone,
  Sliders,
  Sparkles,
  Wifi,
  Bell,
  MessageCircle,
  FileQuestion,
  Terminal,
  Server,
  Key,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  Target,
  Presentation,
  QrCode,
  MapPin,
  Award,
  Zap,
  Share2,
  Flame,
  DollarSign,
  Users2,
  ArrowRight,
} from "lucide-react";

interface FaqItem {
  id: string;
  category: string;
  question: string;
  targetRole: "admin" | "dev" | "both";
  answer: string[];
  relatedRoute?: string;
  relatedRouteLabel?: string;
  codeSnippet?: string;
}

interface BusinessPitchStep {
  number: number;
  title: string;
  stageBadge: string;
  badgeColor: string;
  restaurantProblem: string;
  pitchToOwner: string;
  realLifeExample: string;
  businessMetric: string;
  demoRoute: string;
  demoLabel: string;
}

export function Faq() {
  const [activeMode, setActiveMode] = useState<"pitch" | "faq">("pitch");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "dev">("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["faq-1", "faq-2"]));
  const [expandedPitchStep, setExpandedPitchStep] = useState<number | null>(1);

  const businessPitchSteps: BusinessPitchStep[] = [
    {
      number: 1,
      title: "Atracción & Entrada Cero-Fricción",
      stageBadge: "MOMENTO 1 · CONTACTO",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/40",
      restaurantProblem:
        "El 95% de los comensales se niega a descargar una app pesada solo para comer o tomar un café. Las tarjetas de cartón y volantes de papel se pierden o terminan en la basura.",
      pitchToOwner:
        "«No le pidas a tu cliente que instale nada. Le colocamos un sticker elegante de acrílico con chip NFC y código QR en cada mesa. El comensal solo acerca su teléfono o apunta su cámara, y en 1 solo segundo se abre la experiencia exclusiva de tu restaurante directamente en su navegador».",
      realLifeExample:
        "Mesa 4. Una pareja pide dos cafés. Ven un sticker dorado con la frase 'Toca aquí con tu celular y gana un postre de la casa'. El cliente apoya su iPhone y se abre la pantalla al instante.",
      businessMetric: "100% de tasa de apertura sin fricción ni descargas en App Store o Google Play.",
      demoRoute: "/?paso=1&demo=true",
      demoLabel: "Probar Escaneo en Mesa (Paso 1)",
    },
    {
      number: 2,
      title: "Captación Consentida de Datos para CRM",
      stageBadge: "MOMENTO 2 · CAPTACIÓN",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/40",
      restaurantProblem:
        "Un restaurante promedio atiende entre 1.000 y 3.000 comensales al mes, pero cuando pagan la cuenta se van y el dueño no tiene su teléfono para volver a invitarlos.",
      pitchToOwner:
        "«Convierte a clientes anónimos en una base de datos propia de alto valor. Para desbloquear el juego y recibir su beneficio de mesa, el cliente ingresa su nombre y su número de WhatsApp. En 5 segundos tienes su contacto consentido para campañas futuras sin costo».",
      realLifeExample:
        "El comensal ve: 'Ingresa tu nombre y WhatsApp para guardar tu premio'. Escribe 'Carlos Gómez, 300 123 4567' y pulsa 'Continuar'. Queda registrado en tu panel administrativo.",
      businessMetric: "Captura de 300 a 800 números de WhatsApp calificados por mes por sede.",
      demoRoute: "/?paso=1&demo=true",
      demoLabel: "Ver Formulario de Captura",
    },
    {
      number: 3,
      title: "Viralidad Orgánica en Redes Sociales",
      stageBadge: "MOMENTO 3 · VISIBILIDAD",
      badgeColor: "bg-pink-500/20 text-pink-400 border-pink-500/40",
      restaurantProblem:
        "Pagar publicidad en Facebook o Instagram es cada día más caro y la mayoría de seguidores en redes nunca visitan el local físico.",
      pitchToOwner:
        "«Pon a tus clientes a hacerte publicidad gratis ante sus propios amigos locales. Para activar el juego o multiplicar sus premios, el sistema los invita a seguir tu cuenta o compartir una foto de su plato etiquetándote en Instagram Stories».",
      realLifeExample:
        "Carlos toma una foto al plato de pasta o a la hamburguesa, pulsa 'Subir historia a Instagram con @turestaurante' y el sistema valida su participación.",
      businessMetric: "Cientos de menciones reales de clientes locales que viven o trabajan cerca de tu negocio.",
      demoRoute: "/?paso=2&demo=true",
      demoLabel: "Ver Validación Social (Paso 2)",
    },
    {
      number: 4,
      title: "Gamificación & Adrenalina en Mesa",
      stageBadge: "MOMENTO 4 · EXPERIENCIA",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      restaurantProblem:
        "Los minutos de espera entre el pedido y la llegada de la comida suelen ser aburridos o generar impaciencia en los comensales.",
      pitchToOwner:
        "«Transforma la espera en un momento memorable y divertido. El cliente gira una Ruleta luminosa con efectos sonoros, raspa una tarjeta digital o juega a la memoria. Siempre gana un beneficio gastronómico calculado con tu propio margen de ganancia».",
      realLifeExample:
        "La ruleta gira con animación física y sonido de casino. La aguja se detiene en 'Porción de Tarta Vasca' o 'Café Gourmet'. Toda la mesa festeja y comenta la experiencia.",
      businessMetric: "Aumenta la satisfacción en mesa y reduce la percepción del tiempo de espera en cocina.",
      demoRoute: "/?paso=3&demo=true",
      demoLabel: "Probar Ruleta & Minijuegos (Paso 3)",
    },
    {
      number: 5,
      title: "Voucher Único con PIN & Aumento de Ticket",
      stageBadge: "MOMENTO 5 · CONVERSIÓN",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      restaurantProblem:
        "Los dueños temen regalar comida descontroladamente o que los comensales hagan trampa mostrando capturas de pantalla viejas.",
      pitchToOwner:
        "«Cero trampas y aumento de consumo. El sistema emite un voucher con código único alfanumérico (ej: REST-4821) y cuenta regresiva de vencimiento. Para aplicarlo, el mesero o cajero ingresa un PIN de 4 dígitos en el móvil del cliente. Además, puedes condicionarlo a un consumo mínimo (ej: postre gratis en cuentas mayores a $30.000)».",
      realLifeExample:
        "Carlos llama al mesero: 'Me gané este capuchino'. El mesero verifica que consumió el plato fuerte, digita su PIN '1978' en el teléfono de Carlos y el cupón queda marcado como CANJEADO con fecha y hora exacta.",
      businessMetric: "Aumento del ticket promedio entre un 15% y un 28% gracias a consumos adicionales condicionados.",
      demoRoute: "/?paso=4&demo=true",
      demoLabel: "Ver Voucher de Canje (Paso 4)",
    },
    {
      number: 6,
      title: "Blindaje de Reputación 5 Estrellas en Google Maps",
      stageBadge: "MOMENTO 6 · REPUTACIÓN",
      badgeColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
      restaurantProblem:
        "Un cliente insatisfecho corre a dejar una reseña de 1 estrella en Google Maps, mientras que los clientes felices casi nunca se toman el tiempo de opinar.",
      pitchToOwner:
        "«Implementamos un filtro inteligente de reputación: el comensal califica con estrellas su experiencia. Si califica con 4 o 5 estrellas, se le redirige automáticamente a tu perfil de Google Maps para que deje su reseña pública. Si califica con 1 a 3 estrellas, se canaliza de forma privada a un WhatsApp de gerencia para resolver su queja antes de que dañe tu reputación en internet».",
      realLifeExample:
        "Carlos califica con 5 estrellas el servicio. El sistema le agradece y abre Google Maps con 5 estrellas preseleccionadas para publicar su opinión en 2 clics.",
      businessMetric: "Posiciona tu restaurante en el Top 3 de Google Maps en tu ciudad, atrayendo turistas y clientes nuevos cada día.",
      demoRoute: "/?paso=5&demo=true",
      demoLabel: "Probar Embudo de Reseñas (Paso 5)",
    },
    {
      number: 7,
      title: "La 2ª Oportunidad Viral (WhatsApp Status)",
      stageBadge: "MOMENTO 7 · VIRALIDAD",
      badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/40",
      restaurantProblem:
        "El 'boca a boca' tradicional es lento y difícil de medir.",
      pitchToOwner:
        "«Si el comensal no ganó el premio mayor en la ruleta, le ofrecemos una Segunda Oportunidad: compartir su experiencia en su Estado de WhatsApp para desbloquear el Reto de Precisión 10 Segundos. Sus amigos y familiares ven tu restaurante en sus estados».",
      realLifeExample:
        "Carlos pulsa 'Compartir en mi Estado de WhatsApp'. 80 contactos ven la historia con la foto del local. Al volver, se activa el cronómetro donde debe frenar en 10.00 exactos para ganar.",
      businessMetric: "Efecto bola de nieve: 1 comensal comparte y atrae en promedio a 2.4 nuevos clientes de su círculo cercano.",
      demoRoute: "/?paso=6&demo=true",
      demoLabel: "Probar Reto de Precisión (Paso 6)",
    },
    {
      number: 8,
      title: "Fidelización Cero-Fricción con One-Tap Stamp",
      stageBadge: "MOMENTO 8 · RECURRENCIA",
      badgeColor: "bg-amber-400/20 text-[var(--gold)] border-[var(--gold)]/40",
      restaurantProblem:
        "Los clientes pierden las tarjetas de papel con sellos de tinta o las lavan en el pantalón. Las apps de puntos requieren login y contraseñas que el cliente olvida.",
      pitchToOwner:
        "«El teléfono del comensal es su tarjeta VIP permanente. En su segunda visita en adelante, cuando vuelve a apoyar el móvil en el sticker NFC de la mesa, el sistema lo reconoce de inmediato: '¡Qué alegría verte de nuevo, Carlos!', le suma automáticamente su sello de la visita de hoy sin pedir formularios repetitivos, y le muestra qué tan cerca está de su próximo gran premio (Sellos 5, 10 y 15)».",
      realLifeExample:
        "Carlos vuelve al local 8 días después con unos amigos. Apoya su celular en la mesa. La pantalla dice '¡Bienvenido de nuevo Carlos! +1 Sello registrado hoy'. Ya lleva 4 sellos y sabe que en la próxima visita gana postre gratis.",
      businessMetric: "Incrementa la frecuencia de visita recurrente en un 38% y fideliza al comensal para que no se vaya a la competencia.",
      demoRoute: "/?paso=7&modo=sello_nfc&demo=true",
      demoLabel: "Probar One-Tap Stamp en Vivo (Paso 7)",
    },
    {
      number: 9,
      title: "Misiones Gamificadas & Embajadores VIP",
      stageBadge: "MOMENTO 9 · RETENCIÓN",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/40",
      restaurantProblem:
        "Los días martes y miércoles en la tarde el salón tiene mesas vacías y el personal está ocioso.",
      pitchToOwner:
        "«Activa misiones temáticas para llenar el salón en horas muertas: 'Ven un martes con 3 amigos y gana Doble Sello', o 'Haz una reseña en video y desbloquea el estatus de Embajador VIP'. Además, cada visita acumula tickets para un gran Sorteo Mensual que mantiene la expectativa viva todo el mes».",
      realLifeExample:
        "El cliente entra al Paso 8 y ve: 'Misión Almuerzo con Amigos (+2 sellos extra)'. Decide organizar su reunión de trabajo en tu restaurante para completar la misión.",
      businessMetric: "Llena horas y días valle (lunes a jueves) con incentivos controlados.",
      demoRoute: "/?paso=8&demo=true",
      demoLabel: "Ver Misiones VIP (Paso 8)",
    },
    {
      number: 10,
      title: "Geofencing & Notificaciones Push sin Costo",
      stageBadge: "MOMENTO 10 · REACTIVACIÓN",
      badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/40",
      restaurantProblem:
        "Enviar SMS masivos cuesta dinero y los correos electrónicos se van a la carpeta de spam.",
      pitchToOwner:
        "«Reactivación automática en el bolsillo del cliente. Gracias a OneSignal y Geofencing, si un cliente camina a 500 metros de tu local a la hora del almuerzo, o si lleva 10 días sin visitarte, su celular recibe una notificación push: '¡Hola Carlos! Tu mesa favorita está lista hoy con 2x1 en cafés de 3 a 6 PM'. Todo sin pagar tarifas por mensaje».",
      realLifeExample:
        "Viernes a la 1:15 PM. Carlos camina a dos cuadras del restaurante. Le vibra el teléfono con la foto de la especialidad del chef del día. Entra al local a almorzar.",
      businessMetric: "Costo por mensaje $0 y tasa de apertura 4 veces superior al correo electrónico tradicional.",
      demoRoute: "/admin/push",
      demoLabel: "Ver Panel de Geofencing & Push",
    },
  ];

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(faqData.map((f) => f.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const categories = [
    { id: "all", label: "Todas las Categorías" },
    { id: "modules", label: "🧩 Módulos y Funcionalidades" },
    { id: "branding", label: "🎨 Diseño, Fuentes & Colores" },
    { id: "database", label: "🗄️ Base de Datos & APIs" },
    { id: "security", label: "🔒 Seguridad, Roles & PINs" },
    { id: "integrations", label: "🔗 Integraciones & Canales" },
    { id: "dev", label: "💻 Guía Técnica & Despliegue" },
    { id: "troubleshooting", label: "🛠️ Solución de Errores" },
  ];

  const faqData: FaqItem[] = [
    {
      id: "faq-1",
      category: "modules",
      targetRole: "both",
      question: "¿Cómo funciona la arquitectura modular de juegos en las mesas?",
      answer: [
        "El sistema cuenta con un catálogo modular compuesto por 5 dinámicas interactivas principales: Jackpot (Tragaperras), Descubre y Gana (3x3), Juego de Memoria (Halloween/4x4), Raspa y Gana (Navidad/Lámina táctil) y Suelta la Bola (Plinko/11 filas), además de la Ruleta y la 2ª Oportunidad.",
        "Cada juego es 100% modular y cuenta con soporte riguroso de DOS CARAS: Cara 1 (Portada de Captación con llamada a la acción) y Cara 2 (Tablero Interactivo con pantalla de premio o voucher canjeable).",
        "El administrador puede seleccionar qué juego está activo en sala en 1 solo clic desde el Hub de Juegos o en el menú de Personalización Exclusiva.",
      ],
      relatedRoute: "/games",
      relatedRouteLabel: "Ir al Catálogo de Juegos",
    },
    {
      id: "faq-2",
      category: "branding",
      targetRole: "both",
      question: "¿Cómo personalizar los colores, fuentes y marcas de todo el sistema?",
      answer: [
        "Puedes acceder a la sección 'Identidad, Marca & Ruleta' (/config) o a 'Personalización Exclusiva' (/games/exclusive).",
        "El sistema permite modificar: colores primarios, secundarios, fondos, bordes, tipografías Google Fonts (con selector curado y buscador de fuentes), tamaños de títulos y textos, radio de redondeo (sharp, suave, redondeado o cápsula) y sombras.",
        "Cualquier modificación se propaga de inmediato mediante variables CSS Custom Properties (--color-brand-primary, --font-brand-heading, etc.) y se puede verificar en tiempo real en el Simulador Móvil en Vivo.",
      ],
      relatedRoute: "/config",
      relatedRouteLabel: "Configurar Marca & Fuentes",
    },
    {
      id: "faq-3",
      category: "modules",
      targetRole: "admin",
      question: "¿Cómo activar o desactivar módulos independientes del sistema?",
      answer: [
        "Desde la pestaña 'Módulos del Sistema' en la configuración general, puedes encender o apagar interruptores para: Ruleta, Juegos de mesa, Tarjeta de 15 sellos, Misiones gamificadas, Sorteo mensual, Portal WiFi cautivo, Notificaciones Push y Asistente Hermes IA.",
        "Desactivar un módulo oculta sus accesos en el embudo del cliente sin afectar el resto de la base de datos ni los registros de premios ya emitidos.",
      ],
      relatedRoute: "/config",
      relatedRouteLabel: "Gestionar Módulos del Sistema",
    },
    {
      id: "faq-4",
      category: "security",
      targetRole: "both",
      question: "¿Cómo se gestiona el control de acceso y la validación de premios por PIN?",
      answer: [
        "El sistema cuenta con roles diferenciados: Administrador (acceso total a métricas, configuraciones y canales) y Cajero/Personal de Sala (validación rápida de premios).",
        "Cada premio emitido en mesa genera un código único (ej: REST-8492) y un botón de canje protegido.",
        "Para validar un premio en mostrador, el mesero o cajero ingresa un PIN de 4 dígitos (configurable en /security). Esto previene canjes duplicados o fraudes y registra la hora exacta del consumo.",
      ],
      relatedRoute: "/security",
      relatedRouteLabel: "Panel de Seguridad & PINs",
    },
    {
      id: "faq-5",
      category: "database",
      targetRole: "dev",
      question: "¿Cuál es la estructura de la base de datos y cómo se sincroniza?",
      answer: [
        "El backend opera con una base de datos JSON estructurada de alta velocidad ('server/db.json') con persistencia síncrona en disco y copia de seguridad en memoria.",
        "Tablas principales: 'prizes' (premios ganados, códigos únicos y estados), 'tables' (las 10 mesas activas en sala con sesión y cliente), 'customers' (clientes registrados por teléfono WhatsApp), 'missions' (misiones y evidencias enviadas), 'reputationFeedbacks' (reseñas del embudo) y 'settings' (configuración de marca y módulos).",
        "Para despliegues en la nube, el sistema incluye sincronización automática con Google Sheets (vía Webhook) y soporte nativo para Supabase / PostgreSQL en la sección /databases.",
      ],
      relatedRoute: "/databases",
      relatedRouteLabel: "Ver Estado de Base de Datos",
      codeSnippet: "GET /api/metrics -> { totalPrizes, redeemedPrizes, tables, logs }\nPOST /api/config -> Actualización en caliente de db.json",
    },
    {
      id: "faq-6",
      category: "integrations",
      targetRole: "both",
      question: "¿Cómo funciona la conexión con WhatsApp y Google Maps?",
      answer: [
        "WhatsApp: Se conecta tanto para la validación de foto de consumo en mesa, como para la 2ª oportunidad viral (compartir en estados) y la comunidad VIP del restaurante.",
        "Google Maps: El embudo de reputación (/reputation) filtra las calificaciones de los clientes. Si califican con 4 o 5 estrellas, se redirige automáticamente al perfil de Google Business para publicar la reseña; si es inferior, se canaliza de forma privada a WhatsApp para resolver la queja internamente sin dañar la reputación pública.",
      ],
      relatedRoute: "/reputation",
      relatedRouteLabel: "Embudo de Reputación",
    },
    {
      id: "faq-7",
      category: "integrations",
      targetRole: "both",
      question: "¿Cómo configurar el Asistente NFC y las etiquetas en mesa?",
      answer: [
        "En la vista /nfc, el sistema genera las URLs optimizadas para grabar en etiquetas NFC NTAG213 / NTAG215 adhesivas colocadas en cada mesa.",
        "El cliente solo debe acercar su teléfono compatible (iPhone o Android) a la calcomanía en la mesa y se abre directamente su mesa asignada con el juego activo.",
        "Se incluye un botón de 1-clic para copiar todos los enlaces o descargar los códigos QR de alta resolución listos para imprimir en caballetes de acrílico o servilleteros.",
      ],
      relatedRoute: "/nfc",
      relatedRouteLabel: "Asistente NFC de Mesas",
    },
    {
      id: "faq-8",
      category: "dev",
      targetRole: "dev",
      question: "¿Cuáles son las variables de entorno y los comandos de inicio?",
      answer: [
        "El backend se ejecuta en el puerto 3001 con: 'bun server/index.js' (o 'node server/index.js').",
        "El frontend Vite se ejecuta en el puerto 5173 con: 'bun run dev' (o 'npm run dev').",
        "Variables de entorno admitidas en el archivo .env o en el sistema: PORT=3001, SUPABASE_URL, SUPABASE_ANON_KEY, ONESIGNAL_APP_ID.",
        "Para compilación de producción: 'bun run build' genera los paquetes optimizados en el directorio 'dist/'.",
      ],
      codeSnippet: "# Levantar servidor en desarrollo:\nbun server/index.js\nbun run dev\n\n# Compilar producción con verificación TypeScript:\nbun run build",
    },
    {
      id: "faq-9",
      category: "troubleshooting",
      targetRole: "both",
      question: "¿Qué hacer si un premio aparece como duplicado o no se valida el PIN?",
      answer: [
        "1. Verifica en la sección 'Premios & Canjes' (/prizes) si el código único ya fue canjeado con anterioridad.",
        "2. Comprueba en 'Seguridad & PINs' (/security) que el PIN ingresado coincida con el PIN del personal de caja (por defecto 1234).",
        "3. Si un cliente cerró accidentalmente su navegador, su sesión de mesa conserva el premio ganado en el servidor backend durante toda la estancia en la mesa.",
      ],
      relatedRoute: "/prizes",
      relatedRouteLabel: "Ir a Cola de Validación de Premios",
    },
    {
      id: "faq-10",
      category: "dev",
      targetRole: "dev",
      question: "¿Cómo se realizan las copias de seguridad (backups) y restauración?",
      answer: [
        "Copia de seguridad local: El archivo 'server/db.json' es una instantánea completa del sistema. Puedes realizar una copia de respaldo copiando el archivo o descargándolo desde el panel en /databases.",
        "Exportación a Google Sheets: Se puede configurar un webhook para volcar cada nuevo cliente o premio en una hoja de cálculo en tiempo real.",
        "Restauración: Basta con reemplazar el archivo 'server/db.json' con la copia anterior y reiniciar el proceso backend con 'bun server/index.js'.",
      ],
      relatedRoute: "/databases",
      relatedRouteLabel: "Gestión de Copias & Sincronización",
    },
    {
      id: "faq-11",
      category: "integrations",
      targetRole: "both",
      question: "¿Cómo funciona el Geofencing y la segmentación por ubicación en el sistema?",
      answer: [
        "El módulo de Notificaciones Push incorpora una suite de Geofencing con 3 modalidades claramente diferenciadas para ajustarse a cada caso de negocio:",
        "1. Opción 1: Geofencing por Radio Web (Latitud, Longitud y Radio en metros/km). Segmenta a los suscriptores web que se encuentren dentro de la zona geográfica configurada (ej: 500m a la redonda de la sede).",
        "2. Opción 2: Geofencing Real-Time Mobile con @capacitor-community/onesignal-location. Para aplicaciones móviles empaquetadas (Android / iOS), activa el monitoreo de cercanía en segundo plano y dispara alertas automáticas cuando el comensal entra o sale del polígono del restaurante.",
        "3. Opción 3: Geofencing por Presencia Física (WiFi Cautivo + NFC/QR en Mesas). Identifica con 100% de certeza que el cliente está físicamente sentado en el salón consumiendo, sin depender del GPS satelital.",
      ],
      relatedRoute: "/push",
      relatedRouteLabel: "Ver Panel de Geofencing & Push",
    },
    {
      id: "faq-12",
      category: "integrations",
      targetRole: "both",
      question: "¿Cuál es la diferencia entre Google Geofence y OneSignal? ¿Es necesario configurarlo por separado?",
      answer: [
        "NO es necesario configurar Google Geofencing por separado. OneSignal ya consume e implementa internamente la API de Google Geofencing en dispositivos Android.",
        "Google Geofencing API es el servicio de bajo nivel de Google Play Services que optimiza el consumo de batería al monitorear perímetros geográficos.",
        "OneSignal abstrae toda esa complejidad: al definir tu radio y coordenadas en el panel de control o mediante el plugin de Capacitor, OneSignal se encarga de registrar el perímetro en Google Play Services (en Android) y en CoreLocation (en iOS), entregando la notificación en el momento exacto.",
      ],
      relatedRoute: "/push",
      relatedRouteLabel: "Configuración de Geofencing",
    },
    {
      id: "faq-13",
      category: "integrations",
      targetRole: "both",
      question: "¿Qué son los Beacons Bluetooth y por qué nuestro sistema NO los necesita?",
      answer: [
        "Los Beacons son pequeños transmisores de hardware Bluetooth (BLE) que funcionan con pilas o baterías y emiten una señal constante de proximidad a pocos metros.",
        "Desventajas de los Beacons tradicionales: Requieren inversión en hardware físico costoso, cambio frecuente de pilas, fallan por interferencias electromagnéticas y obligan al usuario a tener Bluetooth encendido y otorgar permisos invasivos.",
        "Por qué nuestro sistema es superior: Sustituimos los Beacons mediante calcomanías NFC pasivas colocadas en cada mesa (cuestan centavos, no usan baterías y duran años) junto con el portal de bienvenida WiFi y el Geofencing de OneSignal. El cliente obtiene una experiencia más rápida, fluida y sin costo de mantenimiento de hardware.",
      ],
      relatedRoute: "/nfc",
      relatedRouteLabel: "Ver Asistente NFC en Mesas",
    },
    {
      id: "faq-14",
      category: "modules",
      targetRole: "both",
      question: "¿Cómo funciona la experiencia One-Tap Stamp (Visita 1 vs Visita 2 en adelante)?",
      answer: [
        "El sistema implementa un flujo inteligente de 2 vías para eliminar la fricción en clientes frecuentes:",
        "• Visita 1 (Cliente Nuevo): Al escanear el QR o acercar el móvil al chip NFC por primera vez, realiza el embudo completo: Registro de Nombre y WhatsApp -> Foto o seguimiento en redes -> Minijuego de la Casa -> Cupón de bienvenida -> Primer sello en el pasaporte -> Reseña en Google.",
        "• Visita 2 en adelante (Cliente Recurrente): El sistema reconoce automáticamente el dispositivo del cliente. Al acercar el móvil al chip NFC o escanear el QR de la mesa, salta de inmediato al Paso 7 (Pasaporte de Fidelización VIP), muestra un banner personalizado ('¡Qué alegría verte de nuevo, {nombre}!') y le añade +1 Sello automáticamente.",
        "• Juego Opcional: Si el cliente recurrente desea probar suerte ese día, dispone de un botón directo 'Jugar Minijuego de la Casa' para acceder a la Ruleta, Memoria o Raspa.",
      ],
      relatedRoute: "/nfc",
      relatedRouteLabel: "Asistente NFC & Sellos",
    },
    {
      id: "faq-15",
      category: "security",
      targetRole: "both",
      question: "¿Cómo se previenen los fraudes y los sellos duplicados en el One-Tap Stamp?",
      answer: [
        "1. Regla de 1 Sello por Día / por Cliente: El sistema guarda la fecha del último estampado tanto en el dispositivo como en los registros del servidor. Si el cliente vuelve a escanear en la misma jornada, se le muestra su saldo actual sin sumar sellos duplicados.",
        "2. Identificación por WhatsApp: Toda la acumulación queda vinculada al número telefónico validado del cliente.",
        "3. Validación de Premios por PIN del Personal: Aunque el cliente acumule sellos en su teléfono, el canje físico de los premios mayores (sellos 5, 10 o 15) requiere obligatoriamente que el mesero o cajero introduzca su PIN de 4 dígitos en el modal de verificación.",
      ],
      relatedRoute: "/security",
      relatedRouteLabel: "Control de Seguridad & PINs",
    },
  ];

  const filteredFaqs = useMemo(() => {
    return faqData.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      const matchesRole =
        roleFilter === "all" || item.targetRole === "both" || item.targetRole === roleFilter;

      return matchesSearch && matchesCategory && matchesRole;
    });
  }, [searchQuery, selectedCategory, roleFilter]);

  return (
    <div className="space-y-6">
      {/* 1. ENCABEZADO Y SELECTOR DE VISTA: GUÍA COMERCIAL VS PREGUNTAS TÉCNICAS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#363439] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              CENTRO DE CONOCIMIENTO & VENTAS
            </span>
            <span className="text-xs text-[#958da1]">Guías Operativas y Argumentario Comercial</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#e6e1e7] font-['Epilogue'] tracking-tight">
            {activeMode === "pitch"
              ? "Guía Paso a Paso para Vender a Negocios Gastronómicos"
              : "Preguntas Frecuentes & Documentación Técnica"}
          </h1>
          <p className="text-xs sm:text-sm text-[#ccc3d8] mt-1 max-w-2xl">
            {activeMode === "pitch"
              ? "El argumento comercial completo, etapa por etapa, con el problema del dueño, el guión para venderle y ejemplos reales de la vida cotidiana en mesa."
              : "Respuestas claras sobre el funcionamiento modular, configuración de marca, bases de datos, seguridad por PIN y mantenimiento del sistema."}
          </p>
        </div>

        {/* SELECTOR MAESTRO DE MODO */}
        <div className="flex items-center p-1 rounded-2xl bg-[#1c1b1f] border border-[#363439] shrink-0">
          <button
            type="button"
            onClick={() => setActiveMode("pitch")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeMode === "pitch"
                ? "bg-[var(--gold)] text-[#121115] shadow-lg shadow-[var(--gold)]/20 font-black"
                : "text-[#ccc3d8] hover:text-white"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Guía de Venta a Negocios (Pitch)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("faq")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeMode === "faq"
                ? "bg-[var(--gold)] text-[#121115] shadow-lg shadow-[var(--gold)]/20 font-black"
                : "text-[#ccc3d8] hover:text-white"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Preguntas Frecuentes (FAQ)</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VISTA 1: GUÍA PASO A PASO PARA VENDER EL SISTEMA A NEGOCIOS */}
      {/* ======================================================== */}
      {activeMode === "pitch" && (
        <div className="space-y-6">
          {/* Banner de Valor Comercial */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#201f23] via-[#1c1b1f] to-[#2b292e] border border-[var(--gold)]/40 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] text-xs font-bold font-mono">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>EL ARGUMENTARIO COMERCIAL EN 1 MINUTO</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#e6e1e7] font-['Epilogue']">
                  ¿Por qué cualquier restaurante, cafetería o bar necesita este sistema hoy?
                </h3>
                <p className="text-xs sm:text-sm text-[#ccc3d8] leading-relaxed">
                  Los restaurantes sufren 3 grandes dolores: <strong className="text-[#e6e1e7]">1)</strong> Pierden el contacto de sus comensales al pagar la cuenta, <strong className="text-[#e6e1e7]">2)</strong> Tienen mesas vacías de lunes a jueves, y <strong className="text-[#e6e1e7]">3)</strong> Dependen de pagar comisiones del 30% a apps de domicilios o pauta cara en redes. Este sistema resuelve los tres problemas convirtiendo cada mesa en un canal propio de fidelización y ventas.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#141317] border border-[#363439] flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--gold)]">Retención</span>
                  <span className="text-xl font-bold font-['Epilogue'] text-[#e6e1e7]">+38%</span>
                  <span className="text-[10px] text-[#958da1]">Visitas recurrentes</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#141317] border border-[#363439] flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-[#10b981]">Base Propia</span>
                  <span className="text-xl font-bold font-['Epilogue'] text-[#e6e1e7]">+500</span>
                  <span className="text-[10px] text-[#958da1]">WhatsApp/mes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline de los 10 Pasos con Casos Reales */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
                <Target className="w-5 h-5 text-[var(--gold)]" />
                <span>Las 10 Etapas del Viaje del Comensal (De Visitante Casual a Cliente Fiel)</span>
              </h3>
              <span className="text-xs text-[#958da1]">Haz clic en cada paso para ver el guión de venta</span>
            </div>

            <div className="space-y-3">
              {businessPitchSteps.map((step) => {
                const isExpanded = expandedPitchStep === step.number;
                return (
                  <div
                    key={step.number}
                    className={`rounded-2xl border transition-all ${
                      isExpanded
                        ? "bg-[#1c1b1f] border-[var(--gold)]/60 shadow-xl"
                        : "bg-[#1c1b1f] border-[#363439] hover:border-[var(--gold)]/30"
                    }`}
                  >
                    {/* Fila Encabezado del Paso */}
                    <button
                      type="button"
                      onClick={() => setExpandedPitchStep(isExpanded ? null : step.number)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 transition-transform ${
                            isExpanded
                              ? "bg-[var(--gold)] text-[#121115] scale-105 shadow-md"
                              : "bg-[#201f23] border border-[#363439] text-[#ccc3d8]"
                          }`}
                        >
                          {step.number}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${step.badgeColor}`}
                            >
                              {step.stageBadge}
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-[#e6e1e7] truncate font-['Epilogue']">
                            {step.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="hidden sm:inline-block text-xs font-semibold text-[var(--gold)]">
                          {isExpanded ? "Ocultar Detalles" : "Ver Pitch & Ejemplo"}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-[var(--gold)]" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[#958da1]" />
                        )}
                      </div>
                    </button>

                    {/* Cuerpo Desplegable del Paso */}
                    {isExpanded && (
                      <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-[#363439]/70 space-y-4 animate-in fade-in">
                        {/* 1. El Problema del Restaurante */}
                        <div className="p-4 rounded-xl bg-[#201f23] border border-red-500/30 space-y-1.5">
                          <span className="text-[11px] font-mono font-bold uppercase text-red-400 flex items-center gap-1.5">
                            <span>❌ EL PROBLEMA DEL NEGOCIO HOY:</span>
                          </span>
                          <p className="text-xs sm:text-sm text-[#ccc3d8] leading-relaxed">
                            {step.restaurantProblem}
                          </p>
                        </div>

                        {/* 2. Cómo Explicárselo al Dueño (El Pitch) */}
                        <div className="p-4 rounded-xl bg-[#141317] border border-[var(--gold)]/40 space-y-2">
                          <span className="text-[11px] font-mono font-bold uppercase text-[var(--gold)] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>CÓMO EXPLICÁRSELO AL DUEÑO (EL GUION COMERCIAL):</span>
                          </span>
                          <p className="text-xs sm:text-sm text-[#e6e1e7] leading-relaxed italic font-serif">
                            {step.pitchToOwner}
                          </p>
                        </div>

                        {/* 3. Ejemplo Real de la Vida en Mesa & Métrica */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="p-4 rounded-xl bg-[#201f23] border border-[#363439] space-y-1.5">
                            <span className="font-mono text-[10px] font-bold uppercase text-[#ccc3d8] flex items-center gap-1">
                              <span>🍽️ CASO PRÁCTICO EN SALA:</span>
                            </span>
                            <p className="text-[#ccc3d8] leading-relaxed">
                              {step.realLifeExample}
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-[#0d2e1f] border border-[#10b981]/40 space-y-1.5">
                            <span className="font-mono text-[10px] font-bold uppercase text-[#10b981] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>IMPACTO ECONÓMICO / MÉTRICA:</span>
                            </span>
                            <p className="text-emerald-300 font-semibold leading-relaxed">
                              {step.businessMetric}
                            </p>
                          </div>
                        </div>

                        {/* Botón para Probar en el Demo */}
                        <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                          <span className="text-[11px] text-[#958da1]">
                            Puedes mostrar esta pantalla en vivo durante tu reunión con el cliente.
                          </span>
                          <a
                            href={step.demoRoute}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl btn-gold text-xs font-bold text-[#121115] hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5 shadow-md"
                          >
                            <span>{step.demoLabel}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VISTA 2: BASE DE PREGUNTAS FRECUENTES TÉCNICAS & OPERATIVAS */}
      {/* ======================================================== */}
      {activeMode === "faq" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#958da1]">
              Consultas sobre arquitectura, base de datos, seguridad y configuración de canales.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={expandAll}
                className="py-1.5 px-3 rounded-lg bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] hover:text-white border border-[#363439] text-xs font-bold transition-all cursor-pointer"
              >
                Expandir Todas
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="py-1.5 px-3 rounded-lg bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] hover:text-white border border-[#363439] text-xs font-bold transition-all cursor-pointer"
              >
                Colapsar Todas
              </button>
            </div>
          </div>

      {/* 2. BARRA DE BÚSQUEDA Y FILTRO POR ROL */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#958da1] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por palabra clave (ej: PIN, colores, base de datos, ruleta, WhatsApp)..."
              className="w-full bg-[#201f23] border border-[#363439] focus:border-[var(--gold)]/60 focus:outline-none text-[#e6e1e7] rounded-xl pl-10 pr-4 py-2.5 text-xs placeholder:text-[#958da1]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#958da1] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-[#201f23] p-1 rounded-xl border border-[#363439] w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setRoleFilter("all")}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                roleFilter === "all" ? "bg-[var(--gold)] text-[#121115]" : "text-[#ccc3d8] hover:text-white"
              }`}
            >
              Todos los Roles
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("admin")}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                roleFilter === "admin" ? "bg-[var(--gold)] text-[#121115]" : "text-[#ccc3d8] hover:text-white"
              }`}
            >
              Administrador
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("dev")}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                roleFilter === "dev" ? "bg-[var(--gold)] text-[#121115]" : "text-[#ccc3d8] hover:text-white"
              }`}
            >
              Desarrollador
            </button>
          </div>
        </div>

        {/* Píldoras de Categorías */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat.id
                  ? "bg-[#2b292e] text-[var(--gold)] border-[var(--gold)] font-bold shadow-xs"
                  : "bg-[#201f23] text-[#ccc3d8] border-[#363439] hover:border-[var(--gold)]/40 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. LISTADO DE PREGUNTAS Y RESPUESTAS (ACORDEONES) */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-12 text-center space-y-3">
            <FileQuestion className="w-10 h-10 text-[#958da1] mx-auto opacity-50" />
            <h3 className="text-sm font-bold text-[#e6e1e7]">No se encontraron preguntas coincidentes</h3>
            <p className="text-xs text-[#958da1] max-w-md mx-auto">
              Intenta utilizar otras palabras clave como "premios", "PIN", "colores", "base de datos" o selecciona otra categoría.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setRoleFilter("all");
              }}
              className="py-2 px-4 rounded-xl bg-[#201f23] hover:bg-[#2b292e] text-[var(--gold)] border border-[var(--gold)]/40 text-xs font-bold transition-all cursor-pointer"
            >
              Limpiar Filtros
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedIds.has(faq.id);
            return (
              <div
                key={faq.id}
                className="bg-[#1c1b1f] border border-[#363439] hover:border-[var(--gold)]/40 rounded-2xl overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#201f23] text-[#ccc3d8] border border-[#363439]">
                        {faq.category}
                      </span>
                      {faq.targetRole === "dev" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-950/60 text-blue-300 border border-blue-500/40">
                          Técnico / Dev
                        </span>
                      )}
                      {faq.targetRole === "admin" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-950/60 text-amber-300 border border-amber-500/40">
                          Administrador
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-[#e6e1e7] font-['Epilogue']">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-[#201f23] flex items-center justify-center text-[#ccc3d8] shrink-0 mt-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 border-t border-[#2b292e] space-y-3.5 text-xs text-[#ccc3d8] leading-relaxed animate-fadeIn">
                    <div className="space-y-2">
                      {faq.answer.map((paragraph, idx) => (
                        <p key={idx} className="flex items-start gap-2">
                          <span className="text-[var(--gold)] mt-1 shrink-0">•</span>
                          <span>{paragraph}</span>
                        </p>
                      ))}
                    </div>

                    {faq.codeSnippet && (
                      <div className="bg-[#0f0e12] border border-[#363439] rounded-xl p-3 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                        <pre>{faq.codeSnippet}</pre>
                      </div>
                    )}

                    {faq.relatedRoute && (
                      <div className="pt-2 flex items-center gap-2">
                        <Link
                          to={faq.relatedRoute}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--gold)] hover:underline"
                        >
                          <span>{faq.relatedRouteLabel || "Ver pantalla relacionada"}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  )}

      {/* 4. FOOTER INFORMATIVO PARA SOPORTE */}
      <div className="bg-gradient-to-r from-[#1c1b1f] via-[#201f23] to-[#1c1b1f] border border-[#363439] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#e6e1e7]">¿Necesitas asistencia técnica o soporte personalizado?</h4>
            <p className="text-[11px] text-[#958da1]">
              Puedes revisar los registros de actividad en vivo o verificar el estado de los módulos en el panel principal.
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="py-2.5 px-5 rounded-xl bg-[var(--gold)] text-[#121115] font-bold text-xs hover:brightness-105 transition-all shadow-xs shrink-0 cursor-pointer"
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
