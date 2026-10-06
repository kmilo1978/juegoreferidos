import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUp,
  ArrowDown,
  Power,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Smartphone,
  Eye,
  ListOrdered,
  Sparkles,
  Gamepad2,
  Users,
  Gift,
  Star,
  Share2,
  Award,
  Target,
} from "lucide-react";
import {
  FunnelSequenceService,
  FunnelStepItem,
} from "@/lib/funnelSequenceService";

const ICON_MAP: Record<string, any> = {
  Users,
  Sparkles,
  Gamepad2,
  Gift,
  Star,
  Share2,
  Award,
  Target,
};

export function GameSequenceManager() {
  const [steps, setSteps] = useState<FunnelStepItem[]>(() =>
    FunnelSequenceService.getSequence()
  );
  const [success, setSuccess] = useState<string | null>(null);

  const handleMoveUp = (index: number) => {
    const updated = FunnelSequenceService.moveUp(index, steps);
    setSteps(updated);
    showNotice(`✓ Movido hacia arriba: ${steps[index].name}`);
  };

  const handleMoveDown = (index: number) => {
    const updated = FunnelSequenceService.moveDown(index, steps);
    setSteps(updated);
    showNotice(`✓ Movido hacia abajo: ${steps[index].name}`);
  };

  const handleToggle = (id: string) => {
    const updated = FunnelSequenceService.toggleStep(id, steps);
    setSteps(updated);
    const target = steps.find((s) => s.id === id);
    showNotice(`✓ Estado actualizado para: ${target?.name}`);
  };

  const handleReset = () => {
    const defaultSeq = FunnelSequenceService.resetDefault();
    setSteps(defaultSeq);
    showNotice("✓ Secuencia restablecida al orden estándar de 8 pasos.");
  };

  const showNotice = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const activeStepsCount = steps.filter((s) => s.enabled).length;

  return (
    <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg space-y-5">
      {/* Encabezado del Gestor */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#2b292e] pb-4">
        <div>
          <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-[var(--gold)]" />
            <span>Gestor de Secuencia del Embudo & Dinámicas de Juego</span>
          </h3>
          <p className="text-xs text-[#ccc3d8]">
            Elige el orden exacto en que los comensales viven la experiencia. Activa o desactiva pasos y muévelos de posición usando las flechas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] hover:text-white border border-[#363439] text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            title="Restablecer orden inicial recomendado"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span>Orden Inicial</span>
          </button>

          <Link
            to="/demo"
            className="bg-[var(--gold)] hover:brightness-105 active:scale-98 text-[#121115] text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Probar en Simulador ({activeStepsCount} Pasos)</span>
          </Link>
        </div>
      </div>

      {success && (
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Lista Reordenable de Pasos */}
      <div className="space-y-2.5">
        {steps.map((step, index) => {
          const Icon = ICON_MAP[step.iconName] || Gamepad2;
          const isFirst = index === 0;
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.id}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                step.enabled
                  ? "bg-[#201f23] border-[#363439] hover:border-[var(--gold)]/40"
                  : "bg-[#161519] border-[#2b292e] opacity-60"
              }`}
            >
              {/* Lado Izquierdo: Número, Icono, Nombre y Descripción */}
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Posición en la Secuencia */}
                <div className="w-7 h-7 rounded-lg bg-[#2b292e] border border-[#3f3d45] flex items-center justify-center text-xs font-mono font-bold text-[var(--gold)] shrink-0">
                  {index + 1}
                </div>

                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    step.enabled
                      ? "bg-[var(--gold)]/10 border-[var(--gold)]/30 text-[var(--gold)]"
                      : "bg-[#2b292e] border-[#363439] text-[#958da1]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-[#e6e1e7] truncate">
                      {step.name}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#2b292e] text-[#ccc3d8]">
                      {step.shortLabel}
                    </span>
                    {!step.enabled && (
                      <span className="text-[10px] font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#ccc3d8] truncate max-w-md sm:max-w-xl">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Lado Derecho: Controles de Posición (Subir/Bajar) y Toggle */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2b292e]">
                {/* Botón Subir */}
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={isFirst}
                  className="w-8 h-8 rounded-lg bg-[#2b292e] hover:bg-[#363439] disabled:opacity-30 disabled:hover:bg-[#2b292e] text-[#ccc3d8] hover:text-[var(--gold)] border border-[#3f3d45] flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                  title="Mover hacia arriba en la secuencia"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                {/* Botón Bajar */}
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={isLast}
                  className="w-8 h-8 rounded-lg bg-[#2b292e] hover:bg-[#363439] disabled:opacity-30 disabled:hover:bg-[#2b292e] text-[#ccc3d8] hover:text-[var(--gold)] border border-[#3f3d45] flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                  title="Mover hacia abajo en la secuencia"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Switch Activo / Desactivado */}
                {step.canDisable !== false ? (
                  <button
                    type="button"
                    onClick={() => handleToggle(step.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ml-2 ${
                      step.enabled
                        ? "bg-[#0d2e1f] text-[#10b981] border border-[#10b981]/40 hover:bg-[#10b981]/20"
                        : "bg-[#2b292e] text-[#958da1] border border-[#363439] hover:text-white"
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{step.enabled ? "Activo" : "Inactivo"}</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-[var(--gold)] bg-[var(--gold)]/10 px-2.5 py-1 rounded-lg border border-[var(--gold)]/30 font-semibold ml-2">
                    Obligatorio
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
