import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Stethoscope, Users, Shield, Settings, Bell } from "lucide-react";
import Logo from "../../components/Logo";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/veterinarios", label: "Veterinarios", icon: Stethoscope },
  { to: "/admin/usuarios", label: "Usuarios", icon: Users },
  { to: "/admin/administradores", label: "Administradores", icon: Shield },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!session || profile?.role !== "admin")) navigate("/admin");
  }, [loading, session, profile]);

  if (loading || !session || profile?.role !== "admin") return <div style={{ padding: 40 }}>Verificando acceso...</div>;

  return (
    <div className="admin-shell">
      <aside style={{ background: "var(--primary-dark)", padding: "26px 16px", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 8px 26px", display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={32} /><span style={{ fontSize: 11, color: "#B9D6D1", fontWeight: 700 }}>ADMIN</span>
        </div>
        <div className="admin-nav" style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 11, padding: "11px 12px", borderRadius: 12,
              background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
              color: isActive ? "#fff" : "#B9D6D1", textDecoration: "none", fontSize: 13.5, fontWeight: 600,
            })}>
              <n.icon size={16} /> {n.label}
            </NavLink>
          ))}
        </div>
        <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, color: "#B9D6D1", fontSize: 13, padding: "0 12px" }}><Settings size={15} /> Configuración</div>
        </div>
      </aside>
      <main style={{ padding: "30px 36px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26 }}>Buen día, Administradora</h1>
            <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "4px 0 0" }}>Así está MyVet hoy</p>
          </div>
          <Bell size={20} color="var(--muted)" />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
