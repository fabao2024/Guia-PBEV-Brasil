const MAX_INPUT_LENGTH = 1000;
const MIN_INPUT_LENGTH = 2;

const INJECTION_PATTERNS = [
  // ── English: direct override ──────────────────────────────────────────────
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts)/i,
  /you\s+are\s+now\s+/i,
  /act\s+as\s+(a\s+)?different/i,
  /system\s*:\s*/i,
  /\bprompt\s+injection\b/i,
  /reveal\s+(your|the)\s+(system|initial|full)\s+(prompt|instructions)/i,
  /disregard\s+(all\s+)?(previous|prior)/i,
  /forget\s+(everything|all|your)/i,
  /do\s+not\s+follow\s+(your|the|any)/i,
  /repeat\s+(everything|all(\s+the\s+text)?)\s+(above|before)/i,
  /\bDAN\b.*mode/i,
  /let'?s\s+role\s*play/i,
  /output\s+(your|the)\s+(system|initial|full)/i,
  /what\s+(are|were)\s+(your|the)\s+(rules|instructions|prompt)/i,
  /show\s+me\s+your\s+(system\s+prompt|instructions|rules)/i,
  /print\s+(your\s+)?(system\s+prompt|instructions)/i,
  /display\s+your\s+(system\s+prompt|instructions)/i,

  // ── English: fictional / roleplay framing ─────────────────────────────────
  /imagine\s+(you\s+are|that\s+you\s+(are|'re))\s+/i,
  /pretend\s+(you\s+are|you'?re|to\s+be)\s+/i,
  /roleplay\s+as\b/i,
  /in\s+this\s+(roleplay|simulation|fictional\s+scenario)/i,
  /for\s+a\s+(creative\s+writing|fictional|hypothetical)\s+(exercise|scenario|story)/i,
  /in\s+a\s+(story|world|universe)\s+where\s+(you|AI|the\s+assistant)/i,

  // ── English: indirect extraction ─────────────────────────────────────────
  /complete\s+(this|the\s+following)\s+(sentence|phrase|instruction)/i,
  /your\s+(first|initial|original|full|complete)\s+instruction/i,
  /what\s+does?\s+your\s+(system|prompt)\s+(say|contain)/i,
  /translate\s+(your\s+)?(system\s+prompt|instructions)\s+(to|into)/i,
  /summarize\s+your\s+(system\s+prompt|instructions|rules)/i,

  // ── Portuguese: direct override ───────────────────────────────────────────
  /ignore\s+todas\s+as\s+instru/i,
  /esqueça\s+tudo/i,
  /não\s+siga\s+(as|suas)\s+instru/i,
  /repita\s+(tudo|todo\s+o\s+texto)\s+(acima|anterior)/i,
  /revele\s+(seu|o)\s+(prompt|instrução|instruções)/i,
  /quais\s+são\s+suas\s+(regras|instruções)/i,
  /mostre?\s+(me\s+)?(suas|o)\s+(instruções|prompt\s+do\s+sistema)/i,

  // ── Portuguese: fictional / roleplay framing ──────────────────────────────
  /finja\s+que\s+(você\s+(é|seja)|é)\s+/i,
  /imagine\s+que\s+você\s+(é|seja)\s+/i,
  /faça\s+de\s+conta\s+que/i,
  /numa\s+(história|ficção|simulação)\s+onde\s+(você|a\s+IA)/i,
  /para\s+(fins|efeitos)\s+(ficcionais|criativos|hipotéticos)/i,

  // ── Portuguese: indirect extraction ──────────────────────────────────────
  /complete\s+a\s+frase\s+(a\s+seguir|abaixo)/i,
  /sua\s+(primeira|inicial|original|completa)\s+instrução/i,
  /o\s+que\s+(diz|dizia|contém)\s+(seu|o)\s+(sistema|prompt)/i,
  /traduza\s+(seu\s+)?(prompt|instruções)\s+(para|em)/i,
  /resuma\s+(seu\s+)?(prompt|instruções|regras)/i,

  // ── Encoding tricks (base64 fragments of common injection words) ──────────
  /aWdub3Jl/,       // base64("ignore")
  /c3lzdGVt/,       // base64("system")
  /Zm9yZ2V0/,       // base64("forget")
  /aW5zdHJ1Y3Rp/,   // base64("instructi")
  /cHJvbXB0/,       // base64("prompt")
];

const MESSAGES: Record<string, Record<string, string>> = {
  'pt-BR': {
    empty: 'A mensagem não pode estar vazia.',
    tooShort: 'A mensagem é muito curta.',
    tooLong: `A mensagem não pode ter mais de ${MAX_INPUT_LENGTH} caracteres.`,
    notAllowed: 'Mensagem não permitida.',
  },
  en: {
    empty: 'Message cannot be empty.',
    tooShort: 'Message is too short.',
    tooLong: `Message cannot exceed ${MAX_INPUT_LENGTH} characters.`,
    notAllowed: 'Message not allowed.',
  },
};

export function sanitizeChatInput(input: string): string {
  let sanitized = input.replace(/<[^>]*>/g, '');
  sanitized = sanitized.trim();
  if (sanitized.length > MAX_INPUT_LENGTH) {
    sanitized = sanitized.slice(0, MAX_INPUT_LENGTH);
  }
  return sanitized;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateChatInput(input: string, lang: string = 'pt-BR'): ValidationResult {
  const msg = MESSAGES[lang] || MESSAGES['pt-BR'];

  if (!input || input.trim().length === 0) {
    return { valid: false, error: msg.empty };
  }

  if (input.trim().length < MIN_INPUT_LENGTH) {
    return { valid: false, error: msg.tooShort };
  }

  if (input.length > MAX_INPUT_LENGTH) {
    return { valid: false, error: msg.tooLong };
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return { valid: false, error: msg.notAllowed };
    }
  }

  return { valid: true };
}
