import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import emblemaDorado from "@/assets/emblema-dorado.png";

interface GoldenQRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function GoldenQRCode({ value, size = 240, className = "" }: GoldenQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Generar código QR con tono Dorado Luxor y fondo blanco puro
    QRCode.toCanvas(
      canvas,
      value,
      {
        width: size,
        margin: 2,
        color: {
          dark: "#a27e2c", // Dorado Luxor de Bliss Soul
          light: "#ffffff",
        },
        errorCorrectionLevel: "H", // Alta tolerancia a errores para permitir el logo central
      },
      (err) => {
        if (err) {
          console.error("Error al generar código QR:", err);
          return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Cargar y estampar el isotipo oficial dorado en el centro
        const img = new Image();
        img.src = emblemaDorado;
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const logoSize = Math.round(size * 0.22);
          const x = (size - logoSize) / 2;
          const y = (size - logoSize) / 2;

          // Fondo circular blanco con borde dorado para aislar el isotipo
          ctx.save();
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, logoSize * 0.65, 0, 2 * Math.PI);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#a27e2c";
          ctx.stroke();
          ctx.restore();

          // Dibujar el emblema centrado
          ctx.drawImage(img, x, y, logoSize, logoSize);
        };
      },
    );
  }, [value, size]);

  return (
    <div
      className={`relative inline-flex items-center justify-center p-3 rounded-2xl bg-white border border-gold/40 shadow-[0_8px_30px_rgba(162,126,44,0.15)] ${className}`}
    >
      <canvas ref={canvasRef} className="block rounded-lg" />
    </div>
  );
}
