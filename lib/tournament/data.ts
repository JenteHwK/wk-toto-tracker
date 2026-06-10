import type {
  SlotSource,
  TournamentConfig,
  TournamentMatch,
  TournamentTeam,
} from "./types";

// ---------------------------------------------------------------------------
// WK 2026 — official final draw (5 December 2025). 48 teams · 12 groups.
// Real host venues. Group fixtures follow FIFA's standard round-robin order;
// kick-off dates are spread across the official tournament window and are
// editable in the app. Teams/groups verified against fifa.com & Wikipedia.
// ---------------------------------------------------------------------------

// prettier-ignore
const GROUPS: Record<string, [string, string, string][]> = {
  // group: [id, name, flag] — in drawn position order (1..4)
  A: [["MEX","Mexico","🇲🇽"],["RSA","Zuid-Afrika","🇿🇦"],["KOR","Zuid-Korea","🇰🇷"],["CZE","Tsjechië","🇨🇿"]],
  B: [["CAN","Canada","🇨🇦"],["BIH","Bosnië-Herzegovina","🇧🇦"],["QAT","Qatar","🇶🇦"],["SUI","Zwitserland","🇨🇭"]],
  C: [["BRA","Brazilië","🇧🇷"],["MAR","Marokko","🇲🇦"],["HAI","Haïti","🇭🇹"],["SCO","Schotland","🏴󠁧󠁢󠁳󠁣󠁴󠁿"]],
  D: [["USA","VS","🇺🇸"],["PAR","Paraguay","🇵🇾"],["AUS","Australië","🇦🇺"],["TUR","Turkije","🇹🇷"]],
  E: [["GER","Duitsland","🇩🇪"],["CUW","Curaçao","🇨🇼"],["CIV","Ivoorkust","🇨🇮"],["ECU","Ecuador","🇪🇨"]],
  F: [["NED","Nederland","🇳🇱"],["JPN","Japan","🇯🇵"],["SWE","Zweden","🇸🇪"],["TUN","Tunesië","🇹🇳"]],
  G: [["BEL","België","🇧🇪"],["EGY","Egypte","🇪🇬"],["IRN","Iran","🇮🇷"],["NZL","Nieuw-Zeeland","🇳🇿"]],
  H: [["ESP","Spanje","🇪🇸"],["CPV","Kaapverdië","🇨🇻"],["KSA","Saoedi-Arabië","🇸🇦"],["URU","Uruguay","🇺🇾"]],
  I: [["FRA","Frankrijk","🇫🇷"],["SEN","Senegal","🇸🇳"],["IRQ","Irak","🇮🇶"],["NOR","Noorwegen","🇳🇴"]],
  J: [["ARG","Argentinië","🇦🇷"],["ALG","Algerije","🇩🇿"],["AUT","Oostenrijk","🇦🇹"],["JOR","Jordanië","🇯🇴"]],
  K: [["POR","Portugal","🇵🇹"],["COD","DR Congo","🇨🇩"],["UZB","Oezbekistan","🇺🇿"],["COL","Colombia","🇨🇴"]],
  L: [["ENG","Engeland","🏴󠁧󠁢󠁥󠁮󠁧󠁿"],["CRO","Kroatië","🇭🇷"],["GHA","Ghana","🇬🇭"],["PAN","Panama","🇵🇦"]],
};

const GROUP_KEYS = Object.keys(GROUPS);

const VENUES: { stadium: string; city: string }[] = [
  { stadium: "MetLife Stadium", city: "New York" },
  { stadium: "SoFi Stadium", city: "Los Angeles" },
  { stadium: "AT&T Stadium", city: "Dallas" },
  { stadium: "Mercedes-Benz Stadium", city: "Atlanta" },
  { stadium: "NRG Stadium", city: "Houston" },
  { stadium: "Arrowhead Stadium", city: "Kansas City" },
  { stadium: "Lincoln Financial Field", city: "Philadelphia" },
  { stadium: "Lumen Field", city: "Seattle" },
  { stadium: "Levi's Stadium", city: "San Francisco" },
  { stadium: "Gillette Stadium", city: "Boston" },
  { stadium: "Hard Rock Stadium", city: "Miami" },
  { stadium: "BMO Field", city: "Toronto" },
  { stadium: "BC Place", city: "Vancouver" },
  { stadium: "Estadio Azteca", city: "Mexico-Stad" },
  { stadium: "Estadio Akron", city: "Guadalajara" },
  { stadium: "Estadio BBVA", city: "Monterrey" },
];

