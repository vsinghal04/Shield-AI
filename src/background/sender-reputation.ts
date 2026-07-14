// sender-reputation.ts
import { openDB } from 'idb';

export async function updateSenderReputation(email: string, scanResult: any): Promise<void> {
  try {
    
    const db = await openDB('shieldai-db', 2);
    const existing = await db.get('sender-reputation', email) || {
      email, firstSeen: new Date().toISOString(), scanCount: 0,
      threatCount: 0, lastThreatScore: 0, flaggedTactics: [], trusted: false
    };
    existing.scanCount++;
    existing.lastThreatScore = scanResult?.threatScore ?? 0;
    if (existing.lastThreatScore > 50) {
      existing.threatCount++;
      existing.flaggedTactics = [...new Set([...existing.flaggedTactics, ...(scanResult?.tactics || [])])];
    }
    await db.put('sender-reputation', existing);
  } catch { /* non-critical */ }
}
