import { createClient } from '@/app/lib/supabase/server'
import { createAdminClient } from '@/app/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { verificarEEmitirCertificados } from '@/app/lib/certificados'
import { ArrowLeft } from 'lucide-react'

export default async function QuestionarioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: questionario } = await supabase
    .from('questionarios')
    .select('id, titulo, nota_minima, perguntas(id, enunciado, alternativas, ordem)')
    .eq('id', id)
    .single()

  if (!questionario) {
    redirect('/modulos')
  }

  async function responder(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const admin = createAdminClient()

    const { data: questionarioCorrecao } = await admin
      .from('questionarios')
      .select('id, nota_minima, perguntas(id, resposta_correta)')
      .eq('id', id)
      .single()

    if (!questionarioCorrecao) {
      redirect('/modulos')
    }

    const totalPerguntas = questionarioCorrecao.perguntas.length
    const acertos = questionarioCorrecao.perguntas.reduce((acc: number, p: any) => {
      const resposta = formData.get(`resposta_${p.id}`)
      return resposta !== null && Number(resposta) === p.resposta_correta ? acc + 1 : acc
    }, 0)

    const nota = totalPerguntas > 0 ? Math.round((acertos / totalPerguntas) * 100) : 0
    const aprovado = nota >= questionarioCorrecao.nota_minima

    await admin.from('resultados_questionario').insert({
      usuario_id: user!.id,
      questionario_id: id,
      nota,
      aprovado,
      respondido_em: new Date().toISOString(),
    })

    if (aprovado) {
      await verificarEEmitirCertificados(supabase, admin, user!.id)
    }

    redirect(`/questionario/${id}/resultado`)
  }

  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
  }

  return (
    <div>
      <Link href="/modulos" className="link-sutil" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B6B63', textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Voltar para Módulos
      </Link>

      <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '10px 0 4px' }}>{questionario.titulo}</h1>
      <p style={{ color: '#6B6B63', marginBottom: '24px', fontSize: '13px' }}>
        Nota mínima para aprovação: {questionario.nota_minima}%
      </p>

      <form action={responder}>
        {questionario.perguntas
          .sort((a: any, b: any) => a.ordem - b.ordem)
          .map((pergunta: any, idx: number) => (
            <div
              key={pergunta.id}
              className="card"
              style={{
                backgroundColor: '#fff',
                padding: '22px',
                borderRadius: '14px',
                marginBottom: '16px',
              }}
            >
              <strong style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '16px', fontSize: '15px' }}>
                <span
                  style={{
                    flexShrink: 0,
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#141414',
                    color: '#F2C230',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {idx + 1}
                </span>
                {pergunta.enunciado}
              </strong>

              {pergunta.alternativas.map((alt: string, altIdx: number) => (
                <label
                  key={altIdx}
                  className="radio-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    marginBottom: '8px',
                    border: '1px solid #eeece3',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  <input type="radio" name={`resposta_${pergunta.id}`} value={altIdx} required />
                  {alt}
                </label>
              ))}
            </div>
          ))}

        <button
          type="submit"
          className="btn"
          style={{
            backgroundColor: '#141414',
            color: '#F2C230',
            padding: '12px 26px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 600,
          }}
        >
          Enviar respostas
        </button>
      </form>
    </div>
  )
}