export const TEAMS: TournamentTeam[] = GROUP_KEYS.flatMap((g) =>
  GROUPS[g].map(([id, name, flag]) => ({ id, name, flag, group: g }))
);

export function getTeam(id?: string): TournamentTeam | undefined {
  if (!id) return undefined;
  return TEAMS.find((t) => t.id === id);
}

// Round-robin pairing order for a group of 4.
const RR: [number, number][] = [
  [0, 1],
  [2, 3],
  [0, 2],
  [1, 3],
  [0, 3],
  [1, 2],
];

function isoDay(base: string, addDays: number, hour: number): string {
  const d = new Date(base + "T00:00:00");
  d.setDate(d.getDate() + addDays);
  d.setHours(hour, 0, 0, 0);
  // Local ISO (no Z) keeps display in the user's timezone.
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:00`;
}

const START = "2026-06-11";

function buildMatches(): TournamentMatch[] {
  const matches: TournamentMatch[] = [];
  let n = 0;
  let venueIdx = 0;
  const nextVenue = () => VENUES[venueIdx++ % VENUES.length];

  // --- Group stage: 12 groups × 6 = 72 matches, spread over 17 days ---
  GROUP_KEYS.forEach((g, gi) => {
    const teams = GROUPS[g];
    RR.forEach(([a, b], ri) => {
      n += 1;
      const v = nextVenue();
      // Stagger group dates so each group plays across the window.
      const dayOffset = ri * 3 + (gi % 3);
      const hour = [16, 19, 22][ri % 3];
      matches.push({
        id: `G-${g}-${ri + 1}`,
        phase: "group",
        number: n,
        group: g,
        date: isoDay(START, dayOffset, hour),
        stadium: v.stadium,
        city: v.city,
        homeSource: { kind: "team", teamId: teams[a][0] },
        awaySource: { kind: "team", teamId: teams[b][0] },
      });
    });
  });

  // --- Knockout bracket (single elimination, 32 → 1) ---
  const W = (group: string): SlotSource => ({ kind: "groupWinner", group });
  const R = (group: string): SlotSource => ({ kind: "groupRunnerUp", group });
  const T = (index: number): SlotSource => ({ kind: "bestThird", index });
  const Win = (matchId: string): SlotSource => ({ kind: "winner", matchId });

  // 16 R32 matches: 12 winners vs crossed runners-up + 4 best-third clashes.
  const r32Home: SlotSource[] = [
    W("A"), W("B"), W("C"), W("D"), W("E"), W("F"),
    W("G"), W("H"), W("I"), W("J"), W("K"), W("L"),
    T(0), T(1), T(2), T(3),
  ];
  const r32Away: SlotSource[] = [
    R("B"), R("A"), R("D"), R("C"), R("F"), R("E"),
    R("H"), R("G"), R("J"), R("I"), R("L"), R("K"),
    T(4), T(5), T(6), T(7),
  ];

  const phaseStarts: Record<string, number> = {
    r32: 17, // 28 Jun
    r16: 23, // 4 Jul
    qf: 28, // 9 Jul
    sf: 33, // 14 Jul
    final: 38, // 19 Jul
  };

  const addKo = (
    phase: "r32" | "r16" | "qf" | "sf" | "final",
    count: number,
    home: (i: number) => SlotSource,
    away: (i: number) => SlotSource
  ) => {
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      n += 1;
      const v = nextVenue();
      const id = `${phase.toUpperCase()}-${i + 1}`;
      ids.push(id);
      matches.push({
        id,
        phase,
        number: n,
        date: isoDay(START, phaseStarts[phase] + Math.floor(i / 2), 21),
        stadium: v.stadium,
        city: v.city,
        homeSource: home(i),
        awaySource: away(i),
      });
    }
    return ids;
  };

  const r32 = addKo("r32", 16, (i) => r32Home[i], (i) => r32Away[i]);
  const r16 = addKo("r16", 8, (i) => Win(r32[i * 2]), (i) => Win(r32[i * 2 + 1]));
  const qf = addKo("qf", 4, (i) => Win(r16[i * 2]), (i) => Win(r16[i * 2 + 1]));
  const sf = addKo("sf", 2, (i) => Win(qf[i * 2]), (i) => Win(qf[i * 2 + 1]));
  addKo("final", 1, () => Win(sf[0]), () => Win(sf[1]));

  return matches;
}

export const WK2026: TournamentConfig = {
  id: "wk-2026",
  name: "WK 2026",
  season: "2026",
  startDate: "2026-06-11",
  endDate: "2026-07-19",
  teams: TEAMS,
  matches: buildMatches(),
};
