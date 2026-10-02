import { createClient } from "npm:@supabase/supabase-js@2.117.2";
import { Resend } from "npm:resend@4.8.0";
import { createHandler, type Contact } from "./handler.ts";

const env = (key: string) => Deno.env.get(key);
function database() {
  const url = env("SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Database is not configured");
  return createClient(url, key);
}

Deno.serve(
  createHandler({
    env,
    fetch,
    async limit(key, minute, hour) {
      const { data, error } = await database().rpc("consume_contact_attempt", {
        p_client_key: key,
        p_minute_limit: minute,
        p_hour_limit: hour,
      });
      if (error) throw new Error("Rate limiter unavailable");
      return data;
    },
    async save(contact: Contact) {
      const { error } = await database()
        .from("contact_messages")
        .insert(contact);
      if (error) throw new Error("Contact storage unavailable");
    },
    async notify(contact: Contact) {
      const resend = new Resend(env("RESEND_API_KEY"));
      const from = env("CONTACT_FROM_EMAIL");
      const to = env("CONTACT_TO_EMAIL");
      if (!from || !to) throw new Error("Email is not configured");
      const { error } = await resend.emails.send({
        from,
        to: [to],
        replyTo: contact.email,
        subject: `Novo contato${contact.name ? ` de ${contact.name}` : ""}`,
        text: `${contact.name ? `${contact.name}\n` : ""}${contact.email}\n\n${contact.message}`,
      });
      if (error) console.error("Contact notification failed");
      return !error;
    },
  }),
);
