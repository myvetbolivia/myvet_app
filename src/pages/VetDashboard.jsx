import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, PauseCircle, Bell, TrendingUp, Eye, MessageCircle, Phone, Star, LogOut, Camera, Upload } from "lucide-react";
import Logo from "../components/Logo";
import MultiSelect from "../components/MultiSelect";
import SpecialtyPicker from "../components/SpecialtyPicker";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { SPECIES, SERVICES, PROVINCIAS, MUNICIPIOS, ZONAS, PLAN_LABEL } from "../lib/constants";

function daysUntil(dateStr) {
  if (!dateStr) return 9999;
  return Math.round((new Date(dateStr) - new Date()) / 86400000);
}

export default function VetDashboard() {
  const navigate = useNavigate();
  const { session, signOut, loading: authLoading } = useAuth();
  const [vet, setVet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!session) { navigate("/veterinario/ingresar"); return; }
    supabase.from("veterinarian_profiles").select("*").eq("id", session.user.id).maybeSingle().then(({ data }) => {
      setVet(data);
      setLoading(false);
    });
  }, [session, authLoading]);

  if (loading || !vet) return <div style={{ padding: 40 }}>Cargando tu perfil...</div>;

  const save = async () => {
    const updated = {
      full_name: vet.full_name, email: vet.email, phone: vet.phone, whatsapp: vet.whatsapp,
      description: vet.description, university: vet.university, species: vet.species,
      specialties: vet.specialties, services: vet.services, provincia: vet.provincia,
      municipio: vet.municipio, zona: vet.zona, address: vet.address, social_link: vet.social_link,
    };
    await supabase.from("veterinarian_profiles").update(updated).eq("id", vet.id);
    if (newPassword.trim().length >= 6) {
      await supabase.auth.updateUser({ password: newPassword.trim() });
      setNewPassword("");
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const set = (field) => (value) => setVet((v) => ({ ...v, [field]: value }));

  const notifications = [];
  if (vet.verification_status === "pending") {
    notifications.push({ icon: Clock, color: "var(--accent)", text: "Recibimos tu solicitud y está pendiente de revisión." });
  } else {
    notifications.push({ icon: CheckCircle2, color: "var(--primary)", text: "Tu perfil fue aprobado y está visible públicamente." });
    const d = daysUntil(vet.plan_expiry);
    if (vet.profile_status === "suspended" || d < 0) notifications.push({ icon: PauseCircle, color: "var(--danger)", text: "Tu perfil está desactivado. Contactá al equipo de MyVet para reactivarlo." });
    else if (d <= 14) notifications.push({ icon: Bell, color: "var(--accent)", text: `Tu plan ${PLAN_LABEL[vet.plan]} vence en ${d} día(s).` });
    if (vet.reviews_count > 0) notifications.push({ icon: Star, color: "var(--celeste)", text: `Tenés ${vet.reviews_count} reseña(s) de clientes.` });
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="container-narrow" style={{ padding: "34px 24px 70px" }}>
        <Logo size={36} onClick={() => navigate("/")} />
        <h1 style={{ fontSize: 26, margin: "22px 0 4px" }}>Tu perfil profesional</h1>
        <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 18 }}>Podés editarlo cuando quieras, esté aprobado o pendiente de revisión.</p>

        <div style={{ background: vet.verification_status === "pending" ? "var(--accent-soft)" : "var(--celeste-soft)", borderRadius: 14, padding: "12px 16px", marginBottom: 22, display: "flex", alignItems: "center", gap: 10 }}>
          {vet.verification_status === "pending" ? (
            <><Clock size={16} color="var(--accent)" /><span style={{ fontSize: 13, fontWeight: 600 }}>Tu solicitud está pendiente de revisión.</span></>
          ) : (
            <><CheckCircle2 size={16} color="var(--primary)" /><span style={{ fontSize: 13, fontWeight: 600 }}>
              Perfil {vet.profile_status === "active" ? "activo" : "desactivado"} · Plan {PLAN_LABEL[vet.plan]}{vet.plan_expiry ? ` · vence ${vet.plan_expiry}` : ""}
            </span></>
          )}
        </div>

        <div className="card" style={{ padding: 22, marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Bell size={16} color="var(--primary)" /><span style={{ fontWeight: 800, fontSize: 14 }}>Notificaciones</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: vet.verification_status !== "pending" ? 22 : 0 }}>
            {notifications.map((n, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface-alt)", borderRadius: 12, padding: "10px 14px" }}>
                <n.icon size={15} color={n.color} /><span style={{ fontSize: 13 }}>{n.text}</span>
              </div>
            ))}
          </div>
          {vet.verification_status !== "pending" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><TrendingUp size={16} color="var(--primary)" /><span style={{ fontWeight: 800, fontSize: 14 }}>Actividad de tu perfil</span></div>
              </div>
              <div className="g4">
                <Stat icon={Eye} label="Vistas de perfil" value={vet.profile_views} />
                <Stat icon={MessageCircle} label="Clics a WhatsApp" value={vet.whatsapp_clicks} />
                <Stat icon={Phone} label="Llamadas" value={vet.call_clicks} />
                <Stat icon={Star} label="Reseñas" value={vet.reviews_count} />
              </div>
            </>
          )}
        </div>

        <div className="card" style={{ padding: 26, display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Nombre completo"><input className="input" value={vet.full_name || ""} onChange={(e) => set("full_name")(e.target.value)} /></Field>
          <Field label="Email"><input className="input" value={vet.email || ""} onChange={(e) => set("email")(e.target.value)} /></Field>
          <div className="g2">
            <Field label="Teléfono"><input className="input" value={vet.phone || ""} onChange={(e) => set("phone")(e.target.value)} /></Field>
            <Field label="WhatsApp"><input className="input" value={vet.whatsapp || ""} onChange={(e) => set("whatsapp")(e.target.value)} /></Field>
          </div>
          <Field label="Descripción breve"><textarea className="input" rows={3} value={vet.description || ""} onChange={(e) => set("description")(e.target.value)} /></Field>
          <Field label="Universidad"><input className="input" value={vet.university || ""} onChange={(e) => set("university")(e.target.value)} /></Field>
          <MultiSelect label="Especies que atendés" options={SPECIES} selected={vet.species || []} onChange={set("species")} />
          <SpecialtyPicker label="Especialidades (podés elegir varias)" selected={vet.specialties || []} onChange={set("specialties")} />
          <MultiSelect label="Servicios que ofrecés" options={SERVICES} selected={vet.services || []} onChange={set("services")} />
          <div className="g2">
            <Field label="Provincia"><select className="input" value={vet.provincia || ""} onChange={(e) => set("provincia")(e.target.value)}><option value="">Elegí una provincia</option>{PROVINCIAS.map((o) => <option key={o}>{o}</option>)}</select></Field>
            <Field label="Municipio"><select className="input" value={vet.municipio || ""} onChange={(e) => set("municipio")(e.target.value)}><option value="">Elegí un municipio</option>{MUNICIPIOS.map((o) => <option key={o}>{o}</option>)}</select></Field>
          </div>
          <Field label="Zona"><select className="input" value={vet.zona || ""} onChange={(e) => set("zona")(e.target.value)}><option value="">Elegí una zona</option>{ZONAS.map((o) => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Dirección"><input className="input" value={vet.address || ""} onChange={(e) => set("address")(e.target.value)} /></Field>
          <Field label="Red social (Instagram o TikTok)"><input className="input" value={vet.social_link || ""} onChange={(e) => set("social_link")(e.target.value)} /></Field>
          <Field label="Cambiar contraseña (opcional)"><input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Dejalo vacío si no querés cambiarla" /></Field>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={save}><CheckCircle2 size={16} /> Guardar cambios</button>
            <button className="btn btn-ghost" onClick={async () => { await signOut(); navigate("/"); }}><LogOut size={16} /> Salir del perfil</button>
            {saved && <span style={{ fontSize: 13, color: "var(--primary)", fontWeight: 700 }}>¡Cambios guardados!</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) { return <div><div className="field-label">{label}</div>{children}</div>; }
function Stat({ icon: Icon, label, value }) {
  return (
    <div style={{ background: "var(--surface-alt)", borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
      <Icon size={15} color="var(--primary)" style={{ marginBottom: 6 }} />
      <div style={{ fontSize: 18, fontWeight: 600 }}>{value || 0}</div>
      <div style={{ fontSize: 10.5, color: "var(--muted)" }}>{label}</div>
    </div>
  );
}
