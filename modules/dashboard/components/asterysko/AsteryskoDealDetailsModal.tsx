import React, { useState, useEffect } from 'react';
import { X, Check, FileText, Plus, MoreVertical, Clock, Paperclip, DollarSign, Calendar, UploadCloud, CreditCard, Receipt, FileSignature } from 'lucide-react';
import api from '../../../../services/api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    card: any; 
}

const AsteryskoDealDetailsModal: React.FC<Props> = ({ isOpen, onClose, card }) => {
    const [activeTab, setActiveTab] = useState('Visão geral');
    const [isClosing, setIsClosing] = useState(false);
    const [newObservation, setNewObservation] = useState('');
    const [observations, setObservations] = useState<any[]>([
        { author: 'LC', name: 'Levy Câmara', date: '11 jul. 2026 às 10:24', text: 'Cliente interessado em proteção nacional inicial. Aguardando definição de classes.' }
    ]);

    // Derived card data
    const dealTitle = card?.title || 'Novo Processo';
    const clientName = card?.contactName || card?.subtitle || 'Sem cliente vinculado';
    const clientEmail = card?.contactEmail || 'Sem email cadastrado';
    const clientPhone = card?.contactPhone || 'Sem telefone';
    const dealValue = card?.value || 'R$ 0,00';
    const dealDate = card?.date ? `Adicionado em ${card.date}` : 'Data não informada';
    const sourceTag = card?.tags?.find((t: any) => typeof t === 'string' ? t.toLowerCase().includes('site') : t.label?.toLowerCase().includes('site')) ? 'Site' : 'Manual';
    const priority = card?.priority === 'high' ? 'Alta' : card?.priority === 'low' ? 'Baixa' : 'Normal';
    const assignedUser = card?.assignedUserId ? 'Usuário Atribuído' : 'Sem dono';

    // Simulated data for process fields (ideally this comes from a full API fetch for the deal/process)
    const processData = {
        servico: card?.serviceInterest || 'Registro de marca',
        marca: dealTitle,
        apresentacao: card?.presentation || 'Nominativa',
        natureza: card?.nature || 'Produto ou serviço',
        classe: card?.nclClass || 'NCL 1',
        titular: clientName,
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300);
    };

    const handleAddObservation = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newObservation.trim()) {
            setObservations([{
                author: 'LC',
                name: 'Levy Câmara',
                date: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' }),
                text: newObservation
            }, ...observations]);
            setNewObservation('');
        }
    };

    if (!isOpen && !isClosing) return null;

    const tabs = ['Visão geral', 'Atividades', 'Documentos', 'Financeiro', 'Histórico'];
    const steps = ['Novos Leads', 'Preparação', 'Viabilidade', 'Contrato', 'Pagamento', 'Docs/Taxas', 'Protocolo'];

    // Determine current step index based on status
    const statusMap: Record<string, number> = {
        'leads': 0,
        'preparation': 1,
        'viability': 2,
        'contract': 3,
        'service_payment': 4,
        'documentation': 5,
        'federal_fee': 5,
        'ready_to_file': 6,
        'filed': 6,
        'examination': 6,
        'opposition': 6,
        'granted': 6,
        'won': 6
    };
    const currentStepIdx = statusMap[card?.status] || 0;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen && !isClosing ? 'bg-black/20 dark:bg-black/40 backdrop-blur-sm opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div 
                className={`bg-[#fcfcfc] dark:bg-zinc-950 w-full max-w-[1000px] h-[90vh] rounded-[24px] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform ${isOpen && !isClosing ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}`}
            >
                {/* Header */}
                <div className="bg-white dark:bg-zinc-900 border-b border-[#e5e5e5] dark:border-zinc-800 shrink-0">
                    <div className="p-6 pb-0">
                        <div className="flex justify-between items-start mb-2">
                            <span className="bg-[#eef2ff] dark:bg-blue-900/30 text-[#0412dd] dark:text-[#3b48ff] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                {card?.status || 'Em preparação'}
                            </span>
                            <button onClick={handleClose} className="text-[#9f9f9f] hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1.5 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <h2 className="font-season text-[32px] font-[420] text-black dark:text-white leading-tight">
                            {dealTitle}
                        </h2>
                        <p className="text-sm font-medium text-[#9f9f9f] mt-1 mb-6 flex items-center gap-2">
                            Processo AST-{card?.id?.slice(0,8) || '0000'} <span className="w-1 h-1 rounded-full bg-[#ccc]"></span> Cliente: {clientName}
                        </p>
                        
                        {/* Tabs */}
                        <div className="flex gap-2">
                            {tabs.map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-2.5 rounded-t-xl text-[13px] font-bold transition-colors ${activeTab === tab ? 'bg-[#0412dd] dark:bg-[#3b48ff] text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-[#666] dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#fcfcfc] dark:bg-zinc-950">
                    
                    {/* TAB: VISÃO GERAL */}
                    {activeTab === 'Visão geral' && (
                        <div className="flex min-h-full">
                            {/* Left Column (Main) */}
                            <div className="flex-1 border-r border-[#e5e5e5] dark:border-zinc-800 p-8 pb-16 flex flex-col gap-8">
                                
                                {/* Próxima Ação */}
                                <div>
                                    <p className="text-[11px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-2">Próxima ação pendente</p>
                                    <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-[#eef2ff] dark:border-blue-900/30 p-4 rounded-xl shadow-sm">
                                        <div>
                                            <h3 className="font-season text-[20px] font-[420] text-black dark:text-white mb-1">Realizar análise de viabilidade</h3>
                                            <p className="text-[12px] font-medium text-[#666] dark:text-zinc-400">
                                                Prazo: <span className="font-bold text-[#0412dd] dark:text-[#3b48ff]">Hoje</span> &nbsp;&nbsp; Responsável: <span className="font-bold text-black dark:text-white">{assignedUser}</span>
                                            </p>
                                        </div>
                                        <button className="bg-[#0412dd] dark:bg-[#3b48ff] text-white text-[13px] font-bold px-5 py-2.5 rounded-full hover:bg-blue-800 transition-colors">
                                            Concluir
                                        </button>
                                    </div>
                                </div>

                                {/* Andamento (Stepper) */}
                                <div className="border-y border-[#e5e5e5] dark:border-zinc-800 py-8">
                                    <p className="text-[11px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-6">Andamento do Funil</p>
                                    <div className="flex items-center justify-between relative">
                                        <div className="absolute left-6 right-6 top-4 h-[1px] bg-[#e5e5e5] dark:bg-zinc-800 -z-10" />
                                        {steps.map((step, idx) => {
                                            const isCompleted = idx < currentStepIdx;
                                            const isActive = idx === currentStepIdx;
                                            return (
                                                <div key={step} className="flex flex-col items-center gap-2 bg-[#fcfcfc] dark:bg-zinc-950 px-2">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-[#0412dd] border-[#0412dd] text-white' : isActive ? 'border-[#0412dd] bg-white dark:bg-zinc-900' : 'border-[#ccc] dark:border-zinc-700 bg-white dark:bg-zinc-900'}`}>
                                                        {isCompleted ? <Check size={16} strokeWidth={3} /> : isActive ? <div className="w-2.5 h-2.5 rounded-full bg-[#0412dd]" /> : null}
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`text-[12px] font-bold ${isActive ? 'text-[#0412dd] dark:text-[#3b48ff]' : isCompleted ? 'text-black dark:text-white' : 'text-[#9f9f9f]'}`}>{step}</p>
                                                        {isCompleted && <p className="text-[10px] font-medium text-[#9f9f9f]">Concluído</p>}
                                                        {isActive && <p className="text-[10px] font-bold text-[#0412dd] dark:text-[#3b48ff]">Atual</p>}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Dados do processo */}
                                <div>
                                    <p className="text-[11px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-4">Dados Técnicos da Marca</p>
                                    <div className="flex flex-col gap-0 bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 rounded-xl px-4 py-2">
                                        {[
                                            { label: 'Serviço', value: processData.servico },
                                            { label: 'Marca', value: processData.marca },
                                            { label: 'Apresentação', value: processData.apresentacao },
                                            { label: 'Natureza', value: processData.natureza },
                                            { label: 'Classe de Nice', value: processData.classe },
                                            { label: 'Titular', value: processData.titular },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between py-3 border-b border-[#f0f0f0] dark:border-zinc-800/50 last:border-0 group">
                                                <span className="text-[13px] font-semibold text-[#666] dark:text-zinc-400 w-1/3">{item.label}</span>
                                                <div className="flex-1 flex justify-between items-center">
                                                    <span className="text-[13px] font-medium text-black dark:text-white">{item.value}</span>
                                                    <button className="opacity-0 group-hover:opacity-100 text-[#9f9f9f] hover:text-[#0412dd] transition-all">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Observações */}
                                <div>
                                    <p className="text-[11px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-4">Anotações e Histórico Rápido</p>
                                    
                                    <div className="flex flex-col gap-6 mb-6">
                                        {observations.map((obs, idx) => (
                                            <div key={idx} className="flex gap-4">
                                                <div className="w-8 h-8 rounded-full bg-[#eef2ff] dark:bg-blue-900/30 text-[#0412dd] dark:text-[#3b48ff] flex items-center justify-center text-xs font-bold shrink-0">{obs.author}</div>
                                                <div>
                                                    <div className="flex items-baseline gap-2 mb-1">
                                                        <span className="text-[13px] font-bold text-black dark:text-white">{obs.name}</span>
                                                        <span className="text-[11px] font-medium text-[#9f9f9f]">{obs.date}</span>
                                                    </div>
                                                    <p className="text-[13px] font-medium text-[#666] dark:text-zinc-300 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-[#e5e5e5] dark:border-zinc-800 shadow-sm inline-block mt-1">{obs.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <input 
                                        type="text" 
                                        placeholder="Escreva uma nova anotação e aperte Enter..."
                                        value={newObservation}
                                        onChange={(e) => setNewObservation(e.target.value)}
                                        onKeyDown={handleAddObservation}
                                        className="w-full border border-[#e5e5e5] dark:border-zinc-700 rounded-lg px-4 py-3 text-[13px] font-medium bg-white dark:bg-zinc-900 focus:border-[#0412dd] outline-none transition-colors dark:text-white shadow-sm"
                                    />
                                </div>

                            </div>

                            {/* Right Column (Sidebar) */}
                            <div className="w-[320px] bg-white dark:bg-zinc-900 p-8 flex flex-col gap-8 shrink-0">
                                
                                {/* Resumo Comercial */}
                                <div>
                                    <p className="text-[11px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-4">Resumo comercial</p>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[13px] font-semibold text-[#666] dark:text-zinc-400">Valor Estimado</span>
                                            <span className="text-[14px] font-bold text-[#0412dd] dark:text-[#3b48ff]">{dealValue}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[13px] font-semibold text-[#666] dark:text-zinc-400">Origem</span>
                                            <span className="text-[13px] font-medium text-black dark:text-white">{sourceTag}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[13px] font-semibold text-[#666] dark:text-zinc-400">Prioridade</span>
                                            <span className="text-[13px] font-medium text-black dark:text-white">{priority}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[13px] font-semibold text-[#666] dark:text-zinc-400">Responsável</span>
                                            <span className="text-[13px] font-medium text-black dark:text-white">{assignedUser}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[13px] font-semibold text-[#666] dark:text-zinc-400">Data de Entrada</span>
                                            <span className="text-[13px] font-medium text-black dark:text-white">{dealDate}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Cliente */}
                                <div className="border-t border-[#e5e5e5] dark:border-zinc-800 pt-8">
                                    <p className="text-[11px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-4">Contato do Cliente</p>
                                    <h4 className="text-[14px] font-bold text-black dark:text-white mb-2">{clientName}</h4>
                                    <p className="text-[13px] font-medium text-[#666] dark:text-zinc-400 mb-1 flex items-center gap-2">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect><polyline points="3 7 12 13 21 7"></polyline></svg>
                                        {clientEmail}
                                    </p>
                                    <p className="text-[13px] font-medium text-[#666] dark:text-zinc-400 mb-4 flex items-center gap-2">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                        {clientPhone}
                                    </p>
                                    <button className="text-[12px] font-bold text-[#0412dd] dark:text-[#3b48ff] hover:underline bg-[#eef2ff] dark:bg-blue-900/20 px-3 py-1.5 rounded-md inline-block">
                                        Ver cadastro completo
                                    </button>
                                </div>

                                {/* Arquivos recentes */}
                                <div className="border-t border-[#e5e5e5] dark:border-zinc-800 pt-8">
                                    <p className="text-[11px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-4">Arquivos anexados</p>
                                    
                                    <div className="flex flex-col gap-2 mb-4">
                                        {card?.files?.length ? card.files.map((file: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-[#e5e5e5] dark:border-zinc-700/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                                                        <FileText size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[12px] font-bold text-black dark:text-white leading-tight">{file.name}</p>
                                                        <p className="text-[10px] font-medium text-[#9f9f9f]">{dealDate} • {file.size}</p>
                                                    </div>
                                                </div>
                                                <button className="text-[#9f9f9f] hover:text-black dark:hover:text-white">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        )) : (
                                            <p className="text-[12px] text-[#9f9f9f] italic">Nenhum arquivo anexado ainda.</p>
                                        )}
                                    </div>

                                    <button className="text-[12px] font-bold text-[#0412dd] dark:text-[#3b48ff] flex items-center gap-1 hover:underline">
                                        <Plus size={14} strokeWidth={3} /> Upload de arquivo
                                    </button>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* TAB: ATIVIDADES */}
                    {activeTab === 'Atividades' && (
                        <div className="p-8 pb-16 max-w-4xl mx-auto min-h-full">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="font-season text-[24px] font-[420] text-black dark:text-white">Plano de Ação</h3>
                                    <p className="text-[13px] text-[#666] dark:text-zinc-400">Tarefas e checklists pendentes para este lead.</p>
                                </div>
                                <button className="bg-black dark:bg-white text-white dark:text-black font-bold text-[13px] px-5 py-2.5 rounded-full hover:opacity-80 transition-opacity">
                                    + Nova Tarefa
                                </button>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { title: 'Realizar análise de viabilidade', due: 'Hoje', status: 'pending', user: 'LC' },
                                    { title: 'Enviar proposta comercial PDF', due: 'Amanhã', status: 'pending', user: 'LC' },
                                    { title: 'Contato inicial via WhatsApp', due: '11 jul. 2026', status: 'done', user: 'LC' },
                                ].map((task, idx) => (
                                    <div key={idx} className={`flex items-center gap-4 p-4 rounded-xl border ${task.status === 'done' ? 'bg-zinc-50 dark:bg-zinc-900 border-transparent opacity-60' : 'bg-white dark:bg-zinc-900 border-[#e5e5e5] dark:border-zinc-800 shadow-sm'}`}>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer ${task.status === 'done' ? 'bg-[#0412dd] border-[#0412dd] text-white' : 'border-[#ccc] hover:border-[#0412dd]'}`}>
                                            {task.status === 'done' && <Check size={12} strokeWidth={4} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-[14px] font-bold ${task.status === 'done' ? 'text-[#9f9f9f] line-through' : 'text-black dark:text-white'}`}>{task.title}</p>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0">
                                            <span className="text-[12px] font-medium text-[#666] flex items-center gap-1">
                                                <Calendar size={14} /> {task.due}
                                            </span>
                                            <div className="w-6 h-6 rounded-full bg-[#f0f0f0] dark:bg-zinc-800 flex items-center justify-center text-[9px] font-bold">{task.user}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB: DOCUMENTOS */}
                    {activeTab === 'Documentos' && (
                        <div className="p-8 pb-16 max-w-4xl mx-auto min-h-full">
                            <div className="border-2 border-dashed border-[#e5e5e5] dark:border-zinc-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center mb-8 bg-zinc-50 dark:bg-zinc-900/30">
                                <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm mb-4 text-[#0412dd] dark:text-[#3b48ff]">
                                    <UploadCloud size={28} />
                                </div>
                                <h4 className="text-[16px] font-bold text-black dark:text-white mb-2">Arraste seus arquivos para cá</h4>
                                <p className="text-[13px] text-[#666] dark:text-zinc-400 mb-6 max-w-[300px]">Suporta PDF, JPG, PNG e DOCX de até 50MB. Os arquivos ficarão vinculados a este processo.</p>
                                <button className="bg-white dark:bg-zinc-800 border border-[#e5e5e5] dark:border-zinc-700 font-bold text-black dark:text-white text-[13px] px-6 py-2.5 rounded-full hover:bg-zinc-50 transition-colors shadow-sm">
                                    Procurar no computador
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 p-4 rounded-xl flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#0412dd] flex items-center justify-center shrink-0">
                                        <FileSignature size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[14px] font-bold text-black dark:text-white leading-tight mb-1">Procuração Assinada.pdf</p>
                                        <p className="text-[12px] text-[#666]">12 jul. 2026 • 1.2 MB</p>
                                    </div>
                                    <button className="text-[#9f9f9f] hover:text-black">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 p-4 rounded-xl flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                        <Receipt size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[14px] font-bold text-black dark:text-white leading-tight mb-1">Comprovante_GRU.pdf</p>
                                        <p className="text-[12px] text-[#666]">11 jul. 2026 • 450 KB</p>
                                    </div>
                                    <button className="text-[#9f9f9f] hover:text-black">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: FINANCEIRO */}
                    {activeTab === 'Financeiro' && (
                        <div className="p-8 pb-16 max-w-4xl mx-auto min-h-full">
                            <div className="grid grid-cols-3 gap-6 mb-8">
                                <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                                    <div className="w-10 h-10 bg-[#eef2ff] dark:bg-blue-900/30 text-[#0412dd] dark:text-[#3b48ff] rounded-full flex items-center justify-center mb-4">
                                        <DollarSign size={20} />
                                    </div>
                                    <p className="text-[12px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-1">Valor Contratado</p>
                                    <h3 className="font-season text-[32px] font-[420] text-black dark:text-white">{dealValue}</h3>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                                        <CreditCard size={20} />
                                    </div>
                                    <p className="text-[12px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-1">Total Recebido</p>
                                    <h3 className="font-season text-[32px] font-[420] text-black dark:text-white">R$ 0,00</h3>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mb-4">
                                        <Clock size={20} />
                                    </div>
                                    <p className="text-[12px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-1">A Receber</p>
                                    <h3 className="font-season text-[32px] font-[420] text-black dark:text-white">{dealValue}</h3>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-[#e5e5e5] dark:border-zinc-800 flex justify-between items-center">
                                    <h4 className="font-season text-[20px] font-[420] text-black dark:text-white">Faturas e Cobranças</h4>
                                    <button className="text-[13px] font-bold text-[#0412dd] hover:underline">+ Gerar Fatura</button>
                                </div>
                                <div className="p-12 text-center">
                                    <p className="text-[14px] text-[#666] font-medium">Nenhuma fatura gerada para este processo ainda.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: HISTÓRICO */}
                    {activeTab === 'Histórico' && (
                        <div className="p-8 pb-16 max-w-2xl mx-auto min-h-full">
                            <h3 className="font-season text-[24px] font-[420] text-black dark:text-white mb-8">Linha do Tempo</h3>
                            
                            <div className="relative border-l-2 border-[#e5e5e5] dark:border-zinc-800 ml-4 space-y-8 pb-8">
                                {[
                                    { action: 'Lead criado na etapa Novos leads', user: 'Levy Câmara', date: dealDate, icon: Plus, color: 'bg-green-100 text-green-600' },
                                    { action: 'Viabilidade solicitada', user: 'Sistema', date: dealDate, icon: FileText, color: 'bg-blue-100 text-blue-600' },
                                ].map((event, idx) => (
                                    <div key={idx} className="relative pl-8">
                                        <div className={`absolute -left-[17px] w-8 h-8 rounded-full border-4 border-[#fcfcfc] dark:border-zinc-950 flex items-center justify-center ${event.color}`}>
                                            <event.icon size={12} strokeWidth={3} />
                                        </div>
                                        <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 p-4 rounded-xl shadow-sm">
                                            <p className="text-[14px] font-bold text-black dark:text-white mb-1">{event.action}</p>
                                            <p className="text-[12px] font-medium text-[#666] flex items-center gap-2">
                                                <span>Por {event.user}</span> • <span>{event.date}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="bg-white dark:bg-zinc-950 border-t border-[#e5e5e5] dark:border-zinc-800 p-6 flex items-center justify-between shrink-0 z-10">
                    <button className="flex-1 max-w-[200px] h-12 bg-white dark:bg-transparent border-2 border-[#eef2ff] dark:border-blue-900 text-[#0412dd] dark:text-[#3b48ff] text-[14px] font-bold rounded-xl hover:bg-[#eef2ff] dark:hover:bg-blue-900/30 transition-colors">
                        Arquivar lead
                    </button>
                    <button className="flex-1 max-w-[400px] ml-4 h-12 bg-[#0412dd] dark:bg-[#3b48ff] text-white text-[14px] font-bold rounded-xl hover:bg-blue-800 transition-colors shadow-sm">
                        Avançar etapa do funil
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AsteryskoDealDetailsModal;
