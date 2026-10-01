import { useEffect, useState } from "react";
import { Loader2, Shield, Lock, Save, KeyRound, UserCheck } from "lucide-react";

export function Security() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados de PIN
  const [adminPin, setAdminPin] = useState("1234");
  const [cashierPin, setCashierPin] = useState("4321");
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(60);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/config");
      if (!res.ok) throw new Error("Error al cargar seguridad");
      const data = await res.json();
      setConfig(data.settings);

      if (data.settings?.security) {
        setAdminPin(data.settings.security.roles?.admin?.pin || "1234");
        setCashierPin(data.settings.security.roles?.cashier?.pin || "4321");
        setSessionTimeoutMinutes(data.settings.security.sessionTimeoutMinutes || 60);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("http://localhost:3001/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          security: {
            sessionTimeoutMinutes: Number(sessionTimeoutMinutes),
            roles: {
              admin: { pin: adminPin, name: "Administrador / Gerente" },
              cashier: { pin: cashierPin, name: "Cajero / Mesero en Sala" },
            },
          },
        }),
      });

      if (!res.ok) throw new Error("Error al guardar seguridad");
      setSuccess("Credenciales y PINs de seguridad guardados correctamente");
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#f2be71] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue']">Seguridad, Roles & PINs de Caja</h2>
          <p className="text-sm text-[#ccc3d8]">Controla el acceso al panel administrativo y los códigos de validación de premios para el personal en mesa.</p>
        </div>
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

      <form onSubmit={handleSave} className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#363439] pb-4">
          <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#f2be71]" />
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
          {/* PIN Cajero */}
          <div className="bg-[#201f23] border border-[#f2be71]/30 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <KeyRound className="w-6 h-6 text-[#f2be71]" />
              <div>
                <h4 className="text-sm font-bold text-[#e6e1e7]">PIN de Cajero / Mesero (En Mesa)</h4>
                <p className="text-xs text-[#ccc3d8]">Utilizado para validar el reclamo de premios en la pantalla del cliente.</p>
              </div>
            </div>
            <div className="pt-2">
              <label className="text-xs text-[#ccc3d8] uppercase font-bold block mb-1">PIN de 4 Dígitos:</label>
              <input
                type="password"
                maxLength={4}
                value={cashierPin}
                onChange={(e) => setCashierPin(e.target.value.replace(/\D/g, ""))}
                placeholder="4321"
                className="bg-[#141317] border border-[#363439] text-[#f2be71] font-mono text-center tracking-[8px] text-xl font-bold rounded-xl px-4 py-2.5 w-full focus:border-[#f2be71]/60 focus:outline-none"
                required
              />
              <span className="text-[11px] text-[#958da1] mt-1 block">PIN actual por defecto: <strong>4321</strong></span>
            </div>
          </div>

          {/* PIN Administrador */}
          <div className="bg-[#201f23] border border-[#363439] rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-[#d1bcff]" />
              <div>
                <h4 className="text-sm font-bold text-[#e6e1e7]">PIN Maestro de Administración</h4>
                <p className="text-xs text-[#ccc3d8]">Utilizado para abrir el panel de control y cambiar configuraciones críticas.</p>
              </div>
            </div>
            <div className="pt-2">
              <label className="text-xs text-[#ccc3d8] uppercase font-bold block mb-1">PIN de 4 Dígitos:</label>
              <input
                type="password"
                maxLength={4}
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ""))}
                placeholder="1234"
                className="bg-[#141317] border border-[#363439] text-[#d1bcff] font-mono text-center tracking-[8px] text-xl font-bold rounded-xl px-4 py-2.5 w-full focus:border-[#d1bcff]/60 focus:outline-none"
                required
              />
              <span className="text-[11px] text-[#958da1] mt-1 block">PIN actual por defecto: <strong>1234</strong></span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
