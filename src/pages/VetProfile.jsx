import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Phone, MessageCircle, MapPin, GraduationCap, CalendarDays, Star, Link as LinkIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import PlanBadge from "../components/PlanBadge";
import Stars from "../components/Stars";
import { supabase } from "../supabaseClient";
import { visibleSpecialties } from "../lib/constants";
import { useAuth } from "../context/AuthContext";

function digitsOnly(s) { return (s || "").replace(/\D/g, ""); }

export default function VetProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const [vet, setVet] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showPhoto, setShowPhoto] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    supabase.from("veterinarian_profiles").select("*").eq("id", id).maybeSingle().then(({ data }) => setVet(data));
    supabase.from("reviews").select("*, profiles:client_id(full_name)").eq("veterinarian_id", id).eq("status", "published").order("created_at", { ascending: false }).then(({ data }) => setReviews(data || []));
    supabase.rpc("increment_profile_view", { p_vet_id: id });
  }, [id]);

  if (!vet) return <div><Navbar /><div className="container" style={{ padding: 40 }}>Cargando perfil...</div></div>;

  const showReviews = vet.plan !== "basico";
  const showSchedule = vet.plan !== "basico";

  const callVet = () => { supabase.rpc("increment_call_click", { p_vet_id: id }); window.location.href = `tel:+${digitsOnly(vet.phone)}`; };
  const openWhatsApp = () => {
    supabase.rpc("increment_whatsapp_click", { p_vet_id: id });
    const num = digitsOnly(vet.whatsapp);
    const full = num.length <= 8 ? `591${num}` : num;
    window.open(`https://wa.me/${full}?text=${encodeURIComponent(`Hola ${vet.full_name}, te contacto desde MyVet.`)}`, "_blank");
  };
  const openInMaps = () => { supabase.rpc("increment_location_click", { p_vet_id: id }); window.open(`https://www.google.com/maps/search/?api=1&query=${vet.lat},${vet.lng}`, "_blank"); };

  const submitReview = async () => {
    if (!newRating || !session) return;
    const { error } = await supabase.from("reviews").upsert(
      { veterinarian_id: id, client_id: session.user.id, rating: newRating, comment: newComment },
      { onConflict: "veterinarian_id,client_id" }
    );
    if (!error) {
      setPosted(true);
      setNewRating(0); setNewComment("");
      supabase.from("reviews").select("*, profiles:client_id(full_name)").eq("veterinarian_id", id).eq("status", "published").order("created_at", { ascending: false }).then(({ data }) => setReviews(data || []));
      setTimeout(() => setPosted(false), 2500);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: "20px 28px 80px", maxWidth: 960 }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", marginBottom: 18 }}>
          <ChevronLeft size={15} /> Volver a resultados
        </button>

        <div className="side-r">
          <div>
            <div className="card" style={{ padding: 26 }}>
              <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                <div onClick={() => setShowPhoto(true)} title="Ver foto más grande" style={{ width: 84, height: 84, borderRadius: 22, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, flexShrink: 0, cursor: "pointer", overflow: "hidden" }}>
                  {vet.photo_url ? <img src={vet.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🐾"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <h1 style={{ fontSize: 26 }}>{vet.full_name}</h1>
                    <PlanBadge plan={vet.plan} />
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>{vet.specialties?.[0]}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
                    {showReviews && vet.rating && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Stars rating={vet.rating} /> <span style={{ fontSize: 12.5, color: "var(--muted)" }}>({vet.reviews_count} reseñas)</span>
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}><GraduationCap size={14} /> {vet.university}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={callVet}><Phone size={16} /> Llamar</button>
                <button className="btn btn-accent" style={{ flex: 1 }} onClick={openWhatsApp}><MessageCircle size={16} /> WhatsApp</button>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={openInMaps}><MapPin size={16} /> Ver ubicación</button>
              </div>
              {vet.social_link && (
                <button
                  onClick={() => window.open(vet.social_link, "_blank")}
                  className="btn btn-full"
                  style={{ marginTop: 12, color: "#fff", background: "linear-gradient(90deg, #F58529, #DD2A7B, #8134AF, #515BD4)" }}
                >
                  <LinkIcon size={16} /> Ver mis redes sociales
                </button>
              )}
            </div>

            <Section title="Sobre mí"><p className="card" style={{ fontSize: 14, lineHeight: 1.65, padding: 16 }}>{vet.description}</p></Section>
            <Section title="Especialidades"><TagRow items={visibleSpecialties(vet)} /></Section>
            <Section title="Especies que atiende"><TagRow items={vet.species || []} /></Section>
            <Section title="Servicios"><TagRow items={vet.services || []} /></Section>

            {showSchedule && (
              <Section title="Horario de atención">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(vet.schedule || []).map(([d, h], i) => (
                    <div key={i} className="card" style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", fontSize: 13.5 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)" }}><CalendarDays size={14} /> {d}</span>
                      <span style={{ fontWeight: 700 }}>{h}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {showReviews && (
              <Section title={`Reseñas (${reviews.length})`}>
                <div style={{ marginBottom: 14 }}>
                  {session && profile?.role === "client" ? (
                    <div className="card" style={{ background: "var(--surface-alt)", padding: 14, border: "none" }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Dejá tu reseña</div>
                      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} onClick={() => setNewRating(n)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                            <Star size={22} fill={n <= newRating ? "var(--accent)" : "none"} color="var(--accent)" />
                          </button>
                        ))}
                      </div>
                      <textarea className="input" rows={2} placeholder="Contá cómo te fue..." value={newComment} onChange={(e) => setNewComment(e.target.value)} style={{ marginBottom: 10 }} />
                      <button className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={submitReview}>Publicar reseña</button>
                      {posted && <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 700, marginLeft: 10 }}>¡Gracias por tu reseña!</span>}
                    </div>
                  ) : (
                    <div className="card" style={{ background: "var(--surface-alt)", padding: 14, border: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, color: "var(--muted)" }}>Iniciá sesión para calificar y comentar sobre este veterinario.</span>
                      <button className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => navigate("/ingresar")}>Iniciar sesión</button>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {reviews.map((r) => (
                    <div key={r.id} className="card" style={{ padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, fontSize: 13.5 }}>{r.profiles?.full_name || "Cliente"}</span>
                        <Stars rating={r.rating} />
                      </div>
                      <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 6, lineHeight: 1.5 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          <div>
            <div className="card" style={{ padding: 20, position: "sticky", top: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 14 }}>Datos de contacto</div>
              <InfoRow icon={MapPin} label={`${vet.address} · ${vet.provincia}`} />
              <InfoRow icon={Phone} label={vet.phone} onClick={callVet} />
              <InfoRow icon={MessageCircle} label={vet.whatsapp} onClick={openWhatsApp} />
              {vet.lat && vet.lng && (
                <div onClick={openInMaps} style={{ marginTop: 14, height: 150, borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", cursor: "pointer", position: "relative" }}>
                  <iframe title="mapa" src={`https://www.google.com/maps?q=${vet.lat},${vet.lng}&z=15&output=embed`} style={{ width: "100%", height: "100%", border: 0, pointerEvents: "none" }} loading="lazy" />
                  <div style={{ position: "absolute", inset: 0 }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPhoto && (
        <div onClick={() => setShowPhoto(false)} style={{ position: "fixed", inset: 0, background: "rgba(10,30,28,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ padding: 28, textAlign: "center", maxWidth: 320 }}>
            <div style={{ width: 220, height: 220, borderRadius: 28, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 110, margin: "0 auto 18px", overflow: "hidden" }}>
              {vet.photo_url ? <img src={vet.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🐾"}
            </div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{vet.full_name}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>{vet.specialties?.[0]}</div>
            <button className="btn btn-primary btn-full" onClick={() => setShowPhoto(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}
function TagRow({ items }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map((it) => <span key={it} style={{ fontSize: 12.5, fontWeight: 600, color: "var(--primary-dark)", background: "var(--surface-alt)", padding: "7px 12px", borderRadius: 10 }}>{it}</span>)}
    </div>
  );
}
function InfoRow({ icon: Icon, label, onClick }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5, padding: "8px 0", borderBottom: "1px solid var(--border)", cursor: onClick ? "pointer" : "default", color: onClick ? "var(--primary)" : "var(--ink)", fontWeight: onClick ? 600 : 400 }}>
      <Icon size={15} color={onClick ? "var(--primary)" : "var(--muted)"} /> {label}
    </div>
  );
}
