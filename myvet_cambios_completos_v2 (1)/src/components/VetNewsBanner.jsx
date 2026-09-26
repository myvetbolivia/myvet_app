import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { getVetNews } from "../lib/vetNews";

// Aviso en la página principal para el veterinario que tiene la sesión abierta:
// le cuenta cuánta gente vio su perfil o lo contactó desde su última visita.
export default function VetNewsBanner({ style }) {
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const [news, setNews] = useState([]);
  const isVet = !!session && profile?.role === "veterinarian";

  useEffect(() => {
    if (!isVet) { setNews([]); return; }
    supabase
      .from("veterinarian_profiles")
      .select("id, profile_views, whatsapp_clicks, call_clicks, location_clicks, reviews_count")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setNews(getVetNews(data)));
  }, [isVet, session?.user?.id]);

  if (!isVet || news.length === 0) return null;

  return (
    <button type="button" className="vet-news-banner" style={style} onClick={() => navigate("/veterinario/panel")}>
      <span className="vet-news-dot" aria-hidden="true" />
      <Sparkles size={20} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontWeight: 800, fontSize: 14.5 }}>Hay movimiento en tu perfil</span>
        <span style={{ display: "block", fontSize: 12.5, color: "#CFE6E2", marginTop: 2 }}>{news[0].text}{news.length > 1 ? " y más" : ""}</span>
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
        Ver <ChevronRight size={16} />
      </span>
    </button>
  );
}
