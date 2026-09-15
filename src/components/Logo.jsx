export default function Logo({ size = 44, onClick }) {
  return (
    <div
      className="logo"
      onClick={onClick}
      style={{ width: size, height: size, cursor: onClick ? "pointer" : "default" }}
    >
      <span style={{ color: "#fff", fontSize: size * 0.33 }}>My</span>
      <span style={{ color: "var(--celeste-light)", fontSize: size * 0.33, marginTop: size * 0.03 }}>Vet</span>
    </div>
  );
}
