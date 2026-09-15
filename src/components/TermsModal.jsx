import { X } from "lucide-react";
import { TERMS_CONTENT } from "../lib/termsContent";
import { renderTermsLine } from "../lib/termsRenderer";

export default function TermsModal({ onClose }) {
  const lines = TERMS_CONTENT.split("\n");
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(10,30,28,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 22, width: "100%", maxWidth: 700, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontWeight: 800, fontSize: 14.5 }}>Términos y Condiciones</span>
          <button onClick={onClose} style={{ background: "var(--surface-alt)", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer" }}><X size={16} /></button>
        </div>
        <div style={{ padding: "24px 28px", overflowY: "auto" }}>
          {lines.map((l, i) => renderTermsLine(l, i))}
        </div>
      </div>
    </div>
  );
}
