// Maps (Dutch) country / team names to flag emoji for the sport cards.
const FLAGS: Record<string, string> = {
  nederland: "🇳🇱",
  holland: "🇳🇱",
  belgie: "🇧🇪",
  belgië: "🇧🇪",
  duitsland: "🇩🇪",
  frankrijk: "🇫🇷",
  spanje: "🇪🇸",
  engeland: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  portugal: "🇵🇹",
  italie: "🇮🇹",
  italië: "🇮🇹",
  kroatie: "🇭🇷",
  kroatië: "🇭🇷",
  zweden: "🇸🇪",
  denemarken: "🇩🇰",
  zwitserland: "🇨🇭",
  turkije: "🇹🇷",
  brazilie: "🇧🇷",
  brazilië: "🇧🇷",
  argentinie: "🇦🇷",
  argentinië: "🇦🇷",
  uruguay: "🇺🇾",
  colombia: "🇨🇴",
  japan: "🇯🇵",
  "zuid-korea": "🇰🇷",
  korea: "🇰🇷",
  australie: "🇦🇺",
  australië: "🇦🇺",
  marokko: "🇲🇦",
  egypte: "🇪🇬",
  senegal: "🇸🇳",
  tunesie: "🇹🇳",
  tunesië: "🇹🇳",
  nigeria: "🇳🇬",
  ghana: "🇬🇭",
  curacao: "🇨🇼",
  curaçao: "🇨🇼",
  haiti: "🇭🇹",
  haïti: "🇭🇹",
  vs: "🇺🇸",
  "verenigde staten": "🇺🇸",
  amerika: "🇺🇸",
  mexico: "🇲🇽",
  canada: "🇨🇦",
};

export function getFlag(name?: string): string | null {
  if (!name) return null;
  const key = name.toLowerCase().trim();
  return FLAGS[key] ?? null;
}

/** Splits "Nederland v Japan" / "VS / Turkije" into [home, away]. */
export function splitMatchup(label?: string): [string, string] | null {
  if (!label) return null;
  const parts = label.split(/\s+v\s+|\s+vs\s+|\s+\/\s+/i).map((s) => s.trim());
  if (parts.length === 2 && parts[0] && parts[1]) return [parts[0], parts[1]];
  return null;
}
