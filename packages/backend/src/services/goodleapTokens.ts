/**
 * In-memory store for GoodLeap auth headers captured from the origin.goodleap.com
 * browser tab. The SPA uses Bearer JWTs in Authorization + x-client-metadata
 * headers to talk to integration.api.loanpal.com. The capture snippet running
 * inside the tab wraps window.fetch and POSTs these headers to the backend
 * whenever the SPA itself makes a GraphQL call. The backend then reuses the
 * captured tokens to call loanpal.com directly (bypassing browser CORS).
 */
import logger from '../utils/logger';

interface CapturedTokens {
  authorization: string;
  xClientMetadata?: string;
  organizationId?: string;
  capturedAt: number;
}

let tokens: CapturedTokens | null = null;

export function setTokens(t: Omit<CapturedTokens, 'capturedAt'>): void {
  tokens = { ...t, capturedAt: Date.now() };
  logger.info('[goodleap-tokens] captured', {
    hasAuth: !!t.authorization,
    hasMeta: !!t.xClientMetadata,
    orgId: t.organizationId,
  });
}

export function getTokens(): CapturedTokens | null {
  if (!tokens) return null;
  // Expire after 50 minutes (JWTs typically last 1h)
  if (Date.now() - tokens.capturedAt > 50 * 60 * 1000) {
    logger.warn('[goodleap-tokens] expired, clearing');
    tokens = null;
    return null;
  }
  return tokens;
}

export function tokenStats() {
  return {
    hasTokens: !!tokens,
    ageMs: tokens ? Date.now() - tokens.capturedAt : null,
    orgId: tokens?.organizationId,
  };
}
