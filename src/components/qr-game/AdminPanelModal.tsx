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
} from "lucide-react";

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
              {/* Tarjetas resumen */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-border/80 bg-background p-4 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t("Participaciones", "Participants")}
                  </p>
                  <p className="font-display text-2xl sm:text-3xl text-foreground font-semibold mt-1">
                    {totalParticipants}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    100% con feedback
                  </span>
                </div>

                <div className="rounded-2xl border border-border/80 bg-background p-4 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t("Premios Entregados", "Prizes Won")}
                  </p>
                  <p className="font-display text-2xl sm:text-3xl text-gold font-semibold mt-1">
                    {totalParticipants}
                  </p>
                  <span className="text-[10px] text-gold font-medium">Código único emitido</span>
                </div>

                <div className="rounded-2xl border border-border/80 bg-background p-4 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t("Canjeados en Caja", "Redeemed at Till")}
                  </p>
                  <p className="font-display text-2xl sm:text-3xl text-foreground font-semibold mt-1">
                    {prizesUsed}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {prizesAvailable} disponibles
                  </span>
                </div>

                <div className="rounded-2xl border border-border/80 bg-background p-4 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t("Base Marketing", "Marketing Leads")}
                  </p>
                  <p className="font-display text-2xl sm:text-3xl text-emerald-600 font-semibold mt-1">
                    {totalParticipants}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    WhatsApp verificado
                  </span>
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
