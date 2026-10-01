import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Gift,
  Target,
  Settings,
  Wifi,
  Bell,
  Star,
  Award,
  Gamepad2,
  MessageCircle,
  Shield,
  Database,
  Bot,
  Zap,
} from "lucide-react";
import { useMemo } from "react";

export function AdminLayout() {
  const location = useLocation();

  const title = useMemo(() => {
    switch (location.pathname) {
      case "/": return "Operaciones & Métricas";
      case "/sessions": return "10 Mesas en Vivo";
      case "/prizes": return "Premios de Ruleta & Vouchers";
      case "/stamps": return "Tarjeta de 15 Sellos & Sorteo";
      case "/missions": return "Misiones & Embajadores";
      case "/reputation": return "Embudo de Reputación";
      case "/game-mode": return "Mecánicas de Juego & 2ª Oportunidad";
      case "/wifi": return "Portal Cautivo WiFi & Kiosko";
      case "/channels": return "Canales & WhatsApp";
      case "/push": return "Ofertas Push & Flujos";
      case "/config": return "Identidad, Marca & Ruleta";
      case "/security": return "Seguridad, Roles & PINs de Caja";
      case "/databases": return "Bases de Datos & Sincronización";
      case "/hermes": return "Hermes IA & WhatsApp";
      case "/composio": return "Integraciones Composio";
      default: return "Panel Administrativo";
    }
  }, [location.pathname]);

  const navGroups = [
    {
      group: "Operaciones en Sala",
      items: [
        { path: "/", label: "Dashboard", icon: LayoutDashboard },
        { path: "/sessions", label: "10 Mesas en Vivo", icon: Users },
        { path: "/prizes", label: "Premios & Canjes", icon: Gift },
        { path: "/stamps", label: "15 Sellos & Sorteo", icon: Award },
        { path: "/missions", label: "Misiones & Tareas", icon: Target },
        { path: "/reputation", label: "Embudo Reputación", icon: Star },
      ],
    },
    {
      group: "Juego & Captación",
      items: [
        { path: "/game-mode", label: "Mecánica & 2ª Op.", icon: Gamepad2 },
        { path: "/wifi", label: "Portal WiFi / Kiosko", icon: Wifi },
        { path: "/channels", label: "Canales & WhatsApp", icon: MessageCircle },
        { path: "/push", label: "Notificaciones Push", icon: Bell },
      ],
    },
    {
      group: "Ajustes & Sistema",
      items: [
        { path: "/config", label: "Marca & Ajustes", icon: Settings },
        { path: "/security", label: "Seguridad & PINs", icon: Shield },
        { path: "/databases", label: "Bases de Datos", icon: Database },
        { path: "/hermes", label: "Hermes IA", icon: Bot },
        { path: "/composio", label: "Composio", icon: Zap },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#141317]">
      {/* Sidebar fijo elegante */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-[#0f0e12] border-r border-[#363439] flex flex-col z-20">
        <div className="p-5 border-b border-[#363439]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#684400]/40 border border-[#f2be71]/40 flex items-center justify-center text-[#f2be71] font-bold text-sm">
              BS
            </div>
            <div>
              <h1 className="text-[#f2be71] font-['Epilogue'] font-bold text-base leading-tight">Bliss Soul</h1>
              <p className="text-[11px] text-[#ccc3d8]">Panel de Control Modular</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <span className="px-3 text-[10px] uppercase font-bold tracking-wider text-[#958da1]">
                {group.group}
              </span>
              <div className="mt-1 space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-[#2b292e] text-[#f2be71] shadow-sm border border-[#f2be71]/30 font-bold"
                          : "text-[#ccc3d8] hover:text-[#f2be71] hover:bg-[#1c1b1f]"
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer del Sidebar con enlace a juego en mesa */}
        <div className="p-3 border-t border-[#363439] bg-[#0b0a0d]">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-[#1c1b1f] hover:bg-[#201f23] border border-[#f2be71]/30 text-[#f2be71] text-xs font-bold transition-colors"
          >
            <span>📱 Abrir Juego QR en Mesa</span>
          </a>
        </div>
      </aside>

      {/* Área Principal de Contenido */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Topbar sticky */}
        <header className="bg-[#0f0e12]/95 backdrop-blur-md border-b border-[#363439] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-[#e6e1e7] font-['Epilogue'] font-bold text-lg leading-tight">{title}</h2>
            <span className="text-[11px] text-[#ccc3d8]">Bliss Soul Bakery & Café • Mesa 1 a 10</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-[#ccc3d8] text-xs hidden md:block">
              {new Date().toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            </div>
            <div className="flex items-center gap-2 bg-[#1c1b1f] border border-[#363439] rounded-full px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></div>
              <span className="text-[11px] text-[#10b981] font-semibold">Backend :3001</span>
            </div>
          </div>
        </header>

        {/* Contenido Modular */}
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
