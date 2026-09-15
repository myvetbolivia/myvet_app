import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Logo from "../components/Logo";
import { supabase } from "../supabaseClient";

export default function VetLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setError("Email o contraseña incorrectos.");
    else navigate("/veterinario/panel");
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: 380 }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", marginBottom: 16 }}>
          <ChevronLeft size={15} /> Volver
        </button>
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><Logo size={48} /></div>
          <h2 style={{ fontSize: 20, textAlign: "center", marginBottom: 6 }}>Editar mi perfil</h2>
          <p style={{ fontSize: 12.5, color: "var(--muted)", textAlign: "center", marginBottom: 20 }}>
            Ingresá con el email y la contraseña que usaste al registrarte, esté tu perfil aprobado o todavía pendiente de revisión.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div><div className="field-label">Email</div><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><div className="field-label">Contraseña</div><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          </div>
          {error && <div style={{ color: "var(--danger)", fontSize: 12.5, marginTop: 10 }}>{error}</div>}
          <button className="btn btn-primary btn-full" style={{ marginTop: 16 }} disabled={loading} onClick={submit}>
            {loading ? "Entrando..." : "Entrar a mi perfil"}
          </button>
        </div>
      </div>
    </div>
  );
}
