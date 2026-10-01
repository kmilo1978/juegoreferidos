import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";

export function Push() {
  const [subscribers, setSubscribers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    url: ''
  });

  useEffect(() => {
    fetch('http://localhost:3001/api/push/subscribers')
      .then(res => res.json())
      .then(data => {
        setSubscribers(data.count || 0);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('http://localhost:3001/api/push/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Error al enviar notificación');
      setSuccess('Notificación enviada a todos los suscriptores');
      setFormData({ title: '', body: '', url: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSending(false);
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
    <div className="space-y-6 max-w-2xl">
      <h3 className="text-[#e6e1e7] font-bold text-lg font-[Epilogue] mb-6">Notificaciones Push</h3>

      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 flex items-center justify-between mb-6">
        <div>
          <h4 className="text-[#ccc3d8] font-medium">Suscriptores Activos</h4>
          <p className="text-[#958da1] text-sm mt-1">Clientes que han aceptado recibir notificaciones web.</p>
        </div>
        <div className="text-3xl font-['Epilogue'] font-bold text-[#f2be71]">
          {subscribers}
        </div>
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

      <form onSubmit={handleBroadcast} className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6">
        <h4 className="text-[#e6e1e7] font-bold border-b border-[#363439] pb-4">Enviar Broadcast</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[#ccc3d8] text-sm mb-2">Título de la Notificación</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Ej: ¡Hora Feliz en Bliss Soul!"
              className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full"
            />
          </div>
          
          <div>
            <label className="block text-[#ccc3d8] text-sm mb-2">Mensaje (Cuerpo)</label>
            <textarea 
              required
              rows={3}
              value={formData.body}
              onChange={e => setFormData({...formData, body: e.target.value})}
              placeholder="Ej: Ven hoy y disfruta de un 2x1 en cafés especiales mostrando esta notificación."
              className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full resize-none"
            />
          </div>

          <div>
            <label className="block text-[#ccc3d8] text-sm mb-2">URL de Destino (Opcional)</label>
            <input 
              type="url" 
              value={formData.url}
              onChange={e => setFormData({...formData, url: e.target.value})}
              placeholder="https://..."
              className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit"
            disabled={sending || subscribers === 0}
            className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-6 py-3 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Enviar a Todos
          </button>
        </div>
      </form>
    </div>
  );
}
