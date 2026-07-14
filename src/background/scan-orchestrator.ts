// scan-orchestrator.ts — runs inside service worker, NO DOM access allowed
import { isAllowlisted } from './allowlist-manager';
import { logThreat } from './db';
import { getSettings } from '../shared/storage';
import { updateDynamicBlockRules } from './mv3-blocker';
import { classifyUrl } from '../ml/phishing-url-classifier';
import { checkFeedlists } from './threat-feed';
import { checkVirusTotal } from './link-reputation';

let feedCache: { hosts: Set<string>; urls: Set<string> } | null = null;
const scanCache = new Map<string, { result: any; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const ALWAYS_SAFE_DOMAINS = [
  'google.com', 'bing.com', 'microsoft.com', 'apple.com',
  'amazon.com', 'facebook.com', 'youtube.com', 'twitter.com',
  'x.com', 'instagram.com', 'linkedin.com', 'github.com',
  'stackoverflow.com', 'wikipedia.org', 'reddit.com',
  'netflix.com', 'spotify.com', 'zoom.us', 'slack.com',
  'dropbox.com', 'adobe.com', 'yahoo.com', 'duckduckgo.com',
  'cloudflare.com', 'cdn.jsdelivr.net', 'unpkg.com',
];

export async function scanUrl(url: string): Promise<any> {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return { url, threatScore: 0, threatLevel: 'safe', reasons: [] };
  }

  // Check always-safe list first
  try {
    const hostname = new URL(url).hostname;
    const rootDomain = hostname.split('.').slice(-2).join('.');
    if (ALWAYS_SAFE_DOMAINS.includes(rootDomain)) {
      return { url, threatScore: 0, threatLevel: 'safe', reasons: [] };
    }
  } catch { /* continue */ }

  // Check allowlist first
  try {
    
    if (await isAllowlisted(url)) {
      return { url, threatScore: 0, threatLevel: 'safe', reasons: [{ label: 'Allowlisted', severity: 'low' }] };
    }
  } catch { /* continue */ }

  // Check scan cache
  const cached = scanCache.get(url);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.result;

  // Run all checks in parallel, each with individual error handling
  const [mlScore, feedMatch, heuristics, vtResult] = await Promise.all([
    runML(url),
    checkFeeds(url),
    runHeuristics(url),
    runVirusTotal(url),
  ]);

  const result = computeScore(url, mlScore, feedMatch, heuristics, vtResult);

  // Cache result
  scanCache.set(url, { result, ts: Date.now() });

  // Log to IndexedDB
  try {
    
    if (result.threatScore > 30) await logThreat(result);
  } catch { /* non-critical */ }

  // Update DNR rules if dangerous + aggressive mode
  try {
    
    const settings = await getSettings();
    if (result.threatScore >= 70 && settings?.protectionMode === 'aggressive') {
      
      await updateDynamicBlockRules([url]);
    }
  } catch { /* non-critical */ }

  return result;
}

async function runML(url: string): Promise<number> {
  try {
    
    return await classifyUrl(url);
  } catch { return 0; }
}

async function checkFeeds(url: string): Promise<boolean> {
  try {
    
    return await checkFeedlists(url);
  } catch { return false; }
}

async function runVirusTotal(url: string): Promise<any> {
  try {
    
    return await checkVirusTotal(url);
  } catch { return null; }
}

function runHeuristics(url: string): any {
  const reasons: any[] = [];
  let score = 0;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    const full = url;

    // IP address URL
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
      reasons.push({ label: 'IP address URL', severity: 'high' }); score += 40;
    }
    // Suspicious TLD
    if (/\.(xyz|top|click|loan|work|gq|ml|cf|tk|ga|buzz|icu)$/.test(hostname)) {
      reasons.push({ label: 'Suspicious TLD', severity: 'medium' }); score += 25;
    }
    // Excessive subdomains
    if (hostname.split('.').length > 4) {
      reasons.push({ label: 'Excessive subdomains', severity: 'medium' }); score += 15;
    }
    // Brand in subdomain not in domain
    const brands = ['paypal','google','apple','microsoft','amazon','facebook','netflix','bank','chase','wellsfargo','irs'];
    const domainRoot = hostname.split('.').slice(-2).join('.');
    if (brands.some(b => hostname.includes(b) && !domainRoot.includes(b))) {
      reasons.push({ label: 'Brand name in subdomain', severity: 'high' }); score += 45;
    }
    // URL shortener
    if (['bit.ly','tinyurl.com','t.co','goo.gl','ow.ly','rb.gy'].includes(hostname)) {
      reasons.push({ label: 'URL shortener', severity: 'low' }); score += 10;
    }
    // Non-HTTPS
    if (parsed.protocol === 'http:') {
      reasons.push({ label: 'Not HTTPS', severity: 'low' }); score += 10;
    }
    // Homograph (non-ASCII)
    if (/[^\x00-\x7F]/.test(hostname)) {
      reasons.push({ label: 'Possible homograph attack', severity: 'critical' }); score += 50;
    }
    // Long URL
    if (full.length > 150) {
      reasons.push({ label: 'Unusually long URL', severity: 'low' }); score += 5;
    }
    // Dangerous file extension
    if (/\.(exe|zip|js|vbs|ps1|bat|cmd|scr|msi)(\?|$)/.test(parsed.pathname)) {
      reasons.push({ label: 'Dangerous file type in URL', severity: 'high' }); score += 25;
    }
    // Data/javascript URI
    if (url.startsWith('data:') || url.startsWith('javascript:')) {
      reasons.push({ label: 'Data/JS URI scheme', severity: 'critical' }); score += 50;
    }
    // Suspicious keywords
    const keywords = ['login','signin','verify','confirm','account','update','secure','banking','credential','suspend','unusual','invoice','refund','prize','winner'];
    const matchedKeywords = keywords.filter(k => full.toLowerCase().includes(k));
    if (matchedKeywords.length >= 2) {
      reasons.push({ label: `Suspicious keywords: ${matchedKeywords.slice(0,3).join(', ')}`, severity: 'medium' });
      score += matchedKeywords.length * 8;
    }
  } catch { /* malformed URL */ }

  return { score: Math.min(score, 60), reasons };
}

function computeScore(url: string, mlScore: number, feedMatch: boolean, heuristics: any, vtResult: any): any {
  let score = 0;
  const reasons: any[] = [...(heuristics.reasons || [])];

  // Feed match = immediate high score
  if (feedMatch) {
    score = Math.max(score, 82);
    reasons.push({ label: 'Found in phishing feed', severity: 'critical' });
  }

  // ML score weighted higher
  score += mlScore * 40;

  // Heuristics weighted FULL (not 0.5)
  score += heuristics.score;

  // VirusTotal
  if (vtResult?.positives > 0) {
    const vtScore = Math.min((vtResult.positives / (vtResult.total || 70)) * 100, 100);
    score = Math.max(score, vtScore);
    reasons.push({ label: `VirusTotal: ${vtResult.positives} detections`, severity: 'critical' });
  }

  score = Math.min(Math.round(score), 100);
  const threatLevel = score >= 70 ? 'dangerous' : score >= 40 ? 'suspicious' : 'safe';
  return { url, threatScore: score, threatLevel, reasons, mlScore, feedMatch, vtResult };
}
