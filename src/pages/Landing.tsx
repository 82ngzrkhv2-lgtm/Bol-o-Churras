import { Link } from 'react-router-dom'

import { CheckCircle2, Frown, FileSpreadsheet, UserX, Map, Shield, Users, Trophy, DollarSign, MessageSquare, PlayCircle, Star, ArrowRight, Clock, Bell, Home, Calendar } from 'lucide-react'
import { useInView } from '../hooks/useInView'

// Componente wrapper que renderiza filhos somente quando entra na viewport
function LazySection({ children, className, id, style }: {
  children: React.ReactNode
  className?: string
  id?: string
  style?: React.CSSProperties
}) {
  const { ref, isInView } = useInView({ threshold: 0.05, rootMargin: '0px 0px -60px 0px' })
  return (
    <section
      id={id}
      ref={ref as React.RefObject<HTMLElement>}
      className={className}
      style={{
        ...style,
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.55s ease, transform 0.55s ease',
      }}
    >
      {isInView ? children : null}
    </section>
  )
}

export default function Landing() {


  // Smooth scroll helper
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-body bg-[#F9FAFB] text-gray-900 selection:bg-verde selection:text-white relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-100 rounded-full blur-[100px] opacity-40 z-0 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute top-[20%] left-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[80px] opacity-50 z-0 pointer-events-none -translate-x-1/2"></div>

      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Bolão & Churras" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
            <span className="font-display font-bold text-base sm:text-xl tracking-tight text-gray-900">
              Bolão<span className="text-green-600">&</span>Churras
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">Início</button>
            <button onClick={() => scrollTo('solucao')} className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">Funcionalidades</button>
            <button onClick={() => scrollTo('como-funciona')} className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">Como funciona</button>
            <button onClick={() => scrollTo('beneficios')} className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">Benefícios</button>
            <button onClick={() => scrollTo('depoimentos')} className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">Depoimentos</button>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden md:flex px-6 py-2.5 rounded-full text-sm font-semibold text-green-600 border border-green-600 hover:bg-green-50 transition-colors whitespace-nowrap items-center justify-center">
              Entrar
            </Link>
            <Link to="/register" className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/20 transition-all hover:scale-105 flex items-center justify-center whitespace-nowrap">
              <span className="hidden sm:inline">Criar grupo grátis</span>
              <span className="sm:hidden">Criar grátis</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-32 pb-20 relative z-10">
        {/* --- HERO SECTION --- */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide mb-6">
              <CheckCircle2 size={14} className="fill-green-600 text-white" />
              A plataforma completa para organizar bolões e eventos
            </div>
            
            <h1 className="text-4xl md:text-[3.5rem] leading-[1.25] font-display font-black text-gray-900 mb-6 tracking-tight">
              Organize seu <span className="text-green-600">Bolão</span> e <span className="text-green-600">Churrasco</span> sem Planilhas e sem Dor de Cabeça
            </h1>
            
            <p className="text-lg text-gray-500 mb-10 max-w-lg leading-relaxed">
              Controle participantes, pagamentos via PIX, presença e palpites em um único link compartilhável.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold text-white bg-green-600 hover:bg-green-700 shadow-xl shadow-green-600/20 transition-all hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap">
                Criar meu grupo grátis <ArrowRight size={20} />
              </Link>
              <button onClick={() => scrollTo('solucao')} className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                Ver demonstração <PlayCircle size={20} className="text-green-600" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Users size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg leading-tight">+1.200</div>
                  <div className="text-xs text-gray-500">grupos criados</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                  <DollarSign size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg leading-tight">R$ 180.000+</div>
                  <div className="text-xs text-gray-500">movimentados</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg leading-tight">5.000+</div>
                  <div className="text-xs text-gray-500">confirmações realizadas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Animated Interactive Dashboard Mockup */}
          <div className="relative animate-fade-in-up stagger-2 hidden lg:flex items-center justify-center w-full">
            <style>{`
              @keyframes popupCycle1 {
                0%, 100% { opacity: 0; transform: translateY(10px) scale(0.95); }
                3%, 30% { opacity: 1; transform: translateY(0) scale(1); }
                33%, 97% { opacity: 0; transform: translateY(-10px) scale(0.95); }
              }
              @keyframes popupCycle2 {
                0%, 33%, 100% { opacity: 0; transform: translateY(10px) scale(0.95); }
                36%, 63% { opacity: 1; transform: translateY(0) scale(1); }
                66%, 97% { opacity: 0; transform: translateY(-10px) scale(0.95); }
              }
              @keyframes popupCycle3 {
                0%, 66%, 100% { opacity: 0; transform: translateY(10px) scale(0.95); }
                69%, 96% { opacity: 1; transform: translateY(0) scale(1); }
                99% { opacity: 0; transform: translateY(-10px) scale(0.95); }
              }
              .animate-popup-1 { animation: popupCycle1 9s infinite; }
              .animate-popup-2 { animation: popupCycle2 9s infinite; }
              .animate-popup-3 { animation: popupCycle3 9s infinite; }
              @keyframes mockShake {
                0%, 100% { transform: rotate(0); }
                15%, 45%, 75% { transform: rotate(-8deg); }
                30%, 60%, 90% { transform: rotate(8deg); }
              }
              .animate-bell-shake { animation: mockShake 2s infinite ease-in-out; }
            `}</style>
            
            <div className="w-full aspect-video rounded-[1.5rem] bg-[#1E1E1E] p-2 border-4 border-slate-700 shadow-2xl relative overflow-hidden flex flex-col">
              {/* Laptop camera dot */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-800 z-20"></div>
              
              {/* Inner Screen */}
              <div className="w-full h-full bg-[#F3F4F6] rounded-lg overflow-hidden flex text-[10px] font-sans text-gray-700 relative">
                {/* Mock Sidebar */}
                <aside className="w-1/4 bg-white border-r border-gray-100 p-2 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <img src="/logo.png" alt="Logo" className="w-4 h-4 object-contain" />
                    <span className="font-bold text-[9px] text-gray-900 tracking-tight">Bolão&Churras</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 bg-green-500 text-white p-1 rounded-md font-semibold">
                      <Home size={10} /> Dashboard
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 p-1 rounded-md hover:bg-gray-50">
                      <Users size={10} /> Participantes
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 p-1 rounded-md hover:bg-gray-50">
                      <Trophy size={10} /> Jogos
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 p-1 rounded-md hover:bg-gray-50">
                      <DollarSign size={10} /> Pagamentos
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 p-1 rounded-md hover:bg-gray-50">
                      <Calendar size={10} /> Evento
                    </div>
                  </div>
                  {/* Banner */}
                  <div className="mt-auto bg-green-50 border border-green-100 rounded-lg p-1.5 text-center text-[7px] text-green-800">
                    <p className="font-bold mb-1">Convide os amigos!</p>
                    <button className="bg-green-600 text-white rounded-full px-2 py-0.5 font-bold hover:bg-green-700 transition-colors w-full">Copiar Link</button>
                  </div>
                </aside>

                {/* Mock Main Layout */}
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  {/* Mock Header */}
                  <header className="h-8 bg-white border-b border-gray-100 flex items-center justify-between px-3">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[9px] font-bold text-gray-900">Painel do Grupo</p>
                      <span className="bg-green-100 text-green-700 text-[6px] px-1 py-0.2 rounded font-bold uppercase">Ativo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bell size={10} className="text-gray-400 animate-bell-shake" />
                      <div className="w-4 h-4 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-[8px]">R</div>
                    </div>
                  </header>

                  {/* Mock Content */}
                  <main className="flex-1 p-3 flex flex-col gap-2.5 overflow-hidden">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white border border-gray-100 p-2 rounded-lg flex items-center gap-2 shadow-sm">
                        <div className="w-5 h-5 rounded-md bg-green-50 text-green-600 flex items-center justify-center"><Users size={12} /></div>
                        <div>
                          <p className="text-[6px] text-gray-400 font-bold uppercase tracking-wider">Participantes</p>
                          <p className="text-xs font-black text-gray-900 leading-none">12</p>
                        </div>
                      </div>
                      <div className="bg-white border border-gray-100 p-2 rounded-lg flex items-center gap-2 shadow-sm">
                        <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center"><DollarSign size={12} /></div>
                        <div>
                          <p className="text-[6px] text-gray-400 font-bold uppercase tracking-wider">Arrecadado</p>
                          <p className="text-xs font-black text-gray-900 leading-none">R$ 240,00</p>
                        </div>
                      </div>
                      <div className="bg-white border border-gray-100 p-2 rounded-lg flex items-center gap-2 shadow-sm">
                        <div className="w-5 h-5 rounded-md bg-yellow-50 text-yellow-600 flex items-center justify-center"><Clock size={12} /></div>
                        <div>
                          <p className="text-[6px] text-gray-400 font-bold uppercase tracking-wider">Pendente</p>
                          <p className="text-xs font-black text-gray-900 leading-none">R$ 40,00</p>
                        </div>
                      </div>
                    </div>

                    {/* Central Grid */}
                    <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
                      {/* Next Match Card */}
                      <div className="bg-white border border-gray-100 p-2.5 rounded-lg flex flex-col gap-1.5 shadow-sm">
                        <p className="font-bold text-[8px] text-gray-900">⚽ Próximo Jogo</p>
                        <div className="bg-gray-50 p-1.5 rounded-md flex items-center justify-between border border-gray-100">
                          <span className="font-bold text-[8px]">🇧🇷 BR</span>
                          <span className="bg-green-100 text-green-800 text-[8px] font-black px-1.5 py-0.2 rounded-full">VS</span>
                          <span className="font-bold text-[8px]">AR 🇦🇷</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[7px] border-b border-gray-50 pb-0.5">
                            <span className="text-gray-500">Rafael S.</span>
                            <span className="font-bold">2 x 1</span>
                          </div>
                          <div className="flex justify-between text-[7px] border-b border-gray-50 pb-0.5">
                            <span className="text-gray-500">Amanda C.</span>
                            <span className="font-bold">1 x 0</span>
                          </div>
                        </div>
                      </div>

                      {/* Event RSVP Card */}
                      <div className="bg-white border border-gray-100 p-2.5 rounded-lg flex flex-col gap-1.5 shadow-sm justify-between">
                        <div>
                          <p className="font-bold text-[8px] text-gray-900">🍖 Detalhes do Churras</p>
                          <p className="text-[7px] text-gray-400">Data: Sábado, 16:00</p>
                          <p className="text-[7px] text-gray-400">Local: Salão de Festas</p>
                        </div>
                        <div className="bg-green-50 border border-green-100 rounded-md p-1 flex items-center justify-between">
                          <span className="text-[7px] font-bold text-green-800">10 Confirmados</span>
                          <CheckCircle2 size={10} className="text-green-600" />
                        </div>
                      </div>
                    </div>
                  </main>
                </div>

                {/* Simulated Floating Push Notifications */}
                <div className="absolute bottom-2 right-2 flex flex-col gap-1.5 w-44 z-30 pointer-events-none">
                  {/* Notification 1 */}
                  <div className="animate-popup-1 absolute bottom-0 right-0 w-full bg-white border border-gray-100 border-l-4 border-green-500 shadow-md p-1.5 rounded flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={10} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-[7px] text-gray-900 truncate">Presença Confirmada!</p>
                      <p className="text-[6px] text-gray-400 truncate">Reinan confirmou presença no churrasco 🍖</p>
                    </div>
                  </div>

                  {/* Notification 2 */}
                  <div className="animate-popup-2 absolute bottom-0 right-0 w-full bg-white border border-gray-100 border-l-4 border-blue-500 shadow-md p-1.5 rounded flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <DollarSign size={10} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-[7px] text-gray-900 truncate">Pix Recebido!</p>
                      <p className="text-[6px] text-gray-400 truncate">Amanda Costa enviou R$ 20,00 via Pix 💰</p>
                    </div>
                  </div>

                  {/* Notification 3 */}
                  <div className="animate-popup-3 absolute bottom-0 right-0 w-full bg-white border border-gray-100 border-l-4 border-yellow-500 shadow-md p-1.5 rounded flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
                      <Trophy size={10} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-[7px] text-gray-900 truncate">Novo Palpite!</p>
                      <p className="text-[6px] text-gray-400 truncate">Lucas palpitou 2x1 no jogo do Brasil ⚽</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- DORES (Ainda organizando pelo WhatsApp?) --- */}
        <LazySection className="py-20 relative">
          <div className="absolute inset-0 bg-white/40 -z-10" style={{ clipPath: 'ellipse(150% 100% at 50% 0%)' }}></div>
          <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">Ainda organizando tudo pelo <span className="text-green-500">WhatsApp</span>?</h2>
            <p className="text-gray-500 mb-12">Isso gera dor de cabeça e faz você perder tempo.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4"><Frown size={32} /></div>
                <h3 className="font-bold text-gray-900 mb-2">Cobranças esquecidas</h3>
                <p className="text-sm text-gray-500">Você nunca sabe quem já pagou o PIX.</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-full bg-yellow-100 text-yellow-500 flex items-center justify-center mb-4"><FileSpreadsheet size={32} /></div>
                <h3 className="font-bold text-gray-900 mb-2">Planilhas confusas</h3>
                <p className="text-sm text-gray-500">Ninguém atualiza nada e sempre dá erro nos cálculos.</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mb-4"><UserX size={32} /></div>
                <h3 className="font-bold text-gray-900 mb-2">Presença incerta</h3>
                <p className="text-sm text-gray-500">Sempre aparece alguém dizendo que não vai mais de última hora.</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-500 flex items-center justify-center mb-4"><Map size={32} /></div>
                <h3 className="font-bold text-gray-900 mb-2">Palpites espalhados</h3>
                <p className="text-sm text-gray-500">Cada um manda o resultado em um lugar diferente.</p>
              </div>
            </div>
          </div>
        </LazySection>

        {/* --- A SOLUÇÃO (Tudo centralizado) --- */}
        <LazySection id="solucao" className="py-20 max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wide mb-6">
              A SOLUÇÃO
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-6 leading-[1.25]">
              Tudo centralizado em um <span className="text-green-600">único link</span>
            </h2>
            <p className="text-lg text-gray-500 mb-10">
              Crie seu grupo, compartilhe o link e deixe que o Bolão&Churras organiza o resto para você. Sem esforço.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shadow-sm">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Gestão de participantes</h4>
                  <p className="text-sm text-gray-500">Veja quem entrou, quem já pagou e quem está pendente.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                  <Trophy size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Ranking automático</h4>
                  <p className="text-sm text-gray-500">Pontuação atualizada na hora assim que o jogo acaba.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center shadow-sm">
                  <DollarSign size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Controle de PIX</h4>
                  <p className="text-sm text-gray-500">Receba pagamentos via PIX e libere o sistema na hora.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Confirmação de presença</h4>
                  <p className="text-sm text-gray-500">Confirmação rápida e prática para seu evento sair perfeito.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mockup Solução (Web + App) */}
          <div className="lg:col-span-7 flex items-center justify-center w-full mt-10 lg:mt-0">
            <div className="w-full relative flex justify-center overflow-visible">
              <img 
                src="/solution-mockup.png" 
                alt="Bolão & Churras em Web e App" 
                className="w-full max-w-[500px] sm:max-w-[600px] lg:max-w-none h-auto object-contain scale-105 lg:scale-120 origin-center transition-transform" 
              />
            </div>
          </div>
        </LazySection>

        {/* --- COMO FUNCIONA --- */}
        <LazySection id="como-funciona" className="py-20 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wide mb-4">
              COMO FUNCIONA
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-16">
              Simples, rápido e eficiente
            </h2>

            {/* Timeline Horizontal */}
            <div className="relative flex flex-col lg:flex-row justify-between gap-8 lg:gap-4 max-w-5xl mx-auto z-10">
              {/* Linha conectora (oculta no mobile, visível no LG) */}
              <div className="hidden lg:block absolute top-6 left-[10%] right-[10%] h-[2px] bg-gray-200 z-0"></div>
              
              {/* Passo 1 */}
              <div className="flex-1 flex flex-col items-center text-center relative z-10">
                <div className="w-12 h-12 rounded-full bg-green-600 text-white font-bold flex items-center justify-center text-lg mb-6 shadow-md border-4 border-white">1</div>
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-green-600 mb-4">
                  <Users size={28} />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Crie seu grupo</h4>
                <p className="text-sm text-gray-500">Configure as regras, valor por pessoa e tipo do evento.</p>
              </div>

              {/* Passo 2 */}
              <div className="flex-1 flex flex-col items-center text-center relative z-10">
                <div className="w-12 h-12 rounded-full bg-yellow-500 text-white font-bold flex items-center justify-center text-lg mb-6 shadow-md border-4 border-white">2</div>
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-yellow-500 mb-4">
                  <MessageSquare size={28} />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Compartilhe o link</h4>
                <p className="text-sm text-gray-500">Envie para seus amigos pelo WhatsApp em 1 segundo.</p>
              </div>

              {/* Passo 3 */}
              <div className="flex-1 flex flex-col items-center text-center relative z-10">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-lg mb-6 shadow-md border-4 border-white">3</div>
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-500 mb-4">
                  <CheckCircle2 size={28} />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">A galera entra</h4>
                <p className="text-sm text-gray-500">Participantes entram e confirmam presença.</p>
              </div>

              {/* Passo 4 */}
              <div className="flex-1 flex flex-col items-center text-center relative z-10">
                <div className="w-12 h-12 rounded-full bg-green-500 text-white font-bold flex items-center justify-center text-lg mb-6 shadow-md border-4 border-white">4</div>
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-green-500 mb-4">
                  <DollarSign size={28} />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Receba pagamentos</h4>
                <p className="text-sm text-gray-500">Controle de PIX, lembretes e comprovantes validados.</p>
              </div>

              {/* Passo 5 */}
              <div className="flex-1 flex flex-col items-center text-center relative z-10">
                <div className="w-12 h-12 rounded-full bg-yellow-400 text-gray-900 font-bold flex items-center justify-center text-lg mb-6 shadow-md border-4 border-white">5</div>
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-yellow-500 mb-4">
                  <Trophy size={28} />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Acompanhe tudo</h4>
                <p className="text-sm text-gray-500">Veja o ranking e movimentações em tempo real.</p>
              </div>
            </div>
          </div>
        </LazySection>

        {/* --- BENEFÍCIOS --- */}
        <LazySection id="beneficios" className="py-24 max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wide mb-4">
                BENEFÍCIOS
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
                Feito para quem quer praticidade<br/> e quer <span className="text-green-600">curtir mais</span>
              </h2>
            </div>
            <Link to="/register" className="px-6 py-3 rounded-full text-sm font-bold text-white bg-green-600 hover:bg-green-700 shadow-md transition-colors flex items-center gap-2 shrink-0">
              Criar meu grupo grátis <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex gap-4">
              <div className="w-12 h-12 shrink-0 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Economiza tempo</h4>
                <p className="text-sm text-gray-500">Automatize tarefas e foque no que importa.</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex gap-4">
              <div className="w-12 h-12 shrink-0 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Menos inadimplência</h4>
                <p className="text-sm text-gray-500">Bloqueios automáticos reduzem atrasos de PIX.</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex gap-4">
              <div className="w-12 h-12 shrink-0 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                <MessageSquare size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Integração com WhatsApp</h4>
                <p className="text-sm text-gray-500">Link único compartilhável por mensagem.</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex gap-4">
              <div className="w-12 h-12 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Mais engajamento</h4>
                <p className="text-sm text-gray-500">Ranking interativo e palpites deixam tudo mais divertido.</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex gap-4">
              <div className="w-12 h-12 shrink-0 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <Shield size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Organização profissional</h4>
                <p className="text-sm text-gray-500">Tenha o controle de tudo num painel unificado.</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex gap-4">
              <div className="w-12 h-12 shrink-0 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Menos estresse</h4>
                <p className="text-sm text-gray-500">Tudo fica pronto para você apenas aproveitar seu evento.</p>
              </div>
            </div>
          </div>
        </LazySection>

        {/* --- DEPOIMENTOS --- */}
        <LazySection id="depoimentos" className="py-24 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wide mb-4">
                QUEM USA, APROVA
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
                O que nossos usuários dizem
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <p className="text-gray-600 italic mb-6">"Finalmente parei de cobrar todo mundo manualmente. Agora o sistema faz isso por mim. Salvou meus domingos!"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  <div>
                    <h5 className="font-bold text-gray-900">Rafael Silva</h5>
                    <p className="text-xs text-gray-500">Organizador de Bolões</p>
                  </div>
                  <div className="flex text-yellow-400 ml-auto">
                    {[...Array(5)].map((_,i) => <Star key={i} size={14} className="fill-current" />)}
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <p className="text-gray-600 italic mb-6">"O ranking virou a parte mais divertida do grupo. A galera compete e interage muito mais!"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  <div>
                    <h5 className="font-bold text-gray-900">Lucas Almeida</h5>
                    <p className="text-xs text-gray-500">Bolão Entre Amigos</p>
                  </div>
                  <div className="flex text-yellow-400 ml-auto">
                    {[...Array(5)].map((_,i) => <Star key={i} size={14} className="fill-current" />)}
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <p className="text-gray-600 italic mb-6">"Organizei o churrasco inteiro em menos de 5 minutos. Presença, cobrança e carne, tudo pronto."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  <div>
                    <h5 className="font-bold text-gray-900">Amanda Costa</h5>
                    <p className="text-xs text-gray-500">Organizadora de Eventos</p>
                  </div>
                  <div className="flex text-yellow-400 ml-auto">
                    {[...Array(5)].map((_,i) => <Star key={i} size={14} className="fill-current" />)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </LazySection>

        {/* --- BOTTOM CTA --- */}
        <LazySection className="max-w-6xl mx-auto px-4 md:px-8 py-10">
          <div className="bg-[#0B3B24] rounded-[2rem] overflow-hidden relative p-10 md:p-16 flex flex-col md:flex-row items-center justify-between text-white shadow-2xl">
            {/* Shapes decorativos do CTA */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full blur-[80px] opacity-20 -translate-y-1/2"></div>
            
            <div className="max-w-xl relative z-10 mb-8 md:mb-0 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 leading-[1.25]">
                Seu próximo bolão começa em <span className="text-yellow-400">menos de 2 minutos</span>
              </h2>
              <p className="text-green-100/80">
                Crie gratuitamente e compartilhe com sua galera agora mesmo.
              </p>
            </div>
            
            <div className="relative z-10 w-full md:w-auto">
              <Link to="/register" className="w-full md:w-auto px-8 py-5 rounded-full text-base font-bold text-gray-900 bg-yellow-400 hover:bg-yellow-300 shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2">
                Criar meu grupo grátis <ArrowRight size={20} />
              </Link>
              <p className="text-center text-xs text-green-200/60 mt-3">Sem cartão de crédito. Simples assim.</p>
            </div>
          </div>
        </LazySection>

      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-[#111827] text-gray-400 py-12 px-4 md:px-8 text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10">
                <img src="/logo.png" alt="Bolão & Churras" className="w-5 h-5 object-contain brightness-0 invert" />
              </div>
              <span className="font-display font-bold text-white text-lg tracking-tight">Bolão&Churras</span>
            </div>
            <p className="max-w-xs mb-6">A plataforma completa para organizar bolões, churrascos e eventos entre amigos.</p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">in</a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">ig</a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">tw</a>
            </div>
          </div>
          <div>
            <h5 className="font-bold text-white mb-4 uppercase text-xs tracking-wider">Produto</h5>
            <ul className="space-y-3">
              <li><button onClick={() => scrollTo('solucao')} className="hover:text-white transition-colors">Funcionalidades</button></li>
              <li><button onClick={() => scrollTo('como-funciona')} className="hover:text-white transition-colors">Como funciona</button></li>
              <li><a href="#" className="hover:text-white transition-colors">Planos e preços</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white mb-4 uppercase text-xs tracking-wider">Suporte</h5>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Central de ajuda</a></li>
              <li><Link to="/termos" className="hover:text-white transition-colors">Termos de uso</Link></li>
              <li><Link to="/privacidade" className="hover:text-white transition-colors">Política de privacidade</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Bolão & Churras. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2 text-xs">
            Feito com <span className="text-red-500">❤</span> para quem ama futebol e amigos!
          </div>
        </div>
      </footer>
    </div>
  )
}
