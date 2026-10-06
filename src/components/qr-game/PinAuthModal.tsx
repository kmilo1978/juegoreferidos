import { useState } from "react";
import { Lock, Delete, KeyRound, X, Sparkles, Check } from "lucide-react";
import { verifyCashierPin, getActiveCashierPin } from "../../lib/tableSecurityService";

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
  const [activeShiftPin] = useState(() => getActiveCashierPin());

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
        setTimeout(() => {
          onSuccess();
          onClose();
          setPin("");
        }, 200);
      } else {
        setError(true);
        setTimeout(() => setPin(""), 600);
      }
    }
  };

  const handleDelete = () => setPin((prev) => prev.slice(0, -1));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0f0e12]/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-[#1c1b1f] border-t sm:border border-[#2b292e] p-6 shadow-2xl space-y-4">
        {/* Handle superior de arrastre móvil */}
        <div className="w-12 h-1 rounded-full bg-[#363439] mx-auto sm:hidden" />

        {/* Cabecera con Candado y botón Cerrar */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#684400]/40 border border-[var(--gold)]/40 flex items-center justify-center text-[var(--gold)] shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div className="flex flex-col text-left">
              <h3 className="font-headline-sm text-sm text-[#e6e1e7] font-bold">
                Uso Exclusivo Personal / Caja
              </h3>
              <p className="font-body-sm text-[11px] text-[#ccc3d8]">
                Ingresa el PIN autorizado para validar:
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#2b292e] flex items-center justify-center text-[#ccc3d8] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tarjeta de PIN Activo estilo Stitch */}
        <div className="w-full rounded-2xl bg-gradient-to-r from-[#684400]/30 via-[#201f23] to-[#2b292e] border border-[var(--gold)]/30 p-3.5 flex items-center justify-between shadow-[0_4px_24px_rgba(242,190,113,0.1)]">
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-[var(--gold)] animate-ping" />
              <span className="font-label-sm text-[10px] text-[var(--gold)] uppercase font-bold tracking-widest">
                PIN de Turno Activo
              </span>
            </div>
            <span className="font-headline-md text-2xl text-[var(--gold-light)] tracking-widest font-mono font-bold leading-none">
              {displayPin}
            </span>
            <span className="font-body-sm text-[10px] text-[#ccc3d8] mt-1">Caja Salón • Turno Activo</span>
          </div>

          <button
            type="button"
            onClick={() => handleAutoFill(displayPin)}
            className="h-9 px-3.5 rounded-full badge-gold font-label-md text-xs font-bold flex items-center gap-1 shadow-md hover:brightness-105 active:scale-95 transition-transform cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Usar PIN</span>
          </button>
        </div>

        {/* 4 Indicadores Circulares Luminosos */}
        <div className="flex flex-col items-center gap-1 py-1">
          <div className={`flex items-center justify-center gap-4 py-2 ${error ? "animate-shake" : ""}`}>
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                    isFilled
                      ? "bg-[var(--gold)] shadow-[0_0_12px_rgba(242,190,113,0.9)] scale-110"
                      : "bg-[#2b292e] border border-[#363439]"
                  }`}
                />
              );
            })}
          </div>
          <span className="font-label-sm text-[11px] text-[#ccc3d8]">
            {error ? "PIN incorrecto, intenta de nuevo" : `Ingresando dígito ${Math.min(pin.length + 1, 4)} de 4`}
          </span>
        </div>

        {/* Teclado Táctil Numérico 3x4 estilo Stitch */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-12 rounded-xl bg-[#201f23] hover:bg-[#2b292e] text-[#e6e1e7] font-bold text-lg border border-[#2b292e] shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleDelete}
            className="h-12 rounded-xl bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] flex items-center justify-center border border-[#2b292e] shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Delete className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => handleDigit("0")}
            className="h-12 rounded-xl bg-[#201f23] hover:bg-[#2b292e] text-[#e6e1e7] font-bold text-lg border border-[#2b292e] shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleAutoFill(displayPin)}
            className="h-12 rounded-xl bg-[#684400]/50 hover:bg-[#684400]/70 text-[var(--gold)] flex items-center justify-center font-bold text-xs border border-[var(--gold)]/40 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Check className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
