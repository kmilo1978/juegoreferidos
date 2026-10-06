import { useEffect, useState } from "react";
import {
  Loader2,
  Radio,
  QrCode,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Zap,
  Info,
  Layers,
  Clock,
  Save,
  HelpCircle,
  Wifi,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { KpiCard } from "../components/KpiCard";
import { apiUrl, getAuthToken } from "../../lib/apiClient";

interface NfcTable {
  id: string;
  number: number;
  name: string;
  zone: string;
  nfcUrl: string;
  qrUrl: string;
}

interface NfcStats {
  nfcScans: number;
  qrScans: number;
  totalScans: number;
  nfcRate: string;
  lastScans: Array<{
    id: string;
    mesa: number;
    origen: string;
    device: string;
    timestamp: string;
  }>;
}

export function NfcAssistant() {
  const [loading, setLoading] = useState(true);
  const [savingDomain, setSavingDomain] = useState(false);
  const [baseDomain, setBaseDomain] = useState("http://localhost:5173");
  const [stats, setStats] = useState<NfcStats>({
    nfcScans: 0,
    qrScans: 0,
    totalScans: 0,
    nfcRate: "0%",
    lastScans: [],
  });
  const [tables, setTables] = useState<NfcTable[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"tables" | "guide" | "history">("tables");
  const [webNfcStatus, setWebNfcStatus] = useState<string | null>(null);
  const [selectedTableForNfc, setSelectedTableForNfc] = useState<NfcTable | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchNfcData = async () => {
    try {
      const res = await fetch(apiUrl("/nfc/stats"));
      if (!res.ok) throw new Error("Error al obtener datos NFC");
      const data = await res.json();
      if (data.success) {
        setBaseDomain(data.baseDomain);
        setStats(data.stats);
        setTables(data.tables);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNfcData();
  }, []);

  // Copiar al portapapeles
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Guardar nuevo dominio base
  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDomain(true);
    try {
      const res = await fetch(apiUrl("/nfc/config"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}) },
        body: JSON.stringify({ baseDomain }),
      });
      if (!res.ok) throw new Error("Error al guardar dominio");
      setSuccess("Dominio de enlaces NFC actualizado con éxito");
      setTimeout(() => setSuccess(null), 3000);
      fetchNfcData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSavingDomain(false);
    }
  };

  // Escritura física vía Web NFC API (en navegadores compatibles como Chrome Android)
  const handleWriteWebNfc = async (table: NfcTable) => {
    setSelectedTableForNfc(table);
    if (!("NDEFReader" in window)) {
      setWebNfcStatus("not_supported");
      return;
    }

    try {
      setWebNfcStatus("scanning");
      const ndef = new (window as any).NDEFReader();
      await ndef.write({
        records: [
          {
            recordType: "url",
            data: table.nfcUrl,
          },
        ],
      });
      setWebNfcStatus("success");
      setTimeout(() => {
        setWebNfcStatus(null);
        setSelectedTableForNfc(null);
      }, 4000);
    } catch (err: any) {
      console.error("Web NFC Error:", err);
      setWebNfcStatus("error");
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
      {/* 1. ENCABEZADO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue'] flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-[#f2be71]" />
            <span>Asistente NFC & Mesas Contactless</span>
          </h2>
          <p className="text-sm text-[#ccc3d8]">
            Gestiona los enlaces de cada mesa para stickers NFC, mide cuántos clientes juegan acercando el celular vs escaneando el QR, y graba tus chips físicos en segundos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab("guide")}
          className="bg-[#201f23] hover:bg-[#2b292e] text-[#f2be71] border border-[#f2be71]/40 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Ver Guía de Grabación</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl text-sm">
          {success}
        </div>
      )}

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Lecturas por NFC"
          value={String(stats.nfcScans)}
          subtitle="Comensales por contacto"
          accent="gold"
        />
        <KpiCard
          title="Escaneos por QR"
          value={String(stats.qrScans)}
          subtitle="Comensales con cámara"
          accent="lila"
        />
        <KpiCard
          title="Tasa de Uso NFC"
          value={stats.nfcRate}
          subtitle="Preferencia contactless"
          accent="emerald"
        />
        <KpiCard
          title="Total Interacciones"
          value={String(stats.totalScans)}
          subtitle="Mesa más activa: Mesa 3"
          accent="amber"
        />
      </div>

      {/* 3. BARRA DE PESTAÑAS */}
      <div className="flex items-center gap-2 border-b border-[#363439] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("tables")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "tables"
              ? "bg-[#f2be71] text-[#121115] shadow-md"
              : "bg-[#201f23] text-[#ccc3d8] hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Enlaces NFC por Mesa ({tables.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("guide")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "guide"
              ? "bg-[#f2be71] text-[#121115] shadow-md"
              : "bg-[#201f23] text-[#ccc3d8] hover:text-white"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Guía Paso a Paso (NFC Tools)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "history"
              ? "bg-[#f2be71] text-[#121115] shadow-md"
              : "bg-[#201f23] text-[#ccc3d8] hover:text-white"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Historial en Vivo (NFC vs QR)</span>
        </button>
      </div>

      {/* 4. PESTAÑA 1: LISTADO DE ENLACES POR MESA */}
      {activeTab === "tables" && (
        <div className="space-y-5">
          {/* Tarjeta de configuración de Dominio Base */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-[#e6e1e7] uppercase tracking-wider font-mono flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-[#f2be71]" />
                  <span>Dominio Base de los Enlaces NFC</span>
                </h3>
                <p className="text-xs text-[#ccc3d8]">
                  Define la dirección web pública de tu local (ej: tu dominio con HTTPS). Los enlaces de todas las mesas se actualizarán automáticamente.
                </p>
              </div>

              <form onSubmit={handleSaveDomain} className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={baseDomain}
                  onChange={(e) => setBaseDomain(e.target.value)}
                  placeholder="https://club.turestaurante.com"
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 text-xs font-mono w-full sm:w-80 focus:border-[#f2be71]/60 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={savingDomain}
                  className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-4 py-2 text-xs hover:brightness-105 transition-all cursor-pointer shrink-0"
                >
                  {savingDomain ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                </button>
              </form>
            </div>
          </div>

          {/* Tabla de mesas */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#363439] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue']">
                  Directorio de Mesas y Enlaces Contactless
                </h3>
                <p className="text-xs text-[#ccc3d8]">
                  Copia el enlace de cada mesa para grabarlo en la app NFC Tools de tu celular o usa el botón de prueba.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const allLinks = tables.map((t) => `${t.name} (${t.zone}): ${t.nfcUrl}`).join("\n");
                  handleCopy(allLinks, "all_tables");
                }}
                className="text-xs font-bold text-[#f2be71] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === "all_tables" ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === "all_tables" ? "¡Todos Copiados!" : "Copiar Todas las Mesas"}</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {tables.map((table) => {
                const isCopied = copiedId === table.id;

                return (
                  <div
                    key={table.id}
                    className="bg-[#201f23] border border-[#363439] rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:border-[#f2be71]/40 transition-colors"
                  >
                    {/* Info de Mesa */}
                    <div className="flex items-center gap-3 min-w-[160px]">
                      <div className="w-10 h-10 rounded-xl bg-[#141317] border border-[#363439] flex items-center justify-center text-[#f2be71] font-mono font-bold text-sm">
                        #{table.number}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#e6e1e7] leading-tight">{table.name}</h4>
                        <span className="text-[10px] text-[#ccc3d8] bg-[#141317] px-2 py-0.5 rounded-md mt-0.5 inline-block">
                          {table.zone}
                        </span>
                      </div>
                    </div>

                    {/* Enlace NFC */}
                    <div className="flex-1 w-full md:w-auto">
                      <div className="bg-[#141317] border border-[#363439] px-3 py-1.5 rounded-lg flex items-center justify-between gap-2">
                        <span className="text-xs font-mono text-[#f2be71] truncate select-all">
                          {table.nfcUrl}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-[#10b981] bg-[#0d2e1f] px-1.5 py-0.5 rounded shrink-0">
                          NFC Tag
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => handleCopy(table.nfcUrl, table.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isCopied
                            ? "bg-[#0d2e1f] text-[#10b981] border border-[#10b981]/50"
                            : "bg-[#2b292e] hover:bg-[#363439] text-[#e6e1e7] border border-[#363439]"
                        }`}
                        title="Copiar enlace para pegarlo en la app NFC Tools"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? "¡Copiado!" : "Copiar"}</span>
                      </button>

                      <a
                        href={table.nfcUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg text-xs text-[#ccc3d8] hover:text-[#f2be71] bg-[#141317] border border-[#363439] transition-colors"
                        title="Probar en nueva pestaña"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleWriteWebNfc(table)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#684400]/40 text-[#f2be71] border border-[#f2be71]/40 hover:bg-[#f2be71] hover:text-[#121115] transition-all cursor-pointer flex items-center gap-1"
                        title="Grabar directamente si usas Chrome en Android"
                      >
                        <Radio className="w-3 h-3" />
                        <span>Grabar NFC</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. PESTAÑA 2: GUÍA ILUSTRADA PASO A PASO */}
      {activeTab === "guide" && (
        <div className="space-y-6">
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 shadow-lg space-y-6">
            <div className="border-b border-[#363439] pb-4">
              <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#f2be71]" />
                <span>Cómo Grabar tus Stickers NFC en 3 Pasos (Sin Complicaciones)</span>
              </h3>
              <p className="text-xs text-[#ccc3d8] mt-1">
                Sigue esta guía rápida. Una vez grabado el sticker, durará años pegado en tu mesa sin requerir mantenimiento ni baterías.
              </p>
            </div>

            {/* Pasos en 3 tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#201f23] border border-[#363439] rounded-2xl p-5 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-[#f2be71] text-[#121115] font-black text-sm flex items-center justify-center">
                  1
                </div>
                <h4 className="text-sm font-bold text-[#e6e1e7]">Descarga NFC Tools en tu Celular</h4>
                <p className="text-xs text-[#ccc3d8] leading-relaxed">
                  Es la aplicación gratuita estándar en la industria. Funciona al 100% en iPhone (iOS) y en teléfonos Android con lector NFC.
                </p>
                <div className="pt-2 flex flex-col gap-1.5 text-xs font-mono">
                  <a
                    href="https://apps.apple.com/app/nfc-tools/id1252962749"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#f2be71] hover:underline flex items-center gap-1"
                  >
                    <span>🍏 NFC Tools para iPhone</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.wakdev.wdnfc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#f2be71] hover:underline flex items-center gap-1"
                  >
                    <span>🤖 NFC Tools para Android</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="bg-[#201f23] border border-[#363439] rounded-2xl p-5 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-[#f2be71] text-[#121115] font-black text-sm flex items-center justify-center">
                  2
                </div>
                <h4 className="text-sm font-bold text-[#e6e1e7]">Copia el Enlace de la Mesa</h4>
                <p className="text-xs text-[#ccc3d8] leading-relaxed">
                  En la pestaña anterior, pulsa el botón <strong>"Copiar"</strong> en la mesa que vas a configurar (por ejemplo, Mesa 1). El enlace ya incluye la etiqueta <code className="text-[#f2be71] bg-[#141317] px-1 py-0.5 rounded">&origen=nfc</code>.
                </p>
                <div className="p-2.5 rounded-xl bg-[#141317] border border-[#363439] text-[11px] font-mono text-[#f2be71]">
                  https://.../?mesa=1&origen=nfc
                </div>
              </div>

              <div className="bg-[#201f23] border border-[#363439] rounded-2xl p-5 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-[#f2be71] text-[#121115] font-black text-sm flex items-center justify-center">
                  3
                </div>
                <h4 className="text-sm font-bold text-[#e6e1e7]">Escribe y Acércalo al Sticker</h4>
                <p className="text-xs text-[#ccc3d8] leading-relaxed">
                  En NFC Tools: toca <strong>Escribir</strong> ➔ <strong>Añadir un registro</strong> ➔ <strong>URL / Enlace web</strong> ➔ Pega la URL ➔ Toca <strong>Escribir</strong> y acerca el sticker a la parte superior trasera de tu celular. ¡Queda grabado en 2 segundos!
                </p>
                <div className="text-[11px] text-[#10b981] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Listo para pegar en la mesa</span>
                </div>
              </div>
            </div>

            {/* Consejos de Hardware */}
            <div className="p-4 rounded-2xl bg-[#141317] border border-[#363439] space-y-3">
              <h4 className="text-xs font-bold text-[#f2be71] uppercase tracking-wider font-mono flex items-center gap-2">
                <Info className="w-4 h-4 text-[#f2be71]" />
                <span>Recomendaciones de Compra de Chips NFC para Gastronomía</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#ccc3d8]">
                <div className="space-y-1">
                  <strong className="text-[#e6e1e7] block">🪵 Para Mesas de Madera, Vidrio o Acrílicos:</strong>
                  <p>
                    Compra stickers estándar con chip <strong>NTAG213</strong> o <strong>NTAG215</strong>. Son económicos, circulares de 25mm y transparentes o blancos.
                  </p>
                </div>

                <div className="space-y-1">
                  <strong className="text-[#e6e1e7] block">🔩 Para Mesas de Metal, Acero o Hierro:</strong>
                  <p>
                    ⚠️ El metal bloquea las ondas magnéticas. Debes comprar stickers que especifiquen <strong>"Anti-Metal / On-Metal"</strong> (llevan una lámina de ferrita aislante trasera).
                  </p>
                </div>
              </div>
            </div>

            {/* Estrategia One-Tap Stamp (Visita 1 vs Visita Recurrente) */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#201f23] via-[#1c1b1f] to-[#2b292e] border border-[#f2be71]/40 space-y-4">
              <div className="flex items-center justify-between border-b border-[#363439] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#f2be71]/20 border border-[#f2be71]/50 text-[#f2be71] flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#e6e1e7]">
                      Estrategia "One-Tap Stamp": Reconocimiento Cero-Fricción
                    </h4>
                    <p className="text-[11px] text-[#ccc3d8]">
                      Cómo el chip NFC convierte a clientes casuales en comensales fieles sin formularios repetitivos.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#684400]/40 text-[#f2be71] border border-[#f2be71]/40 text-[10px] font-mono font-bold">
                  MODO ONE-TAP
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#141317] border border-[#363439] space-y-2">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#f2be71] block">
                    Primera Visita · Cliente Nuevo
                  </span>
                  <p className="text-[#ccc3d8] leading-relaxed">
                    Al acercar su teléfono por primera vez, el sistema despliega el <strong>embudo de captación</strong>:
                  </p>
                  <ul className="space-y-1 text-[#ccc3d8]/90 pl-3 list-disc">
                    <li>Pide Nombre y WhatsApp (para CRM).</li>
                    <li>Invita a seguir en redes o compartir foto.</li>
                    <li>Dispara el Minijuego interactivo y entrega su cupón.</li>
                    <li>Activa su Pasaporte de Sellos con la visita #1.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#141317] border border-[#10b981]/40 space-y-2">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#10b981] block">
                    Segunda Visita en Adelante · Cliente Frecuente
                  </span>
                  <p className="text-[#ccc3d8] leading-relaxed">
                    El teléfono recuerda la identidad del comensal. Al acercar el móvil al chip NFC:
                  </p>
                  <ul className="space-y-1 text-[#ccc3d8]/90 pl-3 list-disc">
                    <li>Salta automáticamente directo al <strong>Paso 7 (Sellos VIP)</strong>.</li>
                    <li>Suma <strong>+1 Sello en el acto</strong> sin pedir formularios.</li>
                    <li>Muestra saludo cariñoso: <em>"¡Qué alegría verte de nuevo, Laura!"</em>.</li>
                    <li>Ofrece un botón opcional para jugar minijuegos si lo desea.</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0f0e12] border border-[#363439] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <span className="text-[#ccc3d8]">
                  💡 <strong>URL recomendada grabada en chip:</strong> <code className="text-[#f2be71] font-mono bg-[#1c1b1f] px-2 py-0.5 rounded">https://tudominio.com/?mesa=1&origen=nfc&modo=sello_nfc</code>
                </span>
                <span className="text-[#10b981] text-[11px] font-bold">
                  ✓ Sello automático activo
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. PESTAÑA 3: HISTORIAL EN VIVO */}
      {activeTab === "history" && (
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#363439] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue']">
                Últimos Accesos de Comensales (NFC Contactless vs Código QR)
              </h3>
              <p className="text-xs text-[#ccc3d8]">
                Monitorea en tiempo real qué método eligen los comensales sentados en mesa.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchNfcData}
              className="text-xs text-[#f2be71] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Actualizar Datos</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#363439] text-[#958da1] font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">Mesa</th>
                  <th className="py-2.5 px-3">Canal de Entrada</th>
                  <th className="py-2.5 px-3">Dispositivo</th>
                  <th className="py-2.5 px-3">Momento</th>
                  <th className="py-2.5 px-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#363439]/60">
                {stats.lastScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-[#201f23] transition-colors">
                    <td className="py-3 px-3 font-bold text-[#e6e1e7]">
                      Mesa {scan.mesa}
                    </td>
                    <td className="py-3 px-3">
                      {scan.origen === "nfc" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#684400]/40 text-[#f2be71] border border-[#f2be71]/40">
                          <Radio className="w-3 h-3" />
                          <span>Contacto NFC</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2b292e] text-[#ccc3d8] border border-[#363439]">
                          <QrCode className="w-3 h-3" />
                          <span>Cámara QR</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[#ccc3d8]">
                      {scan.device}
                    </td>
                    <td className="py-3 px-3 text-[#958da1] font-mono">
                      {scan.timestamp}
                    </td>
                    <td className="py-3 px-3 text-right text-[#10b981] font-bold">
                      ✓ Sesión Activa
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL / AVISO DE WEB NFC */}
      {selectedTableForNfc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1c1b1f] border border-[#f2be71]/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#684400]/30 border border-[#f2be71]/40 flex items-center justify-center text-[#f2be71]">
              <Radio className="w-7 h-7 animate-pulse" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue']">
                Grabar Chip NFC para {selectedTableForNfc.name}
              </h3>
              <p className="text-xs text-[#ccc3d8] mt-1 font-mono">
                {selectedTableForNfc.nfcUrl}
              </p>
            </div>

            {webNfcStatus === "not_supported" ? (
              <div className="p-4 rounded-2xl bg-[#201f23] border border-[#363439] text-xs text-left space-y-2 text-[#ccc3d8]">
                <strong className="text-[#f2be71] block">ℹ️ Dispositivo o navegador sin Web NFC:</strong>
                <p>
                  Para grabar chips directamente desde una página web se requiere <strong>Google Chrome en Android</strong> con la antena NFC encendida.
                </p>
                <p>
                  En computadores o iPhone, la forma más rápida y recomendada por Apple es usar la app gratuita <strong>NFC Tools</strong>:
                </p>
                <div className="pt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleCopy(selectedTableForNfc.nfcUrl, "modal");
                    }}
                    className="w-full bg-[#f2be71] text-[#121115] font-bold py-2 rounded-xl text-xs hover:brightness-105 cursor-pointer"
                  >
                    {copiedId === "modal" ? "✓ ¡Enlace Copiado!" : "Copiar Enlace para NFC Tools"}
                  </button>
                </div>
              </div>
            ) : webNfcStatus === "scanning" ? (
              <div className="p-4 rounded-2xl bg-[#201f23] border border-[#f2be71]/40 text-xs text-[#ffddb1] space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#f2be71]" />
                <p className="font-bold text-sm">¡Acerca el sticker NFC a la parte trasera de tu teléfono ahora!</p>
                <p className="text-[11px] text-[#ccc3d8]">Mantén el sticker pegado hasta que sientas la vibración de confirmación.</p>
              </div>
            ) : webNfcStatus === "success" ? (
              <div className="p-4 rounded-2xl bg-[#0d2e1f] border border-[#10b981]/50 text-xs text-[#10b981] space-y-1">
                <p className="font-bold text-sm">🎉 ¡Sticker NFC grabado con éxito!</p>
                <p className="text-[11px]">Ya puedes pegarlo en la {selectedTableForNfc.name}.</p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setSelectedTableForNfc(null)}
              className="w-full py-2.5 rounded-xl bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] text-xs font-semibold cursor-pointer"
            >
              Cerrar Ventana
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
