import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "../components/Navbar";
import VetRow from "../components/VetRow";
import SpecialtyPicker from "../components/SpecialtyPicker";
import { supabase } from "../supabaseClient";
import { SPECIES, PROVINCIAS, ZONAS, SERVICES, visibleSpecialties } from "../lib/constants";
import { useSearchFilters } from "../lib/useSearchFilters";

function CheckList({ options, selected, onToggle, maxHeight }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, ...(maxHeight ? { maxHeight, overflowY: "auto" } : {}) }}>
      {options.map((o) => (
        <label key={o} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, cursor: "pointer", padding: "3px 2px" }}>
          <input type="checkbox" checked={selected.includes(o)} onChange={() => onToggle(o)} /> {o}
        </label>
      ))}
    </div>
  );
}

export default function Results() {
  const navigate = useNavigate();
  const { filters, setFilters } = useSearchFilters();
  const { species, specialties, provincias, zonas, services } = filters;
  const [allVets, setAllVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    supabase
      .from("veterinarian_profiles")
      .select("*")
      .eq("profile_status", "active")
      .then(({ data }) => { setAllVets(data || []); setLoading(false); });
  }, []);

  const toggle = (key, value) => setFilters((f) => ({
    ...f,
    [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value],
  }));

  const results = useMemo(() => {
    let list = [...allVets];
    if (species.length) list = list.filter((v) => (v.species || []).some((s) => species.includes(s)));
    if (provincias.length) list = list.filter((v) => provincias.includes(v.provincia));
    if (zonas.length) list = list.filter((v) => zonas.includes(v.zona));
    if (services.length) list = list.filter((v) => (v.services || []).some((s) => services.includes(s)));
    if (specialties.length) list = list.filter((v) => visibleSpecialties(v).some((s) => specialties.includes(s)));
    const rank = { ultra: 0, premium: 1, basico: 2 };
    return list.sort((a, b) => rank[a.plan] - rank[b.plan]);
  }, [allVets, species, provincias, zonas, services, specialties]);

  const hasFilters = species.length || provincias.length || zonas.length || services.length || specialties.length;
  const clearAll = () => setFilters({ species: [], specialties: [], provincias: [], zonas: [], services: [] });

  const filterPanel = (
    <div className="card" style={{ padding: 18, position: "sticky", top: 20, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 12 }}>Especie</div>
        <CheckList options={SPECIES} selected={species} onToggle={(o) => toggle("species", o)} maxHeight={190} />
      </div>
      <SpecialtyPicker selected={specialties} onChange={(v) => setFilters((f) => ({ ...f, specialties: v }))} />
      <div>
        <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 12 }}>Provincia</div>
        <CheckList options={PROVINCIAS} selected={provincias} onToggle={(o) => toggle("provincias", o)} maxHeight={160} />
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 12 }}>Zona (Santa Cruz de la Sierra)</div>
        <CheckList options={ZONAS} selected={zonas} onToggle={(o) => toggle("zonas", o)} />
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 12 }}>Servicio</div>
        <CheckList options={SERVICES} selected={services} onToggle={(o) => toggle("services", o)} />
      </div>
      {hasFilters ? (
        <button onClick={clearAll} style={{ fontSize: 12.5, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 700, textAlign: "left" }}>
          Limpiar filtros
        </button>
      ) : null}
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: "20px 28px 70px" }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", marginBottom: 18 }}>
          <ChevronLeft size={15} /> Volver al inicio
        </button>

        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="btn"
          style={{ display: "none", width: "100%", justifyContent: "space-between", background: "#fff", border: "1.5px solid var(--border)", marginBottom: 14 }}
          id="filters-toggle"
        >
          <span>Filtros {hasFilters ? `(${species.length + provincias.length + zonas.length + services.length + specialties.length})` : ""}</span>
          {filtersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <style>{`
          @media (max-width: 760px) {
            #filters-toggle { display: flex !important; }
            #filters-panel { display: ${filtersOpen ? "block" : "none"}; }
          }
        `}</style>

        <div className="side-l">
          <aside id="filters-panel">{filterPanel}</aside>
          <div>
            <div style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 16 }}>
              {loading ? "Buscando..." : `${results.length} veterinarios encontrados`}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {results.map((v) => <VetRow key={v.id} vet={v} />)}
              {!loading && results.length === 0 && (
                <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--muted)", borderStyle: "dashed" }}>
                  No hay resultados con esos filtros. Probá ampliando la búsqueda.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
