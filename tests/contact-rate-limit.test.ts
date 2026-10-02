import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const key = "a".repeat(64);
let db: PGlite;
async function consume(clientKey = key, minute = 3, hour = 10) {
  const { rows } = await db.query<{
    result: { allowed: boolean; retry_after: number };
  }>("select public.consume_contact_attempt($1, $2, $3) as result", [
    clientKey,
    minute,
    hour,
  ]);
  return rows[0].result;
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    "create role anon; create role authenticated; create role service_role;",
  );
  await db.exec(
    readFileSync(
      "supabase/migrations/20261002000000_contact_rate_limit.sql",
      "utf8",
    ),
  );
}, 30_000);
beforeEach(async () => {
  await db.exec("truncate public.contact_rate_limits");
});
afterAll(async () => {
  await db.close();
});

describe("actual PostgreSQL rate-limit migration", () => {
  it("allows only three of twenty simultaneous RPC calls for the same IP", async () => {
    const results = await Promise.all(
      Array.from({ length: 20 }, () => consume()),
    );
    expect(results.filter((result) => result.allowed)).toHaveLength(3);
    expect(
      results
        .filter((result) => !result.allowed)
        .every((result) => result.retry_after > 0 && result.retry_after <= 60),
    ).toBe(true);
    const { rows } = await db.query<{ count: number }>(
      "select cardinality(attempts) as count from public.contact_rate_limits",
    );
    expect(rows[0].count).toBe(3);
    expect((await consume("b".repeat(64))).allowed).toBe(true);
  });
  it("reopens minute window without clearing the rolling hourly count", async () => {
    await consume();
    await db.query(
      "update public.contact_rate_limits set attempts = array_fill(now() - interval '2 minutes', array[9]) where client_key = $1",
      [key],
    );
    expect((await consume()).allowed).toBe(true);
    const blocked = await consume();
    expect(blocked.allowed).toBe(false);
    expect(blocked.retry_after).toBeGreaterThan(3400);
  });
  it("drops expired hour entries and honors configured thresholds", async () => {
    await consume();
    await db.query(
      "update public.contact_rate_limits set attempts = array_fill(now() - interval '61 minutes', array[10]) where client_key = $1",
      [key],
    );
    expect((await consume(key, 1, 2)).allowed).toBe(true);
    expect((await consume(key, 1, 2)).allowed).toBe(false);
    const { rows } = await db.query<{ count: number }>(
      "select cardinality(attempts) as count from public.contact_rate_limits",
    );
    expect(rows[0].count).toBe(1);
  });
  it("keeps active windows when cleaning stale anonymized keys", async () => {
    await consume();
    await consume("b".repeat(64));
    await db.query(
      "update public.contact_rate_limits set updated_at = now() - interval '3 hours' where client_key = $1",
      [key],
    );
    await db.exec("select public.cleanup_contact_rate_limits()");
    const { rows } = await db.query<{ client_key: string }>(
      "select client_key from public.contact_rate_limits",
    );
    expect(rows).toEqual([{ client_key: "b".repeat(64) }]);
  });
  it.each(["anon", "authenticated"])(
    "denies limiter/table access to %s",
    async (role) => {
      await db.exec(`set role ${role}`);
      try {
        await expect(consume()).rejects.toThrow(/permission denied/);
        await expect(
          db.exec("select * from public.contact_rate_limits"),
        ).rejects.toThrow(/permission denied/);
        await expect(
          db.exec("select public.cleanup_contact_rate_limits()"),
        ).rejects.toThrow(/permission denied/);
      } finally {
        await db.exec("reset role");
      }
    },
  );
  it("allows service role to consume and rejects invalid parameters", async () => {
    await db.exec("set role service_role");
    try {
      expect((await consume()).allowed).toBe(true);
    } finally {
      await db.exec("reset role");
    }
    await expect(consume(key, 0, 10)).rejects.toThrow(/Invalid limits/);
    await expect(consume("invalid-key")).rejects.toThrow(/check constraint/);
  });
});
