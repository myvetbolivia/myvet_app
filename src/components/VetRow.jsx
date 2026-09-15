import { useNavigate } from "react-router-dom";
import { MapPin, ChevronRight } from "lucide-react";
import PlanBadge from "./PlanBadge";
import Stars from "./Stars";

export default function VetRow({ vet }) {
  const navigate = useNavigate();
  return (
    <div
      className="card"
      onClick={() => navigate(`/veterinario/${vet.id}`)}
      style={{ padding: 18, display: "flex", alignItems: "center", gap: 16, cursor: "pointer", borderLeft: vet.plan === "ultra" ? "4px solid var(--accent)" : "1px solid var(--border)" }}
    >
      <div style={{ width: 58, height: 58, borderRadius: 16, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
        {vet.photo_url ? <img src={vet.photo_url} alt={vet.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 26 }}>🐾</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: 15.5 }}>{vet.full_name}</span>
          <PlanBadge plan={vet.plan} />
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>
          {vet.specialties?.[0]} · {(vet.species || []).join(", ")}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
          <MapPin size={13} /> {vet.municipio} · {vet.provincia} · {vet.zona}
        </div>
      </div>
      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        <Stars rating={vet.rating} />
        <ChevronRight size={18} color="var(--muted)" />
      </div>
    </div>
  );
}
