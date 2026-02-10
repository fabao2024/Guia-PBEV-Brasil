const MAX_INPUT_LENGTH = 1000;
const MIN_INPUT_LENGTH = 2;

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts)/i,
  /you\s+are\s+now\s+/i,
  /act\s+as\s+(a\s+)?different/i,
  /system\s*:\s*/i,
  /\bprompt\s+injection\b/i,
  /reveal\s+(your|the)\s+(system|initial)\s+(prompt|instructions)/i,
  /disregard\s+(all\s+)?(previous|prior)/i,
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
