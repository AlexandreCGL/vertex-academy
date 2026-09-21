import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Bell } from 'lucide-react'

export default async function NotificacoesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: notificacoes } = await supabase
    .from('notificacoes')
    .select('id, titulo, mensagem, lida, created_at')
    .eq('usuario_id', user!.id)
    .order('created_at', { ascending: false })

  async function marcarComoLida(formData: FormData) {
    'use server'
    const supabase = await createClient()
    await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('id', formData.get('id') as string)
    revalidatePath('/notificacoes')
  }

  return (
    <div>
      <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '24px' }}>Notificações</h1>

      {(!notificacoes || notificacoes.length === 0) && (
        <p style={{ color: '#6B6B63', fontSize: '14px' }}>Nenhuma notificação por enquanto.</p>
      )}

      {notificacoes?.map((n) => (
        <div
          key={n.id}
          className="card"
          style={{
            backgroundColor: n.lida ? '#fff' : '#FFFBEF',
            padding: '16px 20px',
            borderRadius: '12px',
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            borderLeft: n.lida ? 'none' : '3px solid #F2C230',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '9px',
                backgroundColor: n.lida ? '#F2F1EA' : '#FDF3D7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bell size={16} color={n.lida ? '#6B6B63' : '#B8860B'} />
            </div>
            <div>
              <strong style={{ fontSize: '14px' }}>{n.titulo}</strong>
              <div style={{ fontSize: '13px', color: '#6B6B63' }}>{n.mensagem}</div>
              <div style={{ fontSize: '12px', color: '#a3a3a3', marginTop: '4px' }}>
                {new Date(n.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>

          {!n.lida && (
            <form action={marcarComoLida}>
              <input type="hidden" name="id" value={n.id} />
              <button
                type="submit"
                className="btn"
                style={{ color: '#141414', background: '#fff', border: '1px solid #e4e0d4', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}
              >
                Marcar como lida
              </button>
            </form>
          )}
        </div>
      ))}
    </div>
  )
}
