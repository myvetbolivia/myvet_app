import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import Logo from "../components/Logo";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { session, profile, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session && profile?.role === "admin") navigate("/admin/dashboard");
  }, [loading, session, profile]);

  const submit = async () => {
    setBusy(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) { setError("Email o contraseña incorrectos."); setBusy(false); return; }
    const { data: prof } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    if (prof?.role !== "admin") {
      setError("Esta cuenta no tiene permisos de administrador.");
      await supabase.auth.signOut();
      setBusy(false);
      return;
    }
    navigate("/admin/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="card" style={{ padding: 38, width: 340, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}><Logo size={54} /></div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
          <Lock size={14} color="var(--muted)" /><h2 style={{ fontSize: 19 }}>Acceso administrador</h2>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "8px 0 20px" }}>Ingresá con tu cuenta de administrador.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
        </div>
        {error && <div style={{ color: "var(--danger)", fontSize: 12, marginBottom: 12, textAlign: "left" }}>{error}</div>}
        <button className="btn btn-primary btn-full" disabled={busy} onClick={submit}>{busy ? "Entrando..." : "Entrar"}</button>
      </div>
    </div>
  );
}
