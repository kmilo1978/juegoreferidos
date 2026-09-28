import { useState } from "react";
import { GamePrize, WonPrize } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import {
  X,
  BarChart3,
  Sliders,
  MessageSquare,
  Award,
  RotateCcw,
  Eye,
  Calendar,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Users,
  Zap,
  Bell,
  Database,
  Clock,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  Copy,
  Palette,
  Store,
  Edit3,
  Save,
  Check,
  Sparkles,
  Layers,
  Smartphone,
  Gift,
  Lock,
  ShieldAlert,
  LogOut,
  Send,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Radio,
} from "lucide-react";
import { calculateAnalytics } from "../../lib/analyticsService";
import { clientConfig } from "../../config/clientConfig";
import {
  getComposioConfig,
  saveComposioConfig,
  ComposioRuntimeConfig,
} from "../../lib/composioService";
import {
  getPushConfig,
  savePushConfig,
  PushRuntimeConfig,
  OneSignalService,
  getCustomPushTemplates,
  saveCustomPushTemplates,
  resetPushTemplates,
  PushNotificationTemplate,
  formatPushText,
  AutomatedPushFlow,
  getAutomatedFlows,
  saveAutomatedFlows,
} from "../../lib/oneSignalService";
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  SupabaseConfig,
  SupabaseService,
} from "../../lib/supabaseService";
import {
  getActiveCashierPin,
  setActiveCashierPin,
  generateNewCashierPin,
  getMasterAdminPin,
  setMasterAdminPin,
  getManagerAdminPin,
  setManagerAdminPin,
  getRolePermissions,
  saveRolePermissions,
  authenticatePin,
  hasPermission,
  RolePermissions,
} from "../../lib/tableSecurityService";
import {
  getBrandConfig,
  saveBrandConfig,
  syncBrandWithComposio,
  applyBrandColors,
  BrandIdentityConfig,
} from "../../lib/brandService";
import {
  StampService,
  StampReward,
} from "../../lib/stampService";

/**
 * Componente de Guía Rápida colapsable para secciones con cierta complejidad
 */
