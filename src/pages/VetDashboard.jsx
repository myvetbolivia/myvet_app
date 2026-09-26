import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, PauseCircle, Bell, TrendingUp, Eye, MessageCircle, Phone, Star, LogOut, Pencil, Camera, Sparkles, MapPin, Upload, ImagePlus, X, Lock } from "lucide-react";
import Logo from "../components/Logo";
import MultiSelect from "../components/MultiSelect";
import SpecialtyPicker from "../components/SpecialtyPicker";
import PlaceSelect from "../components/PlaceSelect";
import ClinicLocationFields from "../components/ClinicLocationFields";
import ScheduleEditor from "../components/ScheduleEditor";
import VetProfile from "./VetProfile";
import { isValidMapsUrl } from "../lib/location";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { getVetNews, markVetNewsSeen } from "../lib/vetNews";
import { uploadAvatar, uploadGalleryPhoto, deleteImageByUrl } from "../lib/uploadAvatar";
import { SPECIES, SERVICES, PROVINCIAS, MUNICIPIOS, ZONAS, ALL_PROVINCIAS, ALL_MUNICIPIOS, ALL_ZONAS, vetProvincias, vetMunicipios, vetZonas, PLAN_LABEL, galleryMax, hasGallery, SUPPORT_EMAIL } from "../lib/constants";

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
  const [news, setNews] = useState([]);
  const [saveError, setSaveError] = useState("");
  const [editing, setEditing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryError, setGalleryError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!session) { navigate("/veterinario/ingresar"); return; }
    supabase.from("veterinarian_profiles").select("*").eq("id", session.user.id).maybeSingle().then(({ data }) => {
      setVet(data);
      if (data) {
        setNews(getVetNews(data));
        markVetNewsSeen(data);
      }
      setLoading(false);
    });
  }, [session, authLoading]);

  if (loading) return <div style={{ padding: 40 }}>Cargando tu perfil...</div>;
  if (!vet) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div className="card" style={{ padding: 32, maxWidth: 420, textAlign: "center" }}>
          <h2 style={{ fontSize: 20, marginBottom: 10 }}>No encontramos tu perfil profesional</h2>
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, marginBottom: 20 }}>
            Puede que haya sido eliminado. Si creés que es un error, escribinos a <b style={{ color: "var(--ink)" }}>{SUPPORT_EMAIL}</b>.
          </p>
          <button className="btn btn-primary btn-full" onClick={async () => { await signOut(); navigate("/"); }}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  const save = async () => {
    if (!isValidMapsUrl(vet.maps_url)) { setSaveError("Revisá el link de Google Maps: no parece válido."); return; }
    setSaveError("");
    const updated = {
      full_name: vet.full_name, email: vet.email, phone: vet.phone, whatsapp: vet.whatsapp,
      description: vet.description, university: vet.university, species: vet.species,
      specialties: vet.specialties, services: vet.services,
      provincias: vetProvincias(vet), municipios: vetMunicipios(vet), zonas: vetZonas(vet),
      provincia: vetProvincias(vet)[0] || null, municipio: vetMunicipios(vet)[0] || null, zona: vetZonas(vet)[0] || null,
      address: vet.address, social_link: vet.social_link, schedule: (vet.schedule || []).filter(([d]) => d && d !== "A confirmar"),
      maps_url: (vet.maps_url || "").trim() || null, lat: vet.lat || null, lng: vet.lng || null,
    };
    await supabase.from("veterinarian_profiles").update(updated).eq("id", vet.id);
    if (newPassword.trim().length >= 6) {
      await supabase.auth.updateUser({ password: newPassword.trim() });
      setNewPassword("");
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setEditing(false);
    setPreviewKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancelar: descarta lo que no se guardó y vuelve a la vista previa
  const cancelEdit = async () => {
    const { data } = await supabase.from("veterinarian_profiles").select("*").eq("id", vet.id).maybeSingle();
    if (data) setVet(data);
    setSaveError("");
    setNewPassword("");
    setEditing(false);
    setPreviewKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const set = (field) => (value) => setVet((v) => ({ ...v, [field]: value }));

  // Sube una foto nueva y la guarda en el perfil al instante.
  const changePhoto = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setPhotoError("Elegí una imagen (JPG o PNG)."); return; }
    setPhotoUploading(true);
    setPhotoError("");
    try {
      const url = await uploadAvatar(vet.id, file);
      const { error } = await supabase.from("veterinarian_profiles").update({ photo_url: url }).eq("id", vet.id);
      if (error) throw error;
      setVet((v) => ({ ...v, photo_url: url }));
    } catch (e) {
      console.error("No se pudo cambiar la foto:", e);
      setPhotoError("No se pudo subir la foto. Probá con otra imagen o intentá de nuevo.");
    } finally {
      setPhotoUploading(false);
    }
  };

  // ---- Galería de fotos (Premium y Premium Ultra Smart, hasta 5) ----
  const gallery = vet.gallery || [];

  const saveGallery = async (list) => {
    const { error } = await supabase.from("veterinarian_profiles").update({ gallery: list }).eq("id", vet.id);
    if (error) throw error;
    setVet((v) => ({ ...v, gallery: list }));
  };

  const addGalleryPhotos = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    const free = galleryMax(vet) - gallery.length;
    if (free <= 0) { setGalleryError(`Ya tenés ${galleryMax(vet)} fotos. Quitá una para agregar otra.`); return; }
    setGalleryUploading(true);
    setGalleryError(files.length > free ? `Solo se agregaron ${free} foto(s): el máximo es ${galleryMax(vet)}.` : "");
    try {
      const urls = [];
      for (const f of files.slice(0, free)) urls.push(await uploadGalleryPhoto(vet.id, f));
      await saveGallery([...gallery, ...urls]);
    } catch (e) {
      console.error("No se pudo subir la foto de la galería:", e);
      setGalleryError("No se pudo subir la foto. Probá con otra imagen o intentá de nuevo.");
    } finally {
      setGalleryUploading(false);
    }
  };

  const removeGalleryPhoto = async (url) => {
    setGalleryError("");
    try {
      await saveGallery(gallery.filter((u) => u !== url));
      deleteImageByUrl(url).catch(() => {});
    } catch (e) {
      console.error("No se pudo quitar la foto:", e);
      setGalleryError("No se pudo quitar la foto. Intentá de nuevo.");
    }
  };

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

        {news.length > 0 && (
          <div className="vet-news-box">
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15, marginBottom: 10 }}>
              <Sparkles size={18} /> Novedades desde tu última visita
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {news.map((n) => {
                const Icon = { profile_views: Eye, whatsapp_clicks: MessageCircle, call_clicks: Phone, location_clicks: MapPin, reviews_count: Star }[n.key];
                return (
                  <div key={n.key} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5, color: "#E4F4F1" }}>
                    <Icon size={15} /> {n.text}
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

        {!editing && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Así ven tu perfil los clientes</div>
                {saved && <div style={{ fontSize: 13, color: "var(--primary)", fontWeight: 700, marginTop: 2 }}>¡Cambios guardados!</div>}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={() => setEditing(true)}><Pencil size={16} /> Editar perfil</button>
                <button className="btn btn-ghost" onClick={async () => { await signOut(); navigate("/"); }}><LogOut size={16} /> Salir</button>
              </div>
            </div>
            <div style={{ border: "2px dashed var(--border)", borderRadius: 20, padding: 12, background: "var(--bg)" }}>
              <VetProfile key={previewKey} vetId={vet.id} embedded />
            </div>
          </>
        )}

        {editing && (
        <div className="card" style={{ padding: 26, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 16 }}><Pencil size={17} color="var(--primary)" /> Editando tu perfil</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ width: 84, height: 84, borderRadius: 22, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, flexShrink: 0, overflow: "hidden" }}>
              {vet.photo_url ? <img src={vet.photo_url} alt="Tu foto de perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🐾"}
            </div>
            <div>
              <div className="field-label">Foto de perfil</div>
              <label className="btn btn-ghost" style={{ cursor: photoUploading ? "wait" : "pointer", opacity: photoUploading ? 0.6 : 1 }}>
                <Camera size={16} /> {photoUploading ? "Subiendo..." : vet.photo_url ? "Cambiar foto" : "Subir foto"}
                <input type="file" accept="image/*" hidden disabled={photoUploading} onChange={(e) => { changePhoto(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>Se guarda automáticamente al elegirla.</div>
              {photoError && <div style={{ fontSize: 12.5, color: "var(--danger)", marginTop: 6, fontWeight: 600 }}>{photoError}</div>}
            </div>
          </div>

          <div>
            <div className="field-label">Galería de fotos{hasGallery(vet) ? ` · ${gallery.length} de ${galleryMax(vet)}` : ""}</div>
            {hasGallery(vet) ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 10 }}>
                  {gallery.map((url) => (
                    <div key={url} style={{ position: "relative", aspectRatio: "1", borderRadius: 14, overflow: "hidden", background: "var(--surface-alt)" }}>
                      <img src={url} alt="Foto de la galería" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        aria-label="Quitar foto"
                        onClick={() => removeGalleryPhoto(url)}
                        style={{ position: "absolute", top: 6, right: 6, width: 28, height: 28, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      >
                        <X size={15} color="var(--danger)" />
                      </button>
                    </div>
                  ))}
                  {gallery.length < galleryMax(vet) && (
                    <label style={{ aspectRatio: "1", borderRadius: 14, border: "1.5px dashed var(--primary)", color: "var(--primary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 12.5, fontWeight: 700, cursor: galleryUploading ? "wait" : "pointer", opacity: galleryUploading ? 0.6 : 1 }}>
                      <ImagePlus size={20} />
                      {galleryUploading ? "Subiendo..." : "Agregar"}
                      <input type="file" accept="image/*" multiple hidden disabled={galleryUploading} onChange={(e) => { addGalleryPhotos(e.target.files); e.target.value = ""; }} />
                    </label>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
                  {gallery.length >= galleryMax(vet)
                    ? `Llegaste al máximo de ${galleryMax(vet)} fotos. Quitá una para agregar otra.`
                    : `Mostrá tu consultorio, tu equipo o tu trabajo. Máximo ${galleryMax(vet)} fotos. Se guardan automáticamente.`}
                </div>
                {galleryError && <div style={{ fontSize: 12.5, color: "var(--danger)", marginTop: 6, fontWeight: 600 }}>{galleryError}</div>}
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface-alt)", borderRadius: 12, padding: "12px 14px", flexWrap: "wrap" }}>
                <Lock size={16} color="var(--muted)" />
                <span style={{ fontSize: 13, flex: 1, minWidth: 180 }}>La galería de fotos está disponible en los planes Premium y Premium Ultra Smart.</span>
                <button type="button" className="btn btn-ghost" style={{ padding: "6px 14px" }} onClick={() => navigate("/planes")}>Ver planes</button>
              </div>
            )}
          </div>
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
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
            ¿Dónde atendés? Si vas a domicilio o a las propiedades, marcá todos los lugares a los que vas.
          </div>
          <PlaceSelect label="Provincias" allLabel={ALL_PROVINCIAS} options={PROVINCIAS} selected={vetProvincias(vet)} onChange={(v) => setVet((x) => ({ ...x, provincias: v, provincia: v[0] || null }))} />
          <PlaceSelect label="Municipios" allLabel={ALL_MUNICIPIOS} options={MUNICIPIOS} selected={vetMunicipios(vet)} onChange={(v) => setVet((x) => ({ ...x, municipios: v, municipio: v[0] || null }))} />
          <PlaceSelect label="Zonas (dentro de Santa Cruz de la Sierra)" allLabel={ALL_ZONAS} options={ZONAS} selected={vetZonas(vet)} onChange={(v) => setVet((x) => ({ ...x, zonas: v, zona: v[0] || null }))} />
          <ClinicLocationFields
            address={vet.address} onAddress={set("address")}
            mapsUrl={vet.maps_url} onMapsUrl={set("maps_url")}
            lat={vet.lat} lng={vet.lng} onCoords={(lat, lng) => setVet((x) => ({ ...x, lat, lng }))}
          />
          <ScheduleEditor value={vet.schedule} onChange={set("schedule")} />
          <Field label="Red social (Instagram o TikTok)"><input className="input" value={vet.social_link || ""} onChange={(e) => set("social_link")(e.target.value)} /></Field>
          <Field label="Cambiar contraseña (opcional)"><input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Dejalo vacío si no querés cambiarla" /></Field>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={save}><CheckCircle2 size={16} /> Guardar cambios</button>
            <button className="btn btn-ghost" onClick={cancelEdit}>Cancelar</button>
            {saveError && <span style={{ fontSize: 13, color: "var(--danger)", fontWeight: 700 }}>{saveError}</span>}
          </div>
        </div>
        )}
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
