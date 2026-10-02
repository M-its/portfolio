# Contato protegido: Supabase, Turnstile e Resend

## Fluxo e estado de publicação

Implementação local; configurar chaves, aplicar a migração e publicar os serviços antes de considerar a proteção ativa. Nenhum deploy ou segredo de produção foi alterado nesta rodada.

O navegador envia ao Worker de contato. O Worker obtém `CF-Connecting-IP` da plataforma Cloudflare, normaliza o IP e assina IP + timestamp com HMAC-SHA256. A Edge Function verifica assinatura e validade de 60 segundos, consome uma tentativa no PostgreSQL, valida o payload e o Turnstile (incluindo hostname e action `contact`), salva a mensagem e só então chama o Resend. Recusas não inserem em `contact_messages` nem consomem e-mail; apenas a tentativa contabilizada fica no limitador.

A função ignora `X-Forwarded-For`, `X-Real-IP` e `CF-Connecting-IP` recebidos diretamente. Não há garantia documentada suficiente neste projeto para tratá-los como identidade confiável no endpoint Supabase público. Chamada direta sem assinatura válida retorna `403`; chamada autenticada pelo proxy continua passando por limite e CAPTCHA. CORS não é usado como mecanismo contra spam. O proxy não substitui as verificações do servidor.

## Configuração

