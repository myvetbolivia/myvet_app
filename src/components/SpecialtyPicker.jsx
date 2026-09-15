import { useState } from "react";
import { X } from "lucide-react";
import { SPECIALTIES_GROUPED } from "../lib/constants";

export default function SpecialtyPicker({ selected, onChange, label = "Especialidad" }) {
  const [query, setQuery] = useState("");
  const toggle = (it) => onChange(selected.includes(it) ? selected.filter((x) => x !== it) : [...selected, it]);
  const q = query.trim().toLowerCase();

  return (
    <div>
      <div className="field-label">{label}{selected.length ? ` · ${selected.length} seleccionada(s)` : ""}</div>
      <div style={{ border: "1.5px solid var(--border)", borderRadius: 14, padding: 12, background: "#fff" }}>
        <input className="input" placeholder="Buscar especialidad..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ height: 38, marginBottom: 10 }} />
        <div style={{ maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {SPECIALTIES_GROUPED.map((group) => {
            const items = group.items.filter((it) => it.toLowerCase().includes(q));
            if (!items.length) return null;
            return (
              <div key={group.category}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--primary)", marginBottom: 6 }}>{group.category}</div>
                {items.map((it) => (
                  <label key={it} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5, padding: "5px 4px", cursor: "pointer" }}>
                    <input type="checkbox" checked={selected.includes(it)} onChange={() => toggle(it)} /> {it}
                  </label>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {selected.map((s) => (
            <span key={s} style={{ fontSize: 12, fontWeight: 600, color: "var(--primary-dark)", background: "var(--celeste-soft)", padding: "5px 8px 5px 10px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6 }}>
              {s} <X size={12} style={{ cursor: "pointer" }} onClick={() => toggle(s)} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
