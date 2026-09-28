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
} from "lucide-react";
import { calculateAnalytics } from "../../lib/analyticsService";

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
  const [activeTab, setActiveTab] = useState<"stats" | "prizes" | "campaign" | "messages">("stats");

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
              BLISS SOUL BAKERY · PANEL DE CONTROL
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
                        <th className="py-2.5 px-3">Mesa</th>
                        <th className="py-2.5 px-3">Cliente</th>
                        <th className="py-2.5 px-3">Premio</th>
                        <th className="py-2.5 px-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {history.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-muted-foreground italic">
                            No hay participaciones registradas en esta sesión aún.
                          </td>
                        </tr>
                      ) : (
                        history.map((h) => (
                          <tr key={h.uniqueCode} className="hover:bg-muted/20">
                            <td className="py-2.5 px-3 font-mono font-bold text-gold">
                              {h.uniqueCode}
                            </td>
                            <td className="py-2.5 px-3">{h.tableNumber}</td>
                            <td className="py-2.5 px-3 font-medium text-foreground">
                              {h.participantName}
                              <span className="block text-[10px] text-muted-foreground font-mono">
                                +{h.participantWhatsapp}
                              </span>
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
                      value="Juego de Mesa & Gratitud — Bliss Soul 2026"
                      className="w-full border rounded-lg p-2 bg-muted/40 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1">Instagram Oficial:</label>
                    <input
                      type="text"
                      readOnly
                      value="@blisssoulbakery"
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
