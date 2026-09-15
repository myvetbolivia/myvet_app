import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import { TERMS_CONTENT } from "../lib/termsContent";
import { renderTermsLine } from "../lib/termsRenderer";

export default function Terms() {
  const navigate = useNavigate();
  const lines = TERMS_CONTENT.split("\n");
  return (
    <div>
      <Navbar />
      <div className="container-narrow" style={{ padding: "30px 24px 90px" }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", marginBottom: 20 }}>
          <ChevronLeft size={15} /> Volver al inicio
        </button>
        <div className="card" style={{ padding: "36px 34px" }}>
          {lines.map((l, i) => renderTermsLine(l, i))}
        </div>
      </div>
    </div>
  );
}
