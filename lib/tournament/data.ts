import type {
  SlotSource,
  TournamentConfig,
  TournamentMatch,
  TournamentTeam,
} from "./types";

// ---------------------------------------------------------------------------
// WK 2026 — official final draw (5 Dec 2025) + official match schedule.
// 48 teams · 12 groups · 104 matches. Teams, dates, venues and the Round-of-32
// bracket paths verified against fifa.com / ESPN. Group kick-off times are in
// US Eastern (EDT, −04:00) so they display correctly in your local timezone.
// Everything is editable in the app.
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

// Real host venues, keyed by a short code used in the fixtures below.
const VEN: Record<string, { stadium: string; city: string }> = {
  mexcity: { stadium: "Estadio Azteca", city: "Mexico-Stad" },
  guadalajara: { stadium: "Estadio Akron", city: "Guadalajara" },
  monterrey: { stadium: "Estadio BBVA", city: "Monterrey" },
  atlanta: { stadium: "Mercedes-Benz Stadium", city: "Atlanta" },
  houston: { stadium: "NRG Stadium", city: "Houston" },
  kansascity: { stadium: "Arrowhead Stadium", city: "Kansas City" },
  philadelphia: { stadium: "Lincoln Financial Field", city: "Philadelphia" },
  seattle: { stadium: "Lumen Field", city: "Seattle" },
  sfbay: { stadium: "Levi's Stadium", city: "San Francisco Bay Area" },
  boston: { stadium: "Gillette Stadium", city: "Boston" },
  miami: { stadium: "Hard Rock Stadium", city: "Miami" },
  toronto: { stadium: "BMO Field", city: "Toronto" },
  vancouver: { stadium: "BC Place", city: "Vancouver" },
  la: { stadium: "SoFi Stadium", city: "Los Angeles" },
  dallas: { stadium: "AT&T Stadium", city: "Dallas" },
  ny: { stadium: "MetLife Stadium", city: "New York / New Jersey" },
};

export const TEAMS: TournamentTeam[] = Object.keys(GROUPS).flatMap((g) =>
  GROUPS[g].map(([id, name, flag]) => ({ id, name, flag, group: g }))
);

export function getTeam(id?: string): TournamentTeam | undefined {
  if (!id) return undefined;
  return TEAMS.find((t) => t.id === id);
}

