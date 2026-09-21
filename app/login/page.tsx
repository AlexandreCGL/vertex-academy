'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/app/lib/supabase/client'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    setCarregando(false)

    if (error) {
      setErro('E-mail ou senha incorretos.')
      return
    }

    router.push('/')
    router.refresh()
  }

  const inputWrapperStyle = {
    position: 'relative' as const,
    marginBottom: '16px',
  }

  const iconStyle = {
    position: 'absolute' as const,
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#a3a39a',
    pointerEvents: 'none' as const,
  }

  const inputStyle = {
    width: '100%',
    padding: '13px 14px 13px 42px',
    fontSize: '14px',
    border: '1px solid #e4e0d4',
    borderRadius: '8px',
    backgroundColor: '#F7F4EC',
    color: '#141414',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div
        className="login-hero"
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #141414, #262620)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '64px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(242,194,48,0.12), transparent 70%)',
            top: '-120px',
            right: '-120px',
          }}
        />

        <Image
          src="/vertex-mark.png"
          alt="Vertex Academy"
          width={294}
          height={277}
          style={{ width: '72px', height: 'auto', marginBottom: '20px' }}
          priority
        />

        <strong style={{ color: '#F2C230', fontSize: '32px', letterSpacing: '1px' }}>VERTEX</strong>
        <div style={{ color: '#F7F4EC', fontSize: '14px', letterSpacing: '4px', marginBottom: '24px' }}>
          ACADEMY
        </div>

        <p style={{ color: '#c9c9c0', fontSize: '15px', lineHeight: 1.6, maxWidth: '360px' }}>
          Sua trilha de treinamento corporativo, com vídeo-aulas, questionários
          e acompanhamento da sua evolução em um só lugar.
        </p>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: '#F7F4EC',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '360px',
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '36px 32px',
            boxShadow: '0 12px 32px rgba(20, 20, 20, 0.08)',
          }}
        >
          <h1 style={{ fontSize: '22px', marginBottom: '4px', color: '#141414' }}>Bem-vindo(a) de volta</h1>
          <p style={{ fontSize: '13px', color: '#6B6B63', marginBottom: '28px' }}>
            Entre com seus dados pra continuar sua trilha.
          </p>

          <form onSubmit={handleLogin}>
            <div style={inputWrapperStyle}>
              <Mail size={17} style={iconStyle} />
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
                style={inputStyle}
              />
            </div>

            <div style={inputWrapperStyle}>
              <Lock size={17} style={iconStyle} />
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="login-input"
                style={{ ...inputStyle, paddingRight: '42px' }}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#a3a39a',
                  padding: '4px',
                  display: 'flex',
                }}
                tabIndex={-1}
              >
                {mostrarSenha ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {erro && (
              <div
                style={{
                  backgroundColor: '#fdecea',
                  color: '#c0392b',
                  fontSize: '13px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}
              >
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="login-button"
              style={{
                width: '100%',
                padding: '13px',
                backgroundColor: '#141414',
                color: '#F2C230',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: carregando ? 'default' : 'pointer',
                opacity: carregando ? 0.7 : 1,
              }}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
