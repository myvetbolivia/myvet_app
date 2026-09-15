import { createContext, useContext, useState } from "react";

// Guarda los filtros de búsqueda (especie, especialidad, provincia, zona,
// servicio) en un solo lugar compartido, para que lo que se marca en el
// buscador de Inicio siga marcado al llegar a la página de Resultados.
const FiltersContext = createContext(null);

const EMPTY = { species: [], specialties: [], provincias: [], zonas: [], services: [] };

export function FiltersProvider({ children }) {
  const [filters, setFilters] = useState(EMPTY);
  return <FiltersContext.Provider value={{ filters, setFilters }}>{children}</FiltersContext.Provider>;
}

export function useSearchFilters() {
  return useContext(FiltersContext);
}
