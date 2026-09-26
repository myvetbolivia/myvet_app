import { Plus, X } from "lucide-react";

// Editor del horario de atención: una fila por día o grupo de días.
// Se guarda como [["Lunes a viernes", "08:00 a 18:00"], ...].
const DAYS = [
  "Lunes a viernes", "Lunes a sábado", "Todos los días",
  "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo", "Sábados y domingos", "Feriados",
];
const MODES = ["Horario", "24 horas", "Con cita previa", "Cerrado"];
const COMMON = [["Lunes a viernes", "08:00 a 18:00"], ["Sábado", "08:00 a 12:00"]];

function parse(hours) {
  const m = /^(\d{2}:\d{2}) a (\d{2}:\d{2})$/.exec(hours || "");
  if (m) return { mode: "Horario", from: m[1], to: m[2] };
  if (MODES.includes(hours)) return { mode: hours, from: "08:00", to: "18:00" };
  return { mode: "Horario", from: "08:00", to: "18:00" };
}

export default function ScheduleEditor({ value, onChange }) {
  const rows = (value || []).filter(([d]) => d && d !== "A confirmar");

  const update = (i, day, hours) => onChange(rows.map((r, j) => (j === i ? [day, hours] : r)));
  const remove = (i) => onChange(rows.filter((_, j) => j !== i));
  const add = () => onChange([...rows, ["Lunes a viernes", "08:00 a 18:00"]]);

  return (
    <div style={{ border: "1.5px solid var(--border)", borderRadius: 14, padding: 14, background: "#fff", display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 13.5 }}>Horario de atención</div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>Se muestra en tu perfil con los planes Premium y Premium Ultra Smart.</div>
      </div>

      {rows.map(([day, hours], i) => {
        const p = parse(hours);
        const setMode = (mode) => update(i, day, mode === "Horario" ? `${p.from} a ${p.to}` : mode);
        return (
          <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", background: "var(--surface-alt)", borderRadius: 12, padding: 10 }}>
            <select className="input" style={{ flex: "1 1 150px", height: 40 }} value={day} onChange={(e) => update(i, e.target.value, hours)}>
              {(DAYS.includes(day) ? DAYS : [day, ...DAYS]).map((d) => <option key={d}>{d}</option>)}
            </select>
            <select className="input" style={{ flex: "1 1 130px", height: 40 }} value={p.mode} onChange={(e) => setMode(e.target.value)}>
              {MODES.map((m) => <option key={m}>{m}</option>)}
            </select>
            {p.mode === "Horario" && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "1 1 200px" }}>
                <input className="input" type="time" style={{ height: 40 }} value={p.from} onChange={(e) => update(i, day, `${e.target.value} a ${p.to}`)} />
                <span style={{ fontSize: 13, color: "var(--muted)" }}>a</span>
                <input className="input" type="time" style={{ height: 40 }} value={p.to} onChange={(e) => update(i, day, `${p.from} a ${e.target.value}`)} />
              </div>
            )}
            <button type="button" aria-label="Quitar fila" onClick={() => remove(i)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}>
              <X size={18} color="var(--danger)" />
            </button>
          </div>
        );
      })}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="btn btn-ghost" style={{ padding: "8px 14px" }} onClick={add}><Plus size={15} /> Agregar día</button>
        {rows.length === 0 && (
          <button type="button" className="btn btn-subtle" style={{ padding: "8px 14px" }} onClick={() => onChange(COMMON)}>Usar horario común</button>
        )}
      </div>
    </div>
  );
}
