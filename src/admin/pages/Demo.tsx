import { useState, useRef, useEffect } from "react";
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  ExternalLink,
  QrCode,
  Sparkles,
  Copy,
  Check,
  Wifi,
  Gift,
  Trophy,
  Star,
  Timer,
  Users,
  Play,
  Layers,
  Info,
  Maximize2,
  Target,
} from "lucide-react";

export function Demo() {
  // Configuración de visualización del simulador
  const [deviceMode, setDeviceMode] = useState<"mobile" | "tablet" | "fullscreen">("mobile");
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [selectedTable, setSelectedTable] = useState<string>("1");
  const [selectedGame, setSelectedGame] = useState<"ruleta" | "precision">("ruleta");
  const [customHost, setCustomHost] = useState<string>(
    typeof window !== "undefined" ? window.location.hostname : "localhost"
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [keyReset, setKeyReset] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Construir la URL del frontend para el iframe
  const buildFrontendUrl = (step = selectedStep, table = selectedTable, game = selectedGame) => {
    const port = typeof window !== "undefined" && window.location.port ? `:${window.location.port}` : "";
    const protocol = typeof window !== "undefined" ? window.location.protocol : "http:";
    const host = typeof window !== "undefined" ? window.location.hostname : "localhost";

    const params = new URLSearchParams();
    params.set("demo", "true");
    if (table.startsWith("caja")) {
      params.set("modo", "caja");
    } else if (table.startsWith("domicilio")) {
      params.set("modo", "domicilio");
    } else {
      params.set("mesa", table);
    }

    if (step > 1) {
      params.set("paso", step.toString());
    }

    if (game === "precision") {
      params.set("juego", "precision");
    }

    return `${protocol}//${host}${port}/?${params.toString()}`;
  };

  const currentUrl = buildFrontendUrl();

  // URL para el código QR (permite usar IP local de red para escanear desde celular real)
  const qrTargetUrl = (() => {
    const port = typeof window !== "undefined" && window.location.port ? `:${window.location.port}` : ":5173";
    const protocol = typeof window !== "undefined" ? window.location.protocol : "http:";
    return `${protocol}//${customHost}${port}/?mesa=${selectedTable}&demo=true`;
  })();

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    qrTargetUrl
  )}&color=f2be71&bgcolor=1c1b1f&margin=10`;

  // Reiniciar la simulación en el iframe
  const handleReset = () => {
    setSelectedStep(1);
    setKeyReset((prev) => prev + 1);
  };

  // Copiar link al portapapeles
  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Abrir en pestaña nueva
  const handleOpenExternal = () => {
    window.open(currentUrl, "_blank", "noopener,noreferrer");
  };

  // Pasos disponibles en el recorrido interactivo
  const stepsList = [
    { num: 1, name: "Bienvenida & Mesa", icon: Users, desc: "Identificación del comensal y mesa asignada" },
    { num: 2, name: "Validación de Redes", icon: Sparkles, desc: "Seguimiento en Instagram o prueba sin redes" },
    { num: 3, name: "Minijuego en Vivo", icon: Trophy, desc: "Giro de la Ruleta o Reto del Cronómetro" },
    { num: 4, name: "Voucher & Canje PIN", icon: Gift, desc: "Premio ganado, voucher con QR y validación de caja" },
    { num: 5, name: "Embudo Calificación", icon: Star, desc: "1-3★ WhatsApp privado gerencia vs 4-5★ Google Maps" },
    { num: 6, name: "Segunda Oportunidad", icon: Timer, desc: "Reto del cronómetro de precisión (10.00s)" },
    { num: 7, name: "Sellos VIP & Sorteo", icon: Award, desc: "Progreso de visitas, sellos acumulados y boleto" },
    { num: 8, name: "Misiones & Embajador", icon: Target, desc: "Desafíos sociales, TripAdvisor, TikTok y comunidad" },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue'] flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-[#f2be71]" />
            <span>Módulo de Demostración & Simulador Frontend</span>
          </h2>
          <p className="text-sm text-[#ccc3d8]">
            Prueba e interactúa en vivo con la experiencia completa del cliente tal como se verá en sus teléfonos móviles.
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="bg-[#201f23] border border-[#363439] hover:bg-[#2b292e] text-[#ccc3d8] text-xs font-bold rounded-xl px-3.5 py-2.5 flex items-center gap-2 cursor-pointer transition-colors"
            title="Reiniciar simulador"
          >
            <RotateCcw className="w-4 h-4 text-[#f2be71]" />
            <span>Reiniciar Demo</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="bg-[#201f23] border border-[#363439] hover:bg-[#2b292e] text-[#ccc3d8] text-xs font-bold rounded-xl px-3.5 py-2.5 flex items-center gap-2 cursor-pointer transition-colors"
            title="Copiar enlace directo"
          >
            {copiedLink ? <Check className="w-4 h-4 text-[#10b981]" /> : <Copy className="w-4 h-4 text-[#f2be71]" />}
            <span>{copiedLink ? "Copiado" : "Copiar Enlace"}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenExternal}
            className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-4 py-2.5 text-xs hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2"
          >
            <span>Abrir en Pestaña Nueva</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Barra de Control de Fases / Pasos Rápidos */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold text-[#f2be71] flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span>Saltar Directamente a una Fase del Frontend:</span>
          </span>
          <span className="text-xs text-[#958da1]">Haz clic en cualquier fase para probarla al instante</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {stepsList.map((step) => {
            const Icon = step.icon;
            const isSelected = selectedStep === step.num;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setSelectedStep(step.num)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? "bg-[#2b292e] border-[#f2be71] text-[#f2be71] shadow-[0_0_12px_rgba(242,190,113,0.25)]"
                    : "bg-[#201f23] border-[#363439] text-[#ccc3d8] hover:border-[#4a4455] hover:bg-[#252429]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase opacity-80">Paso {step.num}</span>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold leading-tight line-clamp-1">{step.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ÁREA PRINCIPAL: SIMULADOR INTERACTIVO + HERRAMIENTAS LATERALES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA 1 (CENTRAL): DISPOSITIVO MÓVIL SIMULADO */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Controles del Dispositivo */}
          <div className="w-full flex items-center justify-between bg-[#1c1b1f] border border-[#363439] rounded-2xl px-4 py-2.5 mb-4">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDeviceMode("mobile")}
                className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  deviceMode === "mobile"
                    ? "bg-[#f2be71] text-[#121115]"
                    : "text-[#ccc3d8] hover:text-[#e6e1e7] hover:bg-[#201f23]"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Móvil (390px)</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceMode("tablet")}
                className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  deviceMode === "tablet"
                    ? "bg-[#f2be71] text-[#121115]"
                    : "text-[#ccc3d8] hover:text-[#e6e1e7] hover:bg-[#201f23]"
                }`}
              >
                <Tablet className="w-4 h-4" />
                <span>Tablet (600px)</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceMode("fullscreen")}
                className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  deviceMode === "fullscreen"
                    ? "bg-[#f2be71] text-[#121115]"
                    : "text-[#ccc3d8] hover:text-[#e6e1e7] hover:bg-[#201f23]"
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Expandido</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#958da1]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span>Simulación Activa</span>
            </div>
          </div>

          {/* Marco del Dispositivo (Mockup tipo Smartphone) */}
          <div
            className={`transition-all duration-300 relative rounded-[44px] p-3.5 bg-gradient-to-b from-[#2b292e] via-[#1c1b1f] to-[#121115] shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-4 border-[#363439] flex flex-col items-center ${
              deviceMode === "mobile"
                ? "w-[390px] max-w-full"
                : deviceMode === "tablet"
                ? "w-[600px] max-w-full"
                : "w-full"
            }`}
          >
            {/* Altavoz & Dynamic Island */}
            <div className="w-28 h-5 bg-[#0f0e12] rounded-full mb-2.5 flex items-center justify-center gap-2 border border-[#2b292e]/60 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1c1b1f] border border-[#363439]" />
              <div className="w-8 h-1 rounded-full bg-[#201f23]" />
            </div>

            {/* Pantalla Interactiva (iframe) */}
            <div className="w-full bg-[#141317] rounded-[32px] overflow-hidden border border-[#2b292e] relative shadow-inner">
              <iframe
                key={`${selectedStep}-${selectedTable}-${selectedGame}-${keyReset}`}
                ref={iframeRef}
                src={buildFrontendUrl()}
                title="Frontend Demo"
                className="w-full h-[720px] border-0"
              />
            </div>

            {/* Barra de inicio inferior (Home Indicator) */}
            <div className="w-32 h-1 bg-[#4a4455] rounded-full mt-3 opacity-60" />
          </div>
        </div>

        {/* COLUMNA 2 (LATERAL): PANEL DE CONTROL & PRUEBA EN CELULAR FÍSICO */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tarjeta 1: Parámetros del Entorno */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#363439] pb-3">
              <Play className="w-4 h-4 text-[#f2be71]" />
              <span>Configuración del Entorno de Prueba</span>
            </h3>

            {/* Selección de Mesa */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                Mesa / Ubicación Simulada
              </label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs focus:border-[#f2be71] focus:outline-none"
              >
                <option value="1">Mesa 1 (QR Sala Principal)</option>
                <option value="2">Mesa 2 (QR Sala Principal)</option>
                <option value="5">Mesa 5 (Zona Terraza Jardín)</option>
                <option value="8">Mesa 8 (Zona VIP Rooftop)</option>
                <option value="10">Mesa 10 (QR Barra)</option>
                <option value="caja">Punto de Pago / Caja (Modo Kiosko)</option>
                <option value="domicilio">🛵 Pedido a Domicilio / Takeout</option>
              </select>
            </div>

            {/* Mecánica de Juego a Testear */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                Mecánica de Minijuego Activa
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedGame("ruleta")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedGame === "ruleta"
                      ? "bg-[#2b292e] border-[#f2be71] text-[#f2be71]"
                      : "bg-[#201f23] border-[#363439] text-[#ccc3d8]"
                  }`}
                >
                  🎡 Ruleta Gastronómica
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGame("precision")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedGame === "precision"
                      ? "bg-[#2b292e] border-[#f2be71] text-[#f2be71]"
                      : "bg-[#201f23] border-[#363439] text-[#ccc3d8]"
                  }`}
                >
                  ⏱️ Reto de Precisión 10.00s
                </button>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Escanear con tu Teléfono Móvil Real */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#363439] pb-3">
              <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#f2be71]" />
                <span>Pruébalo en tu Teléfono Móvil Real</span>
              </h3>
              <span className="text-[10px] bg-[#10b981]/20 text-[#10b981] font-bold px-2 py-0.5 rounded-full border border-[#10b981]/30">
                En Vivo
              </span>
            </div>

            <p className="text-xs text-[#ccc3d8] leading-relaxed">
              Abre la cámara de tu celular y apunta al código QR para experimentar la ruleta, sellos y sonidos hápticos en tu propio teléfono.
            </p>

            {/* Código QR Generado */}
            <div className="flex flex-col items-center justify-center p-3 bg-[#141317] border border-[#363439] rounded-2xl">
              <img
                src={qrImageUrl}
                alt="Código QR de Prueba"
                className="w-48 h-48 rounded-xl object-contain shadow-md"
              />
              <span className="text-[11px] text-[#f2be71] font-mono mt-2 font-bold break-all text-center">
                Mesa: {selectedTable} • {selectedGame === "ruleta" ? "Ruleta" : "Cronómetro"}
              </span>
            </div>

            {/* Input de Host / IP para red Wi-Fi local */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-[#958da1] uppercase block">
                IP Local o Dominio para escanear en red Wi-Fi:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customHost}
                  onChange={(e) => setCustomHost(e.target.value)}
                  placeholder="ej: 192.168.1.50 o tudominio.com"
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] font-mono text-xs rounded-xl px-3 py-2 w-full focus:border-[#f2be71] focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-[#958da1]">
                Si tu celular está conectado al mismo Wi-Fi que este computador, coloca la IP local (ej: 192.168.1.X).
              </span>
            </div>
          </div>

          {/* Tarjeta 3: Consejos para Demostraciones a Clientes o Inversores */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-[#e6e1e7] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#60a5fa]" />
              <span>Guía para Demostraciones Exitosas</span>
            </h4>
            <ul className="text-xs text-[#ccc3d8] space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#f2be71] font-bold">•</span>
                <span>
                  <strong>Giro de Ruleta:</strong> En el Paso 3 puedes tocar directamente en *"Girar Ruleta"* dentro de la pantalla para simular la victoria.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#f2be71] font-bold">•</span>
                <span>
                  <strong>Quema de Cupón:</strong> En el Paso 4 puedes usar el PIN de cajero por defecto (<code>4321</code> o el configurado en Seguridad) para probar la validación en mesa.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#f2be71] font-bold">•</span>
                <span>
                  <strong>Desvío de Calificación:</strong> En el Paso 5, prueba poner 1 a 3 estrellas para ver cómo se desvía a WhatsApp confidencial de gerencia.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#f2be71] font-bold">•</span>
                <span>
                  <strong>Misiones & Embajador (Paso 8):</strong> Prueba las tareas sociales (TripAdvisor, TikTok) y el reto viral de invitar 3 amigos con enlace y código VIP de WhatsApp.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
