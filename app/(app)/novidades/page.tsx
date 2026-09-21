import { createClient } from '@/app/lib/supabase/server'
import { Megaphone } from 'lucide-react'

export default async function NovidadesPage() {
  const supabase = await createClient()

  const { data: novidades } = await supabase
    .from('novidades')
    .select('id, titulo, conteudo, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '24px' }}>Novidades</h1>

      {(!novidades || novidades.length === 0) && (
        <p style={{ color: '#6B6B63', fontSize: '14px' }}>Nenhuma novidade publicada ainda.</p>
      )}

      {novidades?.map((n) => (
        <div
          key={n.id}
          className="card"
          style={{
            backgroundColor: '#fff',
            padding: '22px',
            borderRadius: '14px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
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
              <Megaphone size={17} color="#B8860B" />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{n.titulo}</h2>
              <div style={{ fontSize: '12px', color: '#6B6B63' }}>
                {new Date(n.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
          <p style={{ color: '#3d3d3a', whiteSpace: 'pre-wrap', margin: 0, fontSize: '14px', lineHeight: 1.6 }}>{n.conteudo}</p>
        </div>
      ))}
    </div>
  )
}