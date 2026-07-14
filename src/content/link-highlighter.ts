import type { ExtensionSettings, LinkScanResult } from '../shared/types';

const ATTR = 'data-shieldai-score';

export function annotateLink(anchor: HTMLAnchorElement, result: LinkScanResult): void {
  anchor.setAttribute(ATTR, String(result.threatScore));
  anchor.style.textDecorationThickness = '2px';
  if (result.threatLevel === 'dangerous') {
    anchor.style.textDecorationColor = '#ef4444';
    anchor.style.textUnderlineOffset = '3px';
  } else if (result.threatLevel === 'suspicious') {
    anchor.style.textDecorationColor = '#f59e0b';
  }
}

const hrefToResult = new Map<string, LinkScanResult>();

export function applyLinkScanResult(href: string, result: LinkScanResult): void {
  hrefToResult.set(href, result);
  document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
    try {
      const abs = new URL(a.href, location.href).href;
      if (abs === href || a.href === href) {
        if (result.threatLevel !== 'safe') annotateLink(a, result);
      }
    } catch {
      /* skip */
    }
  });
}

export function highlightLinkByScore(href: string, score: number): void {
  const level = score >= 70 ? 'dangerous' : score >= 40 ? 'suspicious' : 'safe';
  const synthetic: LinkScanResult = {
    url: href,
    threatScore: score,
    threatLevel: level,
    reasons: [],
    mlConfidence: 0,
    homographDetected: false,
    sslValid: href.startsWith('https:'),
    redirectChain: [],
    finalDestination: href,
  };
  applyLinkScanResult(href, synthetic);
}

export async function initLinkHighlighter(settings: ExtensionSettings): Promise<void> {
  if (!settings.highlightSuspiciousLinks) return;
  const anchors = [...document.querySelectorAll<HTMLAnchorElement>('a[href]')].slice(0, 100);
  for (const a of anchors) {
    try {
      const u = new URL(a.href, location.href).href;
      if (!u.startsWith('http')) continue;
      const result = (await chrome.runtime.sendMessage({ type: 'SCAN_URL', url: u })) as LinkScanResult;
      hrefToResult.set(u, result);
      if (result.threatLevel !== 'safe') annotateLink(a, result);
    } catch {
      /* skip */
    }
  }
}

export function getCachedResultForHref(href: string): LinkScanResult | undefined {
  return hrefToResult.get(href);
}
