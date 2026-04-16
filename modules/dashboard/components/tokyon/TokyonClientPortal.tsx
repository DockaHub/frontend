import React, { useState } from 'react';
import { 
  Zap, TrendingUp, CheckCircle2, Clock, Download, 
  Bell, FileText, ThumbsUp, MessageSquare,
  BarChart3, DollarSign, Calendar, Eye, ArrowUpRight
} from 'lucide-react';
import Modal from '../../../../components/common/Modal';

interface TokyonClientPortalProps {
  onExit: () => void;
}

// Provided SVG Logo
const TokyonLogoSVG = () => (
    <svg id="Camada_1" data-name="Camada 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 378.9 74.71" className="h-8 w-auto text-white fill-current">
        <g>
            <rect x="32.72" width="9.27" height="32.72"/>
            <rect x="53.72" y="20.99" width="9.27" height="32.72" transform="translate(95.71 -20.99) rotate(90)"/>
            <rect x="32.72" y="41.99" width="9.27" height="32.72" transform="translate(74.71 116.7) rotate(180)"/>
            <rect x="11.73" y="20.99" width="9.27" height="32.72" transform="translate(-20.99 53.72) rotate(-90)"/>
            <rect x="50.84" y="43.75" width="9.27" height="23.46" transform="translate(133.94 55.48) rotate(135)"/>
            <rect x="14.6" y="43.75" width="9.27" height="23.46" transform="translate(-6.39 108.31) rotate(-135)"/>
            <rect x="14.6" y="7.51" width="9.27" height="23.46" transform="translate(-7.97 19.23) rotate(-45)"/>
            <rect x="50.84" y="7.51" width="9.27" height="23.46" transform="translate(29.85 -33.6) rotate(45)"/>
        </g>
        <g>
            <path d="m95.18,12.46h41.02v13.08h-13.08v36.42h-15.2V25.54h-12.75v-13.08Z"/>
            <path d="m155.47,62.22c-1.63-.24-3.29-.65-4.97-1.22-1.35-.4-2.75-1.03-4.2-1.89-1.48-.88-2.65-1.72-3.51-2.52-1.06-.93-1.99-1.94-2.78-3.05-.86-1.06-1.59-2.23-2.19-3.51-.73-1.61-1.25-2.95-1.56-4.01-.4-1.35-.7-2.77-.89-4.27-.22-1.59-.33-3.11-.33-4.57,0-1.24.11-2.6.33-4.11.15-1.08.43-2.37.83-3.87.31-1.21.78-2.44,1.42-3.67.44-.99,1.09-2.1,1.95-3.31.84-1.15,1.66-2.14,2.45-2.98,1.06-1.06,2.03-1.9,2.91-2.52,1.24-.93,2.36-1.63,3.38-2.12,1.08-.53,2.37-1.05,3.87-1.56,1.5-.44,2.92-.75,4.27-.93,1.81-.24,3.38-.36,4.7-.36,1.77,0,3.56.14,5.4.43,1.41.22,3.05.61,4.9,1.16,1.68.6,3.08,1.22,4.2,1.89,1.04.62,2.21,1.46,3.51,2.52,1.15,1.02,2.14,2.03,2.98,3.05.97,1.26,1.74,2.45,2.32,3.58.71,1.54,1.25,2.86,1.62,3.94.49,1.74.81,3.19.96,4.34.22,1.66.33,3.17.33,4.54,0,1.57-.09,2.92-.26,4.07-.15,1.1-.43,2.42-.83,3.94-.31,1.02-.78,2.22-1.42,3.61-.75,1.48-1.4,2.58-1.95,3.31-.82,1.17-1.63,2.16-2.45,2.98-.84.91-1.81,1.77-2.91,2.58-1.08.75-2.23,1.42-3.44,2.02-1.57.77-2.86,1.3-3.87,1.59-1.44.46-2.88.79-4.34.99-1.72.22-3.33.33-4.83.33-2.05,0-3.92-.13-5.59-.4Zm14-16.26c1.9-2.27,2.85-5.2,2.85-8.77s-.93-6.58-2.78-8.94c-1.88-2.25-4.65-3.38-8.31-3.38s-6.33,1.15-8.21,3.44c-1.94,2.3-2.91,5.25-2.91,8.87s.9,6.54,2.71,8.77c1.77,2.25,4.55,3.38,8.34,3.38s6.41-1.13,8.31-3.38Z"/>
            <path d="m205.23,12.46v23.54h2.71l13.47-23.54h15.92l-14.5,24,15.13,25.49h-16.75l-13.34-24.6h-2.65v24.6h-14.53V12.46h14.53Z"/>
            <path d="m249.49,12.46l8.14,16.49,8.41-16.49h15.59l-16.82,30.99v18.51h-14.67v-18.44l-16.65-31.05h15.99Z"/>
            <path d="m296.27,62.22c-1.63-.24-3.29-.65-4.97-1.22-1.35-.4-2.75-1.03-4.2-1.89-1.48-.88-2.65-1.72-3.51-2.52-1.06-.93-1.99-1.94-2.78-3.05-.86-1.06-1.59-2.23-2.19-3.51-.73-1.61-1.25-2.95-1.56-4.01-.4-1.35-.7-2.77-.89-4.27-.22-1.59-.33-3.11-.33-4.57,0-1.24.11-2.6.33-4.11.15-1.08.43-2.37.83-3.87.31-1.21.78-2.44,1.42-3.67.44-.99,1.09-2.1,1.95-3.31.84-1.15,1.66-2.14,2.45-2.98,1.06-1.06,2.03-1.9,2.91-2.52,1.24-.93,2.36-1.63,3.38-2.12,1.08-.53,2.37-1.05,3.87-1.56,1.5-.44,2.92-.75,4.27-.93,1.81-.24,3.38-.36,4.7-.36,1.77,0,3.56.14,5.4.43,1.41.22,3.05.61,4.9,1.16,1.68.6,3.08,1.22,4.2,1.89,1.04.62,2.21,1.46,3.51,2.52,1.15,1.02,2.14,2.03,2.98,3.05.97,1.26,1.74,2.45,2.32,3.58.71,1.54,1.25,2.86,1.62,3.94.49,1.74.81,3.19.96,4.34.22,1.66.33,3.17.33,4.54,0,1.57-.09,2.92-.26,4.07-.15,1.1-.43,2.42-.83,3.94-.31,1.02-.78,2.22-1.42,3.61-.75,1.48-1.4,2.58-1.95,3.31-.82,1.17-1.63,2.16-2.45,2.98-.84.91-1.81,1.77-2.91,2.58-1.08.75-2.23,1.42-3.44,2.02-1.57.77-2.86,1.3-3.87,1.59-1.44.46-2.88.79-4.34.99-1.72.22-3.33.33-4.83.33-2.05,0-3.92-.13-5.59-.4Zm14-16.26c1.9-2.27,2.85-5.2,2.85-8.77s-.93-6.58-2.78-8.94c-1.88-2.25-4.65-3.38-8.31-3.38s-6.33,1.15-8.21,3.44c-1.94,2.3-2.91,5.25-2.91,8.87s.9,6.54,2.71,8.77c1.77,2.25,4.55,3.38,8.34,3.38s6.41-1.13,8.31-3.38Z"/>
            <path d="m347.32,12.46l12.94,36.68,3.51,10.1-.07-10.86V12.46h15.2v49.49h-15.79l-11.95-34.17-4.6-13.01.07,13.87v33.3h-15.13V12.46h15.82Z"/>
        </g>
    </svg>
);

