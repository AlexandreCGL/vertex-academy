import Link from 'next/link'
import { BookOpen, ClipboardList, Megaphone, ChevronRight } from 'lucide-react'

export default function AdminPage() {
  const cardStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: '#fff',
    padding: '22px 24px',
    borderRadius: '14px',
    textDecoration: 'none',
    color: '#141414',
    marginBottom: '14px',
  }

  const iconBoxStyle = {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    backgroundColor: '#FDF3D7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }

  const cards = [
    {
      href: '/admin/modulos',
      icon: BookOpen,
      titulo: 'Módulos e Aulas',
      desc: 'Organize a estrutura dos módulos e aulas de cada trilha',
    },
    {
      href: '/admin/questionarios',
      icon: ClipboardList,
      titulo: 'Questionários',
      desc: 'Crie os questionários de aula e de módulo, com suas perguntas',
    },
    {
      href: '/admin/novidades',
      icon: Megaphone,
      titulo: 'Novidades',
      desc: 'Publique avisos para os alunos',
    },
  ]

  return (
    <div>
      <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '4px' }}>Painel Admin</h1>
      <p style={{ color: '#6B6B63', marginBottom: '28px', fontSize: '14px' }}>
        Gerencie o conteúdo da plataforma por aqui.
      </p>

      {cards.map(({ href, icon: Icon, titulo, desc }) => (
        <Link key={href} href={href} className="card card-hover" style={cardStyle}>
          <div style={iconBoxStyle}>
            <Icon size={22} color="#B8860B" />
          </div>
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '15px' }}>{titulo}</strong>
            <div style={{ fontSize: '13px', color: '#6B6B63', marginTop: '2px' }}>{desc}</div>
          </div>
          <ChevronRight size={18} color="#a3a39a" />
        </Link>
      ))}
    </div>
  )
}
