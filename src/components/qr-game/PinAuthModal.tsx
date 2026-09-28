import { useState } from "react";
import { Lock, Delete } from "lucide-react";

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
  correctPin = "1978",
}: PinAuthModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setError(false);

    if (nextPin.length === 4) {
      if (nextPin === correctPin) {
        onSuccess();
        onClose();
        setPin("");
      } else {
        setError(true);
        setTimeout(() => setPin(""), 600);
      }
    }
  };

  const handleDelete = () => setPin((prev) => prev.slice(0, -1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-xs rounded-3xl bg-neutral-900 border border-gold/40 p-6 text-center text-white shadow-2xl space-y-5">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/20 text-gold">
          <Lock className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
            Uso Exclusivo del Personal
          </h3>
          <p className="text-xs text-white/70 mt-1">
            Ingresa el PIN de 4 dígitos para validar el descuento:
          </p>
        </div>

        {/* Indicadores de 4 dígitos */}
        <div className="flex justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`h-4 w-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? "bg-gold border-gold scale-110 shadow-xs"
                  : error
                    ? "border-red-500 bg-red-500/20"
                    : "border-white/30 bg-transparent"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-[11px] text-red-400 font-medium">
            PIN incorrecto. Intenta de nuevo.
          </p>
        )}

        {/* Teclado numérico táctil */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="h-12 rounded-xl bg-white/10 hover:bg-gold hover:text-neutral-950 font-mono text-lg font-bold transition-all active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-white/70 transition-all font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleDigit("0")}
            className="h-12 rounded-xl bg-white/10 hover:bg-gold hover:text-neutral-950 font-mono text-lg font-bold transition-all active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-12 rounded-xl bg-white/5 hover:bg-red-500/20 text-white flex items-center justify-center transition-all"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
