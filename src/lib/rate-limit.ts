// src/lib/rate-limit.ts
// Simple in-memory rate limiter (use Redis/Upstash for production multi-instance)

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
        if (store[key].resetTime < now) {
            delete store[key];
        }
    });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    interval: number; // milliseconds
    maxRequests: number;
}

export async function rateLimit(
    identifier: string,
    config: RateLimitConfig = { interval: 60000, maxRequests: 10 }
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const key = `ratelimit:${identifier}`;

    // Initialize or reset if expired
    if (!store[key] || store[key].resetTime < now) {
        store[key] = {
            count: 1,
            resetTime: now + config.interval,
        };
        return {
            success: true,
            remaining: config.maxRequests - 1,
            resetTime: store[key].resetTime,
        };
    }

    // Increment count
    store[key].count++;

    const remaining = Math.max(0, config.maxRequests - store[key].count);
    const success = store[key].count <= config.maxRequests;

    return {
        success,
        remaining,
        resetTime: store[key].resetTime,
    };
}

// Helper for API routes
export async function checkRateLimit(
    req: Request,
    config?: RateLimitConfig
): Promise<Response | null> {
    // Get IP from various headers (Vercel/Railway compatible)
    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0] ||
        req.headers.get("x-real-ip") ||
        "unknown";

    const result = await rateLimit(ip, config);

    if (!result.success) {
        return new Response(
            JSON.stringify({
                error: "Too many requests",
                retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
            }),
            {
                status: 429,
                headers: {
                    "Content-Type": "application/json",
                    "X-RateLimit-Limit": config?.maxRequests.toString() || "10",
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": result.resetTime.toString(),
                    "Retry-After": Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
                },
            }
        );
    }

    return null;
}