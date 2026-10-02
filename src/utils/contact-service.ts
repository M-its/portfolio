export type ContactMessage = {
  email: string;
  message: string;
  name?: string;
  turnstileToken: string;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const contactEndpoint = import.meta.env.VITE_CONTACT_ENDPOINT;

export function isContactServiceConfigured() {
  return Boolean(contactEndpoint || (supabaseUrl && supabaseAnonKey));
}

export async function sendContactMessage(message: ContactMessage) {
  if (!isContactServiceConfigured()) {
    throw new Error("O canal de contato ainda não está configurado.");
  }

  let response: Response;
  try {
    response = await fetch(
      contactEndpoint || `${supabaseUrl}/functions/v1/submit-contact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(!contactEndpoint && supabaseAnonKey
            ? {
                Authorization: `Bearer ${supabaseAnonKey}`,
                apikey: supabaseAnonKey,
              }
            : {}),
        },
        body: JSON.stringify(message),
        signal: AbortSignal.timeout(25_000),
      },
    );
  } catch {
    throw new Error(
      "Não foi possível conectar ao contato. Tente novamente. Sua mensagem foi preservada.",
    );
  }

  if (!response.ok) {
    const result: unknown = await response.json().catch(() => null);
    const payload =
      result && typeof result === "object"
        ? (result as { error?: string; retryAfter?: number })
        : {};
    if (response.status === 429) {
      const seconds = Math.max(
        1,
        Number(response.headers.get("Retry-After")) || payload.retryAfter || 60,
      );
      throw new Error(
        `Limite de tentativas atingido. Tente novamente em ${Math.ceil(seconds)} segundos. Sua mensagem foi preservada.`,
      );
    }
    if (payload.error === "verification_expired")
      throw new Error(
        "Verificação expirada. Verifique novamente e tente enviar.",
      );
    if (
      payload.error === "verification_required" ||
      payload.error === "verification_invalid"
    )
      throw new Error("Conclua a verificação novamente antes de enviar.");
    if (response.status === 503 || response.status === 403)
      throw new Error(
        "Contato temporariamente indisponível. Tente novamente mais tarde. Sua mensagem foi preservada.",
      );
    throw new Error("Não foi possível enviar sua mensagem. Tente novamente.");
  }
}
