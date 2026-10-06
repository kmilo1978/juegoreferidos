import { useState } from "react";
import { GamePrize, WonPrize } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { apiUrl, getAuthToken, loginWithPin } from "@/lib/apiClient";
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
  Filter,
  PieChart,
  Bookmark,
  Trash2,
  CalendarClock,
  Tag,
  CheckSquare,
  Square,
} from "lucide-react";
import { calculateAnalytics } from "../../lib/analyticsService";
import { clientConfig } from "../../config/clientConfig";
import { TableManagerService, RestaurantTable } from "../../lib/tableManagerService";
import {
  OneSignalService,
  getCustomPushTemplates,
  saveCustomPushTemplates,
  resetPushTemplates,
  PushNotificationTemplate,
  formatPushText,
  AutomatedPushFlow,
  getAutomatedFlows,
  saveAutomatedFlows,
  CustomSavedOffer,
  getCustomSavedOffers,
  saveCustomSavedOffer,
  deleteCustomSavedOffer,
} from "../../lib/oneSignalService";
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
import { GameConfigService, DIFFICULTY_SETTINGS } from "../../lib/gameConfigService";
import { GameConfig, GameMode, PrecisionDifficulty } from "./gameTypes";

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
    "stats" | "tables" | "prizes" | "campaign" | "messages" | "push_campaigns" | "branding" | "security"
  >("stats");
  
  // Estados para las 10 mesas en tiempo real
  const [tablesList, setTablesList] = useState<RestaurantTable[]>(() => TableManagerService.getTables());
  const [selectedTableToEdit, setSelectedTableToEdit] = useState<number>(1);
  const [tableEditName, setTableEditName] = useState<string>("Mesa 1");
  const [tableEditZone, setTableEditZone] = useState<string>("Salón Principal");
  const [tableEditCapacity, setTableEditCapacity] = useState<number>(4);
  const [tableFeedback, setTableFeedback] = useState<string | null>(null);

  const handleResetTableInModal = (num: number) => {
    if (confirm(`¿Deseas liberar la Mesa ${num} para recibir a un nuevo comensal?`)) {
      const updated = TableManagerService.resetTable(num);
      setTablesList(updated);
      setTableFeedback(`¡Mesa ${num} liberada y lista para recibir clientes!`);
      setTimeout(() => setTableFeedback(null), 3500);
    }
  };

  const handleSaveTableConfigInModal = () => {
    const updated = TableManagerService.configureTable(selectedTableToEdit, {
      name: tableEditName.trim() || `Mesa ${selectedTableToEdit}`,
      zone: tableEditZone,
      capacity: tableEditCapacity,
    });
    setTablesList(updated);
    setTableFeedback(`¡Configuración de Mesa ${selectedTableToEdit} guardada con éxito!`);
    setTimeout(() => setTableFeedback(null), 3500);
  };

  const [activePin, setActivePin] = useState(() => getActiveCashierPin());
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

  // Estados de Personalización y Guardado de Ofertas Push
  const [savedOffersList, setSavedOffersList] = useState<CustomSavedOffer[]>(() => getCustomSavedOffers());
  const [offerTemplateName, setOfferTemplateName] = useState<string>("");
  const [scheduleType, setScheduleType] = useState<"immediate" | "scheduled">("immediate");
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [pushChannels, setPushChannels] = useState<{ push: boolean; webhook: boolean; whatsappPreview: boolean }>({
    push: true,
    webhook: true,
    whatsappPreview: true,
  });

  // Estados de Filtros para el Dashboard de Métricas
  const [statsPeriodFilter, setStatsPeriodFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [statsStatusFilter, setStatsStatusFilter] = useState<"all" | "UTILIZADO" | "DISPONIBLE">("all");
  const [statsTableFilter, setStatsTableFilter] = useState<string>("all");
  const [statsSearchQuery, setStatsSearchQuery] = useState<string>("");

  // Sub-sección para premios: "roulette" (Ruleta) | "stamps" (Tarjeta de Sellos)
  const [prizeSection, setPrizeSection] = useState<"roulette" | "stamps">("roulette");
  const [stampRewards, setStampRewards] = useState<StampReward[]>(() => StampService.getStampRewards());
  const [visitIcon, setVisitIcon] = useState<string>(() => StampService.getVisitIcon());
  const [stampGlobalMode] = useState<15>(15);
  const [stampSaveFeedback, setStampSaveFeedback] = useState<string | null>(null);

  // Estados de Configuración de Mecánica de Juego (Ruleta vs Precisión 10s vs Híbrido)
  const [modalGameConfig, setModalGameConfig] = useState<GameConfig>(() => GameConfigService.getGameConfig());
  const [gameConfigSaveFeedback, setGameConfigSaveFeedback] = useState<string | null>(null);

  const handleUpdateModalGameConfig = (updates: Partial<GameConfig>) => {
    const updated = GameConfigService.saveGameConfig(updates);
    setModalGameConfig(updated);
    setGameConfigSaveFeedback("¡Mecánica de juego actualizada y sincronizada en todas las mesas!");
    setTimeout(() => setGameConfigSaveFeedback(null), 3500);
  };

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
    tab: "stats" | "prizes" | "campaign" | "messages" | "push_campaigns" | "branding" | "security" | "tables"
  ): boolean => {
    if (authenticatedRole === "owner") return true;
    if (!authenticatedRole) return false;
    switch (tab) {
      case "stats":
        return hasPermission(authenticatedRole, "viewMetrics");
      case "tables":
        return true;
      case "prizes":
        return hasPermission(authenticatedRole, "manageRoulette") || hasPermission(authenticatedRole, "manageStamps");
      case "campaign":
        return hasPermission(authenticatedRole, "manageChannels");
      case "messages":
        return hasPermission(authenticatedRole, "redeemPrizes") || hasPermission(authenticatedRole, "manageChannels");
      case "push_campaigns":
        return hasPermission(authenticatedRole, "manageChannels");
      case "branding":
        return hasPermission(authenticatedRole, "manageBrand");
      case "security":
        return false; // Owner is handled at the top of the function
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
      // Obtener token de sesión del backend para autorizar los POST protegidos.
      // Es best-effort: si el backend no responde, la UI sigue funcionando en
      // modo local, pero las escrituras al servidor requerirán el token.
      loginWithPin(pin).catch(() => {});
      if (!canAccessTab(activeTab)) {
        setActiveTab("stats");
      }
    } else {
      // No revelar los PINs válidos en el mensaje de error.
      setPinError("PIN no reconocido. Verifica tu PIN e inténtalo de nuevo.");
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
      fetch(apiUrl("/config"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}) },
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
      fetch(apiUrl("/config"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}) },
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
      fetch(apiUrl("/config"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}) },
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
    fetch(apiUrl("/config"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}) },
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
      fetch(apiUrl("/config"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}) },
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

  // Handlers para Personalización y Guardado de Ofertas Push
  const handleInsertTag = (tag: string) => {
    setBroadcastOffer((prev) => ({
      ...prev,
      body: prev.body ? `${prev.body} ${tag}` : tag,
    }));
  };

  const handleSaveAsOfferTemplate = () => {
    if (!broadcastOffer.title.trim()) {
      alert("Por favor ingresa al menos un título para la oferta.");
      return;
    }
    const nameToUse = offerTemplateName.trim() || broadcastOffer.title.slice(0, 32);
    const newOffer: CustomSavedOffer = {
      id: "offer_" + Date.now(),
      name: nameToUse,
      title: broadcastOffer.title,
      body: broadcastOffer.body,
      url: broadcastOffer.url,
      segment: broadcastOffer.segment,
      scheduleType,
      scheduledTime: scheduleType === "scheduled" ? scheduledTime : undefined,
      channels: pushChannels,
      createdAt: new Date().toLocaleDateString("es-CO"),
    };
    const updated = saveCustomSavedOffer(newOffer);
    setSavedOffersList(updated);
    setOfferTemplateName("");
    alert(`¡Plantilla "${nameToUse}" guardada exitosamente en tus ofertas reutilizables!`);
  };

  const handleDeleteSavedOffer = (id: string) => {
    if (confirm("¿Deseas eliminar esta plantilla de oferta guardada?")) {
      const updated = deleteCustomSavedOffer(id);
      setSavedOffersList(updated);
    }
  };

  const handleLoadSavedOffer = (offer: CustomSavedOffer) => {
    setBroadcastOffer({
      title: offer.title,
      body: offer.body,
      url: offer.url || "",
      segment: offer.segment || "Subscribed Users",
    });
    setOfferTemplateName(offer.name);
    if (offer.scheduleType) setScheduleType(offer.scheduleType);
    if (offer.scheduledTime) setScheduledTime(offer.scheduledTime);
    if (offer.channels) setPushChannels(offer.channels);
  };

  // Listado de mesas únicas encontradas en el historial
  const uniqueTables = Array.from(new Set(history.map((h) => h.tableNumber).filter(Boolean)));

  // Filtro reactivo del historial de participaciones y métricas
  const filteredHistory = history.filter((item) => {
    if (statsStatusFilter !== "all" && item.status !== statsStatusFilter) return false;
    if (statsTableFilter !== "all" && item.tableNumber !== statsTableFilter) return false;
    if (statsSearchQuery.trim()) {
      const q = statsSearchQuery.toLowerCase();
      const matchCode = item.uniqueCode?.toLowerCase().includes(q);
      const matchName = item.participantName?.toLowerCase().includes(q);
      const matchTel = item.participantWhatsapp?.toLowerCase().includes(q);
      const matchPrize = item.prizeName?.toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchTel && !matchPrize) return false;
    }
    if (statsPeriodFilter === "today") {
      const timeStr = (item.wonAt || "").toLowerCase();
      return timeStr.includes(":") || timeStr.includes("hoy");
    }
    return true;
  });

  // Métricas reactivas a los filtros
  const totalFilteredCount = filteredHistory.length;
  const filteredRedeemedCount = filteredHistory.filter((h) => h.status === "UTILIZADO").length;
  const filteredAvailableCount = filteredHistory.filter((h) => h.status === "DISPONIBLE").length;
  const filteredConversionRate = totalFilteredCount > 0 ? Math.round((filteredRedeemedCount / totalFilteredCount) * 100) : 0;

  // Clientes únicos y recurrentes en los datos filtrados
  const clientVisitsMap: Record<string, number> = {};
  filteredHistory.forEach((h) => {
    const key = h.participantWhatsapp || h.participantName || "anónimo";
    clientVisitsMap[key] = (clientVisitsMap[key] || 0) + 1;
  });
  const filteredUniqueClients = Object.keys(clientVisitsMap).length;
  const filteredReturningClients = Object.values(clientVisitsMap).filter((visits) => visits > 1).length;

  // Distribución de premios para la gráfica
  const prizeDistributionMap: Record<string, number> = {};
  filteredHistory.forEach((h) => {
    const name = h.prizeName || "Premio";
    prizeDistributionMap[name] = (prizeDistributionMap[name] || 0) + 1;
  });
  const prizeDistributionList = Object.entries(prizeDistributionMap).map(([name, count]) => ({
    name,
    count,
    percentage: totalFilteredCount > 0 ? Math.round((count / totalFilteredCount) * 100) : 0,
  }));

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
              {/* GUÍA RÁPIDA COLAPSABLE */}
              <SectionQuickGuide
                title="Guía Rápida: Dashboard con Gráficas y Filtros en Vivo"
                description="Analiza la retención de clientes, el embudo de conversión, los premios más ganados y filtra por fecha, estado y mesa en tiempo real."
                tips={[
                  {
                    title: "Filtros en Tiempo Real",
                    text: "Usa los selectores de período, estado de canje y número de mesa para recalcular instantáneamente todas las gráficas y la tabla.",
                  },
                  {
                    title: "Embudo de Conversión (Funnel)",
                    text: "Muestra cuántas personas vieron el QR en mesa, cuántas jugaron, cuántas canjearon en caja y cuántas se convirtieron en clientes recurrentes.",
                  },
                  {
                    title: "Distribución de Premios",
                    text: "Comprueba visualmente qué premios de la ruleta y sellos tienen mayor salida para optimizar costos de inventario.",
                  },
                  {
                    title: "Horómetro de Actividad",
                    text: "Detecta tus horas pico y horas muertas (3:00 a 6:00 PM) para lanzar promociones push automáticas.",
                  },
                ]}
              />

              {/* BARRA DE FILTROS INTERACTIVOS */}
              <div className="rounded-2xl border border-gold/40 bg-card p-4 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-xl bg-gold/20 text-gold flex items-center justify-center font-bold text-sm">
                      <Filter className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2">
                        <span>Filtros Dinámicos del Dashboard</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gold/15 text-gold font-bold">
                          {totalFilteredCount} {totalFilteredCount === 1 ? "registro" : "registros"}
                        </span>
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Filtra por período, estado del canje en caja o mesa para actualizar las gráficas.
                      </p>
                    </div>
                  </div>

                  {(statsPeriodFilter !== "all" || statsStatusFilter !== "all" || statsTableFilter !== "all" || statsSearchQuery) && (
                    <button
                      type="button"
                      onClick={() => {
                        setStatsPeriodFilter("all");
                        setStatsStatusFilter("all");
                        setStatsTableFilter("all");
                        setStatsSearchQuery("");
                      }}
                      className="px-3 py-1 rounded-xl bg-muted/60 hover:bg-muted text-[11px] text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1 transition self-start sm:self-auto"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Limpiar Filtros</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {/* Filtro por Período */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                      Período
                    </label>
                    <select
                      value={statsPeriodFilter}
                      onChange={(e) => setStatsPeriodFilter(e.target.value as any)}
                      className="w-full rounded-xl border border-border p-2 text-xs bg-background text-foreground"
                    >
                      <option value="all">Todo el Historial</option>
                      <option value="today">Solo Hoy</option>
                      <option value="week">Últimos 7 Días</option>
                      <option value="month">Últimos 30 Días</option>
                    </select>
                  </div>

                  {/* Filtro por Estado de Canje */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                      Estado de Canje
                    </label>
                    <select
                      value={statsStatusFilter}
                      onChange={(e) => setStatsStatusFilter(e.target.value as any)}
                      className="w-full rounded-xl border border-border p-2 text-xs bg-background text-foreground"
                    >
                      <option value="all">Todos los Estados</option>
                      <option value="UTILIZADO">Canjeados en Caja (UTILIZADO)</option>
                      <option value="DISPONIBLE">Pendientes / Disponibles</option>
                    </select>
                  </div>

                  {/* Filtro por Mesa */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                      Mesa de Consumo
                    </label>
                    <select
                      value={statsTableFilter}
                      onChange={(e) => setStatsTableFilter(e.target.value)}
                      className="w-full rounded-xl border border-border p-2 text-xs bg-background text-foreground"
                    >
                      <option value="all">Todas las Mesas</option>
                      {uniqueTables.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Búsqueda por Texto */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                      Búsqueda Rápida
                    </label>
                    <input
                      type="text"
                      value={statsSearchQuery}
                      onChange={(e) => setStatsSearchQuery(e.target.value)}
                      placeholder="Código, cliente o tel..."
                      className="w-full rounded-xl border border-border p-2 text-xs bg-background text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* TARJETAS KPI DINÁMICAS BASADAS EN LOS FILTROS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-border bg-background p-4 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    Cupones Registrados
                  </span>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                    {totalFilteredCount}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {statsStatusFilter === "all" ? "Total en filtro" : `Filtrado por ${statsStatusFilter}`}
                  </span>
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 font-bold">
                    Canjeados en Caja
                  </span>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-emerald-600">
                    {filteredRedeemedCount}
                  </div>
                  <span className="text-[10px] text-emerald-700/80">
                    {filteredAvailableCount} disponibles aún
                  </span>
                </div>

                <div className="rounded-2xl border border-gold/40 bg-gold/5 p-4 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-gold font-bold">
                    Tasa de Conversión
                  </span>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-gold">
                    {filteredConversionRate}%
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Premio convertido a consumo
                  </span>
                </div>

                <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sky-500 font-bold">
                    Clientes Únicos
                  </span>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-sky-500">
                    {filteredUniqueClients}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {filteredReturningClients} clientes recurrentes (+2 visitas)
                  </span>
                </div>
              </div>

              {/* GRÁFICA 1: EMBUDO DE RETENCIÓN & CONVERSIÓN (FUNNEL) */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                      📈
                    </span>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">
                        Embudo de Retención & Conversión de Clientes (Funnel)
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Recorrido desde que el comensal escanea el QR en mesa hasta su fidelización recurrente.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300">
                    Embudo 4 Etapas
                  </span>
                </div>

                {(() => {
                  const funnelViews = Math.max(analytics.views.total, totalFilteredCount * 2 + 15);
                  const funnelPlays = Math.max(totalFilteredCount, 1);
                  const funnelRedeemed = filteredRedeemedCount;
                  const funnelReturning = filteredReturningClients;

                  const pctPlays = Math.min(100, Math.round((funnelPlays / funnelViews) * 100));
                  const pctRedeemed = Math.min(100, Math.round((funnelRedeemed / funnelPlays) * 100));
                  const pctReturning = Math.min(100, funnelReturning > 0 ? Math.round((funnelReturning / (filteredUniqueClients || 1)) * 100) : 0);

                  const stages = [
                    {
                      label: "1. Vistas de QR en Mesa / Enlace",
                      count: funnelViews,
                      pct: 100,
                      barWidth: 100,
                      color: "from-sky-500 to-blue-600",
                      textColor: "text-sky-400",
                      detail: "Tráfico total medido en mesas",
                    },
                    {
                      label: "2. Jugadas en Ruleta / Sellos",
                      count: funnelPlays,
                      pct: pctPlays,
                      barWidth: Math.max(20, pctPlays),
                      color: "from-purple-500 to-indigo-600",
                      textColor: "text-purple-400",
                      detail: `${pctPlays}% de visitantes jugaron`,
                    },
                    {
                      label: "3. Cupones Canjeados en Caja",
                      count: funnelRedeemed,
                      pct: pctRedeemed,
                      barWidth: Math.max(15, Math.round((funnelRedeemed / funnelViews) * 100)),
                      color: "from-emerald-500 to-teal-600",
                      textColor: "text-emerald-400",
                      detail: `${pctRedeemed}% de jugadas validadas en pago`,
                    },
                    {
                      label: "4. Clientes Fidelizados Recurrentes",
                      count: funnelReturning,
                      pct: pctReturning,
                      barWidth: Math.max(10, Math.round((funnelReturning / funnelViews) * 100)),
                      color: "from-amber-400 to-yellow-600",
                      textColor: "text-amber-400",
                      detail: `${pctReturning}% retornaron (+2 visitas)`,
                    },
                  ];

                  return (
                    <div className="space-y-3 pt-1">
                      {stages.map((stg, i) => (
                        <div key={i} className="space-y-1.5 p-3 rounded-xl bg-muted/20 border border-border/50">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground flex items-center gap-2">
                              <span>{stg.label}</span>
                              <span className={`text-[10px] font-mono font-bold ${stg.textColor}`}>
                                ({stg.count})
                              </span>
                            </span>
                            <span className="text-[11px] font-mono font-bold text-muted-foreground">
                              {stg.detail}
                            </span>
                          </div>
                          <div className="w-full bg-border/40 h-3 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${stg.color} transition-all duration-700`}
                              style={{ width: `${stg.barWidth}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* GRÁFICA 2: DISTRIBUCIÓN DE PREMIOS GANADOS & RENDIMIENTO */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Gráfica de Premios */}
                <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-lg bg-gold/20 text-gold flex items-center justify-center font-bold text-xs">
                        <PieChart className="h-3.5 w-3.5" />
                      </span>
                      <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                        Distribución de Premios Ganados
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {prizeDistributionList.length} tipos
                    </span>
                  </div>

                  {prizeDistributionList.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic text-center py-6">
                      No hay premios en la selección actual.
                    </p>
                  ) : (
                    <div className="space-y-2.5 pt-1">
                      {prizeDistributionList.map((p, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-foreground truncate max-w-[200px]">
                              {p.name}
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground">
                              <strong className="text-gold font-bold">{p.count}</strong> ({p.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gold transition-all duration-500"
                              style={{ width: `${Math.max(p.percentage, 8)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Gráfica de Afluencia Semanal */}
                <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        <Calendar className="h-3.5 w-3.5" />
                      </span>
                      <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                        Afluencia Semanal
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold">
                      Pico: {analytics.timing.bestDay}
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 pt-2">
                    {analytics.timing.dayDistribution.map((day) => {
                      const isBest = day.dayName === analytics.timing.bestDay && day.count > 0;
                      return (
                        <div
                          key={day.dayName}
                          className={`rounded-xl p-2 text-center transition-all ${
                            isBest
                              ? "bg-gold/15 border-2 border-gold shadow-xs"
                              : "bg-muted/30 border border-border/60"
                          }`}
                        >
                          <p className={`text-[9px] uppercase font-bold tracking-wider ${isBest ? "text-gold" : "text-muted-foreground"}`}>
                            {day.dayShort}
                          </p>
                          <p className={`text-sm font-display font-bold mt-0.5 ${isBest ? "text-gold" : "text-foreground"}`}>
                            {day.count}
                          </p>
                          <div className="w-full bg-border/50 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full ${isBest ? "bg-gold" : "bg-muted-foreground/60"}`}
                              style={{ width: `${Math.max(day.percentage, day.count > 0 ? 15 : 0)}%` }}
                            />
                          </div>
                          <span className="text-[8px] text-muted-foreground block mt-0.5">
                            {day.percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
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

              {/* Registro reciente de premios filtrado */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs uppercase tracking-[0.18em] font-semibold text-foreground">
                      {t("Historial Reciente de Premios", "Recent Prize History")}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                      {filteredHistory.length} de {history.length}
                    </span>
                  </div>
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
                      {filteredHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-muted-foreground italic">
                            No hay participaciones que coincidan con los filtros aplicados.
                          </td>
                        </tr>
                      ) : (
                        filteredHistory.map((h) => (
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

          
          {/* TAB: MONITOREO Y CONFIGURACIÓN DE 10 MESAS EN TIEMPO REAL */}
          {activeTab === "tables" && (
            <div className="space-y-6">
              {/* GUÍA RÁPIDA DE LAS 10 MESAS */}
              <SectionQuickGuide
                title="Guía Rápida: Monitoreo y Control de 10 Mesas Conectadas en Vivo"
                description="Cada mesa del establecimiento está conectada a su propia variable de estado en tiempo real para rastrear la experiencia del comensal."
                tips={[
                  {
                    title: "🟢 Mesa Disponible",
                    text: "La mesa está libre esperando a comensales. Al escanear su QR, se conecta automáticamente.",
                  },
                  {
                    title: "🔵 Comensal Jugando",
                    text: "El cliente en mesa ingresó sus datos y está jugando la ruleta de premios en este instante.",
                  },
                  {
                    title: "🟡 Premio Pendiente",
                    text: "¡El comensal sacó un premio! Muestra el código en caja para validar con el PIN del cajero.",
                  },
                  {
                    title: "🔄 Liberar Mesa en 1-Clic",
                    text: "Cuando el cliente pague su cuenta, pulsa 'Liberar Mesa' para prepararla para el siguiente comensal.",
                  },
                ]}
              />

              {tableFeedback && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{tableFeedback}</span>
                </div>
              )}

              {/* BARRA DE ESTADO GENERAL DE MESAS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-card border border-border text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Mesas</span>
                  <span className="text-2xl font-bold font-mono text-foreground">10</span>
                  <span className="text-[10px] text-muted-foreground block">Red de salón</span>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-sky-400 block">Jugando Ahora</span>
                  <span className="text-2xl font-bold font-mono text-sky-400">
                    {tablesList.filter((t) => t.status === "JUGANDO").length}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">Comensales activos</span>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Premios Pendientes</span>
                  <span className="text-2xl font-bold font-mono text-amber-400">
                    {tablesList.filter((t) => t.status === "PREMIO_PENDIENTE").length}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">Listos para caja</span>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">Disponibles</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    {tablesList.filter((t) => t.status === "DISPONIBLE").length}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">Mesas libres</span>
                </div>
              </div>

              {/* PANEL DE CONFIGURACIÓN RÁPIDA DE MESA */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-xl bg-gold/20 text-gold flex items-center justify-center font-bold text-sm">
                      ⚙️
                    </span>
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-foreground">
                        Personalizar Nombre, Zona y Capacidad de Mesa
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Edita las mesas para que coincidan con la distribución física de tu local.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                      Mesa
                    </label>
                    <select
                      value={selectedTableToEdit}
                      onChange={(e) => {
                        const num = parseInt(e.target.value, 10);
                        setSelectedTableToEdit(num);
                        const found = tablesList.find((t) => t.number === num);
                        if (found) {
                          setTableEditName(found.name);
                          setTableEditZone(found.zone);
                          setTableEditCapacity(found.capacity);
                        }
                      }}
                      className="w-full p-2 rounded-xl border border-border bg-background text-xs text-foreground"
                    >
                      {tablesList.map((t) => (
                        <option key={t.number} value={t.number}>
                          Mesa {t.number} - {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                      Nombre Comercial
                    </label>
                    <input
                      type="text"
                      value={tableEditName}
                      onChange={(e) => setTableEditName(e.target.value)}
                      placeholder="Ej: Mesa 1 - Ventana"
                      className="w-full p-2 rounded-xl border border-border bg-background text-xs text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                      Zona del Local
                    </label>
                    <select
                      value={tableEditZone}
                      onChange={(e) => setTableEditZone(e.target.value)}
                      className="w-full p-2 rounded-xl border border-border bg-background text-xs text-foreground"
                    >
                      <option value="Salón Principal">Salón Principal</option>
                      <option value="Terraza Jardín">Terraza Jardín</option>
                      <option value="Barra / Café">Barra / Café</option>
                      <option value="Zona VIP">Zona VIP</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                      Capacidad
                    </label>
                    <select
                      value={tableEditCapacity}
                      onChange={(e) => setTableEditCapacity(parseInt(e.target.value, 10))}
                      className="w-full p-2 rounded-xl border border-border bg-background text-xs text-foreground"
                    >
                      <option value="2">2 Personas</option>
                      <option value="4">4 Personas</option>
                      <option value="6">6 Personas</option>
                      <option value="8">8 Personas</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveTableConfigInModal}
                    className="w-full py-2.5 px-4 rounded-xl bg-gold hover:bg-gold/90 text-neutral-950 font-bold text-xs uppercase tracking-wider transition"
                  >
                    Guardar Mesa
                  </button>
                </div>
              </div>

              {/* CUADRÍCULA DE LAS 10 MESAS EN TIEMPO REAL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {tablesList.map((table) => {
                  const isPending = table.status === "PREMIO_PENDIENTE";
                  const isPlaying = table.status === "JUGANDO";
                  const isRedeemed = table.status === "CANJEADO";
                  const isAvailable = table.status === "DISPONIBLE";

                  return (
                    <div
                      key={table.number}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                        isPending
                          ? "border-amber-500/60 bg-amber-500/5 shadow-xs"
                          : isPlaying
                          ? "border-sky-500/60 bg-sky-500/5 shadow-xs"
                          : isRedeemed
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : "border-border/80 bg-card hover:border-gold/40"
                      }`}
                    >
                      <div>
                        {/* Cabecera de la Tarjeta */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                              <span>🪑</span>
                              <span>{table.name}</span>
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {table.zone} · {table.capacity} pers
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                              isPending
                                ? "bg-amber-500/20 text-amber-500 border-amber-500/40 animate-pulse"
                                : isPlaying
                                ? "bg-sky-500/20 text-sky-400 border-sky-500/40"
                                : isRedeemed
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {isPending
                              ? "🟡 PREMIO LISTO"
                              : isPlaying
                              ? "🔵 JUGANDO"
                              : isRedeemed
                              ? "✓ CANJEADO"
                              : "🟢 DISPONIBLE"}
                          </span>
                        </div>

                        {/* Datos del Comensal y Variable en Tiempo Real */}
                        <div className="mt-3 p-2.5 rounded-xl bg-background/80 border border-border/60 text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground">Comensal:</span>
                            <strong className="text-foreground">{table.currentCustomer || "Mesa Libre"}</strong>
                          </div>
                          {table.currentWhatsapp && (
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground">WhatsApp:</span>
                              <span className="text-emerald-500 font-mono font-medium">+{table.currentWhatsapp}</span>
                            </div>
                          )}
                          {table.prizeWon && (
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground">Premio:</span>
                              <span className="text-gold font-bold text-right truncate max-w-[150px]">{table.prizeWon}</span>
                            </div>
                          )}
                          {table.uniqueCode && (
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground">Código:</span>
                              <span className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded text-[10px]">
                                {table.uniqueCode}
                              </span>
                            </div>
                          )}
                          <div className="pt-1.5 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                            <span>Var: mesa.{table.number}</span>
                            <span className="text-sky-400">{table.activeSessionId || "ID: Libre"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Botones de Acción de Mesa */}
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={table.qrUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-1.5 px-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-center gap-1 transition"
                          title="Abrir juego de esta mesa"
                        >
                          <span>🔗 Abrir</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleResetTableInModal(table.number)}
                          className="py-1.5 px-2.5 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-semibold transition"
                          title="Liberar mesa para siguiente comensal"
                        >
                          <span>🔄 Liberar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
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
            <div className="space-y-5 text-xs">
              {/* Notificación de guardado */}
              {gameConfigSaveFeedback && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{gameConfigSaveFeedback}</span>
                </div>
              )}

              {/* SECCIÓN PRINCIPAL: SELECTOR DE MECÁNICA DE JUEGO */}
              <div className="rounded-2xl border border-amber-500/30 p-5 bg-amber-500/5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
                  <div>
                    <h4 className="font-bold text-foreground text-sm uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span>Mecánica de Juego Activa en Mesa</span>
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Elige qué experiencia interactiva vivirán tus clientes al escanear el QR desde sus mesas.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider self-start sm:self-auto">
                    Modo actual: {modalGameConfig.gameMode}
                  </span>
                </div>

                {/* Grid de 4 tarjetas de selección interactiva */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Tarjeta 1: Ruleta */}
                  <div
                    onClick={() => handleUpdateModalGameConfig({ gameMode: "roulette" })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none flex flex-col justify-between ${
                      modalGameConfig.gameMode === "roulette"
                        ? "border-amber-500 bg-amber-500/10 shadow-md ring-2 ring-amber-500/30"
                        : "border-border bg-card hover:border-amber-500/50 hover:bg-muted/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">🎡</span>
                        {modalGameConfig.gameMode === "roulette" ? (
                          <span className="h-5 w-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-xs font-bold">✓</span>
                        ) : (
                          <span className="h-4 w-4 rounded-full border border-muted-foreground" />
                        )}
                      </div>
                      <div className="font-bold text-foreground text-xs">Ruleta de la Fortuna</div>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        Azar y emoción instantánea. El comensal gira el disco dorado con física natural y gana premios según probabilidad.
                      </p>
                    </div>
                    <div className="mt-3 text-[10px] font-mono text-amber-600 font-semibold">
                      Ideal para: Rapidez y familias
                    </div>
                  </div>

                  {/* Tarjeta 2: Reto Precisión 10s */}
                  <div
                    onClick={() => handleUpdateModalGameConfig({ gameMode: "precision" })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none flex flex-col justify-between ${
                      modalGameConfig.gameMode === "precision"
                        ? "border-amber-500 bg-amber-500/10 shadow-md ring-2 ring-amber-500/30"
                        : "border-border bg-card hover:border-amber-500/50 hover:bg-muted/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">⏱️</span>
                        {modalGameConfig.gameMode === "precision" ? (
                          <span className="h-5 w-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-xs font-bold">✓</span>
                        ) : (
                          <span className="h-4 w-4 rounded-full border border-muted-foreground" />
                        )}
                      </div>
                      <div className="font-bold text-foreground text-xs">Reto de Precisión 10.000s</div>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        Destreza y habilidad en mesa. El cliente debe frenar el cronómetro en 10.000s exactos. Cero sensación de azar trucado.
                      </p>
                    </div>
                    <div className="mt-3 text-[10px] font-mono text-amber-600 font-semibold">
                      Ideal para: Parejas, grupos y eventos
                    </div>
                  </div>

                  {/* Tarjeta 3: Modo Híbrido (Recomendado) */}
                  <div
                    onClick={() => handleUpdateModalGameConfig({ gameMode: "hybrid" })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none flex flex-col justify-between ${
                      modalGameConfig.gameMode === "hybrid"
                        ? "border-amber-500 bg-amber-500/10 shadow-md ring-2 ring-amber-500/30"
                        : "border-border bg-card hover:border-amber-500/50 hover:bg-muted/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">🔄</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] bg-amber-500/20 text-amber-600 font-bold px-1.5 py-0.5 rounded font-mono">
                            RECOMENDADO
                          </span>
                          {modalGameConfig.gameMode === "hybrid" ? (
                            <span className="h-5 w-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-xs font-bold">✓</span>
                          ) : (
                            <span className="h-4 w-4 rounded-full border border-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="font-bold text-foreground text-xs">Modo Libre / Híbrido</div>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        El comensal decide en su pantalla si prefiere probar suerte en la Ruleta o retar su precisión en el Cronómetro.
                      </p>
                    </div>
                    <div className="mt-3 text-[10px] font-mono text-amber-600 font-semibold">
                      Máxima conversión y diversión
                    </div>
                  </div>

                  {/* Tarjeta 4: Pasaporte de Sellos */}
                  <div
                    onClick={() => handleUpdateModalGameConfig({ gameMode: "stamps" })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none flex flex-col justify-between ${
                      modalGameConfig.gameMode === "stamps"
                        ? "border-amber-500 bg-amber-500/10 shadow-md ring-2 ring-amber-500/30"
                        : "border-border bg-card hover:border-amber-500/50 hover:bg-muted/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">💳</span>
                        {modalGameConfig.gameMode === "stamps" ? (
                          <span className="h-5 w-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-xs font-bold">✓</span>
                        ) : (
                          <span className="h-4 w-4 rounded-full border border-muted-foreground" />
                        )}
                      </div>
                      <div className="font-bold text-foreground text-xs">Pasaporte de 15 Sellos</div>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        Fidelización acumulativa. El cliente acumula sellos por visita y reclama premios en los sellos 5, 10 y 15.
                      </p>
                    </div>
                    <div className="mt-3 text-[10px] font-mono text-amber-600 font-semibold">
                      Ideal para: Clientes recurrentes diarios
                    </div>
                  </div>
                </div>

                {/* Sub-configuración si el modo involucra el Cronómetro de Precisión */}
                {(modalGameConfig.gameMode === "precision" || modalGameConfig.gameMode === "hybrid") && (
                  <div className="mt-4 pt-4 border-t border-amber-500/20 space-y-4">
                    <div className="font-bold text-foreground text-xs flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      <span>Ajustes del Reto de Precisión 10 Segundos</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Selector de Dificultad y Tolerancia */}
                      <div>
                        <label className="block text-muted-foreground mb-1 text-[11px] font-medium">
                          Nivel de Tolerancia / Dificultad Humana:
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(["facil", "medio", "dificil"] as PrecisionDifficulty[]).map((dif) => (
                            <button
                              key={dif}
                              type="button"
                              onClick={() => handleUpdateModalGameConfig({ precisionDifficulty: dif })}
                              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                modalGameConfig.precisionDifficulty === dif
                                  ? "bg-amber-500 text-neutral-950 border-amber-500 shadow-sm"
                                  : "border-border bg-card text-muted-foreground hover:border-amber-500/40"
                              }`}
                            >
                              {dif === "facil" ? "🟢 Fácil" : dif === "medio" ? "🟡 Medio" : "🔴 Experto"}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1.5">
                          {DIFFICULTY_SETTINGS[modalGameConfig.precisionDifficulty || "medio"].desc} (Rango ganador: {DIFFICULTY_SETTINGS[modalGameConfig.precisionDifficulty || "medio"].rangeText})
                        </p>
                      </div>

                      {/* Selector de Intentos */}
                      <div>
                        <label className="block text-muted-foreground mb-1 text-[11px] font-medium">
                          Intentos Permitidos por Mesa:
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[1, 2, 3].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => handleUpdateModalGameConfig({ maxAttempts: num })}
                              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                (modalGameConfig.maxAttempts || 3) === num
                                  ? "bg-amber-500 text-neutral-950 border-amber-500 shadow-sm"
                                  : "border-border bg-card text-muted-foreground hover:border-amber-500/40"
                              }`}
                            >
                              {num} {num === 1 ? "Intento" : "Intentos"}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1.5">
                          Recomendado: 3 intentos para que el cliente pueda calibrar sus reflejos.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Canal de Validación de Evidencia */}
                <div className="mt-4 pt-4 border-t border-amber-500/20">
                  <label className="block text-muted-foreground mb-1 text-[11px] font-medium">
                    Canal de Validación de Visita (Evidencia de Foto):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "instagram", label: "📸 Solo Instagram", desc: "Historia etiquetando a la cuenta" },
                      { id: "whatsapp", label: "💬 Solo WhatsApp", desc: "Envío directo al chat del negocio" },
                      { id: "both", label: "🌟 Ambos (Libre)", desc: "El comensal elige su red preferida" },
                    ].map((chan) => (
                      <button
                        key={chan.id}
                        type="button"
                        onClick={() => handleUpdateModalGameConfig({ validationChannel: chan.id as any })}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          (modalGameConfig.validationChannel || "both") === chan.id
                            ? "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 font-bold"
                            : "border-border bg-card text-muted-foreground hover:border-amber-500/40"
                        }`}
                      >
                        <div className="text-xs">{chan.label}</div>
                        <div className="text-[9px] text-muted-foreground font-normal mt-0.5">{chan.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* INFORMACIÓN BASE DE CAMPAÑA */}
              <div className="rounded-xl border p-4 bg-background space-y-3">
                <h4 className="font-semibold text-foreground uppercase tracking-wider">
                  Configuración General de Campaña
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

          {/* TAB 5: Seguridad por Roles & PINs de Acceso (Limpio y orientado a negocio) */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {/* GUÍA RÁPIDA COLAPSABLE */}
              <SectionQuickGuide
                title="Guía Rápida: Control de Acceso, PINs y Permisos de Empleados"
                description="Configura las claves de acceso de tu equipo de trabajo y delimita qué funciones puede usar cada miembro del personal."
                tips={[
                  {
                    title: "👑 Dueño Master (PIN 8888)",
                    text: "Acceso total a finanzas, métricas, edición de premios y control de permisos.",
                  },
                  {
                    title: "👔 Administrador (PIN 5555)",
                    text: "Ideal para el gerente o encargado de turno. Tiene acceso a métricas y validación de premios autorizadas.",
                  },
                  {
                    title: "💼 Cajero / Turno (PIN 1978)",
                    text: "Clave operativa para que meseros o cajeros validen cupones y asignen sellos de consumo.",
                  },
                  {
                    title: "Rotación de PIN de Turno",
                    text: "Usa el botón 'Rotar PIN' para renovar la clave de atención de forma inmediata en cada jornada.",
                  },
                ]}
              />

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
                    Motor de Marca & Identidad Visual
                  </span>
                  <h3 className="font-display text-base sm:text-lg font-bold">
                    Personaliza tu Restaurante o Negocio al 100%
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed max-w-xl">
                    Edita el nombre comercial, eslogan, logotipo, paleta cromática y canales de contacto. Al hacer clic en <strong>"Guardar Cambios de Marca"</strong>, los cambios se aplican de inmediato en toda la aplicación y quedan guardados.
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
                      <span>Guardar Cambios de Marca</span>
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
                          placeholder="Ej: Bistro Gastronómico & Café"
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

                  <div className="md:col-span-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-foreground">
                        Mensaje / Cuerpo de la Oferta
                      </label>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {broadcastOffer.body.length} caracteres
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={broadcastOffer.body}
                      onChange={(e) => setBroadcastOffer({ ...broadcastOffer, body: e.target.value })}
                      placeholder="Escribe el mensaje persuasivo que verán los clientes en la pantalla de su teléfono o PC..."
                      className="w-full rounded-xl border border-border p-2.5 text-xs bg-background text-foreground resize-none"
                    />

                    {/* Botones para Insertar Variables Dinámicas */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1 mr-1">
                        <Tag className="h-3 w-3" />
                        <span>Insertar Variable:</span>
                      </span>
                      {[
                        { label: "{nombre}", desc: "Nombre del comensal" },
                        { label: "{premio}", desc: "Premio o beneficio" },
                        { label: "{restaurante}", desc: "Nombre del negocio" },
                        { label: "{descuento}", desc: "Porcentaje o valor" },
                        { label: "{codigo}", desc: "Código único de cupón" },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => handleInsertTag(item.label)}
                          title={`Insertar ${item.desc}`}
                          className="px-2 py-0.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-400/30 text-[10px] font-mono font-bold transition flex items-center gap-1"
                        >
                          <span>+</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
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
                      className="w-full rounded-xl border border-border p-2 text-xs bg-background text-foreground font-mono"
                    />
                  </div>

                  {/* PERSONALIZACIÓN DE ENVÍO: PROGRAMACIÓN Y CANALES */}
                  <div className="md:col-span-3 pt-2 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Programación */}
                    <div className="p-3 rounded-xl bg-muted/20 border border-border space-y-2">
                      <label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5 text-gold" />
                        <span>Programación del Envío</span>
                      </label>
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setScheduleType("immediate")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            scheduleType === "immediate"
                              ? "bg-gold text-neutral-950 font-bold"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          ⚡ Envío Inmediato
                        </button>
                        <button
                          type="button"
                          onClick={() => setScheduleType("scheduled")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            scheduleType === "scheduled"
                              ? "bg-gold text-neutral-950 font-bold"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          📅 Programar Fecha/Hora
                        </button>
                      </div>

                      {scheduleType === "scheduled" && (
                        <div className="pt-1.5">
                          <label className="text-[10px] font-mono text-muted-foreground block mb-1">
                            Fecha y Hora de Difusión:
                          </label>
                          <input
                            type="datetime-local"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="w-full p-2 rounded-lg border border-border text-xs bg-background text-foreground font-mono"
                          />
                        </div>
                      )}
                    </div>

                    {/* Canales de Difusión */}
                    <div className="p-3 rounded-xl bg-muted/20 border border-border space-y-2">
                      <label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                        <Radio className="h-3.5 w-3.5 text-sky-400" />
                        <span>Canales de Entrega</span>
                      </label>
                      <div className="space-y-1.5 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pushChannels.push}
                            onChange={(e) => setPushChannels({ ...pushChannels, push: e.target.checked })}
                            className="rounded border-border text-sky-500"
                          />
                          <span className="text-[11px]">OneSignal Web Push (Pantalla & PC)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pushChannels.webhook}
                            onChange={(e) => setPushChannels({ ...pushChannels, webhook: e.target.checked })}
                            className="rounded border-border text-sky-500"
                          />
                          <span className="text-[11px]">Webhook / Composio / Make / n8n</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pushChannels.whatsappPreview}
                            onChange={(e) => setPushChannels({ ...pushChannels, whatsappPreview: e.target.checked })}
                            className="rounded border-border text-sky-500"
                          />
                          <span className="text-[11px]">Copia para envío por WhatsApp</span>
                        </label>
                      </div>
                    </div>
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

                {/* SECCIÓN GUARDAR COMO PLANTILLA Y ENVIAR */}
                <div className="pt-3 border-t border-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  {/* Guardar plantilla personalizada */}
                  <div className="flex items-center gap-2 flex-1 max-w-md">
                    <input
                      type="text"
                      value={offerTemplateName}
                      onChange={(e) => setOfferTemplateName(e.target.value)}
                      placeholder="Nombre de plantilla (ej: Happy Hour Lunes)..."
                      className="flex-1 p-2 rounded-xl border border-border text-xs bg-background text-foreground"
                    />
                    <button
                      type="button"
                      onClick={handleSaveAsOfferTemplate}
                      className="px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs flex items-center gap-1.5 shrink-0 transition"
                      title="Guardar como plantilla reutilizable"
                    >
                      <Bookmark className="h-3.5 w-3.5 text-gold" />
                      <span>Guardar</span>
                    </button>
                  </div>

                  {/* Botón de Envío Instantáneo / Programado */}
                  <button
                    type="button"
                    disabled={broadcastStatus.loading || !broadcastOffer.title.trim()}
                    onClick={async () => {
                      setBroadcastStatus({ loading: true });
                      const result = await OneSignalService.sendBroadcastPush({
                        ...broadcastOffer,
                        scheduleType,
                        scheduledTime: scheduleType === "scheduled" ? scheduledTime : undefined,
                        channels: pushChannels,
                      });
                      setBroadcastStatus({ loading: false, msg: result.message, success: result.success });
                      setTimeout(() => setBroadcastStatus({ loading: false }), 4500);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    <span>
                      {broadcastStatus.loading
                        ? "Procesando Envío..."
                        : scheduleType === "scheduled"
                        ? "📅 Programar Oferta Push"
                        : "🚀 Enviar Notificación Masiva Ahora"}
                    </span>
                  </button>
                </div>
              </div>

              {/* CARD: PLANTILLAS Y OFERTAS PERSONALIZADAS GUARDADAS */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-sm">
                      <Bookmark className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">
                        Plantillas & Ofertas Personalizadas Guardadas
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Carga y reutiliza tus ofertas guardadas con 1 solo clic sin tener que redactar de nuevo.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gold/15 text-gold font-bold">
                    {savedOffersList.length} guardadas
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {savedOffersList.map((offer) => (
                    <div
                      key={offer.id}
                      className="p-3.5 rounded-2xl border border-border bg-muted/15 space-y-2 hover:border-gold/40 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-xs text-foreground">
                            {offer.name}
                          </h4>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                            {offer.scheduleType === "scheduled" ? "📅 Programada" : "⚡ Inmediata"}
                          </span>
                        </div>
                        <p className="text-[11px] text-gold font-medium mt-0.5 line-clamp-1">
                          {offer.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1 leading-normal">
                          {offer.body}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
                          {offer.channels?.push && <span className="bg-sky-500/10 text-sky-400 px-1 rounded">Push</span>}
                          {offer.channels?.webhook && <span className="bg-purple-500/10 text-purple-400 px-1 rounded">Webhook</span>}
                          {offer.channels?.whatsappPreview && <span className="bg-emerald-500/10 text-emerald-400 px-1 rounded">WhatsApp</span>}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleLoadSavedOffer(offer)}
                            className="px-2.5 py-1 rounded-lg bg-gold/15 hover:bg-gold/25 text-gold text-[10px] font-bold transition flex items-center gap-1"
                            title="Cargar en el formulario para editar o enviar"
                          >
                            <span>📝 Cargar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSavedOffer(offer.id)}
                            className="h-6 w-6 rounded-lg hover:bg-red-500/15 text-muted-foreground hover:text-red-400 flex items-center justify-center transition"
                            title="Eliminar plantilla"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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
                onClick={() => setActiveTab("tables")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTab === "tables"
                    ? "bg-gold text-neutral-950 shadow-md font-bold"
                    : "text-neutral-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className={`h-4 w-4 ${activeTab === "tables" ? "text-neutral-950" : "text-amber-400"}`} />
                  <div>
                    <div className="leading-tight">10 Mesas en Vivo</div>
                    <div className={`text-[10px] font-normal ${activeTab === "tables" ? "text-neutral-900" : "text-neutral-400"}`}>
                      Monitoreo & variables en tiempo real
                    </div>
                  </div>
                </div>
                {!canAccessTab("tables") && <Lock className="h-3 w-3 text-amber-500" />}
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
                onClick={() => setActiveTab("security")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTab === "security"
                    ? "bg-gold text-neutral-950 shadow-md font-bold"
                    : "text-neutral-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className={`h-4 w-4 ${activeTab === "security" ? "text-neutral-950" : "text-amber-400"}`} />
                  <div>
                    <div className="leading-tight">{t("Permisos & PINs", "Permissions & PINs")}</div>
                    <div className={`text-[10px] font-normal ${activeTab === "security" ? "text-neutral-900" : "text-neutral-400"}`}>
                      Claves y roles de personal
                    </div>
                  </div>
                </div>
                {!canAccessTab("security") && <Lock className="h-3 w-3 text-amber-500" />}
              </button>
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-white/10 text-[10px] text-neutral-400 space-y-1">
            <div className="flex items-center justify-between text-neutral-300 font-mono">
              <span>Modo Activo:</span>
              <span className="text-gold font-bold">15 Sellos</span>
            </div>
            <p className="text-[9px] text-neutral-400">
              Navegación vertical a la izquierda optimizada para personalizar el sistema con fluidez.
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
