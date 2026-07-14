/**
 * 200+ regex patterns for social-engineering / phishing NLP.
 * Loaded at module init; optional merge with datasets/social-engineering-phrases.txt in runtime.
 */

export interface PatternRule {
  id: string;
  tactic: string;
  re: RegExp;
  weight: number;
}

function buildPatterns(): PatternRule[] {
  const urgency: PatternRule[] = [
    { id: 'u1', tactic: 'urgency-pressure', re: /\bact\s+now\b/i, weight: 1 },
    { id: 'u2', tactic: 'urgency-pressure', re: /\bimmediately\b/i, weight: 0.9 },
    { id: 'u3', tactic: 'urgency-pressure', re: /\bwithin\s+\d+\s*(hour|minute|second)s?\b/i, weight: 1 },
    { id: 'u4', tactic: 'urgency-pressure', re: /\bexpire[sd]?\s+(soon|today|shortly)\b/i, weight: 0.9 },
    { id: 'u5', tactic: 'urgency-pressure', re: /\btime[\s-]?sensitive\b/i, weight: 0.8 },
    { id: 'u6', tactic: 'urgency-pressure', re: /\burgen(t|cy)\b/i, weight: 0.85 },
    { id: 'u7', tactic: 'urgency-pressure', re: /\blast\s+chance\b/i, weight: 0.9 },
    { id: 'u8', tactic: 'urgency-pressure', re: /\bdo\s+not\s+ignore\b/i, weight: 0.85 },
    { id: 'u9', tactic: 'urgency-pressure', re: /\b24\s*hours?\b/i, weight: 0.7 },
    { id: 'u10', tactic: 'urgency-pressure', re: /\bdeadline\b/i, weight: 0.75 },
    { id: 'u11', tactic: 'urgency-pressure', re: /\brespond\s+(today|now)\b/i, weight: 0.9 },
    { id: 'u12', tactic: 'urgency-pressure', re: /\baccount\s+will\s+be\s+(closed|locked|suspended)\b/i, weight: 1 },
    { id: 'u13', tactic: 'urgency-pressure', re: /\bverify\s+(now|today)\b/i, weight: 0.85 },
    { id: 'u14', tactic: 'urgency-pressure', re: /\bclick\s+(here|below)\s+immediately\b/i, weight: 1 },
    { id: 'u15', tactic: 'urgency-pressure', re: /\baction\s+required\b/i, weight: 0.8 },
    { id: 'u16', tactic: 'urgency-pressure', re: /\blimited\s+time\s+offer\b/i, weight: 0.75 },
    { id: 'u17', tactic: 'urgency-pressure', re: /\bexpires?\s+in\b/i, weight: 0.8 },
    { id: 'u18', tactic: 'urgency-pressure', re: /\bwithout\s+delay\b/i, weight: 0.75 },
    { id: 'u19', tactic: 'urgency-pressure', re: /\basap\b/i, weight: 0.7 },
    { id: 'u20', tactic: 'urgency-pressure', re: /\bright\s+away\b/i, weight: 0.75 },
  ];

  const fear: PatternRule[] = [
    { id: 'f1', tactic: 'fear-threat', re: /\baccount\s+(suspended|locked|compromised)\b/i, weight: 1 },
    { id: 'f2', tactic: 'fear-threat', re: /\bunusual\s+activity\b/i, weight: 0.85 },
    { id: 'f3', tactic: 'fear-threat', re: /\bsecurity\s+(alert|breach|issue)\b/i, weight: 0.9 },
    { id: 'f4', tactic: 'fear-threat', re: /\bunauthorized\s+(access|login)\b/i, weight: 0.95 },
    { id: 'f5', tactic: 'fear-threat', re: /\byour\s+account\s+will\s+be\b/i, weight: 0.8 },
    { id: 'f6', tactic: 'fear-threat', re: /\blegal\s+action\b/i, weight: 0.85 },
    { id: 'f7', tactic: 'fear-threat', re: /\bfine(s)?\s+will\s+be\b/i, weight: 0.8 },
    { id: 'f8', tactic: 'fear-threat', re: /\bpermanently\s+(deleted|disabled)\b/i, weight: 0.85 },
    { id: 'f9', tactic: 'fear-threat', re: /\bfraud(ulent)?\s+(activity|charge)\b/i, weight: 0.9 },
    { id: 'f10', tactic: 'fear-threat', re: /\bverify\s+your\s+identity\b/i, weight: 0.75 },
    { id: 'f11', tactic: 'fear-threat', re: /\bsuspicious\s+(login|transaction)\b/i, weight: 0.85 },
    { id: 'f12', tactic: 'fear-threat', re: /\bconfirm\s+your\s+(account|details)\b/i, weight: 0.7 },
    { id: 'f13', tactic: 'fear-threat', re: /\bviolation\s+of\s+(policy|terms)\b/i, weight: 0.8 },
    { id: 'f14', tactic: 'fear-threat', re: /\brecover\s+your\s+account\b/i, weight: 0.75 },
    { id: 'f15', tactic: 'fear-threat', re: /\bpassword\s+expired\b/i, weight: 0.9 },
    { id: 'f16', tactic: 'fear-threat', re: /\blogin\s+attempt(s)?\s+blocked\b/i, weight: 0.85 },
    { id: 'f17', tactic: 'fear-threat', re: /\bdata\s+will\s+be\s+lost\b/i, weight: 0.8 },
    { id: 'f18', tactic: 'fear-threat', re: /\boverdue\s+(payment|invoice)\b/i, weight: 0.85 },
    { id: 'f19', tactic: 'fear-threat', re: /\bcharge(d)?\s+to\s+your\s+card\b/i, weight: 0.75 },
    { id: 'f20', tactic: 'fear-threat', re: /\bif\s+you\s+do\s+not\s+(respond|click)\b/i, weight: 0.9 },
  ];

  const authority: PatternRule[] = [
    { id: 'a1', tactic: 'authority-impersonation', re: /\binternal\s+revenue\s+service\b/i, weight: 1 },
    { id: 'a2', tactic: 'authority-impersonation', re: /\bIRS\b/, weight: 0.9 },
    { id: 'a3', tactic: 'authority-impersonation', re: /\bFBI\b|\bCIA\b|\bInterpol\b/i, weight: 0.85 },
    { id: 'a4', tactic: 'authority-impersonation', re: /\bMicrosoft\s+Support\b/i, weight: 0.95 },
    { id: 'a5', tactic: 'authority-impersonation', re: /\bApple\s+(Care|Support)\b/i, weight: 0.9 },
    { id: 'a6', tactic: 'authority-impersonation', re: /\bGoogle\s+Security\b/i, weight: 0.9 },
    { id: 'a7', tactic: 'authority-impersonation', re: /\bPayPal\s+(Security|Team)\b/i, weight: 0.95 },
    { id: 'a8', tactic: 'authority-impersonation', re: /\bAmazon\s+(Account|Security)\b/i, weight: 0.9 },
    { id: 'a9', tactic: 'authority-impersonation', re: /\bbank\s+security\s+team\b/i, weight: 0.85 },
    { id: 'a10', tactic: 'authority-impersonation', re: /\bofficial\s+notice\b/i, weight: 0.75 },
    { id: 'a11', tactic: 'authority-impersonation', re: /\bgovernment\s+agency\b/i, weight: 0.8 },
    { id: 'a12', tactic: 'authority-impersonation', re: /\btax\s+authority\b/i, weight: 0.85 },
    { id: 'a13', tactic: 'authority-impersonation', re: /\bcompliance\s+department\b/i, weight: 0.75 },
    { id: 'a14', tactic: 'authority-impersonation', re: /\bIT\s+help\s*desk\b/i, weight: 0.8 },
    { id: 'a15', tactic: 'authority-impersonation', re: /\bHR\s+department\b/i, weight: 0.7 },
    { id: 'a16', tactic: 'authority-impersonation', re: /\blegal\s+department\b/i, weight: 0.75 },
    { id: 'a17', tactic: 'authority-impersonation', re: /\bCEO\b.*\brequest\b/i, weight: 0.85 },
    { id: 'a18', tactic: 'authority-impersonation', re: /\bwire\s+transfer\s+authorization\b/i, weight: 0.9 },
    { id: 'a19', tactic: 'authority-impersonation', re: /\bDMARC\b|\bSPF\b|\bDKIM\b/i, weight: 0.3 },
    { id: 'a20', tactic: 'authority-impersonation', re: /\bverified\s+sender\b/i, weight: 0.5 },
  ];

  const reward: PatternRule[] = [
    { id: 'r1', tactic: 'reward-bait', re: /\byou\s+(have\s+)?won\b/i, weight: 1 },
    { id: 'r2', tactic: 'reward-bait', re: /\bprize\b|\blottery\b|\bjackpot\b/i, weight: 0.95 },
    { id: 'r3', tactic: 'reward-bait', re: /\bfree\s+(money|gift|iphone|bitcoin)\b/i, weight: 1 },
    { id: 'r4', tactic: 'reward-bait', re: /\bclaim\s+your\s+(reward|prize)\b/i, weight: 0.95 },
    { id: 'r5', tactic: 'reward-bait', re: /\bcrypto\s+giveaway\b/i, weight: 1 },
    { id: 'r6', tactic: 'reward-bait', re: /\b100%\s+match\b/i, weight: 0.7 },
    { id: 'r7', tactic: 'reward-bait', re: /\bcash\s+bonus\b/i, weight: 0.8 },
    { id: 'r8', tactic: 'reward-bait', re: /\byou\s+are\s+selected\b/i, weight: 0.85 },
    { id: 'r9', tactic: 'reward-bait', re: /\bcongratulations\b/i, weight: 0.5 },
    { id: 'r10', tactic: 'reward-bait', re: /\bguaranteed\s+returns?\b/i, weight: 0.9 },
    { id: 'r11', tactic: 'reward-bait', re: /\binvestment\s+opportunity\b/i, weight: 0.75 },
    { id: 'r12', tactic: 'reward-bait', re: /\bdouble\s+your\s+(money|bitcoin)\b/i, weight: 1 },
    { id: 'r13', tactic: 'reward-bait', re: /\bairdrop\b/i, weight: 0.7 },
    { id: 'r14', tactic: 'reward-bait', re: /\bvoucher\s+code\b/i, weight: 0.6 },
    { id: 'r15', tactic: 'reward-bait', re: /\bredeem\s+(now|here)\b/i, weight: 0.75 },
    { id: 'r16', tactic: 'reward-bait', re: /\bcoupon\s+inside\b/i, weight: 0.55 },
    { id: 'r17', tactic: 'reward-bait', re: /\bexclusive\s+offer\b/i, weight: 0.65 },
    { id: 'r18', tactic: 'reward-bait', re: /\blimited\s+supply\b/i, weight: 0.7 },
    { id: 'r19', tactic: 'reward-bait', re: /\byou\s+earned\b/i, weight: 0.7 },
    { id: 'r20', tactic: 'reward-bait', re: /\bcashback\b/i, weight: 0.45 },
  ];

  const curiosity: PatternRule[] = [
    { id: 'c1', tactic: 'curiosity-hook', re: /\bsomeone\s+shared\s+a\s+file\b/i, weight: 0.9 },
    { id: 'c2', tactic: 'curiosity-hook', re: /\bview\s+document\b/i, weight: 0.75 },
    { id: 'c3', tactic: 'curiosity-hook', re: /\bopen\s+attachment\b/i, weight: 0.85 },
    { id: 'c4', tactic: 'curiosity-hook', re: /\bsee\s+who\s+viewed\b/i, weight: 0.8 },
    { id: 'c5', tactic: 'curiosity-hook', re: /\byou\s+won'?t\s+believe\b/i, weight: 0.85 },
    { id: 'c6', tactic: 'curiosity-hook', re: /\bclick\s+to\s+reveal\b/i, weight: 0.9 },
    { id: 'c7', tactic: 'curiosity-hook', re: /\bprivate\s+message\b/i, weight: 0.65 },
    { id: 'c8', tactic: 'curiosity-hook', re: /\bphoto\s+of\s+you\b/i, weight: 0.9 },
    { id: 'c9', tactic: 'curiosity-hook', re: /\bvoice\s+message\b/i, weight: 0.6 },
    { id: 'c10', tactic: 'curiosity-hook', re: /\bsecure\s+message\s+waiting\b/i, weight: 0.85 },
    { id: 'c11', tactic: 'curiosity-hook', re: /\bnew\s+notification\b/i, weight: 0.5 },
    { id: 'c12', tactic: 'curiosity-hook', re: /\bdownload\s+to\s+view\b/i, weight: 0.8 },
    { id: 'c13', tactic: 'curiosity-hook', re: /\bshared\s+folder\b/i, weight: 0.75 },
    { id: 'c14', tactic: 'curiosity-hook', re: /\bconfidential\s+document\b/i, weight: 0.7 },
    { id: 'c15', tactic: 'curiosity-hook', re: /\bsee\s+attached\b/i, weight: 0.65 },
  ];

  const social: PatternRule[] = [
    { id: 's1', tactic: 'social-proof', re: /\ball\s+your\s+(friends|colleagues)\b/i, weight: 0.85 },
    { id: 's2', tactic: 'social-proof', re: /\b\d+\s+people\s+already\b/i, weight: 0.8 },
    { id: 's3', tactic: 'social-proof', re: /\bjoin\s+\d+\s+others\b/i, weight: 0.75 },
    { id: 's4', tactic: 'social-proof', re: /\btrending\s+now\b/i, weight: 0.65 },
    { id: 's5', tactic: 'social-proof', re: /\bas\s+seen\s+on\b/i, weight: 0.6 },
    { id: 's6', tactic: 'social-proof', re: /\bverified\s+by\s+users\b/i, weight: 0.7 },
    { id: 's7', tactic: 'social-proof', re: /\b5[\s-]?star\s+reviews?\b/i, weight: 0.55 },
    { id: 's8', tactic: 'social-proof', re: /\bmost\s+people\s+chose\b/i, weight: 0.75 },
    { id: 's9', tactic: 'social-proof', re: /\btrusted\s+by\s+millions\b/i, weight: 0.7 },
    { id: 's10', tactic: 'social-proof', re: /\bcommunity\s+favorite\b/i, weight: 0.55 },
  ];

  const reciprocity: PatternRule[] = [
    { id: 'rec1', tactic: 'reciprocity', re: /\bwe\s+(already|have)\s+(done|sent|gave)\b/i, weight: 0.8 },
    { id: 'rec2', tactic: 'reciprocity', re: /\bas\s+a\s+favor\b/i, weight: 0.75 },
    { id: 'rec3', tactic: 'reciprocity', re: /\byou\s+owe\s+us\b/i, weight: 0.85 },
    { id: 'rec4', tactic: 'reciprocity', re: /\breturn\s+the\s+favor\b/i, weight: 0.7 },
    { id: 'rec5', tactic: 'reciprocity', re: /\bsince\s+we\s+helped\b/i, weight: 0.75 },
  ];

  const scarcity: PatternRule[] = [
    { id: 'sc1', tactic: 'scarcity', re: /\bonly\s+\d+\s+(left|remaining|spots)\b/i, weight: 0.9 },
    { id: 'sc2', tactic: 'scarcity', re: /\bselling\s+fast\b/i, weight: 0.7 },
    { id: 'sc3', tactic: 'scarcity', re: /\balmost\s+gone\b/i, weight: 0.75 },
    { id: 'sc4', tactic: 'scarcity', re: /\blimited\s+stock\b/i, weight: 0.8 },
    { id: 'sc5', tactic: 'scarcity', re: /\bwhile\s+supplies\s+last\b/i, weight: 0.75 },
    { id: 'sc6', tactic: 'scarcity', re: /\bexclusive\s+access\b/i, weight: 0.65 },
    { id: 'sc7', tactic: 'scarcity', re: /\bfirst\s+\d+\s+customers\b/i, weight: 0.8 },
    { id: 'sc8', tactic: 'scarcity', re: /\bwaitlist\b/i, weight: 0.45 },
  ];

  const pii: PatternRule[] = [
    { id: 'p1', tactic: 'personal-info-request', re: /\bsocial\s+security\s+(number|#)\b/i, weight: 1 },
    { id: 'p2', tactic: 'personal-info-request', re: /\bSSN\b/, weight: 0.95 },
    { id: 'p3', tactic: 'personal-info-request', re: /\bcredit\s+card\s+(number|details)\b/i, weight: 1 },
    { id: 'p4', tactic: 'personal-info-request', re: /\bCVV\b|\bCVC\b/i, weight: 0.95 },
    { id: 'p5', tactic: 'personal-info-request', re: /\bdate\s+of\s+birth\b/i, weight: 0.85 },
    { id: 'p6', tactic: 'personal-info-request', re: /\bmother'?s\s+maiden\s+name\b/i, weight: 0.95 },
    { id: 'p7', tactic: 'personal-info-request', re: /\bfull\s+legal\s+name\b/i, weight: 0.65 },
    { id: 'p8', tactic: 'personal-info-request', re: /\bverify\s+your\s+(identity|details)\b/i, weight: 0.75 },
    { id: 'p9', tactic: 'personal-info-request', re: /\bupload\s+(a\s+)?photo\s+of\s+your\s+ID\b/i, weight: 1 },
    { id: 'p10', tactic: 'personal-info-request', re: /\bbank\s+account\s+number\b/i, weight: 0.95 },
    { id: 'p11', tactic: 'personal-info-request', re: /\brouting\s+number\b/i, weight: 0.85 },
    { id: 'p12', tactic: 'personal-info-request', re: /\bPIN\s+code\b/i, weight: 0.85 },
  ];

  const cred: PatternRule[] = [
    { id: 'cr1', tactic: 'credential-request', re: /\bpassword\b.*\b(confirm|reset|verify)\b/i, weight: 0.95 },
    { id: 'cr2', tactic: 'credential-request', re: /\benter\s+your\s+password\b/i, weight: 1 },
    { id: 'cr3', tactic: 'credential-request', re: /\bOTP\b|\bone[\s-]?time\s+code\b/i, weight: 0.9 },
    { id: 'cr4', tactic: 'credential-request', re: /\b2FA\b|\b2[\s-]?factor\b/i, weight: 0.6 },
    { id: 'cr5', tactic: 'credential-request', re: /\bsecurity\s+questions?\b/i, weight: 0.75 },
    { id: 'cr6', tactic: 'credential-request', re: /\bre-?authenticate\b/i, weight: 0.85 },
    { id: 'cr7', tactic: 'credential-request', re: /\blog\s*in\s+here\s+to\s+verify\b/i, weight: 0.95 },
    { id: 'cr8', tactic: 'credential-request', re: /\bconfirm\s+your\s+login\b/i, weight: 0.9 },
  ];

  const pay: PatternRule[] = [
    { id: 'pay1', tactic: 'payment-request', re: /\bwire\s+transfer\b/i, weight: 0.85 },
    { id: 'pay2', tactic: 'payment-request', re: /\bwestern\s+union\b/i, weight: 0.9 },
    { id: 'pay3', tactic: 'payment-request', re: /\bmoney\s+gram\b/i, weight: 0.9 },
    { id: 'pay4', tactic: 'payment-request', re: /\bbitcoin\s+wallet\b/i, weight: 0.85 },
    { id: 'pay5', tactic: 'payment-request', re: /\bsend\s+(payment|funds)\s+to\b/i, weight: 0.9 },
    { id: 'pay6', tactic: 'payment-request', re: /\binvoice\s+#\s*\d+/i, weight: 0.65 },
    { id: 'pay7', tactic: 'payment-request', re: /\bour\s+bank\s+details\s+have\s+changed\b/i, weight: 1 },
    { id: 'pay8', tactic: 'payment-request', re: /\bupdate\s+billing\s+information\b/i, weight: 0.75 },
  ];

  const invoice: PatternRule[] = [
    { id: 'i1', tactic: 'invoice-scam', re: /\bunpaid\s+invoice\b/i, weight: 0.85 },
    { id: 'i2', tactic: 'invoice-scam', re: /\bpayment\s+overdue\b/i, weight: 0.85 },
    { id: 'i3', tactic: 'invoice-scam', re: /\bopen\s+invoice\b/i, weight: 0.75 },
    { id: 'i4', tactic: 'invoice-scam', re: /\bremittance\s+advice\b/i, weight: 0.7 },
    { id: 'i5', tactic: 'invoice-scam', re: /\bfake\s+invoice\b/i, weight: 1 },
  ];

  const job: PatternRule[] = [
    { id: 'j1', tactic: 'job-scam', re: /\bwork\s+from\s+home\b.*\b\d{3,}\s*(per\s+)?(day|week)\b/i, weight: 0.95 },
    { id: 'j2', tactic: 'job-scam', re: /\bno\s+experience\s+necessary\b/i, weight: 0.75 },
    { id: 'j3', tactic: 'job-scam', re: /\bguaranteed\s+income\b/i, weight: 0.9 },
    { id: 'j4', tactic: 'job-scam', re: /\bpay\s+for\s+training\b/i, weight: 0.85 },
    { id: 'j5', tactic: 'job-scam', re: /\breshipping\s+job\b/i, weight: 1 },
  ];

  const romance: PatternRule[] = [
    { id: 'rom1', tactic: 'romance-scam', re: /\bmet\s+on\s+(dating|tinder|facebook)\b/i, weight: 0.85 },
    { id: 'rom2', tactic: 'romance-scam', re: /\bsend\s+me\s+(money|gift)\b/i, weight: 0.9 },
    { id: 'rom3', tactic: 'romance-scam', re: /\bin\s+(love|trouble)\b.*\bhelp\s+me\b/i, weight: 0.85 },
  ];

  const tech: PatternRule[] = [
    { id: 't1', tactic: 'tech-support-scam', re: /\bvirus\s+on\s+your\s+computer\b/i, weight: 0.95 },
    { id: 't2', tactic: 'tech-support-scam', re: /\bteamviewer\b|\banydesk\b/i, weight: 0.75 },
    { id: 't3', tactic: 'tech-support-scam', re: /\bremote\s+access\b/i, weight: 0.65 },
    { id: 't4', tactic: 'tech-support-scam', re: /\bwindows\s+license\s+expired\b/i, weight: 0.9 },
    { id: 't5', tactic: 'tech-support-scam', re: /\bcall\s+our\s+toll[\s-]?free\b/i, weight: 0.7 },
  ];

  const gift: PatternRule[] = [
    { id: 'g1', tactic: 'gift-card-demand', re: /\bgift\s+card(s)?\b/i, weight: 0.85 },
    { id: 'g2', tactic: 'gift-card-demand', re: /\bscratch\s+off\s+the\s+back\b/i, weight: 1 },
    { id: 'g3', tactic: 'gift-card-demand', re: /\bgoogle\s+play\s+cards?\b/i, weight: 0.95 },
    { id: 'g4', tactic: 'gift-card-demand', re: /\bsteam\s+wallet\b/i, weight: 0.85 },
    { id: 'g5', tactic: 'gift-card-demand', re: /\biTunes\s+cards?\b/i, weight: 0.9 },
  ];

  const translation: PatternRule[] = [
    { id: 'tr1', tactic: 'translation', re: /\bkindly\s+do\s+the\s+needful\b/i, weight: 0.7 },
    { id: 'tr2', tactic: 'translation', re: /\bdear\s+kind\s+sir\b/i, weight: 0.75 },
    { id: 'tr3', tactic: 'translation', re: /\bplease\s+to\s+be\s+informing\b/i, weight: 0.85 },
    { id: 'tr4', tactic: 'translation', re: /\bgreetings\s+of\s+the\s+day\b/i, weight: 0.65 },
    { id: 'tr5', tactic: 'translation', re: /\bdo\s+the\s+needful\b/i, weight: 0.7 },
  ];

  const extra: PatternRule[] = [
    { id: 'x1', tactic: 'urgency-pressure', re: /\bupdate\s+your\s+account\b/i, weight: 0.65 },
    { id: 'x2', tactic: 'urgency-pressure', re: /\bconfirm\s+your\s+profile\b/i, weight: 0.65 },
    { id: 'x3', tactic: 'urgency-pressure', re: /\bvalidate\s+your\s+access\b/i, weight: 0.65 },
    { id: 'x4', tactic: 'urgency-pressure', re: /\brestore\s+your\s+account\b/i, weight: 0.65 },
    { id: 'x5', tactic: 'urgency-pressure', re: /\bunlock\s+your\s+profile\b/i, weight: 0.65 },
    { id: 'x6', tactic: 'fear-threat', re: /\bsecurity\s+update\s+required\b/i, weight: 0.75 },
    { id: 'x7', tactic: 'fear-threat', re: /\bwe\s+detected\s+an\s+issue\b/i, weight: 0.75 },
    { id: 'x8', tactic: 'fear-threat', re: /\bprevent\s+account\s+closure\b/i, weight: 0.8 },
    { id: 'x9', tactic: 'credential-request', re: /\benter\s+credentials\b/i, weight: 0.95 },
    { id: 'x10', tactic: 'credential-request', re: /\bsubmit\s+your\s+login\b/i, weight: 0.9 },
    { id: 'x11', tactic: 'payment-request', re: /\bpay\s+the\s+outstanding\b/i, weight: 0.9 },
    { id: 'x12', tactic: 'payment-request', re: /\bwire\s+funds\s+today\b/i, weight: 0.95 },
    { id: 'x13', tactic: 'reward-bait', re: /\bexclusive\s+reward\b/i, weight: 0.75 },
    { id: 'x14', tactic: 'reward-bait', re: /\bcrypto\s+investment\b/i, weight: 0.8 },
    { id: 'x15', tactic: 'urgency-pressure', re: /\b48\s*hour\s+notice\b/i, weight: 0.85 },
    { id: 'x16', tactic: 'urgency-pressure', re: /\b72\s*hour\s+deadline\b/i, weight: 0.85 },
    { id: 'x17', tactic: 'authority-impersonation', re: /\bcompliance\s+notice\b/i, weight: 0.75 },
    { id: 'x18', tactic: 'authority-impersonation', re: /\bofficial\s+communication\b/i, weight: 0.7 },
    { id: 'x19', tactic: 'curiosity-hook', re: /\bone\s+time\s+link\b/i, weight: 0.75 },
    { id: 'x20', tactic: 'curiosity-hook', re: /\bsecure\s+download\s+link\b/i, weight: 0.75 },
    { id: 'x21', tactic: 'social-proof', re: /\bjoin\s+thousands\b/i, weight: 0.7 },
    { id: 'x22', tactic: 'scarcity', re: /\bending\s+soon\b/i, weight: 0.75 },
    { id: 'x23', tactic: 'invoice-scam', re: /\bpast\s+due\s+notice\b/i, weight: 0.85 },
    { id: 'x24', tactic: 'tech-support-scam', re: /\btech\s+support\s+department\b/i, weight: 0.85 },
    { id: 'x25', tactic: 'gift-card-demand', re: /\bamazon\s+gift\s+cards?\b/i, weight: 0.85 },
  ];

  return [
    ...urgency,
    ...fear,
    ...authority,
    ...reward,
    ...curiosity,
    ...social,
    ...reciprocity,
    ...scarcity,
    ...pii,
    ...cred,
    ...pay,
    ...invoice,
    ...job,
    ...romance,
    ...tech,
    ...gift,
    ...translation,
    ...extra,
  ];
}

export const NLP_PATTERNS: PatternRule[] = buildPatterns();