// MOCK DATA FOR AGENCY CLIENT
const METRICS = [
    { label: 'Leads Qualificados', value: '482', change: '+12%', period: 'Este mês' },
    { label: 'Custo por Lead (CPL)', value: 'R$ 4,50', change: '-5%', period: 'Média da conta' },
    { label: 'Visitas no Site', value: '12.5k', change: '+22%', period: 'vs. mês anterior' },
    { label: 'Taxa de Conversão', value: '3.8%', change: '+0.5%', period: 'Landing Page Principal' },
];

const APPROVAL_QUEUE = [
    { 
        id: 1, 
        title: 'Campanha Instagram - Coleção Outono', 
        type: 'Social Media', 
        preview: 'https://picsum.photos/id/10/400/400', 
        date: 'Hoje', 
        status: 'pending' 
    },
    { 
        id: 2, 
        title: 'Layout Homepage v2.0', 
        type: 'Web Design', 
        preview: 'https://picsum.photos/id/3/800/600', 
        date: 'Ontem', 
        status: 'pending' 
    },
    { 
        id: 3, 
        title: 'Email Marketing - Black Friday Antecipada', 
        type: 'Copywriting', 
        preview: null, 
        textPreview: 'Assunto: Sua oportunidade exclusiva chegou... [Clique para ler o copy completo]',
        date: '22/02', 
        status: 'approved' 
    },
];

