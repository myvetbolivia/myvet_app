import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { session, profile, signOut } = useAuth();
  const isClient = session && profile?.role === "client";

  const links = (
    <>
      <button className="btn btn-subtle" onClick={() => { navigate("/planes"); setOpen(false); }} style={{ background: "none", padding: 0, fontWeight: 600, color: "var(--ink)" }}>Planes</button>
      <button className="btn btn-subtle" onClick={() => { navigate("/ayuda"); setOpen(false); }} style={{ background: "none", padding: 0, fontWeight: 600, color: "var(--ink)" }}>Ayuda</button>

      {isClient ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface-alt)", padding: "6px 12px 6px 6px", borderRadius: 999 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>
              {(profile.full_name || profile.email || "?")[0].toUpperCase()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{profile.full_name || profile.email}</span>
          </div>
          <button onClick={() => { signOut(); setOpen(false); }} title="Cerrar sesión" style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <LogOut size={16} />
          </button>
        </div>
      ) : (
        <button className="btn btn-subtle" onClick={() => { navigate("/ingresar"); setOpen(false); }} style={{ background: "none", padding: 0, fontWeight: 600, color: "var(--ink)" }}>Iniciar sesión usuario</button>
      )}

      <div className="nav-divider" />

      <button className="btn btn-subtle" onClick={() => { navigate("/veterinario/ingresar"); setOpen(false); }} style={{ background: "none", padding: 0, fontWeight: 600, color: "var(--muted)", fontSize: 13 }}>
        ¿Sos vet? Ingresar a perfil
      </button>
      <button className="btn btn-ghost" onClick={() => { navigate("/veterinario/registro"); setOpen(false); }}>Soy veterinario (crear perfil)</button>
    </>
  );

  return (
    <div className="navbar">
      <div className="navbar-row">
        <Logo onClick={() => navigate("/")} />
        <div className="nav-links">{links}</div>
        <button className="nav-hamburger" onClick={() => setOpen((o) => !o)} aria-label="Abrir menú">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <div className={`nav-mobile${open ? " open" : ""}`} onClick={() => setOpen(false)}>
        {links}
      </div>
    </div>
  );
}
