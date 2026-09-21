-- Vertex Academy — schema completo (tabelas + RLS)
-- Rode este script inteiro no SQL Editor de um projeto Supabase novo e vazio.

-- ========== TABELAS ==========

create table public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  cargo text default 'Aluno',
  admin boolean not null default false
);

create table public.trilhas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text
);

create table public.modulos (
  id uuid primary key default gen_random_uuid(),
  trilha_id uuid not null references public.trilhas(id) on delete cascade,
  titulo text not null,
  ordem int not null default 0
);

create table public.aulas (
  id uuid primary key default gen_random_uuid(),
  modulo_id uuid not null references public.modulos(id) on delete cascade,
  titulo text not null,
  ordem int not null default 0,
  youtube_url text,
  duracao_min int not null default 0
);

create table public.progresso_aulas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  aula_id uuid not null references public.aulas(id) on delete cascade,
  concluido boolean not null default false,
  concluido_em timestamptz,
  unique (usuario_id, aula_id)
);

create table public.questionarios (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('aula', 'modulo')),
  aula_id uuid references public.aulas(id) on delete cascade,
  modulo_id uuid references public.modulos(id) on delete cascade,
  titulo text not null,
  nota_minima int not null default 70,
  created_at timestamptz not null default now()
);

create table public.perguntas (
  id uuid primary key default gen_random_uuid(),
  questionario_id uuid not null references public.questionarios(id) on delete cascade,
  enunciado text not null,
  alternativas jsonb not null,
  resposta_correta int not null,
  ordem int not null default 0
);

create table public.resultados_questionario (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  questionario_id uuid not null references public.questionarios(id) on delete cascade,
  nota int not null,
  aprovado boolean not null,
  respondido_em timestamptz not null default now()
);

create table public.novidades (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  conteudo text not null,
  created_at timestamptz not null default now()
);

create table public.notificacoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  mensagem text not null,
  lida boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.certificados (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  trilha_id uuid not null references public.trilhas(id) on delete cascade,
  emitido_em timestamptz not null default now(),
  unique (usuario_id, trilha_id)
);

-- ========== FUNÇÕES AUXILIARES ==========

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce((select admin from public.perfis where id = auth.uid()), false);
$$;

-- cria automaticamente um perfil quando um usuário novo se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id, nome, cargo, admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    'Aluno',
    false
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- notifica todos os alunos quando um módulo novo é criado
create or replace function public.notificar_novo_modulo()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.notificacoes (usuario_id, titulo, mensagem)
  select id, 'Novo módulo disponível', 'O módulo "' || new.titulo || '" foi adicionado à sua trilha.'
  from public.perfis;
  return new;
end;
$$;

create trigger trg_notificar_novo_modulo
  after insert on public.modulos
  for each row execute function public.notificar_novo_modulo();

-- ========== RLS ==========

alter table public.perfis enable row level security;
alter table public.trilhas enable row level security;
alter table public.modulos enable row level security;
alter table public.aulas enable row level security;
alter table public.progresso_aulas enable row level security;
alter table public.questionarios enable row level security;
alter table public.perguntas enable row level security;
alter table public.resultados_questionario enable row level security;
alter table public.novidades enable row level security;
alter table public.notificacoes enable row level security;
alter table public.certificados enable row level security;

-- perfis
create policy "ver_proprio_perfil" on public.perfis for select using (auth.uid() = id);
create policy "atualizar_proprio_perfil" on public.perfis for update using (auth.uid() = id);

-- trilhas
create policy "ler_trilhas" on public.trilhas for select using (auth.role() = 'authenticated');
create policy "admin_gerencia_trilhas" on public.trilhas for all using (is_admin());

-- modulos
create policy "ler_modulos" on public.modulos for select using (auth.role() = 'authenticated');
create policy "admin_modulos" on public.modulos for all using (is_admin());

-- aulas
create policy "ler_aulas" on public.aulas for select using (auth.role() = 'authenticated');
create policy "admin_aulas" on public.aulas for all using (is_admin());

-- progresso_aulas: leitura do próprio registro; escrita só pelo cliente admin (service_role),
-- que bypassa RLS — por isso não existe policy de insert/update aqui
create policy "ver_proprio_progresso_aula" on public.progresso_aulas for select using (auth.uid() = usuario_id);

-- questionarios
create policy "ler_questionarios" on public.questionarios for select using (auth.role() = 'authenticated');
create policy "admin_questionarios" on public.questionarios for all using (is_admin());

-- perguntas: leitura liberada, mas a coluna resposta_correta é bloqueada logo abaixo
create policy "ler_perguntas" on public.perguntas for select using (auth.role() = 'authenticated');
create policy "admin_perguntas" on public.perguntas for all using (is_admin());

-- resultados_questionario: leitura do próprio resultado; gravação só pelo cliente admin
-- (depois de corrigir no servidor) — sem policy de insert pra usuário comum de propósito
create policy "ver_proprio_resultado" on public.resultados_questionario for select using (auth.uid() = usuario_id);

-- novidades
create policy "ler_novidades" on public.novidades for select using (auth.role() = 'authenticated');
create policy "admin_gerencia_novidades" on public.novidades for all using (is_admin());

-- notificacoes
create policy "ver_propria_notificacao" on public.notificacoes for select using (auth.uid() = usuario_id);
create policy "atualizar_propria_notificacao" on public.notificacoes for update using (auth.uid() = usuario_id);

-- certificados: leitura do próprio certificado; emissão só via cliente admin
create policy "ver_proprio_certificado" on public.certificados for select using (auth.uid() = usuario_id);
create policy "admin_emite_certificado" on public.certificados for insert with check (is_admin());

-- ninguém (nem admin) lê a resposta certa direto pela API — só o cliente service_role,
-- usado exclusivamente no servidor pra corrigir o questionário
revoke select (resposta_correta) on public.perguntas from authenticated, anon;
