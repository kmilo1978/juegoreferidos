import { useState } from "react";
import { GamePrize, WonPrize } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import {
  X,
  BarChart3,
  Sliders,
  MessageSquare,
  Award,
  RotateCcw,
  Eye,
  Calendar,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Users,
  Zap,
  Bell,
  Database,
  Clock,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  Copy,
} from "lucide-react";
import { calculateAnalytics } from "../../lib/analyticsService";
import { clientConfig } from "../../config/clientConfig";
import {
  getComposioConfig,
  saveComposioConfig,
  ComposioRuntimeConfig,
} from "../../lib/composioService";
import {
  getPushConfig,
  savePushConfig,
  PushRuntimeConfig,
  OneSignalService,
  getCustomPushTemplates,
  saveCustomPushTemplates,
  resetPushTemplates,
  PushNotificationTemplate,
  formatPushText,
} from "../../lib/oneSignalService";
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  SupabaseConfig,
  SupabaseService,
} from "../../lib/supabaseService";
import {
  getActiveCashierPin,
  setActiveCashierPin,
  generateNewCashierPin,
} from "../../lib/tableSecurityService";

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  prizes: GamePrize[];
  onUpdatePrizes: (newPrizes: GamePrize[]) => void;
  history: WonPrize[];
  onGenerateNewTable: () => void;
}

