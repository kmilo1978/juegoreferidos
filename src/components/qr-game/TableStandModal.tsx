import { X, Printer, Sparkles, QrCode } from "lucide-react";
import { clientConfig } from "../../config/clientConfig";
import { GoldenQRCode } from "./GoldenQRCode";

interface TableStandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TableStandModal({ isOpen, onClose }: TableStandModalProps) {
  if (!isOpen) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.origin : "https://blissbarkery.andresduquelabs.com";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in print:p-0 print:bg-white">
      <div className="relative w-full max-w-md rounded-3xl bg-card border border-gold/40 shadow-2xl overflow-hidden my-8 print:border-none print:shadow-none print:my-0">
        {/* Cabecera del modal (Oculta al imprimir) */}
        <div className="bg-neutral-900 text-white p-4 flex items-center justify-between border-b border-gold/30 print:hidden">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-gold" />
            <span className="text-xs uppercase tracking-wider font-semibold text-gold">
              Arte para Mesa y Caja
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* CONTENIDO DE LA FICHA IMPRESA */}
        <div className="p-8 text-center bg-[#fcfaf7] space-y-6 print:p-12 print:bg-white">
          {/* Logo y Encabezado */}
          <div className="space-y-2">
            <img
              src={clientConfig.brand.logoUrl}
              alt={clientConfig.brand.name}
              className="h-14 w-auto mx-auto object-contain"
            />
            <p className="text-[11px] uppercase tracking-[0.24em] text-gold font-semibold">
              EXPERIENCIA EN MESA & CAJA
            </p>
            <h2 className="font-display text-2xl text-foreground font-normal">
              ¡Gira la Ruleta & Gana!
            </h2>
            <p className="text-xs text-muted-foreground font-light max-w-xs mx-auto leading-relaxed">
              Acerca tu celular o escanea este código QR antes de pagar para descubrir tu beneficio de hoy.
            </p>
          </div>

          {/* Código QR Dorado Oficial */}
          <div className="flex flex-col items-center justify-center py-2">
            <GoldenQRCode value={currentUrl} size={230} />
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gold font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Compatible con NFC y Cámara QR</span>
            </div>
          </div>

          {/* Pasos Rápidos para el Comensal */}
          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-gold/30 text-[10px] text-muted-foreground">
            <div>
              <span className="font-bold text-foreground block">1. Escanea</span>
              <span>Con tu celular</span>
            </div>
            <div>
              <span className="font-bold text-foreground block">2. Gira</span>
              <span>La ruleta dorada</span>
            </div>
            <div>
              <span className="font-bold text-foreground block">3. Redime</span>
              <span>En tu cuenta de hoy</span>
            </div>
          </div>
        </div>

        {/* Botones de Acción (Ocultos al imprimir) */}
        <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-between gap-3 print:hidden">
          <p className="text-[11px] text-muted-foreground font-light">
            Tamaño sugerido: Acrílico de mesa 10x15 cm
          </p>
          <button
            type="button"
            onClick={handlePrint}
            className="btn-solid inline-flex items-center gap-2 py-2 px-5 text-xs uppercase tracking-wider font-semibold shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Imprimir Ficha</span>
          </button>
        </div>
      </div>
    </div>
  );
}
