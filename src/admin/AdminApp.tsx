import { Component, ReactNode } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { AdminLayout } from "./AdminLayout";
import { Dashboard } from "./pages/Dashboard";
import { Sessions } from "./pages/Sessions";
import { Prizes } from "./pages/Prizes";
import { Stamps } from "./pages/Stamps";
import { Missions } from "./pages/Missions";
import { Reputation } from "./pages/Reputation";
import { GameMode } from "./pages/GameMode";
import { WifiPortal } from "./pages/WifiPortal";
import { Channels } from "./pages/Channels";
import { Push } from "./pages/Push";
import { AdminConfig } from "./pages/AdminConfig";
import { Security } from "./pages/Security";
import { Databases } from "./pages/Databases";
import { Hermes } from "./pages/Hermes";
import { Composio } from "./pages/Composio";
import { Analytics } from "./pages/Analytics";
import { Contest } from "./pages/Contest";
import { Demo } from "./pages/Demo";
import { NfcAssistant } from "./pages/NfcAssistant";
import { GamesHub } from "./pages/games/GamesHub";
import { GameRouletteConfig } from "./pages/games/GameRouletteConfig";
import { GamePrecisionConfig } from "./pages/games/GamePrecisionConfig";
import { GameScratchConfig } from "./pages/games/GameScratchConfig";
import { GameMemoryConfig } from "./pages/games/GameMemoryConfig";
import { GamePickAndWinConfig } from "./pages/games/GamePickAndWinConfig";
import { GameJackpotConfig } from "./pages/games/GameJackpotConfig";
import { GamePlinkoConfig } from "./pages/games/GamePlinkoConfig";
import { GameSecondChanceConfig } from "./pages/games/GameSecondChanceConfig";
import { GameExclusiveCustomizer } from "./pages/games/GameExclusiveCustomizer";

// Blindaje global
if (typeof window !== "undefined") {
  (window as any).BarChart = BarChart3;
  (window as any).BarChart3 = BarChart3;
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#141317] flex items-center justify-center p-6 text-[#e6e1e7]">
          <div className="bg-[#1c1b1f] border border-[#f2be71]/40 rounded-2xl p-8 max-w-md text-center space-y-4 shadow-2xl">
            <h2 className="text-[#f2be71] font-bold text-xl font-['Epilogue']">Aviso del Dashboard</h2>
            <p className="text-sm text-[#ccc3d8]">Hubo un detalle al renderizar los datos del servidor:</p>
            <div className="bg-[#0f0e12] p-3 rounded-xl text-xs text-red-400 font-mono text-left overflow-auto">
              {this.state.error}
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: "" });
                  window.location.hash = "#/";
                  window.location.reload();
                }}
                className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-5 py-2.5 text-sm hover:brightness-105 cursor-pointer shadow-lg transition-all"
              >
                Recargar Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: "" });
                }}
                className="bg-[#201f23] text-[#ccc3d8] hover:text-white border border-[#363439] font-semibold rounded-xl px-4 py-2.5 text-sm cursor-pointer transition-all"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function AdminApp() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            {/* Operaciones en Sala */}
            <Route index element={<Dashboard />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="prizes" element={<Prizes />} />
            <Route path="stamps" element={<Stamps />} />
            <Route path="missions" element={<Missions />} />
            <Route path="contest" element={<Contest />} />
            <Route path="reputation" element={<Reputation />} />

            {/* Juego & Captación (Submenú de Juegos Modulares) */}
            <Route path="games" element={<GamesHub />} />
            <Route path="games/exclusive" element={<GameExclusiveCustomizer />} />
            <Route path="games/roulette" element={<GameRouletteConfig />} />
            <Route path="games/precision" element={<GameSecondChanceConfig />} />
            <Route path="games/scratch" element={<GameScratchConfig />} />
            <Route path="games/memory" element={<GameMemoryConfig />} />
            <Route path="games/pick-win" element={<GamePickAndWinConfig />} />
            <Route path="games/jackpot" element={<GameJackpotConfig />} />
            <Route path="games/plinko" element={<GamePlinkoConfig />} />
            <Route path="games/second-chance" element={<GameSecondChanceConfig />} />
            <Route path="game-mode" element={<GamesHub />} />
            <Route path="demo" element={<Demo />} />
            <Route path="nfc" element={<NfcAssistant />} />
            <Route path="wifi" element={<WifiPortal />} />
            <Route path="channels" element={<Channels />} />
            <Route path="push" element={<Push />} />

            {/* Ajustes & Sistema */}
            <Route path="config" element={<AdminConfig />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="security" element={<Security />} />
            <Route path="databases" element={<Databases />} />
            <Route path="hermes" element={<Hermes />} />
            <Route path="composio" element={<Composio />} />

            {/* Ruta comodín */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  );
}
