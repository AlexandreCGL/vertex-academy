import { createClient } from '@/app/lib/supabase/server'
import { createAdminClient } from '@/app/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { ClipboardList, Plus, CheckCircle2 } from 'lucide-react'

export default async function AdminQuestionariosPage() {
  const supabase = await createClient()

  const { data: aulas } = await supabase
    .from('aulas')
    .select('id, titulo, modulos(titulo, trilhas(nome))')
    .order('titulo')

  const { data: modulos } = await supabase
    .from('modulos')
    .select('id, titulo, trilhas(nome)')
    .order('titulo')

  // resposta_correta so pode ser lida pelo cliente admin (RLS bloqueia
  // authenticated/anon) — precisamos dela aqui pra mostrar a alternativa certa
  const { data: questionarios } = await createAdminClient()
    .from('questionarios')
    .select('id, tipo, titulo, nota_minima, aula_id, modulo_id, perguntas(id, enunciado, alternativas, resposta_correta, ordem)')
    .order('created_at', { ascending: false })

  async function criarQuestionario(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const tipo = formData.get('tipo') as string
    const refId = formData.get('ref_id') as string

    await supabase.from('questionarios').insert({
      tipo,
      titulo: formData.get('titulo') as string,
      nota_minima: Number(formData.get('nota_minima')),
      aula_id: tipo === 'aula' ? refId : null,
      modulo_id: tipo === 'modulo' ? refId : null,
    })
    revalidatePath('/admin/questionarios')
  }

  async function excluirQuestionario(formData: FormData) {
    'use server'
    const supabase = await createClient()
    await supabase.from('questionarios').delete().eq('id', formData.get('id') as string)
    revalidatePath('/admin/questionarios')
  }

  async function criarPergunta(formData: FormData) {
    'use server'
    const supabase = await createClient()

    const alternativas = [
      formData.get('alt0') as string,
      formData.get('alt1') as string,
      formData.get('alt2') as string,
      formData.get('alt3') as string,
    ].filter(Boolean)

    await supabase.from('perguntas').insert({
      questionario_id: formData.get('questionario_id') as string,
      enunciado: formData.get('enunciado') as string,
      alternativas,
      resposta_correta: Number(formData.get('resposta_correta')),
      ordem: Number(formData.get('ordem')),
    })
    revalidatePath('/admin/questionarios')
  }

  async function excluirPergunta(formData: FormData) {
    'use server'
    const supabase = await createClient()
    await supabase.from('perguntas').delete().eq('id', formData.get('id') as string)
    revalidatePath('/admin/questionarios')
  }

  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '10px 11px',
    marginBottom: '10px',
    border: '1px solid #e4e0d4',
    borderRadius: '8px',
    fontSize: '14px',
  }

  return (
    <div>
      <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '24px' }}>Questionários</h1>

      <div className="card" style={{ backgroundColor: '#fff', padding: '22px', borderRadius: '14px', marginBottom: '32px', maxWidth: '520px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Criar novo questionário</h2>

        <form action={criarQuestionario}>
          <label>Tipo</label>
          <select name="tipo" required style={inputStyle}>
            <option value="aula">Questionário de Aula (menor)</option>
            <option value="modulo">Questionário de Módulo (maior, geral)</option>
          </select>

          <label>Referente a (aula ou módulo — escolha conforme o tipo acima)</label>
          <select name="ref_id" required style={inputStyle}>
            <optgroup label="Aulas">
              {aulas?.map((s: any) => (
                <option key={s.id} value={s.id}>{s.modulos?.titulo} → {s.titulo}</option>
              ))}
            </optgroup>
            <optgroup label="Módulos">
              {modulos?.map((m: any) => (
                <option key={m.id} value={m.id}>{m.trilhas?.nome} → {m.titulo}</option>
              ))}
            </optgroup>
          </select>

          <label>Título do questionário</label>
          <input type="text" name="titulo" required style={inputStyle} />

          <label>Nota mínima para aprovação (%)</label>
          <input type="number" name="nota_minima" defaultValue={70} style={inputStyle} />

          <button type="submit" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#141414', color: '#F2C230', padding: '9px 18px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
            <Plus size={15} /> Criar questionário
          </button>
        </form>
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#6B6B63', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Questionários existentes
      </h2>

      {questionarios?.map((q: any) => (
        <div key={q.id} className="card" style={{ backgroundColor: '#fff', padding: '22px', borderRadius: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ClipboardList size={17} color="#B8860B" />
              <div>
                <strong style={{ fontSize: '15px' }}>{q.titulo}</strong>
                <span style={{ fontSize: '12px', color: '#6B6B63', marginLeft: '8px' }}>
                  ({q.tipo === 'aula' ? 'Aula' : 'Módulo'} · nota mín. {q.nota_minima}%)
                </span>
              </div>
            </div>
            <form action={excluirQuestionario}>
              <input type="hidden" name="id" value={q.id} />
              <button type="submit" style={{ color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                Excluir questionário
              </button>
            </form>
          </div>

          {q.perguntas
            ?.sort((a: any, b: any) => a.ordem - b.ordem)
            .map((p: any) => (
              <div key={p.id} style={{ backgroundColor: '#F7F4EC', padding: '14px', borderRadius: '10px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '14px' }}>{p.enunciado}</strong>
                  <form action={excluirPergunta}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" style={{ color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>
                      Excluir
                    </button>
                  </form>
                </div>
                <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', fontSize: '13px' }}>
                  {p.alternativas.map((alt: string, idx: number) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0', color: idx === p.resposta_correta ? '#2e7d32' : '#3d3d3a', fontWeight: idx === p.resposta_correta ? 700 : 400 }}>
                      {idx === p.resposta_correta && <CheckCircle2 size={13} />}
                      {alt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          <form action={criarPergunta} style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #ddd' }}>
            <input type="hidden" name="questionario_id" value={q.id} />
            <input type="text" name="enunciado" placeholder="Enunciado da pergunta" required style={inputStyle} />
            <input type="text" name="alt0" placeholder="Alternativa A" required style={inputStyle} />
            <input type="text" name="alt1" placeholder="Alternativa B" required style={inputStyle} />
            <input type="text" name="alt2" placeholder="Alternativa C (opcional)" style={inputStyle} />
            <input type="text" name="alt3" placeholder="Alternativa D (opcional)" style={inputStyle} />

            <label>Qual é a correta?</label>
            <select name="resposta_correta" required style={inputStyle}>
              <option value="0">Alternativa A</option>
              <option value="1">Alternativa B</option>
              <option value="2">Alternativa C</option>
              <option value="3">Alternativa D</option>
            </select>

            <input type="number" name="ordem" placeholder="Ordem" defaultValue={0} style={{ ...inputStyle, width: '100px' }} />

            <button type="submit" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#141414', color: '#F2C230', padding: '9px 18px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
              <Plus size={15} /> Adicionar pergunta
            </button>
          </form>
        </div>
      ))}
    </div>
  )
}