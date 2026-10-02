const encoder = new TextEncoder();

export async function signature(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(value)),
  );
}

export function hex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export function normalizeIp(raw: string): string | null {
  try {
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(raw)) {
      if (raw.split(".").some((part) => Number(part) > 255)) return null;
      return raw.split(".").map(Number).join(".");
    }
    if (!/^[0-9a-f:]+$/i.test(raw) || !raw.includes(":")) return null;
    return new URL(`http://[${raw}]/`).hostname.slice(1, -1);
  } catch {
    return null;
  }
}

export async function clientIp(
  request: Request,
  secret: string,
  now = Date.now(),
) {
  const ip = normalizeIp(request.headers.get("x-contact-ip") ?? "");
  const timestamp = request.headers.get("x-contact-timestamp") ?? "";
  const supplied = request.headers.get("x-contact-signature") ?? "";
  if (
    !ip ||
    !/^\d{13}$/.test(timestamp) ||
    Math.abs(now - Number(timestamp)) > 60_000 ||
    !/^[a-f0-9]{64}$/.test(supplied)
  )
    return null;
  const expected = await signature(secret, `${timestamp}\n${ip}`);
  const actual = Uint8Array.from(supplied.match(/../g) ?? [], (byte) =>
    Number.parseInt(byte, 16),
  );
  let difference = 0;
  for (let index = 0; index < expected.length; index++)
    difference |= expected[index] ^ actual[index];
  return difference === 0 ? ip : null;
}

export async function readLimitedBody(request: Request, maxBytes = 16_384) {
  if (Number(request.headers.get("content-length")) > maxBytes)
    throw new RangeError("Body too large");
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError("Missing body");
  let length = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > maxBytes) {
      await reader.cancel();
      throw new RangeError("Body too large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(bytes);
}
