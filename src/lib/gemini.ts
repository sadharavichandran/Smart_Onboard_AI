import { GoogleGenAI } from '@google/genai';

export const GEMINI_API_KEY_MISSING_MESSAGE =
  'AI features are not configured yet. Add VITE_GEMINI_API_KEY to your .env file and restart the app.';

function getGeminiApiKey() {
  return import.meta.env.VITE_GEMINI_API_KEY?.trim();
}

export function getGeminiClient() {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error(GEMINI_API_KEY_MISSING_MESSAGE);
  }

  return new GoogleGenAI({ apiKey });
}

export function isGeminiConfigurationError(error: unknown) {
  return error instanceof Error && error.message === GEMINI_API_KEY_MISSING_MESSAGE;
}

function extractErrorPayload(error: unknown): { code?: number; status?: string; message?: string } | null {
  if (!(error instanceof Error)) return null;

  try {
    const parsed = JSON.parse(error.message);
    if (parsed?.error) {
      return {
        code: parsed.error.code,
        status: parsed.error.status,
        message: parsed.error.message,
      };
    }
  } catch {
    // Ignore parse errors and fall back to plain message checks.
  }

  return {
    message: error.message,
  };
}

export function getGeminiFriendlyErrorMessage(error: unknown) {
  if (isGeminiConfigurationError(error)) {
    return GEMINI_API_KEY_MISSING_MESSAGE;
  }

  const payload = extractErrorPayload(error);
  const text = `${payload?.message || ''}`.toLowerCase();
  const isQuotaError = payload?.code === 429 || payload?.status === 'RESOURCE_EXHAUSTED' || text.includes('quota');

  if (isQuotaError) {
    return 'Gemini API quota exceeded (429). Please check your API plan/billing or wait for quota reset, then try again.';
  }

  const isAuthError = payload?.code === 401 || payload?.code === 403 || text.includes('api key') || text.includes('permission');
  if (isAuthError) {
    return 'Gemini API key is invalid or lacks permission for this model. Update key/project settings and retry.';
  }

  return 'Sorry, the AI service is temporarily unavailable. Please try again shortly.';
}