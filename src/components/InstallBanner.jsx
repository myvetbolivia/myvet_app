import { useEffect, useState } from "react";
import { Download, X, Share, PlusSquare, MoreVertical } from "lucide-react";

// Aviso "Descargar App" de la página principal.
// En Android abre la ventanita de instalación del celular; en iPhone y en
// navegadores internos (WhatsApp, Instagram...) muestra los pasos a seguir.

const DISMISS_KEY = "myvet_aviso_app_cerrado";

// El celular avisa que se puede instalar apenas carga la página, así que
// guardamos ese aviso acá aunque el componente todavía no esté en pantalla.
let deferredPrompt = null;
const listeners = new Set();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    listeners.forEach((fn) => fn());
  });
}

function detectDevice() {
  const ua = navigator.userAgent || "";
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isMobile = isIOS || /android/i.test(ua);
  const inApp = /FBAN|FBAV|Instagram|WhatsApp|TikTok|Snapchat|Line\//i.test(ua);
  const installed = window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
  return { isIOS, isMobile, inApp, installed };
}

function wasDismissed() {
  try { return localStorage.getItem(DISMISS_KEY) === "1"; } catch { return false; }
}

export default function InstallBanner({ style }) {
  const [device] = useState(detectDevice);
  const [canPrompt, setCanPrompt] = useState(!!deferredPrompt);
  const [hidden, setHidden] = useState(wasDismissed);
  const [sheet, setSheet] = useState(null); // "ios" | "android" | "inapp" | null

  useEffect(() => {
    const update = () => setCanPrompt(!!deferredPrompt);
    listeners.add(update);
    const onInstalled = () => setHidden(true);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      listeners.delete(update);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // No se muestra si ya está instalada, si la cerraron, o en computadora sin opción de instalar.
  if (hidden || device.installed || (!device.isMobile && !canPrompt)) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* sin almacenamiento, no pasa nada */ }
    setHidden(true);
  };

  const install = async () => {
    if (device.inApp) return setSheet("inapp");
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice.catch(() => null);
      deferredPrompt = null;
      setCanPrompt(false);
      if (choice?.outcome === "accepted") setHidden(true);
      return;
    }
    setSheet(device.isIOS ? "ios" : "android");
  };

  const steps = {
    ios: {
      title: "Instalá MyVet en tu iPhone",
      items: [
        [<Share size={16} key="i" />, <>Tocá <b>Compartir</b>, abajo en la pantalla</>],
        [<PlusSquare size={16} key="i" />, <>Elegí <b>Agregar a inicio</b></>],
        [null, <>Tocá <b>Agregar</b>, arriba a la derecha</>],
      ],
      note: "Tiene que ser desde Safari.",
    },
    android: {
      title: "Instalá MyVet en tu celular",
      items: [
        [<MoreVertical size={16} key="i" />, <>Tocá los <b>tres puntitos</b>, arriba a la derecha</>],
        [<Download size={16} key="i" />, <>Elegí <b>Instalar app</b> o <b>Agregar a la pantalla principal</b></>],
        [null, <>Tocá <b>Instalar</b></>],
      ],
      note: "Si no ves la opción, abrí la página desde Chrome.",
    },
    inapp: {
      title: "Abrí MyVet en tu navegador",
      items: [
        [<MoreVertical size={16} key="i" />, <>Tocá los <b>tres puntitos</b> de arriba</>],
        [null, <>Elegí <b>Abrir en Chrome</b> (o en Safari si tenés iPhone)</>],
        [<Download size={16} key="i" />, <>Ahí tocá de nuevo <b>Descargar App</b></>],
      ],
      note: "Desde WhatsApp o Instagram no se puede instalar.",
    },
  };

  const current = sheet && steps[sheet];

  return (
    <>
      <div className="install-banner" style={style}>
        <img src="/icon-192.png" alt="" width="40" height="40" style={{ borderRadius: 10, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, lineHeight: 1.25 }}>Llevá MyVet en tu celular</div>
          <div style={{ color: "#CFE6E2", fontSize: 12, marginTop: 1 }}>
            Gratis y sin {device.isIOS ? "App Store" : "Play Store"}
          </div>
        </div>
        <button type="button" className="btn btn-accent install-banner-btn" onClick={install}>
          <Download size={15} /> Descargar App
        </button>
        <button type="button" aria-label="Cerrar aviso" onClick={dismiss} className="install-banner-close">
          <X size={14} />
        </button>
      </div>

      {current && (
        <div onClick={() => setSheet(null)} style={{ position: "fixed", inset: 0, background: "rgba(10,30,28,0.6)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "22px 22px calc(26px + env(safe-area-inset-bottom, 0px))", width: "100%", maxWidth: 480 }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 16, color: "var(--ink)" }}>{current.title}</div>
            {current.items.map(([icon, text], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, fontSize: 14.5, color: "var(--ink)" }}>
                <span style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--surface-alt)", color: "var(--primary)", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                <span style={{ flex: 1 }}>{text}</span>
                {icon && <span style={{ color: "var(--primary)" }}>{icon}</span>}
              </div>
            ))}
            <div style={{ fontSize: 12.5, color: "var(--muted)", margin: "4px 0 16px" }}>{current.note}</div>
            <button type="button" className="btn btn-primary btn-full" onClick={() => setSheet(null)}>Entendido</button>
          </div>
        </div>
      )}
    </>
  );
}
