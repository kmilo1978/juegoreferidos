import { useState } from "react";
import { Lock, Delete, RefreshCw, KeyRound } from "lucide-react";
import { verifyCashierPin, getActiveCashierPin, generateNewCashierPin } from "../../lib/tableSecurityService";

interface PinAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin?: string;
}

export function PinAuthModal({
  isOpen,
  onClose,
  onSuccess,
  correctPin,
}: PinAuthModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [activeShiftPin, setActiveShiftPin] = useState(() => getActiveCashierPin());

  if (!isOpen) return null;

  const displayPin = correctPin || activeShiftPin || "1978";

  const handleAutoFill = (fillPin: string) => {
    setPin(fillPin);
    setError(false);
    if (verifyCashierPin(fillPin)) {
      setTimeout(() => {
        onSuccess();
        onClose();
        setPin("");
      }, 250);
    }
  };

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setError(false);

    if (nextPin.length === 4) {
      if (verifyCashierPin(nextPin)) {
        onSuccess();
        onClose();
        setPin("");
      } else {
        setError(true);
        setTimeout(() => setPin(""), 600);
      }
    }
  };

  const handleRotatePin = () => {
    const newPin = generateNewCashierPin();
    setActiveShiftPin(newPin);
  };

  const handleDelete = () => setPin((prev) => prev.slice(0, -1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border-2 border-amber-500/40 p-6 text-center text-white shadow-2xl space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
          <Lock className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
            Uso Exclusivo del Personal / Caja
          </h3>
          <p className="text-xs text-white/70 mt-1">
            Valida el premio del cliente ingresando el PIN autorizado:
          </p>
        </div>

        {/* TARJETA VISIBLE DESTACADA CON EL PIN DE AUTORIZACIÓN */}
        <div className="bg-amber-500/15 border-2 border-amber-500/40 rounded-2xl p-3.5 my-2 shadow-inner">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            <KeyRound className="h-4 w-4 text-amber-400" />
            <span>PIN de Validación</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-3xl font-black text-white tracking-[0.25em] bg-black/60 px-4 py-1.5 rounded-xl border border-amber-500/40 shadow-sm">
              {displayPin}
            </span>
            <button
              type="button"
              onClick={() => handleAutoFill(displayPin)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <span>⚡ Usar PIN</span>
            </button>
          </div>
          <p className="text-[11px] text-white/70 mt-2 font-medium">
            Toca <strong className="text-amber-300">⚡ Usar PIN</strong> o digita los 4 números en el teclado:
          </p>
        </div>

        {/* Indicadores de 4 dígitos */}
        <div className="flex justify-center gap-3 py-1">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`h-4 w-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? "bg-amber-400 border-amber-400 scale-110 shadow-xs"
                  : error
                    ? "border-red-500 bg-red-500/20"
                    : "border-white/30 bg-transparent"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-[11px] text-red-400 font-medium">
            PIN incorrecto. Intenta con {displayPin}.
          </p>
        )}

        {/* Teclado numérico táctil */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="h-11 rounded-xl bg-white/10 hover:bg-amber-400 hover:text-neutral-950 font-mono text-lg font-bold transition-all active:scale-95 cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-white/70 transition-all font-medium cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleDigit("0")}
            className="h-11 rounded-xl bg-white/10 hover:bg-amber-400 hover:text-neutral-950 font-mono text-lg font-bold transition-all active:scale-95 cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-11 rounded-xl bg-white/5 hover:bg-red-500/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>

        {/* Herramienta de rotación de PIN para el personal */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
          <button
            type="button"
            onClick={handleRotatePin}
            className="hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Rotar PIN ({activeShiftPin})</span>
          </button>
          <span className="font-mono text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">
            Cajero: {activeShiftPin}
          </span>
        </div>
      </div>
    </div>
  );
}
