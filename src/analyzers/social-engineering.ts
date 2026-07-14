import { NLP_PATTERNS } from './patterns';
import type { DetectedTactic } from '../shared/types';

const TACTIC_SET = new Set<string>([
  'urgency-pressure',
  'fear-threat',
  'authority-impersonation',
  'reward-bait',
  'curiosity-hook',
  'social-proof',
  'reciprocity',
  'scarcity',
  'personal-info-request',
  'credential-request',
  'payment-request',
  'invoice-scam',
  'job-scam',
  'romance-scam',
  'tech-support-scam',
  'gift-card-demand',
]);

export function detectTactics(text: string): DetectedTactic[] {
  const tactics = new Set<DetectedTactic>();
  for (const rule of NLP_PATTERNS) {
    if (rule.re.test(text) && TACTIC_SET.has(rule.tactic)) {
      tactics.add(rule.tactic as DetectedTactic);
    }
  }
  return [...tactics];
}
