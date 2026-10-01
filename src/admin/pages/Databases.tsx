import { useEffect, useState } from "react";
import {
  Loader2,
  Database,
  Save,
  Cloud,
  CheckCircle,
  RefreshCw,
  Zap,
  HardDrive,
  Calendar,
  Clock,
  Download,
  FolderGit2,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  FileJson,
  Layers,
} from "lucide-react";

interface BackupItem {
  id: string;
  fileName: string;
  timestamp: string;
  formattedDate: string;
  sizeKb: string;
  target: string;
  status: "success" | "pending" | "failed";
  type: string;
}

export function Databases() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testingComposio, setTestingComposio] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pestaña activa dentro de Bases de Datos
  const [activeTab, setActiveTab] = useState<"connectors" | "composio_db" | "google_drive">("connectors");

  // 1. Supabase y Google Sheets
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState("");
  const [autoSync, setAutoSync] = useState(true);

  // 2. Conexión de Base de Datos vía Composio
  const [composioDbEnabled, setComposioDbEnabled] = useState(true);
  const [composioProvider, setComposioProvider] = useState<"googleSheets" | "airtable" | "supabase" | "notion">("googleSheets");
  const [composioDatabaseId, setComposioDatabaseId] = useState("1A2b3C4d5E_sheet_restaurante_vip");
  const [composioStatus, setComposioStatus] = useState<"connected" | "disconnected">("connected");
  const [composioLatency, setComposioLatency] = useState<number | null>(34);

  // 3. Programación de Backup a Google Drive
  const [driveBackupEnabled, setDriveBackupEnabled] = useState(true);
  const [backupSchedule, setBackupSchedule] = useState<"disabled" | "hourly" | "daily" | "weekly">("daily");
  const [backupTime, setBackupTime] = useState("23:59");
  const [driveFolderName, setDriveFolderName] = useState("Restaurante_Backups_DB");
  const [driveWebhookUrl, setDriveWebhookUrl] = useState("");
  const [backupHistory, setBackupHistory] = useState<BackupItem[]>([]);

  const fetchData = async () => {
    try {
      // 1. Cargar configuración general
      const res = await fetch("/api/config");
      if (!res.ok) throw new Error("Error al cargar configuración de bases de datos");
      const data = await res.json();

      if (data.settings?.databases) {
        const dbConf = data.settings.databases;
        setSupabaseUrl(dbConf.supabaseUrl || "");
        setSupabaseAnonKey(dbConf.supabaseAnonKey || "");
        setGoogleSheetsUrl(dbConf.googleSheetsUrl || dbConf.googleSheetWebhookUrl || "");
        setAutoSync(dbConf.autoSync ?? true);

        // Composio DB
        if (dbConf.composioDatabase) {
          setComposioDbEnabled(dbConf.composioDatabase.enabled ?? true);
          setComposioProvider(dbConf.composioDatabase.provider || "googleSheets");
          setComposioDatabaseId(dbConf.composioDatabase.databaseId || "1A2b3C4d5E_sheet_restaurante_vip");
        }

        // Google Drive Backup
        if (dbConf.googleDriveBackup) {
          setDriveBackupEnabled(dbConf.googleDriveBackup.enabled ?? true);
          setBackupSchedule(dbConf.googleDriveBackup.schedule || "daily");
          setBackupTime(dbConf.googleDriveBackup.timeOfDay || "23:59");
          setDriveFolderName(dbConf.googleDriveBackup.folderName || "Restaurante_Backups_DB");
          setDriveWebhookUrl(dbConf.googleDriveBackup.webhookUrl || "");
        }
      }

      // 2. Cargar historial de backups
      try {
        const histRes = await fetch("/api/backup/history");
        if (histRes.ok) {
          const histData = await histRes.json();
          if (histData.history) setBackupHistory(histData.history);
        }
      } catch {}

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Guardar configuración completa de bases de datos
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        databases: {
          supabaseUrl,
          supabaseAnonKey,
          googleSheetsUrl,
          googleSheetWebhookUrl: googleSheetsUrl,
          autoSync,
          composioDatabase: {
            enabled: composioDbEnabled,
            provider: composioProvider,
            databaseId: composioDatabaseId,
            status: composioStatus,
          },
          googleDriveBackup: {
            enabled: driveBackupEnabled,
            schedule: backupSchedule,
            timeOfDay: backupTime,
            folderName: driveFolderName,
            webhookUrl: driveWebhookUrl,
          },
        },
      };

      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al guardar configuración de bases de datos");
      setSuccess("¡Configuración de bases de datos y backups guardada con éxito!");
      setTimeout(() => setSuccess(null), 3500);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  // Test de conexión con base de datos vía Composio
  const handleTestComposioDb = async () => {
    setTestingComposio(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/integrations/composio/test-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: composioProvider,
          databaseId: composioDatabaseId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setComposioStatus("connected");
        setComposioLatency(data.latencyMs || 32);
        setSuccess(`✓ Conexión Composio exitosa con ${data.provider} (${data.latencyMs}ms de latencia).`);
        setTimeout(() => setSuccess(null), 4000);
      } else {
        throw new Error(data.error || "No se pudo conectar a Composio");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fallo en la prueba de conexión Composio");
    } finally {
      setTestingComposio(false);
    }
  };

  // Ejecutar Backup manual inmediato a Google Drive
  const handleTriggerGoogleDriveBackup = async () => {
    setBackingUp(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/backup/google-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderName: driveFolderName,
          type: "manual",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBackupHistory(data.history || [data.backup, ...backupHistory]);
        setSuccess(`✓ Copia de seguridad sincronizada exitosamente en Google Drive: ${data.backup.fileName} (${data.backup.sizeKb}).`);
        setTimeout(() => setSuccess(null), 4500);
      } else {
        throw new Error(data.error || "Error al crear respaldo");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al ejecutar backup a Google Drive");
    } finally {
      setBackingUp(false);
    }
  };

  // Descargar backup en archivo .json local
  const handleDownloadLocalBackup = async () => {
    try {
      const res = await fetch("/api/metrics");
      const configRes = await fetch("/api/config");
      const metricsData = await res.json();
      const configData = await configRes.json();

      const backupObject = {
        meta: {
          app: "Gestor Gastronómico & Fidelización",
          version: "2.5.0",
          backupDate: new Date().toISOString(),
        },
        settings: configData.settings,
        metrics: metricsData,
      };

      const blob = new Blob([JSON.stringify(backupObject, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_db_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess("✓ Archivo de respaldo descargado exitosamente a tu dispositivo.");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("No se pudo generar la descarga del respaldo local.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#f2be71] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue'] flex items-center gap-2">
            <Database className="w-6 h-6 text-[#f2be71]" />
            <span>Bases de Datos, Composio & Backups</span>
          </h2>
          <p className="text-sm text-[#ccc3d8]">
            Conecta tu almacenamiento en la nube mediante Composio y programa copias de seguridad automáticas a Google Drive.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-5 py-2.5 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 text-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Guardar Configuración</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0 text-[#10b981]" />
          <span>{success}</span>
        </div>
      )}

      {/* Tarjetas Resumen de Estado */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tarjeta 1: Almacenamiento Local */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-[#ccc3d8]">Base de Datos Local</span>
            <div className="text-lg font-bold text-[#10b981] mt-1.5 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> db.json (Activa)
            </div>
            <p className="text-[11px] text-[#958da1] mt-1">Respaldo rápido en disco local sin dependencia externa.</p>
          </div>
          <button
            type="button"
            onClick={handleDownloadLocalBackup}
            className="mt-3 bg-[#201f23] border border-[#363439] hover:bg-[#2b292e] text-[#ccc3d8] text-xs font-bold rounded-xl py-2 px-3 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar JSON</span>
          </button>
        </div>

        {/* Tarjeta 2: Base de Datos vía Composio */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-[#ccc3d8]">Composio Database</span>
              <span className="text-[10px] bg-[#684400]/40 text-[#f2be71] font-bold px-2 py-0.5 rounded-full border border-[#f2be71]/30">
                {composioProvider.toUpperCase()}
              </span>
            </div>
            <div className="text-lg font-bold text-[#f2be71] mt-1.5 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#f2be71]" />
              {composioStatus === "connected" ? "Sincronizada" : "Sin Conectar"}
            </div>
            <p className="text-[11px] text-[#958da1] mt-1">
              {composioLatency ? `Latencia: ${composioLatency}ms • Eventos en tiempo real` : "Conexión a tablas vía Composio.dev"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleTestComposioDb}
            disabled={testingComposio}
            className="mt-3 bg-[#201f23] border border-[#f2be71]/40 text-[#f2be71] hover:bg-[#2b292e] text-xs font-bold rounded-xl py-2 px-3 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingComposio ? "animate-spin" : ""}`} />
            <span>{testingComposio ? "Probando..." : "Test de Conexión"}</span>
          </button>
        </div>

        {/* Tarjeta 3: Copias en Google Drive */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-[#ccc3d8]">Google Drive Backup</span>
              <span className="text-[10px] bg-[#1b2f4a]/50 text-[#60a5fa] font-bold px-2 py-0.5 rounded-full border border-[#60a5fa]/30">
                {backupSchedule.toUpperCase()}
              </span>
            </div>
            <div className="text-lg font-bold text-[#60a5fa] mt-1.5 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-[#60a5fa]" />
              {driveBackupEnabled ? "Programado" : "Pausado"}
            </div>
            <p className="text-[11px] text-[#958da1] mt-1">
              Carpeta: <span className="text-[#e6e1e7]">{driveFolderName}</span> ({backupTime})
            </p>
          </div>
          <button
            type="button"
            onClick={handleTriggerGoogleDriveBackup}
            disabled={backingUp}
            className="mt-3 bg-[#132238] border border-[#60a5fa]/40 text-[#60a5fa] hover:bg-[#1b2f4a] text-xs font-bold rounded-xl py-2 px-3 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            {backingUp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <HardDrive className="w-3.5 h-3.5" />}
            <span>{backingUp ? "Respaldando..." : "Backup a Drive Ahora"}</span>
          </button>
        </div>
      </div>

      {/* Selector de Pestañas de Gestión */}
      <div className="flex border-b border-[#363439] gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("google_drive")}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors border-b-2 ${
            activeTab === "google_drive"
              ? "border-[#60a5fa] text-[#60a5fa]"
              : "border-transparent text-[#958da1] hover:text-[#ccc3d8]"
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Programar Backup a Google Drive</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("composio_db")}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors border-b-2 ${
            activeTab === "composio_db"
              ? "border-[#f2be71] text-[#f2be71]"
              : "border-transparent text-[#958da1] hover:text-[#ccc3d8]"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Conectar Base de Datos vía Composio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("connectors")}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors border-b-2 ${
            activeTab === "connectors"
              ? "border-[#d1bcff] text-[#d1bcff]"
              : "border-transparent text-[#958da1] hover:text-[#ccc3d8]"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Conectores Directos (Supabase / Sheets)</span>
        </button>
      </div>

      {/* PESTAÑA 1: PROGRAMAR BACKUP A GOOGLE DRIVE */}
      {activeTab === "google_drive" && (
        <div className="space-y-6">
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#363439] gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-[#60a5fa]" />
                  <span>Automatización y Programación de Respaldo a Google Drive</span>
                </h3>
                <p className="text-xs text-[#ccc3d8]">
                  Exporta automáticamente una copia instantánea e íntegra de toda la base de datos a tu cuenta de Google Drive.
                </p>
              </div>

              {/* Switch de activación */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={driveBackupEnabled}
                  onChange={(e) => setDriveBackupEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#60a5fa]"
                />
                <span className="text-xs font-bold text-[#e6e1e7]">Copia Programada Activa</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Frecuencia del Backup */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                  Frecuencia de Programación
                </label>
                <select
                  value={backupSchedule}
                  onChange={(e) => setBackupSchedule(e.target.value as any)}
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm focus:border-[#60a5fa] focus:outline-none"
                >
                  <option value="daily">Diario (Recomendado al Cierre)</option>
                  <option value="hourly">Cada 1 Hora (Operación Continua)</option>
                  <option value="weekly">Semanal (Cada Domingo)</option>
                  <option value="disabled">Desactivado (Solo Manual)</option>
                </select>
                <span className="text-[11px] text-[#958da1]">El sistema realizará el respaldo sin interrumpir el servicio.</span>
              </div>

              {/* Hora de Ejecución */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                  Hora de Ejecución (Para frecuencia Diaria)
                </label>
                <input
                  type="time"
                  value={backupTime}
                  onChange={(e) => setBackupTime(e.target.value)}
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm focus:border-[#60a5fa] focus:outline-none"
                />
                <span className="text-[11px] text-[#958da1]">Hora recomendada: 23:59 o al finalizar el turno de sala.</span>
              </div>

              {/* Carpeta en Google Drive */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                  Nombre de Carpeta en Google Drive
                </label>
                <input
                  type="text"
                  value={driveFolderName}
                  onChange={(e) => setDriveFolderName(e.target.value)}
                  placeholder="Restaurante_Backups_DB"
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm focus:border-[#60a5fa] focus:outline-none"
                />
                <span className="text-[11px] text-[#958da1]">Los archivos se clasificarán automáticamente por año y mes.</span>
              </div>

              {/* Webhook Google Apps Script o API Drive */}
              <div className="md:col-span-3 space-y-2">
                <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                  Webhook URL de Google Drive / Google Apps Script (Opcional)
                </label>
                <input
                  type="url"
                  value={driveWebhookUrl}
                  onChange={(e) => setDriveWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec o Composio Drive Endpoint"
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm focus:border-[#60a5fa] focus:outline-none"
                />
                <span className="text-[11px] text-[#958da1]">
                  Si utilizas Google Apps Script o el conector de Composio Drive, el archivo se transmitirá directamente a tu Google Workspace o cuenta personal.
                </span>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="pt-4 border-t border-[#363439] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTriggerGoogleDriveBackup}
                  disabled={backingUp}
                  className="bg-[#1b2f4a] hover:bg-[#254269] text-[#60a5fa] border border-[#60a5fa]/40 font-bold text-xs rounded-xl px-4 py-2.5 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {backingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
                  <span>{backingUp ? "Generando Copia..." : "Hacer Copia a Google Drive Ahora"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadLocalBackup}
                  className="bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] border border-[#363439] font-bold text-xs rounded-xl px-4 py-2.5 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Copia JSON Local</span>
                </button>
              </div>

              <span className="text-xs text-[#958da1]">
                Formato de archivo: <strong className="text-[#e6e1e7]">.json compatible con restauración en caliente</strong>
              </span>
            </div>
          </div>

          {/* Historial de Backups Realizados */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#363439]">
              <h4 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#60a5fa]" />
                <span>Historial de Copias de Seguridad Realizadas</span>
              </h4>
              <span className="text-xs text-[#958da1]">{backupHistory.length} respaldos registrados</span>
            </div>

            {backupHistory.length === 0 ? (
              <p className="text-xs text-[#958da1] text-center py-6">
                No hay respaldos registrados todavía. Haz clic en "Hacer Copia a Google Drive Ahora" para generar el primero.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#363439] text-[#958da1] uppercase">
                      <th className="py-2.5 px-3">Archivo de Respaldo</th>
                      <th className="py-2.5 px-3">Fecha y Hora</th>
                      <th className="py-2.5 px-3">Tamaño</th>
                      <th className="py-2.5 px-3">Destino</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#363439]/50">
                    {backupHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-[#201f23]/60 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-[#e6e1e7] flex items-center gap-2">
                          <FileJson className="w-4 h-4 text-[#60a5fa]" />
                          <span>{item.fileName}</span>
                        </td>
                        <td className="py-3 px-3 text-[#ccc3d8]">{item.formattedDate}</td>
                        <td className="py-3 px-3 text-[#ccc3d8]">{item.sizeKb}</td>
                        <td className="py-3 px-3 text-[#958da1]">{item.target}</td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#10b981] bg-[#0d2e1f] px-2 py-0.5 rounded-full border border-[#10b981]/30">
                            <Check className="w-3 h-3" /> Respaldo OK
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={handleDownloadLocalBackup}
                            className="text-[#60a5fa] hover:text-[#93c5fd] font-bold text-xs underline cursor-pointer"
                          >
                            Descargar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA 2: CONECTAR BASE DE DATOS VÍA COMPOSIO */}
      {activeTab === "composio_db" && (
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#363439] gap-3">
            <div>
              <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#f2be71]" />
                <span>Conexión de Base de Datos vía Composio</span>
              </h3>
              <p className="text-xs text-[#ccc3d8]">
                Utiliza Composio para sincronizar la base de datos de comensales, premios y consumos con cualquier motor cloud.
              </p>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={composioDbEnabled}
                onChange={(e) => setComposioDbEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#f2be71]"
              />
              <span className="text-xs font-bold text-[#e6e1e7]">Conector Composio Activo</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selector de Motor de Base de Datos */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                Motor / Proveedor de Base de Datos
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: "googleSheets", name: "Google Sheets", desc: "Hojas de cálculo en vivo" },
                  { id: "airtable", name: "Airtable DB", desc: "Tablas relacionales visuales" },
                  { id: "supabase", name: "Supabase / Postgres", desc: "Base SQL de alta escala" },
                  { id: "notion", name: "Notion Database", desc: "Tablas y CRM en Notion" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setComposioProvider(item.id as any)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      composioProvider === item.id
                        ? "bg-[#252429] border-[#f2be71] text-[#f2be71]"
                        : "bg-[#201f23] border-[#363439] text-[#ccc3d8] hover:border-[#4a4455]"
                    }`}
                  >
                    <span className="text-xs font-bold block">{item.name}</span>
                    <span className="text-[10px] text-[#958da1]">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Identificador de Base de Datos */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                  ID de Hoja, Base o Tabla en Composio
                </label>
                <input
                  type="text"
                  value={composioDatabaseId}
                  onChange={(e) => setComposioDatabaseId(e.target.value)}
                  placeholder="ej: 1A2b3C4d5E_sheet_restaurante o appXXXXXXXXXXXXXX"
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm focus:border-[#f2be71] focus:outline-none"
                />
                <span className="text-[11px] text-[#958da1]">
                  Pega el identificador de la hoja de cálculo o el Base ID de Airtable conectado en tu cuenta de Composio.
                </span>
              </div>

              <div className="bg-[#141317] border border-[#363439] rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${composioStatus === "connected" ? "bg-[#10b981] animate-pulse" : "bg-gray-500"}`} />
                  <span className="text-xs font-bold text-[#e6e1e7]">
                    {composioStatus === "connected" ? "Composio Bridge Listo" : "Sin enlazar"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleTestComposioDb}
                  disabled={testingComposio}
                  className="bg-[#2b292e] hover:bg-[#363439] text-[#f2be71] text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingComposio ? "animate-spin" : ""}`} />
                  <span>Probar Conexión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: CONECTORES DIRECTOS (SUPABASE / GOOGLE SHEETS) */}
      {activeTab === "connectors" && (
        <form onSubmit={handleSave} className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#363439] pb-4">
            <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <Cloud className="w-5 h-5 text-[#d1bcff]" />
              <span>Conexión Directa a Supabase & Google Sheets</span>
            </h3>
            <span className="text-xs text-[#958da1]">Sincronización en paralelo</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyz.supabase.co"
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                Supabase Anon Key
              </label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOi..."
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                Webhook URL de Google Sheets
              </label>
              <input
                type="url"
                value={googleSheetsUrl}
                onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/..."
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm"
              />
              <span className="text-[11px] text-[#958da1]">
                Registra automáticamente cada nuevo comensal, canje y puntuación en una hoja de cálculo en tiempo real.
              </span>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
