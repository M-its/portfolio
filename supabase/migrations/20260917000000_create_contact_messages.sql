create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  message text not null,
  created_at timestamptz not null default now(),
  constraint contact_messages_name_length check (char_length(name) <= 100),
  constraint contact_messages_email_length check (char_length(email) <= 254),
  constraint contact_messages_message_length check (char_length(message) between 1 and 3000)
);

alter table public.contact_messages enable row level security;

-- Nenhum papel público pode ler ou inserir diretamente. A Edge Function usa a
-- service role e é a única porta de entrada para a tabela.
