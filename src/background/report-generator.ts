// report-generator.ts — returns HTML string, popup opens it as data: URL
import { getThreatLog } from './db';

export async function generateThreatReport(dateRange: { from: string; to: string }): Promise<{ html: string }> {
  
  const logs = await getThreatLog();
  const filtered = logs.filter(l =>
    (!dateRange?.from || l.timestamp >= dateRange.from) &&
    (!dateRange?.to   || l.timestamp <= dateRange.to)
  );

  const byCategory: Record<string, number> = {};
  filtered.forEach(l => (l.tactics || []).forEach((t: string) => { byCategory[t] = (byCategory[t] || 0) + 1; }));

  const html = `<!DOCTYPE html><html><head><title>ShieldAI Report</title>
<style>
  body{font-family:monospace;background:#0f172a;color:#f1f5f9;padding:2rem}
  h1{color:#6366f1} table{width:100%;border-collapse:collapse;margin:1rem 0}
  th{background:#1e293b;color:#94a3b8;padding:8px;text-align:left}
  td{padding:8px;border-bottom:1px solid #1e293b;font-size:12px}
  .d{color:#ef4444}.w{color:#f59e0b}.s{color:#22c55e}
  .stat{background:#1e293b;padding:1rem;border-radius:8px;display:inline-block;margin:.5rem}
</style></head><body>
<h1>🛡️ ShieldAI Threat Report</h1>
<p>Generated: ${new Date().toISOString()}</p>
<div>
  <div class="stat">Total: <strong>${filtered.length}</strong></div>
  <div class="stat d">Dangerous: <strong>${filtered.filter(l=>l.threatScore>=70).length}</strong></div>
  <div class="stat w">Suspicious: <strong>${filtered.filter(l=>l.threatScore>=40&&l.threatScore<70).length}</strong></div>
  <div class="stat s">Safe: <strong>${filtered.filter(l=>l.threatScore<40).length}</strong></div>
</div>
<h2>Top Threat Categories</h2>
<table><tr><th>Tactic</th><th>Count</th></tr>
${Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).map(([t,c])=>`<tr><td>${t}</td><td>${c}</td></tr>`).join('')}
</table>
<h2>Recent Threats</h2>
<table><tr><th>Time</th><th>Score</th><th>URL</th><th>Reasons</th></tr>
${filtered.slice(0,100).map(l=>`<tr>
  <td>${new Date(l.timestamp).toLocaleString()}</td>
  <td class="${l.threatScore>=70?'d':l.threatScore>=40?'w':'s'}">${l.threatScore}</td>
  <td style="word-break:break-all;max-width:200px">${(l.url||'').slice(0,60)}</td>
  <td>${(l.reasons||[]).map((r:any)=>r.label).join(', ')}</td>
</tr>`).join('')}
</table>
<p style="color:#475569;font-size:11px">Print (Ctrl+P) to save as PDF.</p>
</body></html>`;

  return { html };
}
