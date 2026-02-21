import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

type LimitOpts = {
  key: string;       // unique key
  limit: number;     // max requests
  windowSec: number; // time window in seconds
};

/**
 * Fixed-window rate limit using Redis INCR + EXPIRE.
 * Returns { ok, remaining, resetSec }.
 */
export async function rateLimit({ key, limit, windowSec }: LimitOpts) {
  const redisKey = `rl:${key}`;

  // increment counter
  const count = await redis.incr(redisKey);

  // first hit -> set window
  if (count === 1) {
    await redis.expire(redisKey, windowSec);
  }

  const ttl = await redis.ttl(redisKey); // seconds left
  const remaining = Math.max(0, limit - count);

  return {
    ok: count <= limit,
    remaining,
    resetSec: ttl > 0 ? ttl : windowSec,
    count,
  };
}