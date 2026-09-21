'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/client'
import {
  Home,
  BookOpen,
  TrendingUp,
  Bell,
  Megaphone,
  ShieldCheck,
  KeyRound,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export default function Sidebar({
  nome,
  cargo,
  admin,
}: {
  nome: string
  cargo: string
  admin: boolean
}) {
  const [recolhida, setRecolhida] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    margin: '2px 10px',
    borderRadius: '8px',
    color: '#c9c9c0',
    textDecoration: 'none',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
  }

  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/modulos', label: 'Módulos', icon: BookOpen },
    { href: '/evolucao', label: 'Minha Evolução', icon: TrendingUp },
    { href: '/novidades', label: 'Novidades', icon: Megaphone },
    { href: '/notificacoes', label: 'Notificações', icon: Bell },
  ]

  function ativo(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <aside
      className="sidebar"
      style={{
        width: recolhida ? '72px' : '212px',
        backgroundColor: '#141414',
        color: '#F7F4EC',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        height: '100vh',
        alignSelf: 'flex-start',
        overflowY: 'auto',
        overflowX: 'hidden',
        flexShrink: 0,
        transition: 'width 0.2s ease',
      }}
    >
      <div>
        <div style={{ padding: '0 20px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="sidebar-panel" style={{ display: recolhida ? 'none' : 'block' }}>
            <strong style={{ color: '#F2C230', fontSize: '19px', fontWeight: 800 }}>VERTEX</strong>
            <div style={{ fontSize: '10px', color: '#7a7a72', letterSpacing: '2px' }}>ACADEMY</div>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setRecolhida(!recolhida)}
            style={{ background: 'none', border: 'none', color: '#7a7a72', cursor: 'pointer', padding: '4px' }}
          >
            {recolhida ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <div className="sidebar-panel" style={{ display: recolhida ? 'none' : 'block', padding: '0 20px', marginBottom: '26px' }}>
          <div style={{ fontSize: '11px', color: '#7a7a72' }}>Bem-vinda de volta</div>
          <div style={{ fontWeight: 700, fontSize: '14px' }}>{nome || 'Usuário'}</div>
          <div
            style={{
              display: 'inline-block',
              marginTop: '6px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: '#242420',
              padding: '3px 10px',
              borderRadius: '20px',
              color: '#F2C230',
            }}
          >
            {cargo}
          </div>
        </div>

        <nav>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link${ativo(href) ? ' ativo' : ''}`}
              style={{ ...linkStyle, color: ativo(href) ? '#F2C230' : linkStyle.color }}
              title={label}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              <span className="sidebar-label" style={{ display: recolhida ? 'none' : 'inline', fontSize: '14px', fontWeight: ativo(href) ? 600 : 500 }}>
                {label}
              </span>
            </Link>
          ))}
          {admin && (
            <Link
              href="/admin"
              className={`nav-link${ativo('/admin') ? ' ativo' : ''}`}
              style={{ ...linkStyle, color: '#F2C230' }}
              title="Painel Admin"
            >
              <ShieldCheck size={18} style={{ flexShrink: 0 }} />
              <span className="sidebar-label" style={{ display: recolhida ? 'none' : 'inline', fontSize: '14px', fontWeight: 600 }}>
                Painel Admin
              </span>
            </Link>
          )}
        </nav>
      </div>

      <div>
        <Link href="/trocar-senha" className={`nav-link${ativo('/trocar-senha') ? ' ativo' : ''}`} style={{ ...linkStyle, color: ativo('/trocar-senha') ? '#F2C230' : linkStyle.color }} title="Trocar Senha">
          <KeyRound size={18} style={{ flexShrink: 0 }} />
          <span className="sidebar-label" style={{ display: recolhida ? 'none' : 'inline', fontSize: '14px' }}>Trocar Senha</span>
        </Link>
        <button
          onClick={handleLogout}
          className="nav-link"
          style={{ ...linkStyle, background: 'none', border: 'none', cursor: 'pointer', width: 'calc(100% - 20px)' }}
          title="Sair"
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          <span className="sidebar-label" style={{ display: recolhida ? 'none' : 'inline', fontSize: '14px' }}>Sair</span>
        </button>
      </div>
    </aside>
  )
}
