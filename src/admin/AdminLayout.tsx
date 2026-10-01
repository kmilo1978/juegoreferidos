import { Outlet, NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Gift, Target, Settings, Wifi, Bell } from "lucide-react";
import { useMemo } from "react";

export function AdminLayout() {
  const location = useLocation();

  const title = useMemo(() => {
    switch (location.pathname) {
      case "/": return "Dashboard";
      case "/sessions": return "Mesas / Sesiones";
      case "/prizes": return "Premios";
      case "/missions": return "Misiones";
      case "/config": return "Configuración";
      case "/wifi": return "Portal WiFi";
      case "/push": return "Notificaciones";
      default: return "Dashboard";
    }
  }, [location.pathname]);

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/sessions", label: "Mesas", icon: Users },
    { path: "/prizes", label: "Premios", icon: Gift },
    { path: "/missions", label: "Misiones", icon: Target },
    { path: "/config", label: "Configuración", icon: Settings },
    { path: "/wifi", label: "Portal WiFi", icon: Wifi },
    { path: "/push", label: "Notificaciones", icon: Bell },
  ];

  return (
    <div className="flex min-h-screen bg-[#141317]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-60 bg-[#0f0e12] border-r border-[#363439] flex flex-col">
        <div className="p-6 border-b border-[#363439]">
          <h1 className="text-[#f2be71] font-['Epilogue'] font-bold text-xl">Bliss Soul</h1>
          <p className="text-[#ccc3d8] text-sm">Admin Dashboard</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive
                    ? "bg-[#2b292e] text-[#f2be71] border-l-2 border-[#f2be71]"
                    : "text-[#ccc3d8] border-l-2 border-transparent hover:text-[#f2be71] hover:bg-[#1c1b1f]"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="bg-[#0f0e12] border-b border-[#363439] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-[#e6e1e7] font-['Epilogue'] font-bold text-xl">{title}</h2>
          <div className="flex items-center gap-4">
            <div className="text-[#ccc3d8] text-sm hidden sm:block">
              {new Date().toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-2 bg-[#1c1b1f] border border-[#363439] rounded-full px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></div>
              <span className="text-xs text-[#10b981] font-medium">Servidor activo</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
