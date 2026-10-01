import { useEffect, useState } from "react";
import { Loader2, Save, Wifi as WifiIcon } from "lucide-react";

export function WifiPortal() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/portal/status')
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // Usar POST /api/config { captivePortal: ... } pero simplificado aquí
      const res = await fetch('http://localhost:3001/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          captivePortal: {
            requireEmail: true,
            sessionDurationMinutes: 60
          }
        })
      });
      if (!res.ok) throw new Error('Error al guardar');
      setSuccess('Configuración WiFi guardada correctamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#f2be71] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[#e6e1e7] font-bold text-lg font-[Epilogue]">Portal Cautivo WiFi</h3>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-[#10b981]/20 border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${status?.active ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#363439] text-[#958da1]'}`}>
              <WifiIcon className="w-8 h-8" />
            </div>
            <h4 className="text-[#e6e1e7] font-bold text-xl mb-1">
              {status?.active ? 'En Línea' : 'Fuera de Línea'}
            </h4>
            <p className="text-[#958da1] text-sm">Estado del Portal</p>
            
            <div className="mt-6 pt-6 border-t border-[#363439]">
              <div className="text-3xl font-['Epilogue'] font-bold text-[#f2be71]">
                {status?.connectedDevices || 0}
              </div>
              <p className="text-[#958da1] text-sm mt-1">Dispositivos Conectados</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6">
            <h4 className="text-[#e6e1e7] font-bold border-b border-[#363439] pb-4">Configuración de Acceso</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[#ccc3d8] text-sm mb-2">SSID Red WiFi</label>
                <input 
                  type="text" 
                  defaultValue="WiFi Clientes VIP"
                  className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full"
                />
              </div>
              
              <div>
                <label className="block text-[#ccc3d8] text-sm mb-2">Duración de Sesión (minutos)</label>
                <input 
                  type="number" 
                  defaultValue="60"
                  className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="req-email"
                  defaultChecked
                  className="w-5 h-5 accent-[#f2be71] rounded bg-[#201f23] border-[#363439]"
                />
                <label htmlFor="req-email" className="text-[#ccc3d8]">Requerir Email para acceder</label>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit"
                disabled={saving}
                className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-6 py-3 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Guardar Configuración
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
