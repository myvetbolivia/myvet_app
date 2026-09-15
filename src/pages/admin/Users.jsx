import { useEffect, useState } from "react";
import { Ban, PlayCircle, Trash2 } from "lucide-react";
import { supabase } from "../../supabaseClient";
import Stars from "../../components/Stars";

export default function AdminUsers() {
  const [clients, setClients] = useState([]);

  const load = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*").eq("role", "client").order("created_at", { ascending: false });
    const { data: reviews } = await supabase.from("reviews").select("*, veterinarian_profiles:veterinarian_id(full_name)");
    setClients((profiles || []).map((p) => ({ ...p, reviews: (reviews || []).filter((r) => r.client_id === p.id) })));
  };
  useEffect(() => { load(); }, []);

  const toggleStatus = async (c) => {
    await supabase.from("profiles").update({ status: c.status === "active" ? "suspended" : "active" }).eq("id", c.id);
    load();
  };
  const remove = async (c) => {
    if (!confirm(`¿Eliminar la cuenta de ${c.full_name || c.email}? Esto no se puede deshacer.`)) return;
    await supabase.from("profiles").delete().eq("id", c.id);
    load();
  };

  return (
    <div>
      <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 16, maxWidth: 560 }}>
        Los clientes se registran solos, sin costo ni aprobación previa. Acá solo podés ver su información general y desactivarlos o eliminarlos si son usuarios problemáticos.
      </p>
      <div className="g2">
        {clients.map((c) => (
          <div key={c.id} className="card" style={{ padding: 18, opacity: c.status === "suspended" ? .6 : 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "var(--primary)" }}>{(c.full_name || c.email || "?")[0].toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{c.full_name || c.email}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Registrado el {new Date(c.created_at).toLocaleDateString("es-BO")}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => toggleStatus(c)} style={{ background: "var(--surface-alt)", border: "none", borderRadius: 9, width: 30, height: 30, cursor: "pointer" }}>{c.status === "active" ? <Ban size={14} /> : <PlayCircle size={14} />}</button>
                <button onClick={() => remove(c)} style={{ background: "var(--danger-soft)", color: "var(--danger)", border: "none", borderRadius: 9, width: 30, height: 30, cursor: "pointer" }}><Trash2 size={14} /></button>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              {c.reviews.length === 0 ? (
                <div style={{ fontSize: 12.5, color: "var(--muted)", fontStyle: "italic" }}>Aún no dejó reseñas.</div>
              ) : c.reviews.map((r) => (
                <div key={r.id} style={{ background: "var(--surface-alt)", borderRadius: 12, padding: 12, marginTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700 }}>{r.veterinarian_profiles?.full_name}</span>
                    <Stars rating={r.rating} />
                  </div>
                  <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 5 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {clients.length === 0 && <div style={{ color: "var(--muted)", gridColumn: "1 / -1", textAlign: "center", padding: 20 }}>No hay clientes registrados.</div>}
      </div>
    </div>
  );
}
