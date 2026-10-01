import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { Dashboard } from "./pages/Dashboard";
import { Sessions } from "./pages/Sessions";
import { Prizes } from "./pages/Prizes";
import { Missions } from "./pages/Missions";
import { AdminConfig } from "./pages/AdminConfig";
import { WifiPortal } from "./pages/WifiPortal";
import { Push } from "./pages/Push";

export function AdminApp() {
  return (
    <BrowserRouter basename="/admin">
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
    </BrowserRouter>
  );
}
