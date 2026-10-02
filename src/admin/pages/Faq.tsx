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

export function Faq() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "dev">("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["faq-1", "faq-2"]));

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
      {/* 1. ENCABEZADO Y PRESENTACIÓN */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#363439] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#f2be71]/15 text-[#f2be71] border border-[#f2be71]/30 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              BASE DE CONOCIMIENTO & FAQ
            </span>
            <span className="text-xs text-[#958da1]">Documentación Integral del Sistema</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#e6e1e7] font-['Epilogue'] tracking-tight">
            Preguntas Frecuentes & Guía de Uso
          </h1>
          <p className="text-xs sm:text-sm text-[#ccc3d8] mt-1 max-w-2xl">
            Encuentra respuestas claras y detalladas sobre el funcionamiento de cada módulo, configuración visual, bases de datos, seguridad y mejores prácticas operativas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="py-2 px-3.5 rounded-xl bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] hover:text-white border border-[#363439] text-xs font-bold transition-all cursor-pointer"
          >
            Expandir Todas
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="py-2 px-3.5 rounded-xl bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] hover:text-white border border-[#363439] text-xs font-bold transition-all cursor-pointer"
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
              className="w-full bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl pl-10 pr-4 py-2.5 text-xs placeholder:text-[#958da1]"
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
                roleFilter === "all" ? "bg-[#f2be71] text-[#121115]" : "text-[#ccc3d8] hover:text-white"
              }`}
            >
              Todos los Roles
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("admin")}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                roleFilter === "admin" ? "bg-[#f2be71] text-[#121115]" : "text-[#ccc3d8] hover:text-white"
              }`}
            >
              Administrador
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("dev")}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                roleFilter === "dev" ? "bg-[#f2be71] text-[#121115]" : "text-[#ccc3d8] hover:text-white"
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
                  ? "bg-[#2b292e] text-[#f2be71] border-[#f2be71] font-bold shadow-xs"
                  : "bg-[#201f23] text-[#ccc3d8] border-[#363439] hover:border-[#f2be71]/40 hover:text-white"
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
              className="py-2 px-4 rounded-xl bg-[#201f23] hover:bg-[#2b292e] text-[#f2be71] border border-[#f2be71]/40 text-xs font-bold transition-all cursor-pointer"
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
                className="bg-[#1c1b1f] border border-[#363439] hover:border-[#f2be71]/40 rounded-2xl overflow-hidden transition-all shadow-xs"
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
                          <span className="text-[#f2be71] mt-1 shrink-0">•</span>
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
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f2be71] hover:underline"
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

      {/* 4. FOOTER INFORMATIVO PARA SOPORTE */}
      <div className="bg-gradient-to-r from-[#1c1b1f] via-[#201f23] to-[#1c1b1f] border border-[#363439] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f2be71]/15 text-[#f2be71] border border-[#f2be71]/30 flex items-center justify-center shrink-0">
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
          className="py-2.5 px-5 rounded-xl bg-[#f2be71] text-[#121115] font-bold text-xs hover:brightness-105 transition-all shadow-xs shrink-0 cursor-pointer"
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
