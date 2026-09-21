import { createClient } from '@/app/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PlayCircle, CheckCircle2, ClipboardList, ArrowLeft } from 'lucide-react'

export default async function ModuloPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: modulo } = await supabase
    .from('modulos')
    .select('id, titulo, aulas(id, titulo, ordem, duracao_min)')
    .eq('id', id)
    .single()

  if (!modulo) {
    redirect('/modulos')
  }

  const { data: questionario } = await supabase
    .from('questionarios')
    .select('id')
    .eq('modulo_id', id)
    .eq('tipo', 'modulo')
    .maybeSingle()

  const { data: progresso } = await supabase
    .from('progresso_aulas')
    .select('aula_id')
    .eq('usuario_id', user!.id)
    .eq('concluido', true)

  const concluidasSet = new Set(progresso?.map((p) => p.aula_id))

  let resultadoQuiz = null
  if (questionario) {
    const { data } = await supabase
      .from('resultados_questionario')
      .select('nota, aprovado')
      .eq('usuario_id', user!.id)
      .eq('questionario_id', questionario.id)
      .order('respondido_em', { ascending: false })
      .maybeSingle()
    resultadoQuiz = data
  }

  return (
    <div>
      <Link href="/modulos" className="link-sutil" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B6B63', textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Voltar para Módulos
      </Link>

      <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '10px 0 24px' }}>{modulo.titulo}</h1>

      {modulo.aulas
        ?.sort((a: any, b: any) => a.ordem - b.ordem)
        .map((aula: any) => {
          const concluida = concluidasSet.has(aula.id)
          return (
            <Link
              key={aula.id}
              href={`/modulos/${id}/${aula.id}`}
              className="card card-hover"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#fff',
                padding: '14px 20px',
                borderRadius: '12px',
                marginBottom: '10px',
                textDecoration: 'none',
                color: '#141414',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: concluida ? '#FDF3D7' : '#F2F1EA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <PlayCircle size={19} color={concluida ? '#B8860B' : '#6B6B63'} />
                </div>
                <div>
                  <strong style={{ fontSize: '14px' }}>{aula.titulo}</strong>
                  <div style={{ fontSize: '13px', color: '#6B6B63' }}>{aula.duracao_min} min</div>
                </div>
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: concluida ? '#B8860B' : '#a3a39a' }}>
                {concluida && <CheckCircle2 size={16} />}
                {concluida ? 'Assistido' : 'Assistir'}
              </span>
            </Link>
          )
        })}

      {questionario && (
        <Link
          href={`/questionario/${questionario.id}`}
          className="card card-hover"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#141414',
            padding: '16px 20px',
            borderRadius: '12px',
            marginTop: '20px',
            textDecoration: 'none',
            color: '#F7F4EC',
          }}
        >
          <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <ClipboardList size={18} color="#F2C230" /> Questionário deste módulo
          </strong>
          <span style={{ fontSize: '13px', fontWeight: 600, color: resultadoQuiz?.aprovado ? '#F2C230' : '#F7F4EC' }}>
            {resultadoQuiz
              ? resultadoQuiz.aprovado
                ? `✓ Aprovado (${resultadoQuiz.nota}%)`
                : `Pendente — última nota: ${resultadoQuiz.nota}%`
              : 'Responder'}
          </span>
        </Link>
      )}
    </div>
  )
}
