import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function MultiSelect({ label, options, selected, onChange, placeholder = "Cualquiera" }) {
  const [open, setOpen] = useState(false);
  const toggle = (o) => onChange(selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o]);

  return (
    <div style={{ position: "relative" }}>
      {label && <div className="field-label">{label}</div>}
      <button
        type="button"
        className="input"
        onClick={() => setOpen((o) => !o)}
        style={{ textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <span style={{ color: selected.length ? "var(--ink)" : "var(--muted)" }}>
          {selected.length ? `${selected.length} seleccionada(s)` : placeholder}
        </span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 8, width: 260, maxHeight: 280, overflowY: "auto", background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: 14, zIndex: 60, boxShadow: "0 24px 50px -20px rgba(19,48,44,0.35)" }}>
          {options.map((o) => (
            <label key={o} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, padding: "4px 2px", cursor: "pointer" }}>
              <input type="checkbox" checked={selected.includes(o)} onChange={() => toggle(o)} /> {o}
            </label>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
            <button type="button" onClick={() => onChange([])} style={{ background: "none", border: "none", fontSize: 12, color: "var(--muted)", fontWeight: 700, cursor: "pointer" }}>Limpiar</button>
            <button type="button" className="btn btn-primary" style={{ padding: "6px 14px" }} onClick={() => setOpen(false)}>Listo</button>
          </div>
        </div>
      )}
    </div>
  );
}