1. Crie um widget Turnstile na Cloudflare, permitindo `mitsrael.vercel.app`. Use um widget separado para desenvolvimento, com `localhost` e `127.0.0.1`. Não use chaves de teste em produção.
2. Copie `.env.example` para `.env.local`. Defina `VITE_CONTACT_ENDPOINT` com a URL HTTPS do Worker e `VITE_TURNSTILE_SITE_KEY` com a site key pública. As variáveis Supabase anteriores continuam disponíveis para outras integrações; o formulário usa o Worker quando `VITE_CONTACT_ENDPOINT` está definido. Nunca exponha a service role key, secret key Turnstile ou segredo do proxy no Vite.
3. Gere um segredo aleatório de pelo menos 32 caracteres (por exemplo, 32 bytes criptográficos codificados em hexadecimal). Use o MESMO `CONTACT_PROXY_SECRET` na Edge Function e no Worker. O texto de exemplo não é um segredo seguro.
4. Use `supabase/functions/.env.example` como referência para os segredos da função. Crie uma cópia local ignorada pelo Git (por exemplo `supabase/functions/contact.env.local`) e preencha:

   ```dotenv
   TURNSTILE_SECRET_KEY=your-private-turnstile-secret
   TURNSTILE_HOSTNAMES=mitsrael.vercel.app
   CONTACT_PROXY_SECRET=replace-with-a-random-secret-of-at-least-32-characters
   CONTACT_LIMIT_PER_MINUTE=3
   CONTACT_LIMIT_PER_HOUR=10
   RESEND_API_KEY=your-resend-key
   CONTACT_FROM_EMAIL=Portfolio <onboarding@resend.dev>
   CONTACT_TO_EMAIL=you@example.com
   ```

   `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são fornecidos pelo runtime Supabase hospedado. Não configure chaves privadas como variáveis `VITE_*`.

5. Se o checkout ainda não tiver configuração CLI, execute `pnpm dlx supabase init`, depois `pnpm dlx supabase link --project-ref your-project-ref`. Com o projeto Supabase vinculado, aplique as migrações e os segredos:

   ```bash
   pnpm dlx supabase db push
   pnpm dlx supabase secrets set --env-file supabase/functions/contact.env.local
   pnpm dlx supabase functions deploy submit-contact --no-verify-jwt
   ```

   A função pública não autentica visitantes por JWT; autentica o proxy e valida o CAPTCHA. A nova RPC é `SECURITY DEFINER`, só executável por `service_role`. As tabelas têm RLS e não aceitam inserções públicas. Nenhuma dependência Redis ou contador em memória é necessária.

6. Ajuste `SUPABASE_CONTACT_URL` em `supabase/contact-proxy/wrangler.toml` para o projeto real. Dentro de `supabase/contact-proxy`, publique e configure o segredo usando a CLI Cloudflare:

   ```bash
   pnpm dlx wrangler secret put CONTACT_PROXY_SECRET
   pnpm dlx wrangler deploy
   ```

   Confirme o acesso à conta Cloudflare e a URL final do Worker. Use a entrada pública Cloudflare; não disponibilize um servidor alternativo que aceite `CF-Connecting-IP` fornecido pelo cliente. Desative Pseudo IPv4 em modo overwrite para preservar a identidade real IPv6. Se usar outros Workers na mesma zona, eles também fazem parte da fronteira de confiança. Não configure redirects para o destino Supabase. A função não devolve os cabeçalhos de assinatura ao navegador.

7. Recompile e publique o frontend depois de preencher suas duas variáveis públicas. Se mudar o domínio, atualize a allowlist CORS no handler e no Worker, além de `TURNSTILE_HOSTNAMES` e dos hostnames do widget.
8. No Supabase Cron, agende a limpeza de chaves inativas a cada hora, usando SQL como administrador:

   ```sql
   select cron.schedule('contact-rate-limit-cleanup', '0 * * * *',
     'select public.cleanup_contact_rate_limits()');
   ```

   Habilite Cron no painel primeiro; a migração não instala extensões globalmente. Registros ativos não são removidos. O banco guarda uma chave HMAC do IP, sem IP em texto e sem token CAPTCHA. Sem o job, chaves inativas ficam armazenadas até a limpeza manual. Rotacione o segredo nos dois serviços de forma coordenada; a rotação reinicia a identidade dos limites.

## Política e respostas

As janelas são móveis: 3 tentativas nos últimos 60 segundos e 10 na última hora por IP. Todo POST com identidade autenticada consome tentativa antes da validação do payload/CAPTCHA; uma recusa por excesso não aumenta a lista. A RPC bloqueia a linha de cada IP na transação, garantindo consistência entre instâncias. Limites aceitam inteiros de 1 a 1000; configuração inválida bloqueia o envio.

São valores iniciais conservadores para um portfólio de baixo volume. NAT, redes corporativas, operadoras e outros usuários atrás de um proxy podem compartilhar IP e cota. Monitorar ocorrências de `429` e ajustar os valores conforme o volume legítimo. Bloqueio é temporário, com `Retry-After` calculado para as duas janelas; não bloqueia IP permanentemente. Mudança de IP não impede nova tentativa: CAPTCHA continua obrigatório. Não representa proteção completa contra ataque distribuído.

- `400`: payload ou verificação inválidos; token expirado/reutilizado recebe `verification_expired`.
- `403`: identidade do proxy ausente, adulterada ou expirada.
- `413`: corpo acima de 16 KiB, mesmo sem `Content-Length`.
- `429`: limite atingido, com `Retry-After` e `retryAfter` em segundos.
- `503`: configuração, banco, limitador ou verificação indisponíveis. Nunca libera o envio silenciosamente.
- `200`: mensagem salva. Falha de notificação retorna `notificationSent: false`, evitando solicitar reenvio e duplicar mensagens já recebidas. As mensagens continuam disponíveis no Table Editor; acompanhe falhas de notificação nos logs.

O formulário mantém seus campos nas recusas e falhas de envio, apresenta o tempo de espera, distingue expiração e indisponibilidade, renova o widget após cada tentativa e oferece “Verificar novamente”. Tokens expiram em cinco minutos e só podem ser usados uma vez. Timeout de rede tem resposta amigável, embora uma resposta perdida após salvar possa gerar duplicidade se o visitante reenviar; idempotência de mensagens não faz parte desta mudança.

## Validação local e produção

```bash
pnpm run test
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm dlx deno check --no-config --no-lock --node-modules-dir=none supabase/functions/submit-contact/index.ts supabase/contact-proxy/index.ts
```

Os testes usam o handler real com banco, Siteverify e Resend substituídos por doubles, o SQL real no PostgreSQL WASM PGlite e o formulário real com Turnstile simulado. PGlite serializa as chamadas em uma conexão: o teste de chamadas simultâneas verifica contagem e SQL, mas não substitui ensaio de múltiplas conexões PostgreSQL. A consistência em produção depende do bloqueio `FOR UPDATE` da RPC, que deve permanecer na transação. Nenhum teste local envia e-mail real ou prova ativação em produção.

Após publicar, conferir: envio legítimo pelo Worker; chamada direta à Edge sem assinatura recusada; token inválido recusado; quarta tentativa em um minuto com `429`; chamadas recusadas sem novas mensagens/e-mails; disponibilidade do widget no domínio real; limpeza Cron. A instância Docker Supabase local estava indisponível nesta sessão.

Avisos anteriores de lint: cinco `!important` em `project-view-transition.css` preservam o congelamento das transformações durante o snapshot; duas supressões com placeholder em `intro-splash.tsx` precedem esta rodada. Nenhuma nova supressão foi adicionada. A suíte pode avisar sobre os dados antigos de `baseline-browser-mapping`, uma dependência transitiva usada no processamento de testes; não afeta estes testes de contato. O teste de falha de carregamento do Turnstile provoca uma mensagem esperada de recurso externo bloqueado no DOM simulado. O otimizador de imagens mantém o original quando a recompressão resulta maior.

Referências: [Siteverify e expiração](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [identidade e cabeçalhos Cloudflare](https://developers.cloudflare.com/fundamentals/reference/http-headers/), [configuração Biome/Tailwind](https://biomejs.dev/reference/configuration/).
