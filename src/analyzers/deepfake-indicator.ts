import { burstinessScore, perplexityProxy, simpleGrammarScore } from '../shared/utils';

export interface DeepfakeHeuristicResult {
  aiLikelihood: number;
  reasons: string[];
}

export function analyzeAiGenerationLikelihood(text: string): DeepfakeHeuristicResult {
  const reasons: string[] = [];
  let score = 0;
  const grammar = simpleGrammarScore(text);
  const burst = burstinessScore(text);
  const perp = perplexityProxy(text);

  if (text.length > 200 && grammar > 0.92) {
    score += 25;
    reasons.push('Unusually clean grammar in long message');
  }
  if (burst < 0.2 && text.length > 150) {
    score += 20;
    reasons.push('Low sentence-length variance (low burstiness)');
  }
  if (perp > 0.88) {
    score += 15;
    reasons.push('High lexical uniformity');
  }
  const typoCount = (text.match(/\b(teh|recieve|adress)\b/gi) ?? []).length;
  if (text.length > 400 && typoCount === 0) {
    score += 10;
    reasons.push('No common typos in long message');
  }

  return {
    aiLikelihood: Math.min(100, score),
    reasons,
  };
}
