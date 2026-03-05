const stores = new Map();

function createRateLimiter(windowMs, maxRequests) {
  const hits = new Map();

  return {
    check(key) {
      const now = Date.now();
      const record = hits.get(key);

      if (!record || now - record.windowStart > windowMs) {
        hits.set(key, { count: 1, windowStart: now });
        return { allowed: true };
      }

      if (record.count >= maxRequests) {
        const retryAfter = Math.ceil((record.windowStart + windowMs - now) / 1000);
        return { allowed: false, retryAfter };
      }

      record.count++;
      return { allowed: true };
    },

    cleanup() {
      const now = Date.now();
      for (const [key, record] of hits) {
        if (now - record.windowStart > windowMs) hits.delete(key);
      }
    },
  };
}

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const lookupLimiter = createRateLimiter(FIFTEEN_MINUTES, 5000);
const createLimiter = createRateLimiter(FIFTEEN_MINUTES, 500);

// Cleanup expired entries every 5 minutes
setInterval(() => {
  lookupLimiter.cleanup();
  createLimiter.cleanup();
}, 5 * 60 * 1000);

export function checkLookupRateLimit(shop, ip) {
  const shopResult = lookupLimiter.check(`shop:${shop}`);
  if (!shopResult.allowed) return shopResult;

  const ipResult = lookupLimiter.check(`ip:${ip}`);
  return ipResult;
}

export function checkCreateRateLimit(shop, ip) {
  const shopResult = createLimiter.check(`shop:${shop}`);
  if (!shopResult.allowed) return shopResult;

  const ipResult = createLimiter.check(`ip:${ip}`);
  return ipResult;
}

export function getClientIp(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
