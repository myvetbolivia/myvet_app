import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, Stethoscope, Users, Star, PlayCircle, PauseCircle, Phone, MessageCircle } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { PLAN_LABEL } from "../../lib/constants";

function daysUntil(dateStr) {
  if (!dateStr) return 9999;
  return Math.round((new Date(dateStr) - new Date()) / 86400000);
}

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [vets, setVets] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [clientsCount, setClientsCount] = useState(0);
  const [activatingId, setActivatingId] = useState(null);
  const [activationPlan, setActivationPlan] = useState("basico");
  const [activationDate, setActivationDate] = useState("");
  const [reactivatingId, setReactivatingId] = useState(null);
  const [editingExpiryId, setEditingExpiryId] = useState(null);
  const [draftDate, setDraftDate] = useState("");

  const load = async () => {
    const { data: allVets } = await supabase.from("veterinarian_profiles").select("*").order("created_at", { ascending: false });
    setPending((allVets || []).filter((v) => v.verification_status === "pending"));
    setVets((allVets || []).filter((v) => v.verification_status === "approved"));
    const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "client");
    setClientsCount(count || 0);
    const { data: docs } = await supabase.from("verification_documents").select("*");
    setDocuments(docs || []);
  };

  const viewDocuments = async (vetId) => {
    const docs = documents.filter((d) => d.veterinarian_id === vetId);
    if (docs.length === 0) { alert("Este veterinario todavía no subió documentos."); return; }
    for (const doc of docs) {
      const { data } = await supabase.storage.from("verification-documents").createSignedUrl(doc.doc_url, 60);
      if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    }
  };

  useEffect(() => { load(); }, []);

  const reject = async (id) => {
    await supabase.from("veterinarian_profiles").update({ verification_status: "rejected" }).eq("id", id);
    load();
  };
  const startActivate = (id) => { setActivatingId(id); setActivationPlan("basico"); const d = new Date(); d.setDate(d.getDate() + 30); setActivationDate(d.toISOString().slice(0, 10)); };
  const confirmActivate = async (v) => {
    await supabase.from("veterinarian_profiles").update({
      verification_status: "approved", profile_status: "active", plan: activationPlan, plan_expiry: activationDate,
    }).eq("id", v.id);
    setActivatingId(null);
    load();
  };
  const deactivateNow = async (id) => { await supabase.from("veterinarian_profiles").update({ profile_status: "suspended" }).eq("id", id); load(); };
  const startReactivate = (id) => { setReactivatingId(id); setActivationPlan("basico"); const d = new Date(); d.setDate(d.getDate() + 30); setActivationDate(d.toISOString().slice(0, 10)); };
  const confirmReactivate = async (id) => {
    await supabase.from("veterinarian_profiles").update({ profile_status: "active", plan: activationPlan, plan_expiry: activationDate }).eq("id", id);
    setReactivatingId(null);
    load();
  };
  const saveExpiry = async (id) => { await supabase.from("veterinarian_profiles").update({ plan_expiry: draftDate }).eq("id", id); setEditingExpiryId(null); load(); };
  const featuredCount = vets.filter((v) => v.featured).length;
  const toggleFeatured = async (v) => {
    if (!v.featured && featuredCount >= 3) return;
    await supabase.from("veterinarian_profiles").update({ featured: !v.featured }).eq("id", v.id);
    load();
  };

  const activeList = vets.filter((v) => v.profile_status === "active" && daysUntil(v.plan_expiry) >= 0);
  const inactiveList = vets.filter((v) => v.profile_status === "suspended" || daysUntil(v.plan_expiry) < 0);

  return (
    <>
      <div className="g4" style={{ marginBottom: 30 }}>
        <StatCard icon={CheckCircle2} label="Veterinarios activos" value={activeList.length} tone="var(--primary)" />
        <StatCard icon={Clock} label="Pendientes de revisión" value={pending.length} tone="var(--accent)" />
        <StatCard icon={Stethoscope} label="Planes por vencer (14 días)" value={activeList.filter((v) => daysUntil(v.plan_expiry) <= 14).length} tone="var(--celeste)" />
        <StatCard icon={Users} label="Usuarios registrados" value={clientsCount} tone="var(--muted)" />
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontWeight: 800, fontSize: 14.5 }}>Solicitudes por revisar</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{pending.length} en cola</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pending.map((v) => (
            <div key={v.id} style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 14px" }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center" }}><Stethoscope size={17} color="var(--primary)" /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{v.full_name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{v.specialties?.[0]}</div>
                  <div style={{ fontSize: 12, color: "var(--primary)", marginTop: 4, display: "flex", alignItems: "center", gap: 5, fontWeight: 600 }}><MessageCircle size={12.5} /> {v.whatsapp}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => viewDocuments(v.id)} title="Ver documentos subidos" style={{ background: "var(--surface-alt)", border: "none", color: "var(--ink)", borderRadius: 10, padding: "0 10px", height: 34, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Ver docs.</button>
                  <button onClick={() => reject(v.id)} style={{ background: "#fff", border: "1.5px solid var(--danger-soft)", color: "var(--danger)", borderRadius: 10, width: 34, height: 34, cursor: "pointer" }}><XCircle size={16} /></button>
                  <button onClick={() => startActivate(v.id)} style={{ background: "var(--primary)", border: "none", color: "#fff", borderRadius: 10, width: 34, height: 34, cursor: "pointer" }}><CheckCircle2 size={16} /></button>
                </div>
              </div>
              {activatingId === v.id && (
                <div style={{ background: "var(--surface-alt)", padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end" }}>
                  <div><div className="field-label">Plan</div><select className="input" value={activationPlan} onChange={(e) => setActivationPlan(e.target.value)}><option value="basico">Básico</option><option value="premium">Premium</option><option value="ultra">Premium Ultra Smart</option></select></div>
                  <div><div className="field-label">Activo hasta</div><input className="input" type="date" value={activationDate} onChange={(e) => setActivationDate(e.target.value)} /></div>
                  <button className="btn btn-primary" onClick={() => confirmActivate(v)}><PlayCircle size={16} /> Activar</button>
                </div>
              )}
            </div>
          ))}
          {pending.length === 0 && <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 20 }}>No hay solicitudes pendientes 🎉</div>}
        </div>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontWeight: 800, fontSize: 14.5 }}>Veterinarios activos</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>({activeList.length})</span>
          <span style={{ fontSize: 11.5, color: "var(--muted)", marginLeft: "auto" }}>★ Destacados en inicio: {featuredCount}/3</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {activeList.map((v) => {
            const d = daysUntil(v.plan_expiry);
            return (
              <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, border: "1px solid var(--border)" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>{v.full_name}</span>
                    <span className="badge" style={{ background: "var(--surface-alt)" }}>{PLAN_LABEL[v.plan]}</span>
                  </div>
                  {editingExpiryId === v.id ? (
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <input className="input" type="date" defaultValue={v.plan_expiry} onChange={(e) => setDraftDate(e.target.value)} style={{ height: 32, width: 150 }} />
                      <button onClick={() => saveExpiry(v.id)} style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>Guardar</button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: d <= 14 ? "var(--accent)" : "var(--muted)", marginTop: 3 }}>Activo hasta {v.plan_expiry}{d <= 14 ? ` · vence en ${d} días` : ""}</div>
                  )}
                  <div style={{ display: "flex", gap: 12, marginTop: 5 }}>
                    <span style={{ fontSize: 11.5, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}><Phone size={11.5} /> {v.phone}</span>
                    <span style={{ fontSize: 11.5, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}><MessageCircle size={11.5} /> {v.whatsapp}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {v.plan === "ultra" && (
                    <button onClick={() => toggleFeatured(v)} disabled={!v.featured && featuredCount >= 3} style={{ fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, color: v.featured ? "var(--accent)" : "var(--muted)", background: v.featured ? "var(--accent-soft)" : "var(--surface-alt)", border: "none", borderRadius: 9, padding: "8px 10px", cursor: "pointer" }}>
                      <Star size={13} fill={v.featured ? "var(--accent)" : "none"} /> {v.featured ? "Destacado" : "Destacar"}
                    </button>
                  )}
                  <button onClick={() => { setEditingExpiryId(v.id); setDraftDate(v.plan_expiry); }} style={{ fontSize: 12, fontWeight: 700, background: "var(--surface-alt)", border: "none", borderRadius: 9, padding: "8px 10px", cursor: "pointer" }}>Fecha</button>
                  <button onClick={() => deactivateNow(v.id)} style={{ fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, color: "var(--danger)", background: "var(--danger-soft)", border: "none", borderRadius: 9, padding: "8px 10px", cursor: "pointer" }}><PauseCircle size={14} /> Desactivar</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontWeight: 800, fontSize: 14.5 }}>Veterinarios desactivados</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>({inactiveList.length})</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {inactiveList.map((v) => (
            <div key={v.id} style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", opacity: .85 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{v.full_name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{daysUntil(v.plan_expiry) < 0 ? `Venció el ${v.plan_expiry}` : `Estuvo activo hasta ${v.plan_expiry}`}</div>
                </div>
                <button onClick={() => startReactivate(v.id)} style={{ fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, color: "var(--primary)", background: "var(--celeste-soft)", border: "none", borderRadius: 9, padding: "9px 12px", cursor: "pointer" }}><PlayCircle size={14} /> Reactivar</button>
              </div>
              {reactivatingId === v.id && (
                <div style={{ background: "var(--surface-alt)", padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end" }}>
                  <div><div className="field-label">Plan</div><select className="input" value={activationPlan} onChange={(e) => setActivationPlan(e.target.value)}><option value="basico">Básico</option><option value="premium">Premium</option><option value="ultra">Premium Ultra Smart</option></select></div>
                  <div><div className="field-label">Activo hasta</div><input className="input" type="date" value={activationDate} onChange={(e) => setActivationDate(e.target.value)} /></div>
                  <button className="btn btn-primary" onClick={() => confirmReactivate(v.id)}>Confirmar</button>
                </div>
              )}
            </div>
          ))}
          {inactiveList.length === 0 && <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 16 }}>Ningún veterinario desactivado por ahora.</div>}
        </div>
      </div>
    </>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: tone + "1A", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}><Icon size={17} color={tone} /></div>
      <div style={{ fontSize: 26, fontWeight: 500 }}>{value}</div>
      <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{label}</div>
    </div>
  );
}
