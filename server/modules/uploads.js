/**
 * MÓDULO DE SUBIDA DE ARCHIVOS
 * ----------------------------
 * Soporta la subida del logo del prospecto para el Generador de Demo.
 *
 * Flujo:
 *  - POST /api/demo/upload-logo  { dataUrl: "data:image/png;base64,..." }
 *      Valida tipo y tamaño, guarda el archivo en `public/uploads/` con un
 *      nombre único y devuelve { success, url: "/uploads/<archivo>" }.
 *      Esa URL (hecha absoluta por el frontend) se incrusta en el querystring
 *      del enlace del demo (?logo=...), que debe ser corto — por eso NO se usa
 *      la data URL base64 directamente (reventaría el QR y el límite de URL).
 *  - GET /uploads/<archivo>  sirve el archivo estáticamente (necesario en dev;
 *      en producción el host sirve `public/` junto al frontend).
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { readBody, logRequest } from "../state.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// server/modules -> ../../public/uploads
const PUBLIC_DIR = path.join(__dirname, "..", "..", "public");
const UPLOADS_DIR = path.join(PUBLIC_DIR, "uploads");

// Formatos de imagen permitidos: mime -> extensión
const ALLOWED = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
};

const CONTENT_TYPES = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  svg: "image/svg+xml",
  gif: "image/gif",
};

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB de imagen decodificada

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export function handleUploads(req, res, pathname) {
  // --- Subir logo (protegido por token admin en index.js) ---
  if (pathname === "/api/demo/upload-logo" && req.method === "POST") {
    (async () => {
      try {
        const { dataUrl } = await readBody(req, 4 * 1024 * 1024); // 4 MB de body (base64 infla ~33%)

        if (!dataUrl || typeof dataUrl !== "string") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Falta la imagen (dataUrl)" }));
          return;
        }

        const match = /^data:([a-z0-9.+/-]+);base64,(.+)$/i.exec(dataUrl.trim());
        if (!match) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Formato inválido: se espera una data URL base64" }));
          return;
        }

        const mime = match[1].toLowerCase();
        const ext = ALLOWED[mime];
        if (!ext) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: `Tipo no permitido (${mime}). Usa PNG, JPG, WebP, SVG o GIF.` }));
          return;
        }

        const buffer = Buffer.from(match[2], "base64");
        if (buffer.length === 0) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "La imagen está vacía" }));
          return;
        }
        if (buffer.length > MAX_BYTES) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: `La imagen pesa ${Math.round(buffer.length / 1024)} KB (máx. 2 MB)` }));
          return;
        }

        ensureUploadsDir();
        const name = `logo-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
        fs.writeFileSync(path.join(UPLOADS_DIR, name), buffer);

        const url = `/uploads/${name}`;
        logRequest("POST", "/api/demo/upload-logo", 200, `🖼️ Logo de demo subido: ${name} (${Math.round(buffer.length / 1024)} KB)`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, url }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    })();
    return true;
  }

  // --- Servir archivos subidos (público) ---
  if (req.method === "GET" && pathname.startsWith("/uploads/")) {
    // Evita traversal: solo el nombre base, sin separadores de ruta.
    const requested = decodeURIComponent(pathname.slice("/uploads/".length));
    const safeName = path.basename(requested);
    if (safeName !== requested || !safeName) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Nombre de archivo inválido" }));
      return true;
    }

    const filePath = path.join(UPLOADS_DIR, safeName);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Archivo no encontrado" }));
      return true;
    }

    const ext = path.extname(safeName).slice(1).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    });
    fs.createReadStream(filePath).pipe(res);
    return true;
  }

  return false;
}
