import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend@4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://YOUR-PORTFOLIO-DOMAIN",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ContactPayload = { name?: string; email?: string; message?: string };

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
  }

  try {
    const { name, email, message } = (await request.json()) as ContactPayload;
    const normalizedName = name?.trim() || null;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedMessage = message?.trim();

    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail) || !normalizedMessage) {
      return Response.json({ error: "Invalid contact payload" }, { status: 400, headers: corsHeaders });
    }
    if (normalizedName?.length > 100 || normalizedEmail.length > 254 || normalizedMessage.length > 3000) {
      return Response.json({ error: "Contact payload is too long" }, { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { error: databaseError } = await supabase.from("contact_messages").insert({
      name: normalizedName,
      email: normalizedEmail,
      message: normalizedMessage,
    });
    if (databaseError) throw databaseError;

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    await resend.emails.send({
      from: Deno.env.get("CONTACT_FROM_EMAIL")!,
      to: [Deno.env.get("CONTACT_TO_EMAIL")!],
      replyTo: normalizedEmail,
      subject: `Novo contato${normalizedName ? ` de ${normalizedName}` : ""}`,
      text: `${normalizedName ? `${normalizedName}\n` : ""}${normalizedEmail}\n\n${normalizedMessage}`,
    });

    return Response.json({ ok: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("Contact submission failed", error);
    return Response.json({ error: "Unable to submit contact" }, { status: 500, headers: corsHeaders });
  }
});
