import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from('perfis')
    .select('admin')
    .eq('id', user!.id)
    .single()

  if (!perfil?.admin) {
    redirect('/')
  }

  return <>{children}</>
}
