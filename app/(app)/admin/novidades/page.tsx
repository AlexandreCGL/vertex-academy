import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Megaphone, Plus } from 'lucide-react'

export default async function AdminNovidadesPage() {
  const supabase = await createClient()

  const { data: novidades } = await supabase
    .from('novidades')
    .select('id, titulo, conteudo, created_at')
    .order('created_at', { ascending: false })

  async function criarNovidade(formData: FormData) {
    'use server'
    const supabase = await createClient()
    await supabase.from('novidades').insert({
      titulo: formData.get('titulo') as string,
      conteudo: formData.get('conteudo') as string,
    })
    revalidatePath('/admin/novidades')
    revalidatePath('/novidades')
  }

  async function excluirNovidade(formData: FormData) {
    'use server'
    const supabase = await createClient()
    await supabase.from('novidades').delete().eq('id', formData.get('id') as string)
    revalidatePath('/admin/novidades')
    revalidatePath('/novidades')
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
      <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '24px' }}>Novidades</h1>

      <div className="card" style={{ backgroundColor: '#fff', padding: '22px', borderRadius: '14px', marginBottom: '32px', maxWidth: '520px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Publicar novidade</h2>

        <form action={criarNovidade}>
          <label>Título</label>
          <input type="text" name="titulo" required style={inputStyle} />

          <label>Conteúdo</label>
          <textarea name="conteudo" required rows={4} style={{ ...inputStyle, resize: 'vertical' as const }} />

          <button type="submit" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#141414', color: '#F2C230', padding: '9px 18px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
            <Plus size={15} /> Publicar
          </button>
        </form>
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#6B6B63', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Novidades publicadas
      </h2>

      {(!novidades || novidades.length === 0) && (
        <p style={{ color: '#6B6B63', fontSize: '14px' }}>Nenhuma novidade publicada ainda.</p>
      )}

      {novidades?.map((n) => (
        <div key={n.id} className="card" style={{ backgroundColor: '#fff', padding: '22px', borderRadius: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '9px',
                  backgroundColor: '#FDF3D7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Megaphone size={16} color="#B8860B" />
              </div>
              <div>
                <strong style={{ fontSize: '15px' }}>{n.titulo}</strong>
                <div style={{ fontSize: '12px', color: '#6B6B63' }}>
                  {new Date(n.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
            <form action={excluirNovidade}>
              <input type="hidden" name="id" value={n.id} />
              <button type="submit" style={{ color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                Excluir
              </button>
            </form>
          </div>
          <p style={{ color: '#3d3d3a', whiteSpace: 'pre-wrap', margin: 0, fontSize: '14px', lineHeight: 1.6 }}>{n.conteudo}</p>
        </div>
      ))}
    </div>
  )
}
