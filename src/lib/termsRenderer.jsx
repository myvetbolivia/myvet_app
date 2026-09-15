export function inlineMarkdown(text, keyBase) {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0, m, key = 0;
  while ((m = regex.exec(text))) {
    if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
    if (m[1]) parts.push(<b key={`${keyBase}-${key++}`}>{m[2]}</b>);
    else if (m[3]) parts.push(<a key={`${keyBase}-${key++}`} href={m[5]} style={{ color: "var(--primary)", fontWeight: 600 }}>{m[4]}</a>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

export function renderTermsLine(line, idx) {
  const t = line.trim();
  if (t === "---") return <hr key={idx} style={{ border: "none", borderTop: "1px solid var(--border)", margin: "28px 0" }} />;
  if (t === "") return null;
  if (t.startsWith("### ")) return <h3 key={idx} style={{ fontSize: 12.5, color: "var(--primary)", fontWeight: 800, marginTop: 16, marginBottom: 6, textTransform: "uppercase" }}>{inlineMarkdown(t.slice(4), idx)}</h3>;
  if (t.startsWith("## ")) return <h2 key={idx} style={{ fontSize: 20, fontWeight: 600, marginTop: 26, marginBottom: 10 }}>{inlineMarkdown(t.slice(3), idx)}</h2>;
  if (t.startsWith("# ")) return <h1 key={idx} style={{ fontSize: 25, color: "var(--primary-dark)", fontWeight: 700, marginTop: 34, marginBottom: 14 }}>{inlineMarkdown(t.slice(2), idx)}</h1>;
  if (t.startsWith("☐")) return (
    <div key={idx} style={{ display: "flex", gap: 9, fontSize: 14, lineHeight: 1.7, marginBottom: 6, background: "var(--surface-alt)", borderRadius: 10, padding: "8px 12px" }}>
      <span>☐</span><span>{inlineMarkdown(t.slice(1).trim(), idx)}</span>
    </div>
  );
  if (t.startsWith("* ")) return (
    <div key={idx} style={{ display: "flex", gap: 8, fontSize: 14, lineHeight: 1.7, marginBottom: 3, marginLeft: 6 }}>
      <span style={{ color: "var(--muted)" }}>•</span><span>{inlineMarkdown(t.slice(2), idx)}</span>
    </div>
  );
  if (/^\d+\.\s/.test(t)) return <div key={idx} style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 3, marginLeft: 6 }}>{inlineMarkdown(t, idx)}</div>;
  if (t.startsWith(">")) return (
    <blockquote key={idx} style={{ fontStyle: "italic", fontSize: 14.5, color: "var(--primary-dark)", background: "var(--celeste-soft)", borderLeft: "3px solid var(--primary)", padding: "10px 16px", margin: "8px 0", borderRadius: "0 10px 10px 0" }}>
      {inlineMarkdown(t.replace(/^>\s*/, ""), idx)}
    </blockquote>
  );
  return <p key={idx} style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 10 }}>{inlineMarkdown(t, idx)}</p>;
}
