// email-merge.ts — combines text + header + link scan results for emails

export async function scanEmail(message: any): Promise<any> {
  const { from = '', subject = '', body = '', headers = {}, links = [] } = message;

  const [textResult, headerResult, ...linkResults] = await Promise.all([
    import('../analyzers/text-threat-classifier').then(m => m.analyzeText(`${subject}\n${body}`)),
    import('../analyzers/email-header').then(m => m.analyzeHeaders(headers, from)),
    ...links.slice(0, 20).map((url: string) =>
      import('./scan-orchestrator').then(m => m.scanUrl(url))
    ),
  ]);

  const maxLinkScore = linkResults.reduce((max: number, r: any) => Math.max(max, r?.threatScore || 0), 0);
  const overallScore = Math.max(
    textResult?.overallScore || 0,
    headerResult?.riskScore  || 0,
    maxLinkScore,
  );

  return {
    threatScore: overallScore,
    threatLevel: overallScore >= 70 ? 'dangerous' : overallScore >= 40 ? 'suspicious' : 'safe',
    textResult,
    headerResult,
    linkResults,
    tactics: textResult?.tactics || [],
  };
}
