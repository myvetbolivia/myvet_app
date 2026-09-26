// Ubicación del consultorio del veterinario (si tiene uno).

// ¿El link parece de Google Maps?
export function isValidMapsUrl(url) {
  const u = (url || "").trim();
  if (!u) return true; // vacío está permitido
  return /^https?:\/\/\S+$/i.test(u) && /(google\.[a-z.]+\/maps|maps\.google\.|goo\.gl\/maps|maps\.app\.goo\.gl)/i.test(u);
}

// ¿Tiene consultorio cargado? (link, punto en el mapa o dirección)
export function hasClinic(v) {
  return !!((v.maps_url || "").trim() || (v.lat && v.lng) || (v.address || "").trim());
}

// ¿Tiene el punto exacto en el mapa? (link de Google Maps o ubicación tomada del celular)
// Solo con la dirección escrita Google Maps no encuentra el lugar exacto en
// Santa Cruz y muestra toda la ciudad, así que ahí no mostramos el botón.
export function hasExactLocation(v) {
  return !!((v.maps_url || "").trim() || (v.lat && v.lng));
}

// Link para abrir el consultorio en Google Maps (solo si hay punto exacto).
export function clinicMapsLink(v) {
  if ((v.maps_url || "").trim()) return v.maps_url.trim();
  if (v.lat && v.lng) return `https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}`;
  return "";
}

// ¿Atiende en el lugar (a domicilio o en la propiedad)?
// Sí, si no tiene consultorio o si marcó el servicio "Atención a domicilio".
export function servesOnSite(v) {
  return !hasClinic(v) || (v.services || []).includes("Atención a domicilio");
}