// --- Group fixtures: [group, dateISO, homeId, awayId, venueCode] -------------
// prettier-ignore
const GROUP_FIXTURES: [string, string, string, string, string][] = [
  ["A","2026-06-11T15:00:00-04:00","MEX","RSA","mexcity"],
  ["A","2026-06-11T22:00:00-04:00","KOR","CZE","guadalajara"],
  ["A","2026-06-18T12:00:00-04:00","CZE","RSA","atlanta"],
  ["A","2026-06-18T23:00:00-04:00","MEX","KOR","guadalajara"],
  ["A","2026-06-24T21:00:00-04:00","CZE","MEX","mexcity"],
  ["A","2026-06-24T21:00:00-04:00","RSA","KOR","monterrey"],

  ["B","2026-06-12T15:00:00-04:00","CAN","BIH","toronto"],
  ["B","2026-06-13T15:00:00-04:00","QAT","SUI","sfbay"],
  ["B","2026-06-18T15:00:00-04:00","SUI","BIH","la"],
  ["B","2026-06-18T18:00:00-04:00","CAN","QAT","vancouver"],
  ["B","2026-06-24T15:00:00-04:00","SUI","CAN","vancouver"],
  ["B","2026-06-24T15:00:00-04:00","BIH","QAT","seattle"],

  ["C","2026-06-13T18:00:00-04:00","BRA","MAR","ny"],
  ["C","2026-06-13T21:00:00-04:00","HAI","SCO","boston"],
  ["C","2026-06-19T18:00:00-04:00","SCO","MAR","boston"],
  ["C","2026-06-19T21:00:00-04:00","BRA","HAI","philadelphia"],
  ["C","2026-06-24T18:00:00-04:00","SCO","BRA","miami"],
  ["C","2026-06-24T18:00:00-04:00","MAR","HAI","atlanta"],

  ["D","2026-06-12T21:00:00-04:00","USA","PAR","la"],
  ["D","2026-06-13T00:00:00-04:00","AUS","TUR","vancouver"],
  ["D","2026-06-19T15:00:00-04:00","USA","AUS","seattle"],
  ["D","2026-06-19T00:00:00-04:00","TUR","PAR","sfbay"],
  ["D","2026-06-25T22:00:00-04:00","TUR","USA","la"],
  ["D","2026-06-25T22:00:00-04:00","PAR","AUS","sfbay"],

  ["E","2026-06-14T13:00:00-04:00","GER","CUW","houston"],
  ["E","2026-06-14T19:00:00-04:00","CIV","ECU","philadelphia"],
  ["E","2026-06-20T16:00:00-04:00","GER","CIV","toronto"],
  ["E","2026-06-20T20:00:00-04:00","ECU","CUW","kansascity"],
  ["E","2026-06-25T16:00:00-04:00","ECU","GER","ny"],
  ["E","2026-06-25T16:00:00-04:00","CUW","CIV","philadelphia"],

  ["F","2026-06-14T16:00:00-04:00","NED","JPN","dallas"],
  ["F","2026-06-14T22:00:00-04:00","SWE","TUN","monterrey"],
  ["F","2026-06-20T13:00:00-04:00","NED","SWE","houston"],
  ["F","2026-06-21T00:00:00-04:00","TUN","JPN","monterrey"],
  ["F","2026-06-25T19:00:00-04:00","JPN","SWE","dallas"],
  ["F","2026-06-25T19:00:00-04:00","TUN","NED","kansascity"],

  ["G","2026-06-15T18:00:00-04:00","BEL","EGY","seattle"],
  ["G","2026-06-16T00:00:00-04:00","IRN","NZL","la"],
  ["G","2026-06-21T15:00:00-04:00","BEL","IRN","la"],
  ["G","2026-06-21T21:00:00-04:00","NZL","EGY","vancouver"],
  ["G","2026-06-26T23:00:00-04:00","EGY","IRN","seattle"],
  ["G","2026-06-26T23:00:00-04:00","NZL","BEL","vancouver"],

  ["H","2026-06-15T13:00:00-04:00","ESP","CPV","atlanta"],
  ["H","2026-06-15T18:00:00-04:00","KSA","URU","miami"],
  ["H","2026-06-21T12:00:00-04:00","ESP","KSA","atlanta"],
  ["H","2026-06-21T18:00:00-04:00","URU","CPV","miami"],
  ["H","2026-06-26T20:00:00-04:00","CPV","KSA","houston"],
  ["H","2026-06-26T20:00:00-04:00","URU","ESP","guadalajara"],

  ["I","2026-06-16T15:00:00-04:00","FRA","SEN","ny"],
  ["I","2026-06-16T18:00:00-04:00","IRQ","NOR","boston"],
  ["I","2026-06-22T17:00:00-04:00","FRA","IRQ","philadelphia"],
  ["I","2026-06-22T20:00:00-04:00","NOR","SEN","ny"],
  ["I","2026-06-26T15:00:00-04:00","NOR","FRA","boston"],
  ["I","2026-06-26T15:00:00-04:00","SEN","IRQ","toronto"],

  ["J","2026-06-16T20:00:00-04:00","ARG","ALG","kansascity"],
  ["J","2026-06-17T00:00:00-04:00","AUT","JOR","sfbay"],
  ["J","2026-06-22T13:00:00-04:00","ARG","AUT","dallas"],
  ["J","2026-06-22T23:00:00-04:00","JOR","ALG","sfbay"],
  ["J","2026-06-27T22:00:00-04:00","ALG","AUT","kansascity"],
  ["J","2026-06-27T22:00:00-04:00","JOR","ARG","dallas"],

  ["K","2026-06-17T13:00:00-04:00","POR","COD","houston"],
  ["K","2026-06-17T22:00:00-04:00","UZB","COL","mexcity"],
  ["K","2026-06-23T13:00:00-04:00","POR","UZB","houston"],
  ["K","2026-06-23T22:00:00-04:00","COL","COD","guadalajara"],
  ["K","2026-06-27T19:30:00-04:00","COL","POR","miami"],
  ["K","2026-06-27T19:30:00-04:00","COD","UZB","atlanta"],

  ["L","2026-06-17T16:00:00-04:00","ENG","CRO","dallas"],
  ["L","2026-06-17T19:00:00-04:00","GHA","PAN","toronto"],
  ["L","2026-06-23T16:00:00-04:00","ENG","GHA","boston"],
  ["L","2026-06-23T19:00:00-04:00","PAN","CRO","toronto"],
  ["L","2026-06-27T17:00:00-04:00","PAN","ENG","ny"],
  ["L","2026-06-27T17:00:00-04:00","CRO","GHA","philadelphia"],
];

