import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Trophy, DollarSign, Calendar, MapPin, Key, Settings } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useGroupContext } from '../../contexts/GroupContext'
import toast from 'react-hot-toast'
import { formatPixKey } from '../../lib/pix'

export default function GroupCreate() {
  const { user } = useAuth()
  const { refreshActiveGroup } = useGroupContext()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [pixKeyType, setPixKeyType] = useState<'cpf' | 'cnpj' | 'phone' | 'email' | 'random'>('phone')

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    pool_entry_fee: 20,
    event_date: '',
    event_location: '',
    pix_key: '',
    scoring_exact: true,
    scoring_winner: true,
    points_exact: 3,
    points_winner: 1,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked
      : type === 'number' ? Number(value)
      : value
    setForm(f => ({ ...f, [name]: val }))
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 40)
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    setForm(f => ({
      ...f,
      name,
      slug: generateSlug(name),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!form.slug) { toast.error('Slug inválido'); return }

    setLoading(true)
    try {
      const { error } = await supabase.from('groups').insert({
        organizer_id: user.id,
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        pool_entry_fee: form.pool_entry_fee,
        event_date: form.event_date || null,
        event_location: form.event_location || null,
        pix_key: form.pix_key ? formatPixKey(form.pix_key, pixKeyType) : null,
        scoring_exact: form.scoring_exact,
        scoring_winner: form.scoring_winner,
        points_exact: form.points_exact,
        points_winner: form.points_winner,
        is_active: true,
      }).select().single()

      if (error) {
        if (error.code === '23505') {
          toast.error('Esse slug já está em uso. Tente outro.')
        } else {
          toast.error('Erro ao criar evento: ' + error.message)
        }
      } else {
        toast.success('Evento criado com sucesso! 🎉')
        await refreshActiveGroup(true)
        navigate('/dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-dashboard" style={{ padding: '1.5rem', maxWidth: 700 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Informações do Evento */}
          <section className="card" style={{ padding: '1.25rem' }}>
            <h2 className="flex items-center gap-2 mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
              <Trophy size={18} style={{ color: 'var(--color-verde)' }} />
              INFORMAÇÕES DO EVENTO
            </h2>

            <div className="input-group">
              <label className="input-label" htmlFor="name">Nome do Evento *</label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder="Ex: Copa da Galera 2026"
                value={form.name}
                onChange={handleNameChange}
                required
                maxLength={60}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="slug">
                Link Público *
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-display)',
                }}>
                  bolaonochurras.com/
                </span>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  className="input"
                  style={{ paddingLeft: '11.5rem' }}
                  placeholder="copa-da-galera"
                  value={form.slug}
                  onChange={handleChange}
                  required
                  pattern="[a-z0-9-]+"
                  maxLength={40}
                />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.3rem' }}>
                Apenas letras minúsculas, números e hífens. Este é o link que você vai compartilhar no WhatsApp.
              </p>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="description">Descrição (opcional)</label>
              <textarea
                id="description"
                name="description"
                className="input"
                style={{ minHeight: 80, resize: 'vertical' }}
                placeholder="Descreva o bolão, regras, data do churrasco..."
                value={form.description}
                onChange={handleChange}
                maxLength={300}
              />
            </div>
          </section>

          {/* Evento / Churrasco */}
          <section className="card" style={{ padding: '1.25rem' }}>
            <h2 className="flex items-center gap-2 mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
              <Calendar size={18} style={{ color: 'var(--color-amarelo)' }} />
              EVENTO (CHURRASCO)
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="event_date">Data do Evento</label>
                <input
                  id="event_date"
                  name="event_date"
                  type="datetime-local"
                  className="input"
                  value={form.event_date}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="event_location">Local</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="event_location"
                    name="event_location"
                    type="text"
                    className="input"
                    style={{ paddingLeft: '2.2rem' }}
                    placeholder="Casa do João"
                    value={form.event_location}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Financeiro */}
          <section className="card" style={{ padding: '1.25rem' }}>
            <h2 className="flex items-center gap-2 mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
              <DollarSign size={18} style={{ color: 'var(--color-verde)' }} />
              FINANCEIRO
            </h2>

            <div className="input-group">
              <label className="input-label" htmlFor="pool_entry_fee">Valor por Pessoa (R$)</label>
              <input
                id="pool_entry_fee"
                name="pool_entry_fee"
                type="number"
                className="input"
                min={0}
                step={1}
                value={form.pool_entry_fee}
                onChange={handleChange}
              />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.3rem' }}>
                Coloque 0 se for bolão sem taxa de entrada
              </p>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="pix_key_type">Tipo de Chave PIX</label>
              <select
                id="pix_key_type"
                className="input"
                value={pixKeyType}
                onChange={(e) => setPixKeyType(e.target.value as any)}
                style={{ marginBottom: '1rem' }}
              >
                <option value="phone">Celular (Telefone)</option>
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="email">E-mail</option>
                <option value="random">Chave Aleatória (EVP)</option>
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="pix_key">Chave PIX *</label>
              <div style={{ position: 'relative' }}>
                <Key size={16} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="pix_key"
                  name="pix_key"
                  type="text"
                  className="input"
                  style={{ paddingLeft: '2.2rem' }}
                  placeholder={
                    pixKeyType === 'phone' ? 'Ex: (73) 98190-6662' :
                    pixKeyType === 'cpf' ? 'Ex: 123.456.789-00' :
                    pixKeyType === 'cnpj' ? 'Ex: 12.345.678/0001-00' :
                    pixKeyType === 'email' ? 'Ex: seu-email@dominio.com' :
                    'Ex: 123e4567-e89b-12d3-a456-426614174000'
                  }
                  value={form.pix_key}
                  onChange={handleChange}
                  required={form.pool_entry_fee > 0}
                />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.3rem' }}>
                {pixKeyType === 'phone' && 'A chave de celular será formatada automaticamente no padrão internacional (+55).'}
                {pixKeyType === 'cpf' && 'Apenas os números do CPF serão salvos.'}
                {pixKeyType === 'cnpj' && 'Apenas os números do CNPJ serão salvos.'}
                {pixKeyType === 'email' && 'O e-mail será salvo em letras minúsculas.'}
                {pixKeyType === 'random' && 'Insira a chave aleatória completa incluindo os traços.'}
              </p>
            </div>
          </section>

          {/* Pontuação */}
          <section className="card" style={{ padding: '1.25rem' }}>
            <h2 className="flex items-center gap-2 mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
              <Settings size={18} style={{ color: 'var(--color-azul-light)' }} />
              SISTEMA DE PONTUAÇÃO
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label className="flex items-center gap-3 cursor-pointer" style={{
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                border: form.scoring_exact ? '1px solid var(--border-accent)' : '1px solid var(--border-default)',
              }}>
                <input
                  type="checkbox"
                  name="scoring_exact"
                  checked={form.scoring_exact}
                  onChange={handleChange}
                  style={{ width: 18, height: 18, accentColor: 'var(--color-verde)' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Placar Exato</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Acertou o placar exato</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="points_exact"
                    className="input"
                    style={{ width: 60, padding: '0.4rem', textAlign: 'center' }}
                    min={1}
                    max={10}
                    value={form.points_exact}
                    onChange={handleChange}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>pts</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer" style={{
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                border: form.scoring_winner ? '1px solid var(--border-accent)' : '1px solid var(--border-default)',
              }}>
                <input
                  type="checkbox"
                  name="scoring_winner"
                  checked={form.scoring_winner}
                  onChange={handleChange}
                  style={{ width: 18, height: 18, accentColor: 'var(--color-verde)' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Vencedor Correto</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Acertou quem venceu / empate</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="points_winner"
                    className="input"
                    style={{ width: 60, padding: '0.4rem', textAlign: 'center' }}
                    min={1}
                    max={5}
                    value={form.points_winner}
                    onChange={handleChange}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>pts</span>
                </div>
              </label>
            </div>
          </section>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? (
              <>
                <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                Criando evento...
              </>
            ) : (
              <>
                <Save size={20} />
                Criar Evento e Gerar Link
              </>
            )}
          </button>
        </form>
      </div>
  )
}
