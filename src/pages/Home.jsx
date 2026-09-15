import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Stethoscope } from "lucide-react";
import Navbar from "../components/Navbar";
import VetCard from "../components/VetCard";
import MultiSelect from "../components/MultiSelect";
import SpecialtyPicker from "../components/SpecialtyPicker";
import { supabase } from "../supabaseClient";
import { SPECIES, PROVINCIAS, ZONAS } from "../lib/constants";
import { useSearchFilters } from "../lib/useSearchFilters";

export default function Home() {
  const navigate = useNavigate();
  const { filters, setFilters } = useSearchFilters();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    supabase
      .from("veterinarian_profiles")
      .select("*")
      .eq("profile_status", "active")
      .eq("plan", "ultra")
      .eq("featured", true)
      .limit(3)
      .then(({ data }) => setFeatured(data || []));
  }, []);

  const goSearch = () => navigate("/resultados");

  return (
    <div>
      <Navbar />

      <div style={{ position: "relative", overflow: "hidden" }}>
        <div className="container" style={{ padding: "44px 28px 70px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: 900 }}>
          <img src="/portada.png" alt="Equipo veterinario de MyVet" style={{ width: "100%", maxWidth: 460, marginBottom: 12 }} onError={(e) => (e.currentTarget.style.display = "none")} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", background: "var(--surface-alt)", padding: "6px 12px", borderRadius: 999 }}>Santa Cruz, Bolivia</span>
          <h1 className="hero-title" style={{ fontSize: 42, lineHeight: 1.15, margin: "18px 0 14px" }}>
            Encontrá al veterinario correcto para cada animal, en tu zona.
          </h1>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.6, maxWidth: 520 }}>
            De medicina de pequeños animales a piscicultura: filtrá por especie, especialidad, provincia y zona, y contactá directo por WhatsApp o llamada.
          </p>

          <div className="card" style={{ marginTop: 28, width: "100%", padding: 22, textAlign: "left", boxShadow: "0 20px 50px -20px rgba(14,110,100,0.25)" }}>
            <div className="g2">
              <MultiSelect label="Especie" options={SPECIES} selected={filters.species} onChange={(v) => setFilters((f) => ({ ...f, species: v }))} placeholder="¿Qué animal?" />
              <SpecialtyPicker selected={filters.specialties} onChange={(v) => setFilters((f) => ({ ...f, specialties: v }))} />
            </div>
            <div className="g2" style={{ marginTop: 12 }}>
              <MultiSelect label="Provincia" options={PROVINCIAS} selected={filters.provincias} onChange={(v) => setFilters((f) => ({ ...f, provincias: v }))} placeholder="Todo Santa Cruz" />
              <MultiSelect label="Zona" options={ZONAS} selected={filters.zonas} onChange={(v) => setFilters((f) => ({ ...f, zonas: v }))} placeholder="Cualquier zona" />
            </div>
            <button className="btn btn-primary btn-full" style={{ marginTop: 14, height: 46 }} onClick={goSearch}>
              <Search size={16} /> Buscar
            </button>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ fontSize: 13, color: "var(--muted)", alignSelf: "center" }}>Populares:</span>
            {[
              { label: "Perros", species: ["Perros"] },
              { label: "Gatos", species: ["Gatos"] },
              { label: "Equinos", species: ["Equinos"] },
              { label: "Bovinos", species: ["Bovinos"] },
            ].map((t) => (
              <button key={t.label} className="pill" onClick={() => { setFilters((f) => ({ ...f, species: t.species })); goSearch(); }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "10px 28px 80px" }}>
        {featured.length > 0 && (
          <>
            <h2 style={{ fontSize: 26, marginBottom: 22 }}>Veterinarios destacados</h2>
            <div className="g3">
              {featured.map((v) => <VetCard key={v.id} vet={v} />)}
            </div>
          </>
        )}

        <div style={{ marginTop: 60, background: "var(--primary-dark)", borderRadius: 28, padding: "42px 44px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 460 }}>
            <h3 style={{ fontSize: 26, color: "#fff", marginBottom: 8 }}>¿Sos veterinario/a?</h3>
            <p style={{ color: "#CFE6E2", fontSize: 14.5, lineHeight: 1.6 }}>
              Creá tu perfil profesional, sumá todas tus especialidades y hacé que te encuentren clientes en toda Santa Cruz.
            </p>
          </div>
          <button className="btn btn-accent" onClick={() => navigate("/veterinario/registro")}>
            <Stethoscope size={16} /> Crear mi perfil
          </button>
        </div>

        <div style={{ marginTop: 50, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: 12.5, color: "var(--muted)" }}>© 2026 My Vet. Todos los derechos reservados.</span>
          <button onClick={() => navigate("/terminos")} style={{ fontSize: 12.5, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
            Términos y condiciones
          </button>
        </div>
      </div>
    </div>
  );
}
