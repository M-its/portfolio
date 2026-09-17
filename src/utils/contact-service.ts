export type ContactMessage = {
  email: string;
  message: string;
  name?: string;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function isContactServiceConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export async function sendContactMessage(message: ContactMessage) {
  if (!isContactServiceConfigured()) {
    throw new Error("O canal de contato ainda não está configurado.");
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/submit-contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error("Não foi possível enviar sua mensagem. Tente novamente.");
  }
}
