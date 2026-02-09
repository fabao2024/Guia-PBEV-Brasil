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

export function validateChatInput(input: string): ValidationResult {
  if (!input || input.trim().length === 0) {
    return { valid: false, error: 'A mensagem não pode estar vazia.' };
  }

  if (input.trim().length < MIN_INPUT_LENGTH) {
    return { valid: false, error: 'A mensagem é muito curta.' };
  }

  if (input.length > MAX_INPUT_LENGTH) {
    return { valid: false, error: `A mensagem não pode ter mais de ${MAX_INPUT_LENGTH} caracteres.` };
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return { valid: false, error: 'Mensagem não permitida.' };
    }
  }

  return { valid: true };
}
