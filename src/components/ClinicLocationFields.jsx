import { useState } from "react";
import { LocateFixed, CheckCircle2, X } from "lucide-react";
import { isValidMapsUrl } from "../lib/location";

// Campos para cargar la ubicación del consultorio: dirección escrita,
// botón "Usar mi ubicación actual" y link de Google Maps. Todo opcional.
export default function ClinicLocationFields({ address, onAddress, mapsUrl, onMapsUrl, lat, lng, onCoords }) {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");
  const linkOk = isValidMapsUrl(mapsUrl);

  const useMyLocation = () => {
    if (!navigator.geolocation) { setGeoError("Tu celular o navegador no permite tomar la ubicación. Pegá el link de Google Maps."); return; }
    setLocating(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onCoords(Number(pos.coords.latitude.toFixed(6)), Number(pos.coords.longitude.toFixed(6)));
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setGeoError(err.code === 1
          ? "No diste permiso para usar tu ubicación. Podés permitirlo en tu navegador, o pegar el link de Google Maps."
          : "No se pudo tomar la ubicación. Probá de nuevo o pegá el link de Google Maps.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return (
    <div style={{ border: "1.5px solid var(--border)", borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 12, background: "#fff" }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 13.5 }}>Ubicación del consultorio (opcional)</div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3, lineHeight: 1.5 }}>
          Si solo atendés a domicilio o en las propiedades, dejá esto vacío: tu perfil va a decir <b>"Atiende en el lugar"</b>.
        </div>
      </div>

      <div>
        <div className="field-label">Dirección</div>
        <input className="input" value={address || ""} onChange={(e) => onAddress(e.target.value)} placeholder="Calle, número, barrio o referencia" />
      </div>

      <div>
        <div className="field-label">Punto exacto en el mapa</div>
        {lat && lng ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface-alt)", borderRadius: 12, padding: "10px 12px", fontSize: 13 }}>
            <CheckCircle2 size={16} color="var(--primary)" />
            <span style={{ flex: 1 }}>Ubicación guardada. <a href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: 700 }}>Ver en el mapa</a></span>
            <button type="button" aria-label="Quitar ubicación" onClick={() => onCoords(null, null)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><X size={16} color="var(--muted)" /></button>
          </div>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={useMyLocation} disabled={locating}>
            <LocateFixed size={16} /> {locating ? "Buscando tu ubicación..." : "Usar mi ubicación actual"}
          </button>
        )}
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>Usalo solo si estás ahora en tu consultorio.</div>
        {geoError && <div style={{ fontSize: 12.5, color: "var(--danger)", marginTop: 6, fontWeight: 600 }}>{geoError}</div>}
      </div>

      <div>
        <div className="field-label">O pegá el link de Google Maps de tu consultorio</div>
        <input className="input" value={mapsUrl || ""} onChange={(e) => onMapsUrl(e.target.value)} placeholder="https://maps.app.goo.gl/..." />
        {linkOk ? (
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>En Google Maps: buscá tu consultorio → tocá <b>Compartir</b> → <b>Copiar enlace</b>.</div>
        ) : (
          <div style={{ fontSize: 12.5, color: "var(--danger)", marginTop: 6, fontWeight: 600 }}>Ese link no parece de Google Maps. Copialo desde Google Maps con el botón Compartir.</div>
        )}
      </div>

      {(address || "").trim() && !(lat && lng) && !(mapsUrl || "").trim() && (
        <div style={{ fontSize: 12.5, background: "var(--accent-soft)", color: "#8A4A10", borderRadius: 10, padding: "9px 11px", fontWeight: 600, lineHeight: 1.5 }}>
          Falta el punto exacto: sin él, el botón "Ver ubicación" no aparece en tu perfil. Tocá "Usar mi ubicación actual" o pegá el link de Google Maps.
        </div>
      )}
    </div>
  );
}
