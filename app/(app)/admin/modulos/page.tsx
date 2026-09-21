import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PlayCircle, Plus } from 'lucide-react'

export default async function AdminModulosPage() {
  const supabase = await createClient()

  const { data: trilhas } = await supabase
    .from('trilhas')
    .select('id, nome, modulos(id, titulo, ordem, aulas(id, titulo, ordem, youtube_url, duracao_min))')
    .order('nome')

  async function criarModulo(formData: FormData) {
    'use server'
    const supabase = await createClient()
    await supabase.from('modulos').insert({
      trilha_id: formData.get('trilha_id') as string,
      titulo: formData.get('titulo') as string,
      ordem: Number(formData.get('ordem')),
    })
    revalidatePath('/admin/modulos')
  }

  async function excluirModulo(formData: FormData) {
    'use server'
    const supabase = await createClient()
    await supabase.from('modulos').delete().eq('id', formData.get('id') as string)
    revalidatePath('/admin/modulos')
  }

  async function criarAula(formData: FormData) {
    'use server'
    const supabase = await createClient()
    await supabase.from('aulas').insert({
      modulo_id: formData.get('modulo_id') as string,
      titulo: formData.get('titulo') as string,
      youtube_url: formData.get('youtube_url') as string,
      duracao_min: Number(formData.get('duracao_min')),
      ordem: Number(formData.get('ordem')),
    })
    revalidatePath('/admin/modulos')
  }

  async function editarAula(formData: FormData) {
    'use server'
    const supabase = await createClient()
    await supabase
      .from('aulas')
      .update({
        titulo: formData.get('titulo') as string,
        youtube_url: formData.get('youtube_url') as string,
        duracao_min: Number(formData.get('duracao_min')),
        ordem: Number(formData.get('ordem')),
      })
      .eq('id', formData.get('id') as string)
    revalidatePath('/admin/modulos')
  }

  async function excluirAula(formData: FormData) {
    'use server'
    const supabase = await createClient()
    await supabase.from('aulas').delete().eq('id', formData.get('id') as string)
    revalidatePath('/admin/modulos')
  }

  const inputStyle = {
    display: 'block',
    padding: '9px 11px',
    border: '1px solid #e4e0d4',
    borderRadius: '8px',
    marginBottom: '6px',
    fontSize: '14px',
  }

  return (
    <div>
      <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '24px' }}>Módulos e Aulas</h1>

      {trilhas?.map((trilha: any) => (
        <div key={trilha.id} style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: '#6B6B63', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{trilha.nome}</h2>

          <form action={criarModulo} className="card" style={{ marginBottom: '16px', backgroundColor: '#fff', padding: '14px', borderRadius: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input type="hidden" name="trilha_id" value={trilha.id} />
            <input type="text" name="titulo" placeholder="Título do módulo (ex: 2 - Escrita Fiscal)" required style={{ ...inputStyle, flex: '1 1 240px', marginBottom: 0 }} />
            <input type="number" name="ordem" placeholder="Ordem" defaultValue={0} style={{ ...inputStyle, width: '70px', marginBottom: 0 }} />
            <button type="submit" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#141414', color: '#F2C230', padding: '9px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
              <Plus size={15} /> Módulo
            </button>
          </form>

          {trilha.modulos
            ?.sort((a: any, b: any) => a.ordem - b.ordem)
            .map((modulo: any) => (
              <div key={modulo.id} className="card" style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '14px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '15px' }}>{modulo.titulo}</strong>
                  <form action={excluirModulo}>
                    <input type="hidden" name="id" value={modulo.id} />
                    <button type="submit" style={{ color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                      Excluir módulo
                    </button>
                  </form>
                </div>

                <div style={{ paddingLeft: '20px' }}>
                  {modulo.aulas
                    ?.sort((a: any, b: any) => a.ordem - b.ordem)
                    .map((aula: any) => (
                      <details key={aula.id} style={{ padding: '10px 0', borderBottom: '1px solid #f0efe9' }}>
                        <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', listStyle: 'none' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                            <PlayCircle size={16} color="#6B6B63" />
                            {aula.titulo} · {aula.duracao_min} min
                            {!aula.youtube_url && (
                              <span style={{ color: '#c0392b', fontSize: '12px', fontWeight: 600 }}>sem link ainda</span>
                            )}
                          </span>
                          <span style={{ color: '#6B6B63', fontSize: '12px', fontWeight: 600 }}>Editar</span>
                        </summary>

                        <form action={editarAula} style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <input type="hidden" name="id" value={aula.id} />
                          <input type="text" name="titulo" defaultValue={aula.titulo} required style={{ ...inputStyle, flex: '1 1 100%', marginBottom: 0 }} />
                          <input type="url" name="youtube_url" defaultValue={aula.youtube_url || ''} placeholder="https://www.youtube.com/watch?v=..." style={{ ...inputStyle, flex: '1 1 100%', marginBottom: 0 }} />
                          <input type="number" name="duracao_min" defaultValue={aula.duracao_min} style={{ ...inputStyle, width: '100px', marginBottom: 0 }} />
                          <input type="number" name="ordem" defaultValue={aula.ordem} style={{ ...inputStyle, width: '100px', marginBottom: 0 }} />
                          <button type="submit" className="btn" style={{ backgroundColor: '#141414', color: '#F2C230', padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                            Salvar
                          </button>
                          <button formAction={excluirAula} style={{ color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                            Excluir
                          </button>
                        </form>
                      </details>
                    ))}

                  <form action={criarAula} style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #ddd' }}>
                    <input type="hidden" name="modulo_id" value={modulo.id} />
                    <input type="text" name="titulo" placeholder="Título da aula (ex: 1.1 O que é CNPJ?)" required style={{ ...inputStyle, width: '100%' }} />
                    <input type="url" name="youtube_url" placeholder="https://www.youtube.com/watch?v=... (pode deixar em branco por enquanto)" style={{ ...inputStyle, width: '100%' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="number" name="duracao_min" placeholder="Minutos" defaultValue={0} style={{ ...inputStyle, width: '100px' }} />
                      <input type="number" name="ordem" placeholder="Ordem" defaultValue={0} style={{ ...inputStyle, width: '100px' }} />
                    </div>
                    <button type="submit" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F2F1EA', padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#141414' }}>
                      <Plus size={14} /> Cadastrar aula
                    </button>
                  </form>
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  )
}