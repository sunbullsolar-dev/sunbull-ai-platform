/**
 * In-memory job queue for the LightReach (Palmetto Finance) browser-tab relay.
 *
 * The backend can't call palmetto.finance directly because the auth cookie is
 * httpOnly and locked to the user's browser. Instead, a small relay loop runs
 * inside the user's logged-in Palmetto tab, polls this queue, executes the
 * call via window.fetch (cookie is auto-attached by the browser), and posts
 * the result back.
 *
 * Jobs live in memory for up to DEFAULT_TIMEOUT_MS. Each has a one-shot
 * resolver that the HTTP result endpoint calls to unblock the waiter.
 */
import { randomUUID } from 'crypto';
import logger from '../utils/logger';

export type RelayTarget = 'palmetto' | 'goodleap';

export interface RelayRequest {
  target?: RelayTarget; // which browser tab / origin should execute this; default 'palmetto'
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string; // relative URL (or absolute) to execute against the target origin
  body?: any;
  headers?: Record<string, string>; // optional extra request headers
}

export interface RelayResponse {
  status: number;
  body: any;
}

interface PendingJob {
  id: string;
  request: RelayRequest;
  resolve: (res: RelayResponse) => void;
  reject: (err: Error) => void;
  createdAt: number;
  timer: NodeJS.Timeout;
}

const DEFAULT_TIMEOUT_MS = 45_000;
const pending = new Map<string, PendingJob>();
const queue: string[] = []; // ordered list of job ids waiting to be dequeued

export function enqueue(request: RelayRequest, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<RelayResponse> {
  const id = randomUUID();
  return new Promise<RelayResponse>((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      const idx = queue.indexOf(id);
      if (idx >= 0) queue.splice(idx, 1);
      reject(new Error(`LightReach relay timeout after ${timeoutMs}ms (no browser relay polling?)`));
    }, timeoutMs);

    pending.set(id, { id, request, resolve, reject, createdAt: Date.now(), timer });
    queue.push(id);
    logger.info('[lightreach-relay] enqueued', { id, method: request.method, path: request.path, queueDepth: queue.length });
  });
}

export function dequeue(target: RelayTarget = 'palmetto'): { id: string; request: RelayRequest } | null {
  // Find the first job whose target matches (default 'palmetto' for legacy jobs)
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i];
    const job = pending.get(id);
    if (!job) { queue.splice(i, 1); i--; continue; }
    const jobTarget = job.request.target || 'palmetto';
    if (jobTarget !== target) continue;
    queue.splice(i, 1);
    logger.info('[relay] dequeued', { id, target });
    return { id, request: job.request };
  }
  return null;
}

export function deliverResult(id: string, response: RelayResponse): boolean {
  const job = pending.get(id);
  if (!job) {
    logger.warn('[lightreach-relay] result for unknown job', { id });
    return false;
  }
  clearTimeout(job.timer);
  pending.delete(id);
  job.resolve(response);
  logger.info('[lightreach-relay] delivered', { id, status: response.status });
  return true;
}

export function stats() {
  return { pending: pending.size, queue: queue.length };
}
