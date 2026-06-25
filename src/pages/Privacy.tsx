import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div className="min-h-screen p-6 pb-24 md:p-12" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8" style={{ color: 'var(--color-verde)', fontWeight: 600 }}>
          <ArrowLeft size={20} /> Voltar para o início
        </Link>
        <div className="card p-8 md:p-12">
          <h1 className="text-3xl font-black mb-6" style={{ fontFamily: 'var(--font-display)' }}>Política de Privacidade</h1>
          <div className="space-y-6 text-sm text-gray-300">
            <p><strong>1. Introdução</strong><br /> A sua privacidade é importante para nós. Esta política explica como coletamos, usamos e protegemos suas informações ao utilizar o Bolão & Churras.</p>
            <p><strong>2. Coleta de Dados</strong><br /> Coletamos informações como nome, e-mail, telefone (WhatsApp) e dados de pagamentos apenas para o funcionamento da plataforma.</p>
            <p><strong>3. Uso dos Dados</strong><br /> Seus dados são usados exclusivamente para identificar sua participação nos eventos, processar repasses e exibir rankings. Não vendemos seus dados para terceiros.</p>
            <p><strong>4. Direitos do Usuário (LGPD)</strong><br /> Você pode solicitar a exclusão da sua conta e de todos os seus dados a qualquer momento entrando em contato conosco.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