function SectionQuickGuide({
  title,
  description,
  tips,
}: {
  title: string;
  description?: string;
  tips: { title: string; text: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs transition-all">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <span className="h-7 w-7 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-sm shrink-0">
            💡
          </span>
          <div>
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider flex items-center gap-2">
              <span>{title}</span>
              <span className="text-[10px] font-medium text-amber-600 bg-amber-500/15 px-2 py-0.5 rounded-full font-mono">
                {isOpen ? "Cerrar guía" : "Ver guía rápida"}
              </span>
            </h4>
            {description && !isOpen && (
              <p className="text-[11px] text-muted-foreground line-clamp-1">{description}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          className="h-7 w-7 rounded-lg hover:bg-amber-500/10 flex items-center justify-center text-amber-600 transition"
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-2.5 animate-fade-in">
          {description && <p className="text-muted-foreground leading-relaxed text-[11px]">{description}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {tips.map((tip, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-background border border-amber-500/20 space-y-1">
                <strong className="text-foreground text-[11px] font-semibold flex items-center gap-1.5">
                  <span className="text-amber-500 font-bold">✓</span> {tip.title}
                </strong>
                <p className="text-[10px] text-muted-foreground leading-normal">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  prizes: GamePrize[];
  onUpdatePrizes: (newPrizes: GamePrize[]) => void;
  history: WonPrize[];
  onGenerateNewTable: () => void;
}

export function AdminPanelModal({
  isOpen,
  onClose,
  prizes,
  onUpdatePrizes,
  history,
  onGenerateNewTable,
}: AdminPanelModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    "stats" | "prizes" | "campaign" | "messages" | "push_campaigns" | "composio" | "databases" | "branding"
  >("stats");
  const [composioConfig, setComposioConfig] = useState<ComposioRuntimeConfig>(() => getComposioConfig());
  const [pushConfig, setPushConfig] = useState<PushRuntimeConfig>(() => getPushConfig());
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => getSupabaseConfig());
  const [activePin, setActivePin] = useState(() => getActiveCashierPin());
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{ loading: boolean; msg?: string; success?: boolean }>({ loading: false });
  const [pushTemplates, setPushTemplates] = useState<PushNotificationTemplate[]>(() => getCustomPushTemplates());
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [automatedFlows, setAutomatedFlows] = useState<AutomatedPushFlow[]>(() => getAutomatedFlows());
  const [broadcastOffer, setBroadcastOffer] = useState<{
    title: string;
    body: string;
    url: string;
    segment: string;
  }>({
    title: "⚡ ¡Happy Hour 2x1 en Café y Especialidades!",
    body: "¡Hola! Hoy de 3:00 a 6:00 PM acumula el DOBLE de sellos y disfruta 2x1 en bebidas de autor. ¡Muestra este mensaje en caja!",
    url: "",
    segment: "Subscribed Users",
  });
  const [broadcastStatus, setBroadcastStatus] = useState<{ loading: boolean; msg?: string; success?: boolean }>({ loading: false });

  // Sub-sección para premios: "roulette" (Ruleta) | "stamps" (Tarjeta de Sellos)
  const [prizeSection, setPrizeSection] = useState<"roulette" | "stamps">("roulette");
  const [stampRewards, setStampRewards] = useState<StampReward[]>(() => StampService.getStampRewards());
  const [visitIcon, setVisitIcon] = useState<string>(() => StampService.getVisitIcon());
  const [stampGlobalMode] = useState<15>(15);
  const [stampSaveFeedback, setStampSaveFeedback] = useState<string | null>(null);

  // Estados de Control de Acceso por Roles (RBAC 3 Niveles: Owner, Admin, Cashier)
  const [authenticatedRole, setAuthenticatedRole] = useState<"owner" | "admin" | "cashier" | null>(null);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [masterPin, setMasterPin] = useState<string>(() => getMasterAdminPin());
  const [managerPin, setManagerPin] = useState<string>(() => getManagerAdminPin());
  const [newMasterPinInput, setNewMasterPinInput] = useState<string>("");
  const [newManagerPinInput, setNewManagerPinInput] = useState<string>("");
  const [newCashierPinInput, setNewCashierPinInput] = useState<string>("");
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>(() => getRolePermissions());
  const [pinChangeFeedback, setPinChangeFeedback] = useState<string | null>(null);

  const canAccessTab = (
    tab: "stats" | "prizes" | "campaign" | "messages" | "push_campaigns" | "composio" | "databases" | "branding"
  ): boolean => {
    if (authenticatedRole === "owner") return true;
    if (!authenticatedRole) return false;
    switch (tab) {
      case "stats":
        return hasPermission(authenticatedRole, "viewMetrics");
      case "prizes":
        return hasPermission(authenticatedRole, "manageRoulette") || hasPermission(authenticatedRole, "manageStamps");
      case "campaign":
        return hasPermission(authenticatedRole, "manageChannels");
      case "messages":
        return hasPermission(authenticatedRole, "redeemPrizes") || hasPermission(authenticatedRole, "manageChannels");
      case "push_campaigns":
        return hasPermission(authenticatedRole, "manageComposio") || hasPermission(authenticatedRole, "manageChannels");
      case "composio":
        return hasPermission(authenticatedRole, "manageComposio");
      case "databases":
        return hasPermission(authenticatedRole, "manageDatabases");
      case "branding":
        return hasPermission(authenticatedRole, "manageBrand");
      default:
        return false;
    }
  };

  const handlePinSubmit = (pinToTest?: string) => {
    const pin = pinToTest ?? pinInput;
    const role = authenticatePin(pin);
    if (role) {
      setAuthenticatedRole(role);
      setPinError(null);
      setPinInput("");
      if (!canAccessTab(activeTab)) {
        setActiveTab("stats");
      }
    } else {
      setPinError("PIN no reconocido. Ingresa 8888 (Dueño), 5555 (Admin) o 1978 (Cajero).");
      setPinInput("");
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + digit;
      setPinInput(next);
      setPinError(null);
      if (next.length === 4) {
        handlePinSubmit(next);
      }
    }
  };

  const handleKeypadDelete = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setPinError(null);
  };

  const handleKeypadClear = () => {
    setPinInput("");
    setPinError(null);
  };

  const handleSaveMasterPin = () => {
    if (newMasterPinInput.length === 4 && /^\d{4}$/.test(newMasterPinInput)) {
      setMasterAdminPin(newMasterPinInput);
      setMasterPin(newMasterPinInput);
      setNewMasterPinInput("");
      setPinChangeFeedback("¡PIN Maestro de Dueño actualizado con éxito!");
      setTimeout(() => setPinChangeFeedback(null), 3000);
      fetch("http://localhost:3001/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ security: { masterAdminPin: newMasterPinInput } }),
      }).catch(() => {});
    } else {
      alert("El PIN debe contener exactamente 4 dígitos numéricos.");
    }
  };

  const handleSaveManagerPin = () => {
    if (newManagerPinInput.length === 4 && /^\d{4}$/.test(newManagerPinInput)) {
      setManagerAdminPin(newManagerPinInput);
      setManagerPin(newManagerPinInput);
      setNewManagerPinInput("");
      setPinChangeFeedback("¡PIN de Administrador actualizado con éxito!");
      setTimeout(() => setPinChangeFeedback(null), 3000);
      fetch("http://localhost:3001/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ security: { managerAdminPin: newManagerPinInput } }),
      }).catch(() => {});
    } else {
      alert("El PIN debe contener exactamente 4 dígitos numéricos.");
    }
  };

  const handleSaveCashierPinManually = () => {
    if (newCashierPinInput.length === 4 && /^\d{4}$/.test(newCashierPinInput)) {
      setActiveCashierPin(newCashierPinInput);
      setActivePin(newCashierPinInput);
      setNewCashierPinInput("");
      setPinChangeFeedback("¡PIN de Cajero actualizado con éxito!");
      setTimeout(() => setPinChangeFeedback(null), 3000);
      fetch("http://localhost:3001/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ security: { cashierPin: newCashierPinInput } }),
      }).catch(() => {});
    } else {
      alert("El PIN debe contener exactamente 4 dígitos numéricos.");
    }
  };

  const handleTogglePermission = (role: "admin" | "cashier", perm: keyof RolePermissions["admin"]) => {
    const updated: RolePermissions = {
      ...rolePermissions,
      [role]: {
        ...rolePermissions[role],
        [perm]: !rolePermissions[role][perm],
      },
    };
    setRolePermissions(updated);
    saveRolePermissions(updated);
    fetch("http://localhost:3001/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ security: { roles: updated } }),
    }).catch(() => {});
  };

  // Estados editables de marca (Branding & Composio)
  const [brandConfig, setBrandConfig] = useState<BrandIdentityConfig>(() => getBrandConfig());
  const [brandSyncStatus, setBrandSyncStatus] = useState<{ loading: boolean; msg?: string; success?: boolean }>({ loading: false });

  // Estados editables de premios
  const [localPrizes, setLocalPrizes] = useState<GamePrize[]>(prizes);

  // Manejadores de Tarjeta de Sellos
  const handleUpdateStampReward = (index: number, field: keyof StampReward, val: any) => {
    const updated = [...stampRewards];
    updated[index] = { ...updated[index], [field]: val };
    setStampRewards(updated);
  };

  const handleSaveStampRewards = () => {
    StampService.setVisitIcon(visitIcon);
    StampService.saveStampRewards(stampRewards);
    StampService.setGlobalMode(stampGlobalMode);
    setStampSaveFeedback("¡Recompensas e iconos de la tarjeta de sellos guardados con éxito!");
    setTimeout(() => setStampSaveFeedback(null), 3500);

    // Sincronizar en segundo plano con el servidor backend REST
    try {
      fetch("http://localhost:3001/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitIcon,
          stampRewards,
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }
  };

  const handleResetStampRewards = () => {
    if (confirm("¿Deseas restaurar las recompensas e iconos gastronómicos por defecto?")) {
      const def = StampService.resetStampRewardsToDefault();
      StampService.setVisitIcon("☕");
      setVisitIcon("☕");
      setStampRewards([...def]);
      setStampSaveFeedback("Catálogo e iconos de sellos restaurados a valores originales.");
      setTimeout(() => setStampSaveFeedback(null), 3500);
    }
  };

  // Manejadores de Marca Blanca & Composio
  const handleBrandChange = (field: keyof BrandIdentityConfig, value: any) => {
    setBrandConfig((prev) => ({ ...prev, [field]: value }));
    if (field === "primaryColor" && typeof value === "string") {
      applyBrandColors(value);
    }
  };

  const handleSelectColorPreset = (hex: string) => {
    handleBrandChange("primaryColor", hex);
  };

  const handleSaveBrandAndSyncComposio = async () => {
    setBrandSyncStatus({ loading: true });
    try {
      const res = await syncBrandWithComposio(brandConfig);
      setBrandSyncStatus({ loading: false, msg: res.message, success: res.success });
      setTimeout(() => {
        setBrandSyncStatus({ loading: false });
      }, 4000);
    } catch (err: any) {
      setBrandSyncStatus({ loading: false, msg: err?.message || "Error al sincronizar", success: false });
    }
  };

  // Estadísticas calculadas
  const totalParticipants = history.length;
  const prizesUsed = history.filter((h) => h.status === "UTILIZADO").length;
  const prizesAvailable = history.filter((h) => h.status === "DISPONIBLE").length;

  const totalProb = localPrizes.reduce(
    (sum, p) => sum + (p.active ? Number(p.probability) || 0 : 0),
    0,
  );
  const isProbValid = totalProb === 100;

  const handleProbChange = (id: string, newProb: number) => {
    const updated = localPrizes.map((p) =>
      p.id === id ? { ...p, probability: Math.max(0, Math.min(100, newProb)) } : p,
    );
    setLocalPrizes(updated);
  };

  const handleToggleActive = (id: string) => {
    const updated = localPrizes.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    setLocalPrizes(updated);
  };

  const handleSavePrizes = () => {
    if (!isProbValid) {
      alert("Las probabilidades deben sumar exactamente 100%. Suma actual: " + totalProb + "%");
      return;
    }
    onUpdatePrizes(localPrizes);
    alert("¡Configuración de premios guardada con éxito!");
  };

  const analytics = calculateAnalytics(history);

  if (!isOpen) return null;

  // PANTALLA DE ACCESO CON PIN DE PERMISOS (GATEWAY RBAC)
  if (authenticatedRole === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
        <div className="relative w-full max-w-sm rounded-3xl bg-neutral-900 border-2 border-gold/40 text-white p-6 shadow-2xl space-y-5 text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Encabezado */}
          <div className="space-y-1.5 pt-2">
            <div className="h-14 w-14 rounded-2xl bg-gold/15 text-gold border border-gold/30 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="h-7 w-7" />
            </div>
            <span className="text-[10px] uppercase font-bold text-gold tracking-widest block font-mono">
              {clientConfig.brand.name}
            </span>
            <h3 className="font-display text-xl font-bold text-white">
              Acceso con Permisos
            </h3>
            <p className="text-xs text-neutral-400">
              Digita tu PIN de 4 dígitos para acceder al panel con tus permisos asignados.
            </p>
          </div>

          {/* Display de PIN (Puntos) */}
          <div className="flex items-center justify-center gap-3 py-2">
            {[0, 1, 2, 3].map((idx) => {
              const hasDigit = pinInput.length > idx;
              return (
                <div
                  key={idx}
                  className={`h-11 w-11 rounded-2xl border-2 flex items-center justify-center transition-all ${
                    hasDigit
                      ? "border-gold bg-gold/20 text-gold scale-105 shadow-xs"
                      : "border-neutral-700 bg-neutral-800/80 text-neutral-500"
                  }`}
                >
                  {hasDigit ? "●" : ""}
                </div>
              );
            })}
          </div>

          {pinError && (
            <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold animate-pulse">
              {pinError}
            </div>
          )}

          {/* Teclado numérico táctil */}
          <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num)}
                className="h-11 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:bg-gold active:text-neutral-950 text-white font-mono text-lg font-bold transition-all border border-neutral-700/80 shadow-xs"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleKeypadClear}
              className="h-11 rounded-xl bg-neutral-800/60 hover:bg-neutral-700 text-neutral-400 text-xs uppercase font-bold transition-colors border border-neutral-700/80"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress("0")}
              className="h-11 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:bg-gold active:text-neutral-950 text-white font-mono text-lg font-bold transition-all border border-neutral-700/80 shadow-xs"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleKeypadDelete}
              className="h-11 rounded-xl bg-neutral-800/60 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors border border-neutral-700/80"
            >
              ⌫
            </button>
          </div>

          {/* Accesos rápidos de demostración */}
          <div className="pt-2 border-t border-neutral-800 space-y-2">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
              Accesos de Prueba:
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handlePinSubmit(masterPin || "8888")}
                className="p-2 rounded-xl bg-gold/15 hover:bg-gold/25 border border-gold/40 text-gold text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all text-center"
              >
                <span>👑 Dueño Master</span>
                <span className="font-mono text-[9px] text-gold/80">PIN: {masterPin || "8888"}</span>
              </button>

              <button
                type="button"
                onClick={() => handlePinSubmit(managerPin || "5555")}
                className="p-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/40 text-indigo-300 text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all text-center"
              >
                <span>👔 Admin / Gerente</span>
                <span className="font-mono text-[9px] text-indigo-300/80">PIN: {managerPin || "5555"}</span>
              </button>

              <button
                type="button"
                onClick={() => handlePinSubmit(activePin || "1978")}
                className="p-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-300 text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all text-center"
              >
                <span>💼 Cajero / Turno</span>
                <span className="font-mono text-[9px] text-sky-400/80">PIN: {activePin || "1978"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isMasterAdmin = authenticatedRole === "owner";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl rounded-3xl bg-card border border-gold/40 shadow-2xl overflow-hidden my-4 sm:my-8 animate-fade-in flex flex-col h-[92vh]">
        {/* Cabecera del Panel */}
        <div className="bg-neutral-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-gold/30 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.24em] text-gold font-mono font-semibold">
                {clientConfig.brand.name.toUpperCase()} · PANEL DE CONTROL
              </span>
              {authenticatedRole === "owner" ? (
                <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/40 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Dueño Master
                </span>
              ) : authenticatedRole === "admin" ? (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Administrador
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Cajero / Supervisor
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-display font-medium text-white">
              {t("Administración de Juego QR & Fidelización", "QR Game & Loyalty Management")}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Botón de bloqueo / cerrar sesión de rol */}
            <button
              type="button"
              onClick={() => {
                setAuthenticatedRole(null);
                setPinInput("");
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border border-white/10"
              title="Bloquear sesión y cambiar PIN"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Bloquear</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* CUERPO PRINCIPAL CON 2 COLUMNAS: Izquierda (Navegación vertical) y Derecha (Contenido de trabajo) */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
          {/* Contenido scrolleable (A la derecha) */}
          <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-6 order-2 md:order-2 bg-background/50">
          {/* BLOQUEO PARA ROLES SIN PERMISO: ACCESO DENEGADO POR SEGURIDAD RBAC */}
          {!canAccessTab(activeTab) ? (
            <div className="p-8 rounded-3xl bg-neutral-900 border-2 border-amber-500/40 text-center space-y-4 max-w-lg mx-auto my-12 animate-fade-in shadow-xl">
              <div className="h-16 w-16 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-500 tracking-widest font-mono">
                  Seguridad por Roles & Permisos
                </span>
                <h3 className="font-display text-xl font-bold text-white">
                  Sección Restringida para {authenticatedRole === "admin" ? "Administrador" : "Cajero"}
                </h3>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Esta sección requiere permisos específicos asignados por el <strong>Dueño Master</strong>. Puedes solicitar la activación del permiso o ingresar con el PIN Maestro.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("stats")}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
                >
                  Regresar a Métricas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthenticatedRole(null);
                    setPinInput("");
                  }}
                  className="btn-solid py-2.5 px-5 text-xs uppercase tracking-wider font-bold"
                >
                  Ingresar como Dueño (PIN 8888)
                </button>
              </div>
            </div>
          ) : (
            <>
          {/* TAB 1: Estadísticas y Métricas */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              {/* BANNER 1: KPI ESTRATÉGICOS (MEJOR DÍA + TRANSACCIONES DEL MES) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tarjeta: Mejor Día */}
                <div className="relative overflow-hidden rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-gold/10 via-background to-amber-500/5 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-gold flex items-center gap-1.5">
                      <Trophy className="h-4 w-4 text-gold" />
                      {t("Mejor Día de la Semana", "Best Day of the Week")}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-gold/20 text-gold text-[10px] font-bold uppercase tracking-wider">
                      Mayor Afluencia
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-display font-bold text-foreground">
                      {analytics.timing.bestDay}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({analytics.timing.bestDayCount} interacciones registradas)
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {t(
                      "Es el día con mayor interacción en mesa. Ideal para reforzar meseros o lanzar ofertas especiales.",
                      "Top engagement day. Perfect for staffing up or running special promos."
                    )}
                  </p>
                </div>

                {/* Tarjeta: Transacciones & Canjes este mes */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50/80 via-background to-teal-500/5 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700 flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      {t("Transacciones de este Mes", "This Month's Transactions")}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {analytics.transactions.conversionRate}% Conversión
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="text-3xl font-display font-bold text-emerald-700">
                      {analytics.transactions.redeemedThisMonth}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      canjes validados en caja de {analytics.transactions.totalThisMonth} jugadas
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {t(
                      "Clientes que no solo jugaron, sino que consumieron y presentaron su código en caja para pagar.",
                      "Customers who played, ordered food, and redeemed their code at checkout."
                    )}
                  </p>
                </div>
              </div>

              {/* BLOQUE 2: CONTEO DE VISTAS (SWITCHY / QR EN MESA) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("Conteo de Vistas del QR / Enlace", "QR & Link Pageviews")}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-light">
                    Tráfico medido en tiempo real
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-border/80 bg-background p-3.5 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t("Vistas Hoy", "Views Today")}
                    </p>
                    <p className="font-display text-2xl text-foreground font-semibold mt-0.5">
                      {analytics.views.today}
                    </p>
                    <span className="text-[9px] text-emerald-600 font-medium">En vivo</span>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-background p-3.5 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t("Esta Semana", "This Week")}
                    </p>
                    <p className="font-display text-2xl text-foreground font-semibold mt-0.5">
                      {analytics.views.thisWeek}
                    </p>
                    <span className="text-[9px] text-muted-foreground">Últimos 7 días</span>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-background p-3.5 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t("Este Mes", "This Month")}
                    </p>
                    <p className="font-display text-2xl text-gold font-semibold mt-0.5">
                      {analytics.views.thisMonth}
                    </p>
                    <span className="text-[9px] text-gold font-medium">Últimos 30 días</span>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-background p-3.5 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t("Total Acumulado", "Total Lifetime")}
                    </p>
                    <p className="font-display text-2xl text-foreground font-semibold mt-0.5">
                      {analytics.views.total}
                    </p>
                    <span className="text-[9px] text-muted-foreground">Vistas históricas</span>
                  </div>
                </div>
              </div>

              {/* BLOQUE 3: DISTRIBUCIÓN DE AFLUENCIA SEMANAL */}
              <div className="rounded-2xl border border-border/80 bg-background p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gold" />
                    {t("Distribución de Actividad por Día de la Semana", "Weekly Activity Breakdown")}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Mayor actividad = mayor potencial de ventas
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-2 pt-2">
                  {analytics.timing.dayDistribution.map((day) => {
                    const isBest = day.dayName === analytics.timing.bestDay && day.count > 0;
                    return (
                      <div
                        key={day.dayName}
                        className={`rounded-xl p-2.5 text-center transition-all ${
                          isBest
                            ? "bg-gold/15 border-2 border-gold shadow-xs"
                            : "bg-muted/30 border border-border/60 hover:bg-muted/60"
                        }`}
                      >
                        <p className={`text-[10px] uppercase font-bold tracking-wider ${isBest ? "text-gold" : "text-muted-foreground"}`}>
                          {day.dayShort}
                        </p>
                        <p className={`text-base sm:text-lg font-display font-bold mt-1 ${isBest ? "text-gold" : "text-foreground"}`}>
                          {day.count}
                        </p>
                        <div className="w-full bg-border/50 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isBest ? "bg-gold" : "bg-muted-foreground/60"}`}
                            style={{ width: `${Math.max(day.percentage, day.count > 0 ? 15 : 0)}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-muted-foreground block mt-1">
                          {day.percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BLOQUE 4: HORAS MUERTAS VS HORAS PICO (HORÓMETRO DE ACTIVIDAD) */}
              <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-50/50 via-background to-orange-50/40 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-700 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-amber-600" />
                      {t("Horómetro de Actividad & Detección de Horas Muertas", "Hourly Activity & Dead Hours")}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Identifica a qué horas del día los clientes juegan en mesa para detectar y activar las horas lentas.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                    <span>☕ Franja Muerta Habitual: 3:00 PM a 6:00 PM</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-background border border-amber-200 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">Diagnóstico de Horas Muertas:</span>
                    <p className="text-amber-950 font-medium">{analytics.timing.deadHoursSummary}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-emerald-200 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Franja de Mayor Afluencia:</span>
                    <p className="text-emerald-950 font-medium">{analytics.timing.peakHoursSummary}</p>
                  </div>
                </div>

                {/* Tarjetas de horas (8 AM a 10 PM) */}
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2 pt-1">
                  {analytics.timing.hourlyDistribution.map((slot) => (
                    <div
                      key={slot.hour}
                      className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-between transition-all ${
                        slot.isDeadHour
                          ? "border-amber-300 bg-amber-50/70 text-amber-950"
                          : slot.count > 0
                          ? "border-emerald-300 bg-emerald-50/70 text-emerald-950"
                          : "border-border/60 bg-muted/20 text-muted-foreground"
                      }`}
                    >
                      <span className="text-[10px] font-bold font-mono block">{slot.label}</span>
                      <span className="text-lg font-black my-0.5">{slot.count}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                        slot.isDeadHour ? "bg-amber-200 text-amber-800" : "bg-muted text-muted-foreground"
                      }`}>
                        {slot.isDeadHour ? "Hora Muerta" : slot.timeSlotName.split("/")[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Registro reciente de premios */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-[0.18em] font-semibold text-foreground">
                    {t("Historial Reciente de Premios", "Recent Prize History")}
                  </h3>
                  <button
                    type="button"
                    onClick={onGenerateNewTable}
                    className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{t("Simular nueva mesa", "Simulate new table")}</span>
                  </button>
                </div>

                <div className="border border-border/80 rounded-xl overflow-hidden bg-background">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="py-2.5 px-3">Código</th>
                        <th className="py-2.5 px-3">Hora</th>
                        <th className="py-2.5 px-3">Mesa</th>
                        <th className="py-2.5 px-3">Cliente</th>
                        <th className="py-2.5 px-3">Premio</th>
                        <th className="py-2.5 px-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {history.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-muted-foreground italic">
                            No hay participaciones registradas en esta sesión aún.
                          </td>
                        </tr>
                      ) : (
                        history.map((h) => (
                          <tr key={h.uniqueCode} className="hover:bg-muted/20">
                            <td className="py-2.5 px-3 font-mono font-bold text-gold">
                              {h.uniqueCode}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">
                              {h.wonAt || "Hoy"}
                            </td>
                            <td className="py-2.5 px-3">{h.tableNumber}</td>
                            <td className="py-2.5 px-3 font-medium text-foreground">
                              {h.participantName}
                              <span className="block text-[10px] text-muted-foreground font-mono">
                                +{h.participantWhatsapp}
                              </span>
                              {h.participantEmail && (
                                <span className="block text-[10px] text-muted-foreground truncate max-w-[150px]">
                                  {h.participantEmail}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">{h.prizeName}</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  h.status === "UTILIZADO"
                                    ? "bg-muted text-muted-foreground"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {h.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Configuración de Premios (Ruleta y Tarjeta de Sellos) */}
          {activeTab === "prizes" && (
            <div className="space-y-6">
              {/* GUÍA RÁPIDA COLAPSABLE */}
              <SectionQuickGuide
                title="Guía Rápida: Ruleta & Tarjeta de 15 Sellos"
                description="Configura los premios de la ruleta y las recompensas por hitos en la tarjeta de fidelización."
                tips={[
                  {
                    title: "Suma del 100% Obligatoria",
                    text: "Las probabilidades de todos los premios activos en la ruleta deben sumar exactamente 100%.",
                  },
                  {
                    title: "Premios cada 5 Sellos",
                    text: "La tarjeta de 15 sellos premia a los comensales en las visitas clave (Sello 5, Sello 10 y Sello 15).",
                  },
                  {
                    title: "Sellos Dobles en Horas Muertas",
                    text: "De 3:00 a 6:00 PM, los clientes acumulan 2 sellos automáticos por consumo para incentivar las tardes.",
                  },
                  {
                    title: "Icono Personalizado",
                    text: "Elige el icono gastronómico (☕, 🥐, 🍰, 🍕, 🍔, 🌮) que mejor represente a tu negocio.",
                  },
                ]}
              />

              {/* Selector de sub-sección: Ruleta vs Tarjeta de Sellos */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-muted/40 rounded-2xl border border-border">
                <div className="flex items-center gap-1.5 p-1 bg-background rounded-xl border border-border text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPrizeSection("roulette")}
                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                      prizeSection === "roulette"
                        ? "bg-gold text-slate-950 font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    <span>🎡 Ruleta de Premios (%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrizeSection("stamps")}
                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                      prizeSection === "stamps"
                        ? "bg-gold text-slate-950 font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Award className="h-3.5 w-3.5" />
                    <span>🌟 Tarjeta de Sellos (10 o 15 Recompensas)</span>
                  </button>
                </div>

                {prizeSection === "stamps" && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground font-medium">Modalidad:</span>
                    <span className="px-3 py-1 rounded-full bg-gold/15 text-gold border border-gold/40 font-bold font-mono">
                      15 Sellos VIP · 3 Hitos (Sellos 5, 10 y 15)
                    </span>
                  </div>
                )}
              </div>

              {/* SECCIÓN 1: RULETA DE LA SUERTE Y PROBABILIDADES */}
              {prizeSection === "roulette" && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border bg-muted/30">
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-foreground">
                        Suma total de probabilidades de la Ruleta
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Debe sumar exactamente 100% para que el algoritmo sea matemáticamente equitativo.
                      </p>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-xl text-sm font-bold font-mono ${
                        isProbValid
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-red-100 text-red-800 border border-red-300"
                      }`}
                    >
                      {totalProb}% / 100%
                    </div>
                  </div>

                  {/* Lista de premios de la ruleta */}
                  <div className="space-y-3">
                    {localPrizes.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl border border-border/80 bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="h-4 w-4 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: p.color }}
                          />
                          <div>
                            <p className="text-xs font-semibold text-foreground">{p.name}</p>
                            <p className="text-[11px] text-muted-foreground font-light">{p.terms}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <label className="text-[11px] text-muted-foreground uppercase">
                              Probabilidad:
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={p.probability}
                              onChange={(e) => handleProbChange(p.id, Number(e.target.value))}
                              className="w-16 rounded-lg border border-border px-2 py-1 text-xs text-center font-mono font-bold text-foreground bg-card"
                            />
                            <span className="text-xs font-mono text-muted-foreground">%</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleActive(p.id)}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                              p.active
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {p.active ? "Activo" : "Inactivo"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSavePrizes}
                      disabled={!isProbValid}
                      className="btn-solid py-2.5 px-6 text-xs uppercase tracking-wider font-semibold disabled:opacity-40"
                    >
                      Guardar Cambios de Probabilidades
                    </button>
                  </div>
                </div>
              )}

              {/* SECCIÓN 2: CATÁLOGO DE PREMIOS DE LA TARJETA DE SELLOS */}
              {prizeSection === "stamps" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-gold/30 text-xs text-foreground space-y-1">
                    <p className="font-semibold text-gold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-gold" />
                      Catálogo de Premios por Visitas (3 Grandes Hitos: Sellos #5, #10 y #15)
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Solo los sellos #5, #10 y #15 otorgan premios. Las visitas intermedias (1-4, 6-9, 11-14) son sellos de acumulación. Aquí puedes personalizar los 3 premios:
                    </p>
                  </div>

                  {stampSaveFeedback && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>{stampSaveFeedback}</span>
                    </div>
                  )}

                  {/* SELECTOR DE ICONO PARA SELLOS DE VISITA INTERMEDIA */}
                  <div className="p-3.5 rounded-2xl border border-border/80 bg-background space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="h-10 w-10 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-xl shrink-0">
                          {visitIcon}
                        </span>
                        <div>
                          <h5 className="font-bold text-xs text-foreground">
                            Icono de Visitas Intermedias (Sellos 1-4, 6-9, 11-14)
                          </h5>
                          <p className="text-[10px] text-muted-foreground">
                            Elige el icono que representa el consumo habitual de tu negocio (Café, Panadería, Pizzería, etc.).
                          </p>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={visitIcon}
                        onChange={(e) => setVisitIcon(e.target.value)}
                        className="w-12 text-center text-lg p-1.5 rounded-xl border border-border bg-card font-mono shrink-0"
                        maxLength={4}
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/40">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase self-center mr-1">
                        Paleta Rápida:
                      </span>
                      {[
                        { icon: "☕", label: "Café" },
                        { icon: "🥐", label: "Pan" },
                        { icon: "🍪", label: "Galleta" },
                        { icon: "🧁", label: "Muffin" },
                        { icon: "🍔", label: "Burger" },
                        { icon: "🍕", label: "Pizza" },
                        { icon: "🌮", label: "Tacos" },
                        { icon: "🍹", label: "Cóctel" },
                        { icon: "🐾", label: "Mascotas" },
                        { icon: "⭐", label: "Estrella" },
                        { icon: "🏷️", label: "Comercio" },
                        { icon: "✨", label: "Magia" },
                      ].map((preset) => (
                        <button
                          key={preset.icon}
                          type="button"
                          onClick={() => setVisitIcon(preset.icon)}
                          className={`px-2 py-1 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                            visitIcon === preset.icon
                              ? "border-gold bg-gold/20 font-bold shadow-2xs"
                              : "border-border hover:border-gold/50 bg-card"
                          }`}
                        >
                          <span>{preset.icon}</span>
                          <span className="text-[9px] text-muted-foreground">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                    {stampRewards.map((reward, index) => (
                      <div
                        key={reward.stamp}
                        className={`p-3.5 rounded-2xl border transition-all text-xs space-y-2.5 ${
                          reward.highlight
                            ? "bg-gold/10 border-gold/60 shadow-xs"
                            : "bg-background border-border/80"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="h-6 px-2.5 rounded-full bg-gold text-slate-950 font-mono font-bold flex items-center justify-center text-xs">
                              Sello #{reward.stamp}
                            </span>
                            <span className="text-xl">{reward.icon}</span>
                            <span className="font-bold text-foreground truncate max-w-[200px]">
                              {reward.title || `Recompensa Sello #${reward.stamp}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!reward.highlight}
                                onChange={(e) =>
                                  handleUpdateStampReward(index, "highlight", e.target.checked)
                                }
                                className="rounded text-gold focus:ring-gold"
                              />
                              <span>Hito Estelar ⭐</span>
                            </label>

                            <select
                              value={reward.category}
                              onChange={(e) =>
                                handleUpdateStampReward(index, "category", e.target.value)
                              }
                              className="px-2 py-1 rounded-lg border border-border bg-card text-[11px] font-medium"
                            >
                              <option value="bebida">☕ Bebida</option>
                              <option value="panaderia">🥐 Panadería</option>
                              <option value="postre">🍰 Postre</option>
                              <option value="descuento">🎟️ Descuento</option>
                              <option value="vip">👑 Experiencia VIP</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
                          <div className="sm:col-span-3">
                            <label className="text-[10px] text-muted-foreground uppercase block font-semibold mb-1">
                              Icono del Premio:
                            </label>
                            <input
                              type="text"
                              value={reward.icon}
                              onChange={(e) =>
                                handleUpdateStampReward(index, "icon", e.target.value)
                              }
                              className="w-full text-center text-lg p-1.5 rounded-lg border border-border bg-card font-mono"
                              maxLength={4}
                            />
                            {/* Paleta rápida de iconos para el hito */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {(index === 0
                                ? ["🍰", "🧁", "🍪", "🥐", "☕", "🎁", "🍩", "🍦"]
                                : index === 1
                                ? ["👑", "🍔", "🍕", "🥗", "🍹", "🏆", "🥪", "🍳"]
                                : ["🌟", "🥂", "🍾", "🍽️", "🎂", "💎", "🎖️", "🍷"]
                              ).map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => handleUpdateStampReward(index, "icon", emoji)}
                                  className={`h-6 w-6 rounded-md border flex items-center justify-center text-xs transition-all ${
                                    reward.icon === emoji
                                      ? "border-gold bg-gold/30 font-bold scale-110 shadow-2xs"
                                      : "border-border/60 hover:border-gold/40 bg-card"
                                  }`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="sm:col-span-5">
                            <label className="text-[10px] text-muted-foreground uppercase block font-semibold">
                              Título del Premio:
                            </label>
                            <input
                              type="text"
                              value={reward.title}
                              onChange={(e) =>
                                handleUpdateStampReward(index, "title", e.target.value)
                              }
                              className="w-full p-2 rounded-lg border border-border bg-card font-medium text-foreground text-xs"
                              placeholder="Ej: Café Americano de Especialidad"
                            />
                          </div>

                          <div className="sm:col-span-4">
                            <label className="text-[10px] text-muted-foreground uppercase block font-semibold">
                              Descripción del Beneficio:
                            </label>
                            <input
                              type="text"
                              value={reward.description}
                              onChange={(e) =>
                                handleUpdateStampReward(index, "description", e.target.value)
                              }
                              className="w-full p-2 rounded-lg border border-border bg-card text-muted-foreground text-xs"
                              placeholder="Ej: Infusión fresca recién preparada"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border">
                    <button
                      type="button"
                      onClick={handleResetStampRewards}
                      className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Restaurar Recompensas Originales</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveStampRewards}
                      className="btn-solid py-2.5 px-6 text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-2 shadow-sm"
                    >
                      <Save className="h-4 w-4" />
                      <span>Guardar Recompensas de la Tarjeta</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Campaña y Términos */}
          {activeTab === "campaign" && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border p-4 bg-background space-y-3">
                <h4 className="font-semibold text-foreground uppercase tracking-wider">
                  Configuración de Campaña
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted-foreground mb-1">Nombre de Campaña:</label>
                    <input
                      type="text"
                      readOnly
                      value={`Juego de Mesa & Fidelización — ${clientConfig.brand.name}`}
                      className="w-full border rounded-lg p-2 bg-muted/40 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1">Instagram Oficial:</label>
                    <input
                      type="text"
                      readOnly
                      value={clientConfig.channels.instagramHandle}
                      className="w-full border rounded-lg p-2 bg-muted/40 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-4 bg-background space-y-2">
                <h4 className="font-semibold text-foreground uppercase tracking-wider">
                  Reglas del Juego
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground font-light">
                  <li>Solo se puede participar durante una sesión de pago activa.</li>
                  <li>Una única participación por cuenta/mesa.</li>
                  <li>Cada premio genera un código criptográfico único e intransferible.</li>
                  <li>Un premio marcado como UTILIZADO queda bloqueado de por vida.</li>
                  <li>Los domingos se publican ganadores semanales en los Estados de WhatsApp.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: Plantilla de Mensaje WhatsApp */}
          {activeTab === "messages" && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border p-4 bg-background space-y-3">
                <h4 className="font-semibold text-foreground uppercase tracking-wider">
                  Variables automáticas disponibles
                </h4>
                <div className="flex flex-wrap gap-2 font-mono text-[11px]">
                  <span className="bg-gold/15 text-gold px-2 py-1 rounded">{"{{nombre}}"}</span>
                  <span className="bg-gold/15 text-gold px-2 py-1 rounded">{"{{premio}}"}</span>
                  <span className="bg-gold/15 text-gold px-2 py-1 rounded">{"{{codigo}}"}</span>
                  <span className="bg-gold/15 text-gold px-2 py-1 rounded">
                    {"{{restaurante}}"}
                  </span>
                </div>

                <div className="pt-2">
                  <label className="block text-muted-foreground mb-1 font-medium">
                    Plantilla de confirmación al cliente:
                  </label>
                  <textarea
                    rows={6}
                    readOnly
                    value={`🎉 ¡Hola, {{nombre}}!
Gracias por dejarnos tu feedback y participar en nuestro juego.
¡Ganaste {{premio}} en tu cuenta de hoy! 🍽️
Presenta este código al momento de pagar:
{{codigo}}
¡Gracias por visitarnos en {{restaurante}}! ❤️`}
                    className="w-full rounded-xl border border-border p-3 font-mono text-xs bg-muted/30 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Configuración de Composio & Automatizaciones */}
          {activeTab === "composio" && (
            <div className="space-y-6 text-xs">
              {/* GUÍA RÁPIDA COLAPSABLE */}
              <SectionQuickGuide
                title="Guía Rápida: Integración con Composio.dev & IA"
                description="Conecta el juego con herramientas externas y agentes de IA sin complicaciones."
                tips={[
                  {
                    title: "Conexión a 200+ Apps",
                    text: "Composio permite conectar WhatsApp, Google Sheets, Gmail, Slack y CRMs usando tu clave de API.",
                  },
                  {
                    title: "Sincronización de Marca",
                    text: "Al guardar cambios de marca o premios, Composio actualiza automáticamente el contexto de tus agentes y bots.",
                  },
                  {
                    title: "Webhooks Automáticos",
                    text: "Cada partida jugada y canje realizado genera un evento webhook para tus flujos de automatización.",
                  },
                  {
                    title: "Sin Código Complejo",
                    text: "Solo necesitas tu API Key de Composio para activar los conectores corporativos en 1 clic.",
                  },
                ]}
              />

              {/* BANNER EXPLICATIVO */}
              <div className="rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-gold/10 via-background to-amber-500/5 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-gold/20 flex items-center justify-center text-gold font-bold">
                      ⚡
                    </span>
                    <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
                      Composio.dev · Conector de IA & Automatización
                    </h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    composioConfig.enabled 
                      ? "bg-emerald-500/20 text-emerald-700 border border-emerald-500/40" 
                      : "bg-muted text-muted-foreground border border-border"
                  }`}>
                    {composioConfig.enabled ? "● Activo" : "○ Inactivo"}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  <strong>Composio</strong> conecta tu sistema de fidelización con más de 100 herramientas externas (Google Sheets, Google Contacts, WhatsApp, CRM y Correo) en tiempo real para que ningún comensal se quede sin registrar.
                </p>
              </div>

              {/* FORMULARIO DE COMPOSIO */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h4 className="font-semibold text-foreground">Habilitar Integración con Composio</h4>
                    <p className="text-[11px] text-muted-foreground">Sincroniza eventos de premios y canjes con la API de Composio.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...composioConfig, enabled: !composioConfig.enabled };
                      setComposioConfig(next);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      composioConfig.enabled ? "bg-emerald-600" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        composioConfig.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* API Key */}
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Composio API Key (opcional):
                  </label>
                  <input
                    type="password"
                    placeholder="comp_live_..."
                    value={composioConfig.apiKey}
                    onChange={(e) => setComposioConfig({ ...composioConfig, apiKey: e.target.value })}
                    className="w-full bg-muted/30 border border-border rounded-xl px-3.5 py-2.5 font-mono text-xs text-foreground focus:ring-1 focus:ring-gold focus:outline-none"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Obtenla gratis en tu panel de <a href="https://composio.dev" target="_blank" rel="noopener noreferrer" className="text-gold underline">composio.dev</a>.
                  </span>
                </div>

                {/* Checkboxes de integraciones */}
                <div className="space-y-2 pt-2">
                  <span className="font-semibold text-foreground block mb-2">Herramientas Automatizadas:</span>
                  
                  <label className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition">
                    <input
                      type="checkbox"
                      checked={composioConfig.integrations.googleSheets}
                      onChange={(e) => setComposioConfig({
                        ...composioConfig,
                        integrations: { ...composioConfig.integrations, googleSheets: e.target.checked }
                      })}
                      className="rounded border-border text-gold focus:ring-gold"
                    />
                    <div>
                      <span className="font-medium text-foreground block">📗 Google Sheets</span>
                      <span className="text-[10px] text-muted-foreground">Agrega una fila por cada ganador y actualiza la columna de canje en caja.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition">
                    <input
                      type="checkbox"
                      checked={composioConfig.integrations.googleContacts}
                      onChange={(e) => setComposioConfig({
                        ...composioConfig,
                        integrations: { ...composioConfig.integrations, googleContacts: e.target.checked }
                      })}
                      className="rounded border-border text-gold focus:ring-gold"
                    />
                    <div>
                      <span className="font-medium text-foreground block">👤 Google Contacts</span>
                      <span className="text-[10px] text-muted-foreground">Crea el contacto en la libreta del restaurante con nombre, teléfono y etiqueta 'Cliente Frecuente'.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition">
                    <input
                      type="checkbox"
                      checked={composioConfig.integrations.dailyEmailSummary}
                      onChange={(e) => setComposioConfig({
                        ...composioConfig,
                        integrations: { ...composioConfig.integrations, dailyEmailSummary: e.target.checked }
                      })}
                      className="rounded border-border text-gold focus:ring-gold"
                    />
                    <div>
                      <span className="font-medium text-foreground block">✉️ Resumen Diario por Email</span>
                      <span className="text-[10px] text-muted-foreground">Envía un reporte nocturno al dueño con las ventas y cupones canjeados del día.</span>
                    </div>
                  </label>
                </div>

                {/* Webhook Fallback */}
                <div className="pt-2 border-t border-border">
                  <label className="block font-semibold text-foreground mb-1">
                    URL de Webhook Directo (Google Apps Script):
                  </label>
                  <input
                    type="text"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={composioConfig.endpoints.googleSheetWebhookUrl}
                    onChange={(e) => setComposioConfig({
                      ...composioConfig,
                      endpoints: { ...composioConfig.endpoints, googleSheetWebhookUrl: e.target.value }
                    })}
                    className="w-full bg-muted/30 border border-border rounded-xl px-3.5 py-2.5 font-mono text-xs text-foreground focus:ring-1 focus:ring-gold focus:outline-none"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Si no usas la API de Composio, puedes pegar aquí tu Webhook 100% gratuito de Google Apps Script.
                  </span>
                </div>

                {/* Botones de Conectar, Guardar y Probar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const next = { ...composioConfig, enabled: true };
                        setComposioConfig(next);
                        saveComposioConfig(next);
                        try {
                          await fetch("http://localhost:3001/api/config", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              composio: {
                                enabled: true,
                                apiKey: next.apiKey,
                                integrations: next.integrations,
                              },
                            }),
                          });
                        } catch {}
                        alert("⚡ ¡Conexión con Composio.dev activada exitosamente!");
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-gold hover:from-amber-600 hover:to-gold/90 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition-all flex items-center gap-2"
                    >
                      <span>⚡ Conectar con Composio.dev</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        saveComposioConfig(composioConfig);
                        fetch("http://localhost:3001/api/config", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            composio: {
                              enabled: composioConfig.enabled,
                              apiKey: composioConfig.apiKey,
                              integrations: composioConfig.integrations,
                            },
                          }),
                        }).catch(() => {});
                        alert("¡Configuración de Composio y automatizaciones guardada con éxito!");
                      }}
                      className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-semibold uppercase tracking-wider text-xs shadow-xs transition"
                    >
                      💾 Guardar
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      const success = await ComposioService.recordWonPrize({
                        fullName: "Prueba Composio",
                        whatsapp: "573001234567",
                        email: "prueba@composio.dev",
                        instagramHandle: "@cliente_prueba",
                        prizeName: "Premio de Prueba",
                        uniqueCode: "TEST-0001",
                        wonAt: new Date().toLocaleTimeString(),
                      });
                      if (success) {
                        alert("✅ ¡Prueba enviada con éxito! Revisa tu Google Sheets o Composio.");
                      } else {
                        alert("⚠️ Prueba ejecutada. Si no ves la fila, verifica que la URL de Webhook o API Key esté bien configurada.");
                      }
                    }}
                    className="px-4 py-2 border border-border bg-background hover:bg-muted text-foreground rounded-xl font-medium text-xs transition"
                  >
                    🚀 Probar Envío de Prueba
                  </button>
                </div>
              </div>

              {/* SECCIÓN 2: ONESIGNAL WEB PUSH (SIN WHATSAPP API) */}
              <div className="rounded-2xl border-2 border-sky-400/50 bg-gradient-to-br from-sky-500/10 via-background to-sky-500/5 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-600 font-bold">
                      🔔
                    </span>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">
                        OneSignal · Notificaciones Web Push
                      </h4>
                      <p className="text-[11px] text-muted-foreground">Envía alertas a los celulares sin costo de Meta ni WhatsApp API.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...pushConfig, enabled: !pushConfig.enabled };
                      setPushConfig(next);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      pushConfig.enabled ? "bg-sky-600" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        pushConfig.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      OneSignal App ID:
                    </label>
                    <input
                      type="text"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      value={pushConfig.appId}
                      onChange={(e) => setPushConfig({ ...pushConfig, appId: e.target.value })}
                      className="w-full bg-muted/30 border border-border rounded-xl px-3.5 py-2.5 font-mono text-xs text-foreground focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      Obtén tu App ID gratis en tu cuenta de <a href="https://onesignal.com" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline font-medium">onesignal.com</a> (hasta 10.000 suscriptores gratis).
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        savePushConfig(pushConfig);
                        alert("¡Configuración de OneSignal Web Push guardada con éxito!");
                      }}
                      className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold uppercase tracking-wider text-xs shadow-sm transition"
                    >
                      💾 Guardar Configuración Push
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        OneSignalService.showLocalTestNotification(
                          "¡Prueba de Notificación Push! 🎁",
                          "Así recibirán tus clientes los avisos de promociones y cupones en su pantalla."
                        );
                      }}
                      className="px-4 py-2 border border-sky-300 bg-sky-50/80 hover:bg-sky-100 text-sky-900 rounded-xl font-medium text-xs transition"
                    >
                      🔔 Probar Notificación en Pantalla
                    </button>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: PERSONALIZADOR DE MENSAJES PUSH Y AUTOMATIZACIONES */}
              <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-background to-orange-500/5 p-5 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <span className="h-8 w-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 text-lg">
                      ✍️
                    </span>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">
                        Personalizador de Mensajes Push (OneSignal & Web)
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Personaliza los títulos y textos de tus alertas automáticas. Puedes usar etiquetas dinámicas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        saveCustomPushTemplates(pushTemplates);
                        alert("¡Plantillas de mensajes push guardadas con éxito!");
                      }}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                    >
                      💾 Guardar Mensajes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const reset = resetPushTemplates();
                        setPushTemplates([...reset]);
                        alert("Textos restablecidos a los valores sugeridos.");
                      }}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-xl text-xs font-medium transition-colors border border-border"
                    >
                      🔄 Restablecer
                    </button>
                  </div>
                </div>

                {/* ETIQUETAS DINÁMICAS DISPONIBLES */}
                <div className="p-3.5 rounded-xl bg-background border border-border space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-gold tracking-wider block">
                    ✨ Variables Dinámicas Disponibles (Haz clic o escríbelas en tu texto):
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 font-mono text-amber-800 font-semibold cursor-pointer">
                      {"{nombre}"} → Nombre del comensal
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 font-mono text-amber-800 font-semibold cursor-pointer">
                      {"{premio}"} → Beneficio ganado
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 font-mono text-amber-800 font-semibold cursor-pointer">
                      {"{codigo}"} → Código del cupón
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 font-mono text-amber-800 font-semibold cursor-pointer">
                      {"{mesa}"} → Mesa asignada
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 font-mono text-amber-800 font-semibold cursor-pointer">
                      {"{restaurante}"} → {clientConfig.brand.name}
                    </span>
                  </div>
                </div>

                {/* SELECTOR DE PLANTILLAS Y ÁREA DE EDICIÓN */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* COLUMNA IZQUIERDA: SELECTOR DE CAMPAÑAS (5 cols) */}
                  <div className="lg:col-span-5 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Selecciona la Campaña a Editar:
                    </span>
                    {pushTemplates.map((tmpl, idx) => {
                      const isSelected = selectedTemplateIndex === idx;
                      return (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => setSelectedTemplateIndex(idx)}
                          className={`w-full p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "bg-amber-500/15 border-gold shadow-xs"
                              : "bg-background border-border/80 hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <strong className={`text-xs ${isSelected ? "text-gold" : "text-foreground"}`}>
                              {tmpl.name}
                            </strong>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase font-mono">
                              {tmpl.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate mt-1">
                            {tmpl.title}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* COLUMNA DERECHA: EDITOR DEL MENSAJE SELECCIONADO Y VISTA PREVIA (7 cols) */}
                  <div className="lg:col-span-7 space-y-4 bg-background p-4 sm:p-5 rounded-2xl border border-border">
                    {(() => {
                      const currentTmpl = pushTemplates[selectedTemplateIndex] || pushTemplates[0];
                      const handleTitleChange = (val: string) => {
                        const updated = [...pushTemplates];
                        updated[selectedTemplateIndex] = { ...currentTmpl, title: val };
                        setPushTemplates(updated);
                      };
                      const handleBodyChange = (val: string) => {
                        const updated = [...pushTemplates];
                        updated[selectedTemplateIndex] = { ...currentTmpl, body: val };
                        setPushTemplates(updated);
                      };

                      return (
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gold tracking-wider">
                              Disparador Automático:
                            </span>
                            <p className="text-xs text-muted-foreground font-medium">
                              {currentTmpl.tagDescription}
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground block">
                              Título de la Notificación:
                            </label>
                            <input
                              type="text"
                              value={currentTmpl.title}
                              onChange={(e) => handleTitleChange(e.target.value)}
                              className="w-full text-xs bg-muted/30 border border-border rounded-xl p-2.5 text-foreground focus:ring-1 focus:ring-gold focus:outline-none font-medium"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground block">
                              Cuerpo del Mensaje (Texto que leerá el cliente):
                            </label>
                            <textarea
                              rows={3}
                              value={currentTmpl.body}
                              onChange={(e) => handleBodyChange(e.target.value)}
                              className="w-full text-xs bg-muted/30 border border-border rounded-xl p-2.5 text-foreground focus:ring-1 focus:ring-gold focus:outline-none resize-none leading-relaxed"
                            />
                          </div>

                          {/* VISTA PREVIA EN PANTALLA DE CELULAR */}
                          <div className="pt-2 border-t border-border">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block mb-2">
                              📱 Vista Previa en Pantalla de Bloqueo del Celular:
                            </span>
                            <div className="rounded-xl border border-neutral-700 bg-neutral-900/90 text-white p-3.5 shadow-xl flex items-start gap-3">
                              <img
                                src={clientConfig.brand.logoUrl}
                                alt="Logo"
                                className="h-8 w-8 rounded-lg object-contain bg-white/10 p-1 shrink-0 mt-0.5"
                              />
                              <div className="flex-1 overflow-hidden space-y-0.5">
                                <div className="flex items-center justify-between text-[11px] text-white/50">
                                  <span className="font-semibold text-white/70 uppercase text-[9px] tracking-wider">
                                    {clientConfig.brand.name}
                                  </span>
                                  <span className="text-[9px]">AHORA</span>
                                </div>
                                <h5 className="font-bold text-xs text-white">
                                  {formatPushText(currentTmpl.title)}
                                </h5>
                                <p className="text-[11px] text-white/80 leading-snug">
                                  {formatPushText(currentTmpl.body)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* BOTONES DE DISPARO DE PRUEBA */}
                          <div className="pt-2 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const renderedTitle = formatPushText(currentTmpl.title);
                                const renderedBody = formatPushText(currentTmpl.body);
                                OneSignalService.showLocalTestNotification(renderedTitle, renderedBody);
                              }}
                              className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider inline-flex items-center justify-center gap-2"
                            >
                              <span>🔔 Probar Este Mensaje en Mi Pantalla</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Bases de Datos (Google Sheets & Supabase) y Seguridad de Mesa */}
          {activeTab === "databases" && (
            <div className="space-y-6">
              {/* GUÍA RÁPIDA COLAPSABLE */}
              <SectionQuickGuide
                title="Guía Rápida: Seguridad por Roles (RBAC) & Bases de Datos"
                description="Gestiona los 3 niveles de PIN y la sincronización con Google Sheets o Supabase."
                tips={[
                  {
                    title: "3 Niveles de PIN",
                    text: "👑 Dueño Master (8888), 👔 Administrador (5555) y 💼 Cajero de Turno (1978) con accesos delimitados.",
                  },
                  {
                    title: "Permisos Granulares",
                    text: "El Dueño Master puede conceder o restringir funciones a administradores y cajeros según sus responsabilidades.",
                  },
                  {
                    title: "Respaldo en Supabase",
                    text: "Guarda en tiempo real cada cupón y visita en una base de datos PostgreSQL en la nube.",
                  },
                  {
                    title: "Hojas de Google Sheets",
                    text: "Sincroniza la lista de comensales y premios en una hoja de cálculo visible para gerencia.",
                  },
                ]}
              />

              {/* Encabezado de la pestaña */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="h-4 w-4 text-gold" />
                  <h3 className="font-semibold text-sm text-foreground">
                    Sincronización Dual: Google Sheets & Supabase
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  El sistema permite enviar los cupones y los sellos de fidelización a <strong>Google Sheets</strong>, a <strong>Supabase</strong>, o a <strong>ambas plataformas al mismo tiempo</strong> de forma redundante.
                </p>
              </div>

              {/* CONTENEDOR DE 2 COLUMNAS: GOOGLE SHEETS A LA IZQUIERDA / SUPABASE A LA DERECHA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* OPCIÓN 1: GOOGLE SHEETS */}
                <div className="rounded-2xl border border-emerald-300/80 bg-card p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Opción 1: Google Sheets
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Costo $0 · Activo
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Registra cada ruleta jugada y cada canje con PIN en tu hoja de cálculo compartida en Google Drive.
                  </p>

                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-foreground block">
                      URL del Webhook de Apps Script:
                    </label>
                    <input
                      type="url"
                      placeholder="https://script.google.com/macros/s/.../exec"
                      value={composioConfig.endpoints.googleSheetWebhookUrl}
                      onChange={(e) =>
                        setComposioConfig({
                          ...composioConfig,
                          endpoints: {
                            ...composioConfig.endpoints,
                            googleSheetWebhookUrl: e.target.value,
                          },
                        })
                      }
                      className="w-full text-xs font-mono bg-background border border-border rounded-xl p-2.5 text-foreground focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-muted-foreground block">
                      Guarda automáticamente: Fecha, Cliente, WhatsApp, Correo, Premio, Código y Canje.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      saveComposioConfig(composioConfig);
                      alert("¡Configuración de Google Sheets guardada con éxito!");
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                  >
                    Guardar Google Sheets
                  </button>
                </div>

                {/* OPCIÓN 2: SUPABASE */}
                <div className="rounded-2xl border border-sky-300/80 bg-card p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-sky-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                      Opción 2: Supabase (PostgreSQL)
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={supabaseConfig.enabled}
                        onChange={(e) =>
                          setSupabaseConfig({ ...supabaseConfig, enabled: e.target.checked })
                        }
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span className="text-xs font-bold text-foreground">Habilitar</span>
                    </label>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Base de datos profesional en la nube. Conecta sedes múltiples y sincroniza sellos al milisegundo.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-foreground block mb-1">
                        Project URL de Supabase:
                      </label>
                      <input
                        type="url"
                        placeholder="https://xyzabcdefg.supabase.co"
                        value={supabaseConfig.projectUrl}
                        onChange={(e) =>
                          setSupabaseConfig({ ...supabaseConfig, projectUrl: e.target.value })
                        }
                        className="w-full text-xs font-mono bg-background border border-border rounded-xl p-2.5 text-foreground focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-foreground block mb-1">
                        Anon Public Key:
                      </label>
                      <input
                        type="password"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                        value={supabaseConfig.anonKey}
                        onChange={(e) =>
                          setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })
                        }
                        className="w-full text-xs font-mono bg-background border border-border rounded-xl p-2.5 text-foreground focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-foreground block mb-1">
                        Nombre de la Tabla:
                      </label>
                      <input
                        type="text"
                        value={supabaseConfig.tableName}
                        onChange={(e) =>
                          setSupabaseConfig({ ...supabaseConfig, tableName: e.target.value })
                        }
                        className="w-full text-xs font-mono bg-background border border-border rounded-xl p-2.5 text-foreground focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        saveSupabaseConfig(supabaseConfig);
                        setSupabaseTestStatus({ loading: true });
                        const res = await SupabaseService.testConnection();
                        setSupabaseTestStatus({ loading: false, msg: res.message, success: res.success });
                      }}
                      className="flex-1 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                    >
                      {supabaseTestStatus.loading ? "Probando..." : "Guardar & Probar Conexión"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(SupabaseService.getSqlCreationScript());
                        alert("¡Código SQL copiado al portapapeles! Pégalo en el SQL Editor de Supabase y presiona 'Run'.");
                      }}
                      className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-medium inline-flex items-center justify-center gap-1.5"
                    >
                      <Copy className="h-3.5 w-3.5 text-sky-600" />
                      <span>Copiar SQL</span>
                    </button>
                  </div>

                  {supabaseTestStatus.msg && (
                    <div
                      className={`p-2.5 rounded-xl text-xs ${
                        supabaseTestStatus.success
                          ? "bg-emerald-50 text-emerald-900 border border-emerald-300"
                          : "bg-red-50 text-red-900 border border-red-300"
                      }`}
                    >
                      {supabaseTestStatus.msg}
                    </div>
                  )}
                </div>

              </div>

              {/* SECCIÓN 3: CONTROL DE SEGURIDAD ANTIFRAUDE & PIN DINÁMICO */}
              <div className="rounded-2xl border border-amber-300 bg-amber-50/40 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-amber-700" />
                    <div>
                      <h4 className="text-xs uppercase font-bold tracking-wider text-amber-900">
                        Seguridad Antifraude: Códigos Aleatorios de Mesa y PIN de Caja
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Evita que los clientes se aprendan el PIN o jueguen desde sus casas sin consumir.
                      </p>
                    </div>
                  </div>
                </div>

                {pinChangeFeedback && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>{pinChangeFeedback}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tarjeta 1: PIN Maestro de Dueño */}
                  <div className="p-4 bg-background rounded-2xl border-2 border-gold/40 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="text-[10px] uppercase font-bold text-gold tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                        1. Dueño Master:
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-[9px] font-mono font-bold">
                        Master (Total)
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-2xl font-bold text-foreground px-3 py-1 bg-muted/60 border border-border rounded-xl">
                        {masterPin}
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">Acceso de Propietario</p>
                        <p className="text-[10px] text-muted-foreground">Control total sobre roles y datos.</p>
                      </div>
                    </div>

                    {authenticatedRole === "owner" ? (
                      <div className="pt-2 border-t border-border/50 flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          value={newMasterPinInput}
                          onChange={(e) => setNewMasterPinInput(e.target.value.replace(/\D/g, ""))}
                          placeholder="Nuevo PIN Dueño"
                          className="w-full p-1.5 rounded-lg border border-border bg-card font-mono text-xs text-center font-bold text-foreground"
                        />
                        <button
                          type="button"
                          onClick={handleSaveMasterPin}
                          disabled={newMasterPinInput.length !== 4}
                          className="btn-solid py-1.5 px-3 text-[10px] uppercase font-bold disabled:opacity-40 whitespace-nowrap"
                        >
                          Guardar
                        </button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                        🔒 Solo editable por el Dueño.
                      </p>
                    )}
                  </div>

                  {/* Tarjeta 2: PIN de Administrador / Gerente */}
                  <div className="p-4 bg-background rounded-2xl border-2 border-indigo-500/40 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                        2. Administrador:
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[9px] font-mono font-bold">
                        Gerente
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-2xl font-bold text-indigo-400 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                        {managerPin}
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">Encargado General</p>
                        <p className="text-[10px] text-muted-foreground">Permisos asignados por Dueño.</p>
                      </div>
                    </div>

                    {authenticatedRole === "owner" ? (
                      <div className="pt-2 border-t border-border/50 flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          value={newManagerPinInput}
                          onChange={(e) => setNewManagerPinInput(e.target.value.replace(/\D/g, ""))}
                          placeholder="Nuevo PIN Admin"
                          className="w-full p-1.5 rounded-lg border border-border bg-card font-mono text-xs text-center font-bold text-foreground"
                        />
                        <button
                          type="button"
                          onClick={handleSaveManagerPin}
                          disabled={newManagerPinInput.length !== 4}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] uppercase font-bold disabled:opacity-40 whitespace-nowrap transition-colors"
                        >
                          Guardar
                        </button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                        🔒 Configurado por el Dueño Master.
                      </p>
                    )}
                  </div>

                  {/* Tarjeta 3: PIN de Cajero / Meseros */}
                  <div className="p-4 bg-background rounded-2xl border-2 border-sky-400/40 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-sky-400" />
                        3. Cajero / Turno:
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[9px] font-mono font-bold">
                        Operativo
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-2xl font-bold text-sky-600 px-3 py-1 bg-sky-50 border border-sky-200 rounded-xl">
                        {activePin}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newPin = generateNewCashierPin();
                          setActivePin(newPin);
                          setPinChangeFeedback(`¡Nuevo PIN de turno generado: ${newPin}!`);
                          setTimeout(() => setPinChangeFeedback(null), 3500);
                        }}
                        className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors shadow-xs"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Rotar</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-border/50 flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        value={newCashierPinInput}
                        onChange={(e) => setNewCashierPinInput(e.target.value.replace(/\D/g, ""))}
                        placeholder="PIN Manual Cajero"
                        className="w-full p-1.5 rounded-lg border border-border bg-card font-mono text-xs text-center font-bold text-foreground"
                      />
                      <button
                        type="button"
                        onClick={handleSaveCashierPinManually}
                        disabled={newCashierPinInput.length !== 4}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[10px] uppercase font-bold disabled:opacity-40 whitespace-nowrap transition-colors"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>

                  {/* Matriz de Permisos Editable por el Dueño */}
                  <div className="md:col-span-3 p-5 bg-background rounded-2xl border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] uppercase font-bold text-foreground tracking-wider block">
                          Matriz de Permisos por Rol (Configurada por el Dueño)
                        </span>
                        <p className="text-[10px] text-muted-foreground">
                          {authenticatedRole === "owner" 
                            ? "Como Dueño Master, puedes activar o desactivar permisos para el Administrador y el Cajero haciendo clic en cada casilla."
                            : "Solo el Dueño Master tiene autorización para modificar los permisos de los roles."}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-gold/15 text-gold text-[10px] font-bold font-mono">
                        {authenticatedRole === "owner" ? "Modo Edición Activo" : "Solo Lectura"}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/60 text-[10px] uppercase text-muted-foreground">
                          <tr>
                            <th className="py-2.5 px-3">Funcionalidad del Sistema</th>
                            <th className="py-2.5 px-3 text-center">👑 Dueño Master</th>
                            <th className="py-2.5 px-3 text-center">👔 Administrador</th>
                            <th className="py-2.5 px-3 text-center">💼 Cajero / Turno</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 text-xs">
                          {[
                            { id: "viewMetrics", label: "Métricas en Vivo e Historial de Mesa", desc: "Ver KPIs, ventas y panel de control" },
                            { id: "redeemPrizes", label: "Validación de Premios & Sellos en Mesa", desc: "Quemar códigos de clientes y asignar sellos" },
                            { id: "manageChannels", label: "Canales (WhatsApp & Redes Sociales)", desc: "Editar números y mensaje de foto" },
                            { id: "manageRoulette", label: "Configuración de Ruleta & Probabilidades (%)", desc: "Ajustar premios y chances matemáticas" },
                            { id: "manageStamps", label: "Editar Catálogo de Sellos & Premios", desc: "Modificar hitos de 5, 10 y 15 sellos" },
                            { id: "manageBrand", label: "Motor de Marca Blanca, Logo y Colores", desc: "Personalización visual completa" },
                            { id: "manageDatabases", label: "Google Sheets & Supabase Sync", desc: "Configurar tablas y claves de base de datos" },
                            { id: "manageComposio", label: "Integración Composio.dev & Automatizaciones", desc: "Conector de IA y sincronizaciones externas" },
                          ].map((perm) => (
                            <tr key={perm.id} className="hover:bg-muted/30 transition-colors">
                              <td className="py-2.5 px-3">
                                <span className="font-semibold text-foreground block">{perm.label}</span>
                                <span className="text-[10px] text-muted-foreground">{perm.desc}</span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-gold">
                                ✓ Acceso Total
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <label className="inline-flex items-center justify-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    disabled={authenticatedRole !== "owner"}
                                    checked={rolePermissions.admin[perm.id as keyof RolePermissions["admin"]]}
                                    onChange={() => handleTogglePermission("admin", perm.id as keyof RolePermissions["admin"])}
                                    className="h-4 w-4 rounded border-border text-indigo-600 focus:ring-indigo-500 disabled:opacity-60 cursor-pointer"
                                  />
                                </label>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <label className="inline-flex items-center justify-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    disabled={authenticatedRole !== "owner"}
                                    checked={rolePermissions.cashier[perm.id as keyof RolePermissions["cashier"]]}
                                    onChange={() => handleTogglePermission("cashier", perm.id as keyof RolePermissions["cashier"])}
                                    className="h-4 w-4 rounded border-border text-sky-600 focus:ring-sky-500 disabled:opacity-60 cursor-pointer"
                                  />
                                </label>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: Motor de Marca Blanca, Identidad Visual & Composio */}
          {activeTab === "branding" && (
            <div className="space-y-6 animate-fade-in text-xs">
              {/* Banner superior */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-gold/15 to-amber-500/10 border-2 border-gold/40 text-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gold tracking-widest flex items-center gap-1.5">
                    <Palette className="h-4 w-4 text-gold" />
                    Motor de Marca Blanca & Composio.dev
                  </span>
                  <h3 className="font-display text-base sm:text-lg font-bold">
                    Personaliza tu Restaurante o Negocio al 100%
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed max-w-xl">
                    Edita el nombre comercial, eslogan, logotipo, paleta cromática y canales de contacto. Al hacer clic en <strong>"Sincronizar con Composio & Guardar"</strong>, los cambios se aplican de inmediato en toda la aplicación y quedan grabados.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveBrandAndSyncComposio}
                  disabled={brandSyncStatus.loading}
                  className="btn-solid py-3 px-6 text-xs uppercase tracking-wider font-bold inline-flex items-center justify-center gap-2 shrink-0 shadow-md hover:scale-102 transition-all disabled:opacity-50"
                >
                  {brandSyncStatus.loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Sincronizando...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      <span>Sincronizar con Composio & Guardar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Banner de estado de sincronización */}
              {brandSyncStatus.msg && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold animate-fade-in ${
                    brandSyncStatus.success
                      ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                      : "bg-red-50 border-red-300 text-red-950"
                  }`}
                >
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{brandSyncStatus.msg}</span>
                </div>
              )}

              {/* Grid principal: Formulario a la izquierda + Live Preview a la derecha */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* COLUMNA IZQUIERDA: FORMULARIO DE PERSONALIZACIÓN */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Tarjeta 1: Identidad Básica */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-background border border-border/80 space-y-3.5 shadow-2xs">
                    <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                      <Store className="h-4 w-4 text-gold" />
                      <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                        1. Identidad de Marca & Nombre Comercial
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                          Nombre del Restaurante / Establecimiento:
                        </label>
                        <input
                          type="text"
                          value={brandConfig.name}
                          onChange={(e) => handleBrandChange("name", e.target.value)}
                          placeholder="Ej: Bliss Soul Bakery & Café"
                          className="w-full p-2.5 rounded-xl border border-border bg-card font-medium text-foreground text-xs focus:border-gold outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                          Eslogan Principal (Español):
                        </label>
                        <input
                          type="text"
                          value={brandConfig.tagline}
                          onChange={(e) => handleBrandChange("tagline", e.target.value)}
                          placeholder="Ej: Sabores inolvidables en cada visita."
                          className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground text-xs focus:border-gold outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                          Eslogan en Inglés (English Tagline):
                        </label>
                        <input
                          type="text"
                          value={brandConfig.taglineEn}
                          onChange={(e) => handleBrandChange("taglineEn", e.target.value)}
                          placeholder="Ej: Unforgettable flavors in every visit."
                          className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground text-xs focus:border-gold outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                          Moneda Oficial del Menú:
                        </label>
                        <input
                          type="text"
                          value={brandConfig.currency}
                          onChange={(e) => handleBrandChange("currency", e.target.value)}
                          placeholder="COP, USD, MXN, EUR..."
                          className="w-full p-2.5 rounded-xl border border-border bg-card font-mono text-foreground text-xs focus:border-gold outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta 2: Paleta Cromática Dinámica */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-background border border-border/80 space-y-3.5 shadow-2xs">
                    <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                      <Palette className="h-4 w-4 text-gold" />
                      <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                        2. Paleta Cromática Corporativa
                      </h4>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1.5">
                          Color Primario (Botones, Acentos, Borde Dorado y QR):
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={brandConfig.primaryColor}
                            onChange={(e) => handleBrandChange("primaryColor", e.target.value)}
                            className="h-10 w-14 rounded-xl border border-border cursor-pointer p-0.5 bg-card"
                          />
                          <input
                            type="text"
                            value={brandConfig.primaryColor}
                            onChange={(e) => handleBrandChange("primaryColor", e.target.value)}
                            className="w-32 p-2.5 rounded-xl border border-border bg-card font-mono text-xs font-bold text-foreground focus:border-gold outline-hidden uppercase"
                          />
                          <div
                            className="h-9 px-4 rounded-xl border flex items-center justify-center text-white text-xs font-bold shadow-xs"
                            style={{ backgroundColor: brandConfig.primaryColor }}
                          >
                            Muestra Activa
                          </div>
                        </div>
                      </div>

                      {/* Paletas gastronómicas de 1 toque */}
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-2">
                          Paletas Gastronómicas Predefinidas (1 Toque):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { name: "Dorado Real", hex: "#a27e2c" },
                            { name: "Borgoña Gourmet", hex: "#8b1e2c" },
                            { name: "Esmeralda Café", hex: "#1e6b52" },
                            { name: "Azul Bistro", hex: "#1e3a8a" },
                            { name: "Chocolate Fino", hex: "#5c3826" },
                            { name: "Naranja Brasa", hex: "#d9531e" },
                            { name: "Violeta Lounge", hex: "#6d28d9" },
                            { name: "Negro Élite", hex: "#18181b" },
                          ].map((c) => (
                            <button
                              key={c.hex}
                              type="button"
                              onClick={() => handleSelectColorPreset(c.hex)}
                              className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                                brandConfig.primaryColor.toLowerCase() === c.hex.toLowerCase()
                                  ? "border-foreground bg-muted/60 shadow-xs font-bold"
                                  : "border-border hover:border-foreground/40 bg-card"
                              }`}
                            >
                              <span
                                className="h-4 w-4 rounded-full border border-black/20 shrink-0"
                                style={{ backgroundColor: c.hex }}
                              />
                              <span className="text-[10px] text-foreground truncate">{c.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta 3: Logotipo & Emblemas */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-background border border-border/80 space-y-3.5 shadow-2xs">
                    <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                      <Sparkles className="h-4 w-4 text-gold" />
                      <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                        3. Logotipo Oficial & Emblema Central
                      </h4>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                          URL del Logotipo Principal (Encabezado y Vouchers):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={brandConfig.logoUrl}
                            onChange={(e) => handleBrandChange("logoUrl", e.target.value)}
                            placeholder="https://.../logo.png"
                            className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground text-xs focus:border-gold outline-hidden"
                          />
                          {brandConfig.logoUrl && (
                            <img
                              src={brandConfig.logoUrl}
                              alt="Logo preview"
                              className="h-10 w-16 object-contain rounded-lg border border-border bg-neutral-900 p-1"
                            />
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                          URL del Emblema Central (Centro de la Ruleta y QR):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={brandConfig.emblemUrl}
                            onChange={(e) => handleBrandChange("emblemUrl", e.target.value)}
                            placeholder="https://.../emblema.png"
                            className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground text-xs focus:border-gold outline-hidden"
                          />
                          {brandConfig.emblemUrl && (
                            <img
                              src={brandConfig.emblemUrl}
                              alt="Emblema preview"
                              className="h-10 w-10 object-contain rounded-lg border border-border bg-neutral-900 p-1"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta 4: Canales de Contacto & Redes */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-background border border-border/80 space-y-4 shadow-2xs">
                    <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                      <Smartphone className="h-4 w-4 text-gold" />
                      <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                        4. Canales de Validación en Mesa & Contacto
                      </h4>
                    </div>

                    {/* Explicación de arquitectura de canales */}
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-foreground text-[11px] leading-relaxed">
                      <strong>Canal Inicial y Principal:</strong> El juego funciona inicialmente a través de <strong>Instagram Stories</strong> para amplificar la marca en redes. Opcionalmente, puedes activar <strong>WhatsApp</strong> para brindar una alternativa sencilla a personas mayores o comensales sin redes sociales.
                    </div>

                    {/* SWITCH PARA HABILITAR WHATSAPP EN EL JUEGO */}
                    <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                          <span className="font-bold text-xs text-foreground">
                            Habilitar Opción de WhatsApp en Mesa
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Permite a los comensales enviar la foto de su pedido a WhatsApp además de Instagram.
                        </p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={brandConfig.enableWhatsAppPhotoSubmission ?? true}
                          onChange={(e) =>
                            handleBrandChange("enableWhatsAppPhotoSubmission", e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                          Usuario de Instagram Oficial (Principal):
                        </label>
                        <input
                          type="text"
                          value={brandConfig.instagramHandle}
                          onChange={(e) => handleBrandChange("instagramHandle", e.target.value)}
                          placeholder="@tu_restaurante"
                          className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground text-xs focus:border-gold outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                          WhatsApp Oficial de Atención (con código país):
                        </label>
                        <input
                          type="text"
                          value={brandConfig.whatsappNumber}
                          onChange={(e) => handleBrandChange("whatsappNumber", e.target.value)}
                          placeholder="Ej: 573022777295"
                          className="w-full p-2.5 rounded-xl border border-border bg-card font-mono text-foreground text-xs focus:border-gold outline-hidden"
                        />
                      </div>

                      {(brandConfig.enableWhatsAppPhotoSubmission ?? true) && (
                        <div className="sm:col-span-2">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                            Plantilla del Mensaje de WhatsApp (al recibir foto del comensal):
                          </label>
                          <textarea
                            rows={2}
                            value={
                              brandConfig.whatsappPhotoMessage ||
                              "¡Hola {brandName}! 📸\nAquí les comparto la foto de mi pedido en la mesa {tableNumber} (Cliente: {participantName}) para validar mi visita y jugar en la Ruleta de Premios."
                            }
                            onChange={(e) => handleBrandChange("whatsappPhotoMessage", e.target.value)}
                            placeholder="Variables disponibles: {brandName}, {tableNumber}, {participantName}"
                            className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground text-xs focus:border-gold outline-hidden font-sans"
                          />
                          <span className="text-[9px] text-muted-foreground block mt-0.5">
                            Variables automáticas: <code className="bg-muted px-1 rounded">{"{brandName}"}</code>, <code className="bg-muted px-1 rounded">{"{tableNumber}"}</code>, <code className="bg-muted px-1 rounded">{"{participantName}"}</code>
                          </span>
                        </div>
                      )}

                      <div className="sm:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                          Enlace a Reseñas de Google Maps:
                        </label>
                        <input
                          type="text"
                          value={brandConfig.googleMapsReviewUrl}
                          onChange={(e) => handleBrandChange("googleMapsReviewUrl", e.target.value)}
                          placeholder="https://g.page/r/.../review"
                          className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground text-xs focus:border-gold outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA: LIVE PREVIEW INTERACTIVO */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 text-white border-2 border-gold/40 shadow-xl space-y-4 sticky top-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="text-[10px] uppercase tracking-widest text-gold font-bold flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        Vista Previa en Vivo (Live Mockup)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[9px] font-mono">
                        Tiempo Real
                      </span>
                    </div>

                    {/* Mockup del encabezado móvil */}
                    <div className="p-3.5 rounded-2xl bg-neutral-800/80 border border-white/10 text-center space-y-2">
                      {brandConfig.logoUrl ? (
                        <img
                          src={brandConfig.logoUrl}
                          alt="Logo"
                          className="h-8 max-w-[120px] mx-auto object-contain brightness-0 invert"
                        />
                      ) : (
                        <div className="h-8 flex items-center justify-center font-display font-bold text-base text-gold">
                          {brandConfig.name}
                        </div>
                      )}
                      <p className="font-display font-bold text-xs text-white">
                        {brandConfig.name}
                      </p>
                      <p className="text-[10px] text-white/60 italic leading-snug">
                        "{brandConfig.tagline}"
                      </p>
                    </div>

                    {/* Mockup del Voucher de Premio */}
                    <div className="p-4 rounded-2xl bg-card text-foreground border-2 border-gold/50 shadow-md space-y-3 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Disponible para Aplicar</span>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground block">
                          Beneficio asignado
                        </span>
                        <h4 className="font-display font-bold text-sm text-foreground">
                          Postre de Autor o Descuento Especial
                        </h4>
                      </div>

                      {/* Mini Botón con el Color Corporativo */}
                      <button
                        type="button"
                        className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                        style={{ backgroundColor: brandConfig.primaryColor }}
                      >
                        Presentar en Caja ({brandConfig.name})
                      </button>

                      <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>WhatsApp: {brandConfig.whatsappNumber}</span>
                        <span>{brandConfig.currency}</span>
                      </div>
                    </div>

                    {/* Explicación de Composio */}
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/80 space-y-1 leading-relaxed">
                      <p className="font-bold text-gold flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-gold" />
                        Integración Composio.dev
                      </p>
                      <p className="text-[10px] text-white/60">
                        Al presionar guardar, este perfil de marca se sincroniza con tus agentes y webhooks para que los mensajes de WhatsApp, correos automáticos y tablas de clientes reflejen la identidad de tu marca automáticamente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: Ofertas Push & Flujos Automatizados OneSignal */}
          {activeTab === "push_campaigns" && (
            <div className="space-y-6">
              {/* GUÍA RÁPIDA COLAPSABLE */}
              <SectionQuickGuide
                title="Guía Rápida: Ofertas Push & Automatizaciones OneSignal"
                description="Envía promociones inmediatas a todos los clientes suscritos y activa flujos inteligentes que aumentan la frecuencia de visita."
                tips={[
                  {
                    title: "Envío Inmediato (1-Clic)",
                    text: "Utiliza las plantillas rápidas (2x1, Postre de Cortesía, etc.) para enviar notificaciones masivas instantáneas a teléfonos y computadores.",
                  },
                  {
                    title: "4 Flujos Automatizados",
                    text: "El sistema dispara automáticamente mensajes en momentos clave: Bienvenida (6 min), Urgencia de vencimiento (24h), Reactivación de clientes inactivos (14 días) y Doble sello en horas muertas.",
                  },
                  {
                    title: "OneSignal REST API & Webhooks",
                    text: "Conecta tu App ID y REST API Key de OneSignal para envíos automáticos o utiliza el webhook integrado para n8n, Make y Composio.",
                  },
                  {
                    title: "Variables Dinámicas",
                    text: "Usa etiquetas como {nombre}, {premio} y {restaurante} para que cada notificación se personalice automáticamente para cada cliente.",
                  },
                ]}
              />

              {/* CARD 1: ENVÍO DE OFERTAS PUSH MASIVAS (1-CLIC BROADCAST) */}
              <div className="rounded-2xl border border-sky-400/40 bg-card p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm">
                      🚀
                    </span>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">
                        Envío de Oferta Masiva Instantánea (1-Clic Broadcast)
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Notifica de inmediato a todos los clientes suscritos con ofertas de alto impacto.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-400/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                    Web Push & API
                  </span>
                </div>

                {/* Plantillas Rápidas con 1 Clic */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Plantillas de Ofertas Rápidas (Haz clic para cargar):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setBroadcastOffer({
                          title: "⚡ ¡Happy Hour 2x1 en Bebidas!",
                          body: "¡Hola! Hoy de 3:00 a 6:00 PM acumula el DOBLE de sellos y disfruta 2x1 en bebidas. ¡Te esperamos!",
                          url: "",
                          segment: "Subscribed Users",
                        })
                      }
                      className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 text-left text-xs transition-all flex flex-col justify-between"
                    >
                      <span className="font-bold text-amber-500 text-[11px]">⚡ Happy Hour 2x1</span>
                      <span className="text-[10px] text-muted-foreground mt-1">Horas muertas (3 a 6 PM)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setBroadcastOffer({
                          title: "🍰 ¡Postre de Cortesía Hoy!",
                          body: "Muestra esta notificación hoy en tu visita y recibe un postre de autor artesanal de cortesía con tu consumo.",
                          url: "",
                          segment: "Subscribed Users",
                        })
                      }
                      className="p-2.5 rounded-xl border border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/15 text-left text-xs transition-all flex flex-col justify-between"
                    >
                      <span className="font-bold text-pink-400 text-[11px]">🍰 Postre de Cortesía</span>
                      <span className="text-[10px] text-muted-foreground mt-1">Incentivo dulce en mesa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setBroadcastOffer({
                          title: "⏳ Cupón Flash: 50% en tu 2° Plato",
                          body: "¡Solo por hoy! Disfruta 50% de descuento en tu segundo plato o bebida favorita. ¡No te quedes sin mesa!",
                          url: "",
                          segment: "Subscribed Users",
                        })
                      }
                      className="p-2.5 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/15 text-left text-xs transition-all flex flex-col justify-between"
                    >
                      <span className="font-bold text-red-400 text-[11px]">⏳ Cupón Flash 50%</span>
                      <span className="text-[10px] text-muted-foreground mt-1">Válido exclusivamente hoy</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setBroadcastOffer({
                          title: "🌟 ¡Sellos Dobles este Fin de Semana!",
                          body: "¡Cada visita este fin de semana suma 2 sellos en tu tarjeta digital! Llega más rápido a tu premio.",
                          url: "",
                          segment: "Subscribed Users",
                        })
                      }
                      className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 text-left text-xs transition-all flex flex-col justify-between"
                    >
                      <span className="font-bold text-emerald-400 text-[11px]">🌟 Sellos Dobles</span>
                      <span className="text-[10px] text-muted-foreground mt-1">Acelera la fidelización</span>
                    </button>
                  </div>
                </div>

                {/* Formulario de Campaña */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">
                      Título de la Notificación Push
                    </label>
                    <input
                      type="text"
                      value={broadcastOffer.title}
                      onChange={(e) => setBroadcastOffer({ ...broadcastOffer, title: e.target.value })}
                      placeholder="Ej: ⚡ ¡Happy Hour 2x1 en Café de Especialidad!"
                      className="w-full rounded-xl border border-border p-2.5 text-xs bg-background text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">
                      Segmento de Destinatarios
                    </label>
                    <select
                      value={broadcastOffer.segment}
                      onChange={(e) => setBroadcastOffer({ ...broadcastOffer, segment: e.target.value })}
                      className="w-full rounded-xl border border-border p-2.5 text-xs bg-background text-foreground"
                    >
                      <option value="Subscribed Users">Todos los Suscriptores</option>
                      <option value="Active Customers">Clientes Frecuentes (+5 sellos)</option>
                      <option value="Inactive Customers">Clientes Inactivos (+14 días)</option>
                    </select>
                  </div>

                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">
                      Mensaje / Cuerpo de la Oferta
                    </label>
                    <textarea
                      rows={2}
                      value={broadcastOffer.body}
                      onChange={(e) => setBroadcastOffer({ ...broadcastOffer, body: e.target.value })}
                      placeholder="Escribe el mensaje persuasivo que verán los clientes en la pantalla de su teléfono o PC..."
                      className="w-full rounded-xl border border-border p-2.5 text-xs bg-background text-foreground resize-none"
                    />
                  </div>

                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">
                      Enlace de Destino (Opcional - URL al hacer clic)
                    </label>
                    <input
                      type="url"
                      value={broadcastOffer.url}
                      onChange={(e) => setBroadcastOffer({ ...broadcastOffer, url: e.target.value })}
                      placeholder="https://tudominio.com/promo (Déjalo vacío para abrir la app del restaurante)"
                      className="w-full rounded-xl border border-border p-2 text-xs bg-background text-foreground"
                    />
                  </div>
                </div>

                {/* Feedback de Envío */}
                {broadcastStatus.msg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in ${
                      broadcastStatus.success
                        ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400"
                        : "bg-red-500/15 border border-red-500/40 text-red-300"
                    }`}
                  >
                    <span>{broadcastStatus.success ? "✓" : "⚠"}</span>
                    <span>{broadcastStatus.msg}</span>
                  </div>
                )}

                {/* Botón de Envío Instantáneo */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border">
                  <div className="text-[11px] text-muted-foreground">
                    💡 Dispara una notificación inmediata y genera un registro en el panel de control.
                  </div>
                  <button
                    type="button"
                    disabled={broadcastStatus.loading || !broadcastOffer.title.trim()}
                    onClick={async () => {
                      setBroadcastStatus({ loading: true });
                      const result = await OneSignalService.sendBroadcastPush(broadcastOffer);
                      setBroadcastStatus({ loading: false, msg: result.message, success: result.success });
                      setTimeout(() => setBroadcastStatus({ loading: false }), 4500);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    <span>{broadcastStatus.loading ? "Enviando Notificaciones..." : "🚀 Enviar Notificación Masiva Ahora"}</span>
                  </button>
                </div>
              </div>

              {/* CARD 2: CAMPAÑAS AUTOMATIZADAS POR FLUJOS DE COMPORTAMIENTO */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                      ⚡
                    </span>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">
                        4 Flujos Automatizados por Comportamiento
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Estos mensajes se disparan de forma autónoma según las visitas y tiempos del cliente.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      saveAutomatedFlows(automatedFlows);
                      alert("¡Configuración de los 4 flujos automatizados guardada exitosamente!");
                    }}
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Guardar Flujos</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {automatedFlows.map((flow, index) => (
                    <div
                      key={flow.id}
                      className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                        flow.enabled
                          ? "bg-muted/20 border-border shadow-xs"
                          : "bg-muted/10 border-border/50 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider ${
                              flow.category === "welcome"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : flow.category === "expiring_coupon"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : flow.category === "win_back"
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                            }`}
                          >
                            {flow.badge}
                          </span>
                          <strong className="text-foreground text-xs">{flow.name}</strong>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={flow.enabled}
                            onChange={(e) => {
                              const updated = [...automatedFlows];
                              updated[index].enabled = e.target.checked;
                              setAutomatedFlows(updated);
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      <p className="text-[10px] text-muted-foreground font-mono bg-muted/40 p-1.5 rounded-lg">
                        ⏱️ {flow.triggerDescription}
                      </p>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">
                          Título:
                        </label>
                        <input
                          type="text"
                          value={flow.title}
                          onChange={(e) => {
                            const updated = [...automatedFlows];
                            updated[index].title = e.target.value;
                            setAutomatedFlows(updated);
                          }}
                          className="w-full rounded-lg border border-border p-1.5 text-xs bg-background text-foreground"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">
                          Mensaje:
                        </label>
                        <textarea
                          rows={2}
                          value={flow.body}
                          onChange={(e) => {
                            const updated = [...automatedFlows];
                            updated[index].body = e.target.value;
                            setAutomatedFlows(updated);
                          }}
                          className="w-full rounded-lg border border-border p-1.5 text-xs bg-background text-foreground resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] text-muted-foreground font-mono">
                          Etiquetas: {"{nombre}"}, {"{premio}"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const testTitle = flow.title
                              .replace("{nombre}", "Carlos")
                              .replace("{restaurante}", clientConfig.brand.name);
                            const testBody = flow.body
                              .replace("{nombre}", "Carlos")
                              .replace("{premio}", "Postre de Autor")
                              .replace("{codigo}", "CAFE-88")
                              .replace("{restaurante}", clientConfig.brand.name);
                            OneSignalService.showLocalTestNotification(testTitle, testBody);
                          }}
                          className="text-[10px] font-semibold text-purple-400 hover:text-purple-300 transition flex items-center gap-1"
                        >
                          <span>🧪 Probar Notificación</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 3: CONEXIÓN ONESIGNAL REST API & WEBHOOKS */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm">
                      ⚙️
                    </span>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">
                        Credenciales OneSignal REST API & Webhooks
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Permite que el panel envíe notificaciones directamente vía REST API o notifique a tu webhook.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">OneSignal App ID</label>
                    <input
                      type="text"
                      value={pushConfig.appId}
                      onChange={(e) => setPushConfig({ ...pushConfig, appId: e.target.value })}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      className="w-full rounded-xl border border-border p-2 text-xs bg-background text-foreground font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">
                      OneSignal REST API Key (Opcional)
                    </label>
                    <input
                      type="password"
                      value={pushConfig.restApiKey || ""}
                      onChange={(e) => setPushConfig({ ...pushConfig, restApiKey: e.target.value })}
                      placeholder="Os_v2_app_xxxxxxxxxxxx..."
                      className="w-full rounded-xl border border-border p-2 text-xs bg-background text-foreground font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Webhook URL Masivo</label>
                    <input
                      type="url"
                      value={pushConfig.webhookUrl || ""}
                      onChange={(e) => setPushConfig({ ...pushConfig, webhookUrl: e.target.value })}
                      placeholder="https://tu-servidor.com/api/push/broadcast"
                      className="w-full rounded-xl border border-border p-2 text-xs bg-background text-foreground font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      savePushConfig(pushConfig);
                      alert("¡Configuración de API y Webhooks de OneSignal guardada!");
                    }}
                    className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition"
                  >
                    Guardar Configuración de Conexión
                  </button>
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </div>

        {/* MENÚ DE NAVEGACIÓN VERTICAL A LA IZQUIERDA (Categorizado y fácil de personalizar) */}
        <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-border bg-neutral-950/90 p-3.5 sm:p-4 order-1 md:order-1 shrink-0 overflow-y-auto flex flex-col gap-4">
          <div className="px-1 pb-1 border-b border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
              Categorías
            </span>
            <span className="text-[10px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/30">
              {authenticatedRole === "owner" ? "Dueño" : authenticatedRole === "admin" ? "Admin" : "Cajero"}
            </span>
          </div>

          {/* Grupo 1: OPERACIONES */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gold/80 font-bold px-2 block">
              📊 Operaciones
            </span>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab("stats")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTab === "stats"
                    ? "bg-gold text-neutral-950 shadow-md font-bold"
                    : "text-neutral-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className={`h-4 w-4 ${activeTab === "stats" ? "text-neutral-950" : "text-gold"}`} />
                  <div>
                    <div className="leading-tight">{t("Métricas en Vivo", "Live Metrics")}</div>
                    <div className={`text-[10px] font-normal ${activeTab === "stats" ? "text-neutral-900" : "text-neutral-400"}`}>
                      KPIs, canjes y ventas
                    </div>
                  </div>
                </div>
                {!canAccessTab("stats") && <Lock className="h-3 w-3 text-amber-500" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("messages")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTab === "messages"
                    ? "bg-gold text-neutral-950 shadow-md font-bold"
                    : "text-neutral-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className={`h-4 w-4 ${activeTab === "messages" ? "text-neutral-950" : "text-emerald-400"}`} />
                  <div>
                    <div className="leading-tight">{t("WhatsApp & Mensajes", "WhatsApp Messages")}</div>
                    <div className={`text-[10px] font-normal ${activeTab === "messages" ? "text-neutral-900" : "text-neutral-400"}`}>
                      Notificación al cliente
                    </div>
                  </div>
                </div>
                {!canAccessTab("messages") && <Lock className="h-3 w-3 text-amber-500" />}
              </button>
            </div>
          </div>

          {/* Grupo 2: FIDELIZACIÓN & PREMIOS */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gold/80 font-bold px-2 block">
              🎯 Fidelización
            </span>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab("prizes")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTab === "prizes"
                    ? "bg-gold text-neutral-950 shadow-md font-bold"
                    : "text-neutral-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className={`h-4 w-4 ${activeTab === "prizes" ? "text-neutral-950" : "text-purple-400"}`} />
                  <div>
                    <div className="leading-tight">{t("Ruleta & 15 Sellos", "Prizes & Stamps")}</div>
                    <div className={`text-[10px] font-normal ${activeTab === "prizes" ? "text-neutral-900" : "text-neutral-400"}`}>
                      Premios y probabilidades
                    </div>
                  </div>
                </div>
                {!canAccessTab("prizes") && <Lock className="h-3 w-3 text-amber-500" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("campaign")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTab === "campaign"
                    ? "bg-gold text-neutral-950 shadow-md font-bold"
                    : "text-neutral-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award className={`h-4 w-4 ${activeTab === "campaign" ? "text-neutral-950" : "text-amber-400"}`} />
                  <div>
                    <div className="leading-tight">{t("Campaña & Reglas", "Campaign & Rules")}</div>
                    <div className={`text-[10px] font-normal ${activeTab === "campaign" ? "text-neutral-900" : "text-neutral-400"}`}>
                      Vigencia y términos
                    </div>
                  </div>
                </div>
                {!canAccessTab("campaign") && <Lock className="h-3 w-3 text-amber-500" />}
              </button>
            </div>
          </div>

          {/* Grupo 3: MARKETING PUSH & OFERTAS */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold">
                🚀 Marketing Push
              </span>
              <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono font-bold">
                PRO
              </span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab("push_campaigns")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTab === "push_campaigns"
                    ? "bg-gradient-to-r from-sky-400 to-blue-500 text-neutral-950 shadow-md font-bold"
                    : "text-neutral-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Radio className={`h-4 w-4 ${activeTab === "push_campaigns" ? "text-neutral-950" : "text-sky-400"}`} />
                  <div>
                    <div className="leading-tight">Ofertas Push & Flujos</div>
                    <div className={`text-[10px] font-normal ${activeTab === "push_campaigns" ? "text-neutral-900" : "text-neutral-400"}`}>
                      OneSignal y 4 flujos auto
                    </div>
                  </div>
                </div>
                {!canAccessTab("push_campaigns") && <Lock className="h-3 w-3 text-amber-500" />}
              </button>
            </div>
          </div>

          {/* Grupo 4: CONFIGURACIÓN & INTEGRACIONES */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold px-2 block">
              ⚙️ Configuración
            </span>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab("branding")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTab === "branding"
                    ? "bg-gold text-neutral-950 shadow-md font-bold"
                    : "text-neutral-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Palette className={`h-4 w-4 ${activeTab === "branding" ? "text-neutral-950" : "text-pink-400"}`} />
                  <div>
                    <div className="leading-tight">{t("Marca & Identidad", "Brand Identity")}</div>
                    <div className={`text-[10px] font-normal ${activeTab === "branding" ? "text-neutral-900" : "text-neutral-400"}`}>
                      Logo, colores, eslogan
                    </div>
                  </div>
                </div>
                {!canAccessTab("branding") && <Lock className="h-3 w-3 text-amber-500" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("composio")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTab === "composio"
                    ? "bg-gold text-neutral-950 shadow-md font-bold"
                    : "text-neutral-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bell className={`h-4 w-4 ${activeTab === "composio" ? "text-neutral-950" : "text-indigo-400"}`} />
                  <div>
                    <div className="leading-tight">{t("Composio.dev & AI", "Composio.dev & AI")}</div>
                    <div className={`text-[10px] font-normal ${activeTab === "composio" ? "text-neutral-900" : "text-neutral-400"}`}>
                      Conexión con 200+ apps
                    </div>
                  </div>
                </div>
                {!canAccessTab("composio") && <Lock className="h-3 w-3 text-amber-500" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("databases")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTab === "databases"
                    ? "bg-gold text-neutral-950 shadow-md font-bold"
                    : "text-neutral-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className={`h-4 w-4 ${activeTab === "databases" ? "text-neutral-950" : "text-cyan-400"}`} />
                  <div>
                    <div className="leading-tight">{t("Seguridad & Bases Datos", "Security & DB")}</div>
                    <div className={`text-[10px] font-normal ${activeTab === "databases" ? "text-neutral-900" : "text-neutral-400"}`}>
                      PINs RBAC y Supabase
                    </div>
                  </div>
                </div>
                {!canAccessTab("databases") && <Lock className="h-3 w-3 text-amber-500" />}
              </button>
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-white/10 text-[10px] text-neutral-400 space-y-1">
            <div className="flex items-center justify-between text-neutral-300 font-mono">
              <span>Modo Activo:</span>
              <span className="text-gold font-bold">15 Sellos</span>
            </div>
            <p className="text-[9px] text-neutral-400">
              Navegación vertical en mano derecha optimizada para personalizar el sistema con fluidez.
            </p>
          </div>
        </div>
      </div>

      {/* Pie del modal */}
      <div className="bg-neutral-900/90 p-3.5 px-6 border-t border-border flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Sistema de Fidelización Activo</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          Cerrar Panel
        </button>
      </div>
      </div>
    </div>
  );
}
