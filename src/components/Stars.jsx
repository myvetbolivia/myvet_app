import { Star } from "lucide-react";

export default function Stars({ rating, size = 14 }) {
  if (!rating) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <Star size={size} fill="var(--accent)" color="var(--accent)" />
      <span style={{ fontSize: 13, fontWeight: 700 }}>{Number(rating).toFixed(1)}</span>
    </div>
  );
}
