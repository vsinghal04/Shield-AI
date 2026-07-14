import { describe, it, expect } from 'vitest';
import { levenshtein, urlEntropy, stripTrackingParams } from '../../src/shared/utils';

describe('utils', () => {
  it('levenshtein', () => {
    expect(levenshtein('paypal', 'paypai')).toBe(1);
  });
  it('urlEntropy', () => {
    expect(urlEntropy('https://a.com/')).toBeLessThan(0.9);
  });
  it('stripTrackingParams', () => {
    const u = stripTrackingParams('https://x.com/?utm_source=a&id=1');
    expect(u).toContain('id=1');
    expect(u).not.toContain('utm_source');
  });
});
