export interface AttachmentScanResult {
  suspicious: boolean;
  reasons: string[];
}

const BAD_EXT = /\.(exe|scr|bat|cmd|com|pif|msi|dll|js|jar|vbs)(\s|$)/i;
const DOUBLE_EXT = /\.(pdf|docx?|xlsx?|png|jpg)\.(exe|zip|scr)$/i;

export function scanAttachmentName(filename: string): AttachmentScanResult {
  const reasons: string[] = [];
  if (BAD_EXT.test(filename)) reasons.push('Executable or script extension');
  if (DOUBLE_EXT.test(filename)) reasons.push('Double extension pattern');
  if (/invoice|payment|wire|swift/i.test(filename) && /\.(zip|7z|rar)$/i.test(filename)) {
    reasons.push('Finance-themed archive');
  }
  return { suspicious: reasons.length > 0, reasons };
}
