import { useEffect, useState } from "react";
import { ShieldCheck, XCircle } from "lucide-react";
import { supabase } from "../../supabaseClient";

export default function AdminAdmins() {
  const [admins, setAdmins] = useState([]);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("role", "admin").order("created_at", { ascending: false });
    setAdmins(data || []);
  };
  useEffect(() => { load(); }, []);

  const promote = async () => {
    setMessage("");
    const { data, error } = await supabase.from("profiles").select("id, role, email").eq("email", email.trim()).maybeSingle();
    if (error || !data) { setMessage("No encontramos ninguna cuenta con ese email. La persona primero debe crearse una cuenta normal desde 'Iniciar sesión usuario' en la página."); return; }
    if (data.role === "admin") { setMessage("Esa cuenta ya es administradora."); return; }
    await supabase.from("profiles").update({ role: "admin" }).eq("id", data.id);
    setMessage(`¡Listo! ${email} ahora es administrador/a.`);
    setEmail("");
    load();
  };

  const revoke = async (id) => {
    if (!confirm("¿Quitarle el acceso de administrador a esta persona?")) return;
    await supabase.from("profiles").update({ role: "client" }).eq("id", id);
    load();
  };

  return (
    <div>
      <div className="card" style={{ padding: 22, marginBottom: 20, maxWidth: 520 }}>
        <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>Agregar un nuevo administrador</div>
        <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14, lineHeight: 1.6 }}>
          La persona primero debe crear su propia cuenta (con su email y una contraseña) desde el botón
          "Iniciar sesión usuario" de la página principal, como cualquier cliente. Una vez que lo haga,
          escribí acá su email para convertirla en administradora.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <input className="input" type="email" placeholder="email@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn btn-primary" onClick={promote}>Hacer admin</button>
        </div>
        {message && <div style={{ fontSize: 12.5, color: "var(--primary-dark)", marginTop: 10 }}>{message}</div>}
      </div>

      <div className="card" style={{ padding: 22, maxWidth: 520 }}>
        <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 14 }}>Administradores actuales</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {admins.map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><ShieldCheck size={15} color="var(--primary)" /> <span style={{ fontSize: 13.5, fontWeight: 600 }}>{a.full_name || a.email}</span></div>
              <button onClick={() => revoke(a.id)} title="Quitar acceso de administrador" style={{ background: "var(--danger-soft)", color: "var(--danger)", border: "none", borderRadius: 9, width: 30, height: 30, cursor: "pointer" }}><XCircle size={14} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
