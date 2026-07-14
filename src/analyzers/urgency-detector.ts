export function urgencyScore(text: string): number {
  const t = text.toLowerCase();
  let s = 0;
  if (/\bnow\b|\bimmediately\b|\burgent\b|\bexpire\b/.test(t)) s += 3;
  if (/\b24\s*hours?\b|\b48\s*hours?\b/.test(t)) s += 2;
  if (/\bact\s+fast\b|\blast\s+chance\b/.test(t)) s += 2;
  return Math.min(10, s);
}