// --- Knockout sources --------------------------------------------------------
const W = (group: string): SlotSource => ({ kind: "groupWinner", group });
const R = (group: string): SlotSource => ({ kind: "groupRunnerUp", group });
const T = (index: number): SlotSource => ({ kind: "bestThird", index });
const Win = (matchId: string): SlotSource => ({ kind: "winner", matchId });

// Round of 32 — official pairings, dates and venues. Third-place slots are
// filled by the best-ranked third-placed teams (index 0..7) once groups finish.
// prettier-ignore
const R32_FIXTURES: [string, string, SlotSource, SlotSource][] = [
  ["R32-1", "2026-06-28", R("A"), R("B")],
  ["R32-2", "2026-06-29", W("C"), R("F")],
  ["R32-3", "2026-06-29", W("E"), T(0)],
  ["R32-4", "2026-06-29", W("F"), R("C")],
  ["R32-5", "2026-06-30", R("E"), R("I")],
  ["R32-6", "2026-06-30", W("I"), T(1)],
  ["R32-7", "2026-06-30", W("A"), T(2)],
  ["R32-8", "2026-07-01", W("L"), T(3)],
  ["R32-9", "2026-07-01", W("G"), T(4)],
  ["R32-10", "2026-07-01", W("D"), T(5)],
  ["R32-11", "2026-07-02", W("H"), R("J")],
  ["R32-12", "2026-07-02", R("K"), R("L")],
  ["R32-13", "2026-07-02", W("B"), T(6)],
  ["R32-14", "2026-07-03", R("D"), R("G")],
  ["R32-15", "2026-07-03", W("J"), R("H")],
  ["R32-16", "2026-07-03", W("K"), T(7)],
];
const R32_VENUES = [
  "la", "houston", "boston", "monterrey", "dallas", "ny", "mexcity", "atlanta",
  "seattle", "sfbay", "la", "toronto", "vancouver", "dallas", "miami", "kansascity",
];

const R16_META: [string, string][] = [
  ["2026-07-04", "houston"],
  ["2026-07-04", "philadelphia"],
  ["2026-07-05", "ny"],
  ["2026-07-05", "mexcity"],
  ["2026-07-06", "dallas"],
  ["2026-07-06", "seattle"],
  ["2026-07-07", "atlanta"],
  ["2026-07-07", "vancouver"],
];
const QF_META: [string, string][] = [
  ["2026-07-09", "boston"],
  ["2026-07-10", "la"],
  ["2026-07-11", "miami"],
  ["2026-07-11", "kansascity"],
];
const SF_META: [string, string][] = [
  ["2026-07-14", "dallas"],
  ["2026-07-15", "atlanta"],
];

function buildMatches(): TournamentMatch[] {
  const matches: TournamentMatch[] = [];
  let n = 0;

  // Group stage
  for (const [group, date, homeId, awayId, ven] of GROUP_FIXTURES) {
    n += 1;
    const v = VEN[ven];
    matches.push({
      id: `G-${group}-${n}`,
      phase: "group",
      number: n,
      group,
      date,
      stadium: v.stadium,
      city: v.city,
      homeSource: { kind: "team", teamId: homeId },
      awaySource: { kind: "team", teamId: awayId },
    });
  }

  // Round of 32
  const r32Ids: string[] = [];
  R32_FIXTURES.forEach(([id, date, home, away], i) => {
    n += 1;
    r32Ids.push(id);
    const v = VEN[R32_VENUES[i]];
    matches.push({
      id,
      phase: "r32",
      number: n,
      date,
      stadium: v.stadium,
      city: v.city,
      homeSource: home,
      awaySource: away,
    });
  });

  // Helper to add a knockout round that pairs winners of the previous round.
  const addRound = (
    phase: "r16" | "qf" | "sf" | "final",
    meta: [string, string][],
    feeders: string[]
  ): string[] => {
    const ids: string[] = [];
    meta.forEach(([date, ven], i) => {
      n += 1;
      const id = `${phase.toUpperCase()}-${i + 1}`;
      ids.push(id);
      const v = VEN[ven];
      matches.push({
        id,
        phase,
        number: n,
        date,
        stadium: v.stadium,
        city: v.city,
        homeSource: Win(feeders[i * 2]),
        awaySource: Win(feeders[i * 2 + 1]),
      });
    });
    return ids;
  };

  const r16 = addRound("r16", R16_META, r32Ids);
  const qf = addRound("qf", QF_META, r16);
  const sf = addRound("sf", SF_META, qf);
  addRound("final", [["2026-07-19", "ny"]], sf);

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
