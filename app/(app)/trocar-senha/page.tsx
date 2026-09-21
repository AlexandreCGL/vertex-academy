'use client'

import { useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'

export default function TrocarSenhaPage() {
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setMensagem('')

    if (novaSenha !== confirmacao) {
      setErro('As senhas não coincidem.')
      return
    }

    if (novaSenha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: novaSenha })

    if (error) {
      setErro('Não foi possível alterar a senha. Tente novamente.')
      return
    }

    setMensagem('Senha alterada com sucesso!')
    setNovaSenha('')
    setConfirmacao('')
  }

  const inputStyle = {
    display: 'block',
    width: '100%',
    maxWidth: '360px',
    padding: '11px 12px',
    marginBottom: '14px',
    border: '1px solid #e4e0d4',
    borderRadius: '8px',
    fontSize: '14px',
  }

  const labelStyle = { fontSize: '13px', fontWeight: 600, color: '#3d3d3a', marginBottom: '6px', display: 'block' }

  return (
    <div>
      <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '24px' }}>Trocar Senha</h1>

      <form onSubmit={handleSubmit} className="card" style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '16px', maxWidth: '420px' }}>
        <label style={labelStyle}>Nova senha</label>
        <input
          type="password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          required
          className="login-input"
          style={inputStyle}
        />

        <label style={labelStyle}>Confirmar nova senha</label>
        <input
          type="password"
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          required
          className="login-input"
          style={inputStyle}
        />

        {erro && (
          <div style={{ backgroundColor: '#fdecea', color: '#c0392b', fontSize: '13px', padding: '10px 12px', borderRadius: '8px', marginBottom: '14px' }}>
            {erro}
          </div>
        )}
        {mensagem && (
          <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontSize: '13px', padding: '10px 12px', borderRadius: '8px', marginBottom: '14px' }}>
            {mensagem}
          </div>
        )}

        <button
          type="submit"
          className="btn"
          style={{ backgroundColor: '#141414', color: '#F2C230', padding: '11px 22px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
        >
          Salvar nova senha
        </button>
      </form>
    </div>
  )
}