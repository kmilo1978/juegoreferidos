import { Component, ReactNode } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { Dashboard } from "./pages/Dashboard";
import { Sessions } from "./pages/Sessions";
import { Prizes } from "./pages/Prizes";
import { Missions } from "./pages/Missions";
import { AdminConfig } from "./pages/AdminConfig";
import { WifiPortal } from "./pages/WifiPortal";
import { Push } from "./pages/Push";

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
            <button
              onClick={() => window.location.reload()}
              className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-5 py-2.5 text-sm hover:brightness-105 cursor-pointer"
            >
              Recargar Dashboard
            </button>
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
            <Route index element={<Dashboard />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="prizes" element={<Prizes />} />
            <Route path="missions" element={<Missions />} />
            <Route path="config" element={<AdminConfig />} />
            <Route path="wifi" element={<WifiPortal />} />
            <Route path="push" element={<Push />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  );
}