export function AdminPanelModal({
  isOpen,
  onClose,
  prizes,
  onUpdatePrizes,
  history,
  onGenerateNewTable,
}: AdminPanelModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"stats" | "prizes" | "campaign" | "messages" | "composio" | "databases">("stats");
  const [composioConfig, setComposioConfig] = useState<ComposioRuntimeConfig>(() => getComposioConfig());
  const [pushConfig, setPushConfig] = useState<PushRuntimeConfig>(() => getPushConfig());
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => getSupabaseConfig());
  const [activePin, setActivePin] = useState(() => getActiveCashierPin());
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{ loading: boolean; msg?: string; success?: boolean }>({ loading: false });
  const [pushTemplates, setPushTemplates] = useState<PushNotificationTemplate[]>(() => getCustomPushTemplates());
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);

  // Estados editables de premios
  const [localPrizes, setLocalPrizes] = useState<GamePrize[]>(prizes);

  // Estadísticas calculadas
  const totalParticipants = history.length;
  const prizesUsed = history.filter((h) => h.status === "UTILIZADO").length;
  const prizesAvailable = history.filter((h) => h.status === "DISPONIBLE").length;

  const totalProb = localPrizes.reduce(
    (sum, p) => sum + (p.active ? Number(p.probability) || 0 : 0),
    0,
  );
  const isProbValid = totalProb === 100;

  const handleProbChange = (id: string, newProb: number) => {
    const updated = localPrizes.map((p) =>
      p.id === id ? { ...p, probability: Math.max(0, Math.min(100, newProb)) } : p,
    );
    setLocalPrizes(updated);
  };

  const handleToggleActive = (id: string) => {
    const updated = localPrizes.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    setLocalPrizes(updated);
  };

  const handleSavePrizes = () => {
    if (!isProbValid) {
      alert("Las probabilidades deben sumar exactamente 100%. Suma actual: " + totalProb + "%");
      return;
    }
    onUpdatePrizes(localPrizes);
    alert("¡Configuración de premios guardada con éxito!");
  };

  const analytics = calculateAnalytics(history);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-card border border-gold/40 shadow-2xl overflow-hidden my-8 animate-fade-in flex flex-col max-h-[90vh]">
        {/* Cabecera del Panel */}
        <div className="bg-neutral-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-gold/30">
          <div>
            <span className="text-[10px] uppercase tracking-[0.24em] text-gold font-mono font-semibold">
              {clientConfig.brand.name.toUpperCase()} · PANEL DE CONTROL
            </span>
            <h2 className="text-lg sm:text-xl font-display font-medium text-white">
              {t("Administración de Juego QR & Premios", "QR Game & Prizes Management")}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex border-b border-border bg-muted/40 px-6 gap-2 sm:gap-6 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("stats")}
            className={`py-3.5 font-medium uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "stats"
                ? "border-gold text-gold font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>{t("Métricas en Vivo", "Live Metrics")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("prizes")}
            className={`py-3.5 font-medium uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "prizes"
                ? "border-gold text-gold font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>{t("Premios & Probabilidades", "Prizes & Probabilities")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("campaign")}
            className={`py-3.5 font-medium uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "campaign"
                ? "border-gold text-gold font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>{t("Campaña & Reglas", "Campaign & Rules")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("messages")}
            className={`py-3.5 font-medium uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "messages"
                ? "border-gold text-gold font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{t("Mensajes WhatsApp", "WhatsApp Messages")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("composio")}
            className={`py-3.5 font-medium uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "composio"
                ? "border-gold text-gold font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            <span>{t("Composio & Web Push", "Composio & Web Push")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("databases")}
            className={`py-3.5 font-medium uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "databases"
                ? "border-gold text-gold font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>{t("Google Sheets & Supabase", "Google Sheets & Supabase")}</span>
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Estadísticas y Métricas */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              {/* BANNER 1: KPI ESTRATÉGICOS (MEJOR DÍA + TRANSACCIONES DEL MES) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tarjeta: Mejor Día */}
                <div className="relative overflow-hidden rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-gold/10 via-background to-amber-500/5 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-gold flex items-center gap-1.5">
                      <Trophy className="h-4 w-4 text-gold" />
                      {t("Mejor Día de la Semana", "Best Day of the Week")}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-gold/20 text-gold text-[10px] font-bold uppercase tracking-wider">
                      Mayor Afluencia
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-display font-bold text-foreground">
                      {analytics.timing.bestDay}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({analytics.timing.bestDayCount} interacciones registradas)
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {t(
                      "Es el día con mayor interacción en mesa. Ideal para reforzar meseros o lanzar ofertas especiales.",
                      "Top engagement day. Perfect for staffing up or running special promos."
                    )}
                  </p>
                </div>

                {/* Tarjeta: Transacciones & Canjes este mes */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50/80 via-background to-teal-500/5 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700 flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      {t("Transacciones de este Mes", "This Month's Transactions")}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {analytics.transactions.conversionRate}% Conversión
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="text-3xl font-display font-bold text-emerald-700">
                      {analytics.transactions.redeemedThisMonth}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      canjes validados en caja de {analytics.transactions.totalThisMonth} jugadas
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {t(
                      "Clientes que no solo jugaron, sino que consumieron y presentaron su código en caja para pagar.",
                      "Customers who played, ordered food, and redeemed their code at checkout."
                    )}
                  </p>
                </div>
              </div>

              {/* BLOQUE 2: CONTEO DE VISTAS (SWITCHY / QR EN MESA) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("Conteo de Vistas del QR / Enlace", "QR & Link Pageviews")}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-light">
                    Tráfico medido en tiempo real
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-border/80 bg-background p-3.5 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t("Vistas Hoy", "Views Today")}
                    </p>
                    <p className="font-display text-2xl text-foreground font-semibold mt-0.5">
                      {analytics.views.today}
                    </p>
                    <span className="text-[9px] text-emerald-600 font-medium">En vivo</span>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-background p-3.5 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t("Esta Semana", "This Week")}
                    </p>
                    <p className="font-display text-2xl text-foreground font-semibold mt-0.5">
                      {analytics.views.thisWeek}
                    </p>
                    <span className="text-[9px] text-muted-foreground">Últimos 7 días</span>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-background p-3.5 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t("Este Mes", "This Month")}
                    </p>
                    <p className="font-display text-2xl text-gold font-semibold mt-0.5">
                      {analytics.views.thisMonth}
                    </p>
                    <span className="text-[9px] text-gold font-medium">Últimos 30 días</span>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-background p-3.5 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t("Total Acumulado", "Total Lifetime")}
                    </p>
                    <p className="font-display text-2xl text-foreground font-semibold mt-0.5">
                      {analytics.views.total}
                    </p>
                    <span className="text-[9px] text-muted-foreground">Vistas históricas</span>
                  </div>
                </div>
              </div>

              {/* BLOQUE 3: DISTRIBUCIÓN DE AFLUENCIA SEMANAL */}
              <div className="rounded-2xl border border-border/80 bg-background p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gold" />
                    {t("Distribución de Actividad por Día de la Semana", "Weekly Activity Breakdown")}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Mayor actividad = mayor potencial de ventas
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-2 pt-2">
                  {analytics.timing.dayDistribution.map((day) => {
                    const isBest = day.dayName === analytics.timing.bestDay && day.count > 0;
                    return (
                      <div
                        key={day.dayName}
                        className={`rounded-xl p-2.5 text-center transition-all ${
                          isBest
                            ? "bg-gold/15 border-2 border-gold shadow-xs"
                            : "bg-muted/30 border border-border/60 hover:bg-muted/60"
                        }`}
                      >
                        <p className={`text-[10px] uppercase font-bold tracking-wider ${isBest ? "text-gold" : "text-muted-foreground"}`}>
                          {day.dayShort}
                        </p>
                        <p className={`text-base sm:text-lg font-display font-bold mt-1 ${isBest ? "text-gold" : "text-foreground"}`}>
                          {day.count}
                        </p>
                        <div className="w-full bg-border/50 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isBest ? "bg-gold" : "bg-muted-foreground/60"}`}
                            style={{ width: `${Math.max(day.percentage, day.count > 0 ? 15 : 0)}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-muted-foreground block mt-1">
                          {day.percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BLOQUE 4: HORAS MUERTAS VS HORAS PICO (HORÓMETRO DE ACTIVIDAD) */}
              <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-50/50 via-background to-orange-50/40 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-700 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-amber-600" />
                      {t("Horómetro de Actividad & Detección de Horas Muertas", "Hourly Activity & Dead Hours")}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Identifica a qué horas del día los clientes juegan en mesa para detectar y activar las horas lentas.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                    <span>☕ Franja Muerta Habitual: 3:00 PM a 6:00 PM</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-background border border-amber-200 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">Diagnóstico de Horas Muertas:</span>
                    <p className="text-amber-950 font-medium">{analytics.timing.deadHoursSummary}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-emerald-200 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Franja de Mayor Afluencia:</span>
                    <p className="text-emerald-950 font-medium">{analytics.timing.peakHoursSummary}</p>
                  </div>
                </div>

                {/* Tarjetas de horas (8 AM a 10 PM) */}
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2 pt-1">
                  {analytics.timing.hourlyDistribution.map((slot) => (
                    <div
                      key={slot.hour}
                      className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-between transition-all ${
                        slot.isDeadHour
                          ? "border-amber-300 bg-amber-50/70 text-amber-950"
                          : slot.count > 0
                          ? "border-emerald-300 bg-emerald-50/70 text-emerald-950"
                          : "border-border/60 bg-muted/20 text-muted-foreground"
                      }`}
                    >
                      <span className="text-[10px] font-bold font-mono block">{slot.label}</span>
                      <span className="text-lg font-black my-0.5">{slot.count}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                        slot.isDeadHour ? "bg-amber-200 text-amber-800" : "bg-muted text-muted-foreground"
                      }`}>
                        {slot.isDeadHour ? "Hora Muerta" : slot.timeSlotName.split("/")[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Registro reciente de premios */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-[0.18em] font-semibold text-foreground">
                    {t("Historial Reciente de Premios", "Recent Prize History")}
                  </h3>
                  <button
                    type="button"
                    onClick={onGenerateNewTable}
                    className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{t("Simular nueva mesa", "Simulate new table")}</span>
                  </button>
                </div>

                <div className="border border-border/80 rounded-xl overflow-hidden bg-background">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="py-2.5 px-3">Código</th>
                        <th className="py-2.5 px-3">Hora</th>
                        <th className="py-2.5 px-3">Mesa</th>
                        <th className="py-2.5 px-3">Cliente</th>
                        <th className="py-2.5 px-3">Premio</th>
                        <th className="py-2.5 px-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {history.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-muted-foreground italic">
                            No hay participaciones registradas en esta sesión aún.
                          </td>
                        </tr>
                      ) : (
                        history.map((h) => (
                          <tr key={h.uniqueCode} className="hover:bg-muted/20">
                            <td className="py-2.5 px-3 font-mono font-bold text-gold">
                              {h.uniqueCode}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">
                              {h.wonAt || "Hoy"}
                            </td>
                            <td className="py-2.5 px-3">{h.tableNumber}</td>
                            <td className="py-2.5 px-3 font-medium text-foreground">
                              {h.participantName}
                              <span className="block text-[10px] text-muted-foreground font-mono">
                                +{h.participantWhatsapp}
                              </span>
                              {h.participantEmail && (
                                <span className="block text-[10px] text-muted-foreground truncate max-w-[150px]">
                                  {h.participantEmail}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">{h.prizeName}</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  h.status === "UTILIZADO"
                                    ? "bg-muted text-muted-foreground"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {h.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Configuración de Premios y Probabilidades */}
          {activeTab === "prizes" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border bg-muted/30">
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-foreground">
                    Suma total de probabilidades
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Debe sumar exactamente 100% para que el algoritmo sea matemáticamente
                    equitativo.
                  </p>
                </div>
                <div
                  className={`px-4 py-2 rounded-xl text-sm font-bold font-mono ${
                    isProbValid
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-red-100 text-red-800 border border-red-300"
                  }`}
                >
                  {totalProb}% / 100%
                </div>
              </div>

              {/* Lista de premios */}
              <div className="space-y-3">
                {localPrizes.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-border/80 bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-4 w-4 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground font-light">{p.terms}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <label className="text-[11px] text-muted-foreground uppercase">
                          Probabilidad:
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={p.probability}
                          onChange={(e) => handleProbChange(p.id, Number(e.target.value))}
                          className="w-16 rounded-lg border border-border px-2 py-1 text-xs text-center font-mono font-bold text-foreground bg-card"
                        />
                        <span className="text-xs font-mono text-muted-foreground">%</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleActive(p.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                          p.active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {p.active ? "Activo" : "Inactivo"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSavePrizes}
                  disabled={!isProbValid}
                  className="btn-solid py-2.5 px-6 text-xs uppercase tracking-wider font-semibold disabled:opacity-40"
                >
                  Guardar Cambios de Probabilidades
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Campaña y Términos */}
          {activeTab === "campaign" && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border p-4 bg-background space-y-3">
                <h4 className="font-semibold text-foreground uppercase tracking-wider">
                  Configuración de Campaña
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted-foreground mb-1">Nombre de Campaña:</label>
                    <input
                      type="text"
                      readOnly
                      value={`Juego de Mesa & Fidelización — ${clientConfig.brand.name}`}
                      className="w-full border rounded-lg p-2 bg-muted/40 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1">Instagram Oficial:</label>
                    <input
                      type="text"
                      readOnly
                      value={clientConfig.channels.instagramHandle}
                      className="w-full border rounded-lg p-2 bg-muted/40 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-4 bg-background space-y-2">
                <h4 className="font-semibold text-foreground uppercase tracking-wider">
                  Reglas del Juego
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground font-light">
                  <li>Solo se puede participar durante una sesión de pago activa.</li>
                  <li>Una única participación por cuenta/mesa.</li>
                  <li>Cada premio genera un código criptográfico único e intransferible.</li>
                  <li>Un premio marcado como UTILIZADO queda bloqueado de por vida.</li>
                  <li>Los domingos se publican ganadores semanales en los Estados de WhatsApp.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: Plantilla de Mensaje WhatsApp */}
          {activeTab === "messages" && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border p-4 bg-background space-y-3">
                <h4 className="font-semibold text-foreground uppercase tracking-wider">
                  Variables automáticas disponibles
                </h4>
                <div className="flex flex-wrap gap-2 font-mono text-[11px]">
                  <span className="bg-gold/15 text-gold px-2 py-1 rounded">{"{{nombre}}"}</span>
                  <span className="bg-gold/15 text-gold px-2 py-1 rounded">{"{{premio}}"}</span>
                  <span className="bg-gold/15 text-gold px-2 py-1 rounded">{"{{codigo}}"}</span>
                  <span className="bg-gold/15 text-gold px-2 py-1 rounded">
                    {"{{restaurante}}"}
                  </span>
                </div>

                <div className="pt-2">
                  <label className="block text-muted-foreground mb-1 font-medium">
                    Plantilla de confirmación al cliente:
                  </label>
                  <textarea
                    rows={6}
                    readOnly
                    value={`🎉 ¡Hola, {{nombre}}!
Gracias por dejarnos tu feedback y participar en nuestro juego.
¡Ganaste {{premio}} en tu cuenta de hoy! 🍽️
Presenta este código al momento de pagar:
{{codigo}}
¡Gracias por visitarnos en {{restaurante}}! ❤️`}
                    className="w-full rounded-xl border border-border p-3 font-mono text-xs bg-muted/30 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Configuración de Composio & Automatizaciones */}
          {activeTab === "composio" && (
            <div className="space-y-6 text-xs">
              {/* BANNER EXPLICATIVO */}
              <div className="rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-gold/10 via-background to-amber-500/5 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-gold/20 flex items-center justify-center text-gold font-bold">
                      ⚡
                    </span>
                    <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
                      Composio.dev · Conector de IA & Automatización
                    </h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    composioConfig.enabled 
                      ? "bg-emerald-500/20 text-emerald-700 border border-emerald-500/40" 
                      : "bg-muted text-muted-foreground border border-border"
                  }`}>
                    {composioConfig.enabled ? "● Activo" : "○ Inactivo"}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  <strong>Composio</strong> conecta tu sistema de fidelización con más de 100 herramientas externas (Google Sheets, Google Contacts, WhatsApp, CRM y Correo) en tiempo real para que ningún comensal se quede sin registrar.
                </p>
              </div>

              {/* FORMULARIO DE COMPOSIO */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h4 className="font-semibold text-foreground">Habilitar Integración con Composio</h4>
                    <p className="text-[11px] text-muted-foreground">Sincroniza eventos de premios y canjes con la API de Composio.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...composioConfig, enabled: !composioConfig.enabled };
                      setComposioConfig(next);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      composioConfig.enabled ? "bg-emerald-600" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        composioConfig.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* API Key */}
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Composio API Key (opcional):
                  </label>
                  <input
                    type="password"
                    placeholder="comp_live_..."
                    value={composioConfig.apiKey}
                    onChange={(e) => setComposioConfig({ ...composioConfig, apiKey: e.target.value })}
                    className="w-full bg-muted/30 border border-border rounded-xl px-3.5 py-2.5 font-mono text-xs text-foreground focus:ring-1 focus:ring-gold focus:outline-none"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Obtenla gratis en tu panel de <a href="https://composio.dev" target="_blank" rel="noopener noreferrer" className="text-gold underline">composio.dev</a>.
                  </span>
                </div>

                {/* Checkboxes de integraciones */}
                <div className="space-y-2 pt-2">
                  <span className="font-semibold text-foreground block mb-2">Herramientas Automatizadas:</span>
                  
                  <label className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition">
                    <input
                      type="checkbox"
                      checked={composioConfig.integrations.googleSheets}
                      onChange={(e) => setComposioConfig({
                        ...composioConfig,
                        integrations: { ...composioConfig.integrations, googleSheets: e.target.checked }
                      })}
                      className="rounded border-border text-gold focus:ring-gold"
                    />
                    <div>
                      <span className="font-medium text-foreground block">📗 Google Sheets</span>
                      <span className="text-[10px] text-muted-foreground">Agrega una fila por cada ganador y actualiza la columna de canje en caja.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition">
                    <input
                      type="checkbox"
                      checked={composioConfig.integrations.googleContacts}
                      onChange={(e) => setComposioConfig({
                        ...composioConfig,
                        integrations: { ...composioConfig.integrations, googleContacts: e.target.checked }
                      })}
                      className="rounded border-border text-gold focus:ring-gold"
                    />
                    <div>
                      <span className="font-medium text-foreground block">👤 Google Contacts</span>
                      <span className="text-[10px] text-muted-foreground">Crea el contacto en la libreta del restaurante con nombre, teléfono y etiqueta 'Cliente Frecuente'.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition">
                    <input
                      type="checkbox"
                      checked={composioConfig.integrations.dailyEmailSummary}
                      onChange={(e) => setComposioConfig({
                        ...composioConfig,
                        integrations: { ...composioConfig.integrations, dailyEmailSummary: e.target.checked }
                      })}
                      className="rounded border-border text-gold focus:ring-gold"
                    />
                    <div>
                      <span className="font-medium text-foreground block">✉️ Resumen Diario por Email</span>
                      <span className="text-[10px] text-muted-foreground">Envía un reporte nocturno al dueño con las ventas y cupones canjeados del día.</span>
                    </div>
                  </label>
                </div>

                {/* Webhook Fallback */}
                <div className="pt-2 border-t border-border">
                  <label className="block font-semibold text-foreground mb-1">
                    URL de Webhook Directo (Google Apps Script):
                  </label>
                  <input
                    type="text"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={composioConfig.endpoints.googleSheetWebhookUrl}
                    onChange={(e) => setComposioConfig({
                      ...composioConfig,
                      endpoints: { ...composioConfig.endpoints, googleSheetWebhookUrl: e.target.value }
                    })}
                    className="w-full bg-muted/30 border border-border rounded-xl px-3.5 py-2.5 font-mono text-xs text-foreground focus:ring-1 focus:ring-gold focus:outline-none"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Si no usas la API de Composio, puedes pegar aquí tu Webhook 100% gratuito de Google Apps Script.
                  </span>
                </div>

                {/* Botones de Guardar y Probar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      saveComposioConfig(composioConfig);
                      alert("¡Configuración de Composio y automatizaciones guardada con éxito!");
                    }}
                    className="px-5 py-2.5 bg-gold hover:bg-gold/90 text-white rounded-xl font-semibold uppercase tracking-wider text-xs shadow-sm transition"
                  >
                    💾 Guardar Configuración
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const success = await ComposioService.recordWonPrize({
                        fullName: "Prueba Composio",
                        whatsapp: "573001234567",
                        email: "prueba@composio.dev",
                        instagramHandle: "@cliente_prueba",
                        prizeName: "Premio de Prueba",
                        uniqueCode: "TEST-0001",
                        wonAt: new Date().toLocaleTimeString(),
                      });
                      if (success) {
                        alert("✅ ¡Prueba enviada con éxito! Revisa tu Google Sheets o Composio.");
                      } else {
                        alert("⚠️ Prueba ejecutada. Si no ves la fila, verifica que la URL de Webhook o API Key esté bien configurada.");
                      }
                    }}
                    className="px-4 py-2 border border-border bg-background hover:bg-muted text-foreground rounded-xl font-medium text-xs transition"
                  >
                    🚀 Probar Envío de Prueba
                  </button>
                </div>
              </div>

              {/* SECCIÓN 2: ONESIGNAL WEB PUSH (SIN WHATSAPP API) */}
              <div className="rounded-2xl border-2 border-sky-400/50 bg-gradient-to-br from-sky-500/10 via-background to-sky-500/5 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-600 font-bold">
                      🔔
                    </span>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">
                        OneSignal · Notificaciones Web Push
                      </h4>
                      <p className="text-[11px] text-muted-foreground">Envía alertas a los celulares sin costo de Meta ni WhatsApp API.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...pushConfig, enabled: !pushConfig.enabled };
                      setPushConfig(next);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      pushConfig.enabled ? "bg-sky-600" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        pushConfig.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      OneSignal App ID:
                    </label>
                    <input
                      type="text"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      value={pushConfig.appId}
                      onChange={(e) => setPushConfig({ ...pushConfig, appId: e.target.value })}
                      className="w-full bg-muted/30 border border-border rounded-xl px-3.5 py-2.5 font-mono text-xs text-foreground focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      Obtén tu App ID gratis en tu cuenta de <a href="https://onesignal.com" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline font-medium">onesignal.com</a> (hasta 10.000 suscriptores gratis).
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        savePushConfig(pushConfig);
                        alert("¡Configuración de OneSignal Web Push guardada con éxito!");
                      }}
                      className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold uppercase tracking-wider text-xs shadow-sm transition"
                    >
                      💾 Guardar Configuración Push
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        OneSignalService.showLocalTestNotification(
                          "¡Prueba de Notificación Push! 🎁",
                          "Así recibirán tus clientes los avisos de promociones y cupones en su pantalla."
                        );
                      }}
                      className="px-4 py-2 border border-sky-300 bg-sky-50/80 hover:bg-sky-100 text-sky-900 rounded-xl font-medium text-xs transition"
                    >
                      🔔 Probar Notificación en Pantalla
                    </button>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: PERSONALIZADOR DE MENSAJES PUSH Y AUTOMATIZACIONES */}
              <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-background to-orange-500/5 p-5 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <span className="h-8 w-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 text-lg">
                      ✍️
                    </span>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">
                        Personalizador de Mensajes Push (OneSignal & Web)
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Personaliza los títulos y textos de tus alertas automáticas. Puedes usar etiquetas dinámicas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        saveCustomPushTemplates(pushTemplates);
                        alert("¡Plantillas de mensajes push guardadas con éxito!");
                      }}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                    >
                      💾 Guardar Mensajes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const reset = resetPushTemplates();
                        setPushTemplates([...reset]);
                        alert("Textos restablecidos a los valores sugeridos.");
                      }}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-xl text-xs font-medium transition-colors border border-border"
                    >
                      🔄 Restablecer
                    </button>
                  </div>
                </div>

                {/* ETIQUETAS DINÁMICAS DISPONIBLES */}
                <div className="p-3.5 rounded-xl bg-background border border-border space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-gold tracking-wider block">
                    ✨ Variables Dinámicas Disponibles (Haz clic o escríbelas en tu texto):
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 font-mono text-amber-800 font-semibold cursor-pointer">
                      {"{nombre}"} → Nombre del comensal
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 font-mono text-amber-800 font-semibold cursor-pointer">
                      {"{premio}"} → Beneficio ganado
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 font-mono text-amber-800 font-semibold cursor-pointer">
                      {"{codigo}"} → Código del cupón
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 font-mono text-amber-800 font-semibold cursor-pointer">
                      {"{mesa}"} → Mesa asignada
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 font-mono text-amber-800 font-semibold cursor-pointer">
                      {"{restaurante}"} → {clientConfig.brand.name}
                    </span>
                  </div>
                </div>

                {/* SELECTOR DE PLANTILLAS Y ÁREA DE EDICIÓN */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* COLUMNA IZQUIERDA: SELECTOR DE CAMPAÑAS (5 cols) */}
                  <div className="lg:col-span-5 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Selecciona la Campaña a Editar:
                    </span>
                    {pushTemplates.map((tmpl, idx) => {
                      const isSelected = selectedTemplateIndex === idx;
                      return (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => setSelectedTemplateIndex(idx)}
                          className={`w-full p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "bg-amber-500/15 border-gold shadow-xs"
                              : "bg-background border-border/80 hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <strong className={`text-xs ${isSelected ? "text-gold" : "text-foreground"}`}>
                              {tmpl.name}
                            </strong>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase font-mono">
                              {tmpl.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate mt-1">
                            {tmpl.title}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* COLUMNA DERECHA: EDITOR DEL MENSAJE SELECCIONADO Y VISTA PREVIA (7 cols) */}
                  <div className="lg:col-span-7 space-y-4 bg-background p-4 sm:p-5 rounded-2xl border border-border">
                    {(() => {
                      const currentTmpl = pushTemplates[selectedTemplateIndex] || pushTemplates[0];
                      const handleTitleChange = (val: string) => {
                        const updated = [...pushTemplates];
                        updated[selectedTemplateIndex] = { ...currentTmpl, title: val };
                        setPushTemplates(updated);
                      };
                      const handleBodyChange = (val: string) => {
                        const updated = [...pushTemplates];
                        updated[selectedTemplateIndex] = { ...currentTmpl, body: val };
                        setPushTemplates(updated);
                      };

                      return (
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gold tracking-wider">
                              Disparador Automático:
                            </span>
                            <p className="text-xs text-muted-foreground font-medium">
                              {currentTmpl.tagDescription}
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground block">
                              Título de la Notificación:
                            </label>
                            <input
                              type="text"
                              value={currentTmpl.title}
                              onChange={(e) => handleTitleChange(e.target.value)}
                              className="w-full text-xs bg-muted/30 border border-border rounded-xl p-2.5 text-foreground focus:ring-1 focus:ring-gold focus:outline-none font-medium"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground block">
                              Cuerpo del Mensaje (Texto que leerá el cliente):
                            </label>
                            <textarea
                              rows={3}
                              value={currentTmpl.body}
                              onChange={(e) => handleBodyChange(e.target.value)}
                              className="w-full text-xs bg-muted/30 border border-border rounded-xl p-2.5 text-foreground focus:ring-1 focus:ring-gold focus:outline-none resize-none leading-relaxed"
                            />
                          </div>

                          {/* VISTA PREVIA EN PANTALLA DE CELULAR */}
                          <div className="pt-2 border-t border-border">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block mb-2">
                              📱 Vista Previa en Pantalla de Bloqueo del Celular:
                            </span>
                            <div className="rounded-xl border border-neutral-700 bg-neutral-900/90 text-white p-3.5 shadow-xl flex items-start gap-3">
                              <img
                                src={clientConfig.brand.logoUrl}
                                alt="Logo"
                                className="h-8 w-8 rounded-lg object-contain bg-white/10 p-1 shrink-0 mt-0.5"
                              />
                              <div className="flex-1 overflow-hidden space-y-0.5">
                                <div className="flex items-center justify-between text-[11px] text-white/50">
                                  <span className="font-semibold text-white/70 uppercase text-[9px] tracking-wider">
                                    {clientConfig.brand.name}
                                  </span>
                                  <span className="text-[9px]">AHORA</span>
                                </div>
                                <h5 className="font-bold text-xs text-white">
                                  {formatPushText(currentTmpl.title)}
                                </h5>
                                <p className="text-[11px] text-white/80 leading-snug">
                                  {formatPushText(currentTmpl.body)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* BOTONES DE DISPARO DE PRUEBA */}
                          <div className="pt-2 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const renderedTitle = formatPushText(currentTmpl.title);
                                const renderedBody = formatPushText(currentTmpl.body);
                                OneSignalService.showLocalTestNotification(renderedTitle, renderedBody);
                              }}
                              className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider inline-flex items-center justify-center gap-2"
                            >
                              <span>🔔 Probar Este Mensaje en Mi Pantalla</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Bases de Datos (Google Sheets & Supabase) y Seguridad de Mesa */}
          {activeTab === "databases" && (
            <div className="space-y-6">
              {/* Encabezado de la pestaña */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="h-4 w-4 text-gold" />
                  <h3 className="font-semibold text-sm text-foreground">
                    Sincronización Dual: Google Sheets & Supabase
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  El sistema permite enviar los cupones y los sellos de fidelización a <strong>Google Sheets</strong>, a <strong>Supabase</strong>, o a <strong>ambas plataformas al mismo tiempo</strong> de forma redundante.
                </p>
              </div>

              {/* CONTENEDOR DE 2 COLUMNAS: GOOGLE SHEETS A LA IZQUIERDA / SUPABASE A LA DERECHA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* OPCIÓN 1: GOOGLE SHEETS */}
                <div className="rounded-2xl border border-emerald-300/80 bg-card p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Opción 1: Google Sheets
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Costo $0 · Activo
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Registra cada ruleta jugada y cada canje con PIN en tu hoja de cálculo compartida en Google Drive.
                  </p>

                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-foreground block">
                      URL del Webhook de Apps Script:
                    </label>
                    <input
                      type="url"
                      placeholder="https://script.google.com/macros/s/.../exec"
                      value={composioConfig.endpoints.googleSheetWebhookUrl}
                      onChange={(e) =>
                        setComposioConfig({
                          ...composioConfig,
                          endpoints: {
                            ...composioConfig.endpoints,
                            googleSheetWebhookUrl: e.target.value,
                          },
                        })
                      }
                      className="w-full text-xs font-mono bg-background border border-border rounded-xl p-2.5 text-foreground focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-muted-foreground block">
                      Guarda automáticamente: Fecha, Cliente, WhatsApp, Correo, Premio, Código y Canje.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      saveComposioConfig(composioConfig);
                      alert("¡Configuración de Google Sheets guardada con éxito!");
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                  >
                    Guardar Google Sheets
                  </button>
                </div>

                {/* OPCIÓN 2: SUPABASE */}
                <div className="rounded-2xl border border-sky-300/80 bg-card p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-sky-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                      Opción 2: Supabase (PostgreSQL)
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={supabaseConfig.enabled}
                        onChange={(e) =>
                          setSupabaseConfig({ ...supabaseConfig, enabled: e.target.checked })
                        }
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span className="text-xs font-bold text-foreground">Habilitar</span>
                    </label>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Base de datos profesional en la nube. Conecta sedes múltiples y sincroniza sellos al milisegundo.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-foreground block mb-1">
                        Project URL de Supabase:
                      </label>
                      <input
                        type="url"
                        placeholder="https://xyzabcdefg.supabase.co"
                        value={supabaseConfig.projectUrl}
                        onChange={(e) =>
                          setSupabaseConfig({ ...supabaseConfig, projectUrl: e.target.value })
                        }
                        className="w-full text-xs font-mono bg-background border border-border rounded-xl p-2.5 text-foreground focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-foreground block mb-1">
                        Anon Public Key:
                      </label>
                      <input
                        type="password"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                        value={supabaseConfig.anonKey}
                        onChange={(e) =>
                          setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })
                        }
                        className="w-full text-xs font-mono bg-background border border-border rounded-xl p-2.5 text-foreground focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-foreground block mb-1">
                        Nombre de la Tabla:
                      </label>
                      <input
                        type="text"
                        value={supabaseConfig.tableName}
                        onChange={(e) =>
                          setSupabaseConfig({ ...supabaseConfig, tableName: e.target.value })
                        }
                        className="w-full text-xs font-mono bg-background border border-border rounded-xl p-2.5 text-foreground focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        saveSupabaseConfig(supabaseConfig);
                        setSupabaseTestStatus({ loading: true });
                        const res = await SupabaseService.testConnection();
                        setSupabaseTestStatus({ loading: false, msg: res.message, success: res.success });
                      }}
                      className="flex-1 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                    >
                      {supabaseTestStatus.loading ? "Probando..." : "Guardar & Probar Conexión"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(SupabaseService.getSqlCreationScript());
                        alert("¡Código SQL copiado al portapapeles! Pégalo en el SQL Editor de Supabase y presiona 'Run'.");
                      }}
                      className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-medium inline-flex items-center justify-center gap-1.5"
                    >
                      <Copy className="h-3.5 w-3.5 text-sky-600" />
                      <span>Copiar SQL</span>
                    </button>
                  </div>

                  {supabaseTestStatus.msg && (
                    <div
                      className={`p-2.5 rounded-xl text-xs ${
                        supabaseTestStatus.success
                          ? "bg-emerald-50 text-emerald-900 border border-emerald-300"
                          : "bg-red-50 text-red-900 border border-red-300"
                      }`}
                    >
                      {supabaseTestStatus.msg}
                    </div>
                  )}
                </div>

              </div>

              {/* SECCIÓN 3: CONTROL DE SEGURIDAD ANTIFRAUDE & PIN DINÁMICO */}
              <div className="rounded-2xl border border-amber-300 bg-amber-50/40 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-amber-700" />
                    <div>
                      <h4 className="text-xs uppercase font-bold tracking-wider text-amber-900">
                        Seguridad Antifraude: Códigos Aleatorios de Mesa y PIN de Caja
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Evita que los clientes se aprendan el PIN o jueguen desde sus casas sin consumir.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tarjeta PIN de Caja */}
                  <div className="p-4 bg-background rounded-xl border border-border space-y-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      PIN de Validación en Caja (Activo):
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-2xl font-bold text-amber-600 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg">
                        {activePin}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newPin = generateNewCashierPin();
                          setActivePin(newPin);
                          alert(`¡Nuevo PIN de turno generado: ${newPin}! Compártelo solo con tus meseros o cajero.`);
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Generar Nuevo PIN</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Si sospechas que un comensal vio el PIN, presiona "Generar Nuevo PIN" para cambiarlo al instante.
                    </p>
                  </div>

                  {/* Tarjeta Tokens de Mesa */}
                  <div className="p-4 bg-background rounded-xl border border-border space-y-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Códigos Aleatorios por Hablador de Mesa:
                    </span>
                    <p className="text-xs text-foreground font-medium">
                      Cada mesa (Mesa 1 a 15) incluye un <strong>Token Aleatorio Único</strong> impreso en su QR.
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      El cliente debe estar físicamente en la mesa para escanear el QR con su código correspondiente. Puedes regenerar el código de cualquier mesa desde el modal de "Arte para Mesa".
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div className="bg-muted/40 p-4 px-6 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            Cerrar Panel
          </button>
        </div>
      </div>
    </div>
  );
}
