import Navbar from "../components/Navbar";
import { User, FileText, Star, PawPrint, Settings, Phone, MapPin, Clock, BarChart3, MessageCircle, Ban, Crown, ArrowUpRight, Heart, Search } from "lucide-react";

const PLANS = [
  {
    id: "basico", name: "Básico", tagline: "Tu perfil, al alcance de quienes te necesitan.", badge: "¡100% GRATIS!", tone: "light",
    includes: [
      { icon: User, label: "Perfil público" }, { icon: FileText, label: "Información profesional" },
      { icon: Star, label: "1 especialidad", note: "Solo una especialidad." }, { icon: PawPrint, label: "Especies" },
      { icon: Settings, label: "Servicios" }, { icon: Phone, label: "Teléfono" }, { icon: MapPin, label: "Ubicación" },
    ],
    excludes: [
      { icon: Clock, label: "Horarios" }, { icon: Star, label: "Estrellas" }, { icon: BarChart3, label: "Calificación promedio" },
      { icon: MessageCircle, label: "Reseñas y comentarios" }, { icon: Ban, label: "Prioridad en resultados" },
    ],
    footer: "Da el primer paso", footerIcon: PawPrint,
  },
  {
    id: "premium", name: "Premium", tagline: "Más información y mayor confianza.", tone: "teal", badgeIcon: Star,
    includes: [
      { icon: User, label: "Perfil público" }, { icon: FileText, label: "Información profesional" },
      { icon: PawPrint, label: "Especies" }, { icon: Settings, label: "Servicios" }, { icon: Phone, label: "Teléfono" },
      { icon: MapPin, label: "Ubicación" }, { icon: Clock, label: "Horarios" }, { icon: Star, label: "Estrellas" },
      { icon: BarChart3, label: "Calificación promedio" }, { icon: MessageCircle, label: "Reseñas y comentarios" },
    ],
    footer: "Genera confianza y conecta con más clientes.", footerIcon: Heart,
  },
  {
    id: "ultra", name: "Premium Ultra Smart", tagline: "Mayor visibilidad para llegar más lejos.", tone: "dark", badgeIcon: Crown,
    highlightLabel: "Incluye todo lo del plan Premium, más:",
    highlight: { icon: BarChart3, title: "Prioridad en resultados", desc: "Tu perfil aparecerá primero en las búsquedas de usuarios compatibles." },
    ranking: [{ n: 1, label: "Ultra Smart compatibles" }, { n: 2, label: "Premium compatibles" }, { n: 3, label: "Básicos compatibles" }],
    rankingNote: "Siempre respetando que coincidas con los filtros de búsqueda.",
    footer: "Más visibilidad, más oportunidades", footerIcon: ArrowUpRight,
  },
];

function PlanCard({ plan }) {
  const light = plan.tone === "light";
  const bg = plan.tone === "light" ? "#EAFBF3" : plan.tone === "teal" ? "linear-gradient(165deg, var(--primary), var(--celeste))" : "linear-gradient(165deg, var(--primary-dark), #063430)";
  const ink = light ? "var(--ink)" : "#fff";
  const muted = light ? "var(--muted)" : "rgba(255,255,255,.75)";

  return (
    <div style={{ background: bg, borderRadius: 26, padding: 26, border: light ? "1px solid var(--border)" : "none", display: "flex", flexDirection: "column", color: ink }}>
      <div style={{ position: "relative", width: 78, height: 78, margin: "0 auto 16px" }}>
        <div style={{ width: 78, height: 78, borderRadius: "50%", background: light ? "#CFF3E6" : "rgba(255,255,255,.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <User size={34} color={ink} strokeWidth={1.6} />
        </div>
        {plan.badgeIcon && (
          <div style={{ position: "absolute", bottom: -2, right: -2, width: 30, height: 30, borderRadius: "50%", background: plan.tone === "teal" ? "var(--primary-dark)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <plan.badgeIcon size={15} color={plan.tone === "teal" ? "#fff" : "var(--primary-dark)"} />
          </div>
        )}
      </div>
      <div style={{ textAlign: "center" }}>
        <h3 style={{ fontSize: 22, fontWeight: 700 }}>{plan.name}</h3>
        <p style={{ fontSize: 13, color: muted, marginTop: 6 }}>{plan.tagline}</p>
        {plan.badge && <span style={{ display: "inline-block", marginTop: 10, fontSize: 12.5, fontWeight: 800, color: "#fff", background: "var(--primary-dark)", padding: "7px 16px", borderRadius: 999 }}>{plan.badge}</span>}
      </div>
      <div style={{ marginTop: 20, flex: 1 }}>
        {plan.includes && (
          <>
            <div style={{ fontSize: 12.5, fontWeight: 800, marginBottom: 10 }}>Incluye:</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {plan.includes.map((it, i) => (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <it.icon size={16} style={{ marginTop: 1, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{it.label}</div>
                    {it.note && <div style={{ fontSize: 11.5, color: muted }}>{it.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {plan.excludes && (
          <div style={{ marginTop: 18, background: "rgba(94,125,120,0.08)", borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, marginBottom: 10 }}>No incluye:</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {plan.excludes.map((it, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <it.icon size={15} color={muted} />
                  <span style={{ fontSize: 13, color: muted }}>{it.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {plan.highlight && (
          <>
            <div style={{ fontSize: 12.5, fontWeight: 800, marginBottom: 12 }}>{plan.highlightLabel}</div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: 14, display: "flex", gap: 12 }}>
              <plan.highlight.icon size={20} color="var(--celeste-light)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>{plan.highlight.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginTop: 3 }}>{plan.highlight.desc}</div>
              </div>
            </div>
            <div style={{ marginTop: 14, background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.85)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <Search size={13} /> Así se muestra en las búsquedas:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {plan.ranking.map((r) => (
                  <div key={r.n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: r.n === 1 ? "var(--accent)" : r.n === 2 ? "var(--celeste)" : "rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>{r.n}</div>
                    <span style={{ fontSize: 13, color: "#fff" }}>{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,.65)", marginTop: 12 }}>{plan.rankingNote}</p>
          </>
        )}
      </div>
      <div style={{ fontSize: 13, fontStyle: "italic", textAlign: "center", marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        {plan.footer} <plan.footerIcon size={14} />
      </div>
    </div>
  );
}

export default function Plans() {
  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: "20px 28px 90px" }}>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 36px" }}>
          <h2 style={{ fontSize: 30 }}>Elegí el plan que mejor te represente</h2>
          <p style={{ fontSize: 15, color: "var(--muted)", marginTop: 8 }}>Empezá gratis y subí de nivel cuando quieras mostrar más y llegar más lejos.</p>
        </div>
        <div className="g3">{PLANS.map((p) => <PlanCard key={p.id} plan={p} />)}</div>
      </div>
    </div>
  );
}
