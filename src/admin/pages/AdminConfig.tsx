import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

type TabType = 'marca' | 'ruleta' | 'juego' | 'segunda';

export function AdminConfig() {
  const [activeTab, setActiveTab] = useState<TabType>('marca');
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3001/api/config').then(r => r.json()),
      fetch('http://localhost:3001/api/game-config').then(r => r.json()),
      fetch('http://localhost:3001/api/second-chance-config').then(r => r.json())
    ])
    .then(([mainConf, gameConf, secondConf]) => {
      setConfig({
        ...mainConf.settings,
        gameConfig: gameConf.gameConfig,
        secondChance: secondConf.secondChance
      });
    })
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (activeTab === 'juego') {
        await fetch('http://localhost:3001/api/game-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config.gameConfig)
        });
      } else if (activeTab === 'segunda') {
        await fetch('http://localhost:3001/api/second-chance-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config.secondChance)
        });
      } else {
        await fetch('http://localhost:3001/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brand: config.brand,
            channels: config.channels,
            prizes: config.prizes
          })
        });
      }
      setSuccess('Configuración guardada correctamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleNestedChange = (category: string, field: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#f2be71] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[#e6e1e7] font-bold text-lg font-[Epilogue]">Configuración Global</h3>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-6 py-3 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Guardar Cambios
        </button>
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

      <div className="flex gap-2 border-b border-[#363439] pb-4">
        {[
          { id: 'marca', label: 'Marca' },
          { id: 'ruleta', label: 'Ruleta' },
          { id: 'juego', label: 'Juego' },
          { id: 'segunda', label: 'Segunda Oportunidad' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab.id 
                ? 'bg-[#2b292e] text-[#f2be71]' 
                : 'text-[#ccc3d8] hover:bg-[#1c1b1f] hover:text-[#e6e1e7]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6">
        {activeTab === 'marca' && (
          <div className="space-y-6">
            <h4 className="text-[#e6e1e7] font-bold">Identidad de Marca</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#ccc3d8] text-sm mb-2">Nombre de la Marca</label>
                <input 
                  type="text" 
                  value={config.brand?.name || ''}
                  onChange={e => handleNestedChange('brand', 'name', e.target.value)}
                  className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full"
                />
              </div>
              <div>
                <label className="block text-[#ccc3d8] text-sm mb-2">Eslogan (Tagline)</label>
                <input 
                  type="text" 
                  value={config.brand?.tagline || ''}
                  onChange={e => handleNestedChange('brand', 'tagline', e.target.value)}
                  className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full"
                />
              </div>
              <div>
                <label className="block text-[#ccc3d8] text-sm mb-2">Instagram Handle</label>
                <input 
                  type="text" 
                  value={config.channels?.instagramHandle || ''}
                  onChange={e => handleNestedChange('channels', 'instagramHandle', e.target.value)}
                  className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full"
                />
              </div>
              <div>
                <label className="block text-[#ccc3d8] text-sm mb-2">Número WhatsApp</label>
                <input 
                  type="text" 
                  value={config.channels?.whatsappNumber || ''}
                  onChange={e => handleNestedChange('channels', 'whatsappNumber', e.target.value)}
                  className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ruleta' && (
          <div className="space-y-6">
            <h4 className="text-[#e6e1e7] font-bold">Premios de la Ruleta</h4>
            <p className="text-[#958da1] text-sm mb-4">Modifica los premios disponibles. (Simplificado para la demo)</p>
            <div className="space-y-4">
              {config.prizes?.map((prize: any, index: number) => (
                <div key={index} className="flex gap-4 items-center bg-[#201f23] p-4 rounded-xl border border-[#363439]">
                  <input 
                    type="text" 
                    value={prize.name}
                    onChange={e => {
                      const newPrizes = [...config.prizes];
                      newPrizes[index].name = e.target.value;
                      setConfig({...config, prizes: newPrizes});
                    }}
                    className="flex-1 bg-[#141317] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-lg px-3 py-2"
                  />
                  <div className="w-24">
                    <input 
                      type="number" 
                      value={prize.probability}
                      onChange={e => {
                        const newPrizes = [...config.prizes];
                        newPrizes[index].probability = Number(e.target.value);
                        setConfig({...config, prizes: newPrizes});
                      }}
                      className="w-full bg-[#141317] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-lg px-3 py-2"
                    />
                  </div>
                  <span className="text-[#958da1] text-sm">%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'juego' && (
          <div className="space-y-6">
            <h4 className="text-[#e6e1e7] font-bold">Configuración de Parada de Ruleta</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#ccc3d8] text-sm mb-2">Modo de Juego</label>
                <select 
                  value={config.gameConfig?.gameMode || 'normal'}
                  onChange={e => handleNestedChange('gameConfig', 'gameMode', e.target.value)}
                  className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full"
                >
                  <option value="normal">Normal</option>
                  <option value="hard">Difícil</option>
                  <option value="easy">Fácil</option>
                </select>
              </div>
              <div>
                <label className="block text-[#ccc3d8] text-sm mb-2">Intentos Máximos</label>
                <input 
                  type="number" 
                  value={config.gameConfig?.maxAttempts || 1}
                  onChange={e => handleNestedChange('gameConfig', 'maxAttempts', Number(e.target.value))}
                  className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full"
                />
              </div>
              <div>
                <label className="block text-[#ccc3d8] text-sm mb-2">Tolerancia (ms)</label>
                <input 
                  type="number" 
                  value={config.gameConfig?.toleranceMs || 100}
                  onChange={e => handleNestedChange('gameConfig', 'toleranceMs', Number(e.target.value))}
                  className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'segunda' && (
          <div className="space-y-6">
            <h4 className="text-[#e6e1e7] font-bold">Segunda Oportunidad</h4>
            <div className="flex items-center gap-3 mb-6">
              <input 
                type="checkbox" 
                id="sec-enabled"
                checked={config.secondChance?.enabled || false}
                onChange={e => handleNestedChange('secondChance', 'enabled', e.target.checked)}
                className="w-5 h-5 accent-[#f2be71] rounded bg-[#201f23] border-[#363439]"
              />
              <label htmlFor="sec-enabled" className="text-[#ccc3d8]">Habilitar Segunda Oportunidad</label>
            </div>
            {config.secondChance?.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#ccc3d8] text-sm mb-2">Nombre del Premio</label>
                  <input 
                    type="text" 
                    value={config.secondChance?.prizeName || ''}
                    onChange={e => handleNestedChange('secondChance', 'prizeName', e.target.value)}
                    className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full"
                  />
                </div>
                <div>
                  <label className="block text-[#ccc3d8] text-sm mb-2">Valor de Consuelo</label>
                  <input 
                    type="text" 
                    value={config.secondChance?.prizeValue || ''}
                    onChange={e => handleNestedChange('secondChance', 'prizeValue', e.target.value)}
                    className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
