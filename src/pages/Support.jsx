import Navbar from "../components/Navbar";
import { MessageCircle } from "lucide-react";
import { SUPPORT_EMAIL } from "../lib/constants";

export default function Support() {
  return (
    <div>
      <Navbar />
      <div className="container-narrow" style={{ padding: "70px 24px 90px", textAlign: "center" }}>
        <div style={{ width: 62, height: 62, borderRadius: 18, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <MessageCircle size={28} color="var(--primary)" />
        </div>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>¿Necesitás ayuda?</h1>
        <p style={{ fontSize: 15.5, color: "var(--muted)", lineHeight: 1.7, marginBottom: 24 }}>
          Escribinos a este email y nuestro equipo técnico se contactará con usted.
        </p>
        <a href={`mailto:${SUPPORT_EMAIL}`} style={{ fontSize: 17, fontWeight: 700, color: "var(--primary)", textDecoration: "underline" }}>
          {SUPPORT_EMAIL}
        </a>
      </div>
    </div>
  );
}