const PROJECT_TIMELINE = [
    { phase: '1. Posicionamento', status: 'done', progress: 100 },
    { phase: '2. Identidade Visual', status: 'done', progress: 100 },
    { phase: '3. Web Experience', status: 'active', progress: 65, next: 'Aprovação de Layout' },
    { phase: '4. Tráfego & Performance', status: 'waiting', progress: 0 },
    { phase: '5. CRM & Automação', status: 'waiting', progress: 0 },
];

const INVOICES = [
    { id: 'INV-0092', desc: 'Fee Mensal - Março/2026', amount: 'R$ 12.500,00', status: 'pending', due: '05/03' },
    { id: 'INV-0081', desc: 'Fee Mensal - Fevereiro/2026', amount: 'R$ 12.500,00', status: 'paid', due: '05/02' },
    { id: 'INV-0075', desc: 'Verba de Mídia (Ads) - Fev', amount: 'R$ 5.000,00', status: 'paid', due: '01/02' },
];

const TokyonClientPortal: React.FC<TokyonClientPortalProps> = ({ onExit }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'approvals' | 'finance'>('dashboard');
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);

  return (
    <div className="fixed inset-0 bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans z-[100] overflow-hidden text-zinc-900 dark:text-zinc-100 transition-colors">
        
        {/* TOP BAR: SIMULATION BANNER */}
        <div className="bg-orange-600 text-white px-4 py-2 text-center text-sm font-bold flex justify-between items-center z-[110] shadow-md shrink-0">
            <span className="flex items-center gap-2"><Eye size={16} /> Visualizando como: Cliente Taurus Armas</span>
            <button 
                onClick={onExit}
                className="bg-white text-orange-600 px-3 py-1 rounded text-xs hover:bg-orange-50 transition-colors uppercase tracking-wider font-bold"
            >
                Sair do modo cliente
            </button>
        </div>

        {/* HEADER AREA (Black & Orange Identity) */}
        <div className="bg-zinc-900 text-white px-6 py-10 shrink-0 relative overflow-hidden border-b border-white/5">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600 rounded-full blur-[150px] opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-zinc-800 rounded-full blur-[100px] opacity-30 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10 font-black tracking-tight">
                <div className="flex items-center gap-6">
                    <div className="hover:scale-110 transition-transform cursor-pointer">
                        <TokyonLogoSVG />
                    </div>
                </div>

                {/* Main Nav - Glassmorphism */}
                <div className="flex bg-white/5 backdrop-blur-2xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
                    {[
                        { id: 'dashboard', label: 'Estratégia', icon: BarChart3 },
                        { id: 'approvals', label: 'Entregas', icon: CheckCircle2, count: 2 },
                        { id: 'finance', label: 'Financeiro', icon: DollarSign }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all duration-300 ${
                                activeTab === tab.id 
                                ? 'bg-white text-zinc-900 shadow-[0_8px_20px_rgba(255,255,255,0.1)] active:scale-95' 
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                            {tab.count && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ml-1 shadow-sm ${activeTab === tab.id ? 'bg-orange-600 text-white' : 'bg-white/10 text-white'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-5">
                    <div className="flex flex-col items-end pr-5 border-r border-white/10">
                        <p className="text-sm font-black text-white">Roberto A.</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">CMO • Taurus</p>
                    </div>
                    <button className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white border border-white/10 transition-all active:scale-90">
                        <Bell size={20} />
                    </button>
                </div>
            </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-50 dark:bg-zinc-950 p-6 md:p-8 transition-colors">
            <div className="max-w-7xl mx-auto">
                
                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Welcome */}
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Performance em Tempo Real</h2>
                                <p className="text-zinc-500 dark:text-zinc-400">Resultados consolidados das campanhas ativas.</p>
                            </div>
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase">Última atualização</p>
                                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1 justify-end">
                                    <Clock size={14} /> Hoje, 14:30
                                </p>
                            </div>
                        </div>

                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {METRICS.map((m, i) => (
                                <div key={i} className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none hover:border-orange-500 transition-all hover:-translate-y-1 group">
                                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">{m.label}</p>
                                    <div className="flex items-end justify-between">
                                        <h3 className="text-4xl font-black text-zinc-900 dark:text-zinc-100">{m.value}</h3>
                                        <div className={`text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 ${m.change.includes('+') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'bg-red-50 text-red-600 dark:bg-red-950/30'}`}>
                                            {m.change}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Strategic Pillars (Orange Program) */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 rounded-full blur-[100px] opacity-5 -translate-y-1/2 translate-x-1/2" />
                                     
                                     <div className="flex justify-between items-center mb-8 relative z-10">
                                         <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                                             <div className="p-2 bg-orange-600 rounded-lg text-white shadow-lg shadow-orange-900/20">
                                                 <Zap size={20} fill="currentColor" />
                                             </div>
                                             Sua Jornada Estratégica
                                         </h3>
                                         <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-4 py-1.5 rounded-full border border-orange-100 dark:border-orange-900/30 uppercase tracking-[0.2em]">65% Concluído</span>
                                     </div>

                                     <div className="grid grid-cols-5 gap-3 mb-10">
                                         {[
                                             { label: 'Posicionamento', active: true, done: true },
                                             { label: 'Presença Digital', active: true, done: true },
                                             { label: 'Web Experience', active: true, done: false },
                                             { label: 'Tráfego', active: false, done: false },
                                             { label: 'CRM', active: false, done: false },
                                         ].map((step, i) => (
                                             <div key={i} className="flex flex-col items-center gap-2">
                                                 <div className={`w-full h-2 rounded-full transition-all duration-700 ${step.done ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : step.active ? 'bg-orange-600' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
                                                 <span className={`text-[9px] font-black uppercase text-center leading-tight ${step.active ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}>{step.label}</span>
                                             </div>
                                         ))}
                                     </div>

                                     <div className="space-y-4">
                                         {PROJECT_TIMELINE.slice(0, 3).map((step, i) => (
                                             <div key={i} className="flex items-center gap-5 p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 transition-all hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none cursor-default">
                                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${step.status === 'done' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-600 text-white'}`}>
                                                     {step.status === 'done' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                                                 </div>
                                                 <div className="flex-1">
                                                     <p className="text-xs font-black text-zinc-900 dark:text-zinc-100 mb-1">{step.phase}</p>
                                                     <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                         <div className={`h-full ${step.status === 'done' ? 'bg-emerald-500' : 'bg-orange-600'} rounded-full`} style={{ width: `${step.progress}%` }} />
                                                     </div>
                                                 </div>
                                                 {step.next && <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded">PRÓXIMO: {step.next}</span>}
                                             </div>
                                         ))}
                                     </div>
                                </div>
                            </div>

                            {/* Impact Summary Widget */}
                            <div className="bg-zinc-950 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden flex flex-col border border-white/5">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 rounded-full blur-[120px] opacity-10 -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10 flex-1">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                                            <TrendingUp size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg">Resumo de Impacto</h3>
                                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">ROI Projectado • Março 2026</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Retorno sobre Investimento</p>
                                            <div className="flex items-end gap-2">
                                                <span className="text-4xl font-black">4.2x</span>
                                                <span className="text-emerald-500 text-xs font-black mb-2">+15% este tri</span>
                                            </div>
                                        </div>
                                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Eficiência Operacional</p>
                                            <div className="flex items-end gap-2">
                                                <span className="text-4xl font-black">+32%</span>
                                                <span className="text-orange-500 text-xs font-black mb-2">vs. s/ Dockha</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setActiveTab('approvals')}
                                    className="w-full mt-10 bg-white text-zinc-950 py-4 rounded-2xl text-xs font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3"
                                >
                                    Ver Relatório Completo <ArrowUpRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* APPROVALS TAB */}
                {activeTab === 'approvals' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Central de Aprovações</h2>
                                <p className="text-zinc-500 dark:text-zinc-400">Revise e aprove os materiais criados pela nossa equipe.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {APPROVAL_QUEUE.map((item) => (
                                <div key={item.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1">
                                    <div 
                                        className="h-56 bg-zinc-100 dark:bg-zinc-800 relative cursor-pointer overflow-hidden"
                                        onClick={() => setSelectedAsset(item)}
                                    >
                                        {item.preview ? (
                                            <img src={item.preview} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 p-6 text-center bg-zinc-50 dark:bg-zinc-800">
                                                <FileText size={48} className="mb-3 text-zinc-300 dark:text-zinc-600" />
                                                <p className="text-xs font-medium max-w-[200px]">{item.textPreview}</p>
                                            </div>
                                        )}
                                        
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                            <span className="text-white font-bold border-2 border-white px-6 py-2 rounded-full hover:bg-white hover:text-black transition-colors flex items-center gap-2">
                                                <Eye size={16} /> Visualizar
                                            </span>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="absolute top-3 right-3">
                                            {item.status === 'approved' ? (
                                                <span className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                                                    <CheckCircle2 size={12} /> APROVADO
                                                </span>
                                            ) : (
                                                <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 animate-pulse">
                                                    <Clock size={12} /> PENDENTE
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded uppercase tracking-wide border border-orange-100 dark:border-orange-900/30">{item.type}</span>
                                                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mt-2 text-lg leading-tight">{item.title}</h3>
                                                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Postado {item.date}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-auto pt-5 border-t border-zinc-100 dark:border-zinc-800 flex gap-3">
                                            {item.status === 'pending' ? (
                                                <>
                                                    <button className="flex-1 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-800 dark:hover:bg-white transition-colors shadow-sm">
                                                        Aprovar
                                                    </button>
                                                    <button className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                                                        Ajustes
                                                    </button>
                                                </>
                                            ) : (
                                                <button className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 py-2.5 rounded-lg text-sm font-bold cursor-default flex items-center justify-center gap-2">
                                                    <CheckCircle2 size={16} /> Já Aprovado
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* FINANCE TAB */}
                {activeTab === 'finance' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Faturas & Contratos</h2>
                            <button className="text-sm font-medium text-orange-600 hover:underline">Ver contrato original</button>
                        </div>
                        
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase border-b border-zinc-200 dark:border-zinc-700">
                                    <tr>
                                        <th className="px-6 py-4">Descrição</th>
                                        <th className="px-6 py-4">Vencimento</th>
                                        <th className="px-6 py-4">Valor</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {INVOICES.map(inv => (
                                        <tr key={inv.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-zinc-900 dark:text-zinc-100">{inv.desc}</div>
                                                <div className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">{inv.id}</div>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                                <Calendar size={14} /> {inv.due}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">{inv.amount}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                    inv.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                                }`}>
                                                    {inv.status === 'paid' ? 'Pago' : 'Pendente'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 border border-zinc-200 dark:border-zinc-700 hover:border-orange-200 px-3 py-1.5 rounded transition-colors flex items-center gap-1 ml-auto">
                                                    <Download size={12} /> PDF
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>

        {/* ASSET PREVIEW MODAL */}
        {selectedAsset && (
            <Modal
                isOpen={!!selectedAsset}
                onClose={() => setSelectedAsset(null)}
                title={selectedAsset.title}
                size="xl"
                footer={
                    <>
                        <button className="px-4 py-2 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-2 border border-zinc-200 dark:border-zinc-700">
                            <MessageSquare size={16} /> Solicitar Ajuste
                        </button>
                        <div className="flex-1" />
                        <button onClick={() => setSelectedAsset(null)} className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">Fechar</button>
                        <button className="px-6 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm flex items-center gap-2">
                            <ThumbsUp size={16} /> Aprovar Agora
                        </button>
                    </>
                }
            >
                <div className="bg-zinc-900 rounded-lg flex items-center justify-center p-8 min-h-[400px] overflow-hidden relative">
                    {selectedAsset.preview ? (
                        <img src={selectedAsset.preview} className="max-w-full max-h-[60vh] rounded shadow-2xl" />
                    ) : (
                        <div className="text-center p-8 max-w-lg">
                            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FileText size={40} className="text-zinc-500" />
                            </div>
                            <h3 className="text-white font-bold text-xl mb-4">Prévia de Texto</h3>
                            <div className="bg-zinc-800 p-6 rounded-lg text-left">
                                <p className="text-zinc-300 font-medium leading-relaxed font-serif">{selectedAsset.textPreview}</p>
                                <p className="text-zinc-500 mt-4 italic text-sm">[...conteúdo completo do email/copy aqui...]</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-6">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">Comentários da Equipe</h4>
                    <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 mr-2">Designer:</span>
                        Segue versão 2.0 com as cores ajustadas conforme solicitado na reunião.
                    </div>
                </div>
            </Modal>
        )}

    </div>
  );
};

export default TokyonClientPortal;
