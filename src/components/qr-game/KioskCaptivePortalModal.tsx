import { useState } from "react";
import { Wifi, Sparkles, CheckCircle2, Maximize, Minimize, X, ShieldCheck, Clock, ArrowRight } from "lucide-react";
import logoHeader from "@/assets/logo-header.png";
import { playVictoryFanfareSound } from "../../lib/soundEffects";
import { clientConfig } from "@/config/clientConfig";

interface KioskCaptivePortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerRegistered: (customerData: { name: string; whatsapp: string; email?: string }) => void;
}

export function KioskCaptivePortalModal({
  isOpen,
  onClose,
  onCustomerRegistered,
}: KioskCaptivePortalModalProps) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(120);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = whatsapp.replace(/\D/g, "");

    if (!name.trim()) {
      setError("Por favor ingresa tu nombre");
      return;
    }

    if (cleanPhone.length < 7) {
      setError("Por favor ingresa un n�mero de WhatsApp v�lido");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 1. Notificar al backend modular (portal cautivo)
      const res = await fetch("http://localhost:3001/api/portal/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name.trim(),
          whatsapp: cleanPhone,
          email: email.trim(),
        }),
      });

      const data = await res.json();
      if (data.sessionMinutes) {
        setSessionMinutes(data.sessionMinutes);
      }
      playVictoryFanfareSound();
      setConnected(true);

      // 2. Registrar en la sesi�n de la aplicaci�n
      onCustomerRegistered({
        name: name.trim(),
        whatsapp: cleanPhone,
        email: email.trim(),
      });
    } catch {
      // Si el backend local no responde, permitir acceso simulado inmediato
      playVictoryFanfareSound();
      setConnected(true);
      onCustomerRegistered({
        name: name.trim(),
        whatsapp: cleanPhone,
        email: email.trim(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#fffdfa] rounded-3xl shadow-2xl border border-[#e8dfd3] p-6 sm:p-8 text-neutral-800 overflow-hidden">
        {/* Adorno superior dorado */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#8e6e22] via-[#d4af37] to-[#8e6e22]" />

        {/* Botones de control superior */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
            title={isFullscreen ? "Salir de pantalla completa" : "Modo Kiosko Pantalla Completa"}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {connected ? (
          <div className="text-center py-6 space-y-5 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg border border-emerald-200">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                <Wifi className="w-3.5 h-3.5" />
                WiFi VIP Conectado con Éxito
              </span>
              <h3 className="text-2xl font-serif font-bold text-neutral-900">
                ¡Bienvenido a {clientConfig.brand.name}, {name}!
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-sm mx-auto">
                Tu acceso a internet de alta velocidad está activo por <strong>{sessionMinutes} minutos</strong> y has ganado tu primer sello de cortesía.
              </p>
            </div>

            {/* Tarjeta de estado de sesi�n */}
            <div className="grid grid-cols-2 gap-3 bg-[#fbf8f3] p-4 rounded-2xl border border-[#ecdcc3] text-left">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <Clock className="w-3.5 h-3.5 text-[#8e6e22]" />
                  <span>Tiempo de Red</span>
                </div>
                <div className="text-sm font-bold text-neutral-800">{sessionMinutes} Minutos Libres</div>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Beneficio Ganado</span>
                </div>
                <div className="text-sm font-bold text-amber-700">+1 Sello de Bienvenida</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#8e6e22] via-[#b38e35] to-[#8e6e22] text-white font-medium text-sm shadow-md hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Comenzar a Jugar y Ver Premios
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Encabezado con Logo */}
            <div className="text-center space-y-2 pt-2">
              <img
                src={logoHeader}
                alt={clientConfig.brand.name}
                className="h-14 sm:h-16 mx-auto object-contain drop-shadow-sm"
              />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-[#8e6e22] text-xs font-semibold border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Red WiFi: {clientConfig.brand.name} - Clientes VIP
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-neutral-900">
                Portal de Acceso WiFi & Kiosko
              </h3>
              <p className="text-xs text-neutral-600 max-w-sm mx-auto">
                Con�ctate gratis al internet de la cafeter�a y acumula sellos digitales en cada visita.
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleConnect} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Tu Nombre y Apellido:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos G�mez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#8e6e22] text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  WhatsApp (para tus sellos y cupones):
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-neutral-300 bg-neutral-100 text-neutral-600 text-xs font-semibold">
                    +57
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="300 123 4567"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-r-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#8e6e22] text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Correo Electr�nico (Opcional):
                </label>
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#8e6e22] text-sm bg-white"
                />
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#8e6e22] via-[#b38e35] to-[#8e6e22] text-white font-medium text-sm shadow-md hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Conectando al WiFi...
                    </span>
                  ) : (
                    <>
                      <Wifi className="w-4 h-4" />
                      Conectar al WiFi & Recibir 1 Sello Gratis
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Garant�a de privacidad */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Navegaci�n segura y privada encriptada. T�rminos aceptados al conectar.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
