import type { ExtensionSettings } from './types';

export const COLORS = {
  safe: '#22c55e',
  suspicious: '#f59e0b',
  dangerous: '#ef4444',
  bg: '#0f172a',
  card: '#1e293b',
  accent: '#6366f1',
  text: '#f1f5f9',
  muted: '#94a3b8',
} as const;

export const DEFAULT_SETTINGS: ExtensionSettings = {
  protectionMode: 'standard',
  enableMLScanning: true,
  enableVirusTotal: false,
  virusTotalApiKey: '',
  enableGoogleSafeBrowsing: false,
  safeBrowsingApiKey: '',
  showLinkTooltips: true,
  highlightSuspiciousLinks: true,
  scanGmail: true,
  scanOutlook: true,
  autoExpandShortUrls: true,
  threatThreshold: 60,
  enableQRScanning: true,
  enableOCRScanning: true,
  enableClipboardMonitor: true,
  enablePasswordGuard: true,
  enableHistoryScan: false,
  enableNotifications: true,
  allowlistDomains: [],
  blocklistDomains: [],
  privacyMode: false,
  trustedDomains: [],
  dailyDigest: true,
  autoAllowlistThreshold: 3,
};

export const THREAT_FEED_TTL_MS = 24 * 60 * 60 * 1000;
export const THREAT_FEED_INTERVAL_MS = 6 * 60 * 60 * 1000;
export const SCAN_CACHE_TTL_MS = 5 * 60 * 1000;

export const URL_SHORTENERS = new Set([
  'bit.ly',
  'tinyurl.com',
  'goo.gl',
  't.co',
  'ow.ly',
  'buff.ly',
  'rebrand.ly',
  'short.link',
  'cutt.ly',
  'is.gd',
  'tiny.cc',
  'adf.ly',
  'bc.co',
]);

export const SUSPICIOUS_TLDS = new Set([
  'xyz',
  'top',
  'click',
  'loan',
  'work',
  'gq',
  'cf',
  'tk',
  'ml',
  'ga',
  'buzz',
  'cam',
]);

export const FREE_HOSTING_HINTS = [
  '000webhostapp.com',
  'github.io',
  'pages.dev',
  'netlify.app',
  'vercel.app',
  'firebaseapp.com',
  'blogspot.com',
  'wixsite.com',
];

export const BRAND_KEYWORDS = [
  'paypal',
  'amazon',
  'microsoft',
  'apple',
  'google',
  'facebook',
  'meta',
  'netflix',
  'bank',
  'irs',
  'fedex',
  'dhl',
];

export const ALEXA_TOP_SAMPLE = [
  'google.com',
  'youtube.com',
  'facebook.com',
  'twitter.com',
  'instagram.com',
  'amazon.com',
  'microsoft.com',
  'apple.com',
  'netflix.com',
  'linkedin.com',
  'wikipedia.org',
  'reddit.com',
  'yahoo.com',
  'ebay.com',
  'paypal.com',
];
