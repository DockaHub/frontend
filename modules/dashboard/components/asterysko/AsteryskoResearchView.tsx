import React, { useState, useEffect } from 'react';
import { 
    Search, 
    AlertTriangle, 
    CheckCircle2, 
    Zap, 
    LayoutGrid, 
    Info, 
    Activity, 
    Shield, 
    Sparkles, 
    Filter,
    ChevronDown,
    Scale,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { api } from '../../../../services/api';
import { nclClasses, NclClass } from './data/nclClasses';
import DashboardPage from '../../../../components/DashboardPage';

const AsteryskoResearchView = () => {
    const [searchName, setSearchName] = useState('');
    const [nclQuery, setNclQuery] = useState('');
    const [selectedNcl, setSelectedNcl] = useState<NclClass | null>(nclClasses.find(c => c.id === '41') || null);
    const [isNclOpen, setIsNclOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Ganchos de estado para o protocolo e dossiê
    const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('ESSENCIAL');
    const [serviceValue, setServiceValue] = useState('899');
    const [isSubmittingProtocol, setIsSubmittingProtocol] = useState(false);
    const [protocolSuccess, setProtocolSuccess] = useState(false);

    // Gancho de estado e auxiliares para detalhe de conflito e tradução de status
    const [selectedConflict, setSelectedConflict] = useState<any | null>(null);

    const getStatusLabel = (status: string) => {
        const s = (status || '').toUpperCase().trim();
        switch (s) {
            case 'GRANTED': return 'Deferido / Concedido';
            case 'REFUSED': return 'Indeferido';
            case 'OPPOSITION': return 'Oposição';
            case 'EXAMINATION': return 'Em Exame de Mérito';
            case 'ARCHIVED': return 'Arquivado / Extinto';
            case 'WAITING_PAYMENT': return 'Aguardando Pagamento';
            case 'PENDING': return 'Pendente';
            default:
                return status;
        }
    };

    const getStatusBadgeStyle = (status: string) => {
        const s = (status || '').toUpperCase().trim();
        if (s.includes('ARQUIVADO') || s.includes('EXTINTO') || s === 'ARCHIVED') {
            return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700';
        }
        if (s === 'GRANTED') {
            return 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-900/10';
        }
        if (s === 'REFUSED') {
            return 'bg-rose-600 text-white border-rose-600 shadow-rose-900/10';
        }
        if (s === 'OPPOSITION') {
            return 'bg-amber-600 text-white border-amber-600 shadow-amber-900/10';
        }
        if (s === 'EXAMINATION' || s === 'PENDING') {
            return 'bg-blue-600 text-white border-blue-600 shadow-blue-900/10';
        }
        if (s === 'WAITING_PAYMENT') {
            return 'bg-amber-500 text-white border-amber-500 shadow-amber-900/10';
        }
        
        const sLower = s.toLowerCase();
        if (sLower.includes('deferido') || sLower.includes('concedido')) {
            return 'bg-emerald-500 text-white border-emerald-500';
        }
        if (sLower.includes('indeferido')) {
            return 'bg-rose-600 text-white border-rose-600';
        }
        return 'bg-rose-600 text-white border-rose-600 shadow-rose-900/10';
    };


    const handlePlanChange = (plan: string) => {
        setSelectedPlan(plan);
        if (plan === 'ESSENCIAL') setServiceValue('899');
        else if (plan === 'PREMIUM') setServiceValue('1499');
        else if (plan === 'PRO') setServiceValue('2499');
    };

    const handleGenerateDossier = () => {
        if (!result || !searchName.trim()) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const riskColor = result.riskLevel === 'HIGH' ? '#f43f5e' : result.riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981';
        const riskBg = result.riskLevel === 'HIGH' ? '#fef2f2' : result.riskLevel === 'MEDIUM' ? '#fffbeb' : '#ecfdf5';
        const riskLabel = result.riskLevel === 'HIGH' ? 'Alto Risco' : result.riskLevel === 'MEDIUM' ? 'Atenção' : 'Excelente';
        const riskTitle = result.riskLevel === 'HIGH' ? 'Registro Altamente Obstruído' : result.riskLevel === 'MEDIUM' ? 'Requer Estratégia de Defesa' : 'Caminho Livre para Registro';

        const conflictsHtml = (result.conflicts || []).map((c: any) => `
            <div style="padding: 16px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: space-between; page-break-inside: avoid;">
                <div>
                    <div style="font-weight: bold; font-size: 14px; text-transform: uppercase; color: #111827;">${c.brandName}</div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                        Processo INPI: <strong>${c.processNumber || 'N/A'}</strong> | Classe: <strong>${c.nclClass || 'N/A'}</strong> | Origem: <strong>${c.ownerName || 'INPI'}</strong>
                    </div>
                </div>
                <div style="padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; ${
                    c.status?.toLowerCase().includes('arquivado') || c.status?.toLowerCase().includes('extinto')
                    ? 'background-color: #f3f4f6; color: #9ca3af;'
                    : 'background-color: #fee2e2; color: #dc2626;'
                }">
                    ${c.status || 'Desconhecido'}
                </div>
            </div>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Dossie de Viabilidade - ${searchName}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
                    <style>
                        body {
                            font-family: 'Plus Jakarta Sans', sans-serif;
                            color: #1f2937;
                            margin: 0;
                            padding: 40px;
                            background-color: #ffffff;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            border-bottom: 2px solid #f3f4f6;
                            padding-bottom: 20px;
                            margin-bottom: 40px;
                        }
                        .logo {
                            font-size: 24px;
                            font-weight: 800;
                            color: #1d4ed8;
                            letter-spacing: -1px;
                        }
                        .date {
                            font-size: 12px;
                            color: #9ca3af;
                            font-weight: 500;
                        }
                        .title-section {
                            margin-bottom: 30px;
                        }
                        .title-section h1 {
                            font-size: 28px;
                            font-weight: 800;
                            margin: 0 0 8px 0;
                            color: #111827;
                        }
                        .title-section p {
                            font-size: 14px;
                            color: #6b7280;
                            margin: 0;
                        }
                        .grid {
                            display: grid;
                            grid-template-cols: 1fr 1fr;
                            gap: 30px;
                            margin-bottom: 40px;
                        }
                        .card-score {
                            background-color: ${riskBg};
                            border: 1px solid ${riskColor}30;
                            border-radius: 16px;
                            padding: 30px;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            text-align: center;
                        }
                        .score-circle {
                            width: 120px;
                            height: 120px;
                            border-radius: 50%;
                            border: 8px solid ${riskColor};
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 32px;
                            font-weight: 800;
                            color: ${riskColor};
                            margin-bottom: 20px;
                            background-color: #ffffff;
                        }
                        .risk-badge {
                            padding: 6px 16px;
                            border-radius: 9999px;
                            background-color: ${riskColor};
                            color: #ffffff;
                            font-size: 11px;
                            font-weight: 700;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            margin-bottom: 12px;
                            display: inline-block;
                        }
                        .risk-title {
                            font-size: 18px;
                            font-weight: 700;
                            margin: 0 0 10px 0;
                            color: #111827;
                        }
                        .risk-summary {
                            font-size: 12px;
                            color: #4b5563;
                            line-height: 1.6;
                            margin: 0;
                        }
                        .card-info {
                            border: 1px solid #e5e7eb;
                            border-radius: 16px;
                            padding: 30px;
                            background-color: #fafafa;
                        }
                        .info-title {
                            font-size: 12px;
                            font-weight: 700;
                            text-transform: uppercase;
                            color: #9ca3af;
                            margin-bottom: 20px;
                            letter-spacing: 1px;
                        }
                        .info-item {
                            margin-bottom: 16px;
                        }
                        .info-label {
                            font-size: 11px;
                            color: #9ca3af;
                            text-transform: uppercase;
                            font-weight: 600;
                        }
                        .info-value {
                            font-size: 14px;
                            font-weight: 700;
                            color: #111827;
                            margin-top: 4px;
                        }
                        .section-title {
                            font-size: 16px;
                            font-weight: 800;
                            color: #111827;
                            margin-bottom: 20px;
                            padding-bottom: 10px;
                            border-bottom: 2px solid #f3f4f6;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            margin-top: 30px;
                        }
                        .conflicts-list {
                            border: 1px solid #e5e7eb;
                            border-radius: 12px;
                            overflow: hidden;
                            margin-bottom: 40px;
                        }
                        .no-conflicts {
                            padding: 30px;
                            text-align: center;
                            color: #6b7280;
                            font-size: 13px;
                            font-weight: 500;
                        }
                        .footer {
                            margin-top: 60px;
                            border-top: 1px solid #e5e7eb;
                            padding-top: 20px;
                            text-align: center;
                            font-size: 11px;
                            color: #9ca3af;
                        }
                        @media print {
                            body {
                                padding: 0;
                            }
                            .no-print {
                                display: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">Asterysko.</div>
                        <div class="date">Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>

                    <div class="title-section">
                        <h1>Dossie de Viabilidade de Registro</h1>
                        <p>Relatório de colidência e análise preventiva de propriedade industrial</p>
                    </div>

                    <div class="grid">
                        <div class="card-score">
                            <div class="risk-badge">${riskLabel}</div>
                            <div class="score-circle">${result.score}%</div>
                            <h2 class="risk-title">${riskTitle}</h2>
                            <p class="risk-summary">${result.summary}</p>
                        </div>

                        <div class="card-info">
                            <div class="info-title">Detalhes do Ativo Analisado</div>
                            <div class="info-item">
                                <div class="info-label">Nome da Marca</div>
                                <div class="info-value" style="font-size: 20px; color: #1d4ed8;">${searchName}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Classe NCL Selecionada</div>
                                <div class="info-value">Classe ${selectedNcl?.id} - ${selectedNcl?.description}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Status da Consulta</div>
                                <div class="info-value" style="color: #10b981;">Análise Concluída</div>
                            </div>
                        </div>
                    </div>

                    <div class="section-title">Registros Colidentes Encontrados</div>
                    <div class="conflicts-list">
                        ${conflictsHtml || '<div class="no-conflicts">Nenhum registro colidente encontrado na classe indicada. O caminho está livre.</div>'}
                    </div>

                    <div class="section-title">Orientações e Próximos Passos</div>
                    <div style="font-size: 12px; line-height: 1.8; color: #4b5563; padding: 20px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; page-break-inside: avoid;">
                        <p style="margin-top: 0;"><strong>Análise Preventiva:</strong> O score apresentado baseia-se na similaridade exata e fonética em vigor nas bases ativas e de histórico do INPI e dos nossos clientes monitorados.</p>
                        <p style="margin-bottom: 0;"><strong>Recomendação Legal:</strong> ${
                            result.riskLevel === 'HIGH' 
                            ? 'Devido ao alto risco de colisão e existência de processos idênticos ativos, é desaconselhado iniciar o protocolo de registro sem antes reformular o nome da marca ou obter assessoria para contestação/acordo.'
                            : result.riskLevel === 'MEDIUM'
                            ? 'Há registros similares ou arquivados que exigem atenção. É altamente recomendável contar com um plano de oposição e proteção robusta durante o período de exame de mérito.'
                            : 'O cenário é excelente! Recomendamos iniciar o protocolo de registro o quanto antes para garantir o direito de prioridade sobre a marca.'
                        }</p>
                    </div>

                    <div class="footer">
                        Este documento é um relatório preliminar gerado pelo sistema de inteligência artificial da Asterysko e não substitui a consulta a assessores jurídicos especializados em propriedade industrial.
                    </div>

                    <script>
                        window.onload = function() {
                            window.print();
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleStartProtocol = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) return;

        setIsSubmittingProtocol(true);
        try {
            await api.post('/asterysko/crm/deals', {
                title: searchName,
                subtitle: clientName,
                contactName: clientName,
                contactEmail: clientEmail,
                contactPhone: clientPhone,
                value: parseFloat(serviceValue) || 0,
                status: 'leads',
                planType: selectedPlan,
                priority: 'medium',
                tags: ['Viabilidade']
            });
            setProtocolSuccess(true);
            setClientName('');
            setClientEmail('');
            setClientPhone('');
            setTimeout(() => {
                setIsProtocolModalOpen(false);
                setProtocolSuccess(false);
            }, 2000);
        } catch (error) {
            console.error('Failed to create protocol deal', error);
        } finally {
            setIsSubmittingProtocol(false);
        }
    };


    useEffect(() => {
        if (selectedNcl) {
            setNclQuery(`Classe ${selectedNcl.id} - ${selectedNcl.description.substring(0, 30)}...`);
        }
    }, [selectedNcl]);

    const filteredNcl = nclClasses.filter(ncl =>
        ncl.id.includes(nclQuery) ||
        ncl.description.toLowerCase().includes(nclQuery.toLowerCase()) ||
        ncl.keywords.some(k => k.toLowerCase().includes(nclQuery.toLowerCase()))
    );

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchName.trim() || !selectedNcl) return;

        setIsLoading(true);
        try {
            const response = await api.get('/asterysko/analysis/instant', {
                params: { name: searchName, ncl: selectedNcl.id }
            });
            setResult(response.data);
        } catch (error) {
            console.error('Analysis failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'HIGH': return 'bg-rose-500 text-white';
            case 'MEDIUM': return 'bg-amber-500 text-white';
            case 'LOW': return 'bg-emerald-500 text-white';
            default: return 'bg-docka-300 text-white';
        }
    };

    return (
        <DashboardPage
            title="Pesquisa e Viabilidade"
            subtitle="Inteligência instantânea para descoberta de novos ativos INPI."
            actions={
                <div className="flex gap-2">
                    <button className="p-2.5 bg-white dark:bg-zinc-800 border border-docka-50 dark:border-zinc-700 rounded-xl text-docka-400 hover:text-docka-900 transition-all shadow-sm">
                        <Filter size={18} />
                    </button>
                    <button className="p-2.5 bg-white dark:bg-zinc-800 border border-docka-50 dark:border-zinc-700 rounded-xl text-docka-400 hover:text-docka-900 transition-all shadow-sm">
                        <LayoutGrid size={18} />
                    </button>
                </div>
            }
        >
            <div className="max-w-6xl mx-auto py-4" onClick={() => setIsNclOpen(false)}>
                
                {/* HERO SEARCH AREA DS 3.0 */}
                <div className="relative mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="absolute inset-0 bg-docka-900/5 dark:bg-zinc-100/5 blur-[100px] -z-10 rounded-full scale-150" />
                                        <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-xl p-2 rounded-xl shadow-sm border border-docka-100 dark:border-zinc-800 flex flex-col lg:flex-row items-center gap-2 group transition-all">
                        
                        <div className="flex-1 flex items-center w-full px-4 group/input">
                            <Search size={20} className="text-docka-300 group-hover/input:text-docka-900 dark:group-hover/input:text-zinc-100 transition-colors" />
                            <input
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Nome da marca ou ativo empresarial..."
                                className="w-full bg-transparent border-none outline-none text-lg font-bold text-docka-900 dark:text-zinc-100 placeholder:text-docka-200 dark:placeholder:text-zinc-700 h-14 px-4"
                            />
                        </div>

                        <div className="h-8 w-px bg-docka-100 dark:bg-zinc-800 hidden lg:block" />

                        <div className="relative w-full lg:w-[320px]" onClick={(e) => e.stopPropagation()}>                            <div 
                                onClick={() => setIsNclOpen(!isNclOpen)}
                                className="w-full h-14 px-5 bg-docka-50/50 dark:bg-zinc-800/50 rounded-lg flex items-center justify-between cursor-pointer border border-transparent hover:border-docka-100 dark:hover:border-zinc-700 transition-all group/select"
                            >
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-docka-400">Ramo de Atividade</span>
                                    <span className="text-xs font-bold text-docka-700 dark:text-zinc-300 truncate max-w-[240px]">
                                        {selectedNcl ? `Classe ${selectedNcl.id} - ${selectedNcl.description.substring(0, 30)}...` : 'Selecione a Classe NCL'}
                                    </span>
                                </div>
                                <ChevronDown size={16} className={`text-docka-300 transition-transform duration-300 ${isNclOpen ? 'rotate-180' : ''}`} />
                            </div>


                            {isNclOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white dark:bg-zinc-900 shadow-xl border border-docka-100 dark:border-zinc-800 z-[100] rounded-xl animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-2 mb-1">
                                        <input 
                                            autoFocus
                                            placeholder="Filtrar categorias..."
                                            value={nclQuery}
                                            onChange={(e) => setNclQuery(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-docka-50 dark:bg-zinc-800 border-none rounded-lg text-xs font-bold outline-none ring-2 ring-transparent focus:ring-blue-500/20 transition-all"
                                        />
                                    </div>
                                    <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-1">
                                        {filteredNcl.map(ncl => (
                                            <button
                                                key={ncl.id}
                                                onClick={() => {
                                                    setSelectedNcl(ncl);
                                                    setIsNclOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex flex-col gap-1 border ${selectedNcl?.id === ncl.id ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 text-white' : 'bg-transparent border-transparent hover:bg-docka-50 dark:hover:bg-zinc-800'}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-xs font-semibold uppercase tracking-wider ${selectedNcl?.id === ncl.id ? 'text-white' : 'text-docka-900 dark:text-zinc-100'}`}>Classe {ncl.id}</span>
                                                    {selectedNcl?.id === ncl.id && <CheckCircle2 size={12} className="text-white" />}
                                                </div>
                                                <span className={`text-xs font-medium leading-relaxed ${selectedNcl?.id === ncl.id ? 'text-white/80' : 'text-docka-500 dark:text-zinc-400'}`}>
                                                    {ncl.description}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => handleSearch()}
                            disabled={isLoading || !selectedNcl || !searchName.trim()}
                            className="w-full lg:w-auto px-10 h-14 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-blue-700 transition-all disabled:opacity-30 flex items-center justify-center gap-3 shrink-0"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                            Analisar Ativo
                        </button>
                    </div>
                </div>

                {result && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        
                        <div className="lg:col-span-5 space-y-6">
                            <div className={`p-10 rounded-xl border shadow-sm relative overflow-hidden flex flex-col items-center text-center transition-all ${
                                result.riskLevel === 'HIGH' ? 'bg-rose-50/30 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/20' : 
                                result.riskLevel === 'MEDIUM' ? 'bg-amber-50/30 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20' : 
                                'bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20'
                            }`}>
                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                    <Sparkles size={120} />
                                </div>

                                <div className="relative w-56 h-56 flex items-center justify-center mb-8">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-black/5 dark:text-white/5" />
                                        <circle
                                            cx="112" cy="112" r="100"
                                            stroke="currentColor" strokeWidth="16"
                                            fill="transparent"
                                            strokeDasharray={628}
                                            strokeDashoffset={628 - (628 * result.score) / 100}
                                            strokeLinecap="round"
                                            className={`${result.riskLevel === 'HIGH' ? 'text-rose-500' : result.riskLevel === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-docka-400 mb-1">Score de Viabilidade</span>
                                        <span className={`text-6xl font-bold ${result.riskLevel === 'HIGH' ? 'text-rose-600' : result.riskLevel === 'MEDIUM' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                            {result.score}%
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className={`inline-flex px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getRiskColor(result.riskLevel)}`}>
                                        {result.riskLevel === 'HIGH' ? 'Alto Risco' : result.riskLevel === 'MEDIUM' ? 'Atenção' : 'Excelente'}
                                    </div>
                                    <h3 className="text-xl font-bold text-docka-900 dark:text-zinc-100 tracking-tight">
                                        {result.riskLevel === 'HIGH' ? 'Registro Altamente Obstruído' : result.riskLevel === 'MEDIUM' ? 'Requer Estratégia de Defesa' : 'Caminho Livre para Registro'}
                                    </h3>
                                    <p className="text-[13px] font-medium text-docka-500 dark:text-zinc-400 leading-relaxed max-w-sm">
                                        {result.summary}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-docka-100 dark:border-zinc-800 shadow-sm">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-docka-400 mb-6 ml-1">Próximos Passos Sugeridos</h4>
                                <div className="space-y-3">
                                    <button 
                                        onClick={handleGenerateDossier}
                                        className="w-full p-4 bg-docka-50 dark:bg-zinc-800 rounded-lg flex items-center justify-between group hover:bg-docka-100 dark:hover:bg-zinc-700 transition-all border border-transparent hover:border-docka-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center font-bold">1</div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-docka-900 dark:text-zinc-200">Gerar Dossier PDF</span>
                                        </div>
                                        <ChevronDown size={14} className="-rotate-90 text-docka-200 group-hover:text-blue-600" />
                                    </button>
                                    <button 
                                        onClick={() => setIsProtocolModalOpen(true)}
                                        className="w-full p-4 bg-docka-50 dark:bg-zinc-800 rounded-lg flex items-center justify-between group hover:bg-docka-100 dark:hover:bg-zinc-700 transition-all border border-transparent hover:border-docka-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg flex items-center justify-center font-bold">2</div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-docka-900 dark:text-zinc-200">Iniciar Protocolo</span>
                                        </div>
                                        <ChevronDown size={14} className="-rotate-90 text-docka-200 group-hover:text-emerald-600" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7 space-y-8">
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-docka-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-docka-50 dark:border-zinc-800 flex justify-between items-center bg-docka-50/30 dark:bg-zinc-900/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-lg"><AlertCircle size={20} /></div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-docka-900 dark:text-zinc-100">Registros Colidentes</h3>
                                            <p className="text-xs font-semibold text-docka-400 uppercase tracking-wider">{result.conflicts?.length || 0} marcas encontradas no INPI</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="divide-y divide-docka-50 dark:divide-zinc-800">
                                    {result.conflicts?.map((conflict: any, idx: number) => (
                                        <div key={idx} className="p-6 flex flex-col md:flex-row items-center justify-between hover:bg-docka-50/50 dark:hover:bg-zinc-800/30 transition-all group">
                                            <div className="flex items-center gap-6 w-full md:w-auto">
                                                <div className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border ${conflict.type === 'EXACT' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                    {conflict.nclClass}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-sm font-bold uppercase tracking-widest text-docka-900 dark:text-zinc-100 group-hover:translate-x-1 transition-transform">{conflict.brandName}</div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                        <span className="text-xs font-semibold text-docka-400 uppercase tracking-wider flex items-center gap-1.5"><Scale size={12} /> {conflict.processNumber}</span>
                                                        <span className="text-xs font-semibold text-docka-400 uppercase tracking-wider flex items-center gap-1.5"><Info size={12} /> {conflict.ownerName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 md:mt-0 flex items-center gap-3 w-full md:w-auto justify-end">
                                                <div className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border shadow-sm ${getStatusBadgeStyle(conflict.status)}`}>
                                                    {getStatusLabel(conflict.status) || 'Pendente'}
                                                </div>
                                                <button 
                                                    onClick={() => setSelectedConflict(conflict)}
                                                    className="p-2.5 bg-white dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-lg text-docka-400 hover:text-docka-900 dark:hover:text-zinc-100 transition-all shadow-sm active:scale-95"
                                                >
                                                    <Info size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* Modal de Iniciar Protocolo */}
            {isProtocolModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 border border-docka-100 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-docka-50 dark:border-zinc-800 flex items-center justify-between bg-docka-50/50 dark:bg-zinc-900/50">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Sparkles size={16} className="text-blue-600 animate-pulse" />
                                    Iniciar Protocolo de Registro
                                </h3>
                                <p className="text-[11px] font-semibold text-docka-400 uppercase tracking-wider mt-1">Crie um lead diretamente no CRM Kanban para este ativo</p>
                            </div>
                            <button 
                                onClick={() => setIsProtocolModalOpen(false)}
                                className="text-docka-400 hover:text-docka-900 dark:hover:text-zinc-100 text-sm font-bold w-8 h-8 rounded-full hover:bg-docka-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        {protocolSuccess ? (
                            <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={36} />
                                </div>
                                <h4 className="text-lg font-bold text-docka-900 dark:text-zinc-100">Protocolo Iniciado com Sucesso!</h4>
                                <p className="text-xs font-semibold text-docka-400 uppercase tracking-wider">
                                    O lead foi criado na coluna de "Novos Leads" do seu CRM Kanban.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleStartProtocol} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-docka-400">Ativo / Marca</label>
                                        <input
                                            type="text"
                                            value={searchName}
                                            disabled
                                            className="w-full mt-1.5 px-4 py-2.5 bg-docka-50 dark:bg-zinc-800 border-none rounded-lg text-xs font-bold text-docka-400 dark:text-zinc-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-docka-400">Classe Nice</label>
                                        <input
                                            type="text"
                                            value={`Classe ${selectedNcl?.id}`}
                                            disabled
                                            className="w-full mt-1.5 px-4 py-2.5 bg-docka-50 dark:bg-zinc-800 border-none rounded-lg text-xs font-bold text-docka-400 dark:text-zinc-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-docka-400">Nome do Cliente</label>
                                    <input
                                        type="text"
                                        required
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        placeholder="Ex: João da Silva"
                                        className="w-full mt-1.5 px-4 py-2.5 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/10 rounded-lg text-xs font-bold outline-none transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-docka-400">E-mail de Contato</label>
                                        <input
                                            type="email"
                                            required
                                            value={clientEmail}
                                            onChange={(e) => setClientEmail(e.target.value)}
                                            placeholder="Ex: joao@email.com"
                                            className="w-full mt-1.5 px-4 py-2.5 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/10 rounded-lg text-xs font-bold outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-docka-400">Telefone / WhatsApp</label>
                                        <input
                                            type="tel"
                                            required
                                            value={clientPhone}
                                            onChange={(e) => setClientPhone(e.target.value)}
                                            placeholder="Ex: (11) 99999-9999"
                                            className="w-full mt-1.5 px-4 py-2.5 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/10 rounded-lg text-xs font-bold outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-docka-400">Plano Escolhido</label>
                                        <select
                                            value={selectedPlan}
                                            onChange={(e) => handlePlanChange(e.target.value)}
                                            className="w-full mt-1.5 px-4 py-2.5 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/10 rounded-lg text-xs font-bold outline-none transition-all"
                                        >
                                            <option value="ESSENCIAL">Essencial (R$ 899,00)</option>
                                            <option value="PREMIUM">Premium (R$ 1.499,00)</option>
                                            <option value="PRO">Pro (R$ 2.499,00)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-docka-400">Valor do Serviço (R$)</label>
                                        <input
                                            type="number"
                                            required
                                            value={serviceValue}
                                            onChange={(e) => setServiceValue(e.target.value)}
                                            placeholder="Ex: 899"
                                            className="w-full mt-1.5 px-4 py-2.5 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/10 rounded-lg text-xs font-bold outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-docka-50 dark:border-zinc-800 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsProtocolModalOpen(false)}
                                        className="px-6 h-12 border border-docka-100 dark:border-zinc-700 hover:bg-docka-50 dark:hover:bg-zinc-800 text-docka-700 dark:text-zinc-300 rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingProtocol || !clientName.trim() || !clientEmail.trim() || !clientPhone.trim()}
                                        className="px-6 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm shadow-emerald-600/10 disabled:opacity-50"
                                    >
                                        {isSubmittingProtocol ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} fill="currentColor" />}
                                        Iniciar Protocolo
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Detalhes do Processo */}
            {selectedConflict && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 border border-docka-100 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-docka-50 dark:border-zinc-800 flex items-center justify-between bg-docka-50/50 dark:bg-zinc-900/50">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Scale size={16} className="text-blue-600" />
                                    Detalhes do Processo
                                </h3>
                                <p className="text-[11px] font-semibold text-docka-400 uppercase tracking-wider mt-1">Ficha completa de registro de marca INPI</p>
                            </div>
                            <button 
                                onClick={() => setSelectedConflict(null)}
                                className="text-docka-400 hover:text-docka-900 dark:hover:text-zinc-100 text-sm font-bold w-8 h-8 rounded-full hover:bg-docka-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Brand Header */}
                            <div className="flex items-center gap-4 bg-docka-50/50 dark:bg-zinc-800/50 p-4 rounded-xl border border-docka-50 dark:border-zinc-800">
                                <div className="w-12 h-12 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                                    {selectedConflict.nclClass}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-lg font-extrabold uppercase tracking-widest text-docka-900 dark:text-zinc-100 truncate">{selectedConflict.brandName}</h4>
                                    <p className="text-xs font-semibold text-docka-400 uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                                        <Scale size={12} /> Processo {selectedConflict.processNumber || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-docka-50/30 dark:bg-zinc-800/30 p-3 rounded-lg border border-docka-50/50 dark:border-zinc-800/50">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-docka-400">Classe Nice</span>
                                    <p className="text-xs font-bold text-docka-850 dark:text-zinc-200 mt-1">NCL {selectedConflict.nclClass || 'N/A'}</p>
                                </div>

                                <div className="bg-docka-50/30 dark:bg-zinc-800/30 p-3 rounded-lg border border-docka-50/50 dark:border-zinc-800/50">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-docka-400">Status Atual</span>
                                    <div className="mt-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeStyle(selectedConflict.status)}`}>
                                            {getStatusLabel(selectedConflict.status)}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-docka-50/30 dark:bg-zinc-800/30 p-3 rounded-lg border border-docka-50/50 dark:border-zinc-800/50">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-docka-400">Titular da Marca</span>
                                    <p className="text-xs font-bold text-docka-850 dark:text-zinc-200 mt-1 truncate">{selectedConflict.ownerName || 'N/A'}</p>
                                </div>

                                <div className="bg-docka-50/30 dark:bg-zinc-800/30 p-3 rounded-lg border border-docka-50/50 dark:border-zinc-800/50">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-docka-400">Data de Depósito</span>
                                    <p className="text-xs font-bold text-docka-850 dark:text-zinc-200 mt-1">
                                        {selectedConflict.filingDate ? new Date(selectedConflict.filingDate).toLocaleDateString('pt-BR') : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Informações de Colidência */}
                            <div className="bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100/50 dark:border-blue-900/20 space-y-2">
                                <h5 className="text-[10px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                                    <Sparkles size={12} /> Parecer Tecnológico Asterysko
                                </h5>
                                <p className="text-xs font-medium text-blue-900 dark:text-blue-200/80 leading-relaxed">
                                    {selectedConflict.type === 'EXACT' 
                                    ? `Marca com colidência fonética/visual EXATA na classe ${selectedConflict.nclClass}. A probabilidade de indeferimento de novos registros sob este mesmo nome é extremamente alta.`
                                    : `Marca com colidência PARCIAL ou fonética aproximada na classe ${selectedConflict.nclClass}. Recomenda-se realizar uma análise de anterioridade e preparar argumentos de defesa antes de protocolar.`}
                                </p>
                            </div>

                            {selectedConflict.ownerName === 'Asterysko (Processo Interno)' && (
                                <div className="bg-emerald-50/30 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20 space-y-2">
                                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                        <CheckCircle2 size={12} /> Cliente da Base Interna
                                    </h5>
                                    <p className="text-xs font-medium text-emerald-900 dark:text-emerald-200/80 leading-relaxed">
                                        Este processo pertence a um cliente ativo cadastrado no seu CRM! Acesse o Kanban ou Painel de Processos para acompanhar os detalhes de acompanhamento operacional.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-docka-50 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-900/50 flex justify-end">
                            <button
                                onClick={() => setSelectedConflict(null)}
                                className="px-6 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                            >
                                Fechar Ficha
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardPage>
    );
};

export default AsteryskoResearchView;
