import { createClient } from '@/app/lib/supabase/server'
import Link from 'next/link'
import { CheckCircle2, Percent, GraduationCap } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from('perfis')
    .select('nome, cargo')
    .eq('id', user!.id)
    .single()

  const { data: trilhas } = await supabase
    .from('trilhas')
    .select('id, nome, modulos(id, titulo, ordem, aulas(id, duracao_min))')
    .order('nome')

  const { data: progresso } = await supabase
    .from('progresso_aulas')
    .select('aula_id')
    .eq('usuario_id', user!.id)
    .eq('concluido', true)

  const concluidasSet = new Set(progresso?.map((p) => p.aula_id))

  const totalModulos = trilhas?.reduce((acc, t: any) => acc + t.modulos.length, 0) || 0
  const totalConcluidos =
    trilhas?.reduce((acc, t: any) => {
      const concluidosDaTrilha = t.modulos.filter((modulo: any) => {
        const totalAulas = modulo.aulas.length
        const aulasConcluidas = modulo.aulas.filter((a: any) => concluidasSet.has(a.id)).length
        return totalAulas > 0 && aulasConcluidas === totalAulas
      }).length
      return acc + concluidosDaTrilha
    }, 0) || 0
  const percentual = totalModulos > 0 ? Math.round((totalConcluidos / totalModulos) * 100) : 0

  const statCardStyle = {
    backgroundColor: '#fff',
    borderRadius: '14px',
    padding: '20px',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  }

  const statIconStyle = {
    width: '42px',
    height: '42px',
    borderRadius: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
        Olá, {perfil?.nome || 'aluno'}
      </h1>
      <p style={{ color: '#6B6B63', marginBottom: '28px' }}>
        Aqui está o panorama da sua trilha como {perfil?.cargo || 'Aluno'} esta semana.
      </p>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <div className="card" style={statCardStyle}>
          <div style={{ ...statIconStyle, backgroundColor: '#FDF3D7' }}>
            <Percent size={20} color="#B8860B" />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#141414', lineHeight: 1.1 }}>
              {percentual}%
            </div>
            <div style={{ fontSize: '13px', color: '#6B6B63' }}>concluído</div>
          </div>
        </div>

        <div className="card" style={statCardStyle}>
          <div style={{ ...statIconStyle, backgroundColor: '#EFEEE8' }}>
            <GraduationCap size={20} color="#141414" />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, lineHeight: 1.1 }}>
              {totalConcluidos}/{totalModulos}
            </div>
            <div style={{ fontSize: '13px', color: '#6B6B63' }}>módulos da trilha</div>
          </div>
        </div>
      </div>

      {trilhas?.map((trilha: any) => (
        <div key={trilha.id} style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '14px' }}>{trilha.nome}</h2>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {trilha.modulos
              .sort((a: any, b: any) => a.ordem - b.ordem)
              .map((modulo: any) => {
                const totalAulas = modulo.aulas.length
                const aulasConcluidas = modulo.aulas.filter((a: any) => concluidasSet.has(a.id)).length
                const concluido = totalAulas > 0 && aulasConcluidas === totalAulas
                const duracaoTotal = modulo.aulas.reduce((acc: number, a: any) => acc + (a.duracao_min || 0), 0)

                return (
                  <Link
                    key={modulo.id}
                    href={`/modulos/${modulo.id}`}
                    className="card-hover"
                    style={{ textDecoration: 'none', color: 'inherit', width: '100%', maxWidth: '260px', borderRadius: '14px' }}
                  >
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #1c1c1c, #2e2e2e)',
                        borderRadius: '14px',
                        aspectRatio: '16 / 9',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: '#F2C230',
                          color: '#141414',
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: '20px',
                          alignSelf: 'flex-start',
                        }}
                      >
                        {trilha.nome.toUpperCase()}
                      </span>

                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px', lineHeight: 1.25 }}>
                        {modulo.titulo}
                      </span>

                      {concluido && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            backgroundColor: '#F2C230',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CheckCircle2 size={16} color="#141414" fill="#F2C230" />
                        </span>
                      )}
                    </div>

                    <div style={{ marginTop: '10px', fontSize: '13px', color: '#6B6B63' }}>
                      {duracaoTotal} min · {concluido ? 'Concluído' : 'Assistir'}
                    </div>
                  </Link>
                )
              })}
          </div>
        </div>
      ))}
    </div>
  )
}
