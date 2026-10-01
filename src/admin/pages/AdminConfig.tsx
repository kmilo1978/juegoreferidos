import { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  Save,
  Palette,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Type,
  ExternalLink,
  RotateCcw,
  Check,
  Search,
} from "lucide-react";
import { ImageUploader } from "../components/ImageUploader";
import {
  CURATED_GOOGLE_FONTS_HEADING,
  CURATED_GOOGLE_FONTS_BODY,
  loadGoogleFont,
  applyBrandFonts,
  parseFontInput,
  GoogleFontOption,
} from "../../lib/fontLoader";
import { getBrandConfig, saveBrandConfig } from "../../lib/brandService";

export function AdminConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados de Marca
  const [brandName, setBrandName] = useState("Tu Restaurante & Café");
  const [tagline, setTagline] = useState("Sabores inolvidables, momentos que alegran el día.");
  const [taglineEn, setTaglineEn] = useState("Unforgettable flavors, moments that brighten your day.");
  const [logoUrl, setLogoUrl] = useState("/src/assets/logo-header.png");
  const [primaryColor, setPrimaryColor] = useState("#f2be71");
  const [currency, setCurrency] = useState("COP");

  // Estados de Google Fonts
  const [fontHeading, setFontHeading] = useState("Epilogue");
  const [fontBody, setFontBody] = useState("Manrope");
  const [customHeadingInput, setCustomHeadingInput] = useState("");
  const [customBodyInput, setCustomBodyInput] = useState("");
  const [fontCategoryFilter, setFontCategoryFilter] = useState<string>("all");
  const [activeFontTab, setActiveFontTab] = useState<"curated" | "custom">("curated");
  const [fontTestMessage, setFontTestMessage] = useState<string | null>(null);

  // Premios de la Ruleta (100% dinámicos)
  const [prizes, setPrizes] = useState<any[]>([]);

  const colorPresets = [
    { name: "Oro Imperial", hex: "#f2be71" },
    { name: "Verde Esmeralda", hex: "#10b981" },
    { name: "Rojo Pasión", hex: "#e11d48" },
    { name: "Café Gourmet", hex: "#d97706" },
    { name: "Azul Zafiro", hex: "#3b82f6" },
    { name: "Púrpura Luxury", hex: "#8b5cf6" },
  ];

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/config");
      if (!res.ok) throw new Error("Error al cargar configuración de marca");
      const data = await res.json();

      if (data.settings?.brand) {
        setBrandName(data.settings.brand.name || "Tu Negocio");
        setTagline(data.settings.brand.tagline || "");
        setTaglineEn(data.settings.brand.taglineEn || "");
        setLogoUrl(data.settings.brand.logoUrl || "");
        setPrimaryColor(data.settings.brand.primaryColor || "#f2be71");
        setCurrency(data.settings.brand.currency || "COP");

        const hFont = data.settings.brand.fontHeading || "Epilogue";
        const bFont = data.settings.brand.fontBody || "Manrope";
        setFontHeading(hFont);
        setFontBody(bFont);
        if (data.settings.brand.fontHeadingCustom) setCustomHeadingInput(data.settings.brand.fontHeadingCustom);
        if (data.settings.brand.fontBodyCustom) setCustomBodyInput(data.settings.brand.fontBodyCustom);
        applyBrandFonts(hFont, bFont);
      }

      if (data.settings?.prizes && Array.isArray(data.settings.prizes)) {
        setPrizes(data.settings.prizes);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cargar dinámicamente las fuentes seleccionadas en tiempo real
  useEffect(() => {
    if (fontHeading) {
      loadGoogleFont(fontHeading, true);
    }
  }, [fontHeading]);

  useEffect(() => {
    if (fontBody) {
      loadGoogleFont(fontBody, false);
    }
  }, [fontBody]);

  // Precargar fuentes del catálogo curado para que se vean estilizadas
  useEffect(() => {
    CURATED_GOOGLE_FONTS_HEADING.forEach((f) => {
      loadGoogleFont(f.name, true);
    });
  }, []);

  // Probar fuente personalizada de títulos
  const handleTestCustomHeading = () => {
    const clean = parseFontInput(customHeadingInput);
    if (!clean) {
      setFontTestMessage("⚠️ Ingresa un nombre o enlace válido de Google Fonts");
      setTimeout(() => setFontTestMessage(null), 3500);
      return;
    }
    setFontHeading(clean);
    loadGoogleFont(clean, true);
    setFontTestMessage(`✓ Fuente de título "${clean}" cargada y aplicada.`);
    setTimeout(() => setFontTestMessage(null), 3500);
  };

  // Probar fuente personalizada de texto/cuerpo
  const handleTestCustomBody = () => {
    const clean = parseFontInput(customBodyInput);
    if (!clean) {
      setFontTestMessage("⚠️ Ingresa un nombre o enlace válido de Google Fonts");
      setTimeout(() => setFontTestMessage(null), 3500);
      return;
    }
    setFontBody(clean);
    loadGoogleFont(clean, false);
    setFontTestMessage(`✓ Fuente de texto "${clean}" cargada y aplicada.`);
    setTimeout(() => setFontTestMessage(null), 3500);
  };

  // Restablecer tipografías por defecto
  const handleResetFonts = () => {
    setFontHeading("Epilogue");
    setFontBody("Manrope");
    setCustomHeadingInput("");
    setCustomBodyInput("");
    applyBrandFonts("Epilogue", "Manrope");
    setFontTestMessage("✓ Tipografías restablecidas a las originales (Epilogue + Manrope)");
    setTimeout(() => setFontTestMessage(null), 3000);
  };

  // Suma de probabilidades
  const totalProbability = useMemo(() => {
    return prizes.reduce((acc, p) => acc + (Number(p.probability) || 0), 0);
  }, [prizes]);

  // Agregar nuevo premio a la ruleta
  const handleAddPrize = () => {
    const newPrize = {
      id: `p_${Date.now()}`,
      name: "Nuevo Premio Especial",
      value: "Especial",
      probability: 10,
      color: primaryColor,
      active: true,
    };
    setPrizes([...prizes, newPrize]);
  };

  // Eliminar premio
  const handleDeletePrize = (id: string) => {
    if (prizes.length <= 2) {
      alert("La ruleta requiere al menos 2 premios para funcionar.");
      return;
    }
    setPrizes(prizes.filter((p) => p.id !== id));
  };

  // Guardar en Backend
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalProbability !== 100) {
      if (!window.confirm(`La suma de probabilidades es ${totalProbability}%, no 100%. ¿Deseas guardar de todas formas?`)) {
        return;
      }
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("http://localhost:3001/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: {
            name: brandName,
            tagline,
            taglineEn,
            logoUrl,
            primaryColor,
            currency,
            fontHeading,
            fontBody,
            fontHeadingCustom: customHeadingInput,
            fontBodyCustom: customBodyInput,
          },
          prizes,
        }),
      });

      if (!res.ok) throw new Error("Error al guardar marca y ruleta");

      // Sincronizar también en localStorage local
      const currentBrand = getBrandConfig();
      saveBrandConfig({
        ...currentBrand,
        name: brandName,
        tagline,
        taglineEn,
        logoUrl,
        primaryColor,
        currency,
        fontHeading,
        fontBody,
        fontHeadingCustom: customHeadingInput,
        fontBodyCustom: customBodyInput,
      });

      setSuccess("Identidad de marca, tipografías de Google y premios guardados correctamente");
      setTimeout(() => setSuccess(null), 3000);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#f2be71] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue']">Identidad de Marca & Personalización</h2>
          <p className="text-sm text-[#ccc3d8]">Configura tu negocio: cambia logotipos, colores, eslogan y los premios de la ruleta de mesa.</p>
        </div>

        <button
          type="button"
          onClick={handleSaveBrand}
          disabled={saving}
          className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-6 py-3 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 text-sm shrink-0 shadow-lg"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Guardar Cambios de Marca</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA Y CENTRAL (2 COLS): FORMULARIO DE MARCA */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tarjeta de Identidad */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2 border-b border-[#363439] pb-3">
              <Sparkles className="w-4 h-4 text-[#f2be71]" />
              <span>Datos del Negocio (Marca Blanca)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1">
                  Nombre Comercial del Negocio
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Ej: La Trattoria Gourmet"
                  className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1">
                  Eslogan Principal (Español)
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Ej: Experiencias que alegran el día"
                  className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1">
                  Eslogan Secundario (Inglés / Opcional)
                </label>
                <input
                  type="text"
                  value={taglineEn}
                  onChange={(e) => setTaglineEn(e.target.value)}
                  placeholder="Ej: Unforgettable flavors"
                  className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <ImageUploader
                  label="Logotipo Principal del Negocio"
                  value={logoUrl}
                  onChange={setLogoUrl}
                  recommendedDimensions="512 x 512 px (Cuadrado) o 450 x 150 px"
                  aspectRatio="1:1 cuadrado o 3:1 horizontal"
                  maxWeight="Menor a 300 KB"
                  formats="PNG con fondo transparente, SVG o WebP"
                  description="Logotipo principal que se mostrará en la barra superior móvil, tarjetas de mesas y tickets de comensales."
                  placeholder="Pega URL o sube una imagen desde tu equipo"
                  previewHeight="h-16"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1">
                  Moneda Local
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-mono"
                >
                  <option value="COP">COP ($ Pesos Colombianos)</option>
                  <option value="USD">USD ($ Dólares)</option>
                  <option value="MXN">MXN ($ Pesos Mexicanos)</option>
                  <option value="EUR">EUR (€ Euros)</option>
                  <option value="PEN">PEN (S/. Soles Peruanos)</option>
                  <option value="CLP">CLP ($ Pesos Chilenos)</option>
                </select>
              </div>
            </div>

            {/* Selector de Color de Marca */}
            <div className="pt-3 border-t border-[#363439]/60 space-y-3">
              <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block flex items-center justify-between">
                <span>Color Principal de Marca (Botones y Acentos)</span>
                <span className="font-mono text-[#f2be71]">{primaryColor}</span>
              </label>

              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                />

                <div className="flex gap-2 flex-wrap">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setPrimaryColor(preset.hex)}
                      className="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      style={{
                        backgroundColor: primaryColor === preset.hex ? preset.hex : "#201f23",
                        color: primaryColor === preset.hex ? "#121115" : "#e6e1e7",
                        borderColor: primaryColor === preset.hex ? preset.hex : "#363439",
                      }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.hex }} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Tipografía & Google Fonts (Personalización de Letras) */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-5 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#363439] pb-3 gap-2">
              <div>
                <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
                  <Type className="w-4 h-4 text-[#f2be71]" />
                  <span>Tipografía & Google Fonts (Personalización de Textos)</span>
                </h3>
                <p className="text-xs text-[#ccc3d8]">
                  Personaliza los tipos de letra de tu negocio. Elige entre estilos gastronómicos recomendados o agrega cualquier fuente de Google Fonts.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetFonts}
                className="text-xs text-[#ccc3d8] hover:text-[#f2be71] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                title="Volver a Epilogue y Manrope"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer por Defecto</span>
              </button>
            </div>

            {/* Pestañas: Catálogo Curado vs Fuente Personalizada */}
            <div className="flex items-center gap-2 border-b border-[#363439]/60 pb-3">
              <button
                type="button"
                onClick={() => setActiveFontTab("curated")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFontTab === "curated"
                    ? "bg-[#f2be71] text-[#121115]"
                    : "bg-[#201f23] text-[#ccc3d8] hover:text-white"
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Catálogo Gastronómico Recomendado</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFontTab("custom")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFontTab === "custom"
                    ? "bg-[#f2be71] text-[#121115]"
                    : "bg-[#201f23] text-[#ccc3d8] hover:text-white"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Agregar Cualquier Google Font</span>
              </button>
            </div>

            {/* Mensaje de feedback de prueba de fuente */}
            {fontTestMessage && (
              <div className="bg-[#201f23] border border-[#f2be71]/40 text-[#f2be71] px-3 py-2 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{fontTestMessage}</span>
              </div>
            )}

            {/* CONTENIDO PESTAÑA 1: CATÁLOGO CURADO */}
            {activeFontTab === "curated" && (
              <div className="space-y-4">
                {/* Filtro de estilo */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-[#958da1] font-semibold">Filtrar por estilo:</span>
                  {[
                    { id: "all", label: "Todas" },
                    { id: "Elegante / Bistró", label: "👑 Elegante / Bistró" },
                    { id: "Moderna / Nítida", label: "✨ Moderna / Nítida" },
                    { id: "Artesanal / Expresiva", label: "🥖 Artesanal / Expresiva" },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setFontCategoryFilter(filter.id)}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        fontCategoryFilter === filter.id
                          ? "bg-[#2b292e] text-[#f2be71] font-bold border border-[#f2be71]/40"
                          : "text-[#ccc3d8] hover:bg-[#201f23]"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* 1. Selector de Títulos */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block flex items-center justify-between">
                    <span>1. Tipografía para Títulos & Encabezados</span>
                    <span className="font-mono text-[#f2be71]">{fontHeading}</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {CURATED_GOOGLE_FONTS_HEADING
                      .filter((f) => fontCategoryFilter === "all" || f.styleType === fontCategoryFilter)
                      .map((font) => {
                        const isSelected = fontHeading.toLowerCase() === font.name.toLowerCase();
                        return (
                          <div
                            key={font.name}
                            onClick={() => {
                              setFontHeading(font.name);
                              loadGoogleFont(font.name, true);
                            }}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${
                              isSelected
                                ? "bg-[#2b292e] border-[#f2be71] shadow-[0_0_12px_rgba(242,190,113,0.25)]"
                                : "bg-[#201f23] border-[#363439] hover:border-[#f2be71]/40 hover:bg-[#252429]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#141317] text-[#958da1]">
                                {font.styleType}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#f2be71]" />}
                            </div>

                            <div
                              className="text-base font-bold text-[#e6e1e7] leading-tight truncate my-0.5"
                              style={{ fontFamily: `'${font.name}', sans-serif` }}
                            >
                              {font.name}
                            </div>

                            <p className="text-[10px] text-[#ccc3d8] line-clamp-1">
                              {font.recommendedFor}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* 2. Selector de Texto de Lectura (Cuerpo) */}
                <div className="space-y-2 pt-2 border-t border-[#363439]/60">
                  <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block flex items-center justify-between">
                    <span>2. Tipografía para Textos de Lectura & Botones</span>
                    <span className="font-mono text-[#f2be71]">{fontBody}</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {CURATED_GOOGLE_FONTS_BODY.map((font) => {
                      const isSelected = fontBody.toLowerCase() === font.name.toLowerCase();
                      return (
                        <button
                          key={font.name}
                          type="button"
                          onClick={() => {
                            setFontBody(font.name);
                            loadGoogleFont(font.name, false);
                          }}
                          className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                            isSelected
                              ? "bg-[#2b292e] border-[#f2be71] text-[#f2be71] font-bold"
                              : "bg-[#201f23] border-[#363439] text-[#ccc3d8] hover:border-[#f2be71]/40"
                          }`}
                        >
                          <span
                            className="block text-sm"
                            style={{ fontFamily: `'${font.name}', sans-serif` }}
                          >
                            {font.name}
                          </span>
                          <span className="text-[9px] text-[#958da1] block mt-0.5">
                            {font.name === "Manrope" ? "Por defecto" : "Google Font"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* CONTENIDO PESTAÑA 2: FUENTE PERSONALIZADA LIBRE */}
            {activeFontTab === "custom" && (
              <div className="space-y-4">
                <div className="bg-[#201f23] border border-[#363439] p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#f2be71] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Usa más de 1,500 fuentes gratuitas de Google Fonts</span>
                    </span>
                    <a
                      href="https://fonts.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#f2be71] hover:underline flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <span>Explorar fonts.google.com</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[#ccc3d8]">
                    Escribe el nombre exacto de la fuente de Google (ej: <code className="bg-[#141317] px-1 py-0.5 rounded text-[#f2be71]">Bebas Neue</code>, <code className="bg-[#141317] px-1 py-0.5 rounded text-[#f2be71]">Pacifico</code>, <code className="bg-[#141317] px-1 py-0.5 rounded text-[#f2be71]">Space Grotesk</code>, <code className="bg-[#141317] px-1 py-0.5 rounded text-[#f2be71]">Syne</code>) o pega directamente el enlace de Google Fonts.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Fuente personalizada para Títulos */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                      Fuente para Títulos (Headings)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customHeadingInput}
                        onChange={(e) => setCustomHeadingInput(e.target.value)}
                        placeholder="Ej: Bebas Neue o Cormorant Infant"
                        className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-3.5 py-2 text-xs w-full"
                      />
                      <button
                        type="button"
                        onClick={handleTestCustomHeading}
                        className="bg-[#2b292e] hover:bg-[#363439] text-[#f2be71] border border-[#f2be71]/40 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
                      >
                        Probar
                      </button>
                    </div>
                    <span className="text-[10px] text-[#958da1]">
                      Actual activa: <strong className="text-[#e6e1e7]">{fontHeading}</strong>
                    </span>
                  </div>

                  {/* Fuente personalizada para Texto */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                      Fuente para Textos & Botones (Body)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customBodyInput}
                        onChange={(e) => setCustomBodyInput(e.target.value)}
                        placeholder="Ej: Plus Jakarta Sans o Cabin"
                        className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-3.5 py-2 text-xs w-full"
                      />
                      <button
                        type="button"
                        onClick={handleTestCustomBody}
                        className="bg-[#2b292e] hover:bg-[#363439] text-[#f2be71] border border-[#f2be71]/40 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
                      >
                        Probar
                      </button>
                    </div>
                    <span className="text-[10px] text-[#958da1]">
                      Actual activa: <strong className="text-[#e6e1e7]">{fontBody}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* CAJA DE PREVISUALIZACIÓN TIPOGRÁFICA EN VIVO */}
            <div className="bg-[#141317] border border-[#363439] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#363439]/60 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#958da1] flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#f2be71]" />
                  <span>Previsualización Tipográfica en Vivo</span>
                </span>
                <span className="text-[10px] font-mono text-[#f2be71]">
                  Títulos: <strong>{fontHeading}</strong> • Texto: <strong>{fontBody}</strong>
                </span>
              </div>

              {/* Título de muestra */}
              <h4
                className="text-xl font-bold text-[#e6e1e7] leading-snug"
                style={{ fontFamily: `'${fontHeading}', sans-serif` }}
              >
                Experiencias de Sabor Inolvidables en Mesa
              </h4>

              {/* Párrafo de muestra */}
              <p
                className="text-xs text-[#ccc3d8] leading-relaxed"
                style={{ fontFamily: `'${fontBody}', sans-serif` }}
              >
                Disfruta de nuestros postres artesanales horneados diariamente, café de finca recién tostado y premios especiales en cada visita escaneando el código QR.
              </p>

              {/* Fila con botón y números */}
              <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-xs font-bold shadow-md"
                  style={{
                    backgroundColor: primaryColor,
                    color: "#121115",
                    fontFamily: `'${fontBody}', sans-serif`,
                  }}
                >
                  Girar Ruleta de Premios
                </button>

                <div
                  className="text-xs font-semibold text-[#f2be71] font-mono"
                  style={{ fontFamily: `'${fontHeading}', sans-serif` }}
                >
                  Mesa 04 • Ticket #8492 • $24.500 COP
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Premios de Ruleta 100% Personalizable */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#363439] pb-3 gap-2">
              <div>
                <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
                  <span>🎰 Premios de la Ruleta (Paso 3)</span>
                </h3>
                <p className="text-xs text-[#ccc3d8]">Personaliza los premios que ganan los comensales y sus probabilidades.</p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                    totalProbability === 100
                      ? "bg-[#0d2e1f] text-[#10b981] border-[#10b981]/40"
                      : "bg-[#2a1f00] text-[#f59e0b] border-[#f59e0b]/40"
                  }`}
                >
                  Suma: {totalProbability}% {totalProbability === 100 ? "✓" : "⚠️ (Debe ser 100%)"}
                </span>

                <button
                  type="button"
                  onClick={handleAddPrize}
                  className="bg-[#201f23] hover:bg-[#2b292e] text-[#f2be71] border border-[#f2be71]/40 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Premio</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {prizes.map((p, idx) => (
                <div key={p.id || idx} className="bg-[#201f23] border border-[#363439] rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 w-full sm:w-auto">
                    <input
                      type="color"
                      value={p.color || primaryColor}
                      onChange={(e) => {
                        const updated = [...prizes];
                        updated[idx].color = e.target.value;
                        setPrizes(updated);
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => {
                        const updated = [...prizes];
                        updated[idx].name = e.target.value;
                        setPrizes(updated);
                      }}
                      className="bg-[#141317] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-lg px-3 py-1.5 text-xs font-semibold w-full"
                      placeholder="Nombre del premio"
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={p.probability}
                        onChange={(e) => {
                          const updated = [...prizes];
                          updated[idx].probability = Number(e.target.value);
                          setPrizes(updated);
                        }}
                        className="bg-[#141317] border border-[#363439] text-[#f2be71] font-mono text-center rounded-lg px-2 py-1.5 w-16 text-xs font-bold"
                      />
                      <span className="text-xs text-[#958da1] font-mono">%</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePrize(p.id)}
                      className="p-1.5 rounded-lg bg-[#141317] hover:bg-red-950/60 text-[#ccc3d8] hover:text-red-400 transition-colors cursor-pointer"
                      title="Eliminar premio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (1 COL): MOCKUP DE VISTA PREVIA EN MESA */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#f2be71]" />
            <span>Vista Previa en Mesa de Comensal</span>
          </h3>

          <div className="bg-[#1c1b1f] border-2 border-[#363439] rounded-3xl p-5 shadow-2xl relative overflow-hidden space-y-4">
            {/* Header del móvil simulado */}
            <div className="flex items-center justify-between border-b border-[#363439]/60 pb-3">
              <div className="flex items-center gap-2">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-7 h-7 rounded-lg object-contain bg-[#201f23] p-0.5" />
                ) : (
                  <span className="w-7 h-7 rounded-lg bg-[#201f23] text-xs font-bold flex items-center justify-center text-[#f2be71]">
                    {brandName.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div>
                  <h4
                    className="text-xs font-bold text-[#e6e1e7] leading-tight truncate"
                    style={{ fontFamily: `'${fontHeading}', sans-serif` }}
                  >
                    {brandName}
                  </h4>
                  <p
                    className="text-[9px] text-[#ccc3d8] truncate"
                    style={{ fontFamily: `'${fontBody}', sans-serif` }}
                  >
                    {tagline}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-[#201f23] text-[#f2be71] px-2 py-0.5 rounded-full border border-[#363439]">
                Mesa 04
              </span>
            </div>

            {/* Simulación del juego de Ruleta */}
            <div className="bg-[#141317] rounded-2xl p-4 text-center space-y-3 border border-[#363439]/40">
              <span
                className="text-[10px] uppercase font-bold tracking-wider text-[#958da1]"
                style={{ fontFamily: `'${fontHeading}', sans-serif` }}
              >
                Paso 3 • Gira y Gana
              </span>
              <div
                className="w-28 h-28 mx-auto rounded-full border-4 border-dashed flex items-center justify-center shadow-lg transition-all"
                style={{ borderColor: primaryColor }}
              >
                <span className="text-2xl animate-spin" style={{ animationDuration: "12s" }}>🎰</span>
              </div>
              <p
                className="text-xs text-[#ccc3d8]"
                style={{ fontFamily: `'${fontBody}', sans-serif` }}
              >
                ¡Gira la ruleta y gana premios instantáneos de la casa!
              </p>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-transform active:scale-95"
                style={{
                  backgroundColor: primaryColor,
                  color: "#121115",
                  fontFamily: `'${fontBody}', sans-serif`,
                }}
              >
                Girar Ruleta Ahora
              </button>
            </div>

            {/* Nota de marca blanca y fuentes activas */}
            <div className="p-3 rounded-xl bg-[#201f23] border border-[#363439] text-[11px] text-[#ccc3d8] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#f2be71]">✓ Marca Blanca Activa</span>
                <span className="text-[9px] font-mono text-[#958da1]">Google Fonts</span>
              </div>
              <p className="text-[#958da1] text-[10px]">
                Tipografía de Título: <strong className="text-[#e6e1e7]">{fontHeading}</strong>
                <br />
                Tipografía de Cuerpo: <strong className="text-[#e6e1e7]">{fontBody}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
