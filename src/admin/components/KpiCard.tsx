export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: 'gold' | 'emerald' | 'amber' | 'lila';
}

export function KpiCard({ title, value, subtitle, accent = 'gold' }: KpiCardProps) {
  const accentColors = {
    gold: "text-[#f2be71]",
    emerald: "text-[#10b981]",
    amber: "text-[#f59e0b]",
    lila: "text-[#ccc3d8]",
  };

  return (
    <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 flex flex-col">
      <h3 className="text-[#ccc3d8] text-sm font-medium mb-2">{title}</h3>
      <div className={`text-3xl font-['Epilogue'] font-bold ${accentColors[accent]}`}>
        {value}
      </div>
      {subtitle && (
        <p className="text-[#958da1] text-xs mt-2">{subtitle}</p>
      )}
    </div>
  );
}
