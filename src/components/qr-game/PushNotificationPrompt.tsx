import { clientConfig } from "@/config/clientConfig";
import { useState, useEffect } from "react";
import { Bell, BellRing, BellOff, CheckCircle2, Sparkles, X, Coffee, ShieldCheck, AlertCircle } from "lucide-react";
import { playVictoryFanfareSound } from "../../lib/soundEffects";

interface PushNotificationPromptProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  customerWhatsapp?: string;
  onSubscribed?: () => void;
  onUnsubscribed?: () => void;
}

export function PushNotificationPrompt({
  isOpen,
  onClose,
  customerName,
  customerWhatsapp,
  onSubscribed,
  onUnsubscribed,
}: PushNotificationPromptProps) {
  const [permissionState, setPermissionState] = useState<NotificationPermission>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });

  const [loading, setLoading] = useState(false);
  const [unsubscribing, setUnsubscribing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [unsubscribedSuccess, setUnsubscribedSuccess] = useState(false);
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

  // Activar Notificaciones Push
  const handleRequestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setErrorMessage("Tu navegador no soporta notificaciones push.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setUnsubscribedSuccess(false);

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

        // Registrar suscriptor en el backend
        try {
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              endpoint: pushEndpoint,
              customerWhatsapp: customerWhatsapp || null,
              customerName: customerName || "Invitado VIP",
            }),
          });
        } catch (backendErr) {
          console.warn("[Push] Error al registrar suscriptor:", backendErr);
        }

        // Notificación local de cortesía
        try {
          new Notification(`🎉 ¡Bienvenido a ${clientConfig.brand.name} VIP!`, {
            body: `Hola ${customerName || "Invitado"}, tus notificaciones están activas. Te avisaremos cuando tu orden esté lista.`,
            icon: "/assets/emblema-dorado.png",
          });
        } catch {}

        if (onSubscribed) onSubscribed();

        setTimeout(() => {
          onClose();
        }, 2500);
      } else if (permission === "denied") {
        setErrorMessage("Has bloqueado las notificaciones en tu navegador. Puedes desbloquearlas tocando el icono de candado en la barra de direcciones.");
      }
    } catch (err: any) {
      setErrorMessage("No se pudo activar: " + (err.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  };

  // DARSE DE BAJA (Opt-Out) Y COMUNICAR CON LA BASE DE DATOS
  const handleUnsubscribe = async () => {
    setUnsubscribing(true);
    setErrorMessage("");

    try {
      // 1. Obtener endpoint si está registrado en ServiceWorker (sin colgar la promesa)
      let pushEndpoint = "";
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        try {
          const reg = await Promise.race([
            navigator.serviceWorker.getRegistration(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("sw_timeout")), 300)),
          ]).catch(() => null);

          if (reg && (reg as ServiceWorkerRegistration).pushManager) {
            const sub = await (reg as ServiceWorkerRegistration).pushManager.getSubscription();
            if (sub) {
              pushEndpoint = sub.endpoint;
              await sub.unsubscribe().catch(() => {});
            }
          }
        } catch {
          // ignore
        }
      }

      // 2. Comunicar baja a la base de datos del backend
      const res = await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: pushEndpoint || undefined,
          customerWhatsapp: customerWhatsapp || undefined,
          customerName: customerName || "Invitado en Mesa",
          reason: "El usuario pulsó el botón 'Darse de baja' en la aplicación",
        }),
      });

      if (!res.ok) throw new Error("No se pudo procesar la baja en el servidor");

      setSuccess(false);
      setUnsubscribedSuccess(true);
      if (onUnsubscribed) onUnsubscribed();
    } catch (err: any) {
      setErrorMessage("Error al darse de baja: " + (err.message || "Inténtalo de nuevo"));
    } finally {
      setUnsubscribing(false);
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

        {/* ESTADO 1: BAJA CONFIRMADA */}
        {unsubscribedSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center shadow-inner border border-neutral-200">
              <BellOff className="w-8 h-8 text-neutral-500" />
            </div>
            <h3 className="text-xl font-serif font-bold text-neutral-900">
              Te has dado de baja
            </h3>
            <p className="text-xs text-neutral-600 max-w-xs mx-auto leading-relaxed">
              Tu dispositivo ha sido dado de baja en la base de datos del restaurante. Ya no recibirás más notificaciones push en este navegador.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold border border-neutral-300">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
              Baja registrada en base de datos
            </div>

            <div className="pt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleRequestPermission}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#8e6e22] border border-amber-300 text-xs font-bold transition-colors cursor-pointer"
              >
                ¿Cambiaste de opinión? Volver a Activar
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 px-4 rounded-xl bg-transparent hover:bg-neutral-100 text-neutral-500 text-xs font-medium cursor-pointer"
              >
                Cerrar ventana
              </button>
            </div>
          </div>
        ) : success ? (
          /* ESTADO 2: NOTIFICACIONES ACTIVAS CON BOTÓN DE DARSE DE BAJA */
          <div className="text-center py-5 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-xl font-serif font-bold text-neutral-900">
              ¡Notificaciones VIP Activas!
            </h3>
            <p className="text-xs text-neutral-600 max-w-xs mx-auto leading-relaxed">
              Te avisaremos en tu pantalla cuando tu café o postre esté listo y cuando tengamos beneficios exclusivos para tu mesa.
            </p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Suscripción vinculada exitosamente
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {errorMessage}
              </div>
            )}

            <div className="pt-4 border-t border-neutral-200 space-y-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-[#d4af37] text-neutral-950 font-bold text-xs hover:brightness-105 transition-all cursor-pointer shadow-sm"
              >
                Entendido, Continuar
              </button>

              <button
                type="button"
                onClick={handleUnsubscribe}
                disabled={unsubscribing}
                className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 hover:text-red-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <BellOff className="w-3.5 h-3.5" />
                <span>{unsubscribing ? "Procesando baja en BD..." : "Darse de baja de notificaciones"}</span>
              </button>
            </div>
          </div>
        ) : (
          /* ESTADO 3: SOLICITUD DE SUSCRIPCIÓN CON ENLACE DE BAJA */
          <div className="space-y-5">
            {/* Cabecera */}
            <div className="text-center space-y-2 pt-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-[#8e6e22] flex items-center justify-center shadow-md border border-amber-200">
                <BellRing className="w-7 h-7 animate-pulse" />
              </div>
              <span className="inline-block text-[11px] uppercase tracking-wider font-semibold text-[#8e6e22] bg-[#fbf5eb] px-3 py-0.5 rounded-full border border-[#ecdcc3]">
                Club VIP {clientConfig.brand.name}
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900 leading-snug">
                ¿Deseas recibir avisos de tu pedido y promociones?
              </h3>
              <p className="text-xs text-neutral-600">
                Mantente al día sin descargar apps pesadas, directamente en tu navegador móvil.
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
                  <strong>Beneficios 2x1 y Sellos Dobles:</strong> Acceso exclusivo a días de doble sello en tu tarjeta digital.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>100% libre de spam:</strong> Solo alertas de tu interés. Tienes la opción de darte de baja en cualquier momento con un clic.
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Botones de acción */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleRequestPermission}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[var(--gold)] text-neutral-950 font-bold text-sm shadow-md hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                    Activando...
                  </span>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    ¡Sí, Activar Notificaciones VIP!
                  </>
                )}
              </button>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-3 rounded-xl bg-transparent hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 text-xs font-medium transition-colors cursor-pointer"
                >
                  Quizás más tarde
                </button>

                <button
                  type="button"
                  onClick={handleUnsubscribe}
                  disabled={unsubscribing}
                  className="py-2 px-3 rounded-xl text-neutral-400 hover:text-red-700 hover:bg-red-50 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Darse de baja de la base de datos"
                >
                  <BellOff className="w-3 h-3" />
                  <span>Darse de baja</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
