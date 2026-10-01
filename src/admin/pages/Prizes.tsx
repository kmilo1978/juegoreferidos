import { useEffect, useState } from "react";
import { Loader2, Ticket } from "lucide-react";

export function Prizes() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pin, setPin] = useState("");
  const [validating, setValidating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/config')
      .then(res => res.json())
      .then(data => {
        setConfig(data.settings);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return;
    setValidating(true);
    setError(null);
    setSuccessMsg(null);
    
    try {
      const res = await fetch('http://localhost:3001/api/validate-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, prizeId: "manual" }) // mock
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al validar PIN');
      setSuccessMsg('Premio validado con éxito');
      setShowModal(false);
      setPin("");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setValidating(false);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[#e6e1e7] font-bold text-lg font-[Epilogue]">Gestión de Premios</h3>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-6 py-3 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2"
        >
          <Ticket className="w-5 h-5" />
          Validar Premio (PIN)
        </button>
      </div>

      {error && !showModal && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-[#10b981]/20 border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl">
          {successMsg}
        </div>
      )}

      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6">
        <h4 className="text-[#e6e1e7] font-bold mb-4">Premios Configurados</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {config?.prizes?.map((prize: any, idx: number) => (
            <div key={idx} className="bg-[#201f23] border border-[#363439] rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-[#e6e1e7] font-bold">{prize.name}</p>
                <p className="text-[#958da1] text-xs">Probabilidad: {prize.probability}%</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${prize.active ? 'bg-[#10b981]' : 'bg-[#363439]'}`} />
            </div>
          ))}
          {(!config?.prizes || config.prizes.length === 0) && (
            <p className="text-[#958da1]">No hay premios configurados</p>
          )}
        </div>
      </div>

      {/* Modal PIN */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-[#e6e1e7] font-bold text-lg font-[Epilogue] mb-4">Validar Premio</h3>
            <form onSubmit={handleValidate} className="space-y-4">
              <div>
                <label className="block text-[#ccc3d8] text-sm mb-2">PIN del cliente (4 dígitos)</label>
                <input 
                  type="text" 
                  maxLength={4}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-center text-2xl tracking-widest font-mono"
                  placeholder="0000"
                  autoFocus
                />
              </div>
              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-[#201f23] border border-[#363439] text-[#ccc3d8] rounded-xl px-4 py-3 hover:bg-[#2b292e] cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={validating || pin.length !== 4}
                  className="flex-1 bg-[#f2be71] text-[#121115] font-bold rounded-xl px-4 py-3 hover:brightness-105 active:scale-98 cursor-pointer transition-all disabled:opacity-50"
                >
                  {validating ? 'Validando...' : 'Validar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
