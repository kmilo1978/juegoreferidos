import { useEffect, useState } from "react";
import {
  Loader2,
  Shield,
  Lock,
  Save,
  KeyRound,
  Dices,
  Copy,
  Check,
  Eye,
  EyeOff,
  Share2,
  Smartphone,
  RefreshCw,
  Clock,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

export function Security() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados de PINs
  const [adminPin, setAdminPin] = useState("1234");
  const [cashierPin, setCashierPin] = useState("4321");
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(60);
  const [lastPinReset, setLastPinReset] = useState<string | null>(null);

  // Visibilidad de PINs
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [showCashierPin, setShowCashierPin] = useState(false);

  // Copiado a portapapeles
  const [copiedAdmin, setCopiedAdmin] = useState(false);
  const [copiedCashier, setCopiedCashier] = useState(false);

  // Selector de dígitos (4 o 6 dígitos)
  const [pinLength, setPinLength] = useState<4 | 6>(4);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/config");
      if (!res.ok) throw new Error("Error al cargar configuración de seguridad");
      const data = await res.json();

      if (data.settings?.security) {
        const sec = data.settings.security;
        setAdminPin(sec.roles?.admin?.pin || sec.masterAdminPin || "1234");
        setCashierPin(sec.roles?.cashier?.pin || sec.cashierPin || "4321");
        setSessionTimeoutMinutes(sec.sessionTimeoutMinutes || 60);
        if (sec.lastPinReset) setLastPinReset(sec.lastPinReset);
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

  // Función generadora de PIN aleatorio seguro
  const generateRandomPin = (len: number = pinLength): string => {
    let pin = "";
    // Generar dígitos aleatorios evitando secuencias triviales
    for (let i = 0; i < len; i++) {
      pin += Math.floor(Math.random() * 10).toString();
    }
    // Evitar que todos los dígitos sean iguales (ej: 0000, 1111)
    if (new Set(pin.split("")).size === 1) {
      return generateRandomPin(len);
    }
    return pin;
  };

  // Reseteo aleatorio de PIN de Cajero
  const handleRandomizeCashierPin = () => {
    const newPin = generateRandomPin();
    setCashierPin(newPin);
    setShowCashierPin(true);
    setSuccess(`Nuevo PIN de Cajero generado: ${newPin}. Recuerda hacer clic en 'Guardar PINs'.`);
    setTimeout(() => setSuccess(null), 4000);
  };

  // Reseteo aleatorio de PIN de Administrador
  const handleRandomizeAdminPin = () => {
    const newPin = generateRandomPin();
    setAdminPin(newPin);
    setShowAdminPin(true);
    setSuccess(`Nuevo PIN de Administrador generado: ${newPin}. Recuerda hacer clic en 'Guardar PINs'.`);
    setTimeout(() => setSuccess(null), 4000);
  };

  // Reseteo aleatorio de AMBOS PINs al tiempo
  const handleRandomizeBoth = () => {
    const newCashier = generateRandomPin();
    let newAdmin = generateRandomPin();
    while (newAdmin === newCashier) {
      newAdmin = generateRandomPin();
    }
    setCashierPin(newCashier);
    setAdminPin(newAdmin);
    setShowCashierPin(true);
    setShowAdminPin(true);
    setSuccess(`¡Nuevos PINs generados! Cajero: ${newCashier} | Admin: ${newAdmin}. No olvides guardar.`);
    setTimeout(() => setSuccess(null), 5000);
  };

  // Copiar al portapapeles
  const handleCopy = (pin: string, type: "cashier" | "admin") => {
    navigator.clipboard.writeText(pin);
    if (type === "cashier") {
      setCopiedCashier(true);
      setTimeout(() => setCopiedCashier(false), 2000);
    } else {
      setCopiedAdmin(true);
      setTimeout(() => setCopiedAdmin(false), 2000);
    }
  };

  // Compartir PIN de Cajero al WhatsApp del Personal de Sala
  const handleShareCashierViaWhatsApp = () => {
    const msg = `🔐 *PIN DE AUTORIZACIÓN EN CAJA & MESA*\n\nHola equipo, el nuevo código de autorización para validar premios y vouchers en mesa es:\n\n👉 *${cashierPin}*\n\nFecha de emisión: ${new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}\nUso exclusivo del personal de sala.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const now = new Date().toISOString();

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          security: {
            sessionTimeoutMinutes: Number(sessionTimeoutMinutes),
            cashierPin: cashierPin,
            masterAdminPin: adminPin,
            lastPinReset: now,
            roles: {
              admin: { pin: adminPin, name: "Administrador / Gerente" },
              cashier: { pin: cashierPin, name: "Cajero / Mesero en Sala" },
            },
          },
        }),
      });

      if (!res.ok) throw new Error("Error al guardar credenciales de seguridad");
      setLastPinReset(now);
      setSuccess("¡PINs de seguridad actualizados y guardados exitosamente!");
      setTimeout(() => setSuccess(null), 4000);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#f2be71] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue'] flex items-center gap-2">
            <Lock className="w-6 h-6 text-[#f2be71]" />
            <span>Seguridad, Roles & PINs de Caja</span>
          </h2>
          <p className="text-sm text-[#ccc3d8]">
            Gestiona los códigos de validación de premios para el personal de mesa y el acceso administrativo.
          </p>
        </div>

        {/* Botón rápido para resetear ambos PINs con números aleatorios */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRandomizeBoth}
            className="bg-[#201f23] border border-[#f2be71]/40 hover:bg-[#2b292e] text-[#f2be71] text-xs font-bold rounded-xl px-4 py-2.5 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Dices className="w-4 h-4 text-[#f2be71]" />
            <span>Resetear Ambos Aleatoriamente</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 shrink-0 text-[#10b981]" />
          <span>{success}</span>
        </div>
      )}

      {/* Banner de Estado de Seguridad */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#684400]/40 border border-[#f2be71]/30 flex items-center justify-center text-[#f2be71]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#e6e1e7]">Control Criptográfico de PINs</h4>
            <p className="text-xs text-[#958da1]">
              {lastPinReset
                ? `Último reseteo registrado: ${new Date(lastPinReset).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}`
                : "Se recomienda cambiar o regenerar los PINs periódicamente para mayor seguridad en sala."}
            </p>
          </div>
        </div>

        {/* Selector de Longitud de PIN */}
        <div className="flex items-center gap-2 bg-[#141317] border border-[#363439] p-1.5 rounded-xl">
          <span className="text-[11px] text-[#ccc3d8] px-2 font-semibold">Longitud:</span>
          <button
            type="button"
            onClick={() => setPinLength(4)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              pinLength === 4
                ? "bg-[#f2be71] text-[#121115]"
                : "text-[#958da1] hover:text-[#e6e1e7]"
            }`}
          >
            4 Dígitos
          </button>
          <button
            type="button"
            onClick={() => setPinLength(6)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              pinLength === 6
                ? "bg-[#f2be71] text-[#121115]"
                : "text-[#958da1] hover:text-[#e6e1e7]"
            }`}
          >
            6 Dígitos
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#363439] pb-4">
          <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#f2be71]" />
            <span>PINs de Control de Acceso</span>
          </h3>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-5 py-2.5 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Guardar PINs</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TARJETA 1: PIN CAJERO / MESERO */}
          <div className="bg-[#201f23] border border-[#f2be71]/40 rounded-xl p-5 space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#684400]/40 flex items-center justify-center text-[#f2be71]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#e6e1e7]">PIN de Cajero / Mesero en Mesa</h4>
                  <p className="text-xs text-[#ccc3d8]">Utilizado por los meseros para quemar cupones ganados.</p>
                </div>
              </div>
              <span className="text-[10px] bg-[#684400]/50 text-[#f2be71] font-bold px-2 py-0.5 rounded-full border border-[#f2be71]/30">
                Operaciones
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs text-[#ccc3d8] uppercase font-bold flex items-center justify-between">
                <span>Código PIN ({cashierPin.length} dígitos):</span>
                <span className="text-[11px] text-[#f2be71] font-normal">Acceso en Sala</span>
              </label>

              <div className="relative flex items-center">
                <input
                  type={showCashierPin ? "text" : "password"}
                  maxLength={pinLength}
                  value={cashierPin}
                  onChange={(e) => setCashierPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="4321"
                  className="bg-[#141317] border border-[#363439] text-[#f2be71] font-mono text-center tracking-[10px] text-2xl font-bold rounded-xl px-4 py-3 w-full focus:border-[#f2be71]/60 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCashierPin(!showCashierPin)}
                  className="absolute right-3 text-[#958da1] hover:text-[#e6e1e7] transition-colors p-1"
                  title={showCashierPin ? "Ocultar PIN" : "Mostrar PIN"}
                >
                  {showCashierPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botones de Acción para PIN Cajero */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#363439]/60">
              <button
                type="button"
                onClick={handleRandomizeCashierPin}
                className="flex-1 bg-[#2b292e] hover:bg-[#363439] text-[#f2be71] text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Generar Aleatorio</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(cashierPin, "cashier")}
                className="bg-[#141317] hover:bg-[#2b292e] text-[#ccc3d8] text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border border-[#363439]"
                title="Copiar PIN"
              >
                {copiedCashier ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCashier ? "Copiado" : "Copiar"}</span>
              </button>

              <button
                type="button"
                onClick={handleShareCashierViaWhatsApp}
                className="bg-[#0f2e1f] hover:bg-[#133b28] text-[#34d399] text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border border-[#10b981]/30"
                title="Enviar por WhatsApp al equipo"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* TARJETA 2: PIN MAESTRO ADMINISTRADOR */}
          <div className="bg-[#201f23] border border-[#d1bcff]/40 rounded-xl p-5 space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#381e72]/40 flex items-center justify-center text-[#d1bcff]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#e6e1e7]">PIN Maestro de Administración</h4>
                  <p className="text-xs text-[#ccc3d8]">Para entrar a configuración crítica y validar premios.</p>
                </div>
              </div>
              <span className="text-[10px] bg-[#381e72]/50 text-[#d1bcff] font-bold px-2 py-0.5 rounded-full border border-[#d1bcff]/30">
                Gerencia
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs text-[#ccc3d8] uppercase font-bold flex items-center justify-between">
                <span>Código PIN ({adminPin.length} dígitos):</span>
                <span className="text-[11px] text-[#d1bcff] font-normal">Super Admin</span>
              </label>

              <div className="relative flex items-center">
                <input
                  type={showAdminPin ? "text" : "password"}
                  maxLength={pinLength}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="1234"
                  className="bg-[#141317] border border-[#363439] text-[#d1bcff] font-mono text-center tracking-[10px] text-2xl font-bold rounded-xl px-4 py-3 w-full focus:border-[#d1bcff]/60 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPin(!showAdminPin)}
                  className="absolute right-3 text-[#958da1] hover:text-[#e6e1e7] transition-colors p-1"
                  title={showAdminPin ? "Ocultar PIN" : "Mostrar PIN"}
                >
                  {showAdminPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botones de Acción para PIN Maestro */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#363439]/60">
              <button
                type="button"
                onClick={handleRandomizeAdminPin}
                className="flex-1 bg-[#2b292e] hover:bg-[#363439] text-[#d1bcff] text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Generar Aleatorio</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(adminPin, "admin")}
                className="bg-[#141317] hover:bg-[#2b292e] text-[#ccc3d8] text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border border-[#363439]"
                title="Copiar PIN"
              >
                {copiedAdmin ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAdmin ? "Copiado" : "Copiar"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Políticas de Seguridad de Sesión */}
        <div className="pt-4 border-t border-[#363439] grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Tiempo de Inactividad de Sesión (Minutos)
            </label>
            <input
              type="number"
              min={5}
              max={480}
              value={sessionTimeoutMinutes}
              onChange={(e) => setSessionTimeoutMinutes(Number(e.target.value))}
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-sm"
            />
            <span className="text-[11px] text-[#958da1]">
              Cierra automáticamente la sesión de administración tras minutos sin actividad.
            </span>
          </div>

          <div className="bg-[#141317] border border-[#363439] rounded-xl p-3.5 flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#f2be71] shrink-0" />
            <div className="text-xs text-[#ccc3d8] leading-relaxed">
              <strong>Buenas prácticas:</strong> Se recomienda resetear el PIN de cajero al inicio de cada semana o turno. El personal solo podrá validar premios en mesa si coincide exactamente con el PIN activo.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
