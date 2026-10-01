import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle, Info, ExternalLink } from "lucide-react";

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  recommendedDimensions: string;
  aspectRatio: string;
  maxWeight: string;
  formats?: string;
  placeholder?: string;
  previewHeight?: string;
  description?: string;
}

export function ImageUploader({
  label,
  value,
  onChange,
  recommendedDimensions,
  aspectRatio,
  maxWeight,
  formats = "PNG transparente, WebP o JPG",
  placeholder = "https://... o sube una imagen de tu equipo",
  previewHeight = "h-24",
  description,
}: ImageUploaderProps) {
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileNotice, setFileNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Medir peso del archivo
    const sizeKb = Math.round(file.size / 1024);
    if (sizeKb > 2048) {
      setFileError(`El archivo pesa ${sizeKb} KB (más de 2 MB). Por favor comprímelo para evitar demoras de carga.`);
      return;
    }

    setFileError(null);
    setFileNotice(`Archivo cargado: ${file.name} (${sizeKb} KB)`);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        onChange(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange("");
    setFileError(null);
    setFileNotice(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3 bg-[#19181c] border border-[#2b292e] p-4 rounded-2xl">
      {/* Etiqueta y descripción */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#e6e1e7] uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#f2be71]" />
          <span>{label}</span>
        </label>
        {value && (
          <span className="text-[10px] text-[#10b981] font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Imagen Asignada
          </span>
        )}
      </div>

      {description && <p className="text-xs text-[#ccc3d8] leading-relaxed">{description}</p>}

      {/* Tarjeta de Especificaciones Sugeridas */}
      <div className="bg-[#141317] border border-[#363439] rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#958da1] block">📏 Tamaño Sugerido</span>
          <span className="text-xs font-bold text-[#f2be71]">{recommendedDimensions}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-[#958da1] block">📐 Proporción</span>
          <span className="text-xs font-bold text-[#ccc3d8]">{aspectRatio}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-[#958da1] block">⚖️ Peso Sugerido</span>
          <span className="text-xs font-bold text-[#34d399]">{maxWeight}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-[#958da1] block">🖼️ Formato</span>
          <span className="text-xs font-bold text-[#d1bcff] truncate block" title={formats}>
            {formats}
          </span>
        </div>
      </div>

      {/* Vista Previa Si Hay Imagen Cargada */}
      {value ? (
        <div className="flex items-center gap-4 bg-[#201f23] border border-[#363439] p-3 rounded-xl">
          <div className={`relative ${previewHeight} w-36 bg-[#141317] rounded-lg border border-[#2b292e] flex items-center justify-center p-2 overflow-hidden shrink-0`}>
            <img src={value} alt="Vista previa" className="max-h-full max-w-full object-contain" />
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <span className="text-xs font-bold text-[#e6e1e7] block truncate">
              {value.startsWith("data:") ? "Imagen cargada en Base64" : value}
            </span>
            {fileNotice && <span className="text-[11px] text-[#34d399] block font-mono">{fileNotice}</span>}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#2b292e] hover:bg-[#363439] text-[#f2be71] text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Reemplazar</span>
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="bg-[#2b1f20] hover:bg-[#3d2426] text-[#ff8f80] text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Quitar</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Zona para Subir Archivo o Escribir URL */
        <div className="space-y-2.5">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#363439] hover:border-[#f2be71]/60 bg-[#141317]/60 hover:bg-[#201f23] rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-full bg-[#201f23] group-hover:bg-[#2b292e] flex items-center justify-center text-[#f2be71] transition-colors">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#e6e1e7] block group-hover:text-[#f2be71] transition-colors">
                Haz clic aquí para seleccionar imagen desde tu equipo
              </span>
              <span className="text-[11px] text-[#958da1]">Soporta PNG, WebP o JPG ({maxWeight})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#958da1] uppercase font-bold shrink-0">O pega URL:</span>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="bg-[#141317] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs font-mono"
            />
          </div>
        </div>
      )}

      {/* Input de archivo nativo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {fileError && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 text-xs px-3 py-2 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{fileError}</span>
        </div>
      )}
    </div>
  );
}
