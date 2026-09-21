import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle } from 'lucide-react'

export default async function ResultadoQuestionarioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: questionario } = await supabase
    .from('questionarios')
    .select('id, titulo, tipo, aula_id, modulo_id')
    .eq('id', id)
    .single()

  if (!questionario) {
    redirect('/modulos')
  }

  const { data: resultado } = await supabase
    .from('resultados_questionario')
    .select('nota, aprovado, respondido_em')
    .eq('usuario_id', user!.id)
    .eq('questionario_id', id)
    .order('respondido_em', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!resultado) {
    redirect(`/questionario/${id}`)
  }

  let voltarHref = '/modulos'
  if (questionario.tipo === 'modulo' && questionario.modulo_id) {
    voltarHref = `/modulos/${questionario.modulo_id}`
  } else if (questionario.tipo === 'aula' && questionario.aula_id) {
    const { data: aula } = await supabase
      .from('aulas')
      .select('modulo_id')
      .eq('id', questionario.aula_id)
      .single()
    if (aula) {
      voltarHref = `/modulos/${aula.modulo_id}/${questionario.aula_id}`
    }
  }

  return (
    <div>
      <div
        className="card"
        style={{
          backgroundColor: '#fff',
          padding: '36px 32px',
          borderRadius: '18px',
          textAlign: 'center',
          maxWidth: '420px',
          margin: '40px auto 0',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: resultado.aprovado ? '#FDF3D7' : '#FBEAE8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          {resultado.aprovado ? (
            <CheckCircle2 size={32} color="#B8860B" />
          ) : (
            <XCircle size={32} color="#c0392b" />
          )}
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
          {resultado.aprovado ? 'Aprovado!' : 'Não foi essa vez'}
        </h1>

        <p style={{ color: '#6B6B63', marginBottom: '24px' }}>
          {questionario.titulo} · nota {resultado.nota}%
        </p>

        {!resultado.aprovado && (
          <p style={{ color: '#6B6B63', fontSize: '13px', marginBottom: '24px' }}>
            Você pode continuar avançando nos próximos módulos, mas vai precisar ser aprovado
            aqui antes de receber o certificado no final da trilha.
          </p>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Link
            href={`/questionario/${id}`}
            className="btn"
            style={{
              backgroundColor: '#F7F4EC',
              color: '#141414',
              padding: '11px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Tentar novamente
          </Link>
          <Link
            href={voltarHref}
            className="btn"
            style={{
              backgroundColor: '#141414',
              color: '#F2C230',
              padding: '11px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Continuar
          </Link>
        </div>
      </div>
    </div>
  )
}
