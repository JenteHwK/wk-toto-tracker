# WK Toto Tracker ⚽🏆

Een moderne, persoonlijke tracker voor je WK 2026 Toto-weddenschappen. Voer je
bets in, volg status (open / gewonnen / verloren), en zie realtime je winst,
verlies, ROI en analytics — alles lokaal opgeslagen in je browser.

![stack](https://img.shields.io/badge/Next.js-15-black) ![ts](https://img.shields.io/badge/TypeScript-5-blue) ![tailwind](https://img.shields.io/badge/TailwindCSS-3-38bdf8)

## ✨ Functionaliteiten

- **Dashboard** met statistiek-kaarten: totaal/gewonnen/verloren/open bets,
  totale inzet, winst, verlies, netto resultaat, ROI en winstpercentage.
- **Bet-overzicht** als kaarten met status-kleuren (🟧 open · 🟩 gewonnen ·
  🟥 verloren), odds, inzet, mogelijke uitbetaling en resultaat.
- **Combi-bets** (zoals de Treble) met alle losse selecties (legs) zichtbaar.
- **Filters & zoeken**: status, categorie, toernooifase, team, vrij zoeken en
  sorteren.
- **Beheerpagina** (CRUD): bets toevoegen, bewerken, verwijderen, status/inzet/
  odds wijzigen — met formuliervalidatie en bevestiging bij verwijderen.
- **Analytics** met Chart.js: cumulatieve winstontwikkeling (lijn),
  resultaatverdeling (donut) en inzet per dag (staaf), plus categorie-uitsplitsing.
- **Opslag**: localStorage (Zustand persist) + export/import naar JSON +
  automatische back-up.
- **Thema**: donker (standaard) / licht, responsive met mobiel menu, toast-
  notificaties en mooie loading states.

## 🚀 Aan de slag

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Je echte WK-bets staan al ingeladen als startdata
(status *open*). Markeer resultaten via de status-knoppen op een bet of op de
beheerpagina.

### Productie / Vercel

```bash
npm run build && npm start
```

De app is een standaard Next.js 15-project en kan zonder aanpassingen naar
Vercel worden gedeployed (`vercel` of via de Git-integratie).

## 🧱 Tech stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript**
- **TailwindCSS** met shadcn-stijl componenten · **Lucide** icons
- **Zustand** (state + localStorage persist) · **Chart.js** via react-chartjs-2

## 🗂️ Structuur

```
app/                Pagina's (dashboard, analytics, beheer) + layout
components/
  ui/               Herbruikbare UI (Button, Card, Modal, Toaster, …)
  bets/             BetCard, BetForm, BetFilters, BetList, StatusBadge
  dashboard/        StatCard, DashboardStats
  analytics/        Chart.js grafieken + thema
  data/             Export / import / back-up
  layout/           Navbar
  providers/        ThemeProvider
lib/                types, calculations, filter, analytics, seed, format, utils
store/              useBetStore (persist), useToastStore
```

## 🧮 Berekeningen

- **Mogelijke uitbetaling** = inzet × odds
- **Mogelijke winst** (netto) = inzet × odds − inzet
- **Netto resultaat** = winst (gewonnen) − inzet (verloren)
- **ROI** = (netto resultaat / totale inzet) × 100
- **Winstpercentage** = gewonnen / (gewonnen + verloren) × 100

> Let op: dit is een persoonlijke administratietool, geen goksite. Wed met mate.
