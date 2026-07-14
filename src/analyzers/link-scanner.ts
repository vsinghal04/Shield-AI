import { parse } from 'tldts';
import {
  ALEXA_TOP_SAMPLE,
  FREE_HOSTING_HINTS,
  SUSPICIOUS_TLDS,
  URL_SHORTENERS,
  BRAND_KEYWORDS,
} from '../shared/constants';
import { getRegistrableDomain, isIpHost, levenshtein, normalizeDomain, urlEntropy } from '../shared/utils';
import type { LinkScanResult, ThreatReason } from '../shared/types';
import { detectHomograph } from './homograph';

export interface LinkScanContext {
  blocklistDomains: string[];
  allowlistDomains: string[];
  feedUrls: Set<string>;
  mlScore?: number;
  mlConfidence?: number;
  virusTotal?: { positives: number; total: number };
  safeBrowsingMatches?: number;
  expandedUrl?: string;
  redirectChain?: string[];
  sslValid?: boolean;
  domainAgeDays?: number;
  trustedDomains?: string[];
}

function levelFromScore(score: number): LinkScanResult['threatLevel'] {
  if (score >= 70) return 'dangerous';
  if (score >= 40) return 'suspicious';
  return 'safe';
}

function typosquatScore(hostname: string): { hit: boolean; brand?: string } {
  const base = hostname.replace(/^www\./, '').split('.')[0] ?? hostname;
  for (const brand of ALEXA_TOP_SAMPLE) {
    const b = brand.replace('.com', '').replace('.org', '');
    if (base.includes(b)) continue;
    const d = levenshtein(base, b);
    if (d > 0 && d <= 2 && base.length > 3) return { hit: true, brand: brand };
  }
  return { hit: false };
}

