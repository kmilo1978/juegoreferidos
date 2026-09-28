import { useEffect, useRef, type ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  className = "",
  variant = "default",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: "default" | "image";
  as?: "div" | "section" | "li" | "article" | "figure";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Si el elemento ya está visible en la parte alta inicial de la pantalla al cargar
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.45 && rect.bottom > 0) {
      el.classList.add("is-visible");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            requestAnimationFrame(() => {
              el.classList.add("is-visible");
            });
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -80px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Efecto Parallax cinemático sutil para fotografía editorial
  useEffect(() => {
    if (variant !== "image") return;
    const el = ref.current;
    if (!el) return;

    let ticking = false;

    const updateParallax = () => {
      const rect = el.getBoundingClientRect();
      const winHeight = window.innerHeight;

      if (rect.bottom > -100 && rect.top < winHeight + 100) {
        const centerY = rect.top + rect.height / 2;
        const screenCenterY = winHeight / 2;
        const progress = (centerY - screenCenterY) / winHeight;
        // Desplazamiento sutil de máxima elegancia (hasta 18px)
        const yOffset = Math.round(progress * 18);
        el.style.setProperty("--parallax-y", `${yOffset}px`);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateParallax();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [variant]);

  const baseClass = variant === "image" ? "reveal-image" : "reveal";

  return (
    <Tag
      ref={ref as never}
      className={`${baseClass} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
