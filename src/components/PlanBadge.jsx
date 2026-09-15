import { PLAN_LABEL } from "../lib/constants";

export default function PlanBadge({ plan }) {
  const bg = plan === "ultra" ? "var(--accent-soft)" : plan === "premium" ? "var(--celeste-soft)" : "var(--surface-alt)";
  const color = plan === "ultra" ? "var(--accent)" : plan === "premium" ? "var(--celeste)" : "var(--muted)";
  return (
    <span className="badge" style={{ background: bg, color }}>
      {plan === "ultra" && "✦ "}{PLAN_LABEL[plan]}
    </span>
  );
}
