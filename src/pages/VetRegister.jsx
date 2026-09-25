import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Camera, Upload } from "lucide-react";
import Logo from "../components/Logo";
import MultiSelect from "../components/MultiSelect";
import SpecialtyPicker from "../components/SpecialtyPicker";
import TermsModal from "../components/TermsModal";
import { supabase } from "../supabaseClient";
import { uploadAvatar, safeFileName } from "../lib/uploadAvatar";
import { SPECIES, SERVICES, PROVINCIAS, MUNICIPIOS, ZONAS } from "../lib/constants";

const STEPS = ["Datos básicos", "Especialidades y zona", "Documentación"];

export default function VetRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [description, setDescription] = useState("");
  const [university, setUniversity] = useState("");

  const [species, setSpecies] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [services, setServices] = useState([]);
  const [provincia, setProvincia] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [zona, setZona] = useState("");
  const [address, setAddress] = useState("");
  const [social, setSocial] = useState("");

  const [photoFile, setPhotoFile] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedProfessional, setAcceptedProfessional] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const passwordValid = password.length >= 6 && password === password2;
  const step0Valid = fullName.trim().length > 1 && whatsapp.trim().length > 3 && email.trim().length > 3 && passwordValid;
  const step1Valid = species.length > 0 && specialties.length > 0;
  const step2Valid = acceptedTerms && acceptedProfessional;

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      // 1) Crear la cuenta de autenticación
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim() } },
      });
      if (signUpError) throw signUpError;

      const user = signUpData.user;
      if (!user) throw new Error("No se pudo crear la cuenta. Revisá si necesitás confirmar tu email.");

      // 2) Pasar su perfil de "client" (por defecto) a "veterinarian"
      await supabase.from("profiles").update({ role: "veterinarian" }).eq("id", user.id);

      // 3) Subir la foto (si la cargó) al bucket "avatar".
      //    Si falla, la cuenta se crea igual y la foto se puede subir después
      //    desde "Tu perfil profesional".
      let photoUrl = null;
      if (photoFile) {
        try {
          photoUrl = await uploadAvatar(user.id, photoFile);
        } catch (e) {
          console.error("No se pudo subir la foto de perfil:", e);
        }
      }

      // 4) Crear la ficha profesional
      const { error: insertError } = await supabase.from("veterinarian_profiles").insert({
        id: user.id,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        description: description.trim() || "Todavía no agregó una descripción.",
        university: university.trim() || null,
        species, specialties, services,
        provincia: provincia || null, municipio: municipio || null, zona: zona || null,
        address: address.trim() || null,
        social_link: social.trim() || null,
        photo_url: photoUrl,
        schedule: [["A confirmar", "—"]],
      });
      if (insertError) throw insertError;

      // 5) Subir documentación de verificación (si la cargó) al bucket privado
      if (docFile) {
        const path = `${user.id}/${safeFileName("documento", docFile)}`;
        const { error: docErr } = await supabase.storage.from("verification-documents").upload(path, docFile, { upsert: true });
        if (!docErr) {
          await supabase.from("verification_documents").insert({ veterinarian_id: user.id, doc_url: path, doc_type: docFile.type });
        } else {
          console.error("No se pudo subir el documento:", docErr);
        }
      }

      setSubmitted(true);
    } catch (e) {
      setError(e.message || "Ocurrió un error. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div className="card" style={{ padding: 44, maxWidth: 460, textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <CheckCircle2 size={28} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: 22, marginBottom: 10 }}>Solicitud enviada</h2>
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65, marginBottom: 8 }}>
            Tu perfil quedó en estado <b>pendiente de revisión</b>. Cuando realices el pago, se activará automáticamente.
          </p>
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65, marginBottom: 22 }}>
            El personal encargado se comunicará contigo para coordinar el pago, o podés comunicarte directamente a este número: <b style={{ color: "var(--ink)" }}>73381010</b>.
          </p>
          <button className="btn btn-primary btn-full" onClick={() => navigate("/")}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="container-narrow" style={{ padding: "34px 24px 70px" }}>
        <Logo size={36} onClick={() => navigate("/")} />
        <h1 style={{ fontSize: 28, margin: "22px 0 4px" }}>Creá tu perfil profesional</h1>
        <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 18 }}>Tu perfil será revisado antes de aparecer públicamente.</p>

        <div style={{ display: "flex", gap: 8, marginBottom: 26 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div style={{ height: 4, borderRadius: 4, background: i <= step ? "var(--primary)" : "var(--border)", marginBottom: 8 }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: i <= step ? "var(--ink)" : "var(--muted)" }}>{s}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 26, display: "flex", flexDirection: "column", gap: 16 }}>
          {step === 0 && (
            <>
              <Field label="Nombre completo"><input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Dra. Nombre Apellido" /></Field>
              <Field label="Email"><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" /></Field>
              <div className="g2">
                <Field label="Teléfono"><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+591 7XX XXXXX" /></Field>
                <Field label="WhatsApp"><input className="input" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="7XX XXXXX" /></Field>
              </div>
              <div className="g2">
                <Field label="Creá una contraseña"><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" /></Field>
                <Field label="Repetí la contraseña"><input className="input" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="Repetila" /></Field>
              </div>
              <Field label="Descripción breve"><textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Contá tu experiencia y enfoque profesional..." /></Field>
              <Field label="Universidad"><input className="input" value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="Universidad donde estudiaste" /></Field>
              {!step0Valid && <Hint>Completá nombre, email, WhatsApp y una contraseña válida para continuar.</Hint>}
            </>
          )}

          {step === 1 && (
            <>
              <MultiSelect label="Especies que atendés" options={SPECIES} selected={species} onChange={setSpecies} />
              <SpecialtyPicker label="Especialidades (podés elegir varias)" selected={specialties} onChange={setSpecialties} />
              <MultiSelect label="Servicios que ofrecés" options={SERVICES} selected={services} onChange={setServices} />
              <div className="g2">
                <Field label="Provincia">
                  <select className="input" value={provincia} onChange={(e) => setProvincia(e.target.value)}>
                    <option value="">Elegí una provincia</option>{PROVINCIAS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="Municipio">
                  <select className="input" value={municipio} onChange={(e) => setMunicipio(e.target.value)}>
                    <option value="">Elegí un municipio</option>{MUNICIPIOS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Zona (si aplica, dentro de Santa Cruz de la Sierra)">
                <select className="input" value={zona} onChange={(e) => setZona(e.target.value)}>
                  <option value="">Elegí una zona</option>{ZONAS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Dirección"><input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle / referencia" /></Field>
              <Field label="Red social (Instagram o TikTok, opcional)"><input className="input" value={social} onChange={(e) => setSocial(e.target.value)} placeholder="https://instagram.com/tu_usuario" /></Field>
              {!step1Valid && <Hint>Elegí al menos una especie y una especialidad para continuar.</Hint>}
            </>
          )}

          {step === 2 && (
            <>
              <UploadBox icon={Camera} title="Foto de perfil" hint="JPG o PNG" file={photoFile} onChange={setPhotoFile} accept="image/*" />
              <UploadBox icon={Upload} title="Documentación profesional" hint="Título, matrícula u otro respaldo (PDF/imagen)" file={docFile} onChange={setDocFile} accept="image/*,application/pdf" />
              <div style={{ background: "var(--surface-alt)", borderRadius: 14, padding: 14, fontSize: 12.5, color: "var(--muted)", lineHeight: 1.6 }}>
                Después de enviar, tu solicitud queda como <b>pendiente de revisión</b>. La administradora revisará tus datos y documentos antes de activar tu perfil.
              </div>
              <label style={{ display: "flex", gap: 9, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} style={{ marginTop: 3 }} />
                <span>He leído y acepto los <span onClick={(e) => { e.preventDefault(); setShowTerms(true); }} style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "underline" }}>Términos y Condiciones y la Política de Privacidad</span> de MyVet.</span>
              </label>
              <label style={{ display: "flex", gap: 9, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={acceptedProfessional} onChange={(e) => setAcceptedProfessional(e.target.checked)} style={{ marginTop: 3 }} />
                <span>Declaro que la información profesional de mi perfil es verdadera, correcta y actualizada.</span>
              </label>
              {error && <div style={{ color: "var(--danger)", fontSize: 12.5 }}>{error}</div>}
            </>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            {step > 0 && <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>Atrás</button>}
            {step < 2 ? (
              <button className="btn btn-primary btn-full" disabled={step === 0 ? !step0Valid : !step1Valid} onClick={() => setStep(step + 1)}>Continuar</button>
            ) : (
              <button className="btn btn-accent btn-full" disabled={!step2Valid || loading} onClick={handleSubmit}>
                <CheckCircle2 size={16} /> {loading ? "Enviando..." : "Enviar solicitud"}
              </button>
            )}
          </div>
        </div>
      </div>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  );
}

function Field({ label, children }) { return <div><div className="field-label">{label}</div>{children}</div>; }
function Hint({ children }) { return <div style={{ fontSize: 12, color: "var(--muted)" }}>{children}</div>; }
function UploadBox({ icon: Icon, title, hint, file, onChange, accept }) {
  return (
    <label style={{ border: "1.5px dashed var(--border)", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", background: "var(--bg)" }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={19} color="var(--primary)" /></div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{file ? file.name : hint}</div>
      </div>
      <input type="file" accept={accept} style={{ display: "none" }} onChange={(e) => onChange(e.target.files?.[0] || null)} />
    </label>
  );
}
