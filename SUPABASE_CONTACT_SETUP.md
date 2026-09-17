# Contato via Supabase

1. Crie um projeto no Supabase e execute a migration em `supabase/migrations` pelo SQL Editor.
2. Copie `.env.example` para `.env.local` e preencha a URL e a anon key do projeto. Nunca exponha a service role key no Vite.
3. Crie uma conta no [Resend](https://resend.com), valide um domínio/remetente e configure os segredos da Edge Function:

   ```bash
   supabase secrets set RESEND_API_KEY=... CONTACT_FROM_EMAIL="Portfolio <contato@seu-dominio.com>" CONTACT_TO_EMAIL="seu-email@exemplo.com"
   ```

4. Em `supabase/functions/submit-contact/index.ts`, substitua `https://YOUR-PORTFOLIO-DOMAIN` pela URL final do portfólio. Para testar localmente, adicione também a origem local temporariamente.
5. Faça o deploy: `supabase functions deploy submit-contact --no-verify-jwt`.

As mensagens aparecem em **Table Editor → contact_messages**. Cada notificação chega com `Reply-To` igual ao e-mail do visitante, então basta responder ao e-mail recebido.

## Antes de publicar

Adicione Cloudflare Turnstile à função antes de divulgar amplamente o chat. A função já protege a tabela de acesso direto, mas CAPTCHA e limite de requisições são a próxima camada contra spam.
