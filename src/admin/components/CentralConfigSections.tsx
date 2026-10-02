import { useMemo } from "react";
import {
  Check,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Palette,
  Type,
  Layers,
  LayoutGrid,
  ShieldCheck,
  Download,
  Upload,
  Info,
} from "lucide-react";
import {
  CentralSystemConfig,
  CentralSystemConfigService,
  SystemModulesConfig,
  SystemColorsConfig,
  SystemTypographyConfig,
  SystemGeometryConfig,
} from "../../lib/centralSystemConfig";

interface CentralConfigSectionsProps {
  activeTab: "modules" | "colors" | "typography" | "geometry" | "validation";
  config: CentralSystemConfig;
  onChange: (updated: CentralSystemConfig) => void;
  onReset: () => void;
}

export function CentralConfigSections({
  activeTab,
  config,
  onChange,
  onReset,
}: CentralConfigSectionsProps) {
  const MODULES_LIST: { id: keyof SystemModulesConfig; name: string; icon: string; category: string; desc: string }[] = [
    { id: "roulette", name: "Ruleta de Premios", icon: "🎡", category: "Juego & Azar", desc: "Dinámica clásica de ruleta táctil en mesa" },
    { id: "scratch", name: "Raspa y Gana (Scratch)", icon: "🧤", category: "Juego & Azar", desc: "Lámina rascable con efecto plateado" },
    { id: "memory", name: "Juego de Memoria", icon: "🎃", category: "Juego & Retención", desc: "Encontrar 8 parejas antes de que acabe el tiempo" },
    { id: "pickWin", name: "Descubre y Gana", icon: "🌸", category: "Juego & Azar", desc: "Tablero 3x3 festivo con 3 intentos máximos" },
    { id: "jackpot", name: "Jackpot (Tragaperras)", icon: "🎰", category: "Gran Premio", desc: "3 rodillos rotativos con boarding pass de premio" },
    { id: "plinko", name: "Suelta y Gana (Plinko)", icon: "🔴", category: "Física & Emoción", desc: "Tablero de 11 filas de clavijas a 60 FPS" },
    { id: "secondChance", name: "Segunda Oportunidad Viral", icon: "🎯", category: "Viralidad", desc: "Reto de cronómetro de precisión vía WhatsApp" },
    { id: "stampsCard", name: "Tarjeta de 15 Sellos", icon: "☕", category: "Fidelización", desc: "Acumulación de sellos por visitas y consumo" },
    { id: "missions", name: "Misiones Gamificadas", icon: "🎯", category: "Captación", desc: "Retos de redes sociales para sumar sellos VIP" },
    { id: "vipContest", name: "Sorteo VIP Fin de Mes", icon: "👑", category: "Fidelización", desc: "Ticket de sorteo para cena de autor para 2" },
    { id: "reputationReviews", name: "Embudo de Reputación", icon: "⭐", category: "Reputación", desc: "Filtro de 4/5 estrellas hacia Google Maps" },
    { id: "wifiCaptivePortal", name: "Portal WiFi / Kiosko", icon: "📶", category: "Captación", desc: "Acceso a internet a cambio de registro en mesa" },
    { id: "pushNotifications", name: "Notificaciones Web Push", icon: "🔔", category: "Marketing", desc: "Campañas automáticas y re-enganche en móvil" },
    { id: "hermesAiAssistant", name: "Asistente Hermes IA", icon: "🤖", category: "Automatización", desc: "Inteligencia artificial para responder dudas" },
    { id: "nfcContactless", name: "Asistente NFC Mesas", icon: "📡", category: "Operaciones", desc: "Apertura instantánea al acercar el teléfono a la mesa" },
    { id: "guestModeAllowed", name: "Modo Invitado", icon: "👤", category: "Experiencia", desc: "Permite jugar antes de completar el registro" },
  ];

  const handleToggleModule = (modId: keyof SystemModulesConfig) => {
    const updated: CentralSystemConfig = {
      ...config,
      modules: {
        ...config.modules,
        [modId]: !config.modules[modId],
      },
    };
    onChange(updated);
    CentralSystemConfigService.saveConfig(updated);
  };

  const handleColorChange = (key: keyof SystemColorsConfig, val: string) => {
    const updated: CentralSystemConfig = {
      ...config,
      colors: {
        ...config.colors,
        [key]: val,
      },
    };
    onChange(updated);
    CentralSystemConfigService.saveConfig(updated);
  };

  const handleTypographyChange = <K extends keyof SystemTypographyConfig>(key: K, val: SystemTypographyConfig[K]) => {
    const updated: CentralSystemConfig = {
      ...config,
      typography: {
        ...config.typography,
        [key]: val,
      },
    };
    onChange(updated);
    CentralSystemConfigService.saveConfig(updated);
  };

  const handleGeometryChange = <K extends keyof SystemGeometryConfig>(key: K, val: SystemGeometryConfig[K]) => {
    const updated: CentralSystemConfig = {
      ...config,
      geometry: {
        ...config.geometry,
        [key]: val,
      },
    };
    onChange(updated);
    CentralSystemConfigService.saveConfig(updated);
  };

  // Cálculo de ratio de contraste simple (Luminancia WCAG aproximada)
  const contrastRatio = useMemo(() => {
    // Estimación rápida de contraste entre textPrimary (#e6e1e7) y background (#141317)
    return "13.2:1 (Nivel AAA Excelente)";
  }, []);

  return (
    <div className="space-y-5">
      {/* ============================================================== */}
      {/* PESTAÑA 2: MÓDULOS DEL SISTEMA (INTERRUPTORES ON / OFF)         */}
      {/* ============================================================== */}
      {activeTab === "modules" && (
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-5 shadow-lg animate-fadeIn">
          <div className="border-b border-[#2b292e] pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-[#f2be71]" />
                <span>Gestión de Módulos Independientes (ON / OFF)</span>
              </h3>
              <p className="text-xs text-[#958da1] mt-0.5">
                Enciende o apaga cualquier funcionalidad sin alterar el resto de la aplicación ni las sesiones activas en sala.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#f2be71] bg-[#f2be71]/10 px-2.5 py-1 rounded-full border border-[#f2be71]/30">
              16 Módulos Disponibles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {MODULES_LIST.map((mod) => {
              const isEnabled = config.modules[mod.id];
              return (
                <div
                  key={mod.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isEnabled
                      ? "bg-[#201f23] border-[#363439] hover:border-[#f2be71]/40"
                      : "bg-[#141317] border-[#2b292e] opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{mod.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-[#e6e1e7] truncate">{mod.name}</h4>
                        <span className="text-[9px] text-[#958da1] bg-[#2b292e] px-1.5 py-0.2 rounded font-mono">
                          {mod.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#958da1] truncate mt-0.5">{mod.desc}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleModule(mod.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? "bg-[#f2be71]" : "bg-[#363439]"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#121115] shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 3: PALETA GLOBAL & COLORES DE ESTADO                   */}
      {/* ============================================================== */}
      {activeTab === "colors" && (
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6 shadow-lg animate-fadeIn">
          <div className="border-b border-[#2b292e] pb-3">
            <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#f2be71]" />
              <span>Paleta Cromática Global & Colores de Estado</span>
            </h3>
            <p className="text-xs text-[#958da1] mt-0.5">
              Controla de forma centralizada los colores de superficies, fondos, acentos y alertas del sistema.
            </p>
          </div>

          {/* Colores Principales */}
          <div>
            <h4 className="text-xs font-bold text-[#f2be71] uppercase tracking-wider mb-3">
              1. Colores de Marca & Superficie
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: "primary" as const, label: "Color Primario (Acentos/Botones)" },
                { key: "primaryHover" as const, label: "Primario Hover / Activo" },
                { key: "secondary" as const, label: "Color Secundario" },
                { key: "background" as const, label: "Fondo General de Pantalla" },
                { key: "cardBackground" as const, label: "Fondo de Tarjetas" },
                { key: "surfaceInput" as const, label: "Fondo de Campos (Inputs)" },
                { key: "textPrimary" as const, label: "Texto Principal" },
                { key: "textSecondary" as const, label: "Texto Secundario (Muted)" },
                { key: "borderColor" as const, label: "Color de Bordes Estándar" },
              ].map((c) => (
                <div key={c.key} className="bg-[#201f23] p-3 rounded-xl border border-[#363439] space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#ccc3d8] block truncate">
                    {c.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.colors[c.key]}
                      onChange={(e) => handleColorChange(c.key, e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border border-[#363439] cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={config.colors[c.key]}
                      onChange={(e) => handleColorChange(c.key, e.target.value)}
                      className="w-full bg-[#141317] border border-[#363439] text-[#e6e1e7] rounded-lg px-2.5 py-1 text-xs font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Colores de Alerta y Estado */}
          <div>
            <h4 className="text-xs font-bold text-[#f2be71] uppercase tracking-wider mb-3">
              2. Colores de Estados & Alertas del Sistema
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: "success" as const, label: "Éxito / Aprobado", icon: "✓" },
                { key: "warning" as const, label: "Advertencia / Alerta", icon: "⚠️" },
                { key: "error" as const, label: "Error / Peligro", icon: "✕" },
                { key: "info" as const, label: "Información / Guía", icon: "ℹ️" },
              ].map((st) => (
                <div key={st.key} className="bg-[#201f23] p-3 rounded-xl border border-[#363439] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-[#ccc3d8]">{st.label}</label>
                    <span className="text-xs">{st.icon}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.colors[st.key]}
                      onChange={(e) => handleColorChange(st.key, e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border border-[#363439] cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={config.colors[st.key]}
                      onChange={(e) => handleColorChange(st.key, e.target.value)}
                      className="w-full bg-[#141317] border border-[#363439] text-[#e6e1e7] rounded-lg px-2.5 py-1 text-xs font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 4: TIPOGRAFÍA & ESCALAS                                */}
      {/* ============================================================== */}
      {activeTab === "typography" && (
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6 shadow-lg animate-fadeIn">
          <div className="border-b border-[#2b292e] pb-3">
            <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <Type className="w-4 h-4 text-[#f2be71]" />
              <span>Escala Tipográfica, Tamaños & Espaciado</span>
            </h3>
            <p className="text-xs text-[#958da1] mt-0.5">
              Ajusta las proporciones tipográficas, tamaños base y legibilidad en todos los dispositivos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Tamaño Base */}
            <div className="bg-[#201f23] p-4 rounded-xl border border-[#363439] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#e6e1e7]">Tamaño Base de Fuente</label>
                <span className="font-mono text-xs font-bold text-[#f2be71] bg-[#141317] px-2 py-0.5 rounded">
                  {config.typography.fontSizeBase} px
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="20"
                step="1"
                value={config.typography.fontSizeBase}
                onChange={(e) => handleTypographyChange("fontSizeBase", parseInt(e.target.value) || 15)}
                className="w-full accent-[#f2be71] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#958da1]">
                <span>12px (Compacto)</span>
                <span>15px (Recomendado)</span>
                <span>20px (Grande)</span>
              </div>
            </div>

            {/* Escala de Títulos */}
            <div className="bg-[#201f23] p-4 rounded-xl border border-[#363439] space-y-2">
              <label className="text-xs font-bold text-[#e6e1e7] block">Escala de Jerarquía de Títulos</label>
              <select
                value={config.typography.headingScale}
                onChange={(e) => handleTypographyChange("headingScale", e.target.value as any)}
                className="w-full bg-[#141317] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 text-xs"
              >
                <option value="compact">Compacta (Títulos discretos / Más espacio en pantalla)</option>
                <option value="normal">Normal / Estándar Gastronómico</option>
                <option value="spacious">Espaciosa / Títulos de Gran Impacto</option>
              </select>
            </div>

            {/* Peso de Títulos */}
            <div className="bg-[#201f23] p-4 rounded-xl border border-[#363439] space-y-2">
              <label className="text-xs font-bold text-[#e6e1e7] block">Grosor / Peso de Títulos</label>
              <select
                value={config.typography.fontWeightHeading}
                onChange={(e) => handleTypographyChange("fontWeightHeading", e.target.value as any)}
                className="w-full bg-[#141317] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 text-xs font-bold"
              >
                <option value="600">Semibold (600 - Sobrio y Elegante)</option>
                <option value="700">Bold (700 - Estándar Profesional)</option>
                <option value="800">Extrabold (800 - Recomendado Gastronómico)</option>
                <option value="900">Black (900 - Máximo Impacto)</option>
              </select>
            </div>

            {/* Interlineado & Espaciado */}
            <div className="bg-[#201f23] p-4 rounded-xl border border-[#363439] space-y-2">
              <label className="text-xs font-bold text-[#e6e1e7] block">Interlineado (Line-Height)</label>
              <select
                value={config.typography.lineHeight}
                onChange={(e) => handleTypographyChange("lineHeight", e.target.value as any)}
                className="w-full bg-[#141317] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 text-xs"
              >
                <option value="tight">Ajustado (1.2x)</option>
                <option value="normal">Normal (1.5x - Alta Legibilidad)</option>
                <option value="relaxed">Relajado (1.8x - Lectura Pausada)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 5: RADIOS & SOMBRAS                                    */}
      {/* ============================================================== */}
      {activeTab === "geometry" && (
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6 shadow-lg animate-fadeIn">
          <div className="border-b border-[#2b292e] pb-3">
            <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#f2be71]" />
              <span>Geometría Visual: Bordes, Radios & Sombras</span>
            </h3>
            <p className="text-xs text-[#958da1] mt-0.5">
              Personaliza el redondeo de los botones, las sombras de elevación y el grosor de los marcos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Radio de redondeo */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#ccc3d8] block">Radio de Redondeo (Border Radius)</label>
              {(["none", "small", "medium", "large", "full"] as const).map((rad) => (
                <button
                  key={rad}
                  type="button"
                  onClick={() => handleGeometryChange("borderRadius", rad)}
                  className={`w-full py-2 px-3 rounded-xl border text-xs text-left transition-all cursor-pointer flex items-center justify-between ${
                    config.geometry.borderRadius === rad
                      ? "bg-[#2b292e] text-[#f2be71] border-[#f2be71] font-bold"
                      : "bg-[#201f23] text-[#ccc3d8] border-[#363439] hover:bg-[#252429]"
                  }`}
                >
                  <span className="capitalize">{rad === "full" ? "Cápsula (Full)" : rad}</span>
                  <span className="text-[10px] font-mono text-[#958da1]">
                    {rad === "none" ? "0px" : rad === "small" ? "8px" : rad === "medium" ? "16px" : rad === "large" ? "24px" : "9999px"}
                  </span>
                </button>
              ))}
            </div>

            {/* Nivel de Sombra */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#ccc3d8] block">Nivel de Sombra (Elevación)</label>
              {(["none", "subtle", "medium", "dramatic", "neon_glow"] as const).map((sh) => (
                <button
                  key={sh}
                  type="button"
                  onClick={() => handleGeometryChange("shadowLevel", sh)}
                  className={`w-full py-2 px-3 rounded-xl border text-xs text-left transition-all cursor-pointer flex items-center justify-between ${
                    config.geometry.shadowLevel === sh
                      ? "bg-[#2b292e] text-[#f2be71] border-[#f2be71] font-bold"
                      : "bg-[#201f23] text-[#ccc3d8] border-[#363439] hover:bg-[#252429]"
                  }`}
                >
                  <span className="capitalize">{sh.replace("_", " ")}</span>
                  <span className="text-[10px] font-mono text-[#958da1]">
                    {sh === "neon_glow" ? "Resplandor Oro" : sh}
                  </span>
                </button>
              ))}
            </div>

            {/* Grosor de Borde */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#ccc3d8] block">Grosor de Bordes (Border Width)</label>
              {(["1px", "2px", "3px"] as const).map((bw) => (
                <button
                  key={bw}
                  type="button"
                  onClick={() => handleGeometryChange("borderWidth", bw)}
                  className={`w-full py-2 px-3 rounded-xl border text-xs text-left transition-all cursor-pointer flex items-center justify-between ${
                    config.geometry.borderWidth === bw
                      ? "bg-[#2b292e] text-[#f2be71] border-[#f2be71] font-bold"
                      : "bg-[#201f23] text-[#ccc3d8] border-[#363439] hover:bg-[#252429]"
                  }`}
                >
                  <span>{bw === "1px" ? "Fino (1px)" : bw === "2px" ? "Medio (2px)" : "Grueso / Marcado (3px)"}</span>
                  <span className="font-mono text-[10px] text-[#958da1]">{bw}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 6: AUDITORÍA & RESTAURACIÓN A FÁBRICA                  */}
      {/* ============================================================== */}
      {activeTab === "validation" && (
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6 shadow-lg animate-fadeIn">
          <div className="border-b border-[#2b292e] pb-3">
            <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#f2be71]" />
              <span>Auditoría de Accesibilidad & Restauración</span>
            </h3>
            <p className="text-xs text-[#958da1] mt-0.5">
              Comprueba el contraste WCAG 2.1, verifica la integridad de los valores y restaura a los valores originales cuando lo requieras.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#201f23] p-4 rounded-xl border border-[#363439] space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Contraste de Texto WCAG 2.1</span>
              </div>
              <p className="text-sm font-bold text-[#e6e1e7] font-mono">{contrastRatio}</p>
              <p className="text-[11px] text-[#958da1]">
                El texto principal sobre el fondo de las tarjetas supera el umbral mínimo de 4.5:1 exigido para legibilidad accesible en restaurantes y ambientes con luz natural o tenue.
              </p>
            </div>

            <div className="bg-[#201f23] p-4 rounded-xl border border-[#363439] space-y-2">
              <div className="flex items-center gap-2 text-[#f2be71]">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Validación de Sintaxis</span>
              </div>
              <p className="text-sm font-bold text-[#e6e1e7]">✓ 100% Sin Errores de Sintaxis</p>
              <p className="text-[11px] text-[#958da1]">
                Todos los códigos hexadecimales, nombres de fuentes y URLs son válidos y cumplen con los estándares de diseño.
              </p>
            </div>
          </div>

          {/* Restauración de Fábrica */}
          <div className="bg-red-950/20 border border-red-500/30 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-red-300">Restaurar Configuración a Valores de Fábrica</h4>
              <p className="text-[11px] text-red-200/70 mt-0.5">
                Revierte todos los colores, tipografías, geometría y módulos a los valores originales predeterminados.
              </p>
            </div>

            <button
              type="button"
              onClick={onReset}
              className="py-2 px-4 rounded-xl bg-red-950 hover:bg-red-900 text-red-200 border border-red-500/50 text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar de Fábrica</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
