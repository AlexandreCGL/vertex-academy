-- Vertex Academy — dados de demonstração (fictícios)
-- Rode DEPOIS do schema.sql, no mesmo projeto Supabase.
-- Os vídeos usados são curtas-metragens open source do Blender Foundation
-- (Big Buck Bunny, Sintel, Tears of Steel — Creative Commons, livres pra embed).

insert into public.trilhas (id, nome, descricao) values
  ('11111111-1111-1111-1111-111111111111', 'Integração', 'Trilha de boas-vindas pra quem está chegando na empresa');

insert into public.modulos (id, trilha_id, titulo, ordem) values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', '1 - Bem-vindo(a) à equipe', 1),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '2 - Ferramentas do dia a dia', 2),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', '3 - Segurança da informação', 3);

insert into public.aulas (id, modulo_id, titulo, ordem, youtube_url, duracao_min) values
  ('33333333-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222221', '1.1 Nossa história e cultura', 1, 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 10),
  ('33333333-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222221', '1.2 Como funciona o seu time', 2, 'https://www.youtube.com/watch?v=eRsGyueVLvQ', 14),
  ('33333333-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', '2.1 E-mail e agenda', 1, 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 8),
  ('33333333-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', '2.2 Gestão de tarefas', 2, 'https://www.youtube.com/watch?v=R6MlUcmOul8', 12),
  ('33333333-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222223', '3.1 Boas práticas de senha', 1, 'https://www.youtube.com/watch?v=eRsGyueVLvQ', 9),
  ('33333333-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222223', '3.2 Reconhecendo phishing', 2, 'https://www.youtube.com/watch?v=R6MlUcmOul8', 11);

insert into public.questionarios (id, tipo, modulo_id, titulo, nota_minima) values
  ('44444444-0000-0000-0000-000000000001', 'modulo', '22222222-2222-2222-2222-222222222223', 'Quiz: Segurança da informação', 70);

insert into public.perguntas (questionario_id, enunciado, alternativas, resposta_correta, ordem) values
  ('44444444-0000-0000-0000-000000000001', 'Qual das opções abaixo é uma boa prática de senha?', '["Usar a mesma senha em todos os sites", "Usar uma senha longa, única e um gerenciador de senhas", "Anotar a senha num post-it no monitor", "Compartilhar a senha com o time por chat"]', 1, 1),
  ('44444444-0000-0000-0000-000000000001', 'Você recebe um e-mail urgente pedindo pra clicar num link e confirmar sua senha. O que fazer?', '["Clicar e confirmar rápido, é urgente", "Ignorar completamente sem avisar ninguém", "Verificar o remetente e reportar pro time de segurança antes de qualquer ação", "Responder o e-mail perguntando se é confiável"]', 2, 2);

insert into public.novidades (titulo, conteudo) values
  ('Nova trilha de Integração no ar', 'Já está disponível a trilha de boas-vindas pra quem está chegando na empresa. Confira os módulos em Módulos!'),
  ('Atualização na plataforma', 'Agora você recebe certificado automático ao concluir uma trilha inteira, com todos os questionários aprovados.');

-- Depois de rodar isso, crie 2 usuários de teste em Authentication > Users no
-- painel do Supabase (ex: aluno@demo.com e admin@demo.com) e depois rode,
-- trocando o e-mail, pra tornar um deles admin:
--
-- update public.perfis set admin = true, nome = 'Admin Demo', cargo = 'Gestora'
-- where id = (select id from auth.users where email = 'admin@demo.com');
--
-- update public.perfis set nome = 'Aluno Demo'
-- where id = (select id from auth.users where email = 'aluno@demo.com');
