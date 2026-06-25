import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Terms() {
  return (
    <div className="min-h-screen p-6 pb-24 md:p-12" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8" style={{ color: 'var(--color-verde)', fontWeight: 600 }}>
          <ArrowLeft size={20} /> Voltar para o início
        </Link>
        <div className="card p-8 md:p-12">
          <h1 className="text-3xl font-black mb-6" style={{ fontFamily: 'var(--font-display)' }}>Termos de Uso</h1>
          <div className="space-y-6 text-sm text-gray-300">
            <p><strong>1. Aceitação</strong><br /> Ao utilizar o Bolão & Churras, você concorda com estes termos. Se não concordar, não utilize o serviço.</p>
            <p><strong>2. O Serviço</strong><br /> Fornecemos uma ferramenta para organizar bolões e churrascos. Não somos uma instituição financeira nem casa de apostas. Todo o dinheiro circula entre os próprios usuários via PIX pessoal.</p>
            <p><strong>3. Taxas da Plataforma</strong><br /> O uso do sistema está sujeito à cobrança de uma taxa de serviço fixa de R$ 1,50 por participante, a ser repassada pelo organizador ao final do evento para liberação das funcionalidades.</p>
            <p><strong>4. Responsabilidades</strong><br /> O Organizador é o único responsável por arrecadar, guardar e distribuir o dinheiro do prêmio. A Plataforma isenta-se de qualquer responsabilidade sobre calotes, disputas ou má gestão financeira do Organizador.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
