import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "admin-rewrite",
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url) {
            const cleanUrl = req.url.split("?")[0];
            if (cleanUrl === "/admin" || cleanUrl === "/admin/") {
              req.url = req.url.replace(cleanUrl, "/admin.html");
            }
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    watch: {
      ignored: ["**/server/**", "**/db.json", "**/*.log"],
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        admin: path.resolve(__dirname, 'admin.html')
      }
    }
  }
});
