import { useState, useMemo } from "react";
import { COLOR_PALETTES, ColorPalette } from "@/lib/colorPalettes";
import {
  Search,
  Check,
  Copy,
  Sparkles,
  Sliders,
  Palette,
  Eye,
  Info,
} from "lucide-react";

interface ColorPaletteSelectorProps {
  currentPrimaryColor: string;
  onSelectPrimaryColor: (color: string) => void;
  onApplyPalette?: (palette: ColorPalette) => void;
}

export function ColorPaletteSelector({
  currentPrimaryColor,
  onSelectPrimaryColor,
  onApplyPalette,
}: ColorPaletteSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"catalog" | "custom">("catalog");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Paleta personalizada (5 colores)
  const [customColors, setCustomColors] = useState<[string, string, string, string, string]>([
    currentPrimaryColor || "#f2be71",
    "#ffddb1",
    "#e6e1e7",
    "#363439",
    "#141317",
  ]);

  // Paleta activa para previsualización
  const [previewPalette, setPreviewPalette] = useState<ColorPalette>(() => {
    const found = COLOR_PALETTES.find((p) => p.colors[0].toLowerCase() === (currentPrimaryColor || "").toLowerCase());
    return found || COLOR_PALETTES[0];
  });

  // Filtrado reactivo de paletas
  const filteredPalettes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return COLOR_PALETTES.filter((p) => {
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.categoryLabel.toLowerCase().includes(query) ||
        p.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        p.colors.some((hex) => hex.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopyHex = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2500);
  };

  const handleApplyPalette = (palette: ColorPalette) => {
    setPreviewPalette(palette);
    onSelectPrimaryColor(palette.colors[0]);
    if (onApplyPalette) {
      onApplyPalette(palette);
    }
  };

  const handleApplyCustomPalette = () => {
    const customPal: ColorPalette = {
      id: `custom_${Date.now()}`,
      name: "Combinación Personalizada",
      category: "popular",
      categoryLabel: "Personalizada",
      colors: customColors,
      tags: ["personalizada", "custom"],
    };
    setPreviewPalette(customPal);
    onSelectPrimaryColor(customColors[0]);
    if (onApplyPalette) {
      onApplyPalette(customPal);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. ENCABEZADO Y TABS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#363439] pb-4">
        <div>
          <h4 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2">
            <Palette className="w-4 h-4 text-[var(--gold)]" />
            <span>Biblioteca de Combinaciones de Color Armoniosas</span>
          </h4>
          <p className="text-xs text-[#ccc3d8]">
            Selecciona una paleta de 5 tonos coordinados para tu marca o crea tu propia combinación cromática.
          </p>
        </div>

        <div className="flex items-center bg-[#201f23] p-1 rounded-xl border border-[#363439] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "catalog"
                ? "bg-[var(--gold)] text-[#121115] shadow-xs"
                : "text-[#ccc3d8] hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Catálogo Curado ({COLOR_PALETTES.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "custom"
                ? "bg-[var(--gold)] text-[#121115] shadow-xs"
                : "text-[#ccc3d8] hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Personalizada</span>
          </button>
        </div>
      </div>

      {/* 2. PREVISUALIZADOR EN VIVO ESTILO STITCH */}
      <div className="bg-[#141317] border border-[#363439] rounded-2xl p-4 sm:p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3 border-b border-[#2b292e] pb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#ccc3d8] flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span>Previsualización en Vivo: {previewPalette.name}</span>
          </span>
          <span className="text-[10px] text-[var(--gold)] font-mono font-bold bg-[var(--gold)]/10 px-2.5 py-0.5 rounded-full border border-[var(--gold)]/30">
            {previewPalette.categoryLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Muestra de Franja de 5 Colores */}
          <div className="md:col-span-2 space-y-2">
            <div className="h-14 w-full rounded-xl overflow-hidden flex shadow-lg border border-[#363439]">
              {previewPalette.colors.map((color, idx) => (
                <div
                  key={idx}
                  onClick={(e) => handleCopyHex(color, e)}
                  style={{ backgroundColor: color }}
                  className="flex-1 h-full relative group cursor-pointer transition-transform hover:scale-y-105 flex items-center justify-center"
                  title={`Clic para copiar ${color}`}
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white font-mono text-[10px] px-1.5 py-0.5 rounded shadow">
                    {color}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#ccc3d8] px-1">
              <span>Color 1: Acento Principal</span>
              <span>Color 2: Secundario</span>
              <span>Color 3: Contraste</span>
              <span>Color 4: Tono Medio</span>
              <span>Color 5: Base / Fondo</span>
            </div>
          </div>

          {/* Mini Maqueta de Botón y Badge */}
          <div
            className="p-4 rounded-xl border flex flex-col gap-2.5 items-center justify-center text-center shadow-inner"
            style={{ backgroundColor: previewPalette.colors[4], borderColor: previewPalette.colors[3] }}
          >
            <span
              className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${previewPalette.colors[0]}25`,
                color: previewPalette.colors[0],
                borderColor: `${previewPalette.colors[0]}50`,
              }}
            >
              ★ Beneficio de Mesa
            </span>
            <button
              type="button"
              className="w-full py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 cursor-default"
              style={{
                backgroundColor: previewPalette.colors[0],
                color: previewPalette.colors[4],
              }}
            >
              Girar Ruleta de Premios
            </button>
            <span className="text-[10px] italic" style={{ color: previewPalette.colors[2] }}>
              Experiencia comensal con armonía cromática
            </span>
          </div>
        </div>
      </div>

      {copiedHex && (
        <div className="text-xs text-[#10b981] bg-[#0d2e1f] border border-[#10b981]/50 px-3 py-1.5 rounded-xl flex items-center gap-2 animate-fade-in">
          <Check className="w-3.5 h-3.5" />
          <span>¡Código {copiedHex} copiado al portapapeles!</span>
        </div>
      )}

      {/* 3. PESTAÑA: CATÁLOGO DE PALETAS */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          {/* Barra de búsqueda y categorías inspirada en la imagen */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#ccc3d8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar colores, estados de ánimo, temas (ej: café, vino, oro, pastel, neón)..."
                className="bg-[#201f23] border border-[#363439] focus:border-[var(--gold)]/60 focus:outline-none text-[#e6e1e7] rounded-xl pl-10 pr-4 py-2.5 w-full text-xs placeholder:text-[#ccc3d8]/60"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#201f23] border border-[#363439] focus:border-[var(--gold)]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-2.5 text-xs shrink-0 cursor-pointer font-semibold"
            >
              <option value="all">Todas las categorías ({COLOR_PALETTES.length})</option>
              <option value="popular">Más Populares & Lujo</option>
              <option value="cafe">Cafetería & Bakery</option>
              <option value="vino">Restaurantes & Vino</option>
              <option value="gourmet">Bistró & Gourmet</option>
              <option value="vibrante">Moderno & Vibrante</option>
              <option value="pastel">Boutique & Dulce</option>
              <option value="noche">Cócteles & Noche</option>
            </select>
          </div>

          {/* Grilla de Paletas inspirada en la imagen del usuario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPalettes.map((palette) => {
              const isSelected =
                currentPrimaryColor.toLowerCase() === palette.colors[0].toLowerCase();

              return (
                <div
                  key={palette.id}
                  onClick={() => setPreviewPalette(palette)}
                  className={`bg-[#201f23] border rounded-2xl p-4 transition-all duration-200 cursor-pointer hover:border-[var(--gold)]/60 hover:shadow-lg space-y-3 ${
                    isSelected
                      ? "border-[var(--gold)] ring-1 ring-[var(--gold)]/40 bg-[#252220]"
                      : "border-[#363439]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-[#e6e1e7]">{palette.name}</h5>
                      <span className="text-[10px] text-[#ccc3d8]">{palette.categoryLabel}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#121115] bg-[var(--gold)] px-2.5 py-0.5 rounded-full shadow-xs">
                          <Check className="w-3 h-3" />
                          <span>Activa</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyPalette(palette);
                          }}
                          className="text-[11px] font-semibold text-[var(--gold)] hover:text-[var(--gold-light)] hover:underline cursor-pointer px-2 py-0.5 rounded"
                        >
                          Aplicar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Franja de 5 colores con tooltips y copia */}
                  <div className="h-10 w-full rounded-xl overflow-hidden flex border border-[#363439]/80 shadow-inner">
                    {palette.colors.map((color, idx) => (
                      <div
                        key={idx}
                        onClick={(e) => handleCopyHex(color, e)}
                        style={{ backgroundColor: color }}
                        className="flex-1 h-full relative group transition-transform hover:opacity-90 flex items-center justify-center cursor-pointer"
                        title={`Clic para copiar ${color}`}
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/85 text-white font-mono text-[9px] px-1 py-0.5 rounded">
                          {color}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#ccc3d8]/80 font-mono">
                    <span>{palette.colors[0]}</span>
                    <span>{palette.colors[1]}</span>
                    <span>{palette.colors[2]}</span>
                    <span>{palette.colors[3]}</span>
                    <span>{palette.colors[4]}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPalettes.length === 0 && (
            <div className="text-center py-8 text-[#ccc3d8] text-xs bg-[#201f23]/50 rounded-2xl border border-dashed border-[#363439]">
              No se encontraron paletas para "{searchQuery}". Intenta con palabras como "café", "vino", "oro" o "rosa".
            </div>
          )}
        </div>
      )}

      {/* 4. PESTAÑA: PERSONALIZAR 5 COLORES */}
      {activeTab === "custom" && (
        <div className="bg-[#201f23] border border-[#363439] rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-[#363439]/60 pb-3">
            <div>
              <h5 className="text-xs font-bold text-[#e6e1e7]">Crea tu Combinación de 5 Colores</h5>
              <p className="text-[11px] text-[#ccc3d8]">
                Ajusta cada tono para que se adapte exactamente a la identidad gráfica de tu local.
              </p>
            </div>
            <button
              type="button"
              onClick={handleApplyCustomPalette}
              className="bg-[var(--gold)] text-[#121115] font-bold px-4 py-2 rounded-xl text-xs hover:brightness-105 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Aplicar Mi Combinación</span>
            </button>
          </div>

          {/* 5 Selectores */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              { label: "1. Acento Principal", idx: 0 },
              { label: "2. Secundario", idx: 1 },
              { label: "3. Contraste / Texto", idx: 2 },
              { label: "4. Tono Medio", idx: 3 },
              { label: "5. Base / Fondo", idx: 4 },
            ].map(({ label, idx }) => (
              <div key={idx} className="bg-[#1c1b1f] border border-[#363439] rounded-xl p-3 space-y-2">
                <span className="text-[10px] font-semibold text-[#ccc3d8] block">{label}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customColors[idx]}
                    onChange={(e) => {
                      const next = [...customColors] as [string, string, string, string, string];
                      next[idx] = e.target.value;
                      setCustomColors(next);
                    }}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 shrink-0"
                  />
                  <input
                    type="text"
                    value={customColors[idx]}
                    onChange={(e) => {
                      const next = [...customColors] as [string, string, string, string, string];
                      next[idx] = e.target.value;
                      setCustomColors(next);
                    }}
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] font-mono text-[10px] rounded px-2 py-1 w-full"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Franja resultante */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-[#ccc3d8]">Resultado de tu Mezcla:</span>
            <div className="h-12 w-full rounded-xl overflow-hidden flex border border-[#363439] shadow-inner">
              {customColors.map((c, i) => (
                <div
                  key={i}
                  style={{ backgroundColor: c }}
                  className="flex-1 h-full flex items-center justify-center font-mono text-[9px] text-white/90 drop-shadow"
                >
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
