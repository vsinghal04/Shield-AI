import { parse } from 'tldts';

export function normalizeDomain(host: string): string {
  return host.toLowerCase().replace(/^\[|\]$/g, '');
}

export function getRegistrableDomain(urlOrHost: string): string | null {
  let input = urlOrHost.trim();
  if (!input.includes('://')) input = `https://${input}`;
  try {
    const p = parse(input);
    return p.domain ?? p.hostname ?? null;
  } catch {
    return null;
  }
}

export function urlEntropy(url: string): number {
  const path = url.split(/[?#]/)[0] ?? url;
  const chars: Record<string, number> = {};
  for (const c of path) chars[c] = (chars[c] ?? 0) + 1;
  const len = path.length || 1;
  let h = 0;
  for (const n of Object.values(chars)) {
    const p = n / len;
    h -= p * Math.log2(p);
  }
  return Math.min(1, h / 8);
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const row = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) row[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = row[0]!;
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j]!;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[n]!;
}

export function stripTrackingParams(url: string): string {
  try {
    const u = new URL(url);
    const drop = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'mc_eid',
    ];
    for (const p of drop) u.searchParams.delete(p);
    return u.toString();
  } catch {
    return url;
  }
}

export function isIpHost(hostname: string): boolean {
  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    return true;
  }
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
}

export function simpleGrammarScore(text: string): number {
  const t = text.trim();
  if (t.length < 20) return 0.5;
  const words = t.split(/\s+/).filter(Boolean);
  const sentences = t.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) return 0.3;
  const avgWordsPerSentence = words.length / sentences.length;
  const capsRatio = (t.match(/[A-Z]/g)?.length ?? 0) / t.length;
  let score = 0.7;
  if (avgWordsPerSentence > 35) score -= 0.15;
  if (capsRatio > 0.15) score -= 0.1;
  if ((t.match(/[!]{2,}/g)?.length ?? 0) > 3) score -= 0.1;
  return Math.max(0, Math.min(1, score));
}

export function burstinessScore(text: string): number {
  const sentences = text.split(/[.!?\n]+/).map((s) => s.trim()).filter((s) => s.length > 5);
  if (sentences.length < 2) return 0.5;
  const lengths = sentences.map((s) => s.split(/\s+/).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance =
    lengths.reduce((acc, l) => acc + (l - mean) ** 2, 0) / lengths.length;
  const std = Math.sqrt(variance);
  return Math.min(1, std / (mean || 1));
}

export function perplexityProxy(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  if (words.length < 10) return 0.5;
  const uniq = new Set(words);
  const ratio = uniq.size / words.length;
  return Math.min(1, ratio * 1.2);
}
