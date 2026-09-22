# Vertex Academy

Plataforma de treinamento corporativo: trilhas de aprendizado organizadas em módulos e aulas em vídeo, questionários com correção no servidor, emissão automática de certificado e um painel administrativo completo — tudo sem precisar mexer em código pra cadastrar conteúdo novo.

Projeto pessoal construído do zero como estudo de caso de uma plataforma real de e-learning corporativo. Os dados de demonstração (trilha, módulos, vídeos, questionário) são fictícios.

**Demo:** https://vertex-academy-five.vercel.app/login
**Login de teste:** `aluno@demo.com` / senha: aluno123 · admin: `admin@demo.com` / senha: admin123

## Funcionalidades

- Login com Supabase Auth, sessão via cookies (SSR)
- Trilhas → Módulos → Aulas, com vídeo do YouTube embedado e progresso por aula
- Questionários com correção sempre no servidor (a resposta certa nunca é enviada ao navegador antes de responder)
- Emissão automática de certificado quando o aluno conclui 100% da trilha **e** está aprovado em todos os questionários dela
- Painel administrativo (cadastro de trilhas/módulos/aulas/questionários/novidades) protegido por um perfil `admin`
- Central de notificações (um módulo novo dispara notificação automática pra todos os alunos via trigger no banco)
- Layout responsivo (mobile, tablet, desktop) e identidade visual própria

## Stack

- **Next.js 16** (App Router, Server Components + Server Actions — sem API routes separadas)
- **TypeScript**
- **Supabase** (Postgres + Auth), com **Row Level Security** em todas as tabelas
- **Tailwind** disponível, mas a interface é majoritariamente estilo inline — decisão de projeto pra manter tudo num único arquivo por tela, sem depender de uma lib de componentes
- **lucide-react** para ícones
- Deploy contínuo na **Vercel** (build automático a cada push)

## Um detalhe de arquitetura que vale destacar

O maior desafio de segurança do projeto: a correção do questionário roda no servidor, mas o **servidor usa a mesma sessão do usuário logado** (cliente Supabase autenticado com a chave anônima + RLS) — não um backend separado. Isso significa que, por padrão, qualquer política de RLS ampla o bastante pra "o app funcionar" também fica visível pra chamadas diretas à API do Supabase, fora do app.

A solução: dois clientes Supabase distintos no lado do servidor.

- O client "normal" (`app/lib/supabase/server.ts`), sujeito a RLS, usado pra tudo que é leitura segura de dados do próprio usuário.
- Um client "admin" (`app/lib/supabase/admin.ts`), com a `service_role` key — nunca exposta ao navegador — usado **só** nos três pontos onde o app precisa de mais acesso do que o RLS concede a um usuário comum: ler a resposta certa de uma pergunta pra corrigir, gravar o resultado de um questionário já corrigido, e emitir o certificado.

Ao lado disso, a tabela `perguntas` tem a coluna `resposta_correta` bloqueada por `revoke select` pra qualquer usuário autenticado — só o client admin consegue ler. Sem essa trava, um aluno com um mínimo de conhecimento técnico conseguiria ler a resposta certa de qualquer questionário direto pela API do Supabase, sem nem abrir o site.

O schema completo, incluindo todas as políticas de RLS, está em [`supabase/schema.sql`](supabase/schema.sql).

## Rodando localmente

```bash
npm install
cp .env.local.example .env.local   # preencha com as chaves do seu projeto Supabase
npm run dev
```

### Banco de dados

1. Crie um projeto novo no [Supabase](https://supabase.com)
2. Rode `supabase/schema.sql` no SQL Editor (cria as tabelas, funções e políticas de RLS)
3. Rode `supabase/seed.sql` (dados de demonstração fictícios)
4. Em **Authentication → Users**, crie um usuário de teste e, se quiser acesso ao painel admin, rode:
   ```sql
   update public.perfis set admin = true where id = (select id from auth.users where email = 'seu-email@teste.com');
   ```
5. Copie a **URL**, a **anon key** e a **service_role key** do projeto (Settings → API) pro `.env.local`

## Estrutura

```
app/
  (app)/            # área logada (sidebar, todas as páginas internas)
    admin/          # painel administrativo (protegido por perfil admin)
    modulos/        # navegação de trilhas → módulos → aulas
    questionario/   # responder questionário + resultado
  login/            # tela de login (sem sidebar)
  lib/supabase/     # clientes Supabase (browser, server, admin)
supabase/
  schema.sql        # tabelas, funções, triggers e políticas de RLS
  seed.sql          # dados de demonstração fictícios
```
