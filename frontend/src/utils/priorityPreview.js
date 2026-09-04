// Client-side mirror of the backend's explainable priority heuristic.
// Gives citizens instant feedback as they type; the server recomputes
// the authoritative score on submit.
const CRITICAL_KEYWORDS = [
  "fire", "explosion", "collapse", "gas leak", "electrocut", "drowning",
  "life threatening", "life-threatening", "child", "children", "unconscious",
  "sparking wire", "live wire", "flood", "structural crack", "poison",
  "sewage overflow", "attack", "accident", "bleeding", "trapped",
];
const HIGH_KEYWORDS = [
  "danger", "dangerous", "urgent", "emergency", "leak", "broken pipe",
  "no water", "power outage", "blackout", "open manhole", "pothole",
  "garbage pile", "stray dog", "harassment", "theft", "robbery",
  "blocked drain", "contaminated", "outbreak", "injury", "hazard",
];
const MEDIUM_KEYWORDS = [
  "noise", "streetlight", "street light", "garbage", "littering",
  "parking", "encroachment", "illegal construction", "water supply",
  "traffic signal", "stray", "damaged road", "overflowing bin",
];

export function previewPriority(text, baseWeight = 40) {
  const t = (text || "").toLowerCase();
  let score = baseWeight;
  let matched = null;

  if (CRITICAL_KEYWORDS.some((k) => t.includes(k))) {
    score += 28;
    matched = CRITICAL_KEYWORDS.find((k) => t.includes(k));
  } else if (HIGH_KEYWORDS.some((k) => t.includes(k))) {
    score += 16;
    matched = HIGH_KEYWORDS.find((k) => t.includes(k));
  } else if (MEDIUM_KEYWORDS.some((k) => t.includes(k))) {
    score += 6;
    matched = MEDIUM_KEYWORDS.find((k) => t.includes(k));
  }

  score = Math.max(0, Math.min(100, score));
  let label = "low";
  if (score >= 80) label = "critical";
  else if (score >= 60) label = "high";
  else if (score >= 35) label = "medium";

  return { score, label, matched };
}
