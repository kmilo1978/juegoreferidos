import { useState } from "react";
import { X, Printer, Sparkles, QrCode, ShieldCheck, RefreshCw } from "lucide-react";
import { clientConfig } from "../../config/clientConfig";
import { GoldenQRCode } from "./GoldenQRCode";
import { getTableSecurityToken, regenerateTableToken } from "../../lib/tableSecurityService";

interface TableStandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TableStandModal({ isOpen, onClose }: TableStandModalProps) {
  const [selectedTable, setSelectedTable] = useState<string>("1");
  const [locationType, setLocationType] = useState<"table" | "caja" | "domicilio">("table");
  const [tableToken, setTableToken] = useState<string>(() => getTableSecurityToken("1"));

  if (!isOpen) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.origin : "https://turestaurante.com";
  const tableQrUrl =
    locationType === "caja"
      ? `${currentUrl}?modo=caja`
      : locationType === "domicilio"
      ? `${currentUrl}?modo=domicilio`
      : `${currentUrl}?mesa=${selectedTable}&token=${tableToken}`;

  const handleTableChange = (newTable: string) => {
    setSelectedTable(newTable);
    setTableToken(getTableSecurityToken(newTable));
  };

  const handleRegenerateToken = () => {
    const newToken = regenerateTableToken(selectedTable);
    setTableToken(newToken);
  };

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
              Arte para Mesa, Caja o Domicilios
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

        {/* SELECTOR DE MESA, CAJA O DOMICILIOS (Oculto al imprimir) */}
        <div className="p-4 bg-muted/60 border-b border-border/80 space-y-2 print:hidden">
          <label className="text-[11px] font-semibold text-foreground block">
            📍 Selecciona la ubicación o destino de este código QR:
          </label>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <select
                value={locationType === "table" ? selectedTable : locationType}
                onChange={(e) => {
                  if (e.target.value === "caja") {
                    setLocationType("caja");
                  } else if (e.target.value === "domicilio") {
                    setLocationType("domicilio");
                  } else {
                    setLocationType("table");
                    handleTableChange(e.target.value);
                  }
                }}
                className="bg-card text-foreground border border-gold/40 text-xs rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <optgroup label="🛵 Empaques & Domicilios">
                  <option value="domicilio">🛵 Sticker para Caja / Domicilios</option>
                </optgroup>
                <optgroup label="Mesas del Restaurante">
                  {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={String(num)}>
                      Mesa {num}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Puntos de Pago / Caja">
                  <option value="caja">Punto de Pago / Caja Central</option>
                </optgroup>
              </select>

              {locationType === "table" && (
                <button
                  type="button"
                  onClick={handleRegenerateToken}
                  title="Generar nuevo código aleatorio para invalidar el anterior"
                  className="px-2.5 py-1.5 bg-background hover:bg-muted border border-border text-[11px] font-medium rounded-lg inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RefreshCw className="h-3 w-3 text-gold" />
                  <span>Nuevo Código #{tableToken}</span>
                </button>
              )}
            </div>

            <span className="text-[10px] text-muted-foreground">
              {locationType === "domicilio"
                ? "Sticker permanente para empaques y bolsas de delivery"
                : locationType === "caja"
                ? "QR especial para cobro en caja"
                : `QR con token #${tableToken} para Mesa ${selectedTable}`}
            </span>
          </div>
        </div>

        {/* CONTENIDO DE LA FICHA IMPRESA */}
        <div className="p-8 text-center bg-[#fcfaf7] space-y-5 print:p-12 print:bg-white">
          {/* Logo y Encabezado */}
          <div className="space-y-2">
            <img
              src={clientConfig.brand.logoUrl}
              alt={clientConfig.brand.name}
              className="h-14 w-auto mx-auto object-contain"
            />
            
            {/* DISTINTIVO DE MESA / CAJA / DOMICILIO */}
            <div className="flex flex-col items-center gap-1">
              <div className="inline-block px-3.5 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs font-bold uppercase tracking-widest">
                {locationType === "domicilio"
                  ? "🛵 EXPERIENCIA EN CASA / DOMICILIO"
                  : locationType === "caja"
                  ? "💳 PUNTO DE PAGO / CAJA"
                  : `🍽️ MESA ${selectedTable}`}
              </div>
              {locationType === "table" && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-[10px] font-mono font-bold">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  <span>CÓDIGO DE SEGURIDAD: #{tableToken}</span>
                </div>
              )}
            </div>

            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold">
              {locationType === "domicilio"
                ? "¡GRACIAS POR DISFRUTAR NUESTRA PASTELERÍA EN CASA!"
                : locationType === "caja"
                ? "BENEFICIO EXCLUSIVO EN TU FACTURA"
                : "EXPERIENCIA EXCLUSIVA EN TU MESA"}
            </p>
            <h2 className="font-display text-2xl text-foreground font-normal">
              {locationType === "domicilio" ? "¡Tu Pedido tiene Premio!" : "¡Gira la Ruleta & Gana!"}
            </h2>
            <p className="text-xs text-muted-foreground font-light max-w-xs mx-auto leading-relaxed">
              {locationType === "domicilio"
                ? "Escanea este código QR desde tu hogar para girar nuestra Ruleta y ganar un premio especial para tu próximo pedido o visita."
                : locationType === "caja"
                ? "Escanea este código al pagar para descubrir tu beneficio o descuento en tu cuenta."
                : `Acerca tu celular o escanea este código QR desde tu Mesa ${selectedTable} para descubrir tu beneficio de hoy.`}
            </p>
          </div>

          {/* Código QR Dorado Oficial */}
          <div className="flex flex-col items-center justify-center py-1">
            <GoldenQRCode value={tableQrUrl} size={210} />
            <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-gold font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {locationType === "domicilio"
                  ? "Sticker de Empaque · Compatible con Cámara"
                  : locationType === "caja"
                  ? "Escaneo en Caja"
                  : `Mesa ${selectedTable} · Compatible con NFC y Cámara`}
              </span>
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
              <span>{locationType === "domicilio" ? "En tu próximo pedido" : "En tu cuenta de hoy"}</span>
            </div>
          </div>
        </div>

        {/* Botones de Acción (Ocultos al imprimir) */}
        <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-between gap-3 print:hidden">
          <p className="text-[11px] text-muted-foreground font-light">
            {locationType === "domicilio"
              ? "Tamaño sugerido: Sticker adhesivo 8x8 cm o tarjeta 10x10 cm"
              : "Tamaño sugerido: Acrílico de mesa 10x15 cm"}
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
