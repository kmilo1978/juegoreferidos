import { useState, useEffect } from "react";
import { Bell, BellRing, CheckCircle2, Sparkles, X, Coffee, ShieldCheck } from "lucide-react";
import { playVictoryFanfareSound } from "../../lib/soundEffects";

interface PushNotificationPromptProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  customerWhatsapp?: string;
  onSubscribed?: () => void;
}

export function PushNotificationPrompt({
  isOpen,
  onClose,
  customerName,
  customerWhatsapp,
  onSubscribed,
}: PushNotificationPromptProps) {
  const [permissionState, setPermissionState] = useState<NotificationPermission>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionState(Notification.permission);
      if (Notification.permission === "granted") {
        setSuccess(true);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setErrorMessage("Tu navegador no soporta notificaciones push.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);

      if (permission === "granted") {
        playVictoryFanfareSound();
        setSuccess(true);

        // Generar o recuperar token simulado / real de suscripción
        let pushEndpoint = "https://fcm.googleapis.com/fcm/send/device_" + Date.now();
        if ("serviceWorker" in navigator) {
          try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
              pushEndpoint = sub.endpoint;
            }
          } catch {}
        }

        // Registrar suscriptor en el backend modular
        try {
          await fetch("http://localhost:3001/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              endpoint: pushEndpoint,
              customerWhatsapp: customerWhatsapp || null,
              customerName: customerName || "Invitado VIP",
            }),
          });
        } catch (backendErr) {
          console.warn("[Push] Backend local no disponible para registrar suscriptor:", backendErr);
        }

        // Enviar notificación local de bienvenida
        try {
          new Notification("? ¡Bienvenido a Bliss Soul VIP!", {
            body: `Hola ${customerName || "Invitado"}, tus notificaciones están activas. Te avisaremos cuando tu orden esté lista.`,
            icon: "/assets/emblema-dorado.png",
          });
        } catch {}

        if (onSubscribed) onSubscribed();

        setTimeout(() => {
          onClose();
        }, 2200);
      } else if (permission === "denied") {
        setErrorMessage("Has bloqueado las notificaciones. Puedes activarlas en el icono de candado de tu navegador.");
      }
    } catch (err: any) {
      setErrorMessage("No se pudo activar: " + (err.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#fffdfa] rounded-3xl shadow-2xl border border-[#e8dfd3] p-6 text-neutral-800 overflow-hidden">
        {/* Adorno superior dorado */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#8e6e22] via-[#d4af37] to-[#8e6e22]" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-xl font-serif font-bold text-neutral-900">
              ¡Notificaciones VIP Activadas!
            </h3>
            <p className="text-sm text-neutral-600 max-w-xs mx-auto">
              Te avisaremos en tu pantalla cuando tu café o postre esté listo y cuando tengamos beneficios exclusivos.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Suscripción vinculada exitosamente
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Cabecera */}
            <div className="text-center space-y-2 pt-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-[#8e6e22] flex items-center justify-center shadow-md border border-amber-200">
                <BellRing className="w-7 h-7 animate-pulse" />
              </div>
              <span className="inline-block text-[11px] uppercase tracking-wider font-semibold text-[#8e6e22] bg-[#fbf5eb] px-3 py-0.5 rounded-full border border-[#ecdcc3]">
                Club VIP Bliss Soul
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900 leading-snug">
                ¿Deseas recibir avisos de tu pedido y promociones?
              </h3>
              <p className="text-xs text-neutral-600">
                Mantente al día sin descargar ninguna app pesada, directamente en tu navegador.
              </p>
            </div>

            {/* Lista de beneficios */}
            <div className="bg-[#fcfaf6] rounded-2xl p-3.5 border border-[#eee4d5] space-y-2.5 text-xs text-neutral-700">
              <div className="flex items-start gap-2.5">
                <Coffee className="w-4 h-4 text-[#8e6e22] shrink-0 mt-0.5" />
                <span>
                  <strong>Aviso de mesa y barra:</strong> Te notificamos cuando tu bebida de autor o tarta esté servida.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#8e6e22] shrink-0 mt-0.5" />
                <span>
                  <strong>Beneficios 2x1 y Sellos Dobles:</strong> Acceso a días de doble sello en tu tarjeta digital.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>100% libre de spam:</strong> Solo alertas relevantes de tu visita. Puedes desactivarlo cuando quieras.
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {errorMessage}
              </div>
            )}

            {/* Botones de acción */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleRequestPermission}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#8e6e22] via-[#b38e35] to-[#8e6e22] text-white font-medium text-sm shadow-md hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Activando...
                  </span>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    ¡Sí, Activar Notificaciones VIP!
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 text-xs font-medium transition-colors cursor-pointer"
              >
                Quizás más tarde
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
