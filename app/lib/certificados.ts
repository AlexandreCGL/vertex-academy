import { SupabaseClient } from '@supabase/supabase-js'

export async function verificarEEmitirCertificados(
  supabase: SupabaseClient,
  admin: SupabaseClient,
  usuarioId: string
) {
  const { data: modulos } = await supabase.from('modulos').select('id, trilha_id, aulas(id)')

  if (!modulos || modulos.length === 0) return

  const { data: questionarios } = await supabase
    .from('questionarios')
    .select('id, tipo, modulo_id, aula_id')

  const { data: aprovados } = await supabase
    .from('resultados_questionario')
    .select('questionario_id')
    .eq('usuario_id', usuarioId)
    .eq('aprovado', true)

  const { data: concluidas } = await supabase
    .from('progresso_aulas')
    .select('aula_id')
    .eq('usuario_id', usuarioId)
    .eq('concluido', true)

  const { data: certificadosExistentes } = await supabase
    .from('certificados')
    .select('trilha_id')
    .eq('usuario_id', usuarioId)

  const aprovadosSet = new Set(aprovados?.map((a: any) => a.questionario_id))
  const concluidasSet = new Set(concluidas?.map((c: any) => c.aula_id))
  const certificadasSet = new Set(certificadosExistentes?.map((c: any) => c.trilha_id))

  const moduloTrilhaMap = new Map<string, string>()
  const aulaModuloMap = new Map<string, string>()
  modulos.forEach((m: any) => {
    moduloTrilhaMap.set(m.id, m.trilha_id)
    m.aulas.forEach((a: any) => aulaModuloMap.set(a.id, m.id))
  })

  function trilhaIdDoQuestionario(q: any): string | undefined {
    if (q.tipo === 'modulo') return moduloTrilhaMap.get(q.modulo_id)
    const moduloId = aulaModuloMap.get(q.aula_id)
    return moduloId ? moduloTrilhaMap.get(moduloId) : undefined
  }

  const trilhaIds = new Set(modulos.map((m: any) => m.trilha_id as string))

  for (const trilhaId of trilhaIds) {
    if (certificadasSet.has(trilhaId)) continue

    const modulosDaTrilha = modulos.filter((m: any) => m.trilha_id === trilhaId)
    const totalAulas = modulosDaTrilha.reduce((acc: number, m: any) => acc + m.aulas.length, 0)
    const aulasConcluidas = modulosDaTrilha.reduce(
      (acc: number, m: any) => acc + m.aulas.filter((a: any) => concluidasSet.has(a.id)).length,
      0
    )
    const trilhaCompleta = totalAulas > 0 && aulasConcluidas === totalAulas
    if (!trilhaCompleta) continue

    const temQuestionarioPendente = questionarios?.some(
      (q: any) => trilhaIdDoQuestionario(q) === trilhaId && !aprovadosSet.has(q.id)
    )
    if (temQuestionarioPendente) continue

    await admin.from('certificados').insert({ usuario_id: usuarioId, trilha_id: trilhaId })
  }
}
