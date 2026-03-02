
import React, { useState } from 'react';
import { Search, Filter, Plus, Kanban, List, Users, Briefcase, DollarSign, Calendar, Mail, Phone, MapPin, CheckCircle2, MoreHorizontal, ArrowRight, Layers, Paperclip, MessageSquare } from 'lucide-react';
import KanbanBoard from '../kanban/KanbanBoard';
import { KanbanColumnData, KanbanCardData } from '../../../../types';
import Modal from '../../../../components/common/Modal';
import OrgTag from '../../../../components/common/OrgTag';

const CRM_DATA: KanbanColumnData[] = [
    {
        id: 'leads', title: 'Novos Leads', color: 'bg-blue-400',
        cards: [
            { id: 'c1', title: 'Grupo Soma', subtitle: 'Contato via LinkedIn', date: 'Hoje', tags: [{ label: 'High Ticket', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' }], members: ['https://picsum.photos/id/11/50/50'] },
            { id: 'c2', title: 'TechStart', subtitle: 'Indicação Fauves', date: 'Ontem', tags: [{ label: 'Consultoria', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' }] }
        ]
    },
    {
        id: 'discovery', title: 'Qualificação', color: 'bg-indigo-400',
        cards: [
            { id: 'c3', title: 'Rede D’Or', subtitle: 'Reunião de Diagnóstico', date: '24/02', priority: 'high', value: 'R$ 80k', members: ['https://picsum.photos/id/64/50/50'] }
        ]
    },
    {
        id: 'proposal', title: 'Proposta Enviada', color: 'bg-amber-400',
        cards: [
            { id: 'c4', title: 'XP Inc.', subtitle: 'Aguardando Aprovação', value: 'R$ 120k', date: '20/02', tags: [{ label: 'Orange Program', color: 'bg-docka-900 text-white dark:bg-zinc-100 dark:text-zinc-900' }] },
            { id: 'c5', title: 'Localiza', subtitle: 'Revisão Jurídica', value: 'R$ 45k', date: '18/02' }
        ]
    },
    {
        id: 'closed', title: 'Fechado / Onboarding', color: 'bg-emerald-500',
        cards: [
            { id: 'c6', title: 'Taurus', subtitle: 'Kick-off realizado', value: 'R$ 200k', date: '15/02', tags: [{ label: 'Orange Program', color: 'bg-docka-900 text-white dark:bg-zinc-100 dark:text-zinc-900' }] }
        ]
    }
];

const PROJECTS_DATA: KanbanColumnData[] = [
    {
        id: 'brand', title: 'Brand Core', color: 'bg-docka-800',
        cards: [
            { id: 'p1', title: 'Taurus: Identidade Visual', subtitle: 'Refinamento de Logo', date: '26/02', tags: [{ label: 'Design', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' }], members: ['https://picsum.photos/id/32/50/50'] }
        ]
    },
    {
        id: 'web', title: 'Web Evolution', color: 'bg-orange-500',
        cards: [
            { id: 'p2', title: 'SulAmérica: Redesign', subtitle: 'Desenvolvimento Frontend', date: '28/02', priority: 'high', tags: [{ label: 'Dev', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' }], members: ['https://picsum.photos/id/12/50/50'] },
            { id: 'p3', title: 'Netonda: Landing Page', subtitle: 'Copywriting', date: '01/03', tags: [{ label: 'Copy', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' }] }
        ]
    },
    {
        id: 'social', title: 'Social Presence', color: 'bg-purple-500',
        cards: [
            { id: 'p4', title: 'Körber: Conteúdo Março', subtitle: 'Agendamento', date: '01/03', members: ['https://picsum.photos/id/65/50/50'] }
        ]
    },
    {
        id: 'legal', title: 'Proteção (Legal)', color: 'bg-blue-600',
        cards: [
            { id: 'p5', title: 'Planeta: Registro INPI', subtitle: 'Aguardando despacho', date: '10/03', tags: [{ label: 'INPI', color: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300' }] }
        ]
    }
];

const TokyonClientsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'crm' | 'projects'>('crm');
    const [activeModal, setActiveModal] = useState<'lead' | 'project' | null>(null);

    // State for Details
    const [selectedLead, setSelectedLead] = useState<KanbanCardData | null>(null);
    const [selectedProject, setSelectedProject] = useState<KanbanCardData | null>(null);

    const handleCreateClick = () => {
        setActiveModal(activeTab === 'crm' ? 'lead' : 'project');
    };

    const handleCardClick = (card: KanbanCardData) => {
        if (activeTab === 'crm') {
            setSelectedLead(card);
        } else {
            setSelectedProject(card);
        }
    };

    return (
        <div className="h-full flex flex-col bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 transition-colors">

            {/* Header */}
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 border-b border-docka-200 dark:border-zinc-800 px-8 py-5 shrink-0 transition-colors">
                <div className="max-w-6xl mx-auto w-full">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Clientes & Projetos</h1>
                            <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gerencie seu pipeline comercial e entregas do Orange Program.</p>
                        </div>
                        <button
                            onClick={handleCreateClick}
                            className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Plus size={16} /> {activeTab === 'crm' ? 'Novo Lead' : 'Novo Projeto'}
                        </button>
                    </div>

                    <div className="flex justify-between items-end">
                        {/* Tabs */}
                        <div className="flex space-x-6">
                            <button
                                onClick={() => setActiveTab('crm')}
                                className={`pb-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'crm' ? 'border-docka-900 dark:border-zinc-100 text-docka-900 dark:text-zinc-100' : 'border-transparent text-docka-500 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300'}`}
                            >
                                CRM / Vendas
                            </button>
                            <button
                                onClick={() => setActiveTab('projects')}
                                className={`pb-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'projects' ? 'border-orange-500 text-orange-600' : 'border-transparent text-docka-500 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300'}`}
                            >
                                Gestão de Projetos
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-3 mb-1">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
                                <input className="pl-8 pr-3 py-1.5 text-xs bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-md outline-none focus:border-docka-400 dark:focus:border-zinc-500 transition-colors w-40 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600" placeholder="Filtrar..." />
                            </div>
                            <button className="p-1.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200"><Filter size={14} /></button>
                            <button className="p-1.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200"><Users size={14} /></button>
                            <div className="w-px h-6 bg-docka-200 dark:bg-zinc-800 mx-1" />
                            <button className="p-1.5 bg-docka-100 dark:bg-zinc-800 rounded text-docka-900 dark:text-zinc-100"><Kanban size={14} /></button>
                            <button className="p-1.5 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200"><List size={14} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden p-6 overflow-y-auto custom-scrollbar">
                <div className="max-w-6xl mx-auto w-full h-full">
                    <KanbanBoard
                        columns={activeTab === 'crm' ? CRM_DATA : PROJECTS_DATA}
                        onCardClick={handleCardClick}
                    />
                </div>
            </div>

            {/* MODAL: NEW LEAD */}
            <Modal
                isOpen={activeModal === 'lead'}
                onClose={() => setActiveModal(null)}
                title="Novo Lead de Vendas"
                footer={
                    <>
                        <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg">Cancelar</button>
                        <button onClick={() => setActiveModal(null)} className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white rounded-lg shadow-sm">Criar Lead</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Nome da Empresa</label>
                        <div className="relative">
                            <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                            <input className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100" placeholder="Ex: Acme Corp" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Valor Estimado</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                                <input className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100" placeholder="0,00" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Origem</label>
                            <select className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100">
                                <option>Indicação</option>
                                <option>LinkedIn</option>
                                <option>Inbound</option>
                                <option>Outbound</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Contato Principal</label>
                        <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100" placeholder="Nome do decisor" />
                    </div>
                </div>
            </Modal>

            {/* MODAL: NEW PROJECT */}
            <Modal
                isOpen={activeModal === 'project'}
                onClose={() => setActiveModal(null)}
                title="Novo Projeto Tokyon"
                footer={
                    <>
                        <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg">Cancelar</button>
                        <button onClick={() => setActiveModal(null)} className="px-6 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm">Criar Projeto</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Título do Projeto</label>
                        <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 text-docka-900 dark:text-zinc-100" placeholder="Ex: Redesign E-commerce" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Cliente</label>
                            <select className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100">
                                <option>Selecione...</option>
                                <option>Taurus</option>
                                <option>SulAmérica</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Prazo / Deadline</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                                <input type="date" className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Fase do Orange Program</label>
                        <select className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100">
                            <option>1. Posicionamento (Brand)</option>
                            <option>2. Presença Digital (Web)</option>
                            <option>3. Automação (Tech)</option>
                            <option>4. Crescimento (Ads/Sales)</option>
                            <option>5. Proteção (Legal)</option>
                        </select>
                    </div>
                </div>
            </Modal>

            {/* MODAL: LEAD DETAILS (CRM) */}
            {selectedLead && (
                <Modal
                    isOpen={!!selectedLead}
                    onClose={() => setSelectedLead(null)}
                    title=""
                    size="lg"
                >
                    <div className="flex flex-col md:flex-row gap-8 -mt-2">
                        {/* LEFT COLUMN: Main Info */}
                        <div className="flex-1 space-y-6">
                            {/* Header Area */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-xs text-docka-400 dark:text-zinc-500 font-mono uppercase">LEAD #{selectedLead.id.toUpperCase()}</div>
                                    <div className="flex items-center gap-2">
                                        {selectedLead.tags?.map((tag, i) => (
                                            <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tag.color}`}>
                                                {tag.label}
                                            </span>
                                        ))}
                                        <button className="text-docka-400 hover:text-docka-900 dark:hover:text-zinc-200">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                </div>
                                <input
                                    className="text-2xl font-bold text-docka-900 dark:text-zinc-100 w-full bg-transparent outline-none focus:bg-docka-50 dark:focus:bg-zinc-800 rounded px-1 -ml-1 transition-colors mb-1"
                                    defaultValue={selectedLead.title}
                                />
                                <p className="text-sm text-docka-500 dark:text-zinc-400 px-1">{selectedLead.subtitle}</p>
                            </div>

                            {/* Value & Probability */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-docka-50 dark:bg-zinc-800 rounded-xl border border-docka-100 dark:border-zinc-700">
                                    <label className="block text-xs font-bold text-docka-500 dark:text-zinc-400 uppercase mb-1">Valor do Deal</label>
                                    <div className="flex items-center text-lg font-bold text-docka-900 dark:text-zinc-100">
                                        <DollarSign size={16} className="text-docka-400 dark:text-zinc-500 mr-1" />
                                        {selectedLead.value || '0,00'}
                                    </div>
                                </div>
                                <div className="p-4 bg-docka-50 dark:bg-zinc-800 rounded-xl border border-docka-100 dark:border-zinc-700">
                                    <label className="block text-xs font-bold text-docka-500 dark:text-zinc-400 uppercase mb-1">Probabilidade</label>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-docka-900 dark:text-zinc-100">65%</span>
                                        <div className="w-16 h-1.5 bg-docka-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-orange-500 w-[65%]" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800 pb-2">Contato Principal</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-docka-100 dark:bg-zinc-800 flex items-center justify-center text-docka-500 dark:text-zinc-400">
                                            <Users size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-docka-900 dark:text-zinc-100">Roberto Almeida</div>
                                            <div className="text-xs text-docka-400 dark:text-zinc-500">Diretor de Marketing</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 pl-1">
                                        <Mail size={14} className="text-docka-400 dark:text-zinc-500" />
                                        <span className="text-sm text-docka-600 dark:text-zinc-400">roberto@empresa.com</span>
                                    </div>
                                    <div className="flex items-center gap-3 pl-1">
                                        <Phone size={14} className="text-docka-400 dark:text-zinc-500" />
                                        <span className="text-sm text-docka-600 dark:text-zinc-400">+55 11 99999-9999</span>
                                    </div>
                                    <div className="flex items-center gap-3 pl-1">
                                        <MapPin size={14} className="text-docka-400 dark:text-zinc-500" />
                                        <span className="text-sm text-docka-600 dark:text-zinc-400">São Paulo, SP</span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800 pb-2 mb-3">Notas</h4>
                                <textarea
                                    className="w-full min-h-[100px] p-3 text-sm bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg outline-none focus:border-docka-300 resize-none text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600"
                                    placeholder="Adicione notas sobre a negociação..."
                                />
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Pipeline & History */}
                        <div className="w-full md:w-80 border-l border-docka-100 dark:border-zinc-800 pl-0 md:pl-8 space-y-6">

                            {/* Pipeline Stage */}
                            <div>
                                <label className="block text-xs font-bold text-docka-500 dark:text-zinc-400 uppercase mb-2">Estágio do Pipeline</label>
                                <select className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 cursor-pointer text-docka-900 dark:text-zinc-100">
                                    <option>1. Novos Leads</option>
                                    <option>2. Qualificação</option>
                                    <option>3. Proposta Enviada</option>
                                    <option>4. Negociação</option>
                                    <option>5. Fechado / Ganho</option>
                                    <option>6. Perdido</option>
                                </select>
                            </div>

                            {/* Next Action */}
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <Calendar size={18} className="text-orange-600 dark:text-orange-500 mt-0.5" />
                                    <div>
                                        <div className="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase mb-1">Próximo Passo</div>
                                        <div className="text-sm font-medium text-docka-900 dark:text-zinc-100">Reunião de Apresentação</div>
                                        <div className="text-xs text-docka-500 dark:text-zinc-400 mt-1">Amanhã, 14:00</div>
                                    </div>
                                </div>
                                <button className="w-full mt-3 py-1.5 bg-white dark:bg-zinc-800 border border-orange-200 dark:border-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold rounded shadow-sm hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors">
                                    Marcar Concluído
                                </button>
                            </div>

                            {/* Activity Feed Mock */}
                            <div>
                                <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-4">Histórico Recente</h4>
                                <div className="space-y-4 relative before:absolute before:left-1.5 before:top-2 before:bottom-0 before:w-px before:bg-docka-200 dark:before:bg-zinc-800">
                                    {[
                                        { icon: Mail, title: 'Email enviado', desc: 'Proposta v1.pdf', time: 'Há 2h' },
                                        { icon: Phone, title: 'Chamada realizada', desc: 'Sem resposta', time: 'Ontem' },
                                        { icon: CheckCircle2, title: 'Lead Criado', desc: 'Via LinkedIn', time: '20/02' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-3 relative">
                                            <div className="w-3 h-3 bg-white dark:bg-zinc-900 border-2 border-docka-300 dark:border-zinc-600 rounded-full mt-1.5 relative z-10 shrink-0" />
                                            <div>
                                                <div className="text-xs font-bold text-docka-700 dark:text-zinc-300">{item.title}</div>
                                                <div className="text-xs text-docka-500 dark:text-zinc-500">{item.desc}</div>
                                                <div className="text-[10px] text-docka-400 dark:text-zinc-600 mt-0.5">{item.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-4 text-xs text-docka-400 dark:text-zinc-500 hover:text-docka-600 dark:hover:text-zinc-300 font-medium">+ Adicionar Atividade</button>
                            </div>

                            {/* Actions */}
                            <div className="pt-6 mt-auto border-t border-docka-100 dark:border-zinc-800">
                                <button className="w-full py-2.5 bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-docka-800 dark:hover:bg-white/90 transition-colors flex items-center justify-center gap-2 mb-2">
                                    <ArrowRight size={16} /> Mover para Proposta
                                </button>
                                <button className="w-full py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 text-docka-700 dark:text-zinc-300 rounded-lg text-sm font-medium hover:bg-docka-50 dark:hover:bg-zinc-700 transition-colors">
                                    Arquivar Lead
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* MODAL: PROJECT DETAILS (PM) */}
            {selectedProject && (
                <Modal
                    isOpen={!!selectedProject}
                    onClose={() => setSelectedProject(null)}
                    title=""
                    size="xl"
                >
                    <div className="flex flex-col gap-6 -mt-2">
                        {/* Header */}
                        <div className="flex justify-between items-start pb-6 border-b border-docka-100 dark:border-zinc-800">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="text-xs font-mono uppercase bg-docka-100 dark:bg-zinc-800 text-docka-600 dark:text-zinc-400 px-2 py-0.5 rounded">PRJ-{selectedProject.id.toUpperCase()}</div>
                                    <div className="flex items-center text-xs text-docka-500 dark:text-zinc-500">
                                        <OrgTag orgId="org_3" /> {/* Tokyon Org */}
                                        <span className="mx-2">/</span>
                                        <span>Brand Core</span>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">{selectedProject.title}</h2>
                                <p className="text-docka-500 dark:text-zinc-400 mt-1">{selectedProject.subtitle}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-docka-800 dark:hover:bg-white/90 transition-colors flex items-center gap-2">
                                    <CheckCircle2 size={16} /> Concluir Sprint
                                </button>
                                <button className="p-2 border border-docka-200 dark:border-zinc-700 rounded-lg text-docka-500 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-800 hover:text-docka-900 dark:hover:text-zinc-200 transition-colors">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-8">

                                {/* Stats/Progress */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 bg-docka-50 dark:bg-zinc-800 rounded-xl border border-docka-200 dark:border-zinc-700">
                                        <div className="text-xs text-docka-500 dark:text-zinc-400 font-bold uppercase mb-1">Progresso</div>
                                        <div className="text-2xl font-bold text-docka-900 dark:text-zinc-100 mb-2">65%</div>
                                        <div className="w-full h-1.5 bg-docka-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-orange-500 w-[65%]" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-docka-50 dark:bg-zinc-800 rounded-xl border border-docka-200 dark:border-zinc-700">
                                        <div className="text-xs text-docka-500 dark:text-zinc-400 font-bold uppercase mb-1">Tarefas</div>
                                        <div className="text-2xl font-bold text-docka-900 dark:text-zinc-100">12<span className="text-docka-400 dark:text-zinc-600 text-sm font-normal">/18</span></div>
                                    </div>
                                    <div className="p-4 bg-docka-50 dark:bg-zinc-800 rounded-xl border border-docka-200 dark:border-zinc-700">
                                        <div className="text-xs text-docka-500 dark:text-zinc-400 font-bold uppercase mb-1">Deadline</div>
                                        <div className="text-lg font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2 mt-1">
                                            <Calendar size={18} className="text-orange-600 dark:text-orange-500" /> {selectedProject.date}
                                        </div>
                                    </div>
                                </div>

                                {/* Task List */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                            <Layers size={18} /> Entregáveis & Tarefas
                                        </h3>
                                        <button className="text-xs font-medium text-orange-600 dark:text-orange-500 hover:text-orange-800 dark:hover:text-orange-400 hover:underline">+ Adicionar Tarefa</button>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            { title: 'Briefing de Identidade Visual', status: 'done' },
                                            { title: 'Aprovação de Moodboard', status: 'done' },
                                            { title: 'Desenvolvimento de Logo (Conceitos)', status: 'in_progress' },
                                            { title: 'Apresentação Final', status: 'todo' },
                                        ].map((task, i) => (
                                            <div key={i} className="flex items-center p-3 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg group hover:border-orange-300 dark:hover:border-orange-700 transition-colors cursor-pointer">
                                                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${task.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-docka-300 dark:border-zinc-600'}`}>
                                                    {task.status === 'done' && <CheckCircle2 size={12} />}
                                                </div>
                                                <span className={`text-sm font-medium ${task.status === 'done' ? 'text-docka-400 dark:text-zinc-500 line-through' : 'text-docka-900 dark:text-zinc-100'}`}>{task.title}</span>
                                                {task.status === 'in_progress' && <span className="ml-auto text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded font-bold uppercase">Em andamento</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Files */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                            <Paperclip size={18} /> Arquivos do Projeto
                                        </h3>
                                        <button className="text-xs font-medium text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200 hover:underline">Ver Drive</button>
                                    </div>
                                    <div className="flex gap-4 overflow-x-auto pb-2">
                                        {[1, 2].map(i => (
                                            <div key={i} className="min-w-[160px] p-3 border border-docka-200 dark:border-zinc-700 rounded-lg flex items-center gap-3 bg-white dark:bg-zinc-800 hover:bg-docka-50 dark:hover:bg-zinc-700 cursor-pointer transition-colors">
                                                <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded flex items-center justify-center font-bold text-xs uppercase">PDF</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-docka-900 dark:text-zinc-100 truncate">Brandbook_v{i}</div>
                                                    <div className="text-[10px] text-docka-500 dark:text-zinc-400">2.4 MB</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>

                            {/* Sidebar */}
                            <div className="space-y-8">
                                {/* Team */}
                                <div>
                                    <h3 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Equipe Alocada</h3>
                                    <div className="space-y-3">
                                        {selectedProject.members?.map((avatar, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <img src={avatar} className="w-8 h-8 rounded-full border border-docka-200 dark:border-zinc-700" />
                                                <div>
                                                    <div className="text-sm font-medium text-docka-900 dark:text-zinc-100">Membro da Equipe</div>
                                                    <div className="text-xs text-docka-500 dark:text-zinc-400">Designer Senior</div>
                                                </div>
                                            </div>
                                        ))}
                                        <button className="w-full py-2 border border-dashed border-docka-300 dark:border-zinc-700 rounded-lg text-xs font-medium text-docka-500 dark:text-zinc-400 hover:border-docka-400 dark:hover:border-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300 transition-colors">
                                            + Adicionar Membro
                                        </button>
                                    </div>
                                </div>

                                {/* Updates Feed */}
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30">
                                    <h3 className="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider mb-3">Últimas Atualizações</h3>
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                                            <div>
                                                <p className="text-xs text-docka-800 dark:text-zinc-300 leading-relaxed">Cliente aprovou o conceito inicial do logotipo.</p>
                                                <span className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">Há 2h - por Alex</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 rounded-full bg-docka-300 dark:bg-zinc-600 mt-1.5 shrink-0" />
                                            <div>
                                                <p className="text-xs text-docka-800 dark:text-zinc-300 leading-relaxed">Arquivos de moodboard enviados para revisão.</p>
                                                <span className="text-[10px] text-docka-400 dark:text-zinc-500 font-medium">Ontem - por Sarah</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-orange-200/50 dark:border-orange-900/30">
                                        <button className="text-xs font-bold text-orange-700 dark:text-orange-400 hover:underline flex items-center gap-1">
                                            <MessageSquare size={12} /> Comentar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default TokyonClientsView;
