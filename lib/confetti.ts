// Celebratory confetti in WK orange/gold tones — fired when a bet is won.
export async function fireWinConfetti() {
  if (typeof window === "undefined") return;
  const confetti = (await import("canvas-confetti")).default;

  const colors = ["#FF7A00", "#FBBF24", "#FFFFFF", "#22C55E"];
  const defaults = { spread: 70, ticks: 220, gravity: 0.9, scalar: 1.05, colors };

  confetti({ ...defaults, particleCount: 60, origin: { x: 0.5, y: 0.4 } });
  setTimeout(
    () =>
      confetti({
        ...defaults,
        particleCount: 40,
        angle: 60,
        origin: { x: 0, y: 0.6 },
      }),
    120
  );
  setTimeout(
    () =>
      confetti({
        ...defaults,
        particleCount: 40,
        angle: 120,
        origin: { x: 1, y: 0.6 },
      }),
    120
  );
}