function userTyposquat(hostname: string, trusted: string[]): boolean {
  const h = hostname.toLowerCase();
  for (const t of trusted) {
    const tn = t.replace(/^https?:\/\//, '').split('/')[0] ?? t;
    const root = tn.split('.')[0] ?? tn;
    const hb = h.split('.')[0] ?? h;
    if (hb === root) continue;
    const d = levenshtein(hb, root);
    if (d > 0 && d <= 2) return true;
  }
  return false;
}

function brandInSubdomainAbuse(hostname: string): boolean {
  const parts = hostname.split('.');
  if (parts.length < 3) return false;
  const sub = parts[0]?.toLowerCase() ?? '';
  for (const b of BRAND_KEYWORDS) {
    if (sub.includes(b) && !hostname.endsWith(`${b}.com`)) {
      const reg = getRegistrableDomain(hostname);
      if (reg && !reg.startsWith(b)) return true;
    }
  }
  return false;
}

export function scanLink(url: string, ctx: LinkScanContext): LinkScanResult {
  const reasons: ThreatReason[] = [];
  let score = 0;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {
      url,
      threatScore: 100,
      threatLevel: 'dangerous',
      reasons: [
        {
          code: 'BAD_URL',
          label: 'Invalid URL',
          severity: 'high',
          description: 'Could not parse URL',
        },
      ],
      mlConfidence: 0,
      homographDetected: false,
      sslValid: false,
      redirectChain: ctx.redirectChain ?? [],
      finalDestination: ctx.expandedUrl ?? url,
    };
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol === 'javascript:' || protocol === 'data:') {
    reasons.push({
      code: 'DANGEROUS_SCHEME',
      label: 'Dangerous URL scheme',
      severity: 'critical',
      description: `${protocol} links can execute code or embed content`,
    });
    score += 90;
  }

  const host = normalizeDomain(parsed.hostname);
  const homograph = detectHomograph(parsed.hostname);
  if (homograph.detected) {
    reasons.push({
      code: 'HOMOGRAPH',
      label: 'Homograph / confusable characters',
      severity: 'high',
      description: homograph.detail,
    });
    score += 30;
  }

  if (isIpHost(host)) {
    reasons.push({
      code: 'IP_HOST',
      label: 'IP address host',
      severity: 'medium',
      description: 'Phishing often uses raw IPs',
    });
    score += 25;
  }

  const ent = urlEntropy(url);
  if (ent > 0.72) {
    reasons.push({
      code: 'HIGH_ENTROPY',
      label: 'High URL entropy',
      severity: 'medium',
      description: 'Long or random-looking URL path',
    });
    score += 15;
  }

  const parts = host.split('.');
  if (parts.length > 4) {
    reasons.push({
      code: 'DEEP_SUBDOMAIN',
      label: 'Deep subdomain chain',
      severity: 'low',
      description: 'Unusually nested subdomains',
    });
    score += 10;
  }

  const tld = (parse(host).publicSuffix ?? '').split('.').pop() ?? '';
  if (SUSPICIOUS_TLDS.has(tld)) {
    reasons.push({
      code: 'SUSPICIOUS_TLD',
      label: 'Suspicious TLD',
      severity: 'medium',
      description: `.${tld} is frequently abused`,
    });
    score += 18;
  }

  for (const fh of FREE_HOSTING_HINTS) {
    if (host.endsWith(fh)) {
      reasons.push({
        code: 'FREE_HOSTING',
        label: 'Free hosting domain',
        severity: 'low',
        description: `Host ends with ${fh}`,
      });
      score += 12;
    }
  }

  const ty = typosquatScore(host);
  if (ty.hit) {
    reasons.push({
      code: 'TYPOSQUAT',
      label: 'Possible typosquatting',
      severity: 'high',
      description: `Similar to known brand ${ty.brand}`,
    });
    score += 35;
  }

  if (ctx.trustedDomains?.length && userTyposquat(host, ctx.trustedDomains)) {
    reasons.push({
      code: 'USER_TYPOSQUAT',
      label: 'Lookalike to your trusted domain',
      severity: 'high',
      description: 'Configured trusted domain similarity',
    });
    score += 40;
  }

  if (brandInSubdomainAbuse(host)) {
    reasons.push({
      code: 'BRAND_SUBDOMAIN',
      label: 'Brand name in subdomain only',
      severity: 'medium',
      description: 'Brand referenced in subdomain, not registrable domain',
    });
    score += 22;
  }

  const regDomain = getRegistrableDomain(url);
  if (regDomain && ctx.allowlistDomains.some((d) => regDomain.endsWith(d.toLowerCase()))) {
    score = Math.min(score, 15);
  }
  if (regDomain && ctx.blocklistDomains.some((d) => regDomain.endsWith(d.toLowerCase()))) {
    score = Math.max(score, 85);
    reasons.push({
      code: 'BLOCKLIST',
      label: 'User blocklist',
      severity: 'critical',
      description: 'Domain on your blocklist',
    });
  }

  if (ctx.feedUrls.has(url) || (regDomain && ctx.feedUrls.has(`https://${regDomain}/`))) {
    reasons.push({
      code: 'FEED_MATCH',
      label: 'Known phishing feed',
      severity: 'critical',
      description: 'Matched threat intelligence feed',
    });
    score = Math.max(score, 80);
  }

  const shortener = URL_SHORTENERS.has(host.replace(/^www\./, ''));
  if (shortener) {
    reasons.push({
      code: 'URL_SHORTENER',
      label: 'URL shortener',
      severity: 'low',
      description: 'Destination should be expanded before trusting',
    });
    score += 12;
  }

  if (typeof ctx.mlScore === 'number') {
    score += ctx.mlScore * 0.25;
    if (ctx.mlScore > 70) {
      reasons.push({
        code: 'ML_PHISH',
        label: 'ML phishing signal',
        severity: 'high',
        description: 'Neural model flagged this URL',
      });
    }
  }

  if (ctx.virusTotal && ctx.virusTotal.total > 0) {
    const ratio = ctx.virusTotal.positives / ctx.virusTotal.total;
    score += ratio * 100 * 0.2;
    if (ctx.virusTotal.positives > 10) score = Math.max(score, 85);
    if (ctx.virusTotal.positives > 0) {
      reasons.push({
        code: 'VIRUSTOTAL',
        label: 'VirusTotal detections',
        severity: ratio > 0.2 ? 'high' : 'medium',
        description: `${ctx.virusTotal.positives}/${ctx.virusTotal.total} engines`,
      });
    }
  }

  if (ctx.safeBrowsingMatches && ctx.safeBrowsingMatches > 0) {
    score = Math.max(score, 75);
    reasons.push({
      code: 'SAFE_BROWSING',
      label: 'Safe Browsing match',
      severity: 'critical',
      description: 'Google Safe Browsing reported threats',
    });
  }

  const chain = ctx.redirectChain ?? [];
  if (chain.length > 3) {
    reasons.push({
      code: 'LONG_REDIRECT',
      label: 'Long redirect chain',
      severity: 'medium',
      description: `More than 3 hops (${chain.length})`,
    });
    score += 15;
  }

  if (ctx.domainAgeDays !== undefined && ctx.domainAgeDays < 90) {
    reasons.push({
      code: 'NEW_DOMAIN',
      label: 'Recently registered domain',
      severity: 'medium',
      description: `Approx. ${ctx.domainAgeDays} days old`,
    });
    score += Math.max(0, 25 - ctx.domainAgeDays / 5);
  }

  if (ctx.sslValid === false) {
    reasons.push({
      code: 'SSL',
      label: 'TLS issues',
      severity: 'medium',
      description: 'Certificate not valid/trusted',
    });
    score += 15;
  }

  score = Math.min(100, Math.round(score));

  return {
    url,
    threatScore: score,
    threatLevel: levelFromScore(score),
    reasons,
    mlConfidence: ctx.mlConfidence ?? 0,
    virusTotalResult: ctx.virusTotal
      ? { positives: ctx.virusTotal.positives, total: ctx.virusTotal.total }
      : undefined,
    homographDetected: homograph.detected,
    domainAge: ctx.domainAgeDays,
    sslValid: ctx.sslValid ?? true,
    redirectChain: chain,
    finalDestination: ctx.expandedUrl ?? url,
  };
}
