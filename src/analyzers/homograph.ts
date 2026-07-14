const CONFUSABLES: Record<string, string> = {
  а: 'a',
  е: 'e',
  о: 'o',
  р: 'p',
  с: 'c',
  х: 'x',
  і: 'i',
};

export function detectHomograph(hostname: string): { detected: boolean; detail: string } {
  const hits: string[] = [];
  for (const ch of hostname) {
    if (CONFUSABLES[ch]) hits.push(`${ch}→${CONFUSABLES[ch]}`);
  }
  if (hits.length) {
    return { detected: true, detail: `Confusable characters: ${hits.slice(0, 5).join(', ')}` };
  }
  if (/[^\u0000-\u007f]/.test(hostname) && /[a-z]/i.test(hostname)) {
    return { detected: true, detail: 'Mixed scripts or non-ASCII hostname' };
  }
  return { detected: false, detail: '' };
}
