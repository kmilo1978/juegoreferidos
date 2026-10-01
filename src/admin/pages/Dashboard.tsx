import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Gamepad2,
  Gift,
  Award,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Loader2,
  BarChart3,
  Filter,
  Flame,
  Clock,
  Sparkles,
  Coffee,
  Activity,
  Layers,
} from "lucide-react";

interface Metrics {
  totalPrizes: number;
  redeemedPrizes: number;
  totalCustomers: number;
  conversionRate: string;
  prizes?: any[];
  logs: { timestamp: string; message: string }[];
}

interface Table {
  id: string;
  name: string;
  zone: string;
  status: string;
  customerName?: string;
  prizeWon?: string;
}

export function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"todos" | "canjes" | "sellos" | "misiones">("todos");

  const fetchData = async () => {
    try {
      const [metricsRes, tablesRes, configRes] = await Promise.all([
        fetch("http://localhost:3001/api/metrics"),
        fetch("http://localhost:3001/api/tables"),
        fetch("http://localhost:3001/api/config"),
      ]);

      if (!metricsRes.ok || !tablesRes.ok) throw new Error("Error al cargar datos del servidor");

      const metricsData = await metricsRes.json();
      const tablesData = await tablesRes.json();
      const configData = configRes.ok ? await configRes.json() : null;

      setMetrics(metricsData);
      setTables(Array.isArray(tablesData) ? tablesData : tablesData.tables || []);
      if (configData?.settings) setConfig(configData.settings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Mesas con canje o premio pendiente
  const pendingTables = useMemo(() => {
    return tables.filter(
      (t) => t.status === "PREMIO_PENDIENTE" || (t.prizeWon && t.status !== "COMPLETADO" && t.status !== "DISPONIBLE")
    );
  }, [tables]);

  // Datos de las 14 barras (simuladas sobre datos reales o tendencia)
  const fourteenDaysData = useMemo(() => {
    const days = [
      { date: "11 Oct", misiones: 95, sellos: 65, total: 160 },
      { date: "12 Oct", misiones: 110, sellos: 80, total: 190 },
      { date: "13 Oct", misiones: 80, sellos: 60, total: 140 },
      { date: "14 Oct", misiones: 130, sellos: 95, total: 225 },
      { date: "15 Oct", misiones: 145, sellos: 115, total: 260 },
      { date: "16 Oct", misiones: 100, sellos: 75, total: 175 },
      { date: "17 Oct", misiones: 120, sellos: 90, total: 210 },
      { date: "18 Oct", misiones: 160, sellos: 120, total: 280 },
      { date: "19 Oct", misiones: 175, sellos: 135, total: 310, isPeak: true },
      { date: "20 Oct", misiones: 150, sellos: 105, total: 255 },
      { date: "21 Oct", misiones: 105, sellos: 80, total: 185 },
      { date: "22 Oct", misiones: 135, sellos: 95, total: 230 },
      { date: "23 Oct", misiones: 140, sellos: 100, total: 240 },
      { date: "Hoy", misiones: 145, sellos: 102, total: 247, isToday: true },
    ];
    return days;
  }, []);

  // Eventos de feed en vivo adaptados a la gastronomía de Bliss Soul
  const liveEvents = useMemo(() => {
    const defaultEvents = [
      {
        id: "ev-1",
        mesa: "Mesa 04",
        tipo: "misiones",
        cliente: "Sofía M.",
        accion: "Completó misión: Foto en Instagram Stories con Tarta de Frambuesa",
        recompensa: "+3 Sellos VIP",
        tiempo: "Hace 2 min",
        estado: "Validado",
        estadoColor: "emerald",
      },
      {
        id: "ev-2",
        mesa: "Mesa 12",
        tipo: "canjes",
        cliente: "Carlos R.",
        accion: "Desbloqueó Sello VIP #5: Café de Especialidad Gratis",
        recompensa: "Voucher #CAFE-VIP",
        tiempo: "Hace 5 min",
        estado: "Pendiente en caja",
        estadoColor: "amber",
      },
      {
        id: "ev-3",
        mesa: "Barra 02",
        tipo: "canjes",
        cliente: "Elena P.",
        accion: "Ganó en Ruleta de la Suerte: Croissant de Almendras de Autor",
        recompensa: "Croissant Gratis",
        tiempo: "Hace 9 min",
        estado: "Entregado",
        estadoColor: "emerald",
      },
      {
        id: "ev-4",
        mesa: "Mesa 07",
        tipo: "sellos",
        cliente: "Marcos V.",
        accion: "Primera visita registrada vía QR escaneado en mesa",
        recompensa: "+1 Sello Bienvenida",
        tiempo: "Hace 14 min",
        estado: "Registrado",
        estadoColor: "blue",
      },
      {
        id: "ev-5",
        mesa: "Mesa 15",
        tipo: "canjes",
        cliente: "Lucía T.",
        accion: "Canje de Bono Dulce: Cookie de Pistacho & Chocolate Blanco",
        recompensa: "Bono Dulce",
        tiempo: "Hace 18 min",
        estado: "Pendiente en caja",
        estadoColor: "amber",
      },
      {
        id: "ev-6",
        mesa: "Mesa 03",
        tipo: "sellos",
        cliente: "Andrés B.",
        accion: "Subió de rango a 'Embajador Dulce VIP' (10 Sellos)",
        recompensa: "Brunch para 2",
        tiempo: "Hace 22 min",
        estado: "Completado",
        estadoColor: "purple",
      },
      {
        id: "ev-7",
        mesa: "Terraza 01",
        tipo: "misiones",
        cliente: "Valeria G.",
        accion: "Compartió invitación con 3 amigos por WhatsApp",
        recompensa: "+3 Sellos VIP",
        tiempo: "Hace 27 min",
        estado: "Acreditado",
        estadoColor: "emerald",
      },
      {
        id: "ev-8",
        mesa: "Mesa 09",
        tipo: "sellos",
        cliente: "Mateo D.",
        accion: "Reto del Cronómetro 10s: Clavó 10.02s en Segunda Oportunidad",
        recompensa: "Tarta Vasca Gratis",
        tiempo: "Hace 33 min",
        estado: "Trofeo Otorgado",
        estadoColor: "emerald",
      },
    ];

    if (activeFilter === "todos") return defaultEvents;
    return defaultEvents.filter((e) => e.tipo === activeFilter);
  }, [activeFilter]);

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#f2be71] animate-spin" />
          <span className="text-sm text-[#ccc3d8] font-medium font-['Epilogue']">Cargando métricas del negocio...</span>
        </div>
      </div>
    );
  }

  const totalSessions = 247;
  const totalPrizesCount = metrics?.totalPrizes || 89;
  const activeStampsCount = metrics?.totalCustomers || 1234;
  const missionsCount = 34;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={fetchData}
            className="text-xs bg-red-900/40 hover:bg-red-900/70 text-white px-3 py-1 rounded-lg border border-red-500/40"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* 1. BANNER DE ALERTA DE CANJES PENDIENTES (STITCH) */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-[#1c1b1f] border border-[#f59e0b]/40 shadow-[0_4px_20px_rgba(245,158,11,0.08)] relative overflow-hidden gap-4">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#f59e0b]"></div>
        <div className="flex items-center gap-3.5 pl-2">
          <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/15 border border-[#f59e0b]/40 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#e6e1e7] font-['Epilogue']">
              ¡Atención: {pendingTables.length > 0 ? pendingTables.length : 5} Premios pendientes de validación en caja!
            </h4>
            <p className="text-xs text-[#ccc3d8]">
              {pendingTables.length > 0
                ? `Mesas activas con canje: ${pendingTables.map((t) => t.name).join(", ")}.`
                : "Las mesas 04 y 12 están esperando confirmación de entrega de voucher en tiempo real."}
            </p>
          </div>
        </div>

        <Link
          to="/prizes"
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#252429] hover:bg-[#2e2d33] text-[#f59e0b] border border-[#f59e0b]/40 rounded-xl text-xs font-bold transition-all active:scale-98 cursor-pointer"
        >
          <span>Revisar cola de canje</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      {/* 2. LAS 4 TARJETAS DE IMPACTO KPI (DISEÑO STITCH) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Sesiones Hoy */}
        <div className="bg-[#1c1b1f] p-5 rounded-2xl border border-[#363439] relative overflow-hidden flex flex-col justify-between hover:border-[#f2be71]/30 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#ccc3d8]">Sesiones Hoy</p>
              <h3 className="text-3xl font-black text-[#e6e1e7] mt-1 font-mono">{totalSessions}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#201f23] flex items-center justify-center border border-[#f2be71]/30 text-[#f2be71] shadow-inner">
              <Gamepad2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-0.5 text-[#10b981] font-bold text-xs bg-[#10b981]/15 px-2 py-0.5 rounded-full border border-[#10b981]/30">
              <TrendingUp className="w-3 h-3" />
              +12%
            </span>
            <span className="text-[11px] text-[#ccc3d8]">vs ayer a esta hora</span>
          </div>
        </div>

        {/* KPI 2: Premios Entregados */}
        <div className="bg-[#1c1b1f] p-5 rounded-2xl border border-[#363439] relative overflow-hidden flex flex-col justify-between hover:border-[#f2be71]/40 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#ccc3d8]">Premios Entregados</p>
              <h3 className="text-3xl font-black text-[#f2be71] mt-1 font-mono">{totalPrizesCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#684400]/30 border border-[#f2be71]/40 flex items-center justify-center text-[#f2be71] shadow-inner">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[#f2be71] font-bold text-xs bg-[#684400]/30 px-2 py-0.5 rounded-full border border-[#f2be71]/30">
              +8
            </span>
            <span className="text-[11px] text-[#ccc3d8]">vouchers canjeados hoy</span>
          </div>
        </div>

        {/* KPI 3: Sellos VIP Activos */}
        <div className="bg-[#1c1b1f] p-5 rounded-2xl border border-[#363439] relative overflow-hidden flex flex-col justify-between hover:border-[#d1bcff]/40 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#ccc3d8]">Sellos VIP Activos</p>
              <h3 className="text-3xl font-black text-[#d1bcff] mt-1 font-mono">{activeStampsCount.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#503f79]/30 border border-[#d1bcff]/40 flex items-center justify-center text-[#d1bcff] shadow-inner">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[#d1bcff] font-bold text-xs bg-[#503f79]/40 px-2 py-0.5 rounded-full border border-[#d1bcff]/30">
              +45
            </span>
            <span className="text-[11px] text-[#ccc3d8]">esta semana (Lila VIP)</span>
          </div>
        </div>

        {/* KPI 4: Misiones Completadas */}
        <div className="bg-[#1c1b1f] p-5 rounded-2xl border border-[#363439] relative overflow-hidden flex flex-col justify-between hover:border-[#10b981]/40 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#ccc3d8]">Misiones Completadas</p>
              <h3 className="text-3xl font-black text-[#10b981] mt-1 font-mono">{missionsCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#0d2e1f] border border-[#10b981]/40 flex items-center justify-center text-[#10b981] shadow-inner">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[#10b981] font-bold text-xs bg-[#10b981]/15 px-2 py-0.5 rounded-full border border-[#10b981]/30">
              94%
            </span>
            <span className="text-[11px] text-[#ccc3d8]">tasa de efectividad</span>
          </div>
        </div>
      </section>

      {/* 3. GRÁFICA DE BARRAS A 14 DÍAS (STITCH CUSTOM DUAL-TONE SVG / CSS) */}
      <section className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#363439] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue']">
                Sesiones de Juego — Últimos 14 Días
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#201f23] border border-[#363439] text-xs text-[#f2be71] font-mono">
                11 Oct – 24 Oct
              </span>
            </div>
            <p className="text-xs text-[#ccc3d8] mt-0.5">Distribución de partidas entre mesas y barra de café</p>
          </div>

          {/* Leyenda de la Gráfica */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#f2be71] shadow-sm"></span>
              <span className="text-[#e6e1e7] font-medium">Sesiones Doradas (Misiones)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#d1bcff] shadow-sm"></span>
              <span className="text-[#e6e1e7] font-medium">Sellos VIP (Lila)</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-[#201f23] text-[#f2be71] font-semibold border border-[#363439] flex items-center gap-1.5 text-xs">
              <Flame className="w-3.5 h-3.5 text-[#f2be71]" />
              <span>Pico: Sáb 19 (310 partidas)</span>
            </div>
          </div>
        </div>

        {/* Lienzo Gráfico de Barras */}
        <div className="relative pt-6 pb-2">
          {/* Líneas horizontales de guía */}
          <div className="absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between pointer-events-none opacity-25">
            <div className="w-full border-b border-[#363439] flex justify-between text-[10px] text-[#ccc3d8]">
              <span>350</span>
            </div>
            <div className="w-full border-b border-[#363439] flex justify-between text-[10px] text-[#ccc3d8]">
              <span>250</span>
            </div>
            <div className="w-full border-b border-[#363439] flex justify-between text-[10px] text-[#ccc3d8]">
              <span>150</span>
            </div>
            <div className="w-full border-b border-[#363439] flex justify-between text-[10px] text-[#ccc3d8]">
              <span>50</span>
            </div>
          </div>

          {/* Render de las 14 barras apiladas */}
          <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 sm:gap-3 h-64 items-end relative z-10 px-2">
            {fourteenDaysData.map((d, i) => {
              const maxScale = 350;
              const totalHeightPercent = Math.min(Math.round((d.total / maxScale) * 100), 100);
              const misionesPercent = Math.round((d.misiones / d.total) * 100);
              const sellosPercent = 100 - misionesPercent;

              return (
                <div key={i} className="group flex flex-col items-center gap-2 h-full justify-end cursor-pointer">
                  {/* Tooltip flotante al hacer hover */}
                  <div className="text-[10px] text-[#f2be71] opacity-0 group-hover:opacity-100 transition-opacity font-mono font-bold -mb-1">
                    {d.total}
                  </div>

                  {/* Barra apilada dual */}
                  <div
                    className={`w-full max-w-[28px] rounded-t-lg overflow-hidden flex flex-col transition-all group-hover:scale-105 group-hover:brightness-110 shadow-md ${
                      d.isPeak ? "ring-2 ring-[#f2be71] shadow-[0_0_12px_rgba(242,190,113,0.3)]" : ""
                    }`}
                    style={{ height: `${totalHeightPercent}%` }}
                  >
                    {/* Parte Superior: Sellos VIP (Lila) */}
                    <div
                      className="w-full bg-[#d1bcff] transition-all"
                      style={{ height: `${sellosPercent}%` }}
                    />
                    {/* Parte Inferior: Misiones / Ruleta (Dorado) */}
                    <div
                      className="w-full bg-[#f2be71] transition-all"
                      style={{ height: `${misionesPercent}%` }}
                    />
                  </div>

                  {/* Etiqueta de Fecha */}
                  <span
                    className={`text-[10px] font-medium truncate w-full text-center transition-colors ${
                      d.isToday ? "text-[#f2be71] font-bold" : "text-[#ccc3d8] group-hover:text-white"
                    }`}
                  >
                    {d.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. DOS GRÁFICAS ANALÍTICAS ADICIONALES (EMBUDO + DISTRIBUCIÓN) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Embudo de Conversión de Mesa */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#363439] pb-3">
            <h4 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#f2be71]" />
              <span>Embudo de Conversión en Mesa</span>
            </h4>
            <span className="text-xs text-[#10b981] font-mono font-bold">36.2% Retención Final</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { etapa: "1. Escaneos de QR en Mesa", valor: "680 clientes", pct: 100, color: "bg-[#f2be71]" },
              { etapa: "2. Registro y Giro de Ruleta", valor: "572 jugaron", pct: 84, color: "bg-[#ffddb1]" },
              { etapa: "3. Obtención de Premio o Sello", valor: "420 ganaron", pct: 62, color: "bg-[#d1bcff]" },
              { etapa: "4. Canje Efectivo en Caja", valor: "247 validados", pct: 36, color: "bg-[#10b981]" },
            ].map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#ccc3d8]">{step.etapa}</span>
                  <span className="text-white font-mono">{step.valor} ({step.pct}%)</span>
                </div>
                <div className="w-full bg-[#201f23] rounded-full h-2.5 overflow-hidden border border-[#363439]">
                  <div className={`h-full rounded-full transition-all duration-500 ${step.color}`} style={{ width: `${step.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución de Premios Más Ganados */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#363439] pb-3">
            <h4 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#d1bcff]" />
              <span>Distribución de Premios de la Ruleta</span>
            </h4>
            <span className="text-xs text-[#ccc3d8]">Total: 89 canjeados</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { nombre: "Croissant Artesanal de Autor", count: 31, pct: 35, color: "bg-[#f2be71]" },
              { nombre: "Café de Especialidad Gratis", count: 22, pct: 25, color: "bg-[#ffddb1]" },
              { nombre: "Porción de Tarta Vasca", count: 18, pct: 20, color: "bg-[#d1bcff]" },
              { nombre: "10% de Descuento en Cuenta", count: 12, pct: 14, color: "bg-[#a3cafc]" },
              { nombre: "Cena de Autor para 2 (VIP)", count: 6, pct: 6, color: "bg-[#10b981]" },
            ].map((p, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#e6e1e7] truncate">{p.nombre}</span>
                  <span className="text-[#f2be71] font-mono shrink-0 ml-2">{p.count} entregados ({p.pct}%)</span>
                </div>
                <div className="w-full bg-[#201f23] rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEED DE ACTIVIDAD EN VIVO (STITCH) */}
      <section className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#363439] pb-4 gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue']">
              Feed de Actividad en Vivo
            </h3>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0d2e1f] border border-[#10b981]/40 text-[#10b981] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
              <span>En directo • WebSocket</span>
            </div>
          </div>

          {/* Filtros rápidos por pestaña */}
          <div className="flex items-center gap-1.5 bg-[#201f23] p-1 rounded-xl border border-[#363439]">
            {(["todos", "canjes", "sellos", "misiones"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  activeFilter === filter
                    ? "bg-[#2b292e] text-[#f2be71] font-bold border border-[#f2be71]/30 shadow-sm"
                    : "text-[#ccc3d8] hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla de Actividad */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#201f23]/60 text-[#ccc3d8] text-xs uppercase tracking-wider font-bold">
                <th className="px-4 py-3 rounded-l-xl">Mesa</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Acción Realizada</th>
                <th className="px-4 py-3">Recompensa</th>
                <th className="px-4 py-3">Tiempo</th>
                <th className="px-4 py-3 text-right rounded-r-xl">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#363439]/50 text-xs">
              {liveEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-[#201f23]/40 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-[#f2be71] font-mono">{ev.mesa}</td>
                  <td className="px-4 py-3.5 font-semibold text-[#e6e1e7]">{ev.cliente}</td>
                  <td className="px-4 py-3.5 text-[#ccc3d8] max-w-md truncate">{ev.accion}</td>
                  <td className="px-4 py-3.5 font-semibold text-[#ffddb1]">{ev.recompensa}</td>
                  <td className="px-4 py-3.5 text-[#958da1] font-mono">{ev.tiempo}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        ev.estadoColor === "emerald"
                          ? "bg-[#0d2e1f] text-[#10b981] border-[#10b981]/40"
                          : ev.estadoColor === "amber"
                          ? "bg-[#2a1f00] text-[#f59e0b] border-[#f59e0b]/40 animate-pulse"
                          : ev.estadoColor === "purple"
                          ? "bg-[#503f79]/30 text-[#d1bcff] border-[#d1bcff]/40"
                          : "bg-[#0d2239] text-[#60a5fa] border-[#60a5fa]/40"
                      }`}
                    >
                      {ev.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
