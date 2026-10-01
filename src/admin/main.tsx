import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AdminApp } from "./AdminApp";
import "../index.css";
import { BarChart3 } from "lucide-react";

// Blindaje global para evitar ReferenceError si cualquier módulo o caché busca BarChart
if (typeof window !== "undefined") {
  (window as any).BarChart = BarChart3;
  (window as any).BarChart3 = BarChart3;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>
);
