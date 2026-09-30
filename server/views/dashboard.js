import { db, DEFAULT_TABLES, PORT } from "../state.js";

export function renderBackendDashboard() {
  const s = db.settings;
  const gc = s.gameConfig || DEFAULT_SETTINGS.gameConfig;
  const sc = s.secondChance || DEFAULT_SETTINGS.secondChance;
  const totalPrizes = db.prizes.length;
  const redeemed = db.prizes.filter((p) => p.status === "UTILIZADO").length;
  const totalCustomers = Object.keys(db.customers).length;
  const conversionRate = totalPrizes > 0 ? Math.round((redeemed / totalPrizes) * 100) : 0;
  const returningCount = Object.values(db.customers).filter((c) => (c.visits || 0) > 1 || (c.history && c.history.length > 1)).length;
  const uniqueTables = Array.from(new Set(db.prizes.map((p) => p.tableNumber).filter(Boolean)));

  const prizeCounts = {};
  db.prizes.forEach((p) => {
    const name = p.prizeName || "Premio";
    prizeCounts[name] = (prizeCounts[name] || 0) + 1;
  });
  const prizeDistribution = Object.entries(prizeCounts).map(([name, count]) => ({
    name,
    count,
    percentage: totalPrizes > 0 ? Math.round((count / totalPrizes) * 100) : 0,
  }));

  const funnelViews = Math.max(totalPrizes * 3, 30);
  const funnelPlays = totalPrizes;
  const funnelRedeemed = redeemed;
  const funnelReturning = returningCount;
  const missions = s.missions || DEFAULT_SETTINGS.missions;
  const submissions = db.missionSubmissions || [];
  const monthlyContest = db.monthlyContest || [];
  const contestWinners = monthlyContest.filter((c) => c.winner);
  const activeContestWinner = contestWinners.length > 0 ? contestWinners[0] : null;
  const repConfig = s.reputation || DEFAULT_SETTINGS.reputation;
  const repFeedbacks = db.reputationFeedbacks || [];
  const kioskCustomers = Object.values(db.customers || {}).filter(c => c.origin === 'PORTAL_CAUTIVO_WIFI' || (c.notes && c.notes.includes('Kiosko')));
  const kioskCount = kioskCustomers.length;
  const repTotal = repFeedbacks.length;
  const repGoogleCount = repFeedbacks.filter((f) => f.actionTaken === "google" || f.rating >= (repConfig.minRatingForGoogle || 4)).length;
  const repWhatsappCount = repFeedbacks.filter((f) => f.actionTaken === "whatsapp" || f.rating < (repConfig.minRatingForGoogle || 4)).length;
  const repSum = repFeedbacks.reduce((acc, cur) => acc + (cur.rating || 5), 0);
  const repAvg = repTotal > 0 ? (repSum / repTotal).toFixed(1) : "5.0";
  const repProtectionRate = repTotal > 0 ? Math.round((repGoogleCount / repTotal) * 100) : 100;
  const hermes = s.hermes || DEFAULT_SETTINGS.hermes;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${s.brand.name} · Backend & Panel de Control de Operaciones</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    :root {
      --bg: #F1F5F9;
      --card-bg: #FFFFFF;
      --card-border: #E2E8F0;
      --sidebar-bg: #FFFFFF;
      --accent: ${s.brand.primaryColor || '#a27e2c'};
      --accent-light: rgba(162, 126, 44, 0.10);
      --accent-hover: #8c6b22;
      --accent-glow: rgba(162, 126, 44, 0.20);
      --success: #059669;
      --success-bg: #ECFDF5;
      --success-glow: rgba(5, 150, 105, 0.12);
      --warning: #D97706;
      --warning-bg: #FFFBEB;
      --danger: #DC2626;
      --danger-bg: #FEF2F2;
      --info: #2563EB;
      --info-bg: #EFF6FF;
      --text: #0F172A;
      --text-secondary: #334155;
      --text-muted: #64748B;
      --text-light: #94A3B8;
      --bronze: #92400E;
      --bronze-bg: #FEF3C7;
      --bronze-border: #FCD34D;
      --silver: #475569;
      --silver-bg: #F1F5F9;
      --silver-border: #CBD5E1;
      --gold: #92400E;
      --gold-bg: #FFFBEB;
      --gold-border: #F59E0B;
      --font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-family);
      line-height: 1.5;
      padding: 20px 16px;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    .container { max-width: 1320px; margin: 0 auto; }

    /* ENCABEZADO */
    header {
      background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
      border: 1px solid var(--card-border);
      border-radius: 18px;
      padding: 22px 28px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04);
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--success-bg);
      border: 1px solid rgba(5, 150, 105, 0.3);
      color: var(--success);
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }
    .pulse-dot {
      width: 8px; height: 8px;
      background-color: var(--success);
      border-radius: 50%;
      animation: pulse 1.8s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.6); }
      70% { box-shadow: 0 0 0 8px rgba(5, 150, 105, 0); }
      100% { box-shadow: 0 0 0 0 rgba(5, 150, 105, 0); }
    }
    h1 { font-size: 24px; font-weight: 800; color: var(--text); margin-bottom: 2px; }
    .header-desc { font-size: 13px; color: var(--text-muted); }
    .btn-frontend {
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
      color: #FFFFFF;
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 10px 18px;
      border-radius: 12px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 14px var(--accent-glow);
      transition: all 0.2s;
    }
    .btn-frontend:hover { transform: translateY(-1px); filter: brightness(1.08); }

    /* LAYOUT PRINCIPAL DE 2 COLUMNAS (BARRA VERTICAL A LA IZQUIERDA / CONTENIDO A LA DERECHA) */
    .dashboard-layout {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    @media (min-width: 1024px) {
      .dashboard-layout {
        flex-direction: row;
        align-items: flex-start;
      }
      .nav-sidebar {
        width: 268px;
        flex-shrink: 0;
        position: sticky;
        top: 20px;
      }
      .main-content {
        flex: 1;
        min-width: 0;
      }
    }
    .sidebar-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    }
    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.06em;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 10px;
    }
    .badge-role {
      background: var(--accent-light);
      color: var(--accent);
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 9999px;
      border: 1px solid rgba(162, 126, 44, 0.3);
      font-family: monospace;
      font-weight: 700;
    }
    .nav-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .nav-group-title {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-light);
      letter-spacing: 0.08em;
      margin-bottom: 4px;
      padding-left: 6px;
      text-transform: uppercase;
    }
    .nav-tab-btn {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid transparent;
      padding: 8px 10px;
      border-radius: 10px;
      font-size: 12.5px;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 10px;
      text-align: left;
      width: 100%;
    }
    .nav-tab-btn:hover {
      color: var(--text);
      background: #F8FAFC;
      border-color: var(--card-border);
    }
    .nav-tab-btn.active {
      background: var(--accent-light);
      color: var(--accent);
      border-color: rgba(162, 126, 44, 0.35);
      font-weight: 600;
    }
    .tab-title { font-weight: 600; font-size: 12.5px; line-height: 1.2; }
    .tab-sub { font-size: 10px; font-weight: 400; color: var(--text-light); margin-top: 1px; }
    .nav-tab-btn.active .tab-sub { color: var(--accent); }

    /* GUÍAS RÁPIDAS EXPLICATIVAS PARA SECCIONES CON CIERTA COMPLEJIDAD */
    .quick-guide-box {
      background: var(--warning-bg);
      border: 1px solid rgba(217, 119, 6, 0.25);
      border-radius: 14px;
      padding: 14px 16px;
      margin-bottom: 20px;
    }
    .quick-guide-header {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      font-weight: 700;
      color: var(--warning);
      margin-bottom: 6px;
    }
    .quick-guide-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }
    .quick-guide-item {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 10px;
      font-size: 11px;
    }
    .quick-guide-item strong {
      color: var(--text);
      display: block;
      margin-bottom: 3px;
    }
    .quick-guide-item span {
      color: var(--text-muted);
      line-height: 1.4;
      display: block;
    }

    .tab-content { display: none; }
    .tab-content.active { display: block; animation: fadeIn 0.2s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

    /* TARJETAS DE MÉTRICAS */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 18px 20px;
      position: relative;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .stat-title { font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); letter-spacing: 0.04em; }
    .stat-value { font-size: 28px; font-weight: 800; color: var(--text); margin: 4px 0; display: block; }
    .stat-sub { font-size: 11px; color: var(--text-light); }

    /* TARJETAS SELECTORAS DE MODO DE JUEGO */
    .game-mode-card {
      background: #F8FAFC;
      border: 2px solid var(--card-border);
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .game-mode-card:hover {
      border-color: rgba(162, 126, 44, 0.5);
      background: rgba(162, 126, 44, 0.06);
    }
    .game-mode-card.active {
      border-color: var(--accent);
      background: var(--accent-light);
      box-shadow: 0 4px 12px var(--accent-glow);
    }
    .game-mode-card .mode-check {
      font-size: 10px;
      font-family: monospace;
      color: var(--accent);
      font-weight: 800;
    }

    /* PANELES DIVIDIDOS */
    .panels-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }
    @media (min-width: 992px) {
      .panels-grid { grid-template-columns: 7fr 5fr; }
    }
    .panel {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .panel-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 12px;
    }
    .panel-title { font-size: 15px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 8px; }

    /* TABLA */
    .table-container { overflow-x: auto; max-height: 480px; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; }
    th {
      background: #F8FAFC;
      color: var(--text-muted);
      font-weight: 700;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.05em;
      padding: 10px 12px;
      border-bottom: 1px solid var(--card-border);
      position: sticky; top: 0;
    }
    td { padding: 12px; border-bottom: 1px solid #F1F5F9; color: var(--text-secondary); }
    tbody tr:hover { background: #FAFBFC; }
    .badge-code {
      font-family: monospace; font-size: 11px; font-weight: 700;
      background: var(--info-bg); padding: 3px 6px; border-radius: 6px; color: var(--info);
    }
    .badge-status-available {
      background: var(--warning-bg); border: 1px solid rgba(217, 119, 6, 0.3);
      color: var(--warning); padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700;
    }
    .badge-status-used {
      background: var(--success-bg); border: 1px solid rgba(5, 150, 105, 0.3);
      color: var(--success); padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700;
    }
    .stars-cell { color: var(--accent); font-size: 13px; }

    /* LOGS */
    .log-box {
      background: #F8FAFC; border: 1px solid var(--card-border); border-radius: 12px;
      height: 400px; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px;
    }
    .log-item { background: #FFFFFF; border: 1px solid var(--card-border); border-radius: 8px; padding: 8px 10px; }
    .log-top { display: flex; align-items: center; justify-content: space-between; }
    .method-tag { font-weight: 800; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
    .method-post { background: var(--success-bg); color: var(--success); }
    .method-get { background: var(--info-bg); color: var(--info); }
    .log-url { color: var(--text); font-weight: 700; }
    .log-time { color: var(--text-light); font-size: 10px; }
    .log-detail { color: var(--text-muted); word-break: break-all; margin-top: 2px; }

    /* FORMULARIOS Y CONTROLES DEL BACKEND */
    .form-group { margin-bottom: 14px; }
    .form-label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; letter-spacing: 0.04em; }
    .form-input {
      width: 100%; background: #FFFFFF; border: 1px solid var(--card-border); color: var(--text);
      padding: 9px 14px; border-radius: 10px; font-size: 12px; outline: none; transition: border-color 0.2s;
    }
    .form-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
    .form-help { font-size: 10px; color: var(--text-light); margin-top: 4px; display: block; }
    .btn-save {
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
      color: #fff; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;
      padding: 10px 22px; border-radius: 10px; border: none; cursor: pointer; transition: all 0.2s;
      box-shadow: 0 4px 12px var(--accent-glow);
    }
    .btn-save:hover { filter: brightness(1.08); transform: translateY(-1px); }
    .btn-secondary {
      background: #FFFFFF; color: var(--text-secondary); border: 1px solid var(--card-border);
      font-weight: 600; font-size: 12px; padding: 8px 16px; border-radius: 10px; cursor: pointer; transition: all 0.15s;
    }
    .btn-secondary:hover { background: #F8FAFC; border-color: #CBD5E1; }
    .toast-success { color: var(--success); font-size: 11px; font-weight: 700; display: none; }

    /* PRESETS DE ICONOS Y EMOJIS */
    .icon-preset-btn {
      background: #F8FAFC; border: 1px solid var(--card-border); color: var(--text);
      padding: 6px 10px; border-radius: 8px; font-size: 12px; cursor: pointer; transition: all 0.15s;
      display: inline-flex; align-items: center; gap: 4px;
    }
    .icon-preset-btn:hover { border-color: var(--accent); background: var(--accent-light); }
    .icon-preset-btn.active { border-color: var(--accent); background: var(--accent-light); font-weight: 700; color: var(--accent); }

    /* BARRA DE PROGRESO DE NIVELES DE FIDELIZACIÓN */
    .loyalty-progress-bar {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 22px 24px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .loyalty-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
      flex-wrap: wrap;
      gap: 10px;
    }
    .loyalty-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .loyalty-subtitle { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
    .progress-track {
      position: relative;
      height: 10px;
      background: #E2E8F0;
      border-radius: 9999px;
      margin: 8px 0 28px;
    }
    .progress-fill {
      height: 100%;
      border-radius: 9999px;
      background: linear-gradient(90deg, #D97706 0%, #F59E0B 50%, #FCD34D 100%);
      transition: width 0.6s ease;
    }
    .progress-milestones {
      display: flex;
      justify-content: space-between;
      margin-top: -22px;
    }
    .progress-milestone { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .milestone-dot {
      width: 16px; height: 16px;
      border-radius: 50%;
      border: 2px solid #FFFFFF;
      box-shadow: 0 0 0 2px #E2E8F0;
      background: #E2E8F0;
      z-index: 1;
    }
    .milestone-dot.reached { background: #F59E0B; box-shadow: 0 0 0 2px #FCD34D; }
    .milestone-label { font-size: 10px; font-weight: 700; color: var(--text-muted); text-align: center; white-space: nowrap; }
    .milestone-label.reached { color: var(--accent); }
    .tier-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 14px;
      margin-top: 20px;
    }
    .tier-card { border-radius: 14px; padding: 16px; border: 2px solid; position: relative; overflow: hidden; }
    .tier-card.bronze { background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); border-color: #FCD34D; }
    .tier-card.silver { background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%); border-color: #CBD5E1; }
    .tier-card.gold { background: linear-gradient(135deg, #FFFBEB 0%, #FEF9C3 100%); border-color: #F59E0B; box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2); }
    .tier-icon { font-size: 28px; margin-bottom: 8px; display: block; }
    .tier-name { font-size: 13px; font-weight: 800; margin-bottom: 2px; }
    .tier-name.bronze { color: #92400E; }
    .tier-name.silver { color: #475569; }
    .tier-name.gold { color: #78350F; }
    .tier-range { font-size: 10px; color: var(--text-muted); margin-bottom: 8px; }
    .tier-discount { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
    .tier-discount.bronze { color: #92400E; }
    .tier-discount.silver { color: #475569; }
    .tier-discount.gold { color: #78350F; }
    .tier-benefit { font-size: 10px; color: var(--text-muted); line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- ENCABEZADO -->
    <header>
      <div>
        <div class="status-badge">
          <span class="pulse-dot"></span>
          SERVIDOR BACKEND REST · PUERTO ${PORT} EN VIVO
        </div>
        <h1>${s.brand.name} · Panel de Control de Operaciones</h1>
        <p class="header-desc">
          Configuración centralizada del juego, identidad de marca, canales, probabilidades de ruleta y tarjeta de sellos.
        </p>
      </div>

      <div style="display: flex; gap: 10px; align-items: center;">
        <a href="http://localhost:5173/?modo=kiosko" target="_blank" class="btn-frontend" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; border: none; font-weight: 700; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);">
          📶 Abrir Portal Cautivo WiFi / Kiosko ↗
        </a>
        <a href="http://localhost:5173" target="_blank" class="btn-frontend">
          📱 Abrir Pantalla del Comensal (Frontend) ➔
        </a>
      </div>
    </header>

    <!-- LAYOUT PRINCIPAL DE 2 COLUMNAS (BARRA VERTICAL A LA IZQUIERDA / CONTENIDO A LA DERECHA) -->
    <div class="dashboard-layout">
      <!-- BARRA LATERAL VERTICAL A LA IZQUIERDA -->
      <aside class="nav-sidebar">
        <div class="sidebar-card">
          <div class="sidebar-header">
            <span>📂 CATEGORÍAS</span>
            <span class="badge-role">ADMIN</span>
          </div>

          <!-- GRUPO 1: OPERACIONES -->
          <div class="nav-group">
            <span class="nav-group-title">📊 OPERACIONES</span>
            <button type="button" class="nav-tab-btn active" data-tab="tab-ops" onclick="switchTab('tab-ops', this)">
              <span>📊</span>
              <div>
                <div class="tab-title">Operaciones & Métricas</div>
                <div class="tab-sub">KPIs, canjes y comensales</div>
              </div>
            </button>
            <button type="button" class="nav-tab-btn" data-tab="tab-tables" onclick="switchTab('tab-tables', this)">
              <span>🪑</span>
              <div>
                <div class="tab-title">10 Mesas en Vivo</div>
                <div class="tab-sub">Monitoreo & configuración</div>
              </div>
            </button>
            <button type="button" class="nav-tab-btn" data-tab="tab-kiosk" onclick="switchTab('tab-kiosk', this)">
              <span>🖥️</span>
              <div>
                <div class="tab-title">Portal Cautivo WiFi & Kiosko</div>
                <div class="tab-sub">Conexión de red & tablet</div>
              </div>
            </button>
            <button type="button" class="nav-tab-btn" data-tab="tab-channels" onclick="switchTab('tab-channels', this)">
              <span>📱</span>
              <div>
                <div class="tab-title">Canales & WhatsApp</div>
                <div class="tab-sub">Notificación al comensal</div>
              </div>
            </button>
          </div>

          <!-- GRUPO 2: FIDELIZACIÓN & JUEGOS -->
          <div class="nav-group">
            <span class="nav-group-title">🎯 EXPERIENCIA & JUEGOS</span>
            <button type="button" class="nav-tab-btn" data-tab="tab-game-mode" onclick="switchTab('tab-game-mode', this)">
              <span>🎮</span>
              <div>
                <div class="tab-title">Selección de Juego</div>
                <div class="tab-sub">Ruleta vs Reto 10s</div>
              </div>
            </button>
            <button type="button" class="nav-tab-btn" data-tab="tab-roulette" onclick="switchTab('tab-roulette', this)">
              <span>🎡</span>
              <div>
                <div class="tab-title">Premios de Ruleta</div>
                <div class="tab-sub">Probabilidades (100%)</div>
              </div>
            </button>
            <button type="button" class="nav-tab-btn" data-tab="tab-stamps" onclick="switchTab('tab-stamps', this)">
              <span>🎟️</span>
              <div>
                <div class="tab-title">Tarjeta de 15 Sellos</div>
                <div class="tab-sub">Premios cada 5 e iconos</div>
              </div>
            </button>
            <button type="button" class="nav-tab-btn" data-tab="tab-missions" onclick="switchTab('tab-missions', this)">
              <span>🎯</span>
              <div>
                <div class="tab-title">Misiones & Embajadores</div>
                <div class="tab-sub">Revisión de tareas (TikTok, etc.)</div>
              </div>
            </button>
            <button type="button" class="nav-tab-btn" data-tab="tab-reputation" onclick="switchTab('tab-reputation', this)">
              <span>⭐</span>
              <div>
                <div class="tab-title">Embudo de Reputación</div>
                <div class="tab-sub">Google My Business vs WhatsApp</div>
              </div>
            </button>
          </div>

          <!-- GRUPO 3: MARKETING PUSH -->
          <div class="nav-group">
            <span class="nav-group-title" style="color: #38bdf8;">🚀 MARKETING PUSH</span>
            <button type="button" class="nav-tab-btn" data-tab="tab-push" onclick="switchTab('tab-push', this)">
              <span>🚀</span>
              <div>
                <div class="tab-title">Ofertas Push & Flujos</div>
                <div class="tab-sub">OneSignal y 4 flujos auto</div>
              </div>
            </button>
          </div>

          <!-- GRUPO 4: CONFIGURACIÓN -->
          <div class="nav-group">
            <span class="nav-group-title">⚙️ CONFIGURACIÓN</span>
            <button type="button" class="nav-tab-btn" data-tab="tab-brand" onclick="switchTab('tab-brand', this)">
              <span>🏷️</span>
              <div>
                <div class="tab-title">Identidad & Marca</div>
                <div class="tab-sub">Colores, logo y eslogan</div>
              </div>
            </button>
            <button type="button" class="nav-tab-btn" data-tab="tab-composio" onclick="switchTab('tab-composio', this)">
              <span>⚡</span>
              <div>
                <div class="tab-title">Composio & IA</div>
                <div class="tab-sub">Conexión 200+ apps</div>
              </div>
            </button>
            <button type="button" class="nav-tab-btn" data-tab="tab-hermes" onclick="switchTab('tab-hermes', this)">
              <span>🤖</span>
              <div>
                <div class="tab-title">Conexión con Hermes</div>
                <div class="tab-sub">Agente IA, CRM & POS</div>
              </div>
            </button>
            <button type="button" class="nav-tab-btn" data-tab="tab-databases" onclick="switchTab('tab-databases', this)">
              <span>🗄️</span>
              <div>
                <div class="tab-title">Bases de Datos</div>
                <div class="tab-sub">Google Sheets y Supabase</div>
              </div>
            </button>
            <button type="button" class="nav-tab-btn" data-tab="tab-security" onclick="switchTab('tab-security', this)">
              <span>🔐</span>
              <div>
                <div class="tab-title">Seguridad & PINs</div>
                <div class="tab-sub">Roles RBAC (8888, 5555, 1978)</div>
              </div>
            </button>
          </div>
        </div>
      </aside>

      <!-- CONTENIDO PRINCIPAL (A LA DERECHA) -->
      <main class="main-content">

    <!-- ========================================================================= -->
    <!-- PESTAÑA 1: OPERACIONES & MÉTRICAS                                         -->
    <!-- ========================================================================= -->
    <div id="tab-ops" class="tab-content active">
      <!-- BARRA DE FILTROS INTERACTIVOS DEL BACKEND -->
      <div class="panel" style="margin-bottom: 20px;">
        <div class="panel-header" style="padding-bottom: 10px; margin-bottom: 12px; border-bottom: 1px solid var(--card-border);">
          <div class="panel-title">
            <span>🔍 Filtros de Visualización del Dashboard</span>
            <span id="filterCountBadge" style="font-size: 11px; background: rgba(217, 119, 6, 0.2); color: #fbbf24; border: 1px solid rgba(217, 119, 6, 0.4); padding: 2px 8px; border-radius: 9999px; font-weight: 700;">${totalPrizes} registros</span>
          </div>
          <button type="button" class="btn-secondary" style="font-size: 11px; padding: 4px 10px;" onclick="resetOpsFilters()">🔄 Limpiar Filtros</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Período</label>
            <select id="filterPeriod" class="form-input" onchange="applyOpsFilters()">
              <option value="all">Todo el Historial</option>
              <option value="today">Solo Hoy</option>
              <option value="week">Últimos 7 Días</option>
              <option value="month">Últimos 30 Días</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Estado de Canje</label>
            <select id="filterStatus" class="form-input" onchange="applyOpsFilters()">
              <option value="all">Todos los Estados</option>
              <option value="UTILIZADO">Canjeados en Caja (UTILIZADO)</option>
              <option value="DISPONIBLE">Pendientes (DISPONIBLE)</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Mesa</label>
            <select id="filterTable" class="form-input" onchange="applyOpsFilters()">
              <option value="all">Todas las Mesas</option>
              ${uniqueTables.map(t => `<option value="${t}">${t}</option>`).join("")}
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Búsqueda Rápida</label>
            <input type="text" id="filterSearch" class="form-input" placeholder="Código, cliente, tel..." onkeyup="applyOpsFilters()">
          </div>
        </div>
      </div>

      <!-- TARJETAS DE MÉTRICAS OPERATIVAS -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-title">Cupones Generados</span>
          <span class="stat-value" id="stat-total">${totalPrizes}</span>
          <span class="stat-sub">Registrados en db.json</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Canjeados en Caja</span>
          <span class="stat-value" id="stat-redeemed" style="color: var(--success);">${redeemed}</span>
          <span class="stat-sub">Verificados con PIN del cajero</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Efectividad de Mesa</span>
          <span class="stat-value" id="stat-rate" style="color: var(--accent);">${conversionRate}%</span>
          <span class="stat-sub">Premios convertidos a consumo</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Clientes Únicos</span>
          <span class="stat-value" id="stat-customers" style="color: var(--info);">${totalCustomers}</span>
          <span class="stat-sub">Con acumulación de sellos</span>
        </div>
      </div>

      <!-- BARRA DE PROGRESO DE NIVELES DE FIDELIZACIÓN -->
      <div class="loyalty-progress-bar">
        <div class="loyalty-header">
          <div>
            <div class="loyalty-title">🏅 Sistema de Niveles de Fidelización</div>
            <div class="loyalty-subtitle">Los clientes avanzan automáticamente según sus visitas acumuladas</div>
          </div>
          <span style="background: var(--accent-light); color: var(--accent); border: 1px solid rgba(162,126,44,0.3); font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; font-family: monospace;">PROGRAMA ACTIVO</span>
        </div>

        <!-- Barra principal -->
        <div class="progress-track">
          <div class="progress-fill" style="width: ${Math.min(100, Math.max(5, totalCustomers > 0 ? Math.round((returningCount / totalCustomers) * 100) : 5))}%;"></div>
        </div>
        <div class="progress-milestones">
          <div class="progress-milestone">
            <div class="milestone-dot reached"></div>
            <div class="milestone-label reached">☕ Café Inicial<br>1–5 visitas<br><strong>10% desc.</strong></div>
          </div>
          <div class="progress-milestone">
            <div class="milestone-dot ${returningCount >= 3 ? 'reached' : ''}"></div>
            <div class="milestone-label ${returningCount >= 3 ? 'reached' : ''}">🥐 Gourmet Regular<br>6–10 visitas<br><strong>15% desc.</strong></div>
          </div>
          <div class="progress-milestone">
            <div class="milestone-dot ${returningCount >= 8 ? 'reached' : ''}"></div>
            <div class="milestone-label ${returningCount >= 8 ? 'reached' : ''}">👑 Embajador VIP<br>11–15 visitas<br><strong>25% desc.</strong></div>
          </div>
        </div>

        <!-- Tarjetas de nivel -->
        <div class="tier-cards-grid">
          <div class="tier-card bronze">
            <span class="tier-icon">☕</span>
            <div class="tier-name bronze">Café Inicial</div>
            <div class="tier-range">Visitas 1 a 5 · Nivel Bronce</div>
            <div class="tier-discount bronze">10%</div>
            <div class="tier-benefit">Descuento en cualquier bebida artesanal o postre de la vitrina en cada visita.</div>
          </div>
          <div class="tier-card silver">
            <span class="tier-icon">🥐</span>
            <div class="tier-name silver">Gourmet Regular</div>
            <div class="tier-range">Visitas 6 a 10 · Nivel Plata</div>
            <div class="tier-discount silver">15%</div>
            <div class="tier-benefit">Descuento especial en menú completo más acceso prioritario a ediciones especiales.</div>
          </div>
          <div class="tier-card gold">
            <span class="tier-icon">👑</span>
            <div class="tier-name gold">Embajador VIP</div>
            <div class="tier-range">Visitas 11 a 15 · Nivel Oro</div>
            <div class="tier-discount gold">25%</div>
            <div class="tier-benefit">Máximo descuento + experiencias gastronómicas exclusivas de autor para 2 personas.</div>
          </div>
        </div>
      </div>

      <!-- GRÁFICAS VISUALES: EMBUDO & DISTRIBUCIÓN DE PREMIOS -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 24px;">
        <!-- Embudo -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <span>📈 Embudo de Retención y Conversión (Funnel)</span>
            </div>
            <span class="badge-role" style="background: rgba(168, 85, 247, 0.2); color: #c084fc;">4 ETAPAS</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
            <div style="background: rgba(255,255,255,0.03); padding: 10px 12px; border-radius: 10px; border: 1px solid var(--card-border);">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                <span style="color: var(--text); font-weight: 600;">1. Vistas de QR en Mesa / Enlace</span>
                <span style="color: var(--info); font-weight: 700;">${funnelViews} (100%)</span>
              </div>
              <div style="width: 100%; height: 8px; background: #E2E8F0; border-radius: 9999px; overflow: hidden;">
                <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #0284c7, #38bdf8);"></div>
              </div>
            </div>
            <div style="background: #F8FAFC; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--card-border);">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                <span style="color: var(--text); font-weight: 600;">2. Jugadas en Ruleta / Sellos</span>
                <span style="color: #7C3AED; font-weight: 700;">${funnelPlays} (${Math.round((funnelPlays / funnelViews) * 100)}%)</span>
              </div>
              <div style="width: 100%; height: 8px; background: #E2E8F0; border-radius: 9999px; overflow: hidden;">
                <div style="width: ${Math.max(15, Math.round((funnelPlays / funnelViews) * 100))}%; height: 100%; background: linear-gradient(90deg, #7c3aed, #a855f7);"></div>
              </div>
            </div>
            <div style="background: #F8FAFC; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--card-border);">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                <span style="color: var(--text); font-weight: 600;">3. Canjes en Caja (Consumo Real)</span>
                <span style="color: var(--success); font-weight: 700;">${funnelRedeemed} (${conversionRate}%)</span>
              </div>
              <div style="width: 100%; height: 8px; background: #E2E8F0; border-radius: 9999px; overflow: hidden;">
                <div style="width: ${Math.max(10, conversionRate)}%; height: 100%; background: linear-gradient(90deg, #059669, #34d399);"></div>
              </div>
            </div>
            <div style="background: #F8FAFC; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--card-border);">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                <span style="color: var(--text); font-weight: 600;">4. Clientes Recurrentes (+2 visitas)</span>
                <span style="color: var(--accent); font-weight: 700;">${funnelReturning} (${totalCustomers > 0 ? Math.round((funnelReturning / totalCustomers) * 100) : 0}%)</span>
              </div>
              <div style="width: 100%; height: 8px; background: #E2E8F0; border-radius: 9999px; overflow: hidden;">
                <div style="width: ${Math.max(8, totalCustomers > 0 ? Math.round((funnelReturning / totalCustomers) * 100) : 0)}%; height: 100%; background: linear-gradient(90deg, #d97706, #fbbf24);"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Distribución de Premios -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <span>🎁 Distribución de Premios Ganados</span>
            </div>
            <span class="badge-role">${prizeDistribution.length} TIPOS</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
            ${prizeDistribution.length === 0
              ? '<div style="color: var(--text-muted); font-size: 12px; text-align: center; padding: 20px;">No hay premios registrados aún.</div>'
              : prizeDistribution.map(p => `
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                    <span style="color: var(--text-secondary); font-weight: 500;">${p.name}</span>
                    <span style="color: var(--accent); font-weight: 700;">${p.count} (${p.percentage}%)</span>
                  </div>
                  <div style="width: 100%; height: 6px; background: #E2E8F0; border-radius: 9999px; overflow: hidden;">
                    <div style="width: ${Math.max(p.percentage, 8)}%; height: 100%; background: var(--accent); border-radius: 9999px;"></div>
                  </div>
                </div>
              `).join("")
            }
          </div>
        </div>
      </div>

      <!-- GRÁFICA VISUAL: HORÓMETRO DE ACTIVIDAD & DETECCIÓN DE HORAS MUERTAS -->
      <div class="panel" style="margin-bottom: 24px;">
        <div class="panel-header" style="border-bottom: 1px solid var(--card-border); padding-bottom: 12px; margin-bottom: 16px;">
          <div>
            <div class="panel-title" style="display: flex; align-items: center; gap: 8px;">
              <span>📈 Horómetro de Actividad & Detección de Horas Muertas (Gráfica en Vivo)</span>
              <span class="badge-role" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4);">TIEMPO REAL</span>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
              Afluencia horaria de comensales escaneando el juego en mesa. Identifica horas muertas para activar campañas push.
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-muted);">
              <span style="width: 10px; height: 10px; border-radius: 2px; background: linear-gradient(to top, #10b981, #fbbf24);"></span>
              <span>Hora Pico</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-muted);">
              <span style="width: 10px; height: 10px; border-radius: 2px; background: linear-gradient(to top, #ef4444, #f59e0b);"></span>
              <span>Hora Muerta (Oportunidad)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-muted);">
              <span style="width: 10px; height: 10px; border-radius: 2px; background: linear-gradient(to top, #3b82f6, #38bdf8);"></span>
              <span>Flujo Regular</span>
            </div>
          </div>
        </div>

        <!-- CONTENEDOR DE LA GRÁFICA DE BARRAS HORARIAS -->
        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 20px 14px 10px 14px; position: relative;">
          <!-- Líneas de referencia del eje Y -->
          <div style="position: absolute; left: 0; right: 0; top: 25%; border-top: 1px dashed rgba(255,255,255,0.07); pointer-events: none;"></div>
          <div style="position: absolute; left: 0; right: 0; top: 50%; border-top: 1px dashed rgba(255,255,255,0.07); pointer-events: none;"></div>
          <div style="position: absolute; left: 0; right: 0; top: 75%; border-top: 1px dashed rgba(255,255,255,0.07); pointer-events: none;"></div>

          <div style="display: grid; grid-template-columns: repeat(15, 1fr); gap: 8px; align-items: flex-end; height: 170px; padding-bottom: 8px; border-bottom: 2px solid rgba(255,255,255,0.12); position: relative; z-index: 1;">
            ${[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(h => {
              const isPeak = (h >= 12 && h <= 14) || (h >= 19 && h <= 21);
              const isDead = h >= 15 && h <= 17;
              const ampm = h >= 12 ? "PM" : "AM";
              const h12 = h % 12 === 0 ? 12 : h % 12;

              // Conteo de registros reales para esa hora
              const realCount = db.prizes.filter(p => {
                if (!p.wonAt) return false;
                const m = p.wonAt.match(/^(\d{1,2}):/);
                return m && parseInt(m[1], 10) === h;
              }).length;

              // Altura proporcional calculada para la gráfica (simulada + real)
              const baseHeight = isPeak ? 82 : isDead ? 22 : 48;
              const barHeightPct = Math.min(100, Math.max(16, baseHeight + (realCount * 12)));
              
              const barBg = isDead
                ? "linear-gradient(180deg, #f59e0b 0%, #ef4444 100%)"
                : isPeak
                ? "linear-gradient(180deg, #fbbf24 0%, #10b981 100%)"
                : "linear-gradient(180deg, #38bdf8 0%, #3b82f6 100%)";
              
              const barBorder = isDead ? "#f59e0b" : isPeak ? "#10b981" : "#3b82f6";
              const badgeText = isDead ? "LENTA" : isPeak ? "PICO" : "";

              return `
                <div style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; position: relative;">
                  ${badgeText ? `<span style="position: absolute; top: ${100 - barHeightPct - 18}%; font-size: 8px; font-weight: 800; padding: 1px 4px; border-radius: 4px; background: ${isDead ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}; color: ${isDead ? "#fca5a5" : "#6ee7b7"}; border: 1px solid ${isDead ? "rgba(239, 68, 68, 0.5)" : "rgba(16, 185, 129, 0.5)"}; font-family: monospace; white-space: nowrap;">${badgeText}</span>` : ""}
                  
                  <div title="${h12}:00 ${ampm} - ${realCount} comensales (${barHeightPct}% capacidad)" style="width: 100%; max-width: 38px; height: ${barHeightPct}%; background: ${barBg}; border: 1px solid ${barBorder}; border-radius: 6px 6px 2px 2px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: all 0.3s ease; cursor: pointer; display: flex; align-items: flex-start; justify-content: center; padding-top: 4px;">
                    <span style="font-size: 10px; font-weight: 800; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">${realCount}</span>
                  </div>
                  
                  <div style="margin-top: 6px; text-align: center;">
                    <span style="font-size: 10px; font-weight: 700; color: ${isDead ? "#fbbf24" : isPeak ? "#34d399" : "#9ca3af"}; display: block; font-family: monospace;">${h12}</span>
                    <span style="font-size: 8px; color: #6b7280; text-transform: uppercase;">${ampm}</span>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- DIAGNÓSTICO Y RECOMENDACIÓN INTELIGENTE DE HORAS MUERTAS -->
        <div style="margin-top: 14px; padding: 14px 16px; border-radius: 12px; background: #FFFBEB; border: 1px solid #FCD34D; display: flex; flex-direction: column; sm:flex-direction: row; justify-content: space-between; align-items: center; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 24px;">⚡</span>
            <div>
              <strong style="color: #92400E; font-size: 13px; display: block;">Franja de Horas Muertas Detectada: 3:00 PM a 6:00 PM</strong>
              <p style="font-size: 11px; color: var(--text-secondary); margin: 2px 0 0 0;">
                El flujo de comensales baja a menos del 25%. Es el momento óptimo para activar la campaña automática de <strong>Happy Hour 2x1</strong> o regalar <strong>Doble Sello</strong>.
              </p>
            </div>
          </div>
          <button type="button" class="btn-solid" style="padding: 8px 16px; font-size: 11px; white-space: nowrap; font-weight: 700;" onclick="loadPushTemplate('happy_hour'); switchTab('tab-push');">
            🚀 Disparar Oferta Happy Hour Ahora
          </button>
        </div>
      </div>

      <!-- PANELES DIVIDIDOS -->
      <div class="panels-grid">
        <!-- PANEL IZQUIERDO: BASE DE DATOS DE CUPONES Y CLIENTES -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <span>🎟️ Cupones y Tarjetas de Sellos</span>
              <span style="font-size: 11px; background: #F1F5F9; border: 1px solid var(--card-border); padding: 2px 8px; border-radius: 6px; color: var(--text-muted);">Base de Datos Local</span>
            </div>
            <input type="text" id="searchInput" placeholder="🔍 Buscar código, cliente o tel..." class="form-input" style="width: 220px;" onkeyup="filterTable()">
          </div>

          <div class="table-container">
            <table id="prizesTable">
              <thead>
                <tr>
                  <th>Código Único</th>
                  <th>Hora</th>
                  <th>Cliente & WhatsApp</th>
                  <th>Premio Ganado</th>
                  <th>Nivel & Sellos</th>
                  <th>Estado en Caja</th>
                </tr>
              </thead>
              <tbody id="tableBody">
                ${
                  db.prizes.length === 0
                    ? '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">No hay cupones registrados aún.</td></tr>'
                    : db.prizes
                        .map((p) => {
                          const stamps = p.stamps || 1;
                          const stars = "★".repeat(Math.min(5, stamps)) + "☆".repeat(Math.max(0, 5 - stamps));
                          const isUsed = p.status === "UTILIZADO";
                          const isSecondChance = (p.prizeName || "").includes("2ª Oportunidad");
                          const tierBadge = stamps >= 11
                            ? '<span style="background: #FFFBEB; color: #78350F; border: 1px solid #F59E0B; padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: 700;">👑 Embajador VIP</span>'
                            : stamps >= 6
                            ? '<span style="background: #F1F5F9; color: #475569; border: 1px solid #CBD5E1; padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: 700;">🥐 Gourmet Regular</span>'
                            : '<span style="background: #FFFBEB; color: #92400E; border: 1px solid #FCD34D; padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: 700;">☕ Café Inicial</span>';

                          return `
                          <tr>
                            <td><span class="badge-code">${p.uniqueCode}</span></td>
                            <td><span style="color: var(--text-muted); font-family: monospace; font-size: 11px;">${p.wonAt || "Hoy"}</span></td>
                            <td>
                              <strong style="color: var(--text); font-size: 12px;">${p.customerName || "Cliente"}</strong>
                              <div style="font-size: 11px; color: var(--text-muted);">${p.whatsapp || "Sin número"}</div>
                            </td>
                            <td>
                              <div style="font-weight: 700; color: var(--text); font-size: 12px;">${p.prizeName}</div>
                              <div style="font-size: 10px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; margin-top: 3px;">
                                <span style="background: #F1F5F9; padding: 1px 6px; border-radius: 4px; border: 1px solid var(--card-border);">${p.tableNumber || "Mesa 1"}</span>
                                ${isSecondChance ? '<span style="background: var(--accent-light); color: var(--accent); padding: 1px 6px; border-radius: 4px; font-weight: 700;">⭐ 2ª Oportunidad</span>' : ''}
                              </div>
                            </td>
                            <td>
                              <div class="stars-cell">${stars}</div>
                              <div style="margin-top: 3px; display: flex; align-items: center; gap: 4px;">
                                ${tierBadge}
                                <span style="font-size: 10px; color: var(--text-muted); font-family: monospace;">(${stamps}/15)</span>
                              </div>
                            </td>
                            <td>
                              <span class="${isUsed ? "badge-status-used" : "badge-status-available"}">
                                ${isUsed ? "✓ CANJEADO" : "⏳ DISPONIBLE"}
                              </span>
                              ${isUsed && p.usedAt ? `<div style="font-size: 10px; color: var(--text-muted); margin-top: 3px;">Hora: ${p.usedAt}</div>` : ""}
                            </td>
                          </tr>
                          `;
                        })
                        .join("")
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- PANEL DERECHO: CONSOLA DE LOGS -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <span>⚡ Registro de Actividad HTTP</span>
            </div>
            <button class="icon-preset-btn" onclick="refreshData()">↻ Actualizar</button>
          </div>

          <div class="log-box" id="logBox">
            ${
              db.logs.length === 0
                ? '<p style="color: #6b7280; text-align: center; margin: auto;">Esperando peticiones del frontend...</p>'
                : db.logs
                    .map(
                      (l) => `
                    <div class="log-item">
                      <div class="log-top">
                        <span class="method-tag ${l.method === "POST" ? "method-post" : "method-get"}">${l.method}</span>
                        <span class="log-url">${l.url}</span>
                        <span class="log-time">${l.timestamp}</span>
                      </div>
                      <div class="log-detail">${l.detail}</div>
                    </div>
                  `
                    )
                    .join("")
            }
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 2: IDENTIDAD DE MARCA & COLORES                                   -->
    <!-- ========================================================================= -->
    <div id="tab-brand" class="tab-content">
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>🏷️ Identidad de Marca Blanca & Colores Corporativos</span>
          </div>
          <div>
            <span id="toast-brand" class="toast-success">✓ ¡Marca guardada con éxito!</span>
            <button class="btn-save" onclick="saveBrandConfig()">💾 Guardar Marca</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px;">
          <div class="form-group">
            <label class="form-label">Nombre Comercial del Establecimiento:</label>
            <input type="text" id="brand-name" class="form-input" value="${s.brand.name || ''}" placeholder="Ej: Mi Restaurante & Café" />
            <span class="form-help">Aparece en el encabezado, vouchers, cupones y mensajes.</span>
          </div>

          <div class="form-group">
            <label class="form-label">Moneda Oficial:</label>
            <input type="text" id="brand-currency" class="form-input" value="${s.brand.currency || 'COP'}" placeholder="COP, USD, MXN, EUR..." />
            <span class="form-help">Símbolo monetario usado en precios y promociones.</span>
          </div>

          <div class="form-group">
            <label class="form-label">Eslogan Principal (Español):</label>
            <input type="text" id="brand-tagline" class="form-input" value="${s.brand.tagline || ''}" placeholder="Ej: Sabores inolvidables en cada momento." />
          </div>

          <div class="form-group">
            <label class="form-label">Eslogan en Inglés (English Tagline):</label>
            <input type="text" id="brand-tagline-en" class="form-input" value="${s.brand.taglineEn || ''}" placeholder="Ej: Unforgettable flavors in every moment." />
          </div>

          <div class="form-group">
            <label class="form-label">URL del Logotipo Principal:</label>
            <input type="text" id="brand-logo" class="form-input" value="${s.brand.logoUrl || ''}" placeholder="https://.../logo.png" />
          </div>

          <div class="form-group">
            <label class="form-label">URL del Emblema Central (Ruleta y QR):</label>
            <input type="text" id="brand-emblem" class="form-input" value="${s.brand.emblemUrl || ''}" placeholder="https://.../emblema.png" />
          </div>
        </div>

        <!-- PALETA CROMÁTICA -->
        <div style="margin-top: 14px; padding: 16px; background: #0b0f19; border: 1px solid var(--card-border); border-radius: 12px;">
          <label class="form-label" style="margin-bottom: 8px;">Color Primario Corporativo (Acentos, Botones y Borde Dorado):</label>
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 12px;">
            <input type="color" id="brand-color-picker" value="${s.brand.primaryColor || '#a27e2c'}" onchange="document.getElementById('brand-color-hex').value = this.value;" style="height: 38px; width: 50px; background: transparent; border: 1px solid var(--card-border); border-radius: 8px; cursor: pointer;" />
            <input type="text" id="brand-color-hex" class="form-input" value="${s.brand.primaryColor || '#a27e2c'}" onkeyup="document.getElementById('brand-color-picker').value = this.value;" style="width: 120px; font-family: monospace; font-weight: 700;" />
            <div id="brand-color-preview" style="height: 38px; padding: 0 16px; border-radius: 8px; background: ${s.brand.primaryColor || '#a27e2c'}; color: #fff; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center;">
              Muestra de Color
            </div>
          </div>

          <span class="form-help" style="margin-bottom: 8px;">Paletas Gastronómicas de 1 Toque:</span>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${[
              { name: "Dorado Real", hex: "#a27e2c" },
              { name: "Borgoña Gourmet", hex: "#8b1e2c" },
              { name: "Esmeralda Café", hex: "#1e6b52" },
              { name: "Azul Bistro", hex: "#1e3a8a" },
              { name: "Chocolate Fino", hex: "#5c3826" },
              { name: "Naranja Brasa", hex: "#d9531e" },
              { name: "Violeta Lounge", hex: "#6d28d9" },
              { name: "Negro Élite", hex: "#18181b" },
            ].map(p => `
              <button type="button" class="icon-preset-btn" onclick="selectColorPreset('${p.hex}')">
                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${p.hex}; border: 1px solid rgba(255,255,255,0.2);"></span>
                <span>${p.name}</span>
              </button>
            `).join("")}
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 3: CANALES & WHATSAPP EN MESA                                     -->
    <!-- ========================================================================= -->
    
    <!-- TAB: MONITOREO Y CONFIGURACIÓN DE 10 MESAS EN TIEMPO REAL -->
    <div id="tab-tables" class="tab-content">
      <!-- GUÍA RÁPIDA DE MESAS -->
      <div class="quick-guide-box">
        <div class="quick-guide-header">
          <span>💡</span>
          <span>Guía Rápida: Control de 10 Mesas Conectadas en Tiempo Real</span>
        </div>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">
          Cada una de las 10 mesas tiene un QR exclusivo conectado a una variable de estado en vivo (Disponible, Jugando, Premio Pendiente, Canjeado).
        </p>
        <div class="quick-guide-grid">
          <div class="quick-guide-item">
            <strong style="color: #34d399;">🟢 Mesa Disponible</strong>
            <p>La mesa está libre esperando al cliente. Escanear el QR activa la variable automáticamente.</p>
          </div>
          <div class="quick-guide-item">
            <strong style="color: #38bdf8;">🔵 Comensal Jugando</strong>
            <p>El cliente en mesa ingresó sus datos y está girando la ruleta en este momento.</p>
          </div>
          <div class="quick-guide-item">
            <strong style="color: #fbbf24;">🟡 Premio Pendiente</strong>
            <p>¡El comensal ganó un premio! Muestra el código en caja para validar con tu PIN.</p>
          </div>
          <div class="quick-guide-item">
            <strong style="color: #c084fc;">🔄 Liberación en 1-Clic</strong>
            <p>Cuando el comensal pague, pulsa "Liberar Mesa" para dejarla lista para el siguiente cliente.</p>
          </div>
        </div>
      </div>

      <!-- FORMULARIO RÁPIDO DE CONFIGURACIÓN DE MESAS -->
      <div class="panel" style="margin-bottom: 20px;">
        <div class="panel-header" style="border-bottom: 1px solid var(--card-border); padding-bottom: 10px; margin-bottom: 14px;">
          <div class="panel-title">
            <span>⚙️ Configurar Nombre, Zona y Capacidad de Mesa</span>
          </div>
          <span class="badge-role" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">10 MESAS CONECTADAS</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; align-items: flex-end;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Seleccionar Mesa</label>
            <select id="cfgTableSelect" class="form-input" onchange="loadTableConfigForm()">
              ${(db.tables || DEFAULT_TABLES).map(t => `<option value="${t.number}">Mesa ${t.number} - ${t.name}</option>`).join("")}
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Nombre Comercial de Mesa</label>
            <input type="text" id="cfgTableName" class="form-input" placeholder="Ej: Mesa 1 - Ventana">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Zona del Local</label>
            <select id="cfgTableZone" class="form-input">
              <option value="Salón Principal">Salón Principal</option>
              <option value="Terraza Jardín">Terraza Jardín</option>
              <option value="Barra / Café">Barra / Café</option>
              <option value="Zona VIP">Zona VIP</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Capacidad (Personas)</label>
            <select id="cfgTableCapacity" class="form-input">
              <option value="2">2 Personas</option>
              <option value="4">4 Personas</option>
              <option value="6">6 Personas</option>
              <option value="8">8 Personas</option>
            </select>
          </div>
          <button type="button" class="btn-solid" style="padding: 10px 16px; font-size: 12px; font-weight: 700;" onclick="saveBackendTableConfig()">
            💾 Guardar Mesa
          </button>
        </div>
      </div>

      <!-- CUADRÍCULA DE LAS 10 TARJETAS DE MESA EN TIEMPO REAL -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px;">
        ${(db.tables || DEFAULT_TABLES).map(table => {
          const isPending = table.status === "PREMIO_PENDIENTE";
          const isPlaying = table.status === "JUGANDO";
          const isRedeemed = table.status === "CANJEADO";
          const isAvailable = table.status === "DISPONIBLE";

          const statusColor = isPending ? "#fbbf24" : isPlaying ? "#38bdf8" : isRedeemed ? "#34d399" : "#10b981";
          const statusBg = isPending ? "rgba(245, 158, 11, 0.15)" : isPlaying ? "rgba(56, 189, 248, 0.15)" : isRedeemed ? "rgba(52, 211, 153, 0.15)" : "rgba(16, 185, 129, 0.15)";
          const statusBorder = isPending ? "rgba(245, 158, 11, 0.4)" : isPlaying ? "rgba(56, 189, 248, 0.4)" : isRedeemed ? "rgba(52, 211, 153, 0.4)" : "rgba(16, 185, 129, 0.4)";
          const statusLabel = isPending ? "🟡 PREMIO PENDIENTE" : isPlaying ? "🔵 JUGANDO AHORA" : isRedeemed ? "✓ PREMIO CANJEADO" : "🟢 DISPONIBLE";

          return `
            <div id="table-card-${table.number}" style="background: var(--card-bg); border: 2px solid ${statusBorder}; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: all 0.2s ease;">
              <!-- Encabezado de la Mesa -->
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <div>
                    <span style="font-size: 16px; font-weight: 800; color: var(--text); display: flex; align-items: center; gap: 6px;">
                      <span>🪑</span> ${table.name}
                    </span>
                    <span style="font-size: 11px; color: var(--text-muted); font-family: monospace;">${table.zone} · ${table.capacity} pers</span>
                  </div>
                  <span style="font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 9999px; background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusBorder}; font-family: monospace;">
                    ${statusLabel}
                  </span>
                </div>

                <!-- Datos del Comensal y Variable Conectada -->
                <div style="background: #F8FAFC; border: 1px solid var(--card-border); border-radius: 10px; padding: 10px 12px; margin: 10px 0; font-size: 11px; space-y: 4px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: var(--text-muted);">Comensal:</span>
                    <strong style="color: var(--text);">${table.currentCustomer || "Mesa Libre"}</strong>
                  </div>
                  ${table.currentWhatsapp ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: var(--text-muted);">WhatsApp:</span>
                    <span style="color: var(--success); font-family: monospace; font-weight: 700;">+${table.currentWhatsapp}</span>
                  </div>` : ""}
                  ${table.prizeWon ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: var(--text-muted);">Premio:</span>
                    <span style="color: var(--accent); font-weight: 700; text-align: right;">${table.prizeWon}</span>
                  </div>` : ""}
                  ${table.uniqueCode ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: var(--text-muted);">Cupón:</span>
                    <span style="color: var(--info); background: var(--info-bg); border: 1px solid rgba(37,99,235,0.2); padding: 1px 6px; border-radius: 4px; font-family: monospace; font-weight: 800;">${table.uniqueCode}</span>
                  </div>` : ""}
                  <div style="display: flex; justify-content: space-between; margin-top: 6px; padding-top: 4px; border-top: 1px dashed var(--card-border); font-size: 10px;">
                    <span style="color: var(--text-muted);">Variable: mesa.${table.number}</span>
                    <span style="color: var(--info); font-family: monospace;">${table.activeSessionId || "ID: Libre"}</span>
                  </div>
                </div>
              </div>

              <!-- Acciones de Mesa -->
              <div style="display: flex; gap: 8px; margin-top: 6px;">
                <a href="${table.qrUrl}" target="_blank" class="btn-secondary" style="flex: 1; text-align: center; text-decoration: none; font-size: 11px; padding: 6px 8px; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
                  <span>🔗</span> <span>Abrir Mesa</span>
                </a>
                <button type="button" class="btn-secondary" style="padding: 6px 10px; font-size: 11px;" onclick="resetBackendTable(${table.number})" title="Liberar mesa y poner disponible">
                  <span>🔄</span> <span>Liberar</span>
                </button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  

    <!-- ========================================================================= -->
    <!-- TAB: MODO KIOSKO DIGITAL & PORTAL CAUTIVO WIFI (TABLET / TÓTEM / WIFI)    -->
    <!-- ========================================================================= -->
    <div id="tab-kiosk" class="tab-content">
      <!-- GUÍA RÁPIDA -->
      <div class="quick-guide-box">
        <div class="quick-guide-header">
          <span>🖥️</span>
          <span>Guía Rápida: Modo Kiosko Digital, Tótem Táctil & Portal Cautivo WiFi</span>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">
          Esta función convierte cualquier tablet, iPad, tótem o computadora en un punto de autoservicio para el comensal. También actúa como portal cautivo cuando los clientes se conectan a tu red WiFi.
        </div>
        <div class="quick-guide-grid">
          <div class="quick-guide-item">
            <strong>🖥️ Pantalla para Tablets o iPads</strong>
            <span>Fija una tablet en la barra, mostrador o entrada. Cuenta con botón de "Pantalla Completa" para evitar que los clientes salgan del navegador.</span>
          </div>
          <div class="quick-guide-item">
            <strong>📶 Portal Cautivo WiFi VIP</strong>
            <span>Al conectarse a la red WiFi del restaurante ("${s.brand.name} - Clientes VIP"), esta pantalla se abre automáticamente en sus teléfonos.</span>
          </div>
          <div class="quick-guide-item">
            <strong>⚡ Registro en 10 Segundos</strong>
            <span>El comensal solo ingresa su Nombre y WhatsApp. Recibe de inmediato su primer sello de fidelidad y pasa a jugar la ruleta.</span>
          </div>
          <div class="quick-guide-item">
            <strong>🔔 Activación de Notificaciones Push</strong>
            <span>Al conectarse desde el Kiosko, se le ofrece recibir cupones y promociones exclusivas directamente en su teléfono.</span>
          </div>
        </div>
      </div>

      <!-- ESTADÍSTICAS Y ACCESO RÁPIDO -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-title">Estado del Kiosko / Portal</span>
          <span class="stat-value" style="color: var(--success);">🟢 EN LÍNEA</span>
          <span class="stat-sub">Servicio activo en puerto local</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Red WiFi Configurada</span>
          <span class="stat-value" style="color: var(--accent); font-size: 18px;">${s.brand.name}</span>
          <span class="stat-sub">SSID: ${s.brand.name} - Clientes VIP</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Tiempo de Sesión WiFi</span>
          <span class="stat-value" style="color: var(--info);">120 Min</span>
          <span class="stat-sub">Navegación libre por visita</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Clientes por Kiosko / WiFi</span>
          <span class="stat-value" style="color: #8b5cf6;">${kioskCount}</span>
          <span class="stat-sub">Comensales registrados por este canal</span>
        </div>
      </div>

      <!-- PANEL PRINCIPAL DE ACCESO AL KIOSKO -->
      <div class="panel" style="border: 2px solid var(--accent); background: linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%); margin-bottom: 24px;">
        <div class="panel-header" style="flex-wrap: wrap; gap: 12px;">
          <div>
            <div class="panel-title" style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 24px;">🚀</span>
              <span style="font-weight: 800; font-size: 16px; color: var(--text);">Acceso Directo al Modo Kiosko en Vivo</span>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
              Abre el modo kiosko en tu navegador o copia el enlace para configurarlo en una tablet o iPad en tu local.
            </div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <a href="http://localhost:5173/?modo=kiosko" target="_blank" class="btn-primary" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; text-decoration: none; padding: 10px 20px; border-radius: 9999px; font-weight: 800; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);">
              🖥️ Abrir Kiosko en Vivo en Nueva Pestaña ↗
            </a>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 14px;">
          <div style="background: #FFFFFF; padding: 16px; border-radius: 12px; border: 1px solid var(--card-border);">
            <strong style="font-size: 13px; color: var(--text); display: block; margin-bottom: 6px;">
              🔗 Enlace Directo para Tablets / Navegadores:
            </strong>
            <div style="display: flex; gap: 6px; margin-bottom: 6px;">
              <input type="text" id="kioskUrlInput" class="form-input" value="http://localhost:5173/?modo=kiosko" readonly style="font-family: monospace; font-size: 12px; background: #F8FAFC;" />
              <button type="button" class="btn-secondary" onclick="copyKioskUrl()" style="white-space: nowrap; font-size: 11px;">📋 Copiar</button>
            </div>
            <span style="font-size: 11px; color: var(--text-muted);">
              Cualquiera de estos parámetros funciona: <code>?modo=kiosko</code>, <code>?modo=wifi</code> o <code>?kiosko=1</code>.
            </span>
          </div>

          <div style="background: #FFFFFF; padding: 16px; border-radius: 12px; border: 1px solid var(--card-border);">
            <strong style="font-size: 13px; color: var(--text); display: block; margin-bottom: 6px;">
              💡 Cómo Fijar en un iPad o Tablet (Modo Kiosko Real):
            </strong>
            <ul style="font-size: 11.5px; color: var(--text-muted); line-height: 1.6; margin: 0; padding-left: 18px;">
              <li><strong>En iPad / Safari:</strong> Abre la URL, toca <em>Compartir</em> y selecciona <em>"Agregar a la pantalla de inicio"</em>.</li>
              <li><strong>En Android / Chrome:</strong> Toca los 3 puntos del navegador y elige <em>"Instalar aplicación"</em> o <em>"Agregar a pantalla principal"</em>.</li>
              <li><strong>Pantalla Completa:</strong> Toca el botón <strong>⛶</strong> en la esquina superior de la ventana del kiosko.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- HISTORIAL DE CLIENTES DEL KIOSKO -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>📥 Clientes Registrados desde Kiosko & Portal WiFi</span>
            <span style="font-size: 11px; background: rgba(16, 185, 129, 0.15); color: #059669; padding: 2px 8px; border-radius: 9999px; font-weight: 700;">
              ${kioskCount} registros
            </span>
          </div>
        </div>

        <div style="overflow-x: auto;">
          <table class="data-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Comensal</th>
                <th>WhatsApp</th>
                <th>Sellos Acreditados</th>
                <th>Fecha de Conexión</th>
                <th>Canal de Origen</th>
              </tr>
            </thead>
            <tbody>
              ${kioskCustomers.length === 0 ? `
                <tr>
                  <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">
                    🖥️ Aún no hay comensales registrados desde el Kiosko o WiFi. Puedes probar abriendo el enlace <strong>http://localhost:5173/?modo=kiosko</strong> y registrarte para ver cómo aparece aquí.
                  </td>
                </tr>
              ` : kioskCustomers.map(c => `
                <tr>
                  <td><strong>${c.fullName || 'Invitado'}</strong></td>
                  <td><code>${c.whatsapp}</code></td>
                  <td><span style="color: #059669; font-weight: 800;">${c.stamps || 1} sellos</span></td>
                  <td>${c.connectedAt ? new Date(c.connectedAt).toLocaleString('es-CO') : 'Reciente'}</td>
                  <td><span style="font-size: 10px; background: rgba(16, 185, 129, 0.15); color: #059669; padding: 2px 8px; border-radius: 6px; font-weight: 700;">KIOSKO / WIFI</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
<div id="tab-channels" class="tab-content">
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>📱 Canales de Contacto, Instagram & WhatsApp en Mesa</span>
          </div>
          <div>
            <span id="toast-channels" class="toast-success">✓ ¡Canales guardados con éxito!</span>
            <button class="btn-save" onclick="saveChannelsConfig()">💾 Guardar Canales</button>
          </div>
        </div>

        <div style="padding: 14px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 12px; margin-bottom: 18px; font-size: 12px;">
          <strong>Regla de Juego:</strong> El comensal juega inicialmente por <strong>Instagram Stories</strong> como canal principal de marketing boca a boca. Puedes activar <strong>WhatsApp</strong> para comensales que no usan redes sociales.
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          <div class="form-group">
            <label class="form-label">📸 Usuario Oficial de Instagram (Canal Principal):</label>
            <input type="text" id="chan-ig" class="form-input" value="${s.channels.instagramHandle || '@tu_restaurante'}" placeholder="@tu_restaurante" />
            <span class="form-help">Mención obligatoria sugerida a los comensales en su Story.</span>
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label class="form-label" style="margin: 0;">💬 Opción de WhatsApp en Mesa:</label>
              <label style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer; background: rgba(16, 185, 129, 0.15); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.3);">
                <input type="checkbox" id="chan-wa-enabled" ${s.channels.enableWhatsAppPhoto !== false ? 'checked' : ''} style="cursor: pointer;" />
                <span style="color: #34d399; font-weight: 700; font-size: 11px;">Habilitar en Mesa</span>
              </label>
            </div>
            <input type="text" id="chan-wa-phone" class="form-input" value="${s.channels.whatsappNumber || '573022777295'}" placeholder="573000000000" />
            <span class="form-help">Teléfono que recibirá la foto de comensales que no usan Instagram.</span>
          </div>

          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">Plantilla del Mensaje de WhatsApp (al recibir foto del comensal):</label>
            <textarea id="chan-wa-msg" rows="2" class="form-input" style="font-family: inherit;">${s.channels.whatsappPhotoMessage || ''}</textarea>
            <span class="form-help">Variables disponibles: {brandName}, {tableNumber}, {participantName}</span>
          </div>

          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">Enlace a Reseñas de Google Maps (Google My Business):</label>
            <input type="text" id="chan-maps" class="form-input" value="${s.channels.googleMapsReviewUrl || 'https://maps.google.com'}" placeholder="https://g.page/r/.../review" />
            <span class="form-help">Los clientes son dirigidos aquí tras calificar positivamente con 4 o 5 estrellas.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 4: RULETA DE PREMIOS & PROBABILIDADES                             -->
    <!-- ========================================================================= -->
    <!-- ========================================================================= -->
    <!-- PESTAÑA: SELECCIÓN DE JUEGO EN MESA (RULETA VS RETO 10S)                  -->
    <!-- ========================================================================= -->
    <div id="tab-game-mode" class="tab-content">
      <!-- GUÍA RÁPIDA -->
      <div class="quick-guide-box">
        <div class="quick-guide-header">
          <span>💡</span>
          <span>Guía Rápida: Selección del Juego Activo en Mesa</span>
        </div>
        <div class="quick-guide-grid">
          <div class="quick-guide-item">
            <strong>⏱️ Reto de Precisión 10 Segundos</strong>
            <span>Desafío de reflejos táctiles: el cliente debe frenar el cronómetro exactamente en 10.000s para ganar.</span>
          </div>
          <div class="quick-guide-item">
            <strong>🎡 Ruleta de la Fortuna</strong>
            <span>Giro animado por algoritmos de probabilidad matemática configurados en la pestaña Premios de Ruleta.</span>
          </div>
          <div class="quick-guide-item">
            <strong>⚡ Sincronización Inmediata</strong>
            <span>Al presionar "Guardar Selección", el frontend de las mesas adopta el nuevo juego de inmediato.</span>
          </div>
        </div>
      </div>

      <!-- PANEL SELECTOR DE MECÁNICA DE JUEGO -->
      <div class="panel" style="margin-bottom: 24px; border: 1px solid #d97706; background: rgba(217, 119, 6, 0.04);">
        <div class="panel-header">
          <div class="panel-title">
            <span style="font-size: 16px;">🎮 Mecánica de Juego Activa en Mesa (Ruleta vs Reto de Precisión 10s)</span>
          </div>
          <div>
            <span id="toast-game-mode" class="toast-success">✓ ¡Mecánica de juego actualizada!</span>
            <button class="btn-save" onclick="saveGameModeConfig()">💾 Guardar Selección de Juego</button>
          </div>
        </div>

        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">
          Elige el tipo de juego que verán los clientes en sus móviles al escanear el QR en mesa. Después de seleccionar, configura cada detalle directamente aquí.
        </p>

        <!-- PASO 1: Selector visual de 4 tarjetas -->
        <div style="margin-bottom: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 12px;">① Elige el tipo de juego</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px;">

            <div class="game-mode-card ${gc.gameMode === 'roulette' ? 'active' : ''}" onclick="selectBackendGameMode('roulette', this)">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 24px;">🎡</span>
                <span class="mode-check">${gc.gameMode === 'roulette' ? '✓ ACTIVO' : ''}</span>
              </div>
              <div style="font-weight: 700; color: var(--text); font-size: 13px;">Ruleta de la Fortuna</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Azar puro y emoción instantánea con disco dorado animado.</div>
            </div>

            <div class="game-mode-card ${gc.gameMode === 'precision' ? 'active' : ''}" onclick="selectBackendGameMode('precision', this)">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 24px;">⏱️</span>
                <span class="mode-check">${gc.gameMode === 'precision' ? '✓ ACTIVO' : ''}</span>
              </div>
              <div style="font-weight: 700; color: var(--text); font-size: 13px;">Reto de Precisión 10s</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Habilidad táctil. El cliente frena el cronómetro en 10.000s exactos.</div>
            </div>

            <div class="game-mode-card ${gc.gameMode === 'hybrid' ? 'active' : ''}" onclick="selectBackendGameMode('hybrid', this)">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 24px;">🔄</span>
                <span class="mode-check">${gc.gameMode === 'hybrid' ? '✓ ACTIVO' : ''}</span>
              </div>
              <div style="font-weight: 700; color: var(--text); font-size: 13px;">Modo Libre / Híbrido</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">El comensal elige en su móvil entre Ruleta o Reto de Precisión.</div>
            </div>

            <div class="game-mode-card ${gc.gameMode === 'stamps' ? 'active' : ''}" onclick="selectBackendGameMode('stamps', this)">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 24px;">💳</span>
                <span class="mode-check">${gc.gameMode === 'stamps' ? '✓ ACTIVO' : ''}</span>
              </div>
              <div style="font-weight: 700; color: var(--text); font-size: 13px;">Pasaporte de Sellos</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Fidelización por visitas repetidas con premios cada 5 sellos.</div>
            </div>
          </div>
        </div>

        <input type="hidden" id="backendGameMode" value="${gc.gameMode}" />

        <!-- PASO 2: Panel de configuración contextual (cambia según el juego elegido) -->
        <div id="game-config-wizard" style="display: flex; flex-direction: column; gap: 14px;">

          <!-- === CONFIGURACIÓN: RULETA === -->
          <div id="wizard-roulette" style="display: ${gc.gameMode === 'roulette' || gc.gameMode === 'hybrid' ? 'block' : 'none'};">
            <div style="background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 14px; padding: 18px 20px;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px; border-bottom: 1px solid #FDE68A; padding-bottom: 10px;">
                <span style="font-size: 20px;">🎡</span>
                <div>
                  <div style="font-weight: 700; color: #92400E; font-size: 14px;">② Configura la Ruleta de la Fortuna</div>
                  <div style="font-size: 11px; color: #B45309;">Los premios y probabilidades se configuran en la pestaña "Ruleta & Premios" del menú lateral</div>
                </div>
                <a href="#" onclick="switchTab('tab-roulette', document.querySelector('[data-tab=tab-roulette]'))" style="margin-left: auto; background: #92400E; color: #fff; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 8px; text-decoration: none;">Ir a Configurar Premios →</a>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Probabilidad de ganar (%)</label>
                  <div style="font-size: 22px; font-weight: 800; color: #92400E;">${s.prizes ? s.prizes.filter(p => p.active !== false).reduce((acc, p) => acc + (p.probability || 0), 0) : 0}%</div>
                  <span class="form-help">Suma de probabilidades de premios activos</span>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Premios activos</label>
                  <div style="font-size: 22px; font-weight: 800; color: #92400E;">${s.prizes ? s.prizes.filter(p => p.active !== false).length : 0}</div>
                  <span class="form-help">De ${s.prizes ? s.prizes.length : 0} premios configurados</span>
                </div>
              </div>
            </div>
          </div>

          <!-- === CONFIGURACIÓN: PRECISIÓN === -->
          <div id="wizard-precision" style="display: ${gc.gameMode === 'precision' || gc.gameMode === 'hybrid' ? 'block' : 'none'};">
            <div style="background: var(--info-bg); border: 1px solid rgba(37, 99, 235, 0.3); border-radius: 14px; padding: 18px 20px;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; border-bottom: 1px solid rgba(37, 99, 235, 0.15); padding-bottom: 10px;">
                <span style="font-size: 20px;">⏱️</span>
                <div>
                  <div style="font-weight: 700; color: var(--info); font-size: 14px;">② Configura el Reto de Precisión 10s</div>
                  <div style="font-size: 11px; color: #3B82F6;">Ajusta la dificultad y número de intentos permitidos</div>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Dificultad / Margen de victoria</label>
                  <select id="precisionDifficulty" class="form-input" style="padding: 8px 12px; font-size: 12px;">
                    <option value="facil" ${gc.precisionDifficulty === 'facil' ? 'selected' : ''}>🟢 Fácil (±80ms) — Más ganadores, más diversión</option>
                    <option value="medio" ${gc.precisionDifficulty === 'medio' || !gc.precisionDifficulty ? 'selected' : ''}>🟡 Medio (±40ms) — Equilibrado y justo</option>
                    <option value="dificil" ${gc.precisionDifficulty === 'dificil' ? 'selected' : ''}>🔴 Boutique Experto (±15ms) — Exclusivo y emocionante</option>
                  </select>
                  <span class="form-help">Define qué tan cerca de 10.000s debe frenar el comensal para ganar</span>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Intentos máximos por visita</label>
                  <select id="maxAttempts" class="form-input" style="padding: 8px 12px; font-size: 12px;">
                    <option value="1" ${gc.maxAttempts == 1 ? 'selected' : ''}>1 intento — Máxima emoción</option>
                    <option value="2" ${gc.maxAttempts == 2 ? 'selected' : ''}>2 intentos — Equilibrado</option>
                    <option value="3" ${!gc.maxAttempts || gc.maxAttempts == 3 ? 'selected' : ''}>3 intentos — Recomendado para mayor retención</option>
                    <option value="5" ${gc.maxAttempts == 5 ? 'selected' : ''}>5 intentos — Modo diversión total</option>
                  </select>
                  <span class="form-help">Si falla todos los intentos, recibe un mensaje de ánimo y próxima visita</span>
                </div>
              </div>
            </div>
          </div>

          <!-- === CONFIGURACIÓN: SELLOS === -->
          <div id="wizard-stamps" style="display: ${gc.gameMode === 'stamps' ? 'block' : 'none'};">
            <div style="background: var(--success-bg); border: 1px solid rgba(5, 150, 105, 0.3); border-radius: 14px; padding: 18px 20px;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px; border-bottom: 1px solid rgba(5, 150, 105, 0.15); padding-bottom: 10px;">
                <span style="font-size: 20px;">💳</span>
                <div>
                  <div style="font-weight: 700; color: var(--success); font-size: 14px;">② Configura el Pasaporte de Sellos</div>
                  <div style="font-size: 11px; color: #059669;">Los hitos y premios de sellos se configuran en la pestaña "Sellos & Fidelización"</div>
                </div>
                <a href="#" onclick="switchTab('tab-stamps', document.querySelector('[data-tab=tab-stamps]'))" style="margin-left: auto; background: var(--success); color: #fff; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 8px; text-decoration: none;">Ir a Configurar Sellos →</a>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
                ${s.stamps.milestones.map(m => `
                  <div style="background: #FFFFFF; border: 1px solid var(--card-border); border-radius: 10px; padding: 12px;">
                    <div style="font-size: 20px; margin-bottom: 4px;">${m.icon}</div>
                    <div style="font-size: 11px; font-weight: 700; color: var(--text);">Sello ${m.stamp}</div>
                    <div style="font-size: 10px; color: var(--text-muted);">${m.title.replace(/^[^:]+:\s*/, '')}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- PASO 3: Botón de guardar siempre visible -->
          <div style="display: flex; align-items: center; justify-content: space-between; background: #F8FAFC; border: 1px solid var(--card-border); border-radius: 12px; padding: 14px 18px; flex-wrap: wrap; gap: 12px;">
            <div>
              <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">③ Activar en el restaurante</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">El cambio se aplica al instante en todos los móviles de los comensales</div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span id="toast-game-mode" class="toast-success">✓ ¡Juego activado en el restaurante!</span>
              <button class="btn-save" onclick="saveGameModeConfig()">⚡ Activar Juego Seleccionado</button>
            </div>
          </div>
        </div>
      </div>

      <!-- PANEL SEGUNDA OPORTUNIDAD: ESTADOS DE WHATSAPP + RETO DE PRECISIÓN 10S -->
      <div class="panel" style="margin-top: 24px; border: 2px solid var(--accent); background: linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 100%);">
        <div class="panel-header" style="border-bottom: 1px solid rgba(162, 126, 44, 0.2); padding-bottom: 12px; margin-bottom: 16px;">
          <div class="panel-title">
            <span style="font-size: 18px;">🎁 Segunda Oportunidad: Estados de WhatsApp + Reto de Precisión 10s</span>
            <span style="font-size: 11px; background: var(--accent-light); color: var(--accent); padding: 3px 8px; border-radius: 9999px; font-weight: 700; border: 1px solid rgba(162,126,44,0.3);">ESTRATEGIA VIRAL</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span id="toast-second-chance" class="toast-success">✓ ¡Segunda Oportunidad guardada!</span>
            <button class="btn-save" onclick="saveSecondChanceConfig()">💾 Guardar 2ª Oportunidad</button>
          </div>
        </div>

        <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 18px; line-height: 1.6;">
          <strong>Estrategia Viral Separada:</strong> Tras calificar en Google, el comensal desbloquea una <strong>Segunda Oportunidad</strong> si comparte la experiencia en sus <strong>Estados de WhatsApp</strong>. El cliente envía la captura de su estado al WhatsApp del restaurante y juega el Reto de Precisión 10s para ganar un premio especial visible y limpio.
        </p>

        <!-- Formulario de Configuración de 2ª Oportunidad -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px;">
          <!-- 1. Switch de Activación -->
          <div class="form-group">
            <label class="form-label">Estado de la 2ª Oportunidad</label>
            <select id="scEnabled" class="form-input">
              <option value="true" ${sc.enabled !== false ? 'selected' : ''}>✅ ACTIVO — Ofrecer tras calificar en Google</option>
              <option value="false" ${sc.enabled === false ? 'selected' : ''}>⏸️ PAUSADO — No mostrar 2ª oportunidad</option>
            </select>
            <span class="form-help">Si está activo, los comensales verán el botón para desbloquear el reto</span>
          </div>

          <!-- Selector de Modo de Premio / Plantillas Rápidas -->
          <div class="form-group">
            <label class="form-label">Modalidad de Programación del Premio</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 4px;">
              <button type="button" class="btn-secondary" onclick="applySecondChancePreset('vasca')" style="font-size: 11px; padding: 6px 4px; text-align: center;">🍰 Tarta Vasca</button>
              <button type="button" class="btn-secondary" onclick="applySecondChancePreset('redvelvet')" style="font-size: 11px; padding: 6px 4px; text-align: center;">🎂 Red Velvet</button>
              <button type="button" class="btn-secondary" onclick="applySecondChancePreset('cafe')" style="font-size: 11px; padding: 6px 4px; text-align: center;">☕ Café Especial</button>
              <button type="button" class="btn-secondary" onclick="applySecondChancePreset('manual')" style="font-size: 11px; padding: 6px 4px; text-align: center; border-color: var(--accent); color: var(--accent); font-weight: 700;">✍️ Premio Manual</button>
            </div>
            <span class="form-help">Selecciona una plantilla rápida o haz clic en ✍️ Premio Manual para personalizar</span>
          </div>

          <!-- 2. Nombre del Premio Manual -->
          <div class="form-group">
            <label class="form-label">Nombre del Premio a Ganar (Manual) *</label>
            <input type="text" id="scPrizeName" class="form-input" value="${(sc.prizeName || 'Postre Artesanal de Autor Gratis').replace(/"/g, '&quot;')}" placeholder="Ej. Tarta Vasca / Desayuno Gourmet / Bono $30.000" oninput="updateSecondChancePreview()" />
            <span class="form-help">Escribe libremente el nombre del postre, bono, producto o experiencia</span>
          </div>

          <!-- 2b. Valor Comercial Estimado -->
          <div class="form-group">
            <label class="form-label">Valor Comercial Estimado (Visual)</label>
            <input type="text" id="scPrizeValue" class="form-input" value="${(sc.prizeValue || '$18.000 COP').replace(/"/g, '&quot;')}" placeholder="Ej. $18.000 COP, $45.000 COP o Cortesía de la Casa" oninput="updateSecondChancePreview()" />
            <span class="form-help">Aumenta el valor percibido del reto ante el comensal</span>
          </div>

          <!-- 3. Descripción Gastronómica del Premio -->
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">Descripción Gastronómica del Premio</label>
            <input type="text" id="scPrizeDescription" class="form-input" value="${(sc.prizeDescription || 'Una porción de nuestra Tarta Vasca artesanal o Red Velvet del día').replace(/"/g, '&quot;')}" placeholder="Ej. Porción de Tarta Vasca o Red Velvet" oninput="updateSecondChancePreview()" />
            <span class="form-help">Detalles que antojen al comensal a esforzarse por ganar</span>
          </div>

          <!-- 3b. Términos y Condiciones de Reclamo -->
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">Términos y Condiciones de Reclamo Manual</label>
            <input type="text" id="scClaimTerms" class="form-input" value="${(sc.claimTerms || 'Válido hoy en mesa o caja presentando el código único ganado.').replace(/"/g, '&quot;')}" placeholder="Ej. Válido hoy en caja presentando tu código único" oninput="updateSecondChancePreview()" />
            <span class="form-help">Instrucciones claras para el comensal y el cajero sobre cómo y cuándo redimir el premio</span>
          </div>

          <!-- 4. Foto del Premio (Catálogo + URL personalizada) -->
          <div class="form-group">
            <label class="form-label">Foto del Premio (Catálogo o URL)</label>
            <select id="scPresetImage" class="form-input" onchange="onSelectSecondChanceImage(this.value)">
              <option value="/src/assets/tarta-vasca.jpg" ${sc.prizeImageUrl?.includes('tarta-vasca') ? 'selected' : ''}>🍰 Tarta Vasca Artesanal (Catálogo)</option>
              <option value="/src/assets/torta-red-velvet.jpg" ${sc.prizeImageUrl?.includes('red-velvet') ? 'selected' : ''}>🎂 Torta Red Velvet (Catálogo)</option>
              <option value="/src/assets/cafe-latte.jpg" ${sc.prizeImageUrl?.includes('cafe-latte') ? 'selected' : ''}>☕ Café Latte Gourmet (Catálogo)</option>
              <option value="/src/assets/hero-pistacho-cafe.jpg" ${sc.prizeImageUrl?.includes('hero-pistacho') ? 'selected' : ''}>🥐 Especial Pistacho & Café (Catálogo)</option>
              <option value="custom" ${!sc.prizeImageUrl?.includes('/src/assets/') ? 'selected' : ''}>🔗 URL Personalizada (Cualquier foto de internet o local)...</option>
            </select>
            <input type="text" id="scPrizeImageUrl" class="form-input" style="margin-top: 6px;" value="${(sc.prizeImageUrl || '/src/assets/tarta-vasca.jpg').replace(/"/g, '&quot;')}" placeholder="URL de la imagen del premio" oninput="updateSecondChancePreview()" />
          </div>

          <!-- 5. Tamaño de la Foto en Pantalla -->
          <div class="form-group">
            <label class="form-label">Tamaño de la Foto en el Cronómetro</label>
            <select id="scPrizeImageSize" class="form-input" onchange="updateSecondChancePreview()">
              <option value="small" ${sc.prizeImageSize === 'small' ? 'selected' : ''}>Compacto (Insignia elegante - 120px)</option>
              <option value="medium" ${sc.prizeImageSize === 'medium' || !sc.prizeImageSize ? 'selected' : ''}>Mediano (Tarjeta gastronómica - 180px - Recomendado)</option>
              <option value="large" ${sc.prizeImageSize === 'large' ? 'selected' : ''}>Grande (Banner gourmet impactante - 260px)</option>
            </select>
            <span class="form-help">Controla cómo se muestra la imagen antes y durante el reto</span>
          </div>

          <!-- 6. Intentos / Oportunidades en el Cronómetro -->
          <div class="form-group">
            <label class="form-label">Número de Oportunidades (Intentos)</label>
            <select id="scMaxAttempts" class="form-input">
              <option value="1" ${sc.maxAttempts == 1 ? 'selected' : ''}>1 intento — Máxima emoción</option>
              <option value="2" ${sc.maxAttempts == 2 ? 'selected' : ''}>2 intentos — Equilibrado</option>
              <option value="3" ${!sc.maxAttempts || sc.maxAttempts == 3 ? 'selected' : ''}>3 intentos — Recomendado (más divertido)</option>
              <option value="5" ${sc.maxAttempts == 5 ? 'selected' : ''}>5 intentos — Generoso (alta fidelización)</option>
            </select>
            <span class="form-help">Veces que el cliente puede frenar el cronómetro antes de perder</span>
          </div>

          <!-- 7. Dificultad del Reto -->
          <div class="form-group">
            <label class="form-label">Dificultad de la 2ª Oportunidad</label>
            <select id="scDifficulty" class="form-input">
              <option value="facil" ${sc.difficulty === 'facil' ? 'selected' : ''}>🟢 Fácil (±80ms: 9.920s a 10.080s) — Más ganadores</option>
              <option value="medio" ${sc.difficulty === 'medio' || !sc.difficulty ? 'selected' : ''}>🟡 Medio (±40ms: 9.960s a 10.040s) — Justo y equilibrado</option>
              <option value="dificil" ${sc.difficulty === 'dificil' ? 'selected' : ''}>🔴 Boutique Experto (±15ms: 9.985s a 10.015s) — Exclusivo</option>
            </select>
            <span class="form-help">Margen milimétrico en torno a 10.000s</span>
          </div>

          <!-- 8. Mensaje para Estados de WhatsApp -->
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">Frase Sugerida para el Estado de WhatsApp del Cliente</label>
            <input type="text" id="scWhatsappStatusText" class="form-input" value="${(sc.whatsappStatusText || '¡Disfrutando de una experiencia increíble en ${s.brand.name}! ☕🍰 Se los recomiendo. 10/10 ✨').replace(/"/g, '&quot;')}" placeholder="Texto que copiará el cliente para su Estado" />
            <span class="form-help">Mensaje predeterminado que viraliza tu marca en las historias de WhatsApp de los comensales</span>
          </div>
        </div>

        <!-- Vista Previa en Vivo de la Tarjeta del Premio -->
        <div style="margin-top: 18px; padding: 16px; background: #FFFFFF; border: 1px solid var(--card-border); border-radius: 12px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">
            👁️ Vista Previa en Tiempo Real de la Tarjeta Programada (Lo que verá el comensal en el cronómetro):
          </div>
          <div id="scPreviewBox" style="max-width: 380px; margin: 0 auto; border: 1px solid var(--card-border); border-radius: 16px; overflow: hidden; background: #FFFFFF; box-shadow: 0 4px 14px rgba(0,0,0,0.08); text-align: center;">
            <div id="scPreviewImgWrap" style="height: ${sc.prizeImageSize === 'small' ? '120px' : sc.prizeImageSize === 'large' ? '260px' : '180px'}; background: #F1F5F9; overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center;">
              <img id="scPreviewImg" src="${sc.prizeImageUrl || '/src/assets/tarta-vasca.jpg'}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/src/assets/tarta-vasca.jpg'" />
              <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); color: #FFF; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px;">
                <span id="scPreviewValBadge">${sc.prizeValue || '$18.000 COP'}</span>
              </div>
            </div>
            <div style="padding: 14px 16px;">
              <span style="font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: 0.08em; text-transform: uppercase;">🏆 Tu Premio Si Ganas</span>
              <h4 id="scPreviewTitle" style="font-size: 16px; font-weight: 800; color: var(--text); margin: 4px 0 3px;">${sc.prizeName || 'Postre Artesanal de Autor Gratis'}</h4>
              <p id="scPreviewDesc" style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 6px;">${sc.prizeDescription || 'Una porción de nuestra Tarta Vasca artesanal del día'}</p>
              <div id="scPreviewTerms" style="font-size: 10.5px; color: #64748B; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 6px 10px; border-radius: 8px;">
                ${sc.claimTerms || 'Válido hoy en mesa o caja presentando el código único ganado.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA: PREMIOS DE RULETA & PROBABILIDADES MATEMÁTICAS (SUMA = 100%)      -->
    <!-- ========================================================================= -->
    <div id="tab-roulette" class="tab-content">
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>🎡 Premios de la Ruleta & Probabilidades Matemáticas (Suma = 100%)</span>
          </div>
          <div>
            <span id="toast-roulette" class="toast-success">✓ ¡Premios de la ruleta guardados!</span>
            <button class="btn-save" onclick="saveRouletteConfig()">💾 Guardar Ruleta</button>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; background: #0b0f19; padding: 12px 16px; border-radius: 12px; margin-bottom: 16px; border: 1px solid var(--card-border);">
          <span style="font-size: 12px; color: var(--text-muted);">Verificación de Suma de Probabilidades:</span>
          <span id="roulette-sum-badge" style="font-size: 13px; font-weight: 800; padding: 4px 12px; border-radius: 8px; background: rgba(16, 185, 129, 0.2); color: #34d399;">
            Suma Total: 100% ✓
          </span>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre del Premio en Ruleta</th>
                <th>Valor / Etiqueta</th>
                <th>Probabilidad (%)</th>
                <th>Color HEX</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody id="roulette-rows">
              ${s.prizes.map((p, idx) => `
                <tr data-prize-id="${p.id || 'p' + (idx + 1)}">
                  <td style="font-weight: 700; color: #fbbf24;">#${idx + 1}</td>
                  <td>
                    <input type="text" class="form-input prize-name" value="${p.name}" style="padding: 6px 10px; font-size: 11px;" />
                  </td>
                  <td>
                    <input type="text" class="form-input prize-value" value="${p.value || ''}" style="width: 100px; padding: 6px 10px; font-size: 11px;" />
                  </td>
                  <td>
                    <input type="number" min="0" max="100" class="form-input prize-prob" value="${p.probability}" style="width: 80px; padding: 6px 10px; font-size: 11px; font-weight: 700;" onchange="updateRouletteSum()" onkeyup="updateRouletteSum()" />
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <input type="color" class="prize-color-picker" value="${p.color}" onchange="this.nextElementSibling.value = this.value" style="width: 28px; height: 28px; border: none; background: transparent; cursor: pointer;" />
                      <input type="text" class="form-input prize-color" value="${p.color}" style="width: 80px; padding: 4px 8px; font-family: monospace; font-size: 10px;" />
                    </div>
                  </td>
                  <td>
                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                      <input type="checkbox" class="prize-active" ${p.active !== false ? 'checked' : ''} />
                      <span style="font-size: 11px;">Activo</span>
                    </label>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 5: TARJETA DE SELLOS & SELECTOR DE ICONOS                         -->
    <!-- ========================================================================= -->
    <div id="tab-stamps" class="tab-content">
      <!-- GUÍA RÁPIDA -->
      <div class="quick-guide-box">
        <div class="quick-guide-header">
          <span>💡</span>
          <span>Guía Rápida: Tarjeta de 15 Sellos & Recompensas por Visita</span>
        </div>
        <div class="quick-guide-grid">
          <div class="quick-guide-item">
            <strong>🎟️ Premios en Visitas 5, 10 y 15</strong>
            <span>La tarjeta premia a los comensales cada 5 visitas para maximizar la tasa de retorno al restaurante.</span>
          </div>
          <div class="quick-guide-item">
            <strong>⚡ Horas Muertas (3 a 6 PM)</strong>
            <span>El multiplicador x2 de sellos motiva visitas en las tardes de bajo tráfico de forma autónoma.</span>
          </div>
          <div class="quick-guide-item">
            <strong>☕ Icono de Marca</strong>
            <span>Elige el emoji que mejor represente tu gastronomía (café, croissant, postre, pizza, etc.).</span>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>🎟️ Tarjeta de 15 Sellos & Selector de Iconos de Recompensa</span>
          </div>
          <div>
            <span id="toast-stamps" class="toast-success">✓ ¡Iconos y sellos guardados!</span>
            <button class="btn-save" onclick="saveStampsConfig()">💾 Guardar Tarjeta de Sellos</button>
          </div>
        </div>

        <!-- SELECTOR DE ICONO DE VISITA INTERMEDIA -->
        <div style="background: #0b0f19; border: 1px solid var(--card-border); border-radius: 14px; padding: 16px; margin-bottom: 20px;">
          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span id="stamp-visit-icon-preview" style="font-size: 28px; width: 44px; height: 44px; border-radius: 12px; background: rgba(217, 119, 6, 0.15); border: 1px solid rgba(217, 119, 6, 0.4); display: flex; align-items: center; justify-content: center;">
                ${s.stamps.visitIcon || '☕'}
              </span>
              <div>
                <h4 style="font-size: 13px; font-weight: 700; color: #fff;">Icono de Visitas Intermedias (Sellos 1-4, 6-9, 11-14)</h4>
                <p style="font-size: 11px; color: var(--text-muted);">Adapta la tarjeta al giro de tu negocio (Café, Panadería, Pizzería, Bar, Mascotas, etc.).</p>
              </div>
            </div>

            <input type="text" id="stamp-visit-icon" class="form-input" value="${s.stamps.visitIcon || '☕'}" maxlength="4" style="width: 60px; text-align: center; font-size: 18px;" onkeyup="document.getElementById('stamp-visit-icon-preview').innerText = this.value || '☕'" />
          </div>

          <span class="form-help" style="margin-bottom: 8px;">Paleta de Iconos Rápidos para Visitas:</span>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${[
              { icon: "☕", label: "Café" },
              { icon: "🥐", label: "Pan" },
              { icon: "🍪", label: "Galleta" },
              { icon: "🧁", label: "Muffin" },
              { icon: "🍔", label: "Burger" },
              { icon: "🍕", label: "Pizza" },
              { icon: "🌮", label: "Tacos" },
              { icon: "🍹", label: "Bar" },
              { icon: "🐾", label: "Mascotas" },
              { icon: "⭐", label: "Estrella" },
              { icon: "🏷️", label: "Comercio" },
              { icon: "✨", label: "Magia" },
            ].map(p => `
              <button type="button" class="icon-preset-btn ${s.stamps.visitIcon === p.icon ? 'active' : ''}" onclick="selectVisitIconPreset('${p.icon}')">
                <span>${p.icon}</span>
                <span style="font-size: 10px; color: var(--text-muted);">${p.label}</span>
              </button>
            `).join("")}
          </div>
        </div>

        <!-- LOS 3 GRANDES HITOS DE PREMIOS (SELLOS 5, 10 Y 15) -->
        <h4 style="font-size: 13px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
          🎁 Los 3 Grandes Hitos de Premios (Sellos #5, #10 y #15)
        </h4>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${(s.stamps.milestones || []).map((m, idx) => `
            <div style="background: #0f1626; border: 1px solid rgba(217, 119, 6, 0.35); border-radius: 14px; padding: 16px;" data-milestone-index="${idx}">
              <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="background: #f59e0b; color: #000; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 6px;">SELLO #${m.stamp}</span>
                  <span id="m-icon-preview-${idx}" style="font-size: 20px;">${m.icon || '🎁'}</span>
                  <strong style="color: #fff; font-size: 13px;">${m.title}</strong>
                </div>
                <span style="font-size: 11px; color: #fbbf24; font-weight: 700;">Hito de Recompensa Exclusivo</span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div>
                  <label class="form-label">Icono del Premio:</label>
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                    <input type="text" id="m-icon-${idx}" class="form-input" value="${m.icon || '🎁'}" maxlength="4" style="width: 50px; text-align: center; font-size: 16px;" onkeyup="document.getElementById('m-icon-preview-${idx}').innerText = this.value || '🎁'" />
                    <span style="font-size: 11px; color: #6b7280;">Emoji o símbolo</span>
                  </div>
                  <!-- Presets para este hito -->
                  <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                    ${(idx === 0
                      ? ["🍰", "🧁", "🍪", "🥐", "☕", "🎁", "🍩", "🍦"]
                      : idx === 1
                      ? ["👑", "🍔", "🍕", "🥗", "🍹", "🏆", "🥪", "🍳"]
                      : ["🌟", "🥂", "🍾", "🍽️", "🎂", "💎", "🎖️", "🍷"]
                    ).map(e => `
                      <button type="button" class="icon-preset-btn" style="padding: 3px 6px; font-size: 13px;" onclick="document.getElementById('m-icon-${idx}').value = '${e}'; document.getElementById('m-icon-preview-${idx}').innerText = '${e}';">
                        ${e}
                      </button>
                    `).join("")}
                  </div>
                </div>

                <div style="grid-column: span 2;">
                  <label class="form-label">Título del Premio:</label>
                  <input type="text" id="m-title-${idx}" class="form-input" value="${m.title}" />
                </div>

                <div style="grid-column: 1 / -1;">
                  <label class="form-label">Descripción del Beneficio:</label>
                  <input type="text" id="m-desc-${idx}" class="form-input" value="${m.description}" />
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 6: BASES DE DATOS (GOOGLE SHEETS & SUPABASE)                      -->
    <!-- ========================================================================= -->
    <div id="tab-databases" class="tab-content">
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>🗄️ Sincronización Dual: Google Sheets & Supabase</span>
          </div>
          <div>
            <span id="toast-databases" class="toast-success">✓ ¡Bases de datos guardadas!</span>
            <button class="btn-save" onclick="saveDatabasesConfig()">💾 Guardar Bases de Datos</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
          <!-- GOOGLE SHEETS -->
          <div style="background: #0b0f19; border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 14px; padding: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <strong style="color: #34d399; font-size: 13px; text-transform: uppercase;">Opción 1: Google Sheets</strong>
              <span style="font-size: 10px; background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 2px 8px; border-radius: 6px; font-weight: 700;">Costo $0 · Webhook</span>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
              Envía cada ruleta jugada y cada canje con PIN a una hoja de Google Drive.
            </p>
            <div class="form-group">
              <label class="form-label">URL del Webhook de Apps Script:</label>
              <input type="url" id="db-sheets-url" class="form-input" value="${s.databases.googleSheetWebhookUrl || ''}" placeholder="https://script.google.com/macros/s/.../exec" />
            </div>
          </div>

          <!-- SUPABASE -->
          <div style="background: #0b0f19; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 14px; padding: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <strong style="color: #38bdf8; font-size: 13px; text-transform: uppercase;">Opción 2: Supabase (PostgreSQL)</strong>
              <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                <input type="checkbox" id="db-sb-enabled" ${s.databases.supabaseEnabled ? 'checked' : ''} />
                <span style="color: #38bdf8; font-weight: 700; font-size: 11px;">Habilitar</span>
              </label>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
              Base de datos SQL profesional en la nube para sincronización en tiempo real.
            </p>
            <div class="form-group">
              <label class="form-label">Supabase Project URL:</label>
              <input type="url" id="db-sb-url" class="form-input" value="${s.databases.supabaseProjectUrl || ''}" placeholder="https://xyz.supabase.co" />
            </div>
            <div class="form-group">
              <label class="form-label">Supabase Anon Key:</label>
              <input type="text" id="db-sb-key" class="form-input" value="${s.databases.supabaseAnonKey || ''}" placeholder="eyJhbGciOi..." />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 7: COMPOSIO & AUTOMATIZACIONES IA                                 -->
    <!-- ========================================================================= -->
    <div id="tab-composio" class="tab-content">
      <!-- GUÍA RÁPIDA -->
      <div class="quick-guide-box">
        <div class="quick-guide-header">
          <span>💡</span>
          <span>Guía Rápida: Integración con Composio.dev & IA</span>
        </div>
        <div class="quick-guide-grid">
          <div class="quick-guide-item">
            <strong>⚡ Conexión a 200+ Apps</strong>
            <span>Conecta WhatsApp, Gmail, Slack, CRM y bases de datos usando tu API Key de Composio.</span>
          </div>
          <div class="quick-guide-item">
            <strong>🤖 Agentes Inteligentes</strong>
            <span>Sincroniza el menú, los premios y la marca con bots para atención automatizada.</span>
          </div>
          <div class="quick-guide-item">
            <strong>🔗 Webhooks Sin Código</strong>
            <span>Recibe notificaciones en tiempo real cuando un comensal gana o canjea un premio en caja.</span>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>⚡ Composio.dev · Conector de Inteligencia Artificial & Automatización</span>
          </div>
          <div>
            <span id="toast-composio" class="toast-success">✓ ¡Configuración Composio guardada!</span>
            <button class="btn-save" onclick="saveComposioBackendConfig()">💾 Guardar Composio</button>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(11, 15, 25, 0.9) 100%); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 32px;">⚡</span>
              <div>
                <strong style="color: #fbbf24; font-size: 15px; text-transform: uppercase;">Integración Oficial con Composio.dev</strong>
                <p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                  Conecta tu negocio gastronómico con más de 100 herramientas sin código (Google Sheets, Contacts, WhatsApp Oficial, Correo y CRM).
                </p>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span id="comp-status-badge" style="font-size: 11px; padding: 4px 12px; border-radius: 20px; font-weight: 700; ${s.composio && s.composio.enabled ? 'background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4);' : 'background: rgba(107, 114, 128, 0.2); color: var(--text-muted); border: 1px solid rgba(107, 114, 128, 0.4);'}">
                ${s.composio && s.composio.enabled ? '🟢 Conectado con Composio.dev' : '⚪ Sin conectar'}
              </span>
              <button onclick="connectComposioNow()" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000; font-weight: 800; font-size: 11px; text-transform: uppercase; padding: 9px 16px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);">
                ⚡ Conectar con Composio.dev
              </button>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 16px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Composio API Key:</label>
              <input type="password" id="comp-api-key" class="form-input" value="${(s.composio && s.composio.apiKey) || ''}" placeholder="comp_live_..." />
              <span class="form-help">Consigue tu llave gratis en <a href="https://composio.dev" target="_blank" style="color: #fbbf24; text-decoration: underline;">composio.dev</a>.</span>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Webhook Fallback (Google Apps Script):</label>
              <input type="url" id="comp-webhook-url" class="form-input" value="${(s.composio && s.composio.endpoints && s.composio.endpoints.googleSheetWebhookUrl) || s.databases.googleSheetWebhookUrl || ''}" placeholder="https://script.google.com/macros/s/.../exec" />
              <span class="form-help">Webhook alternativo gratuito para sincronización directa a hojas de cálculo.</span>
            </div>
          </div>

          <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.08);">
            <strong style="color: #fff; font-size: 12px; display: block; margin-bottom: 10px;">Herramientas Automatizadas Activas:</strong>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;">
              <label style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--card-border); cursor: pointer;">
                <input type="checkbox" id="comp-tool-sheets" ${s.composio && s.composio.integrations && s.composio.integrations.googleSheets ? 'checked' : ''} />
                <span style="font-size: 12px; color: #fff;">📗 Google Sheets en Vivo</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--card-border); cursor: pointer;">
                <input type="checkbox" id="comp-tool-contacts" ${s.composio && s.composio.integrations && s.composio.integrations.googleContacts ? 'checked' : ''} />
                <span style="font-size: 12px; color: #fff;">👤 Google Contacts Auto</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--card-border); cursor: pointer;">
                <input type="checkbox" id="comp-tool-wa" ${s.composio && s.composio.integrations && s.composio.integrations.whatsAppAutoSend ? 'checked' : ''} />
                <span style="font-size: 12px; color: #fff;">💬 WhatsApp Notificación</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--card-border); cursor: pointer;">
                <input type="checkbox" id="comp-tool-email" ${s.composio && s.composio.integrations && s.composio.integrations.dailyEmailSummary ? 'checked' : ''} />
                <span style="font-size: 12px; color: #fff;">✉️ Resumen Diario Email</span>
              </label>
            </div>
          </div>

          <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
            <button onclick="testComposioSync()" style="background: #F8FAFC; color: var(--text); font-size: 11px; padding: 7px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); cursor: pointer;">
              🚀 Disparar Evento de Prueba a Composio
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA: CONEXIÓN OFICIAL CON HERMES (AGENTE IA, CRM, POS & WEBHOOK)      -->
    <!-- ========================================================================= -->
    <div id="tab-hermes" class="tab-content">
      <!-- GUÍA RÁPIDA -->
      <div class="quick-guide-box">
        <div class="quick-guide-header">
          <span>🤖</span>
          <span>Guía Rápida: Conexión del Backend con Hermes (Agente IA, CRM & POS)</span>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">
          Conecta el ecosistema de tu restaurante con Hermes para sincronizar en tiempo real cupones, comensales, pedidos y validaciones con agentes inteligentes o plataformas de gestión.
        </div>
        <div class="quick-guide-grid">
          <div class="quick-guide-item">
            <strong>🤖 Agente Autónomo Hermes</strong>
            <span>Atención automatizada 24/7, consulta de saldo de sellos VIP y asesoría de postres por IA.</span>
          </div>
          <div class="quick-guide-item">
            <strong>💬 Hermes CRM & WhatsApp</strong>
            <span>Sincronización bidireccional de números de comensales, historial de visitas y etiquetas VIP.</span>
          </div>
          <div class="quick-guide-item">
            <strong>🛒 Hermes POS & Facturación</strong>
            <span>Validación de cupones con PIN en caja y registro de ventas vinculado a la tarjeta de sellos.</span>
          </div>
          <div class="quick-guide-item">
            <strong>⚡ Webhook Bidireccional</strong>
            <span>Notificación en milisegundos cuando un cliente gana un premio, canjea en mesa o califica.</span>
          </div>
        </div>
      </div>

      <!-- ESTADO DE CONEXIÓN CON HERMES (HERMES STATUS CARD) -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-title">Estado del Enlace Hermes</span>
          <span id="hermesStatusBadge" class="stat-value" style="color: ${hermes.enabled !== false ? '#059669' : '#d97706'}; font-size: 19px;">
            ${hermes.enabled !== false ? '🟢 ACTIVO & CONECTADO' : '⏸️ PAUSADO'}
          </span>
          <span class="stat-sub">Modo: ${hermes.mode === 'agent' ? 'Agente IA' : hermes.mode === 'crm' ? 'CRM WhatsApp' : hermes.mode === 'pos' ? 'Punto de Venta' : 'Webhook'}</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Latencia del Servidor</span>
          <span id="hermesLatencyVal" class="stat-value" style="color: var(--accent);">${hermes.stats?.lastLatencyMs || 38}ms</span>
          <span id="hermesLastPingVal" class="stat-sub">Último ping: ${hermes.lastPing || 'En vivo'}</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Pings / Diagnósticos</span>
          <span id="hermesPingsVal" class="stat-value" style="color: var(--info);">${hermes.stats?.totalPings || 12}</span>
          <span class="stat-sub">Verificaciones exitosas</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Eventos Despachados</span>
          <span id="hermesEventsVal" class="stat-value" style="color: #8b5cf6;">${hermes.stats?.eventsDispatched || 24}</span>
          <span class="stat-sub">Cupones y visitas sincronizadas</span>
        </div>
      </div>

      <!-- PANEL PRINCIPAL DE CONFIGURACIÓN HERMES -->
      <div class="panel" style="border: 2px solid var(--accent); background: linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%);">
        <div class="panel-header" style="flex-wrap: wrap; gap: 10px; border-bottom: 1px solid rgba(162, 126, 44, 0.2); padding-bottom: 14px; margin-bottom: 16px;">
          <div>
            <div class="panel-title" style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 24px;">🤖</span>
              <span style="font-weight: 800; font-size: 16px; color: var(--text);">Parámetros de Integración con Hermes</span>
              <span style="font-size: 11px; background: rgba(16, 185, 129, 0.12); color: #059669; border: 1px solid rgba(16, 185, 129, 0.3); padding: 3px 10px; border-radius: 9999px; font-weight: 700;">
                REST & WEBHOOK READY
              </span>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
              Configura las credenciales de tu servidor o Agente Hermes para permitir intercambio de datos seguro y automático.
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button type="button" class="btn-secondary" onclick="testHermesConnection()" style="font-size: 11.5px; padding: 7px 12px; border-color: var(--accent); color: var(--accent); font-weight: 700;">
              ⚡ Probar Ping con Hermes
            </button>
            <span id="toast-hermes" class="toast-success">✓ ¡Configuración de Hermes guardada!</span>
            <button type="button" class="btn-save" onclick="saveHermesConfig()">💾 Guardar Hermes</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px;">
          <!-- 1. Estado -->
          <div class="form-group">
            <label class="form-label">Estado de la Conexión con Hermes</label>
            <select id="hermesEnabled" class="form-input">
              <option value="true" ${hermes.enabled !== false ? 'selected' : ''}>✅ ACTIVO — Conexión y sincronización habilitada</option>
              <option value="false" ${hermes.enabled === false ? 'selected' : ''}>⏸️ PAUSADO — No enviar eventos a Hermes</option>
            </select>
            <span class="form-help">Habilita o pausa el intercambio de eventos en tiempo real</span>
          </div>

          <!-- 2. Modo de Conexión Hermes -->
          <div class="form-group">
            <label class="form-label">Tipo de Sistema Hermes a Conectar</label>
            <select id="hermesMode" class="form-input">
              <option value="agent" ${hermes.mode === 'agent' ? 'selected' : ''}>🤖 Hermes Agent (Agente Autónomo de IA & Tareas)</option>
              <option value="crm" ${hermes.mode === 'crm' ? 'selected' : ''}>💬 Hermes CRM / WhatsApp Omnicanal</option>
              <option value="pos" ${hermes.mode === 'pos' ? 'selected' : ''}>🛒 Hermes POS / Sistema de Punto de Venta & Caja</option>
              <option value="webhook" ${hermes.mode === 'webhook' ? 'selected' : ''}>🔗 Hermes Custom Webhook Endpoint</option>
            </select>
            <span class="form-help">Define el protocolo y tipo de datos a intercambiar con Hermes</span>
          </div>

          <!-- 3. API URL -->
          <div class="form-group">
            <label class="form-label">URL del Servidor o Endpoint de Hermes *</label>
            <input type="text" id="hermesApiUrl" class="form-input" value="${(hermes.apiUrl || 'https://api.hermes.ai/v1').replace(/"/g, '&quot;')}" placeholder="https://api.hermes.ai/v1 o URL de tu servidor" style="font-family: monospace; font-size: 12px;" />
            <span class="form-help">Dirección REST donde Hermes recibe las solicitudes de tu restaurante</span>
          </div>

          <!-- 4. API Key / Token -->
          <div class="form-group">
            <label class="form-label">API Key / Token de Acceso de Hermes *</label>
            <input type="password" id="hermesApiKey" class="form-input" value="${(hermes.apiKey || 'hermes_live_key_9824').replace(/"/g, '&quot;')}" placeholder="hermes_sec_..." style="font-family: monospace; font-size: 12px;" />
            <span class="form-help">Token secreto para autenticar las peticiones seguras</span>
          </div>

          <!-- 5. Agent ID -->
          <div class="form-group">
            <label class="form-label">Identificador de Agente o Sucursal (Agent ID)</label>
            <input type="text" id="hermesAgentId" class="form-input" value="${(hermes.agentId || 'hermes-agent-pos').replace(/"/g, '&quot;')}" placeholder="Ej. hermes-agent-pos" style="font-family: monospace; font-size: 12px;" />
            <span class="form-help">ID único de la instancia o bot de Hermes asignado a este restaurante</span>
          </div>

          <!-- 6. Webhook Receptor Local -->
          <div class="form-group">
            <label class="form-label">Webhook Receptor en este Backend (Para Hermes)</label>
            <div style="display: flex; gap: 6px;">
              <input type="text" id="hermesWebhookUrl" class="form-input" value="http://localhost:3001/api/integrations/hermes/webhook" readonly style="font-family: monospace; font-size: 11px; background: #F8FAFC;" />
              <button type="button" class="btn-secondary" onclick="copyHermesWebhook()" style="font-size: 11px; padding: 6px 10px; white-space: nowrap;">📋 Copiar</button>
            </div>
            <span class="form-help">Configura esta URL en Hermes para que te envíe actualizaciones</span>
          </div>
        </div>

        <!-- CHECKLIST DE EVENTOS A SINCRONIZAR CON HERMES -->
        <div style="margin-top: 20px; padding: 16px; background: #FFFFFF; border: 1px solid var(--card-border); border-radius: 12px;">
          <strong style="color: var(--text); font-size: 13px; display: block; margin-bottom: 4px;">
            📡 Eventos Automáticos a Despachar hacia Hermes:
          </strong>
          <span style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 12px;">
            Selecciona qué eventos del juego de fidelización se enviarán automáticamente a Hermes en segundo plano:
          </span>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text); cursor: pointer;">
              <input type="checkbox" id="hermes_ev_prizes" ${hermes.events?.syncPrizes !== false ? 'checked' : ''} style="accent-color: #059669; width: 16px; height: 16px;" />
              <span>🎁 Nuevo Premio Ganado (Ruleta / Reto 10s)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text); cursor: pointer;">
              <input type="checkbox" id="hermes_ev_pin" ${hermes.events?.syncPinRedemption !== false ? 'checked' : ''} style="accent-color: #059669; width: 16px; height: 16px;" />
              <span>🔐 Canje de Cupón con PIN en Caja</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text); cursor: pointer;">
              <input type="checkbox" id="hermes_ev_customers" ${hermes.events?.syncCustomers !== false ? 'checked' : ''} style="accent-color: #059669; width: 16px; height: 16px;" />
              <span>👥 Registro de Comensal & Sellos de Fidelidad</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text); cursor: pointer;">
              <input type="checkbox" id="hermes_ev_reputation" ${hermes.events?.syncReputation !== false ? 'checked' : ''} style="accent-color: #059669; width: 16px; height: 16px;" />
              <span>⭐ Calificaciones de Google & Sugerencias</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text); cursor: pointer;">
              <input type="checkbox" id="hermes_ev_missions" ${hermes.events?.syncMissions !== false ? 'checked' : ''} style="accent-color: #059669; width: 16px; height: 16px;" />
              <span>🎯 Misiones y Evidencias de Embajadores</span>
            </label>
          </div>
        </div>

        <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div id="hermesTestResult" style="font-size: 12px; font-weight: 700; color: #059669; display: none;">
            ✓ Conexión con Hermes verificada exitosamente
          </div>
          <div style="display: flex; gap: 8px; margin-left: auto;">
            <button type="button" class="btn-secondary" onclick="testHermesConnection()">⚡ Probar Ping con Hermes</button>
            <button type="button" class="btn-save" onclick="saveHermesConfig()">💾 Guardar Configuración Hermes</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 8: SEGURIDAD, PINS & PERMISOS DE ROLES                            -->
    <!-- ========================================================================= -->
    <div id="tab-security" class="tab-content">
      <!-- GUÍA RÁPIDA -->
      <div class="quick-guide-box">
        <div class="quick-guide-header">
          <span>💡</span>
          <span>Guía Rápida: Control de Acceso por Roles (RBAC 3 Niveles)</span>
        </div>
        <div class="quick-guide-grid">
          <div class="quick-guide-item">
            <strong>👑 Dueño Master (8888)</strong>
            <span>Control total de marca, finanzas, probabilidades, roles y conexión con bases de datos.</span>
          </div>
          <div class="quick-guide-item">
            <strong>👔 Administrador / Gerente (5555)</strong>
            <span>Gestión operativa diaria, métricas de ventas y canales según los permisos concedidos.</span>
          </div>
          <div class="quick-guide-item">
            <strong>💼 Cajero de Turno (1978)</strong>
            <span>Validación rápida de cupones y asignación de sellos en caja en el momento del pago.</span>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>🔐 Seguridad de Caja & Control de Acceso por Roles (PINs & Permisos)</span>
          </div>
          <div>
            <span id="toast-security" class="toast-success">✓ ¡Permisos y PINs guardados!</span>
            <button class="btn-save" onclick="saveSecurityConfig()">💾 Guardar Permisos y PINs</button>
          </div>
        </div>

        <!-- 3 TARJETAS DE PINS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 20px;">
          <!-- 1. DUEÑO -->
          <div style="background: #0b0f19; border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 14px; padding: 18px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">👑</span>
                <strong style="color: #fbbf24; font-size: 13px;">Dueño Master</strong>
              </div>
              <span style="font-size: 9px; background: rgba(245, 158, 11, 0.2); color: #fbbf24; padding: 2px 6px; border-radius: 4px; font-weight: 700;">TOTAL</span>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
              Acceso sin restricciones a todas las secciones y potestad para asignar permisos.
            </p>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">PIN Dueño (4 dígitos):</label>
              <input type="text" id="sec-master-pin" class="form-input" value="${s.security.masterAdminPin || '8888'}" maxlength="4" style="font-family: monospace; font-size: 18px; letter-spacing: 0.2em; text-align: center; width: 140px;" />
            </div>
          </div>

          <!-- 2. ADMINISTRADOR -->
          <div style="background: #0b0f19; border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 14px; padding: 18px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">👔</span>
                <strong style="color: #818cf8; font-size: 13px;">Administrador / Gerente</strong>
              </div>
              <span style="font-size: 9px; background: rgba(99, 102, 241, 0.2); color: #818cf8; padding: 2px 6px; border-radius: 4px; font-weight: 700;">GERENTE</span>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
              Encargado de operaciones con permisos delegados por el Dueño.
            </p>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">PIN Administrador (4 dígitos):</label>
              <input type="text" id="sec-manager-pin" class="form-input" value="${s.security.managerAdminPin || '5555'}" maxlength="4" style="font-family: monospace; font-size: 18px; letter-spacing: 0.2em; text-align: center; width: 140px;" />
            </div>
          </div>

          <!-- 3. CAJERO -->
          <div style="background: #0b0f19; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 14px; padding: 18px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">💼</span>
                <strong style="color: #38bdf8; font-size: 13px;">Cajero / Turno</strong>
              </div>
              <span style="font-size: 9px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-weight: 700;">OPERATIVO</span>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
              Permite validar cupones en mesa y registrar visitas con sellos.
            </p>
            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="text" id="sec-cashier-pin" class="form-input" value="${s.security.cashierPin || '1978'}" maxlength="4" style="font-family: monospace; font-size: 18px; letter-spacing: 0.2em; text-align: center; width: 120px;" />
              <button type="button" onclick="rotateCashierPin()" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 8px 12px; font-size: 11px; font-weight: 700; cursor: pointer;">
                🔄 Rotar
              </button>
            </div>
          </div>
        </div>

        <!-- MATRIZ INTERACTIVA DE PERMISOS -->
        <div style="background: #0b0f19; border: 1px solid var(--card-border); border-radius: 14px; padding: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div>
              <strong style="color: var(--text); font-size: 13px; text-transform: uppercase;">Matriz de Asignación de Permisos</strong>
              <p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                El Dueño Master decide qué módulos puede ver y editar el Administrador y el Cajero.
              </p>
            </div>
            <span style="font-size: 10px; background: rgba(245, 158, 11, 0.15); color: #fbbf24; padding: 3px 10px; border-radius: 12px; font-weight: 700;">
              👑 Configurado por el Propietario
            </span>
          </div>

          <div style="overflow-x: auto;">
            <table class="data-table" style="width: 100%;">
              <thead>
                <tr>
                  <th style="width: 45%;">Módulo / Funcionalidad</th>
                  <th style="text-align: center; width: 18%;">👑 Dueño Master</th>
                  <th style="text-align: center; width: 18%;">👔 Administrador</th>
                  <th style="text-align: center; width: 18%;">💼 Cajero / Turno</th>
                </tr>
              </thead>
              <tbody>
                ${[
                  { id: "viewMetrics", name: "Métricas en Vivo e Historial", desc: "Ver ventas, KPIs y cupones" },
                  { id: "redeemPrizes", name: "Validación de Premios & Sellos", desc: "Canjear códigos y sumar sellos con PIN" },
                  { id: "manageChannels", name: "Canales (WhatsApp & Redes)", desc: "Ajustar números y mensajes oficiales" },
                  { id: "manageRoulette", name: "Ruleta & Probabilidades (%)", desc: "Modificar premios y matemática de la ruleta" },
                  { id: "manageStamps", name: "Catálogo de 15 Sellos", desc: "Editar premios en hitos 5, 10 y 15" },
                  { id: "manageBrand", name: "Identidad & Marca Blanca", desc: "Logo, colores y nombre de marca" },
                  { id: "manageDatabases", name: "Bases de Datos (Sheets & Supabase)", desc: "Configurar tablas y credenciales" },
                  { id: "manageComposio", name: "Composio.dev & Automatizaciones", desc: "Conectar IA, WhatsApp oficial y Sheets" },
                ].map(p => `
                  <tr>
                    <td>
                      <strong style="color: var(--text); font-size: 12px;">${p.name}</strong>
                      <span style="display: block; font-size: 10px; color: var(--text-muted);">${p.desc}</span>
                    </td>
                    <td style="text-align: center; color: #fbbf24; font-weight: 700; font-size: 12px;">
                      ✓ Acceso Total
                    </td>
                    <td style="text-align: center;">
                      <input type="checkbox" id="perm-admin-${p.id}" ${s.security.roles && s.security.roles.admin && s.security.roles.admin[p.id] ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; accent-color: #6366f1;" />
                    </td>
                    <td style="text-align: center;">
                      <input type="checkbox" id="perm-cashier-${p.id}" ${s.security.roles && s.security.roles.cashier && s.security.roles.cashier[p.id] ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; accent-color: #38bdf8;" />
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 9: MARKETING PUSH & OFERTAS ONESIGNAL                             -->
    <!-- ========================================================================= -->
    <div id="tab-push" class="tab-content">
      <!-- GUÍA RÁPIDA -->
      <div class="quick-guide-box">
        <div class="quick-guide-header">
          <span>💡</span>
          <span>Guía Rápida: Ofertas Push Masivas & Flujos OneSignal</span>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">
          Envía notificaciones web push instantáneas a los navegadores y teléfonos de los comensales, o activa campañas automatizadas sin tocar código.
        </div>
        <div class="quick-guide-grid">
          <div class="quick-guide-item">
            <strong>🚀 Envíos Inmediatos (1-Clic)</strong>
            <span>Usa las plantillas preparadas para lanzar promociones en horas de baja afluencia.</span>
          </div>
          <div class="quick-guide-item">
            <strong>⚡ 4 Flujos Automatizados</strong>
            <span>Bienvenida (6 min), Urgencia 24h, Reactivación 14 días y Happy Hour 3 a 6 PM.</span>
          </div>
          <div class="quick-guide-item">
            <strong>📡 OneSignal REST API</strong>
            <span>Conecta tu App ID y REST API Key para entrega inmediata garantizada.</span>
          </div>
          <div class="quick-guide-item">
            <strong>🔗 Webhooks & Composio</strong>
            <span>Envía cada campaña a n8n, Make o agentes de IA para difusión omnicanal.</span>
          </div>
        </div>
      </div>

      <!-- FORMULARIO DE ENVÍO MASIVO 1-CLIC -->
      <div class="panel" style="margin-bottom: 20px;">
        <div class="panel-header">
          <div class="panel-title">
            <span>🚀 Envío de Oferta Masiva Instantánea (Web Push)</span>
          </div>
          <span class="badge-role" style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);">
            1-CLIC BROADCAST
          </span>
        </div>

        <div style="margin-bottom: 14px;">
          <span style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
            Plantillas Rápidas (Haz clic para rellenar formulario):
          </span>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
            <button type="button" class="btn-secondary" style="text-align: left; padding: 10px 12px; cursor: pointer;" onclick="loadPushTemplate('happy_hour')">
              <strong style="color: #fbbf24; font-size: 11px; display: block;">⚡ Happy Hour 2x1 (3 a 6 PM)</strong>
              <span style="color: #6b7280; font-size: 10px;">Sellos dobles y bebidas 2x1</span>
            </button>
            <button type="button" class="btn-secondary" style="text-align: left; padding: 10px 12px; cursor: pointer;" onclick="loadPushTemplate('dessert')">
              <strong style="color: #f472b6; font-size: 11px; display: block;">🍰 Postre de Cortesía</strong>
              <span style="color: #6b7280; font-size: 10px;">Válido hoy con consumo en mesa</span>
            </button>
            <button type="button" class="btn-secondary" style="text-align: left; padding: 10px 12px; cursor: pointer;" onclick="loadPushTemplate('flash')">
              <strong style="color: #f87171; font-size: 11px; display: block;">⏳ Cupón Flash 50% Off</strong>
              <span style="color: #6b7280; font-size: 10px;">Válido exclusivamente hoy</span>
            </button>
            <button type="button" class="btn-secondary" style="text-align: left; padding: 10px 12px; cursor: pointer;" onclick="loadPushTemplate('stamps')">
              <strong style="color: #34d399; font-size: 11px; display: block;">🌟 Doble Sello Fin de Semana</strong>
              <span style="color: #6b7280; font-size: 10px;">Acelera la tarjeta de 15 sellos</span>
            </button>
          </div>
        </div>

        <form id="form-push-broadcast" onsubmit="sendBroadcastPush(event)">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div class="form-group" style="grid-column: span 2;">
              <label class="form-label">Título de la Notificación Push</label>
              <input type="text" id="pushTitle" class="form-input" value="⚡ ¡Happy Hour 2x1 en Café y Especialidades!" required>
            </div>
            <div class="form-group">
              <label class="form-label">Segmento Destino</label>
              <select id="pushSegment" class="form-input">
                <option value="Subscribed Users">Todos los Suscriptores</option>
                <option value="Active Customers">Clientes Frecuentes (+5 sellos)</option>
                <option value="Inactive Customers">Clientes Inactivos (+14 días)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Mensaje / Cuerpo de la Notificación</label>
            <textarea id="pushBody" class="form-input" rows="2" style="resize: vertical;" required>¡Hola! Hoy de 3:00 a 6:00 PM acumula el DOBLE de sellos y disfruta 2x1 en bebidas de autor. ¡Muestra este mensaje en caja!</textarea>
            <!-- BOTONES DE VARIABLES DINÁMICAS -->
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">
              <span style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Variables:</span>
              <button type="button" class="btn-secondary" style="padding: 2px 8px; font-size: 10px; font-family: monospace;" onclick="insertPushTag('{nombre}')">+ {nombre}</button>
              <button type="button" class="btn-secondary" style="padding: 2px 8px; font-size: 10px; font-family: monospace;" onclick="insertPushTag('{premio}')">+ {premio}</button>
              <button type="button" class="btn-secondary" style="padding: 2px 8px; font-size: 10px; font-family: monospace;" onclick="insertPushTag('{restaurante}')">+ {restaurante}</button>
              <button type="button" class="btn-secondary" style="padding: 2px 8px; font-size: 10px; font-family: monospace;" onclick="insertPushTag('{descuento}')">+ {descuento}</button>
              <button type="button" class="btn-secondary" style="padding: 2px 8px; font-size: 10px; font-family: monospace;" onclick="insertPushTag('{codigo}')">+ {codigo}</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">URL de Destino (Opcional - al hacer clic)</label>
            <input type="url" id="pushUrl" class="form-input" placeholder="http://localhost:5173">
          </div>

          <!-- PERSONALIZACIÓN DE ENVÍO: PROGRAMACIÓN Y CANALES -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--card-border);">
            <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 10px; border: 1px solid var(--card-border);">
              <label class="form-label" style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                <span>📅 Programación de Envío</span>
              </label>
              <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <button type="button" id="btnSchedImmediate" class="btn-secondary" style="flex: 1; padding: 6px; font-size: 11px; background: rgba(245, 158, 11, 0.2); border-color: #fbbf24; color: #fbbf24;" onclick="setPushScheduleMode('immediate')">⚡ Inmediato</button>
                <button type="button" id="btnSchedLater" class="btn-secondary" style="flex: 1; padding: 6px; font-size: 11px;" onclick="setPushScheduleMode('scheduled')">📅 Programar</button>
              </div>
              <input type="datetime-local" id="pushScheduledTime" class="form-input" style="display: none; font-size: 11px;">
            </div>

            <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 10px; border: 1px solid var(--card-border);">
              <label class="form-label" style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                <span>📡 Canales de Entrega</span>
              </label>
              <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #d1d5db;">
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" id="chanPush" checked> OneSignal Web Push (Pantalla & PC)
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" id="chanWebhook" checked> Webhook / Composio / Make / n8n
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" id="chanWhatsApp" checked> Previsualización WhatsApp
                </label>
              </div>
            </div>
          </div>

          <!-- BOTONES GUARDAR PLANTILLA Y ENVIAR -->
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--card-border);">
            <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 250px;">
              <input type="text" id="draftName" class="form-input" placeholder="Nombre plantilla (ej: Happy Hour)..." style="font-size: 11px; padding: 6px 10px;">
              <button type="button" class="btn-secondary" style="padding: 6px 12px; font-size: 11px; white-space: nowrap;" onclick="saveCurrentPushDraft()">💾 Guardar Plantilla</button>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span id="pushStatusMsg" style="font-size: 11px; color: var(--text-muted);"></span>
              <button type="submit" class="btn-save" style="background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #fff;">
                🚀 Enviar Notificación Masiva Ahora
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- PLANTILLAS Y OFERTAS GUARDADAS EN EL SISTEMA -->
      <div class="panel" style="margin-bottom: 20px;">
        <div class="panel-header">
          <div class="panel-title">
            <span>📋 Plantillas y Ofertas Guardadas en el Sistema</span>
          </div>
          <span class="badge-role" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24;">${(s.savedPushDrafts || []).length} GUARDADAS</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
          ${(s.savedPushDrafts || []).map(d => `
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--card-border); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                  <strong style="color: var(--text); font-size: 12px;">${d.name}</strong>
                  <span style="font-size: 9px; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.08); color: var(--text-muted);">${d.scheduleType === "scheduled" ? "📅 Programada" : "⚡ Inmediata"}</span>
                </div>
                <p style="color: #fbbf24; font-size: 11px; font-weight: 600; margin: 2px 0;">${d.title}</p>
                <p style="color: var(--text-muted); font-size: 11px; line-height: 1.4; margin: 4px 0 8px 0;">${d.body}</p>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px;">
                <span style="font-size: 9px; color: #6b7280;">${d.createdAt || "Plantilla"}</span>
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="btn-secondary" style="padding: 3px 8px; font-size: 10px; color: #fbbf24;" onclick='loadCustomDraft(${JSON.stringify(d.id)})'>📝 Cargar</button>
                  <button type="button" class="btn-secondary" style="padding: 3px 8px; font-size: 10px; color: #f87171;" onclick='deleteCustomDraft(${JSON.stringify(d.id)})'>🗑️</button>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- 4 FLUJOS AUTOMATIZADOS -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>⚡ 4 Flujos Automatizados por Comportamiento</span>
          </div>
          <span class="badge-role" style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border-color: rgba(168, 85, 247, 0.4);">
            AUTOMÁTICOS
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
          <!-- Flujo 1 -->
          <div style="background: #0b0f19; border: 1px solid var(--card-border); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: #34d399; font-size: 12px;">🎉 Bienvenida (6 min)</strong>
                <span class="badge-status-available">ACTIVO</span>
              </div>
              <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">Disparo automático 6 minutos después del primer juego en mesa.</p>
              <div style="font-size: 12px; color: #0f172a; background: #f8fafc; padding: 10px; border-radius: 8px; font-family: monospace; border: 1px solid #cbd5e1; line-height: 1.4; margin-bottom: 10px;">
                "¡Gracias por visitarnos! Tu primer sello ya está activo en tu tarjeta digital."
              </div>
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <button type="button" onclick="copyFlowMessage(this, '¡Gracias por visitarnos! Tu primer sello ya está activo en tu tarjeta digital.')" style="padding: 5px 12px; font-size: 11px; font-weight: 600; background: rgba(52, 211, 153, 0.15); border: 1px solid #34d399; color: #34d399; border-radius: 6px; cursor: pointer; transition: all 0.2s;">
                📋 Copiar Flujo
              </button>
            </div>
          </div>

          <!-- Flujo 2 -->
          <div style="background: #0b0f19; border: 1px solid var(--card-border); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: #fbbf24; font-size: 12px;">⏳ Urgencia Cupón (24h)</strong>
                <span class="badge-status-available">ACTIVO</span>
              </div>
              <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">Se envía 24h antes de que expire el beneficio de la ruleta.</p>
              <div style="font-size: 12px; color: #0f172a; background: #f8fafc; padding: 10px; border-radius: 8px; font-family: monospace; border: 1px solid #cbd5e1; line-height: 1.4; margin-bottom: 10px;">
                "¡Tu premio vence mañana! Ven hoy y disfrútalo en mesa antes de su caducidad."
              </div>
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <button type="button" onclick="copyFlowMessage(this, '¡Tu premio vence mañana! Ven hoy y disfrútalo en mesa antes de su caducidad.')" style="padding: 5px 12px; font-size: 11px; font-weight: 600; background: rgba(251, 191, 36, 0.15); border: 1px solid #fbbf24; color: #fbbf24; border-radius: 6px; cursor: pointer; transition: all 0.2s;">
                📋 Copiar Flujo
              </button>
            </div>
          </div>

          <!-- Flujo 3 -->
          <div style="background: #0b0f19; border: 1px solid var(--card-border); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: #c084fc; font-size: 12px;">☕ Reactivación (14 Días)</strong>
                <span class="badge-status-available">ACTIVO</span>
              </div>
              <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">Se envía a clientes que llevan 14 días sin visitarnos.</p>
              <div style="font-size: 12px; color: #0f172a; background: #f8fafc; padding: 10px; border-radius: 8px; font-family: monospace; border: 1px solid #cbd5e1; line-height: 1.4; margin-bottom: 10px;">
                "¡Te extrañamos! Esta semana recibe un postre artesanal sorpresa de cortesía con tu café."
              </div>
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <button type="button" onclick="copyFlowMessage(this, '¡Te extrañamos! Esta semana recibe un postre artesanal sorpresa de cortesía con tu café.')" style="padding: 5px 12px; font-size: 11px; font-weight: 600; background: rgba(192, 132, 252, 0.15); border: 1px solid #c084fc; color: #c084fc; border-radius: 6px; cursor: pointer; transition: all 0.2s;">
                📋 Copiar Flujo
              </button>
            </div>
          </div>

          <!-- Flujo 4 -->
          <div style="background: #0b0f19; border: 1px solid var(--card-border); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: #38bdf8; font-size: 12px;">⚡ Happy Hour (3 a 6 PM)</strong>
                <span class="badge-status-available">ACTIVO</span>
              </div>
              <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">Multiplicador automático x2 de sellos en horas muertas de Lunes a Jueves.</p>
              <div style="font-size: 12px; color: #0f172a; background: #f8fafc; padding: 10px; border-radius: 8px; font-family: monospace; border: 1px solid #cbd5e1; line-height: 1.4; margin-bottom: 10px;">
                "¡Tarde dulce! Hoy tus consumos suman 2 SELLOS en tu tarjeta de fidelización."
              </div>
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <button type="button" onclick="copyFlowMessage(this, '¡Tarde dulce! Hoy tus consumos suman 2 SELLOS en tu tarjeta de fidelización.')" style="padding: 5px 12px; font-size: 11px; font-weight: 600; background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; border-radius: 6px; cursor: pointer; transition: all 0.2s;">
                📋 Copiar Flujo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 10: CENTRO DE MISIONES & EMBAJADORES GOURMET                       -->
    <!-- ========================================================================= -->
    <div id="tab-missions" class="tab-content">
      <!-- GUÍA RÁPIDA -->
      <div class="quick-guide-box">
        <div class="quick-guide-header">
          <span>🎯</span>
          <span>Guía Rápida: Centro de Misiones & Embajadores Gourmet (Estilo Screpy)</span>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">
          Permite a los comensales acumular sellos adicionales para su tarjeta VIP realizando acciones virales desde su casa o teléfono (TikTok, Trustpilot, Facebook o WhatsApp).
        </div>
        <div class="quick-guide-grid">
          <div class="quick-guide-item">
            <strong>🎵 TikTok Review (+3 Sellos)</strong>
            <span>Los comensales suben un video probando un postre y pegan el enlace. Gran alcance viral.</span>
          </div>
          <div class="quick-guide-item">
            <strong>⭐ Trustpilot (+2 Sellos)</strong>
            <span>Genera autoridad y confianza en plataformas de opiniones externas verificadas.</span>
          </div>
          <div class="quick-guide-item">
            <strong>👥 Facebook (+1 Sello)</strong>
            <span>Recomendación directa en la Fanpage oficial o Check-in en el local con foto familiar.</span>
          </div>
          <div class="quick-guide-item">
            <strong>💬 Estados WhatsApp (+1 Sello)</strong>
            <span>Recomendación persona a persona en su círculo íntimo con foto del pedido.</span>
          </div>
        </div>
      </div>

      <!-- MÉTRICAS DE MISIONES Y EMBAJADORES (ESTILO SCREPY) -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-title">Misiones Disponibles</span>
          <span class="stat-value" style="color: var(--accent);">${missions.length}</span>
          <span class="stat-sub">TikTok, Trustpilot, Facebook y WhatsApp</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Máximo Sellos por Cliente</span>
          <span class="stat-value" style="color: #059669;">+7 Sellos</span>
          <span class="stat-sub">Equivale a casi la mitad de la tarjeta VIP</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Pendientes de Revisión</span>
          <span class="stat-value" style="color: #d97706;">${submissions.filter(s => s.status === 'PENDIENTE').length}</span>
          <span class="stat-sub">Esperando aprobación del administrador</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Misiones Aprobadas</span>
          <span class="stat-value" style="color: var(--info);">${submissions.filter(s => s.status === 'APROBADO').length}</span>
          <span class="stat-sub">Sellos acreditados a comensales</span>
        </div>
      </div>

      <!-- 👑 GRAN DESAFÍO EMBAJADOR: LISTA OFICIAL DE CONCURSO MENSUAL (CENA PARA 2) -->
      <div class="panel" style="margin-bottom: 24px; border: 2px solid rgba(217, 119, 6, 0.4); background: linear-gradient(135deg, rgba(254, 243, 199, 0.3) 0%, rgba(255, 255, 255, 0.98) 100%);">
        <div class="panel-header" style="flex-wrap: wrap; gap: 10px;">
          <div>
            <div class="panel-title" style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 22px;">👑</span>
              <span style="color: #92400e; font-weight: 800; font-size: 15px;">Gran Desafío Embajador: Sorteo Mensual Cena para 2</span>
              <span style="font-size: 11px; background: #fef3c7; color: #92400e; border: 1px solid #f59e0b; padding: 2px 10px; border-radius: 9999px; font-weight: 700;">
                ${monthlyContest.length} Participantes Clasificados
              </span>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
              Los comensales que completan todas sus misiones y refieren amigos por WhatsApp clasifican automáticamente con su boleto VIP al sorteo del último viernes de cada mes.
            </div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button type="button" onclick="addDemoContestEntry()" class="btn-secondary" style="font-size: 11px; padding: 6px 12px; background: #ffffff; border: 1px solid #d97706; color: #b45309; font-weight: 600; cursor: pointer;">
              ➕ Inscribir Demo
            </button>
            <button type="button" onclick="drawContestWinner()" class="btn-primary" style="font-size: 12px; padding: 7px 16px; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; font-weight: 700; border: none; box-shadow: 0 2px 8px rgba(217, 119, 6, 0.35); cursor: pointer; border-radius: 8px;">
              🎲 Realizar Sorteo Cena para 2
            </button>
          </div>
        </div>

        <!-- Banner de ganador si ya se realizó sorteo -->
        <div id="contestWinnerBanner" style="${activeContestWinner ? 'display: block;' : 'display: none;'} margin-bottom: 16px; padding: 14px 18px; border-radius: 12px; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #10b981;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 26px;">🎉</span>
              <div>
                <strong style="color: #065f46; font-size: 14px; display: block;">
                  ¡GANADOR OFICIAL DE LA CENA PARA 2: <span id="winnerName">${activeContestWinner ? activeContestWinner.customerName : ''}</span>!
                </strong>
                <span style="font-size: 12px; color: #047857;">
                  Boleto Ganador: <strong id="winnerTicket" style="font-family: monospace;">${activeContestWinner ? activeContestWinner.ticketCode : ''}</strong> | WhatsApp: <span id="winnerPhone">${activeContestWinner ? activeContestWinner.customerWhatsapp : ''}</span>
                </span>
              </div>
            </div>
            <span style="font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; background: #059669; color: #ffffff;">
              ✓ GANADOR ASIGNADO
            </span>
          </div>
        </div>

        <!-- TABLA DE PARTICIPANTES CLASIFICADOS -->
        <div style="overflow-x: auto;">
          <table class="data-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Boleto VIP</th>
                <th>Comensal / WhatsApp</th>
                <th>Premio en Juego</th>
                <th>Progreso Desafío</th>
                <th>Fecha Registro</th>
                <th style="text-align: right;">Estado</th>
              </tr>
            </thead>
            <tbody id="contestTableBody">
              ${monthlyContest.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">
                    👑 Ningún cliente ha clasificado todavía. Se inscribirán automáticamente al completar todas sus misiones y referidos en el juego.
                  </td>
                </tr>
              ` : monthlyContest.map(entry => `
                <tr id="contest-row-${entry.id}" style="${entry.winner ? 'background: rgba(16, 185, 129, 0.08); font-weight: 600;' : ''}">
                  <td>
                    <span style="font-family: monospace; font-size: 12px; color: #b45309; font-weight: 800; background: #fef3c7; padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(217, 119, 6, 0.3);">
                      ${entry.ticketCode}
                    </span>
                  </td>
                  <td>
                    <strong style="color: var(--text); font-size: 12px;">${entry.customerName}</strong>
                    <span style="display: block; font-size: 11px; font-family: monospace; color: var(--text-muted);">${entry.customerWhatsapp}</span>
                  </td>
                  <td>
                    <span style="font-size: 12px; color: var(--text); font-weight: 600;">🍽️ Cena Degustación para 2</span>
                  </td>
                  <td>
                    <span style="font-size: 11px; font-weight: 700; color: #059669; background: rgba(16, 185, 129, 0.12); padding: 2px 8px; border-radius: 9999px;">
                      ✓ 100% Desafío Completo
                    </span>
                  </td>
                  <td>
                    <span style="font-size: 11px; color: var(--text-muted);">${entry.dateFormatted || ''} ${entry.enteredAt || ''}</span>
                  </td>
                  <td style="text-align: right;">
                    <span style="font-size: 10.5px; font-weight: 700; padding: 3px 9px; border-radius: 9999px; ${
                      entry.winner ? 'background: #10b981; color: #ffffff;' : 'background: #fef3c7; color: #92400e; border: 1px solid #f59e0b;'
                    }">
                      ${entry.winner ? '👑 GANADOR' : 'CLASIFICADO'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- BANDEJA DE APROBACIÓN DE EVIDENCIAS -->
      <div class="panel" style="margin-bottom: 20px;">
        <div class="panel-header">
          <div class="panel-title">
            <span>📥 Bandeja de Aprobación de Misiones Enviadas</span>
            <span style="font-size: 11px; background: rgba(59, 130, 246, 0.2); color: #2563eb; border: 1px solid rgba(59, 130, 246, 0.4); padding: 2px 8px; border-radius: 9999px; font-weight: 700;">
              ${submissions.filter(s => s.status === 'PENDIENTE').length} pendientes de revisión
            </span>
          </div>
          <button type="button" class="btn-secondary" onclick="window.location.reload()" style="font-size: 11px; padding: 4px 10px;">
            🔄 Actualizar Bandeja
          </button>
        </div>

        <div style="overflow-x: auto;">
          <table class="data-table" style="width: 100%;">
            <thead>
              <tr>
                <th>ID / Fecha</th>
                <th>Comensal / WhatsApp</th>
                <th>Misión & Recompensa</th>
                <th>Enlace de Evidencia</th>
                <th>Estado</th>
                <th style="text-align: right;">Acción de Validación</th>
              </tr>
            </thead>
            <tbody id="missionsTableBody">
              ${submissions.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">
                    🎯 No hay evidencias enviadas aún. Cuando los clientes completen misiones desde el juego o domicilio, aparecerán aquí para tu aprobación.
                  </td>
                </tr>
              ` : submissions.map(sub => `
                <tr id="sub-row-${sub.id}">
                  <td>
                    <span style="font-family: monospace; font-size: 11px; color: var(--accent); font-weight: 700;">${sub.id}</span>
                    <span style="display: block; font-size: 10px; color: var(--text-muted);">${sub.dateFormatted || ''} ${sub.submittedAt || ''}</span>
                  </td>
                  <td>
                    <strong style="color: var(--text); font-size: 12px;">${sub.customerName}</strong>
                    <span style="display: block; font-size: 11px; font-family: monospace; color: var(--text-muted);">${sub.customerWhatsapp}</span>
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="font-size: 16px;">${sub.missionIcon || '🎯'}</span>
                      <div>
                        <strong style="font-size: 12px; color: var(--text);">${sub.missionTitle}</strong>
                        <span style="display: block; font-size: 10px; color: #059669; font-weight: 700;">+${sub.rewardStamps} Sellos de Visita</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <a href="${sub.evidenceUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px; color: #0284c7; text-decoration: underline; font-size: 11px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      🔗 Abrir enlace (${sub.evidenceUrl.length > 30 ? sub.evidenceUrl.substring(0, 30) + '...' : sub.evidenceUrl})
                    </a>
                  </td>
                  <td>
                    <span id="badge-sub-${sub.id}" style="font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 9999px; ${
                      sub.status === 'APROBADO' ? 'background: rgba(16, 185, 129, 0.15); color: #059669; border: 1px solid rgba(16, 185, 129, 0.35);' :
                      sub.status === 'RECHAZADO' ? 'background: rgba(239, 68, 68, 0.15); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.35);' :
                      'background: rgba(245, 158, 11, 0.15); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.35);'
                    }">
                      ${sub.status}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    ${sub.status === 'PENDIENTE' ? `
                      <div id="actions-sub-${sub.id}" style="display: inline-flex; gap: 6px;">
                        <button type="button" onclick="reviewSubmission('${sub.id}', 'approve')" style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); color: #059669; padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer;">
                          ✓ Aprobar (+${sub.rewardStamps})
                        </button>
                        <button type="button" onclick="reviewSubmission('${sub.id}', 'reject')" style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); color: #dc2626; padding: 5px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer;">
                          ✗ Rechazar
                        </button>
                      </div>
                    ` : `
                      <span style="font-size: 11px; color: var(--text-muted);">Revisado ${sub.reviewedAt || ''}</span>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- PANEL: CHECKLIST Y PUNTOS DINÁMICOS DEL CATÁLOGO DE MISIONES -->
      <div class="panel" style="margin-top: 24px; border: 2px solid var(--accent); background: linear-gradient(135deg, #FFFDF8 0%, #FFFFFF 100%);">
        <div class="panel-header" style="border-bottom: 1px solid rgba(162, 126, 44, 0.2); padding-bottom: 14px; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
          <div>
            <div class="panel-title" style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;">📋</span>
              <span style="font-weight: 800; font-size: 16px; color: var(--text);">Catálogo de Misiones: Checklist & Puntos Dinámicos</span>
              <span style="font-size: 11px; background: var(--accent-light); color: var(--accent); border: 1px solid rgba(162,126,44,0.3); padding: 3px 10px; border-radius: 9999px; font-weight: 700;">
                CONTROL TOTAL
              </span>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
              Activa o pausa cada misión usando el checklist, asigna cuántos sellos de fidelidad (+1, +2, +3...) entrega cada una y personaliza sus enlaces de destino (Bing, TikTok, etc.).
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span id="toast-missions-config" class="toast-success">✓ ¡Catálogo de misiones guardado con éxito!</span>
            <button type="button" class="btn-save" onclick="saveMissionsCatalog()">💾 Guardar Catálogo</button>
          </div>
        </div>

        <!-- TABLA INTERACTIVA TIPO CHECKLIST -->
        <div style="overflow-x: auto;">
          <table class="data-table" style="width: 100%; border-collapse: separate; border-spacing: 0 8px;">
            <thead>
              <tr style="background: #F8FAFC;">
                <th style="width: 130px; text-align: center;">Checklist / Estado</th>
                <th style="width: 240px;">Misión & Categoría</th>
                <th style="width: 160px; text-align: center;">Sellos / Puntos</th>
                <th style="width: 250px;">Enlace de Destino (URL)</th>
                <th>Instrucciones / Reglas</th>
              </tr>
            </thead>
            <tbody id="missionsConfigTableBody">
              ${missions.map(m => {
                const isActive = m.active !== false;
                return `
                <tr id="mission-row-${m.id}" style="background: ${isActive ? '#FFFFFF' : '#F9FAFB'}; opacity: ${isActive ? '1' : '0.65'}; transition: all 0.2s;">
                  <td style="text-align: center; vertical-align: middle;">
                    <label style="display: inline-flex; flex-direction: column; align-items: center; cursor: pointer; gap: 4px;">
                      <input type="checkbox" id="m_active_${m.id}" ${isActive ? 'checked' : ''} onchange="toggleMissionRow('${m.id}')" style="width: 20px; height: 20px; cursor: pointer; accent-color: #059669;" />
                      <span id="m_status_badge_${m.id}" style="font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; ${isActive ? 'background: rgba(16, 185, 129, 0.15); color: #059669;' : 'background: #E2E8F0; color: #64748B;'}">
                        ${isActive ? '✅ ACTIVA' : '⏸️ PAUSADA'}
                      </span>
                    </label>
                  </td>
                  <td style="vertical-align: top;">
                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                      <span style="font-size: 24px;">${m.icon || '🎯'}</span>
                      <div style="flex: 1;">
                        <input type="text" id="m_title_${m.id}" class="form-input" value="${(m.title || '').replace(/"/g, '&quot;')}" style="font-size: 13px; font-weight: 700; margin-bottom: 4px;" placeholder="Título de la misión" />
                        <span style="font-size: 10px; font-weight: 600; color: #64748B; background: #F1F5F9; padding: 2px 6px; border-radius: 4px;">
                          ${m.category || 'Misión'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style="text-align: center; vertical-align: middle;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <input type="number" id="m_stamps_${m.id}" class="form-input" min="1" max="15" value="${m.rewardStamps || 1}" oninput="updateMissionBadge('${m.id}')" style="width: 65px; text-align: center; font-size: 15px; font-weight: 800; color: #059669; padding: 6px 4px;" />
                        <span style="font-size: 13px; font-weight: 700; color: #059669;">pts</span>
                      </div>
                      <span id="m_stamps_label_${m.id}" style="font-size: 11px; font-weight: 700; color: #047857; font-family: monospace;">
                        +${m.rewardStamps || 1} Sello${(m.rewardStamps || 1) > 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>
                  <td style="vertical-align: top;">
                    <input type="text" id="m_url_${m.id}" class="form-input" value="${(m.actionUrl || '').replace(/"/g, '&quot;')}" placeholder="https://..." style="font-size: 11.5px; font-family: monospace; margin-bottom: 4px;" />
                    <a href="${m.actionUrl || '#'}" id="m_url_preview_${m.id}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; color: #0284c7; text-decoration: underline; display: inline-flex; align-items: center; gap: 4px;">
                      Probar enlace ↗
                    </a>
                  </td>
                  <td style="vertical-align: top;">
                    <textarea id="m_desc_${m.id}" class="form-input" rows="2" style="font-size: 11.5px; resize: vertical;" placeholder="Descripción de la misión">${m.description || ''}</textarea>
                  </td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--card-border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="font-size: 12px; color: var(--text-muted);">
            💡 <strong>Consejo Gourmet:</strong> Puedes activar Bing Maps, TikTok, Trustpilot, Facebook y WhatsApp según tu campaña. Las misiones desactivadas no aparecerán en el teléfono de los comensales.
          </div>
          <button type="button" class="btn-save" onclick="saveMissionsCatalog()">💾 Guardar Cambios en Catálogo</button>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- PESTAÑA 11: EMBUDO INTELIGENTE DE REPUTACIÓN (GOOGLE VS WHATSAPP)         -->
    <!-- ========================================================================= -->
    <div id="tab-reputation" class="tab-content">
      <!-- GUÍA RÁPIDA -->
      <div class="quick-guide-box">
        <div class="quick-guide-header">
          <span>⭐</span>
          <span>Guía Rápida: Embudo Inteligente de Reputación y Reseñas</span>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">
          Protege la reputación pública del negocio filtrando comentarios en base a la experiencia del comensal.
        </div>
        <div class="quick-guide-grid">
          <div class="quick-guide-item">
            <strong>🌟 Calificaciones de 4 a 5 Emblemas</strong>
            <span>Dirige automáticamente a Google My Business / Google Maps para multiplicar las reseñas 5 estrellas y posicionamiento SEO.</span>
          </div>
          <div class="quick-guide-item">
            <strong>🛡️ Calificaciones de 1 a 3 Emblemas</strong>
            <span>Filtro de contención privado: El comensal envía su sugerencia al WhatsApp de administración sin publicarla en Google.</span>
          </div>
          <div class="quick-guide-item">
            <strong>💬 Resolución Inmediata de Quejas</strong>
            <span>Permite al gerente o dueño atender al cliente insatisfecho al instante y fidelizarlo antes de que abandone el local.</span>
          </div>
          <div class="quick-guide-item">
            <strong>🎁 Activación de 2ª Oportunidad</strong>
            <span>Tras calificar en Google, el cliente desbloquea el reto del cronómetro 10s al compartir en sus Estados de WhatsApp.</span>
          </div>
        </div>
      </div>

      <!-- MÉTRICAS DEL EMBUDO DE REPUTACIÓN -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-title">Calificación Promedio</span>
          <span class="stat-value" style="color: #fbbf24;">${repAvg} ★</span>
          <span class="stat-sub">${repTotal} calificaciones recibidas</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Dirigidas a Google Maps</span>
          <span class="stat-value" style="color: var(--success);">${repGoogleCount}</span>
          <span class="stat-sub">Experiencias positivas (4 a 5 ★)</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Quejas Interceptadas</span>
          <span class="stat-value" style="color: var(--warning);">${repWhatsappCount}</span>
          <span class="stat-sub">Atendidas en WhatsApp privado (1 a 3 ★)</span>
        </div>
        <div class="stat-card">
          <span class="stat-title">Protección de Marca</span>
          <span class="stat-value" style="color: var(--info);">${repProtectionRate}%</span>
          <span class="stat-sub">Tasa de reputación positiva</span>
        </div>
      </div>

      <!-- FORMULARIO DE CONFIGURACIÓN DEL EMBUDO -->
      <div class="panel" style="margin-bottom: 20px;">
        <div class="panel-header">
          <div class="panel-title">
            <span>⚙️ Configuración del Embudo (Google My Business & WhatsApp)</span>
          </div>
          <span class="badge-role" style="background: rgba(162, 126, 44, 0.2); color: var(--accent); border-color: rgba(162, 126, 44, 0.4);">
            EMBUDO INTELIGENTE ACTIVO
          </span>
        </div>

        <form id="form-reputation-config" onsubmit="saveReputationConfig(event)">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 14px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Enlace a Google My Business / Google Maps Reviews:</label>
              <input type="url" id="repGoogleUrl" class="form-input" value="${repConfig.googleBusinessUrl || 'https://g.page/r/CfPSfNSGX8u1EBM/review'}" required placeholder="https://g.page/r/.../review o https://maps.google.com/..." />
              <span class="form-help">Enlace directo a la ficha de reseñas de Google para comensales que califiquen 4 o 5 emblemas.</span>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">WhatsApp Privado de Gerencia / Administración:</label>
              <input type="tel" id="repWhatsappPhone" class="form-input" value="${repConfig.whatsappPrivateNumber || '573000000000'}" required placeholder="573001234567" />
              <span class="form-help">Número con código de país para recibir las sugerencias y quejas privadas de 1 a 3 emblemas.</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 16px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Umbral Mínimo para Google:</label>
              <select id="repMinRating" class="form-input">
                <option value="4" ${repConfig.minRatingForGoogle === 4 ? 'selected' : ''}>4 y 5 Emblemas van a Google (1 a 3 a WhatsApp privado)</option>
                <option value="5" ${repConfig.minRatingForGoogle === 5 ? 'selected' : ''}>Solo 5 Emblemas van a Google (1 a 4 a WhatsApp privado)</option>
              </select>
              <span class="form-help">Define a partir de cuántos emblemas se envía la reseña pública a Google Maps.</span>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Redirección y Protección Activa:</label>
              <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px; color: var(--text);">
                  <input type="checkbox" id="repAutoRedirect" ${repConfig.autoRedirectGoogle !== false ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--accent);" />
                  <span>Abrir Google Maps automáticamente en 4 y 5 estrellas</span>
                </label>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button type="submit" class="btn-primary" style="padding: 10px 22px;">
              💾 Guardar Configuración de Reputación
            </button>
          </div>
        </form>
      </div>

      <!-- BANDEJA EN VIVO DE CALIFICACIONES Y SUGERENCIAS RECIBIDAS -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>📥 Historial de Calificaciones y Sugerencias de Comensales</span>
            <span style="font-size: 11px; background: rgba(162, 126, 44, 0.2); color: var(--accent); border-line: 1px solid rgba(162, 126, 44, 0.4); padding: 2px 8px; border-radius: 9999px; font-weight: 700;">
              ${repTotal} registros
            </span>
          </div>
          <button type="button" class="btn-secondary" onclick="window.location.reload()" style="font-size: 11px; padding: 4px 10px;">
            🔄 Actualizar Historial
          </button>
        </div>

        <div style="overflow-x: auto;">
          <table class="data-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Fecha / Hora</th>
                <th>Comensal / Mesa</th>
                <th>Calificación</th>
                <th>Canal del Embudo</th>
                <th>Sugerencia / Comentario</th>
              </tr>
            </thead>
            <tbody>
              ${repFeedbacks.length === 0 ? `
                <tr>
                  <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">
                    ⭐ Aún no hay calificaciones registradas. Cuando los comensales califiquen desde el QR de mesa o domicilio, aparecerán aquí.
                  </td>
                </tr>
              ` : repFeedbacks.map(f => `
                <tr>
                  <td>
                    <span style="font-size: 11px; font-weight: 600; color: var(--text);">${f.dateFormatted || ''}</span>
                    <span style="display: block; font-size: 10px; color: var(--text-muted);">${f.timeFormatted || ''}</span>
                  </td>
                  <td>
                    <strong style="color: var(--text); font-size: 12px;">${f.customerName}</strong>
                    <span style="display: block; font-size: 10px; color: var(--text-muted);">${f.tableNumber}</span>
                  </td>
                  <td>
                    <span style="color: #fbbf24; font-size: 14px; font-weight: 700;">${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}</span>
                    <span style="font-size: 10px; color: var(--text-muted); margin-left: 4px;">(${f.rating}/5)</span>
                  </td>
                  <td>
                    ${f.actionTaken === 'google' || f.rating >= 4 ? `
                      <span style="font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 9999px; background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4);">
                        🌐 GOOGLE MY BUSINESS
                      </span>
                    ` : `
                      <span style="font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 9999px; background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4);">
                        🛡️ WHATSAPP PRIVADO (1-3★)
                      </span>
                    `}
                  </td>
                  <td style="max-width: 320px;">
                    <span style="font-size: 11px; color: var(--text); line-height: 1.4;">
                      ${f.comment ? `"${f.comment}"` : '<em style="color: var(--text-muted);">Sin comentario adicional</em>'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
      </main>
    </div>

  </div>

  <script>
    // DATOS DE PLANTILLAS GUARDADAS EN EL BACKEND
    window.SAVED_DRAFTS = ${JSON.stringify(s.savedPushDrafts || [])};
    window.CURRENT_MISSIONS = ${JSON.stringify(missions || [])};

    // CAMBIO DE PESTAÑAS EN EL BACKEND
    function switchTab(tabId, btn) {
      document.querySelectorAll('.tab-content').forEach(function(el) { el.classList.remove('active'); });
      document.querySelectorAll('.nav-tab-btn').forEach(function(el) { el.classList.remove('active'); });
      var target = document.getElementById(tabId);
      if (target) target.classList.add('active');
      var activeBtn = btn || document.querySelector('.nav-tab-btn[data-tab="' + tabId + '"]');
      if (activeBtn) activeBtn.classList.add('active');
    }

    // FILTROS EN TIEMPO REAL DEL DASHBOARD DE OPERACIONES
    function applyOpsFilters() {
      const period = document.getElementById("filterPeriod") ? document.getElementById("filterPeriod").value : "all";
      const status = document.getElementById("filterStatus") ? document.getElementById("filterStatus").value : "all";
      const table = document.getElementById("filterTable") ? document.getElementById("filterTable").value : "all";
      const search = document.getElementById("filterSearch") ? document.getElementById("filterSearch").value.toLowerCase().trim() : "";

      const rows = document.querySelectorAll("#prizesTable tbody tr");
      let visibleCount = 0;
      let redeemedCount = 0;
      const customersSet = new Set();

      rows.forEach(function(row) {
        if (!row.cells || row.cells.length < 5) return;
        const codeText = row.cells[0].innerText.toLowerCase();
        const timeText = row.cells[1].innerText.toLowerCase();
        const customerText = row.cells[2].innerText.toLowerCase();
        const prizeText = row.cells[3].innerText.toLowerCase();
        const statusText = row.cells[5] ? row.cells[5].innerText.trim() : "";
        const tableText = row.cells[2].innerText;

        let match = true;

        if (status !== "all" && statusText !== status) {
          match = false;
        }

        if (table !== "all" && !tableText.includes(table)) {
          match = false;
        }

        if (period === "today" && !timeText.includes(":") && !timeText.includes("hoy")) {
          match = false;
        }

        if (search) {
          const combined = (codeText + " " + customerText + " " + prizeText + " " + timeText).toLowerCase();
          if (!combined.includes(search)) {
            match = false;
          }
        }

        if (match) {
          row.style.display = "";
          visibleCount++;
          if (statusText === "UTILIZADO") redeemedCount++;
          customersSet.add(customerText.split(String.fromCharCode(10))[0].trim());
        } else {
          row.style.display = "none";
        }
      });

      // Actualizar contadores KPI
      const statTotalEl = document.getElementById("stat-total");
      const statRedeemedEl = document.getElementById("stat-redeemed");
      const statRateEl = document.getElementById("stat-rate");
      const statCustomersEl = document.getElementById("stat-customers");
      const countBadge = document.getElementById("filterCountBadge");

      if (statTotalEl) statTotalEl.innerText = visibleCount;
      if (statRedeemedEl) statRedeemedEl.innerText = redeemedCount;
      if (statRateEl) {
        const rate = visibleCount > 0 ? Math.round((redeemedCount / visibleCount) * 100) : 0;
        statRateEl.innerText = rate + "%";
      }
      if (statCustomersEl) statCustomersEl.innerText = customersSet.size;
      if (countBadge) countBadge.innerText = visibleCount + " registros";
    }

    function resetOpsFilters() {
      if (document.getElementById("filterPeriod")) document.getElementById("filterPeriod").value = "all";
      if (document.getElementById("filterStatus")) document.getElementById("filterStatus").value = "all";
      if (document.getElementById("filterTable")) document.getElementById("filterTable").value = "all";
      if (document.getElementById("filterSearch")) document.getElementById("filterSearch").value = "";
      applyOpsFilters();
    }

    // CONTROL DE PROGRAMACIÓN DE PUSH
    let pushScheduleMode = "immediate";
    function setPushScheduleMode(mode) {
      pushScheduleMode = mode;
      const btnImm = document.getElementById("btnSchedImmediate");
      const btnLater = document.getElementById("btnSchedLater");
      const timeInp = document.getElementById("pushScheduledTime");

      if (mode === "immediate") {
        btnImm.style.background = "rgba(245, 158, 11, 0.2)";
        btnImm.style.borderColor = "#fbbf24";
        btnImm.style.color = "#fbbf24";
        btnLater.style.background = "";
        btnLater.style.borderColor = "";
        btnLater.style.color = "";
        timeInp.style.display = "none";
      } else {
        btnLater.style.background = "rgba(245, 158, 11, 0.2)";
        btnLater.style.borderColor = "#fbbf24";
        btnLater.style.color = "#fbbf24";
        btnImm.style.background = "";
        btnImm.style.borderColor = "";
        btnImm.style.color = "";
        timeInp.style.display = "block";
      }
    }

    // INSERTAR VARIABLES DINÁMICAS EN EL MENSAJE PUSH
    function insertPushTag(tag) {
      const bodyInput = document.getElementById("pushBody");
      if (bodyInput) {
        bodyInput.value = bodyInput.value ? (bodyInput.value + " " + tag) : tag;
        bodyInput.focus();
      }
    }

    // CARGAR PLANTILLAS PREDEFINIDAS
    function loadPushTemplate(type) {
      const titleInput = document.getElementById("pushTitle");
      const bodyInput = document.getElementById("pushBody");
      const segmentInput = document.getElementById("pushSegment");
      if (type === "happy_hour") {
        titleInput.value = "⚡ ¡Happy Hour 2x1 en Café y Bebidas de Autor!";
        bodyInput.value = "¡Hola {nombre}! Hoy de 3:00 a 6:00 PM acumula el DOBLE de sellos y disfruta 2x1 en bebidas. ¡Muestra este mensaje en caja!";
        segmentInput.value = "Subscribed Users";
      } else if (type === "dessert") {
        titleInput.value = "🍰 ¡Postre de Cortesía en tu Visita de Hoy!";
        bodyInput.value = "Ven hoy a deleitarte en {restaurante} y recibe un postre artesanal de autor de cortesía con tu consumo principal. ¡Te esperamos!";
        segmentInput.value = "Subscribed Users";
      } else if (type === "flash") {
        titleInput.value = "⏳ Cupón Flash: 50% en tu Segundo Plato o Bebida";
        bodyInput.value = "¡Solo por hoy! Disfruta 50% de descuento en tu segundo producto favorito en {restaurante}. Muestra este aviso en caja.";
        segmentInput.value = "Active Customers";
      } else if (type === "stamps") {
        titleInput.value = "🌟 ¡Sellos Dobles este Fin de Semana!";
        bodyInput.value = "¡Acelera tu tarjeta de 15 sellos! Cada visita este fin de semana en {restaurante} te otorga 2 sellos para llegar antes a tu premio.";
        segmentInput.value = "Subscribed Users";
      }
    }

    // CARGAR PLANTILLA GUARDADA EN EL FORMULARIO
    function loadCustomDraft(id) {
      const draft = (window.SAVED_DRAFTS || []).find(function(d) { return d.id === id; });
      if (!draft) return;
      document.getElementById("pushTitle").value = draft.title || "";
      document.getElementById("pushBody").value = draft.body || "";
      document.getElementById("pushSegment").value = draft.segment || "Subscribed Users";
      document.getElementById("pushUrl").value = draft.url || "";
      if (document.getElementById("draftName")) document.getElementById("draftName").value = draft.name || "";
      if (draft.scheduleType) setPushScheduleMode(draft.scheduleType);
      if (draft.scheduledTime && document.getElementById("pushScheduledTime")) {
        document.getElementById("pushScheduledTime").value = draft.scheduledTime;
      }
      if (draft.channels) {
        if (document.getElementById("chanPush")) document.getElementById("chanPush").checked = draft.channels.push !== false;
        if (document.getElementById("chanWebhook")) document.getElementById("chanWebhook").checked = draft.channels.webhook !== false;
        if (document.getElementById("chanWhatsApp")) document.getElementById("chanWhatsApp").checked = draft.channels.whatsappPreview !== false;
      }
      alert('Plantilla "' + (draft.name || draft.title) + '" cargada en el formulario.');
    }

    // GUARDAR PLANTILLA REUTILIZABLE
    async function saveCurrentPushDraft() {
      const title = document.getElementById("pushTitle").value.trim();
      const body = document.getElementById("pushBody").value.trim();
      const segment = document.getElementById("pushSegment").value;
      const url = document.getElementById("pushUrl").value.trim();
      const draftName = (document.getElementById("draftName").value.trim()) || title.slice(0, 30);
      const scheduledTime = document.getElementById("pushScheduledTime").value;

      if (!title || !body) {
        alert("Por favor completa al menos el título y mensaje de la oferta antes de guardarla.");
        return;
      }

      const payload = {
        name: draftName,
        title: title,
        body: body,
        segment: segment,
        url: url,
        scheduleType: pushScheduleMode,
        scheduledTime: pushScheduleMode === "scheduled" ? scheduledTime : "",
        channels: {
          push: document.getElementById("chanPush").checked,
          webhook: document.getElementById("chanWebhook").checked,
          whatsappPreview: document.getElementById("chanWhatsApp").checked,
        },
      };

      try {
        const res = await fetch("/api/push/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          alert('¡Plantilla "' + draftName + '" guardada con éxito!');
          window.location.reload();
        } else {
          alert("Error al guardar: " + (data.error || ""));
        }
      } catch (err) {
        alert("Error de conexión al guardar plantilla.");
      }
    }

    // ELIMINAR PLANTILLA GUARDADA
    async function deleteCustomDraft(id) {
      if (!confirm("¿Deseas eliminar esta plantilla guardada?")) return;
      try {
        const res = await fetch("/api/push/drafts", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: id })
        });
        const data = await res.json();
        if (data.success) {
          window.location.reload();
        } else {
          alert("Error: " + (data.error || ""));
        }
      } catch (err) {
        alert("Error de conexión.");
      }
    }

    // ENVIAR CAMPAÑA PUSH BROADCAST CON PROGRAMACIÓN Y CANALES
    async function sendBroadcastPush(e) {
      e.preventDefault();
      const statusEl = document.getElementById("pushStatusMsg");
      const title = document.getElementById("pushTitle").value.trim();
      const body = document.getElementById("pushBody").value.trim();
      const segment = document.getElementById("pushSegment").value;
      const url = document.getElementById("pushUrl").value.trim();
      const scheduledTime = document.getElementById("pushScheduledTime").value;

      if (!title || !body) {
        alert("Por favor completa el título y el mensaje de la campaña.");
        return;
      }

      statusEl.style.color = "#fbbf24";
      statusEl.innerText = "⏳ Procesando envío de campaña...";

      try {
        const res = await fetch("/api/push/broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title,
            body: body,
            segment: segment,
            url: url,
            scheduleType: pushScheduleMode,
            scheduledTime: pushScheduleMode === "scheduled" ? scheduledTime : "",
            channels: {
              push: document.getElementById("chanPush").checked,
              webhook: document.getElementById("chanWebhook").checked,
              whatsappPreview: document.getElementById("chanWhatsApp").checked,
            },
          })
        });
        const data = await res.json();
        if (data.success) {
          statusEl.style.color = "#34d399";
          statusEl.innerText = "✓ " + data.message;
          setTimeout(function() { statusEl.innerText = ""; }, 5000);
          setTimeout(function() { window.location.reload(); }, 2000);
        } else {
          statusEl.style.color = "#f87171";
          statusEl.innerText = "Error: " + (data.error || "No se pudo enviar");
        }
      } catch (err) {
        statusEl.style.color = "#f87171";
        statusEl.innerText = "Error de conexión con el servidor.";
      }
    }

    // PALETA DE COLORES RÁPIDOS
    function selectColorPreset(hex) {
      document.getElementById('brand-color-picker').value = hex;
      document.getElementById('brand-color-hex').value = hex;
      document.getElementById('brand-color-preview').style.backgroundColor = hex;
    }

    // PALETA DE ICONO DE VISITA
    function selectVisitIconPreset(icon) {
      document.getElementById('stamp-visit-icon').value = icon;
      document.getElementById('stamp-visit-icon-preview').innerText = icon;
      document.querySelectorAll('#tab-stamps .icon-preset-btn').forEach(btn => btn.classList.remove('active'));
      event.currentTarget.classList.add('active');
    }

    // VERIFICADOR DE SUMA DE RULETA (DEBE DAR 100%)
    function updateRouletteSum() {
      let sum = 0;
      document.querySelectorAll('.prize-prob').forEach(inp => {
        sum += Number(inp.value) || 0;
      });
      const badge = document.getElementById('roulette-sum-badge');
      if (sum === 100) {
        badge.style.background = 'rgba(16, 185, 129, 0.2)';
        badge.style.color = '#34d399';
        badge.innerText = 'Suma Total: 100% ✓';
      } else {
        badge.style.background = 'rgba(239, 68, 68, 0.2)';
        badge.style.color = '#f87171';
        badge.innerText = 'Suma Actual: ' + sum + '% (Debe ser 100%) ⚠️';
      }
    }

    // SELECCIÓN VISUAL DE MODO DE JUEGO EN BACKEND + WIZARD CONTEXTUAL
    function selectBackendGameMode(mode, cardEl) {
      // 1. Actualizar tarjetas visuales
      document.querySelectorAll('.game-mode-card').forEach(function(c) {
        c.classList.remove('active');
        var chk = c.querySelector('.mode-check');
        if (chk) chk.innerText = '';
      });
      if (cardEl) {
        cardEl.classList.add('active');
        var chk = cardEl.querySelector('.mode-check');
        if (chk) chk.innerText = '✓ ACTIVO';
      }

      // 2. Actualizar input oculto
      var hiddenInput = document.getElementById('backendGameMode');
      if (hiddenInput) hiddenInput.value = mode;

      // 3. Mostrar/ocultar paneles de configuración según el juego elegido
      var showRoulette = (mode === 'roulette' || mode === 'hybrid');
      var showPrecision = (mode === 'precision' || mode === 'hybrid');
      var showStamps = (mode === 'stamps');

      var wizardRoulette = document.getElementById('wizard-roulette');
      var wizardPrecision = document.getElementById('wizard-precision');
      var wizardStamps = document.getElementById('wizard-stamps');

      if (wizardRoulette) {
        wizardRoulette.style.display = showRoulette ? 'block' : 'none';
        wizardRoulette.style.animation = showRoulette ? 'fadeIn 0.25s ease' : 'none';
      }
      if (wizardPrecision) {
        wizardPrecision.style.display = showPrecision ? 'block' : 'none';
        wizardPrecision.style.animation = showPrecision ? 'fadeIn 0.25s ease' : 'none';
      }
      if (wizardStamps) {
        wizardStamps.style.display = showStamps ? 'block' : 'none';
        wizardStamps.style.animation = showStamps ? 'fadeIn 0.25s ease' : 'none';
      }

      // 4. Scroll suave al wizard si está visible
      var wizard = document.getElementById('game-config-wizard');
      if (wizard) {
        setTimeout(function() {
          wizard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    }

    // GUARDAR CONFIGURACIÓN DE MECÁNICA DE JUEGO
    function saveGameModeConfig() {
      var mode = document.getElementById('backendGameMode') ? document.getElementById('backendGameMode').value : 'hybrid';
      var difficulty = document.getElementById('precisionDifficulty') ? document.getElementById('precisionDifficulty').value : 'medio';
      var attempts = document.getElementById('maxAttempts') ? parseInt(document.getElementById('maxAttempts').value, 10) : 3;
      var channel = document.getElementById('validationChannel') ? document.getElementById('validationChannel').value : 'both';

      var toleranceMs = difficulty === 'facil' ? 80 : difficulty === 'dificil' ? 15 : 40;

      var gameConfig = {
        gameMode: mode,
        precisionDifficulty: difficulty,
        precisionTarget: 10.0,
        toleranceMs: toleranceMs,
        maxAttempts: attempts,
        validationChannel: channel,
        reviewTiming: 'after_game'
      };

      // Deshabilitar botón durante el guardado
      var btn = document.querySelector('[onclick="saveGameModeConfig()"]');
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Activando...'; }

      fetch('/api/game-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameConfig: gameConfig })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (btn) { btn.disabled = false; btn.textContent = '⚡ Activar Juego Seleccionado'; }
        if (data.success) {
          showToast('toast-game-mode');
        } else {
          alert('Error guardando mecánica de juego: ' + (data.error || 'Desconocido'));
        }
      })
      .catch(function(err) {
        if (btn) { btn.disabled = false; btn.textContent = '⚡ Activar Juego Seleccionado'; }
        alert('Error conectando con el servidor: ' + err.message);
      });
    }

    // SEGUNDA OPORTUNIDAD: PLANTILLAS RÁPIDAS Y MODO MANUAL
    function applySecondChancePreset(type) {
      var nameEl = document.getElementById('scPrizeName');
      var descEl = document.getElementById('scPrizeDescription');
      var valEl = document.getElementById('scPrizeValue');
      var termsEl = document.getElementById('scClaimTerms');
      var imgSelect = document.getElementById('scPresetImage');
      var imgUrl = document.getElementById('scPrizeImageUrl');

      if (type === 'vasca') {
        if (nameEl) nameEl.value = 'Porción de Tarta Vasca Artesanal';
        if (descEl) descEl.value = 'Receta tradicional horneada a alta temperatura con centro ultra cremoso y frutos rojos';
        if (valEl) valEl.value = '$18.000 COP';
        if (termsEl) termsEl.value = 'Canjeable de inmediato en mesa o para llevar con código único.';
        if (imgSelect) imgSelect.value = '/src/assets/tarta-vasca.jpg';
        if (imgUrl) imgUrl.value = '/src/assets/tarta-vasca.jpg';
      } else if (type === 'redvelvet') {
        if (nameEl) nameEl.value = 'Torta Red Velvet Suave de Autor';
        if (descEl) descEl.value = 'Esponjoso bizcocho aterciopelado con capas de frosting de queso crema artesanal';
        if (valEl) valEl.value = '$20.000 COP';
        if (termsEl) termsEl.value = 'Válido hoy en consumo presencial presentando código en caja.';
        if (imgSelect) imgSelect.value = '/src/assets/torta-red-velvet.jpg';
        if (imgUrl) imgUrl.value = '/src/assets/torta-red-velvet.jpg';
      } else if (type === 'cafe') {
        if (nameEl) nameEl.value = 'Café de Especialidad + Galleta Gourmet';
        if (descEl) descEl.value = 'Café Latte o Cappuccino de origen especial con arte latte y galleta recién horneada';
        if (valEl) valEl.value = '$14.000 COP';
        if (termsEl) termsEl.value = 'Aplica para cualquier preparación de café de la carta.';
        if (imgSelect) imgSelect.value = '/src/assets/cafe-latte.jpg';
        if (imgUrl) imgUrl.value = '/src/assets/cafe-latte.jpg';
      } else if (type === 'manual') {
        if (nameEl) { nameEl.value = ''; nameEl.focus(); }
        if (descEl) descEl.value = '';
        if (valEl) valEl.value = 'Cortesía de la Casa';
        if (termsEl) termsEl.value = 'Válido en mesa o caja mostrando el código ganador.';
        if (imgSelect) imgSelect.value = 'custom';
      }
      updateSecondChancePreview();
    }

    // SEGUNDA OPORTUNIDAD: CAMBIO DE IMAGEN PRESET
    function onSelectSecondChanceImage(val) {
      var urlInput = document.getElementById('scPrizeImageUrl');
      if (val === 'custom') {
        if (urlInput) { urlInput.focus(); urlInput.select(); }
      } else {
        if (urlInput) urlInput.value = val;
      }
      updateSecondChancePreview();
    }

    // SEGUNDA OPORTUNIDAD: ACTUALIZAR VISTA PREVIA EN VIVO
    function updateSecondChancePreview() {
      var name = document.getElementById('scPrizeName') ? document.getElementById('scPrizeName').value : '';
      var desc = document.getElementById('scPrizeDescription') ? document.getElementById('scPrizeDescription').value : '';
      var val = document.getElementById('scPrizeValue') ? document.getElementById('scPrizeValue').value : '';
      var terms = document.getElementById('scClaimTerms') ? document.getElementById('scClaimTerms').value : '';
      var imgUrl = document.getElementById('scPrizeImageUrl') ? document.getElementById('scPrizeImageUrl').value : '';
      var size = document.getElementById('scPrizeImageSize') ? document.getElementById('scPrizeImageSize').value : 'medium';

      var titleEl = document.getElementById('scPreviewTitle');
      if (titleEl) titleEl.innerText = name || 'Premio Manual Programado';

      var descEl = document.getElementById('scPreviewDesc');
      if (descEl) descEl.innerText = desc || 'Descripción gastronómica del premio programado';

      var valEl = document.getElementById('scPreviewValBadge');
      if (valEl) valEl.innerText = val || 'Cortesía';

      var termsEl = document.getElementById('scPreviewTerms');
      if (termsEl) termsEl.innerText = terms || 'Válido presentando código único ganado en caja.';

      var imgEl = document.getElementById('scPreviewImg');
      if (imgEl && imgUrl) imgEl.src = imgUrl;

      var wrapEl = document.getElementById('scPreviewImgWrap');
      if (wrapEl) {
        wrapEl.style.height = size === 'small' ? '120px' : size === 'large' ? '260px' : '180px';
      }
    }

    // SEGUNDA OPORTUNIDAD: GUARDAR EN BACKEND
    function saveSecondChanceConfig() {
      var enabled = document.getElementById('scEnabled') ? document.getElementById('scEnabled').value === 'true' : true;
      var prizeName = document.getElementById('scPrizeName') ? document.getElementById('scPrizeName').value.trim() : 'Postre Artesanal de Autor Gratis';
      var prizeValue = document.getElementById('scPrizeValue') ? document.getElementById('scPrizeValue').value.trim() : '$18.000 COP';
      var prizeDescription = document.getElementById('scPrizeDescription') ? document.getElementById('scPrizeDescription').value.trim() : '';
      var claimTerms = document.getElementById('scClaimTerms') ? document.getElementById('scClaimTerms').value.trim() : '';
      var prizeImageUrl = document.getElementById('scPrizeImageUrl') ? document.getElementById('scPrizeImageUrl').value.trim() : '/src/assets/tarta-vasca.jpg';
      var prizeImageSize = document.getElementById('scPrizeImageSize') ? document.getElementById('scPrizeImageSize').value : 'medium';
      var maxAttempts = document.getElementById('scMaxAttempts') ? parseInt(document.getElementById('scMaxAttempts').value, 10) : 3;
      var difficulty = document.getElementById('scDifficulty') ? document.getElementById('scDifficulty').value : 'medio';
      var whatsappStatusText = document.getElementById('scWhatsappStatusText') ? document.getElementById('scWhatsappStatusText').value.trim() : "¡Disfrutando de una experiencia increíble en ${s.brand.name}! ☕🍰 Se los recomiendo. 10/10 ✨";

      var toleranceMs = difficulty === 'facil' ? 80 : difficulty === 'dificil' ? 15 : 40;

      var secondChance = {
        enabled: enabled,
        prizeName: prizeName,
        prizeValue: prizeValue,
        prizeDescription: prizeDescription,
        claimTerms: claimTerms,
        prizeImageUrl: prizeImageUrl,
        prizeImageSize: prizeImageSize,
        maxAttempts: maxAttempts,
        difficulty: difficulty,
        toleranceMs: toleranceMs,
        shareChannels: ["instagram", "whatsapp"],
        whatsappStatusText: whatsappStatusText,
        whatsappVerificationMessage: "¡Hola! 📸 Acabo de compartir en mis Estados de WhatsApp la experiencia. Aquí les envío la captura de pantalla de mi estado para reclamar mi 2ª oportunidad en el Reto del Cronómetro."
      };

      var btn = document.querySelector('[onclick="saveSecondChanceConfig()"]');
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Guardando...'; }

      fetch('/api/second-chance-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secondChance: secondChance })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (btn) { btn.disabled = false; btn.textContent = '💾 Guardar 2ª Oportunidad'; }
        if (data.success) {
          showToast('toast-second-chance');
        } else {
          alert('Error guardando 2ª oportunidad: ' + (data.error || 'Desconocido'));
        }
      })
      .catch(function(err) {
        if (btn) { btn.disabled = false; btn.textContent = '💾 Guardar 2ª Oportunidad'; }
        alert('Error conectando con el servidor: ' + err.message);
      });
    }

    // CATÁLOGO DE MISIONES: CAMBIO VISUAL DE FILA SEGÚN CHECKLIST
    function toggleMissionRow(id) {
      var chk = document.getElementById('m_active_' + id);
      var row = document.getElementById('mission-row-' + id);
      var badge = document.getElementById('m_status_badge_' + id);
      if (!chk || !row || !badge) return;
      if (chk.checked) {
        row.style.background = '#FFFFFF';
        row.style.opacity = '1';
        badge.innerText = '✅ ACTIVA';
        badge.style.background = 'rgba(16, 185, 129, 0.15)';
        badge.style.color = '#059669';
      } else {
        row.style.background = '#F9FAFB';
        row.style.opacity = '0.65';
        badge.innerText = '⏸️ PAUSADA';
        badge.style.background = '#E2E8F0';
        badge.style.color = '#64748B';
      }
    }

    // CATÁLOGO DE MISIONES: ACTUALIZAR BADGE DE SELLOS AL CAMBIAR NÚMERO
    function updateMissionBadge(id) {
      var numInput = document.getElementById('m_stamps_' + id);
      var label = document.getElementById('m_stamps_label_' + id);
      if (!numInput || !label) return;
      var val = parseInt(numInput.value, 10) || 1;
      label.innerText = '+' + val + ' Sello' + (val > 1 ? 's' : '');
    }

    // CATÁLOGO DE MISIONES: GUARDAR CONFIGURACIÓN COMPLETA
    function saveMissionsCatalog() {
      var rows = document.querySelectorAll('[id^="mission-row-"]');
      var allIds = [];
      rows.forEach(function(r) {
        var id = r.id.replace('mission-row-', '');
        if (!allIds.includes(id)) allIds.push(id);
      });
      if (allIds.length === 0) {
        allIds = ['m_tiktok', 'm_trustpilot', 'm_facebook', 'm_bing', 'm_whatsapp_status', 'm_referrals', 'm_whatsapp_community'];
      }

      var cachedList = window.CURRENT_MISSIONS || [];
      var updatedMissions = [];

      allIds.forEach(function(id) {
        var chk = document.getElementById('m_active_' + id);
        var titleEl = document.getElementById('m_title_' + id);
        var stampsEl = document.getElementById('m_stamps_' + id);
        var urlEl = document.getElementById('m_url_' + id);
        var descEl = document.getElementById('m_desc_' + id);

        var isActive = chk ? chk.checked : true;
        var title = titleEl ? titleEl.value.trim() : '';
        var stamps = stampsEl ? (parseInt(stampsEl.value, 10) || 1) : 1;
        var url = urlEl ? urlEl.value.trim() : '';
        var desc = descEl ? descEl.value.trim() : '';

        var orig = cachedList.find(function(m) { return m.id === id; }) || {};

        updatedMissions.push({
          id: id,
          category: orig.category || 'Misión',
          title: title || orig.title || 'Misión',
          rewardStamps: stamps,
          rewardText: '+' + stamps + ' Sello' + (stamps > 1 ? 's' : '') + ' de Visita',
          badge: orig.badge || (stamps >= 3 ? 'TOP' : 'VIP'),
          icon: orig.icon || '🎯',
          description: desc || orig.description || '',
          rules: orig.rules || ['Completa la acción indicada.', 'Pega tu comprobante o enlace.'],
          actionUrl: url || orig.actionUrl || '',
          evidencePlaceholder: orig.evidencePlaceholder || 'Enlace o confirmación...',
          active: isActive
        });
      });

      var btns = document.querySelectorAll('[onclick="saveMissionsCatalog()"]');
      btns.forEach(function(b) { b.disabled = true; b.textContent = '⏳ Guardando...'; });

      fetch('/api/missions/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missions: updatedMissions })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        btns.forEach(function(b) { b.disabled = false; b.textContent = '💾 Guardar Cambios en Catálogo'; });
        if (data.success) {
          window.CURRENT_MISSIONS = data.missions || updatedMissions;
          showToast('toast-missions-config');
        } else {
          alert('Error guardando catálogo de misiones: ' + (data.error || 'Desconocido'));
        }
      })
      .catch(function(err) {
        btns.forEach(function(b) { b.disabled = false; b.textContent = '💾 Guardar Cambios en Catálogo'; });
        alert('Error conectando con el servidor: ' + err.message);
      });
    }

    // UTILIDAD DE FEEDBACK VISUAL
    function showToast(toastId) {
      const el = document.getElementById(toastId);
      if (!el) return;
      el.style.display = 'inline';
      setTimeout(() => { el.style.display = 'none'; }, 3500);
    }

    // ENVIAR CONFIGURACIÓN AL SERVIDOR REST (/api/config)
    async function sendConfigUpdate(payload, toastId) {
      try {
        const res = await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          showToast(toastId);
        } else {
          const err = await res.json();
          alert('Error: ' + (err.error || 'No se pudo guardar'));
        }
      } catch (err) {
        alert('Error de conexión: ' + err.message);
      }
    }

    // GUARDAR MARCA
    function saveBrandConfig() {
      const payload = {
        brand: {
          name: document.getElementById('brand-name').value.trim(),
          tagline: document.getElementById('brand-tagline').value.trim(),
          taglineEn: document.getElementById('brand-tagline-en').value.trim(),
          currency: document.getElementById('brand-currency').value.trim(),
          logoUrl: document.getElementById('brand-logo').value.trim(),
          emblemUrl: document.getElementById('brand-emblem').value.trim(),
          primaryColor: document.getElementById('brand-color-hex').value.trim(),
        }
      };
      sendConfigUpdate(payload, 'toast-brand');
    }

    // GUARDAR CANALES
    function saveChannelsConfig() {
      const payload = {
        channels: {
          instagramHandle: document.getElementById('chan-ig').value.trim(),
          whatsappNumber: document.getElementById('chan-wa-phone').value.trim(),
          enableWhatsAppPhoto: document.getElementById('chan-wa-enabled').checked,
          whatsappPhotoMessage: document.getElementById('chan-wa-msg').value.trim(),
          googleMapsReviewUrl: document.getElementById('chan-maps').value.trim(),
        }
      };
      sendConfigUpdate(payload, 'toast-channels');
    }

    // GUARDAR RULETA
    function saveRouletteConfig() {
      const rows = document.querySelectorAll('#roulette-rows tr');
      const prizes = [];
      rows.forEach(r => {
        prizes.push({
          id: r.getAttribute('data-prize-id'),
          name: r.querySelector('.prize-name').value.trim(),
          value: r.querySelector('.prize-value').value.trim(),
          probability: Number(r.querySelector('.prize-prob').value) || 0,
          color: r.querySelector('.prize-color').value.trim(),
          active: r.querySelector('.prize-active').checked,
        });
      });
      sendConfigUpdate({ prizes }, 'toast-roulette');
    }

    // GUARDAR SELLOS & ICONOS
    function saveStampsConfig() {
      const visitIcon = document.getElementById('stamp-visit-icon').value.trim() || '☕';
      const milestones = [
        {
          stamp: 5,
          icon: document.getElementById('m-icon-0').value.trim() || '🍰',
          title: document.getElementById('m-title-0').value.trim(),
          description: document.getElementById('m-desc-0').value.trim(),
          category: 'postre'
        },
        {
          stamp: 10,
          icon: document.getElementById('m-icon-1').value.trim() || '👑',
          title: document.getElementById('m-title-1').value.trim(),
          description: document.getElementById('m-desc-1').value.trim(),
          category: 'vip'
        },
        {
          stamp: 15,
          icon: document.getElementById('m-icon-2').value.trim() || '🌟',
          title: document.getElementById('m-title-2').value.trim(),
          description: document.getElementById('m-desc-2').value.trim(),
          category: 'vip'
        },
      ];
      sendConfigUpdate({ stamps: { visitIcon, milestones }, visitIcon, stampRewards: milestones }, 'toast-stamps');
    }

    // GUARDAR BASES DE DATOS
    function saveDatabasesConfig() {
      const payload = {
        databases: {
          googleSheetWebhookUrl: document.getElementById('db-sheets-url').value.trim(),
          supabaseEnabled: document.getElementById('db-sb-enabled').checked,
          supabaseProjectUrl: document.getElementById('db-sb-url').value.trim(),
          supabaseAnonKey: document.getElementById('db-sb-key').value.trim(),
        }
      };
      sendConfigUpdate(payload, 'toast-databases');
    }

    // ROTAR PIN DE CAJERO ALEATORIO
    function rotateCashierPin() {
      const newPin = Math.floor(1000 + Math.random() * 9000).toString();
      document.getElementById('sec-cashier-pin').value = newPin;
      saveSecurityConfig();
    }

    // GUARDAR SEGURIDAD (3 PINS + MATRIZ DE PERMISOS)
    function saveSecurityConfig() {
      const permIds = [
        "viewMetrics", "redeemPrizes", "manageChannels", "manageRoulette",
        "manageStamps", "manageBrand", "manageDatabases", "manageComposio"
      ];
      const adminPerms = {};
      const cashierPerms = {};
      permIds.forEach(id => {
        const elAdmin = document.getElementById("perm-admin-" + id);
        const elCashier = document.getElementById("perm-cashier-" + id);
        adminPerms[id] = elAdmin ? elAdmin.checked : false;
        cashierPerms[id] = elCashier ? elCashier.checked : false;
      });

      const payload = {
        security: {
          masterAdminPin: document.getElementById('sec-master-pin').value.trim(),
          managerAdminPin: document.getElementById('sec-manager-pin').value.trim(),
          cashierPin: document.getElementById('sec-cashier-pin').value.trim(),
          roles: {
            admin: adminPerms,
            cashier: cashierPerms,
          },
        }
      };
      sendConfigUpdate(payload, 'toast-security');
    }

    // CONECTAR CON COMPOSIO.DEV INMEDIATAMENTE
    async function connectComposioNow() {
      let apiKey = document.getElementById('comp-api-key').value.trim();
      if (!apiKey) {
        apiKey = prompt("Ingresa tu Composio API Key (comp_live_...):", "");
        if (!apiKey) return;
        document.getElementById('comp-api-key').value = apiKey;
      }
      const payload = {
        composio: {
          enabled: true,
          apiKey: apiKey,
          integrations: {
            googleSheets: document.getElementById('comp-tool-sheets').checked,
            googleContacts: document.getElementById('comp-tool-contacts').checked,
            whatsAppAutoSend: document.getElementById('comp-tool-wa').checked,
            dailyEmailSummary: document.getElementById('comp-tool-email').checked,
          },
          endpoints: {
            googleSheetWebhookUrl: document.getElementById('comp-webhook-url').value.trim(),
          }
        }
      };
      await sendConfigUpdate(payload, 'toast-composio');
      const badge = document.getElementById('comp-status-badge');
      if (badge) {
        badge.innerText = '🟢 Conectado con Composio.dev';
        badge.style.background = 'rgba(16, 185, 129, 0.2)';
        badge.style.color = '#34d399';
        badge.style.border = '1px solid rgba(16, 185, 129, 0.4)';
      }
      alert("⚡ ¡Conexión con Composio.dev establecida con éxito!");
    }

    // GUARDAR CONFIGURACIÓN COMPOSIO
    function saveComposioBackendConfig() {
      const apiKey = document.getElementById('comp-api-key').value.trim();
      const payload = {
        composio: {
          enabled: apiKey.length > 0,
          apiKey: apiKey,
          integrations: {
            googleSheets: document.getElementById('comp-tool-sheets').checked,
            googleContacts: document.getElementById('comp-tool-contacts').checked,
            whatsAppAutoSend: document.getElementById('comp-tool-wa').checked,
            dailyEmailSummary: document.getElementById('comp-tool-email').checked,
          },
          endpoints: {
            googleSheetWebhookUrl: document.getElementById('comp-webhook-url').value.trim(),
          }
        }
      };
      sendConfigUpdate(payload, 'toast-composio');
    }

    // DISPARAR EVENTO DE PRUEBA A COMPOSIO
    async function testComposioSync() {
      try {
        const res = await fetch("/api/prizes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: "Prueba Composio Backend",
            whatsapp: "573009998877",
            email: "admin@composio.dev",
            prizeName: "Premio de Prueba Composio",
            tableNumber: "Mesa VIP",
          }),
        });
        if (res.ok) {
          alert("✅ ¡Evento de prueba enviado a Composio y Google Sheets con éxito!");
        } else {
          alert("⚠️ Evento procesado localmente. Verifica tu API Key o Webhook.");
        }
      } catch (err) {
        alert("Error probando conexión: " + err.message);
      }
    }

    // BÚSQUEDA EN VIVO EN LA TABLA
    function filterTable() {
      const filter = document.getElementById("searchInput").value.toLowerCase();
      const rows = document.querySelectorAll("#tableBody tr");
      rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
      });
    }

    // AUTO-ACTUALIZACIÓN SILENCIOSA DE MÉTRICAS CADA 3 SEGUNDOS
    async function refreshData() {
      try {
        const res = await fetch("/api/metrics");
        if (!res.ok) return;
        const data = await res.json();
        
        const elTotal = document.getElementById("stat-total");
        if (elTotal) elTotal.innerText = data.totalPrizes;
        const elRedeemed = document.getElementById("stat-redeemed");
        if (elRedeemed) elRedeemed.innerText = data.redeemedPrizes;
        const elRate = document.getElementById("stat-rate");
        if (elRate) elRate.innerText = data.conversionRate;
        const elCust = document.getElementById("stat-customers");
        if (elCust) elCust.innerText = data.totalCustomers;

        const searchVal = document.getElementById("searchInput") ? document.getElementById("searchInput").value.trim() : "";
        if (!searchVal && data.prizes) {
          const tbody = document.getElementById("tableBody");
          if (tbody) {
            tbody.innerHTML = data.prizes.map(p => {
              const stamps = p.stamps || 1;
              const stars = "★".repeat(Math.min(5, stamps)) + "☆".repeat(Math.max(0, 5 - stamps));
              const isUsed = p.status === "UTILIZADO";
              const isSecondChance = (p.prizeName || "").includes("2ª Oportunidad");
              const tierBadge = stamps >= 11
                ? '<span style="background: #FFFBEB; color: #78350F; border: 1px solid #F59E0B; padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: 700;">👑 Embajador VIP</span>'
                : stamps >= 6
                ? '<span style="background: #F1F5F9; color: #475569; border: 1px solid #CBD5E1; padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: 700;">🥐 Gourmet Regular</span>'
                : '<span style="background: #FFFBEB; color: #92400E; border: 1px solid #FCD34D; padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: 700;">☕ Café Inicial</span>';

              return \`
                <tr>
                  <td><span class="badge-code">\${p.uniqueCode}</span></td>
                  <td><span style="color: var(--text-muted); font-family: monospace; font-size: 11px;">\${p.wonAt || "Hoy"}</span></td>
                  <td>
                    <strong style="color: var(--text); font-size: 12px;">\${p.customerName || "Cliente"}</strong>
                    <div style="font-size: 11px; color: var(--text-muted);">\${p.whatsapp || "Sin número"}</div>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--text); font-size: 12px;">\${p.prizeName}</div>
                    <div style="font-size: 10px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; margin-top: 3px;">
                      <span style="background: #F1F5F9; padding: 1px 6px; border-radius: 4px; border: 1px solid var(--card-border);">\${p.tableNumber || "Mesa 1"}</span>
                      \${isSecondChance ? '<span style="background: var(--accent-light); color: var(--accent); padding: 1px 6px; border-radius: 4px; font-weight: 700;">⭐ 2ª Oportunidad</span>' : ''}
                    </div>
                  </td>
                  <td>
                    <div class="stars-cell">\${stars}</div>
                    <div style="margin-top: 3px; display: flex; align-items: center; gap: 4px;">
                      \${tierBadge}
                      <span style="font-size: 10px; color: var(--text-muted); font-family: monospace;">(\${stamps}/15)</span>
                    </div>
                  </td>
                  <td>
                    <span class="\${isUsed ? "badge-status-used" : "badge-status-available"}">
                      \${isUsed ? "✓ CANJEADO" : "⏳ DISPONIBLE"}
                    </span>
                    \${isUsed && p.usedAt ? \`<div style="font-size: 10px; color: var(--text-muted); margin-top: 3px;">Hora: \${p.usedAt}</div>\` : ""}
                  </td>
                </tr>
              \`;
            }).join("");
          }
        }

        if (data.logs) {
          const logBox = document.getElementById("logBox");
          if (logBox) {
            logBox.innerHTML = data.logs.map(l => \`
              <div class="log-item">
                <div class="log-top">
                  <span class="method-tag \${l.method === "POST" ? "method-post" : "method-get"}">\${l.method}</span>
                  <span class="log-url">\${l.url}</span>
                  <span class="log-time">\${l.timestamp}</span>
                </div>
                <div class="log-detail">\${l.detail}</div>
              </div>
            \`).join("");
          }
        }
      } catch (e) {
        // Silencioso
      }
    }

    setInterval(refreshData, 3000);
  
    // GESTIÓN DE 10 MESAS EN EL BACKEND
    async function resetBackendTable(num) {
      if (!confirm("¿Deseas liberar la Mesa " + num + " para el siguiente comensal?")) return;
      try {
        const res = await fetch("/api/tables/mesa-" + num + "/reset", { method: "POST" });
        const data = await res.json();
        if (data.success) {
          alert("¡Mesa " + num + " liberada con éxito!");
          window.location.reload();
        }
      } catch (err) {
        alert("Error de conexión al liberar mesa.");
      }
    }

    function loadTableConfigForm() {
      const num = parseInt(document.getElementById("cfgTableSelect").value, 10);
      const tables = "TABLES_REF";
      // auto fill name
      document.getElementById("cfgTableName").value = "Mesa " + num;
    }

    async function saveBackendTableConfig() {
      const num = parseInt(document.getElementById("cfgTableSelect").value, 10);
      const name = document.getElementById("cfgTableName").value.trim() || ("Mesa " + num);
      const zone = document.getElementById("cfgTableZone").value;
      const capacity = parseInt(document.getElementById("cfgTableCapacity").value, 10);

      try {
        const res = await fetch("/api/tables", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tableNumber: num,
            name: name,
            zone: zone,
            capacity: capacity
          })
        });
        const data = await res.json();
        if (data.success) {
          alert("¡Configuración de Mesa " + num + " guardada!");
          window.location.reload();
        }
      } catch (err) {
        alert("Error al guardar mesa.");
      }
    }

    // GESTIÓN Y REVISIÓN DE MISIONES GOURMET (1-CLIC)
    async function reviewSubmission(submissionId, action) {
      if (!confirm(action === 'approve' ? '¿Aprobar esta misión y acreditar los sellos al comensal?' : '¿Rechazar esta evidencia de misión?')) {
        return;
      }

      try {
        const res = await fetch('/api/missions/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ submissionId, action })
        });
        const data = await res.json();
        if (data.success) {
          const badge = document.getElementById('badge-sub-' + submissionId);
          if (badge) {
            badge.innerText = action === 'approve' ? 'APROBADO' : 'RECHAZADO';
            badge.style.background = action === 'approve' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
            badge.style.color = action === 'approve' ? '#34d399' : '#f87171';
            badge.style.borderColor = action === 'approve' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)';
          }
          const actionsDiv = document.getElementById('actions-sub-' + submissionId);
          if (actionsDiv) {
            actionsDiv.innerHTML = '<span style="font-size: 11px; color: var(--text-muted);">Revisado ahora</span>';
          }
          alert(action === 'approve' ? '¡Misión APROBADA con éxito! Los sellos han sido acreditados al cliente.' : 'Misión rechazada.');
        } else {
          alert('Error: ' + (data.error || 'No se pudo procesar la revisión'));
        }
      } catch (err) {
        alert('Error de conexión al revisar misión');
      }
    }

    // SORTEO MENSUAL DE LA CENA PARA 2 PERSONAS
    async function drawContestWinner() {
      if (!confirm("¿Deseas realizar el Sorteo Aleatorio de la Cena para 2 entre los participantes clasificados?")) {
        return;
      }
      try {
        const res = await fetch("/api/contest/draw", { method: "POST" });
        const data = await res.json();
        if (data.success && data.winner) {
          const w = data.winner;
          alert("🎉 ¡FELICITACIONES!\\n\\nEl ganador oficial de la Cena Degustación para 2 Personas es:\\n\\n" + w.customerName + " (" + w.customerWhatsapp + ")\\nBoleto Oficial: " + w.ticketCode);
          window.location.reload();
        } else {
          alert(data.error || "No se pudo realizar el sorteo.");
        }
      } catch (err) {
        alert("Error al conectar con el servidor: " + err.message);
      }
    }

    async function addDemoContestEntry() {
      const demoNames = ["Valentina Rojas", "Santiago Gómez", "Camila Restrepo", "Mateo Silva", "Sofía Morales"];
      const randName = demoNames[Math.floor(Math.random() * demoNames.length)];
      const randPhone = "57310" + Math.floor(1000000 + Math.random() * 9000000);
      try {
        const res = await fetch("/api/contest/enter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: randName,
            customerWhatsapp: randPhone,
            missionsCount: 5,
          }),
        });
        const data = await res.json();
        if (data.success) {
          alert("✓ Participante de prueba clasificado al concurso: " + randName + " (" + data.entry.ticketCode + ")");
          window.location.reload();
        }
      } catch (err) {
        alert("Error al registrar participante demo: " + err.message);
      }
    }

    // GUARDAR CONFIGURACIÓN DEL EMBUDO DE REPUTACIÓN
    async function saveReputationConfig(e) {
      if (e) e.preventDefault();
      const googleUrl = document.getElementById("repGoogleUrl").value.trim();
      const whatsappPhone = document.getElementById("repWhatsappPhone").value.trim();
      const minRating = parseInt(document.getElementById("repMinRating").value, 10) || 4;
      const autoRedirect = document.getElementById("repAutoRedirect").checked;

      try {
        const res = await fetch("/api/reputation/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            googleBusinessUrl: googleUrl,
            whatsappPrivateNumber: whatsappPhone,
            minRatingForGoogle: minRating,
            autoRedirectGoogle: autoRedirect
          })
        });
        const data = await res.json();
        if (data.success) {
          alert("✓ ¡Configuración del Embudo de Reputación guardada exitosamente!");
        } else {
          alert("Error: " + (data.error || "No se pudo guardar"));
        }
      } catch (err) {
        alert("Error de conexión al guardar configuración");
      }
    }

    // COPIAR MENSAJE DE FLUJO AUTOMATIZADO AL PORTAPAPELES
    function copyFlowMessage(btn, text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          const original = btn.innerHTML;
          btn.innerHTML = "✓ ¡Copiado!";
          btn.style.background = "#059669";
          btn.style.color = "#ffffff";
          btn.style.borderColor = "#10b981";
          setTimeout(() => {
            btn.innerHTML = original;
            btn.style.background = "";
            btn.style.color = "";
            btn.style.borderColor = "";
          }, 2000);
        }).catch(() => {
          prompt("Copia el texto del flujo:", text);
        });
      } else {
        prompt("Copia el texto del flujo:", text);
      }
    }

    // ==========================================
    // INTEGRACIÓN CON HERMES (AGENTE IA, CRM & POS)
    // ==========================================
    async function saveHermesConfig() {
      const enabled = document.getElementById("hermesEnabled") ? document.getElementById("hermesEnabled").value === "true" : true;
      const mode = document.getElementById("hermesMode") ? document.getElementById("hermesMode").value : "agent";
      const apiUrl = document.getElementById("hermesApiUrl") ? document.getElementById("hermesApiUrl").value.trim() : "";
      const apiKey = document.getElementById("hermesApiKey") ? document.getElementById("hermesApiKey").value.trim() : "";
      const agentId = document.getElementById("hermesAgentId") ? document.getElementById("hermesAgentId").value.trim() : "";

      const events = {
        syncPrizes: document.getElementById("hermes_ev_prizes") ? document.getElementById("hermes_ev_prizes").checked : true,
        syncPinRedemption: document.getElementById("hermes_ev_pin") ? document.getElementById("hermes_ev_pin").checked : true,
        syncCustomers: document.getElementById("hermes_ev_customers") ? document.getElementById("hermes_ev_customers").checked : true,
        syncReputation: document.getElementById("hermes_ev_reputation") ? document.getElementById("hermes_ev_reputation").checked : true,
        syncMissions: document.getElementById("hermes_ev_missions") ? document.getElementById("hermes_ev_missions").checked : true,
      };

      const payload = {
        hermes: {
          enabled,
          mode,
          apiUrl,
          apiKey,
          agentId,
          events,
        }
      };

      try {
        const res = await fetch("/api/hermes/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          const toast = document.getElementById("toast-hermes");
          if (toast) {
            toast.style.display = "inline-block";
            setTimeout(() => { toast.style.display = "none"; }, 3000);
          }
          const badge = document.getElementById("hermesStatusBadge");
          if (badge) {
            badge.innerText = enabled ? "🟢 ACTIVO & CONECTADO" : "⏸️ PAUSADO";
            badge.style.color = enabled ? "#059669" : "#d97706";
          }
          alert("✓ ¡Configuración de conexión con Hermes guardada con éxito!");
        } else {
          alert("Error al guardar Hermes: " + (data.error || ""));
        }
      } catch (err) {
        alert("Error de conexión al guardar configuración de Hermes: " + err.message);
      }
    }

    async function testHermesConnection() {
      const resEl = document.getElementById("hermesTestResult");
      if (resEl) {
        resEl.style.display = "inline-block";
        resEl.style.color = "#d97706";
        resEl.innerText = "⏳ Verificando enlace con Hermes...";
      }

      try {
        const res = await fetch("/api/hermes/test", { method: "POST" });
        const data = await res.json();
        if (data.success) {
          if (resEl) {
            resEl.style.color = "#059669";
            resEl.innerText = "✓ Conectado a Hermes (" + (data.latencyMs || 25) + "ms) - " + (data.endpoint || "");
          }
          const latVal = document.getElementById("hermesLatencyVal");
          if (latVal) latVal.innerText = (data.latencyMs || 25) + "ms";
          const pingVal = document.getElementById("hermesLastPingVal");
          if (pingVal) pingVal.innerText = "Último ping: " + (data.lastPing || "Ahora");
          const pingsCount = document.getElementById("hermesPingsVal");
          if (pingsCount && data.stats) pingsCount.innerText = data.stats.totalPings || 1;
          alert("🤖 ¡Conexión con Hermes exitosa!\\n\\n" + data.message);
        } else {
          if (resEl) {
            resEl.style.color = "#dc2626";
            resEl.innerText = "✗ Error al conectar con Hermes";
          }
          alert("Error de prueba con Hermes: " + (data.error || ""));
        }
      } catch (err) {
        if (resEl) {
          resEl.style.color = "#dc2626";
          resEl.innerText = "✗ Error de red al probar Hermes";
        }
        alert("Error de conexión al probar Hermes: " + err.message);
      }
    }

    function copyHermesWebhook() {
      const inp = document.getElementById("hermesWebhookUrl");
      if (!inp) return;
      const url = inp.value;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          alert("✓ URL del webhook copiada al portapapeles:\\n" + url);
        }).catch(() => {
          prompt("Copia la URL del Webhook de Hermes:", url);
        });
      } else {
        prompt("Copia la URL del Webhook de Hermes:", url);
      }
    }
  
    function copyKioskUrl() {
      const inp = document.getElementById("kioskUrlInput");
      if (!inp) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(inp.value).then(() => {
          alert("✓ Enlace del Kiosko copiado: " + inp.value);
        }).catch(() => {
          prompt("Copia el enlace del Kiosko:", inp.value);
        });
      } else {
        prompt("Copia el enlace del Kiosko:", inp.value);
      }
    }
</script>
</body>
</html>`;
}
