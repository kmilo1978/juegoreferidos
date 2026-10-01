import { useEffect, useState } from "react";
import { KpiCard } from "../components/KpiCard";
import { StatusBadge } from "../components/StatusBadge";
import { Loader2 } from "lucide-react";

interface Metrics {
  totalPrizes: number;
  redeemedPrizes: number;
  totalCustomers: number;
  conversionRate: string;
  logs: { timestamp: string; message: string }[];
}

interface Table {
  id: string;
  name: string;
  zone: string;
  status: string;
  customerName?: string;
  prizeWon?: string;
}

export function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [metricsRes, tablesRes] = await Promise.all([
        fetch('http://localhost:3001/api/metrics'),
        fetch('http://localhost:3001/api/tables')
      ]);

      if (!metricsRes.ok || !tablesRes.ok) throw new Error('Error al cargar datos');

      const metricsData = await metricsRes.json();
      const tablesData = await tablesRes.json();

      setMetrics(metricsData);
      setTables(Array.isArray(tablesData) ? tablesData : (tablesData.tables || []));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#f2be71] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard 
            title="Premios Entregados" 
            value={metrics.totalPrizes} 
            accent="gold" 
          />
          <KpiCard 
            title="Premios Canjeados" 
            value={metrics.redeemedPrizes} 
            accent="emerald" 
          />
          <KpiCard 
            title="Clientes Únicos" 
            value={metrics.totalCustomers} 
            accent="lila" 
          />
          <KpiCard 
            title="Tasa de Conversión" 
            value={`${metrics.conversionRate}%`} 
            accent="amber" 
          />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <h3 className="text-[#e6e1e7] font-bold text-lg font-[Epilogue]">Estado de Mesas</h3>
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#2b292e]/50 text-[#ccc3d8] text-sm">
                    <th className="px-6 py-4 font-medium border-b border-[#363439]">Mesa</th>
                    <th className="px-6 py-4 font-medium border-b border-[#363439]">Zona</th>
                    <th className="px-6 py-4 font-medium border-b border-[#363439]">Cliente</th>
                    <th className="px-6 py-4 font-medium border-b border-[#363439]">Estado</th>
                    <th className="px-6 py-4 font-medium border-b border-[#363439]">Premio</th>
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
                    </tr>
                  ))}
                  {tables.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-[#958da1]">
                        No hay mesas registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[#e6e1e7] font-bold text-lg font-[Epilogue]">Actividad Reciente</h3>
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6">
            <div className="space-y-4">
              {metrics?.logs?.slice(0, 10).map((log, i) => (
                <div key={i} className="flex gap-4 items-start text-sm">
                  <span className="text-[#958da1] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <span className="text-[#ccc3d8]">{log.message}</span>
                </div>
              ))}
              {(!metrics?.logs || metrics.logs.length === 0) && (
                <div className="text-center text-[#958da1] py-4">Sin actividad reciente</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
