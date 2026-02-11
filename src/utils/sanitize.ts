const MAX_INPUT_LENGTH = 1000;
const MIN_INPUT_LENGTH = 2;

const INJECTION_PATTERNS = [
  // English patterns
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
  // Portuguese patterns
  /ignore\s+todas\s+as\s+instru/i,
  /esqueça\s+tudo/i,
  /não\s+siga\s+(as|suas)\s+instru/i,
  /repita\s+(tudo|todo\s+o\s+texto)\s+(acima|anterior)/i,
  /revele\s+(seu|o)\s+(prompt|instrução|instruções)/i,
  /quais\s+são\s+suas\s+(regras|instruções)/i,
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
