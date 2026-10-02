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
  BarChart3,
  Trophy,
  Smartphone,
  Sun,
  Moon,
  Radio,
  ChevronDown,
  RotateCw,
  Timer,
  Flame,
  Share2,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";

export function AdminLayout() {
  const location = useLocation();
  const [themeMode, setThemeMode] = useState<"night" | "day">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_theme_mode");
      if (saved === "day" || saved === "night") return saved;
    }
    return "night";
  });

  const [brand, setBrand] = useState<{ name: string; tagline: string; logoUrl?: string; primaryColor?: string }>({
    name: "Tu Negocio",
    tagline: "Panel de Control Modular",
  });

  const toggleTheme = (mode: "night" | "day") => {
    setThemeMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_theme_mode", mode);
    }
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (themeMode === "day") {
        document.documentElement.classList.add("theme-light");
        document.documentElement.classList.remove("theme-dark");
      } else {
        document.documentElement.classList.add("theme-dark");
        document.documentElement.classList.remove("theme-light");
      }
    }
  }, [themeMode]);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.brand) {
          setBrand({
            name: data.settings.brand.name || "Tu Negocio",
            tagline: data.settings.brand.tagline || "Panel de Control Modular",
            logoUrl: data.settings.brand.logoUrl,
            primaryColor: data.settings.brand.primaryColor || "#f2be71",
          });
        }
      })
      .catch(() => {});
  }, []);

  const [gamesSubmenuOpen, setGamesSubmenuOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash || "";
      if (hash.includes("/games") || hash.includes("/game-mode") || hash.includes("/demo")) return true;
      const saved = localStorage.getItem("admin_games_submenu");
      if (saved !== null) return saved === "true";
    }
    return true;
  });

  const toggleGamesSubmenu = () => {
    setGamesSubmenuOpen((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_games_submenu", String(next));
      }
      return next;
    });
  };

  useEffect(() => {
    if (location.pathname.startsWith("/games") || location.pathname === "/game-mode" || location.pathname === "/demo") {
      setGamesSubmenuOpen(true);
    }
  }, [location.pathname]);

  const title = useMemo(() => {
    switch (location.pathname) {
      case "/": return "Operaciones & Métricas";
      case "/sessions": return "10 Mesas en Vivo";
      case "/prizes": return "Premios de Ruleta & Vouchers";
      case "/stamps": return "Tarjeta de 15 Sellos & Sorteo";
      case "/missions": return "Misiones & Embajadores";
      case "/contest": return "Sorteo VIP Fin de Mes";
      case "/reputation": return "Embudo de Reputación";
      case "/games": return "Catálogo Modular de Juegos & Dinámicas";
      case "/games/roulette": return "Ruleta de Premios & Probabilidades";
      case "/games/precision": return "Reto Cronómetro de Precisión 10s";
      case "/games/scratch": return "Raspa y Gana Digital (Scratch & Win)";
      case "/games/second-chance": return "Segunda Oportunidad Viral (WhatsApp)";
      case "/game-mode": return "Catálogo Modular de Juegos";
      case "/demo": return "Simulador Frontend (Demo en Vivo)";
      case "/nfc": return "Asistente NFC & Mesas Contactless";
      case "/wifi": return "Portal Cautivo WiFi & Kiosko";
      case "/channels": return "Canales & WhatsApp";
      case "/push": return "Ofertas Push & Flujos";
      case "/config": return "Identidad, Marca & Ruleta";
      case "/security": return "Seguridad, Roles & PINs de Caja";
      case "/databases": return "Bases de Datos & Sincronización";
      case "/hermes": return "Hermes IA & WhatsApp";
      case "/composio": return "Integraciones Composio";
      case "/analytics": return "Analítica, GTM & Píxeles";
      default: return "Panel Administrativo";
    }
  }, [location.pathname]);

  const gamesSubmenuItems = [
    { path: "/games", label: "Catálogo de Juegos (Hub)", icon: Gamepad2, end: true },
    { path: "/games/roulette", label: "Ruleta de Premios", icon: RotateCw },
    { path: "/games/precision", label: "Reto Precisión 10s", icon: Timer },
    { path: "/games/scratch", label: "Raspa y Gana (Scratch)", icon: Flame },
    { path: "/games/second-chance", label: "2ª Oportunidad Viral", icon: Share2 },
  ];

  const navGroups = [
    {
      group: "Operaciones en Sala",
      items: [
        { path: "/", label: "Dashboard", icon: LayoutDashboard },
        { path: "/sessions", label: "10 Mesas en Vivo", icon: Users },
        { path: "/prizes", label: "Premios & Canjes", icon: Gift },
        { path: "/stamps", label: "Sellos de Visitas", icon: Award },
        { path: "/missions", label: "Misiones & Tareas", icon: Target },
        { path: "/contest", label: "Sorteo VIP Fin de Mes", icon: Trophy },
        { path: "/reputation", label: "Embudo Reputación", icon: Star },
      ],
    },
    {
      group: "Juego & Captación",
      hasGamesSubmenu: true,
      items: [
        { path: "/demo", label: "Simulador Frontend (Demo)", icon: Smartphone },
        { path: "/nfc", label: "Asistente NFC Mesas", icon: Radio },
        { path: "/wifi", label: "Portal WiFi / Kiosko", icon: Wifi },
        { path: "/channels", label: "Canales & WhatsApp", icon: MessageCircle },
        { path: "/push", label: "Notificaciones Push", icon: Bell },
      ],
    },
    {
      group: "Ajustes & Sistema",
      items: [
        { path: "/config", label: "Marca & Ajustes", icon: Settings },
        { path: "/analytics", label: "GTM & Píxeles", icon: BarChart3 },
        { path: "/security", label: "Seguridad & PINs", icon: Shield },
        { path: "/databases", label: "Bases de Datos", icon: Database },
        { path: "/hermes", label: "Hermes IA", icon: Bot },
        { path: "/composio", label: "Composio", icon: Zap },
      ],
    },
  ];

  const isAnyGameActive = location.pathname.startsWith("/games") || location.pathname === "/game-mode";

  const brandInitials = brand.name
    ? brand.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "TN";

  return (
    <div className={`flex min-h-screen ${themeMode === "day" ? "theme-light bg-[#f8f6f2] text-[#1c1917]" : "theme-dark bg-[#141317] text-[#e6e1e7]"} transition-colors duration-200`}>
      {/* Sidebar fijo elegante */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-[#0f0e12] border-r border-[#363439] flex flex-col z-20">
        <div className="p-5 border-b border-[#363439]">
          <div className="flex items-center gap-3">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.name} className="w-9 h-9 rounded-xl object-contain bg-[#1c1b1f] border border-[#f2be71]/40 p-1" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-[#684400]/40 border border-[#f2be71]/40 flex items-center justify-center text-[#f2be71] font-bold text-sm shrink-0">
                {brandInitials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-[#f2be71] font-['Epilogue'] font-bold text-sm leading-tight truncate">
                {brand.name}
              </h1>
              <p className="text-[10px] text-[#ccc3d8] truncate">{brand.tagline}</p>
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
                {/* SUBMENÚ MODULAR DE JUEGOS */}
                {group.hasGamesSubmenu && (
                  <div className="space-y-0.5 mb-1">
                    <button
                      type="button"
                      onClick={toggleGamesSubmenu}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isAnyGameActive
                          ? "bg-[#252220] text-[#f2be71] border border-[#f2be71]/30"
                          : "text-[#ccc3d8] hover:text-[#f2be71] hover:bg-[#1c1b1f]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Gamepad2 className={`w-4 h-4 shrink-0 ${isAnyGameActive ? "text-[#f2be71]" : "text-[#ccc3d8]"}`} />
                        <span className="truncate font-bold">Juegos & Dinámicas</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] font-mono font-bold bg-[#f2be71]/15 text-[#f2be71] px-1.5 py-0.5 rounded-full border border-[#f2be71]/30">
                          {gamesSubmenuItems.length}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            gamesSubmenuOpen ? "rotate-0 text-[#f2be71]" : "-rotate-90 text-[#958da1]"
                          }`}
                        />
                      </div>
                    </button>

                    {/* ELEMENTOS HIJOS DEL SUBMENÚ DE JUEGOS */}
                    {gamesSubmenuOpen && (
                      <div className="ml-3 pl-2.5 border-l-2 border-[#363439] space-y-0.5 py-1 animate-fade-in">
                        {gamesSubmenuItems.map((sub) => (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            end={sub.end}
                            className={({ isActive }) =>
                              `flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                                isActive
                                  ? "bg-[#2b292e] text-[#f2be71] font-bold border-l-2 border-[#f2be71] shadow-xs"
                                  : "text-[#ccc3d8] hover:text-[#f2be71] hover:bg-[#1c1b1f]"
                              }`
                            }
                          >
                            <sub.icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                            <span className="truncate">{sub.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ÍTEMS DIRECTOS NORMALES */}
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

        {/* Footer del Sidebar con enlace a juego en mesa y selector de tema */}
        <div className="p-3 border-t border-[#363439] bg-[#0b0a0d] space-y-2">
          {/* Selector Rápido de Tema en Sidebar */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#1c1b1f] border border-[#363439]">
            <span className="text-[11px] font-semibold text-[#ccc3d8] flex items-center gap-1.5">
              {themeMode === "day" ? <Sun className="w-3.5 h-3.5 text-[#f2be71]" /> : <Moon className="w-3.5 h-3.5 text-[#f2be71]" />}
              <span>{themeMode === "day" ? "Modo Día (Luz)" : "Modo Noche (Dark)"}</span>
            </span>
            <button
              type="button"
              onClick={() => toggleTheme(themeMode === "day" ? "night" : "day")}
              className="text-[10px] uppercase font-bold text-[#f2be71] hover:underline cursor-pointer"
            >
              Cambiar
            </button>
          </div>

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
        {/* Topbar sticky con Toggle Día / Noche */}
        <header className="bg-[#0f0e12]/95 backdrop-blur-md border-b border-[#363439] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-[#e6e1e7] font-['Epilogue'] font-bold text-lg leading-tight">{title}</h2>
            <span className="text-[11px] text-[#ccc3d8]">{brand.name} • Mesas en Vivo</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle de Modo Día / Noche */}
            <div className="flex items-center bg-[#1c1b1f] border border-[#363439] rounded-full p-1 shadow-inner gap-1">
              <button
                type="button"
                onClick={() => toggleTheme("day")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  themeMode === "day"
                    ? "bg-[#f2be71] text-[#121115] shadow-sm font-black"
                    : "text-[#ccc3d8] hover:text-[#f2be71]"
                }`}
                title="Activar Modo Día (Luz)"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Día</span>
              </button>

              <button
                type="button"
                onClick={() => toggleTheme("night")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  themeMode === "night"
                    ? "bg-[#2b292e] text-[#f2be71] border border-[#f2be71]/40 shadow-sm font-black"
                    : "text-[#ccc3d8] hover:text-[#f2be71]"
                }`}
                title="Activar Modo Noche (Oscuro)"
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Noche</span>
              </button>
            </div>

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
