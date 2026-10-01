import { useEffect, useState } from "react";
import { StatusBadge } from "../components/StatusBadge";
import { Loader2, QrCode } from "lucide-react";

interface Table {
  id: string;
  name: string;
  zone: string;
  status: string;
  customerName?: string;
  prizeWon?: string;
}

export function Sessions() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/tables')
      .then(res => res.json())
      .then(data => {
        setTables(Array.isArray(data) ? data : (data.tables || []));
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
        <h3 className="text-[#e6e1e7] font-bold text-lg font-[Epilogue]">Gestión de Mesas</h3>
        <button className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-6 py-3 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Generar QR Múltiple
        </button>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#2b292e]/50 text-[#ccc3d8] text-sm">
                <th className="px-6 py-4 font-medium border-b border-[#363439]">Mesa</th>
                <th className="px-6 py-4 font-medium border-b border-[#363439]">Zona</th>
                <th className="px-6 py-4 font-medium border-b border-[#363439]">Cliente Actual</th>
                <th className="px-6 py-4 font-medium border-b border-[#363439]">Estado</th>
                <th className="px-6 py-4 font-medium border-b border-[#363439]">Premio Pendiente</th>
                <th className="px-6 py-4 font-medium border-b border-[#363439] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#363439]">
              {tables.map(table => (
                <tr key={table.id} className="hover:bg-[#2b292e]/30 transition-colors">
                  <td className="px-6 py-4 text-[#f2be71] font-bold">{table.name}</td>
                  <td className="px-6 py-4 text-[#e6e1e7]">{table.zone}</td>
                  <td className="px-6 py-4 text-[#ccc3d8]">{table.customerName || '-'}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={table.status} />
                  </td>
                  <td className="px-6 py-4 text-[#e6e1e7]">{table.prizeWon || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="bg-[#1c1b1f] border border-[#f2be71]/40 text-[#f2be71] rounded-xl px-4 py-2 hover:border-[#f2be71]/70 cursor-pointer text-sm font-medium">
                      Ver QR
                    </button>
                  </td>
                </tr>
              ))}
              {tables.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#958da1]">
                    No hay mesas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
