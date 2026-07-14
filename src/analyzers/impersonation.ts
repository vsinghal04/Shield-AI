import { BRAND_KEYWORDS } from '../shared/constants';

export function detectBrandImpersonation(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const b of BRAND_KEYWORDS) {
    if (lower.includes(b)) found.push(b);
  }
  return [...new Set(found)];
}
