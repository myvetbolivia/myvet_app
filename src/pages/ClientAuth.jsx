import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import TermsModal from "../components/TermsModal";
import { supabase } from "../supabaseClient";

export default function ClientAuth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim() && pwd.length >= 6 && (mode === "login" || (name.trim() && accepted));

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pwd,
        options: { data: { full_name: name.trim() } },
      });
      if (error) setError(error.message);
      else navigate("/");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pwd });
      if (error) setError(error.message);
      else navigate("/");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: 380 }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer", marginBottom: 16 }}>← Volver</button>
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><Logo size={48} /></div>
          <div style={{ display: "flex", background: "var(--surface-alt)", borderRadius: 12, padding: 4, marginBottom: 22 }}>
            {[["signup", "Crear cuenta"], ["login", "Iniciar sesión"]].map(([id, label]) => (
              <button key={id} onClick={() => setMode(id)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: mode === id ? "#fff" : "transparent" }}>{label}</button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "signup" && (
              <div><div className="field-label">Nombre completo</div><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" /></div>
            )}
            <div><div className="field-label">Email</div><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" /></div>
            <div><div className="field-label">Contraseña</div><input className="input" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Mínimo 6 caracteres" /></div>
          </div>

          {mode === "signup" && (
            <label style={{ display: "flex", gap: 8, fontSize: 12, marginTop: 14, cursor: "pointer" }}>
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
              <span>Acepto los <span onClick={(e) => { e.preventDefault(); setShowTerms(true); }} style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "underline" }}>Términos y Condiciones y la Política de Privacidad</span> de MyVet.</span>
            </label>
          )}
          {error && <div style={{ color: "var(--danger)", fontSize: 12.5, marginTop: 10 }}>{error}</div>}
          <button className="btn btn-primary btn-full" style={{ marginTop: 16 }} disabled={!canSubmit || loading} onClick={submit}>
            {loading ? "Un momento..." : mode === "signup" ? "Crear mi cuenta" : "Entrar"}
          </button>
        </div>
      </div>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  );
}
