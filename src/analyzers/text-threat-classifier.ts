// text-threat-classifier.ts — NLP + pattern analysis for email/message text
import { getSettings } from '../shared/storage';
import { pipeline } from '@xenova/transformers';

let nlpPipeline: any = null;

const URGENCY_PATTERNS = [
  /act\s*(now|immediately|today|fast|quickly)/i,
  /limited\s*time/i, /expires?\s*(in|today|soon)/i,
  /urgent(ly)?/i, /immediate\s*action/i, /respond\s*(now|immediately)/i,
  /last\s*chance/i, /don't\s*(wait|delay)/i,
];

const FEAR_PATTERNS = [
  /account\s*(will\s*be\s*)?(suspend|terminat|clos|block|lock)/i,
  /unauthori[sz]ed\s*(access|activity|login)/i,
  /suspicious\s*(activity|login|access)/i,
  /verify\s*(your\s*)?(account|identity|information)/i,
  /unusual\s*(activity|sign.?in)/i,
];

const CREDENTIAL_PATTERNS = [
  /enter\s*(your\s*)?(password|credentials|login)/i,
  /confirm\s*(your\s*)?(password|account|details)/i,
  /provide\s*(your\s*)?(username|password|ssn|social\s*security)/i,
  /click\s*(here\s*to\s*)?(login|sign\s*in|verify|confirm)/i,
];

const REWARD_PATTERNS = [
  /you\s*(have\s*)?(won|win|been\s*selected)/i,
  /congratulations/i, /prize|reward|gift\s*card/i,
  /\$[\d,]+\s*(prize|reward|cash)/i,
  /free\s*(gift|money|iphone|ipad)/i,
];

const IMPERSONATION_BRANDS = [
  'paypal', 'google', 'apple', 'microsoft', 'amazon', 'facebook',
  'netflix', 'irs', 'social security', 'bank of america', 'chase',
  'wells fargo', 'fedex', 'ups', 'usps', 'dhl', 'coinbase',
];

const SCAM_PATTERNS = [
  /arrest/i, /police|officer|authority/i,
  /otp|one\.time\.password/i,
  /share\s*(your\s*)?(otp|code|pin)/i,
  /cyber\s*crime/i, /warrant/i,
  /money\s*launder/i, /drug/i,
  /customs|courier|package\s*hold/i,
  /aadhaar|pan\s*card|kyc/i,
  /video\s*call\s*(verify|verification)/i,
  /digital\s*arrest/i,
];

const INDIA_SCAM_PATTERNS = [
  /digital\s*arrest/i,
  /cyber\s*(crime|cell|police)/i,
  /arrest\s*warrant/i,
  /narcotics|drugs?\s*(found|seized|package)/i,
  /money\s*launder/i,
  /trai|telecom\s*authority/i,
  /aadhaar|aadhar/i,
  /pan\s*card\s*(link|verify|block)/i,
  /kyc\s*(update|verify|expired)/i,
  /otp\s*(share|send|give|provide)/i,
  /video\s*call\s*verif/i,
  /customs?\s*(officer|department|package)/i,
  /courier\s*(hold|seized|detained)/i,
  /fir\s*(register|filed|case)/i,
  /ed\s+|enforcement\s*directorate/i,
  /cbi\s+|central\s*bureau/i,
  /your\s*(number|sim|account)\s*(block|suspend)/i,
  /immediate(ly)?\s*(pay|transfer|send)/i,
  /gift\s*card\s*(buy|purchase|send)/i,
];

const SCAM_KEYWORDS = [
  'arrest', 'otp', 'warrant', 'police', 'crime', 'illegal',
  'seized', 'blocked', 'suspended', 'penalty', 'fine', 'jail',
  'investigation', 'complaint', 'case registered', 'fraud detected'
];

export interface TextAnalysisResult {
  overallScore: number;
  tactics: string[];
  urgencyLevel: number;
  impersonatedEntities: string[];
  credentialRequest: boolean;
  sentiment: string;
}

export async function analyzeText(text: string): Promise<TextAnalysisResult> {
  if (!text || typeof text !== 'string') {
    return { overallScore: 0, tactics: [], urgencyLevel: 0, impersonatedEntities: [], credentialRequest: false, sentiment: 'neutral' };
  }

  const tactics: string[] = [];
  let score = 0;

  // Pattern analysis
  const urgencyMatches = URGENCY_PATTERNS.filter(p => p.test(text)).length;
  if (urgencyMatches > 0) { tactics.push('urgency-pressure'); score += urgencyMatches * 8; }

  const fearMatches = FEAR_PATTERNS.filter(p => p.test(text)).length;
  if (fearMatches > 0) { tactics.push('fear-threat'); score += fearMatches * 10; }

  const credMatch = CREDENTIAL_PATTERNS.some(p => p.test(text));
  if (credMatch) { tactics.push('credential-request'); score += 25; }

  const rewardMatch = REWARD_PATTERNS.some(p => p.test(text));
  if (rewardMatch) { tactics.push('reward-bait'); score += 20; }

  // Gift card scam
  if (/gift\s*card/i.test(text) && /send|buy|purchase|code/i.test(text)) {
    tactics.push('gift-card-demand'); score += 35;
  }

  // Scam patterns
  const scamMatch = SCAM_PATTERNS.some(p => p.test(text));
  if (scamMatch) {
    tactics.push('scam-impersonation');
    score += 30;
  }

  // India Scam Patterns
  const indiaMatches = INDIA_SCAM_PATTERNS.filter(p => p.test(text)).length;
  if (indiaMatches > 0) {
    tactics.push('scam-impersonation');
    score += indiaMatches * 15;
  }

  // Global Keywords
  const keywordHits = SCAM_KEYWORDS.filter(k => text.toLowerCase().includes(k)).length;
  if (keywordHits > 0) score += keywordHits * 8;

  // Impersonation
  const impersonated = IMPERSONATION_BRANDS.filter(b => text.toLowerCase().includes(b));
  if (impersonated.length > 0 && score > 10) tactics.push('authority-impersonation');

  // ML sentiment (lazy, optional)
  let sentiment = 'neutral';
  try {
    
    const settings = await getSettings();
    if (!settings?.privacyMode && !settings?.enableMLScanning === false) {
      if (!nlpPipeline) {
        
        nlpPipeline = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', { quantized: true });
      }
      const result = await nlpPipeline(text.slice(0, 512));
      if (result?.[0]?.label === 'NEGATIVE' && result[0].score > 0.8) {
        sentiment = 'threatening';
        score += 10;
      }
    }
  } catch { /* pattern-only */ }

  return {
    overallScore: Math.min(score, 100),
    tactics,
    urgencyLevel: Math.min(urgencyMatches * 2, 10),
    impersonatedEntities: impersonated,
    credentialRequest: credMatch,
    sentiment,
  };
}
