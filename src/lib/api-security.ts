type RuntimeLocals = {
  runtime?: {
    env?: Record<string, string | undefined>;
  };
};

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const rateLimitBuckets = new Map<string, RateLimitRecord>();

export function jsonResponse(payload: unknown, status = 200, headers: HeadersInit = {}): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('Content-Type', 'application/json; charset=utf-8');
  responseHeaders.set('Cache-Control', 'no-store');

  return new Response(JSON.stringify(payload), {
    status,
    headers: responseHeaders,
  });
}

export function getRuntimeSecret(locals: unknown, name: string): string | null {
  const runtimeLocals = locals as RuntimeLocals | undefined;
  const runtimeValue = runtimeLocals?.runtime?.env?.[name];
  const buildValue = import.meta.env[name];
  const value = runtimeValue || buildValue;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function getClientIdentifier(request: Request): string {
  const connectingIp = request.headers.get('cf-connecting-ip');
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return connectingIp || forwardedFor || 'unknown';
}

export function enforceRateLimit(
  request: Request,
  namespace: string,
  limit = 5,
  windowMs = 10 * 60 * 1000,
): Response | null {
  const now = Date.now();
  const key = `${namespace}:${getClientIdentifier(request)}`;
  const current = rateLimitBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return jsonResponse(
      {
        error: 'Too many requests. Please try again later.',
        retryAfterSeconds,
      },
      429,
      { 'Retry-After': String(retryAfterSeconds) },
    );
  }

  current.count += 1;
  rateLimitBuckets.set(key, current);
  return null;
}

export async function readJsonBody<T>(request: Request, maxBytes = 64_000): Promise<T> {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new Error('Request body is too large.');
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new Error('Request body is too large.');
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Invalid JSON request body.');
  }
}
