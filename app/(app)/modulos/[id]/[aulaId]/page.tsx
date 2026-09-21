import { createClient } from '@/app/lib/supabase/server'
import { createAdminClient } from '@/app/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { verificarEEmitirCertificados } from '@/app/lib/certificados'
import { ArrowLeft, CheckCircle2, ClipboardList } from 'lucide-react'

function getYoutubeEmbedUrl(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  const videoId = match ? match[1] : ''
  return `https://www.youtube.com/embed/${videoId}`
}

export default async function AulaPage({
  params,
}: {
  params: Promise<{ id: string; aulaId: string }>
}) {
  const { id, aulaId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: aula } = await supabase
    .from('aulas')
    .select('id, titulo, youtube_url, duracao_min, modulos(titulo)')
    .eq('id', aulaId)
    .single()

  if (!aula) {
    redirect(`/modulos/${id}`)
  }

  const { data: questionario } = await supabase
    .from('questionarios')
    .select('id')
    .eq('aula_id', aulaId)
    .eq('tipo', 'aula')
    .maybeSingle()

  const { data: progresso } = await supabase
    .from('progresso_aulas')
    .select('concluido')
    .eq('usuario_id', user!.id)
    .eq('aula_id', aulaId)
    .maybeSingle()

  const jaConcluida = progresso?.concluido || false

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

  async function marcarConcluida() {
    'use server'
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const admin = createAdminClient()

    await admin.from('progresso_aulas').upsert(
      {
        usuario_id: user!.id,
        aula_id: aulaId,
        concluido: true,
        concluido_em: new Date().toISOString(),
      },
      { onConflict: 'usuario_id,aula_id' }
    )

    await verificarEEmitirCertificados(supabase, admin, user!.id)

    revalidatePath(`/modulos/${id}`)
    revalidatePath(`/modulos/${id}/${aulaId}`)
    revalidatePath('/')
  }

  return (
    <div>
      <Link href={`/modulos/${id}`} className="link-sutil" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B6B63', textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Voltar para {(aula.modulos as any)?.titulo}
      </Link>

      <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '10px 0 16px' }}>{aula.titulo}</h1>

      <div
        className="card"
        style={{ position: 'relative', paddingBottom: '56.25%', height: 0, marginBottom: '20px', borderRadius: '14px', overflow: 'hidden' }}
      >
        <iframe
          src={getYoutubeEmbedUrl(aula.youtube_url)}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          allowFullScreen
        />
      </div>

      {jaConcluida ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#B8860B', fontWeight: 700, fontSize: '14px' }}>
          <CheckCircle2 size={18} /> Aula concluída
        </span>
      ) : (
        <form action={marcarConcluida}>
          <button
            type="submit"
            className="btn"
            style={{
              backgroundColor: '#141414',
              color: '#F2C230',
              padding: '11px 22px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            Marcar como concluída
          </button>
        </form>
      )}

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
            <ClipboardList size={18} color="#F2C230" /> Questionário desta aula
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
