export type ProtectionMode = 'passive' | 'standard' | 'aggressive';

export interface ExtensionSettings {
  protectionMode: ProtectionMode;
  enableMLScanning: boolean;
  enableVirusTotal: boolean;
  virusTotalApiKey: string;
  enableGoogleSafeBrowsing: boolean;
  safeBrowsingApiKey: string;
  showLinkTooltips: boolean;
  highlightSuspiciousLinks: boolean;
  scanGmail: boolean;
  scanOutlook: boolean;
  autoExpandShortUrls: boolean;
  threatThreshold: number;
  enableQRScanning: boolean;
  enableOCRScanning: boolean;
  enableClipboardMonitor: boolean;
  enablePasswordGuard: boolean;
  enableHistoryScan: boolean;
  enableNotifications: boolean;
  allowlistDomains: string[];
  blocklistDomains: string[];
  privacyMode: boolean;
  trustedDomains: string[];
  dailyDigest: boolean;
  autoAllowlistThreshold: number;
}

export interface ThreatReason {
  code: string;
  label: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface VTResult {
  positives: number;
  total: number;
  permalink?: string;
}

export interface SBResult {
  matches: Array<{ threatType: string; platformType: string }>;
}

export interface LinkScanResult {
  url: string;
  threatScore: number;
  threatLevel: 'safe' | 'suspicious' | 'dangerous';
  reasons: ThreatReason[];
  mlConfidence: number;
  virusTotalResult?: VTResult;
  safeBrowsingResult?: SBResult;
  homographDetected: boolean;
  domainAge?: number;
  sslValid: boolean;
  redirectChain: string[];
  finalDestination: string;
  tactics?: string[];
}

export type DetectedTactic =
  | 'urgency-pressure'
  | 'fear-threat'
  | 'authority-impersonation'
  | 'reward-bait'
  | 'curiosity-hook'
  | 'social-proof'
  | 'reciprocity'
  | 'scarcity'
  | 'personal-info-request'
  | 'credential-request'
  | 'payment-request'
  | 'invoice-scam'
  | 'job-scam'
  | 'romance-scam'
  | 'tech-support-scam'
  | 'gift-card-demand';

export interface TextAnalysisResult {
  overallScore: number;
  tactics: DetectedTactic[];
  sentiment: 'neutral' | 'fearful' | 'urgent' | 'threatening' | 'enticing';
  personalInfoRequested: string[];
  impersonatedEntities: string[];
  urgencyLevel: number;
  grammarScore: number;
  translationIndicators: boolean;
  manipulationTechniques: string[];
  aiGenerationLikelihood?: number;
}

export interface EmailHeaderAnalysis {
  spfResult: 'pass' | 'fail' | 'neutral' | 'unknown';
  dkimResult: 'pass' | 'fail' | 'unknown';
  dmarcResult: 'pass' | 'fail' | 'none' | 'unknown';
  fromHeaderMismatch: boolean;
  replyToMismatch: boolean;
  receivedChainSuspicious: boolean;
  spoofedDomain: boolean;
  displayNameSpoofing: boolean;
  senderReputation: number;
}

export interface EmailScanMerged {
  threatScore: number;
  threatLevel: LinkScanResult['threatLevel'];
  tactics: string[];
  text: TextAnalysisResult;
  headers: EmailHeaderAnalysis;
  linkResults: LinkScanResult[];
  reasons: ThreatReason[];
}

export interface QRScanResult {
  sourceImage: string;
  decodedUrl: string;
  scanResult: LinkScanResult;
  isQuishing: boolean;
}

export interface HistoryThreat {
  url: string;
  visitCount: number;
  lastVisit: string;
  threatType: string;
}

export interface HistoryScanReport {
  scannedCount: number;
  threatsFound: number;
  threats: HistoryThreat[];
  scanDate: string;
  recommendation: string;
}

export interface ThreatLogRecord {
  id?: number;
  timestamp: number;
  threatScore: number;
  threatLevel: LinkScanResult['threatLevel'];
  url?: string;
  text?: string;
  tactics: string[];
  source?: string;
}

export interface ThreatLogEntry {
  id: string;
  timestamp: number;
  url?: string;
  pageTitle?: string;
  threatScore: number;
  threatLevel: 'safe' | 'suspicious' | 'dangerous';
  categories: string[];
  source: 'page' | 'manual' | 'gmail' | 'feed';
}

export interface PageScanSummary {
  url: string;
  linksFound: number;
  suspiciousCount: number;
  dangerCount: number;
  pageThreatScore: number;
  recentThreats: ThreatLogEntry[];
}

export interface EmailAnalysis {
  text: TextAnalysisResult;
  headers: EmailHeaderAnalysis;
  links: LinkScanResult[];
  overallScore: number;
}

export interface AttachmentInfo {
  filename: string;
  mimeType: string;
  size?: number;
}
