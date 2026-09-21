import { createClient } from '@/app/lib/supabase/server'
import { CheckCircle2, Award } from 'lucide-react'

export default async function EvolucaoPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: progresso } = await supabase
    .from('progresso_aulas')
    .select('concluido_em, aulas(titulo, modulos(titulo, trilhas(nome)))')
    .eq('usuario_id', user!.id)
    .eq('concluido', true)
    .order('concluido_em', { ascending: false })

  const { data: certificados } = await supabase
    .from('certificados')
    .select('emitido_em, trilhas(nome)')
    .eq('usuario_id', user!.id)
    .order('emitido_em', { ascending: false })

  return (
    <div>
      <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '28px' }}>Minha Evolução</h1>

      <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: '#6B6B63', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Histórico de aulas concluídas
      </h2>

      {(!progresso || progresso.length === 0) && (
        <p style={{ color: '#6B6B63', marginBottom: '32px', fontSize: '14px' }}>
          Você ainda não concluiu nenhuma aula.
        </p>
      )}

      {progresso?.map((p: any, i: number) => (
        <div
          key={i}
          className="card"
          style={{
            backgroundColor: '#fff',
            padding: '14px 20px',
            borderRadius: '12px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#FDF3D7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CheckCircle2 size={18} color="#B8860B" />
            </div>
            <div>
              <strong style={{ fontSize: '14px' }}>{p.aulas?.titulo}</strong>
              <div style={{ fontSize: '13px', color: '#6B6B63' }}>
                {p.aulas?.modulos?.titulo} · {p.aulas?.modulos?.trilhas?.nome}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '13px', color: '#6B6B63', whiteSpace: 'nowrap' }}>
            {new Date(p.concluido_em).toLocaleDateString('pt-BR')}
          </span>
        </div>
      ))}

      <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '36px 0 12px', color: '#6B6B63', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Certificados
      </h2>

      {(!certificados || certificados.length === 0) && (
        <p style={{ color: '#6B6B63', fontSize: '14px' }}>Nenhum certificado emitido ainda.</p>
      )}

      {certificados?.map((c: any, i: number) => (
        <div
          key={i}
          className="card card-hover"
          style={{
            background: 'linear-gradient(135deg, #1c1c1c, #2e2e2e)',
            padding: '18px 22px',
            borderRadius: '14px',
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <strong style={{ color: '#fff', fontSize: '15px' }}>{c.trilhas?.nome}</strong>
            <div style={{ fontSize: '13px', color: '#a3a39a' }}>
              Emitido em {new Date(c.emitido_em).toLocaleDateString('pt-BR')}
            </div>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(242,194,48,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Award size={20} color="#F2C230" />
          </div>
        </div>
      ))}
    </div>
  )
}
