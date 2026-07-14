// email-header.ts

export function analyzeHeaders(headers: Record<string, string>, from: string): any {
  const result = {
    spfResult: 'unknown', dkimResult: 'unknown', dmarcResult: 'unknown',
    displayNameSpoofing: false, replyToMismatch: false, riskScore: 0,
  };

  try {
    const auth = headers['authentication-results'] || headers['Authentication-Results'] || '';
    result.spfResult   = auth.includes('spf=pass')  ? 'pass' : auth.includes('spf=fail')  ? 'fail' : 'unknown';
    result.dkimResult  = auth.includes('dkim=pass') ? 'pass' : auth.includes('dkim=fail') ? 'fail' : 'unknown';
    result.dmarcResult = auth.includes('dmarc=pass')? 'pass' : auth.includes('dmarc=fail')? 'fail' : 'unknown';

    if (result.spfResult  === 'fail') result.riskScore += 20;
    if (result.dkimResult === 'fail') result.riskScore += 20;
    if (result.dmarcResult === 'fail') result.riskScore += 15;

    // Display name spoofing: "PayPal Support <attacker@evil.com>"
    const brands = ['paypal','google','apple','microsoft','amazon','facebook','netflix','irs','bank'];
    const fromLower = from.toLowerCase();
    const emailMatch = from.match(/<([^>]+)>/);
    const emailAddr = emailMatch ? emailMatch[1].toLowerCase() : fromLower;
    const displayName = from.replace(/<[^>]+>/, '').toLowerCase().trim();

    if (brands.some(b => displayName.includes(b)) && !emailAddr.includes(brands.find(b => displayName.includes(b)) || '')) {
      result.displayNameSpoofing = true;
      result.riskScore += 30;
    }

    // Reply-To mismatch
    const replyTo = headers['reply-to'] || headers['Reply-To'] || '';
    if (replyTo && emailAddr && !replyTo.includes(emailAddr.split('@')[1] || '')) {
      result.replyToMismatch = true;
      result.riskScore += 15;
    }
  } catch { /* non-critical */ }

  return result;
}
