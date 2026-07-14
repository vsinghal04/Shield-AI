// db.ts — IndexedDB wrapper using idb library
import { openDB } from 'idb';

async function getDB() {
  
  return openDB('shieldai-db', 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('threat-log')) {
        const store = db.createObjectStore('threat-log', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('threatScore', 'threatScore');
      }
      if (!db.objectStoreNames.contains('sender-reputation')) {
        db.createObjectStore('sender-reputation', { keyPath: 'email' });
      }
    }
  });
}

export async function logThreat(result: any): Promise<void> {
  try {
    const db = await getDB();
    await db.add('threat-log', { ...result, timestamp: new Date().toISOString() });
  } catch { /* non-critical */ }
}

export async function getThreatLog(filter?: any): Promise<any[]> {
  try {
    const db = await getDB();
    const all = await db.getAll('threat-log');
    if (!filter) return all.reverse().slice(0, 200);
    return all
      .filter(l => !filter.minScore || l.threatScore >= filter.minScore)
      .reverse()
      .slice(0, 200);
  } catch { return []; }
}
