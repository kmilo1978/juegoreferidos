import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface Mission {
  id: string;
  category?: string;
  title: string;
  rewardStamps?: number;
  description?: string;
  active: boolean;
}

interface Submission {
  id: string;
  missionId?: string;
  missionTitle?: string;
  customerName?: string;
  customerWhatsapp?: string;
  evidenceUrl?: string;
  status: string;
  submittedAt?: string;
  dateFormatted?: string;
}

export function Missions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/missions')
      .then(res => res.json())
      .then(data => {
        setMissions(data.missions || []);
        setSubmissions(data.submissions || []);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('http://localhost:3001/api/missions/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: id, action })
      });
      if (!res.ok) throw new Error('Error al revisar misión');
      
      setSubmissions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error desconocido');
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
      <h3 className="text-[#e6e1e7] font-bold text-lg font-[Epilogue] mb-6">Misiones y Social</h3>

      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-[#ccc3d8] font-medium">Cola de Revisión</h4>
          {submissions.filter(s => s.status?.toUpperCase() === 'PENDING' || s.status?.toUpperCase() === 'PENDIENTE').map(sub => (
            <div key={sub.id} className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[#e6e1e7] font-bold">Cliente: {sub.customerName || sub.customerWhatsapp || "Invitado"}</p>
                  <p className="text-[#f2be71] text-sm font-semibold">{sub.missionTitle || sub.missionId}</p>
                  <p className="text-[#958da1] text-xs mt-1">
                    {sub.dateFormatted || sub.submittedAt || "Reciente"}
                  </p>
                </div>
              </div>
              {sub.evidenceUrl && (
                <div className="mb-4 bg-[#201f23] p-3 rounded-xl text-sm text-[#60a5fa] truncate">
                  <a href={sub.evidenceUrl} target="_blank" rel="noreferrer" className="underline">
                    Ver evidencia / enlace publicado ↗
                  </a>
                </div>
              )}
              <div className="flex gap-3">
                <button 
                  onClick={() => handleReview(sub.id, 'reject')}
                  className="flex-1 bg-[#1c1b1f] border border-red-500/40 text-red-400 rounded-xl px-4 py-2 hover:bg-red-500/10 cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Rechazar
                </button>
                <button 
                  onClick={() => handleReview(sub.id, 'approve')}
                  className="flex-1 bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981] rounded-xl px-4 py-2 hover:bg-[#10b981]/30 cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Aprobar
                </button>
              </div>
            </div>
          ))}
          {submissions.filter(s => s.status?.toUpperCase() === 'PENDING' || s.status?.toUpperCase() === 'PENDIENTE').length === 0 && (
            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-8 text-center text-[#958da1]">
              No hay misiones pendientes de revisión.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-[#ccc3d8] font-medium">Misiones Activas</h4>
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6">
            <div className="space-y-4">
              {missions.map(mission => (
                <div key={mission.id} className="flex items-center justify-between border-b border-[#363439] pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="text-[#e6e1e7] font-bold">{mission.title}</p>
                    <p className="text-[#958da1] text-sm">{mission.category || mission.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[#f2be71] font-bold">+{mission.rewardStamps || 1} sellos</span>
                    <div className="mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${mission.active ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#363439] text-[#958da1]'}`}>
                        {mission.active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {missions.length === 0 && (
                <div className="text-center text-[#958da1] py-4">
                  No hay misiones configuradas.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
