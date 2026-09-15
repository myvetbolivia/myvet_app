import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import PlanBadge from "./PlanBadge";
import Stars from "./Stars";

export default function VetCard({ vet }) {
  const navigate = useNavigate();
  return (
    <div className="card" onClick={() => navigate(`/veterinario/${vet.id}`)} style={{ padding: 18, cursor: "pointer" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
          {vet.photo_url ? <img src={vet.photo_url} alt={vet.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 22 }}>🐾</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{vet.full_name}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{vet.specialties?.[0]}</div>
        </div>
        <PlanBadge plan={vet.plan} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
        <div style={{ fontSize: 12.5, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
          <MapPin size={13} /> {vet.zona || vet.municipio}
        </div>
        <Stars rating={vet.rating} />
      </div>
    </div>
  );
}
