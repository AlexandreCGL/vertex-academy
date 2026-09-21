import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import Sidebar from './sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: perfil } = await supabase
    .from('perfis')
    .select('nome, cargo, admin')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar nome={perfil?.nome || ''} cargo={perfil?.cargo || 'Aluno'} admin={perfil?.admin || false} />
      <main className="app-main" style={{ flex: 1, padding: '32px' }}>{children}</main>
    </div>
  )
}