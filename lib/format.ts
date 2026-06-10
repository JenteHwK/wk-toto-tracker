const euro = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const euroSigned = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "always",
});

export function formatEuro(value: number): string {
  return euro.format(value);
}

export function formatEuroSigned(value: number): string {
  // Avoid "+€0,00" noise for exactly zero
  if (value === 0) return euro.format(0);
  return euroSigned.format(value);
}

export function formatOdds(value: number): string {
  return value.toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString("nl-NL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // Only show time if it isn't midnight (date-only entries)
  if (d.getHours() === 0 && d.getMinutes() === 0) return "";
  return d.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateKey(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

/** Convert a datetime-local input value to ISO, preserving null when empty. */
export function toIso(localValue: string): string | undefined {
  if (!localValue) return undefined;
  const d = new Date(localValue);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/** Convert an ISO string to a datetime-local input value. */
export function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}
