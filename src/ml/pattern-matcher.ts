import { NLP_PATTERNS } from '../analyzers/patterns';

export function matchPatterns(text: string): Array<{ id: string; tactic: string }> {
  const hits: Array<{ id: string; tactic: string }> = [];
  for (const rule of NLP_PATTERNS) {
    if (rule.re.test(text)) hits.push({ id: rule.id, tactic: rule.tactic });
  }
  return hits;
}
