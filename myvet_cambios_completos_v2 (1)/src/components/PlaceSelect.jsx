import MultiSelect from "./MultiSelect";

// Lista con casillas para elegir varios lugares (provincias, municipios o zonas),
// con una opción "Todo" arriba. Si se marca "Todo", se desmarcan las demás;
// si después se marca un lugar puntual, se desmarca "Todo".
export default function PlaceSelect({ label, allLabel, options, selected, onChange, placeholder = "Elegí una o varias" }) {
  const handleChange = (next) => {
    const hadAll = selected.includes(allLabel);
    const hasAll = next.includes(allLabel);
    if (hasAll && !hadAll) return onChange([allLabel]);
    if (hadAll && next.length > 1) return onChange(next.filter((x) => x !== allLabel));
    onChange(next);
  };
  return (
    <MultiSelect
      label={label}
      options={[allLabel, ...options]}
      selected={selected}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
}
