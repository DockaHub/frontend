import React, { useState, useEffect } from 'react';
import { X, Check, FileText, Plus, MoreVertical, Clock, Paperclip, DollarSign, Calendar, UploadCloud, CreditCard, Receipt, FileSignature, Send, Loader2, Eye, Edit2, Trash2, ExternalLink, Copy, CheckCircle2, MessageCircle, Mail, Bell, Smartphone, User, ShieldCheck } from 'lucide-react';
import api from '../../../../services/api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    card: any; 
    onUpdate?: () => void;
}

const steps = ['Novos Leads', 'Preparação', 'Viabilidade', 'Contrato', 'Pagamento Serviço', 'Procuração/Docs', 'Taxa Federal (GRU)', 'A Protocolar', 'Protocolado (RPI)', 'Exame de Mérito', 'Oposição / Exigência', 'Deferida', 'Concluído'];
const stepsKeys = ['leads', 'preparation', 'viability', 'contract', 'service_payment', 'documentation', 'federal_fee', 'ready_to_file', 'filed', 'examination', 'opposition', 'granted', 'won'];

const getStatusLabel = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'leads') return 'Novo Lead';
    if (s === 'preparation') return 'Preparação';
    if (s === 'viability') return 'Viabilidade';
    if (s === 'contract') return 'Contrato';
    if (s === 'service_payment') return 'Pagamento Serviço';
    if (s === 'documentation') return 'Procuração/Docs';
    if (s === 'federal_fee') return 'Taxa Federal (GRU)';
    if (s === 'ready_to_file') return 'A Protocolar';
    if (s === 'filed') return 'Protocolado (RPI)';
    if (s === 'examination') return 'Exame de Mérito';
    if (s === 'opposition') return 'Oposição / Exigência';
    if (s === 'granted') return 'Deferida';
    if (s === 'won') return 'Concluído';
    return status || 'Em preparação';
};

const stageTasksMap: Record<string, { id: string; title: string; due: string }[]> = {
    'leads': [
        { id: 'leads_contact', title: 'Fazer contato inicial via WhatsApp / Ligação', due: 'Hoje' },
        { id: 'leads_qualify', title: 'Qualificar interesse e definir marcas/classes de Nice', due: 'Hoje' }
    ],
    'preparation': [
        { id: 'prep_proposal', title: 'Enviar proposta comercial em PDF', due: 'Hoje' },
        { id: 'prep_system_info', title: 'Cadastrar informações do cliente no portal', due: 'Amanhã' }
    ],
    'viability': [
        { id: 'viab_search', title: 'Realizar busca de anterioridade no Radar de Marcas', due: 'Hoje' },
        { id: 'viab_report', title: 'Gerar parecer técnico de viabilidade', due: 'Hoje' }
    ],
    'contract': [
        { id: 'cont_send', title: 'Enviar link do contrato para assinatura digital', due: 'Hoje' },
        { id: 'cont_docs', title: 'Coletar documento de identidade (RG ou CNH) e Contrato Social', due: 'Amanhã' }
    ],
    'service_payment': [
        { id: 'pay_invoice', title: 'Emitir fatura de honorários da Asterysko', due: 'Hoje' },
        { id: 'pay_confirm', title: 'Confirmar compensação do pagamento do serviço', due: 'Em 2 dias' }
    ],
    'documentation': [
        { id: 'docs_proxy', title: 'Solicitar assinatura da Procuração pelo cliente', due: 'Hoje' },
        { id: 'docs_validate', title: 'Validar procuração assinada no portal', due: 'Amanhã' }
    ],
    'federal_fee': [
        { id: 'fee_emit', title: 'Gerar guia GRU no portal do INPI', due: 'Hoje' },
        { id: 'fee_send', title: 'Enviar guia GRU e código de barras para o cliente', due: 'Hoje' },
        { id: 'fee_confirm', title: 'Acompanhar compensação da GRU (retribuição federal)', due: 'Em 3 dias' }
    ],
    'ready_to_file': [
        { id: 'file_collate', title: 'Conferir todos os documentos e guias anexadas', due: 'Hoje' },
        { id: 'file_protocol', title: 'Efetuar protocolo do pedido de registro no INPI', due: 'Hoje' }
    ],
    'filed': [
        { id: 'filed_receipt', title: 'Enviar recibo de protocolo INPI ao cliente', due: 'Hoje' },
        { id: 'filed_monitor', title: 'Monitorar publicação oficial na RPI (Revista da P.I.)', due: 'Semanal' }
    ],
    'examination': [
        { id: 'exam_monitor', title: 'Acompanhar andamento do exame de mérito do INPI', due: 'Mensal' }
    ],
    'opposition': [
        { id: 'opp_analyze', title: 'Analisar teor da oposição ou exigência notificada', due: 'Hoje' },
        { id: 'opp_reply', title: 'Elaborar e protocolar manifestação/réplica no INPI', due: 'Prazo RPI' }
    ],
    'granted': [
        { id: 'grant_emit', title: 'Gerar GRU do primeiro decênio e expedição de certificado', due: 'Hoje' },
        { id: 'grant_pay', title: 'Acompanhar pagamento da GRU de concessão pelo cliente', due: 'Prazo legal' }
    ],
    'won': [
        { id: 'won_cert', title: 'Enviar certificado de registro de marca ao cliente', due: 'Hoje' },
        { id: 'won_congrats', title: 'Enviar mensagem de congratulações e pós-venda', due: 'Amanhã' }
    ]
};

const getNextAction = (status: string) => {
    const s = status?.toLowerCase() || '';
    switch (s) {
        case 'leads':
            return {
                title: 'Contato Comercial e Qualificação',
                desc: 'Realizar contato inicial para qualificar o lead e entender as classes de Nice de interesse.',
                realBehavior: 'Esta ação ajuda o time a coletar as necessidades comerciais do cliente.'
            };
        case 'preparation':
            return {
                title: 'Gerar Proposta e Contrato',
                desc: 'Elaborar a proposta comercial detalhada e preparar o contrato de prestação de serviços no portal.',
                realBehavior: 'Avançar para a próxima etapa enviará automaticamente um WhatsApp ao cliente contendo o contrato.'
            };
        case 'viability':
            return {
                title: 'Realizar Análise de Viabilidade',
                desc: 'Executar busca detalhada de anterioridade no Radar de Marcas para avaliar riscos de colisão.',
                realBehavior: 'Esta análise serve para dar segurança jurídica ao cliente antes do protocolo.'
            };
        case 'contract':
            return {
                title: 'Acompanhar Assinatura do Contrato',
                desc: 'Verificar se o cliente recebeu e assinou o contrato digital enviado.',
                realBehavior: 'O cliente recebe o link de assinatura por e-mail e WhatsApp.'
            };
        case 'service_payment':
            return {
                title: 'Confirmar Pagamento dos Honorários',
                desc: 'Aguardar ou registrar a confirmação de pagamento do serviço comercial contratado.',
                realBehavior: 'Avançar enviará um WhatsApp com a fatura de pagamento pendente.'
            };
        case 'documentation':
            return {
                title: 'Coletar Procuração e Documentos',
                desc: 'Solicitar procuração assinada e documentos de constituição (ex: Contrato Social ou RG).',
                realBehavior: 'Esses documentos são obrigatórios para a representação legal perante o INPI.'
            };
        case 'federal_fee':
            return {
                title: 'Gerar e Emitir GRU Federal',
                desc: 'Emitir a guia GRU de retribuição federal do INPI (código 389 ou similar) e enviar para pagamento.',
                realBehavior: 'O cliente receberá uma notificação no WhatsApp contendo a guia e o código de barras.'
            };
        case 'ready_to_file':
            return {
                title: 'Protocolar Registro no INPI',
                desc: 'Reunir documentos, comprovante da GRU paga e protocolar o pedido no portal do INPI.',
                realBehavior: 'Ação crítica de início de processo administrativo junto ao órgão oficial.'
            };
        case 'filed':
            return {
                title: 'Monitorar Publicação do Pedido',
                desc: 'Acompanhar publicação do pedido na RPI (Revista da Propriedade Industrial) para início do prazo de oposição.',
                realBehavior: 'O sistema consulta a RPI toda terça-feira em busca de atualizações.'
            };
        case 'examination':
            return {
                title: 'Acompanhar Exame de Mérito',
                desc: 'Monitore despachos de exigências ou pareceres técnicos durante o exame de mérito do INPI.',
                realBehavior: 'Fase de análise detalhada pelos examinadores do INPI.'
            };
        case 'opposition':
            return {
                title: 'Apresentar Defesa/Manifestação',
                desc: 'Elaborar e protocolar manifestação contra oposição de terceiros ou recurso contra indeferimento.',
                realBehavior: 'Defesa obrigatória para evitar o arquivamento definitivo do pedido.'
            };
        case 'granted':
            return {
                title: 'Pagar Decênio e Expedição',
                desc: 'Emitir GRU de concessão da marca (primeiro decênio e expedição de certificado de registro).',
                realBehavior: 'Prazo legal improrrogável de 60 dias após o deferimento.'
            };
        case 'won':
            return {
                title: 'Marca Concedida e Protegida',
                desc: 'Certificado de registro emitido. Acompanhar vigência da marca (válida por 10 anos).',
                realBehavior: 'A marca está legalmente protegida contra uso não autorizado em todo território nacional.'
            };
        default:
            return {
                title: 'Realizar análise de viabilidade',
                desc: 'Análise padrão de anterioridade e viabilidade jurídica da marca.',
                realBehavior: 'Ação executada internamente pelo time da Asterysko.'
            };
    }
};

const AsteryskoDealDetailsModal: React.FC<Props> = ({ isOpen, onClose, card, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('Visão geral');
    const [isClosing, setIsClosing] = useState(false);
    const [newObservation, setNewObservation] = useState('');
    const [observations, setObservations] = useState<any[]>([]);
    const [dealDetails, setDealDetails] = useState<any>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [showUploadMenu, setShowUploadMenu] = useState(false);

    // States for File Operations (Preview, Rename, Delete)
    const [previewFile, setPreviewFile] = useState<{ name: string; url: string; type: string; isPublic: boolean } | null>(null);
    const [customFileNames, setCustomFileNames] = useState<Record<string, string>>({});
    const [editingFileId, setEditingFileId] = useState<string | null>(null);
    const [editingFileNameInput, setEditingFileNameInput] = useState('');
    const [openMenuFileKey, setOpenMenuFileKey] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Financial States
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
    const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<any | null>(null);
    const [openInvoiceMenuId, setOpenInvoiceMenuId] = useState<string | null>(null);

    // Form for new invoice
    const [invoiceDesc, setInvoiceDesc] = useState('');
    const [invoiceAmount, setInvoiceAmount] = useState('');
    const [invoiceDueDate, setInvoiceDueDate] = useState('');
    const [invoicePaymentMethod, setInvoicePaymentMethod] = useState('PIX');
    const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);

    // Notification Mockup Modal State
    const [activeNotificationMockup, setActiveNotificationMockup] = useState<{
        type: 'whatsapp' | 'email' | 'app';
        title: string;
        text: string;
        recipientName: string;
        recipientPhone: string;
        recipientEmail: string;
        date: string;
    } | null>(null);

    const currentDeal = dealDetails || card;
    const clientId = currentDeal?.clientId || currentDeal?.client?.id;

    const fetchInvoices = async () => {
        if (!clientId) return;
        try {
            setIsLoadingInvoices(true);
            const res = await api.get(`/asterysko/financial/invoices?clientId=${clientId}`);
            setInvoices(res.data);
        } catch (error) {
            console.error('Failed to fetch invoices', error);
        } finally {
            setIsLoadingInvoices(false);
        }
    };

    const fetchDetails = async () => {
        if (!card?.id) return;
        try {
            setIsLoadingDetails(true);
            const response = await api.get(`/asterysko/crm/deals/${card.id}`);
            setDealDetails(response.data);
            if (response.data.comments) {
                setObservations(response.data.comments.map((c: any) => ({
                    id: c.id,
                    author: c.user?.name ? c.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U',
                    name: c.user?.name || 'Usuário',
                    date: new Date(c.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    text: c.content
                })));
            }
        } catch (error) {
            console.error("Failed to fetch deal details", error);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    useEffect(() => {
        if (isOpen && card?.id) {
            fetchDetails();
        } else {
            setDealDetails(null);
            setObservations([]);
            setPreviewFile(null);
            setInvoices([]);
            setActiveNotificationMockup(null);
        }
    }, [isOpen, card?.id]);

    useEffect(() => {
        if (isOpen && clientId) {
            fetchInvoices();
        }
    }, [isOpen, clientId]);

    useEffect(() => {
        const handleClickOutside = () => {
            setOpenMenuFileKey(null);
            setOpenInvoiceMenuId(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300);
    };

    const handleAddObservation = async () => {
        if (!newObservation.trim() || !card?.id) return;
        try {
            await api.post(`/asterysko/crm/deals/${card.id}/comments`, {
                content: newObservation
            });
            setNewObservation('');
            fetchDetails();
        } catch (error) {
            console.error("Failed to add comment", error);
            alert("Erro ao salvar comentário.");
        }
    };

    const handleAdvanceStage = async () => {
        if (!currentDeal?.id) return;
        const currentIdx = stepsKeys.indexOf(currentDeal.status);
        if (currentIdx === -1 || currentIdx >= stepsKeys.length - 1) {
            alert('Este processo já está no estágio final!');
            return;
        }
        const nextStatus = stepsKeys[currentIdx + 1];
        try {
            await api.put(`/asterysko/crm/deals/${currentDeal.id}/status`, { status: nextStatus });
            alert(`Processo avançado com sucesso para "${getStatusLabel(nextStatus)}"!`);
            onUpdate?.();
            fetchDetails();
            fetchInvoices();
        } catch (error: any) {
            console.error('Failed to advance stage', error);
            alert(error.response?.data?.error || 'Falha ao avançar estágio.');
        }
    };

    const handleArchiveLead = async () => {
        if (!currentDeal?.id) return;
        if (!window.confirm('Tem certeza de que deseja arquivar este lead?')) return;
        try {
            await api.patch(`/asterysko/crm/deals/${currentDeal.id}`, { status: 'archived', closedAt: new Date() });
            alert('Lead arquivado com sucesso!');
            onUpdate?.();
            handleClose();
        } catch (error: any) {
            console.error('Failed to archive lead', error);
            alert(error.response?.data?.error || 'Falha ao arquivar lead.');
        }
    };

    const handleToggleTask = async (taskId: string) => {
        if (!currentDeal?.id) return;
        
        let currentCompleted = Array.isArray(currentDeal.members) 
            ? [...currentDeal.members] 
            : [];
            
        if (currentCompleted.includes(taskId)) {
            currentCompleted = currentCompleted.filter(id => id !== taskId);
        } else {
            currentCompleted.push(taskId);
        }
        
        try {
            await api.patch(`/asterysko/crm/deals/${currentDeal.id}`, {
                members: currentCompleted
            });
            fetchDetails();
        } catch (error) {
            console.error('Failed to toggle task state', error);
            alert('Falha ao atualizar tarefa.');
        }
    };

    const handleFileUpload = async (file: File | undefined, uploadType: string) => {
        const processId = dealDetails?.processId || dealDetails?.process?.id;
        if (!file || !processId) {
            alert('Nenhum processo vinculado para anexar o arquivo.');
            return;
        }
        
        try {
            setUploadingFile(true);
            const formData = new FormData();
            
            let endpoint = '';
            if (uploadType === 'proxy') {
                formData.append('file', file);
                endpoint = `/asterysko/processes/${processId}/proxy/upload`;
            } else if (uploadType === 'gru') {
                formData.append('file', file);
                endpoint = `/asterysko/processes/${processId}/gru/upload`;
            } else if (uploadType === 'gru_receipt') {
                formData.append('file', file);
                endpoint = `/asterysko/processes/${processId}/gru/receipt`;
            } else if (uploadType === 'protocol') {
                formData.append('protocol', file);
                endpoint = `/asterysko/processes/${processId}/protocol/confirm`;
            } else if (uploadType === 'certificate') {
                formData.append('file', file);
                endpoint = `/asterysko/processes/${processId}/certificate/upload`;
            }

            await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Arquivo enviado com sucesso!');
            fetchDetails();
        } catch (error) {
            console.error('Failed to upload file', error);
            alert('Erro ao enviar arquivo.');
        } finally {
            setUploadingFile(false);
        }
    };

    const handleDeleteFile = async (fieldKey: string, fileName: string) => {
        const processId = dealDetails?.processId || dealDetails?.process?.id;
        if (!processId) return;
        if (!window.confirm(`Tem certeza de que deseja excluir o arquivo "${fileName}"?`)) return;

        try {
            await api.put(`/asterysko/processes/${processId}`, {
                [fieldKey]: null
            });
            alert('Arquivo excluído com sucesso!');
            fetchDetails();
        } catch (error) {
            console.error('Failed to delete file', error);
            alert('Falha ao excluir arquivo.');
        }
    };

    const handleSaveFileName = (fileKey: string) => {
        if (editingFileNameInput.trim()) {
            setCustomFileNames(prev => ({
                ...prev,
                [fileKey]: editingFileNameInput.trim()
            }));
        }
        setEditingFileId(null);
        setEditingFileNameInput('');
    };

    // Financial Actions
    const handleCreateInvoice = async () => {
        if (!clientId) {
            alert('Nenhum cliente vinculado para emitir a fatura.');
            return;
        }
        if (!invoiceAmount || !invoiceDueDate) {
            alert('Por favor, preencha o valor e a data de vencimento.');
            return;
        }

        try {
            setIsSubmittingInvoice(true);
            await api.post('/asterysko/financial/invoices', {
                clientId,
                amount: parseFloat(invoiceAmount.replace(',', '.')),
                dueDate: invoiceDueDate,
                description: invoiceDesc || `Fatura de Honorários - ${dealTitle}`,
                paymentMethod: invoicePaymentMethod,
                type: 'SERVICE'
            });
            alert('Fatura gerada com sucesso! Notificação enviada ao cliente.');
            setIsCreateInvoiceOpen(false);
            setInvoiceDesc('');
            setInvoiceAmount('');
            setInvoiceDueDate('');
            fetchInvoices();
            fetchDetails();
        } catch (error) {
            console.error('Failed to create invoice', error);
            alert('Erro ao gerar fatura.');
        } finally {
            setIsSubmittingInvoice(false);
        }
    };

    const handleSaveInvoiceEdit = async () => {
        if (!editingInvoice?.id) return;
        try {
            await api.put(`/asterysko/financial/invoices/${editingInvoice.id}`, {
                description: editingInvoice.description,
                amount: parseFloat(String(editingInvoice.amount).replace(',', '.')),
                dueDate: editingInvoice.dueDate,
                status: editingInvoice.status,
                paymentMethod: editingInvoice.paymentMethod
            });
            alert('Fatura atualizada com sucesso!');
            setEditingInvoice(null);
            fetchInvoices();
            fetchDetails();
        } catch (error) {
            console.error('Failed to update invoice', error);
            alert('Erro ao atualizar fatura.');
        }
    };

    const handleDeleteInvoice = async (invoiceId: string) => {
        if (!window.confirm('Tem certeza de que deseja excluir esta fatura?')) return;
        try {
            await api.delete(`/asterysko/financial/invoices/${invoiceId}`);
            alert('Fatura excluída com sucesso!');
            fetchInvoices();
            fetchDetails();
        } catch (error) {
            console.error('Failed to delete invoice', error);
            alert('Erro ao excluir fatura.');
        }
    };

    const handleCopyInvoiceLink = (inv: any) => {
        const link = `https://cliente.asterysko.com/portal/financial?invoiceId=${inv.id}`;
        navigator.clipboard.writeText(link);
        alert('Link da fatura copiado com sucesso para a área de transferência!');
    };

    if (!isOpen && !isClosing) return null;

    const dealTitle = currentDeal?.title || 'Novo Processo';
    const clientName = currentDeal?.contactName || currentDeal?.subtitle || 'Sem cliente vinculado';
    const clientEmail = currentDeal?.contactEmail || 'Sem email cadastrado';
    const clientPhone = currentDeal?.contactPhone || 'Sem telefone';
    
    const rawValue = currentDeal?.value;
    let dealValue = 'R$ 0,00';
    if (rawValue) {
        if (typeof rawValue === 'string') {
            dealValue = rawValue.startsWith('R$') ? rawValue : `R$ ${parseFloat(rawValue).toFixed(2).replace('.', ',')}`;
        } else if (typeof rawValue === 'number') {
            dealValue = `R$ ${rawValue.toFixed(2).replace('.', ',')}`;
        }
    }
    
    const dealDate = currentDeal?.date ? (currentDeal.date.includes('/') ? `Adicionado em ${currentDeal.date}` : `Adicionado em ${new Date(currentDeal.date).toLocaleDateString('pt-BR')}`) : 'Data não informada';
    const sourceTag = currentDeal?.tags?.find((t: any) => typeof t === 'string' ? t.toLowerCase().includes('site') : t.label?.toLowerCase().includes('site')) ? 'Site' : 'Manual';
    const priority = currentDeal?.priority === 'high' ? 'Alta' : currentDeal?.priority === 'low' ? 'Baixa' : 'Normal';
    const assignedUser = currentDeal?.assignedUser?.name || currentDeal?.assignedUserName || 'Sem dono';
    const currentStepIdx = stepsKeys.indexOf(currentDeal?.status) >= 0 ? stepsKeys.indexOf(currentDeal?.status) : 0;
    const nextActionInfo = getNextAction(currentDeal?.status);

    // Financial totals
    const totalContractedVal = invoices.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0) || (parseFloat(String(rawValue || 0)) || 0);
    const totalPaidVal = invoices.filter(inv => inv.status === 'PAID').reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
    const totalPendingVal = invoices.filter(inv => inv.status !== 'PAID').reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);

    const formattedContracted = `R$ ${totalContractedVal.toFixed(2).replace('.', ',')}`;
    const formattedPaid = `R$ ${totalPaidVal.toFixed(2).replace('.', ',')}`;
    const formattedPending = `R$ ${totalPendingVal.toFixed(2).replace('.', ',')}`;

    // Dynamic shared documents list between INPI Process files and local ones
    const filesList: any[] = [];
    if (currentDeal?.process) {
        const p = currentDeal.process;
        const brandName = p.brand?.name || dealTitle;
        const creationDate = p.createdAt ? new Date(p.createdAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
        const updateDate = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('pt-BR') : creationDate;

        if (p.contractUrl) {
            filesList.push({
                key: 'contractUrl',
                name: customFileNames['contractUrl'] || `Contrato - ${brandName}.pdf`,
                url: p.contractUrl,
                type: 'Contrato',
                date: p.contractSignDate ? new Date(p.contractSignDate).toLocaleDateString('pt-BR') : creationDate,
                size: '1.2 MB',
                isPublic: true
            });
        }
        if (p.proxyUrl) {
            filesList.push({
                key: 'proxyUrl',
                name: customFileNames['proxyUrl'] || `Procuração (Modelo) - ${brandName}.pdf`,
                url: p.proxyUrl,
                type: 'Procuração',
                date: creationDate,
                size: '450 KB',
                isPublic: true
            });
        }
        if (p.proxySignedUrl) {
            filesList.push({
                key: 'proxySignedUrl',
                name: customFileNames['proxySignedUrl'] || `Procuração Assinada - ${brandName}.pdf`,
                url: p.proxySignedUrl,
                type: 'Procuração',
                date: updateDate,
                size: '850 KB',
                isPublic: true
            });
        }
        if (p.gruUrl) {
            filesList.push({
                key: 'gruUrl',
                name: customFileNames['gruUrl'] || `Guia GRU - ${brandName}.pdf`,
                url: p.gruUrl,
                type: 'GRU',
                date: creationDate,
                size: '310 KB',
                isPublic: true
            });
        }
        if (p.gruReceiptUrl) {
            filesList.push({
                key: 'gruReceiptUrl',
                name: customFileNames['gruReceiptUrl'] || `Comprovante GRU - ${brandName}.pdf`,
                url: p.gruReceiptUrl,
                type: 'Comprovante',
                date: updateDate,
                size: '220 KB',
                isPublic: true
            });
        }
        if (p.protocolReceiptUrl) {
            filesList.push({
                key: 'protocolReceiptUrl',
                name: customFileNames['protocolReceiptUrl'] || `Recibo de Protocolo - ${brandName}.pdf`,
                url: p.protocolReceiptUrl,
                type: 'Recibo',
                date: updateDate,
                size: '1.4 MB',
                isPublic: false
            });
        }
        if (p.certificateUrl) {
            filesList.push({
                key: 'certificateUrl',
                name: customFileNames['certificateUrl'] || `Certificado de Registro - ${brandName}.pdf`,
                url: p.certificateUrl,
                type: 'Certificado',
                date: updateDate,
                size: '2.8 MB',
                isPublic: true
            });
        }
    }

    // Helper to generate notification dispatch details for activity logs
    const getNotificationDispatchesForActivity = (activity: any) => {
        const type = activity.type || '';
        const content = activity.content || '';
        const status = activity.metadata?.status || currentDeal?.status || '';

        const isStageChange = type === 'status_change' || content.toLowerCase().includes('etapa') || content.toLowerCase().includes('estágio') || content.toLowerCase().includes('criado');
        const isInvoice = type === 'notification_sent' || content.toLowerCase().includes('fatura') || content.toLowerCase().includes('pagamento');
        const isFile = type === 'file_upload' || content.toLowerCase().includes('anexad') || content.toLowerCase().includes('upload');

        const dispatches: Array<{
            type: 'whatsapp' | 'email' | 'app';
            label: string;
            mockupTitle: string;
            mockupText: string;
        }> = [];

        if (isStageChange || isInvoice || isFile) {
            dispatches.push({
                type: 'whatsapp',
                label: 'WhatsApp Sent',
                mockupTitle: `WhatsApp: ${content}`,
                mockupText: `Olá ${clientName}! Seu processo de registro da marca "${dealTitle}" teve uma atualização importante na etapa "${getStatusLabel(status)}". Acompanhe todos os detalhes diretamente na sua área do cliente.`
            });

            dispatches.push({
                type: 'email',
                label: 'E-mail Transacional',
                mockupTitle: `E-mail Transacional: ${content}`,
                mockupText: `Notificação de Atualização do Registro de Marca:\n\nPrezado(a) ${clientName},\n\nInformamos que houve uma movimentação no seu processo de registro de marca "${dealTitle}".\n\nResumo da Ação: ${content}\nEtapa Atual: ${getStatusLabel(status)}\n\nVocê pode consultar seus documentos e recibos diretamente na sua área do cliente no portal da Asterysko.\n\nAtenciosamente,\nEquipe Asterysko Registro de Marcas`
            });

            dispatches.push({
                type: 'app',
                label: 'App Push',
                mockupTitle: `Push App: ${dealTitle}`,
                mockupText: `Atualização no seu processo "${dealTitle}": ${content}.`
            });
        }

        return dispatches;
    };

    const tabs = ['Visão geral', 'Atividades', 'Documentos', 'Financeiro', 'Histórico'];

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen && !isClosing ? 'bg-black/20 dark:bg-black/40 backdrop-blur-sm opacity-100' : 'opacity-0 pointer-events-none'}`}>
            
            {/* NOTIFICATION MOCKUP LIGHTBOX MODAL */}
            {activeNotificationMockup && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="flex flex-col items-center gap-4 relative">
                        
                        {/* Close bar */}
                        <div className="w-full flex justify-between items-center text-white px-2">
                            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck size={16} className="text-green-400" /> Mockup de Notificação Real Disparada
                            </span>
                            <button 
                                onClick={() => setActiveNotificationMockup(null)}
                                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* MOCKUP TYPE: WHATSAPP */}
                        {activeNotificationMockup.type === 'whatsapp' && (
                            <div className="w-[360px] bg-[#0b141a] text-white rounded-3xl overflow-hidden border-4 border-zinc-800 shadow-2xl flex flex-col h-[520px]">
                                <div className="bg-[#202c33] p-3 flex items-center gap-3 border-b border-[#2a3942]">
                                    <div className="w-9 h-9 rounded-full bg-[#00a884] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                        {activeNotificationMockup.recipientName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm truncate">{activeNotificationMockup.recipientName}</h4>
                                        <p className="text-[10px] text-[#8696a0]">online • Asterysko Business</p>
                                    </div>
                                </div>

                                <div className="flex-1 bg-[#0b141a] p-4 flex flex-col justify-end gap-3 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
                                    <div className="self-center bg-[#182229] text-[#8696a0] text-[10px] px-3 py-1 rounded-md uppercase font-semibold tracking-wider">
                                        Hoje
                                    </div>

                                    <div className="self-end max-w-[85%] bg-[#005c4b] text-[#e9edef] p-3 rounded-2xl rounded-tr-none text-xs leading-relaxed shadow-sm relative font-sans">
                                        <p className="whitespace-pre-wrap">{activeNotificationMockup.text}</p>
                                        <div className="flex items-center justify-end gap-1 text-[9.5px] text-[#8696a0] mt-1.5 font-mono">
                                            <span>{activeNotificationMockup.date}</span>
                                            <span className="text-[#53bdeb] font-bold">✓✓</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#202c33] p-3 flex items-center gap-2 border-t border-[#2a3942]">
                                    <div className="flex-1 bg-[#2a3942] text-[#8696a0] text-xs px-4 py-2 rounded-full">
                                        Mensagem...
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MOCKUP TYPE: EMAIL */}
                        {activeNotificationMockup.type === 'email' && (
                            <div className="w-[540px] bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col">
                                <div className="bg-zinc-100 dark:bg-zinc-950 p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                    </div>
                                    <span className="text-xs font-mono text-zinc-400">Asterysko Mailer Client</span>
                                </div>

                                <div className="p-6 flex flex-col gap-4 font-sans text-left">
                                    <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                        <p className="text-xs text-zinc-500 mb-1"><strong>De:</strong> Asterysko Notificações &lt;atendimento@asterysko.com&gt;</p>
                                        <p className="text-xs text-zinc-500 mb-1"><strong>Para:</strong> {activeNotificationMockup.recipientName} &lt;{activeNotificationMockup.recipientEmail}&gt;</p>
                                        <p className="text-sm font-bold text-black dark:text-white">Assunto: ✅ {activeNotificationMockup.title}</p>
                                    </div>

                                    <div className="bg-zinc-50 dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200/60 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                        {activeNotificationMockup.text}
                                    </div>

                                    <div className="pt-2 text-[11px] text-zinc-400 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                                        <span>Enviado via Servidor SMTP Seguro (TLS)</span>
                                        <span>{activeNotificationMockup.date}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MOCKUP TYPE: APP NOTIFICATION */}
                        {activeNotificationMockup.type === 'app' && (
                            <div className="w-[380px] bg-zinc-900 text-white rounded-3xl p-5 border border-zinc-800 shadow-2xl flex flex-col gap-3 font-sans">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-xl bg-[#0412dd] flex items-center justify-center font-season text-xs font-bold text-white">
                                            A
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">ASTERYSKO</span>
                                    </div>
                                    <span className="text-[10px] text-zinc-400 font-mono">agora</span>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-white mb-1">{activeNotificationMockup.title}</h4>
                                    <p className="text-xs text-zinc-300 leading-relaxed">{activeNotificationMockup.text}</p>
                                </div>

                                <div className="border-t border-zinc-800 pt-2 flex justify-between items-center text-[10px] text-zinc-400">
                                    <span>Toque para abrir no Aplicativo</span>
                                    <span className="text-[#3b48ff] font-bold">Ver detalhes →</span>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* IN-APP DOCUMENT PREVIEW LIGHTBOX MODAL */}
            {previewFile && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                            <div className="flex items-center gap-3 min-w-0 pr-4">
                                <div className="w-8 h-8 rounded-lg bg-[#0412dd]/10 dark:bg-[#3b48ff]/20 text-[#0412dd] dark:text-[#3b48ff] flex items-center justify-center shrink-0">
                                    <FileText size={16} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-sm text-black dark:text-white truncate" title={previewFile.name}>{previewFile.name}</h3>
                                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded ${
                                        previewFile.isPublic 
                                            ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400' 
                                            : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                                    }`}>
                                        {previewFile.isPublic ? 'Público (Cliente)' : 'Privado (Apenas Time)'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <a 
                                    href={previewFile.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-xs font-semibold text-zinc-650 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <ExternalLink size={14} /> Abrir externa
                                </a>
                                <button 
                                    onClick={() => setPreviewFile(null)}
                                    className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
                            {previewFile.url.endsWith('.png') || previewFile.url.endsWith('.jpg') || previewFile.url.endsWith('.jpeg') || previewFile.url.endsWith('.webp') ? (
                                <img 
                                    src={previewFile.url} 
                                    alt={previewFile.name} 
                                    className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                                />
                            ) : (
                                <iframe 
                                    src={previewFile.url} 
                                    title={previewFile.name} 
                                    className="w-full h-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE INVOICE MODAL */}
            {isCreateInvoiceOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-5">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <h3 className="font-season text-xl font-medium text-black dark:text-white">Gerar Nova Fatura</h3>
                            <button onClick={() => setIsCreateInvoiceOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Descrição</label>
                                <input 
                                    type="text"
                                    placeholder={`ex: Fatura de Honorários - ${dealTitle}`}
                                    value={invoiceDesc}
                                    onChange={(e) => setInvoiceDesc(e.target.value)}
                                    className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-zinc-950 text-black dark:text-white outline-none focus:border-[#0412dd]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Valor (R$)</label>
                                    <input 
                                        type="text"
                                        placeholder="1500,00"
                                        value={invoiceAmount}
                                        onChange={(e) => setInvoiceAmount(e.target.value)}
                                        className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-zinc-950 text-black dark:text-white outline-none focus:border-[#0412dd]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Vencimento</label>
                                    <input 
                                        type="date"
                                        value={invoiceDueDate}
                                        onChange={(e) => setInvoiceDueDate(e.target.value)}
                                        className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-zinc-950 text-black dark:text-white outline-none focus:border-[#0412dd]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Forma de Pagamento</label>
                                <select 
                                    value={invoicePaymentMethod}
                                    onChange={(e) => setInvoicePaymentMethod(e.target.value)}
                                    className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-zinc-950 text-black dark:text-white outline-none focus:border-[#0412dd]"
                                >
                                    <option value="PIX">Pix / Transferência</option>
                                    <option value="BOLETO">Boleto Bancário</option>
                                    <option value="CREDIT_CARD">Cartão de Crédito</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                            <button 
                                onClick={() => setIsCreateInvoiceOpen(false)}
                                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleCreateInvoice}
                                disabled={isSubmittingInvoice}
                                className="px-5 py-2 bg-[#0412dd] dark:bg-[#3b48ff] text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-1.5"
                            >
                                {isSubmittingInvoice && <Loader2 size={14} className="animate-spin" />}
                                Criar Fatura
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT INVOICE MODAL */}
            {editingInvoice && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-5">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <h3 className="font-season text-xl font-medium text-black dark:text-white">Editar Fatura</h3>
                            <button onClick={() => setEditingInvoice(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Descrição</label>
                                <input 
                                    type="text"
                                    value={editingInvoice.description || ''}
                                    onChange={(e) => setEditingInvoice({ ...editingInvoice, description: e.target.value })}
                                    className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-zinc-950 text-black dark:text-white outline-none focus:border-[#0412dd]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Valor (R$)</label>
                                    <input 
                                        type="text"
                                        value={editingInvoice.amount || ''}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, amount: e.target.value })}
                                        className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-zinc-950 text-black dark:text-white outline-none focus:border-[#0412dd]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Status</label>
                                    <select 
                                        value={editingInvoice.status || 'PENDING'}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, status: e.target.value })}
                                        className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-zinc-950 text-black dark:text-white outline-none focus:border-[#0412dd]"
                                    >
                                        <option value="PENDING">Aguardando Pagamento</option>
                                        <option value="PAID">Pago / Confirmado</option>
                                        <option value="OVERDUE">Vencido</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                            <button 
                                onClick={() => setEditingInvoice(null)}
                                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveInvoiceEdit}
                                className="px-5 py-2 bg-[#0412dd] dark:bg-[#3b48ff] text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-colors"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div 
                className={`bg-[#fcfcfc] dark:bg-zinc-950 w-full max-w-[1000px] h-[90vh] rounded-[24px] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform ${isOpen && !isClosing ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}`}
            >
                {/* Header */}
                <div className="bg-white dark:bg-zinc-900 border-b border-[#e5e5e5] dark:border-zinc-800 shrink-0">
                    <div className="p-6 pb-0">
                        <div className="flex justify-between items-start mb-2">
                            <span className="bg-[#eef2ff] dark:bg-blue-900/30 text-[#0412dd] dark:text-[#3b48ff] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                {getStatusLabel(currentDeal?.status)}
                            </span>
                            <button onClick={handleClose} className="text-[#9f9f9f] hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1.5 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <h2 className="font-season text-[32px] font-[420] text-black dark:text-white leading-tight">
                            {dealTitle}
                        </h2>
                        <p className="text-sm font-medium text-[#9f9f9f] mt-1 mb-6 flex items-center gap-2">
                            Processo AST-{currentDeal?.id?.slice(0,8) || '0000'} <span className="w-1 h-1 rounded-full bg-[#ccc]"></span> Cliente: {clientName}
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
                    {isLoadingDetails ? (
                        <div className="absolute inset-0 bg-[#fcfcfc]/80 dark:bg-[#09090b]/80 z-30 flex items-center justify-center">
                            <Loader2 className="animate-spin text-[#0412dd] dark:text-[#3b48ff] mr-2" size={24} />
                            <span className="text-sm font-semibold text-black dark:text-white">Carregando detalhes...</span>
                        </div>
                    ) : null}

                    {/* TAB: VISÃO GERAL */}
                    {activeTab === 'Visão geral' && (
                        <div className="flex min-h-full">
                            {/* Left Column (Main) */}
                            <div className="flex-1 border-r border-[#e5e5e5] dark:border-zinc-800 p-8 pb-16 flex flex-col gap-8">
                                
                                {/* Próxima Ação */}
                                <div>
                                    <p className="text-[11px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-2">Próxima ação pendente</p>
                                    <div className="flex flex-col bg-white dark:bg-zinc-900 border border-[#eef2ff] dark:border-blue-900/30 p-5 rounded-xl shadow-sm gap-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-season text-[20px] font-[420] text-black dark:text-white mb-1">{nextActionInfo.title}</h3>
                                                <p className="text-[12px] font-medium text-[#666] dark:text-zinc-400 leading-relaxed mb-2">
                                                    {nextActionInfo.desc}
                                                </p>
                                                <div className="text-[10.5px] bg-zinc-50 dark:bg-zinc-950 px-3 py-1.5 rounded-md border border-zinc-100 dark:border-zinc-850 text-zinc-500 dark:text-zinc-400 font-semibold italic flex items-center gap-1.5">
                                                    <Clock size={11} className="text-zinc-450 shrink-0" />
                                                    <span>{nextActionInfo.realBehavior}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800/80 pt-3 mt-1">
                                            <p className="text-[11px] font-medium text-[#666] dark:text-zinc-400">
                                                Responsável: <span className="font-bold text-black dark:text-white">{assignedUser}</span>
                                            </p>
                                            <button 
                                                onClick={handleAdvanceStage}
                                                className="bg-[#0412dd] dark:bg-[#3b48ff] text-white text-[12px] font-bold px-4 py-2 rounded-full hover:bg-blue-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                                            >
                                                Concluir e Avançar
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Andamento (Stepper) */}
                                <div className="border-y border-[#e5e5e5] dark:border-zinc-800 py-8 overflow-x-auto">
                                    <p className="text-[11px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-6">Andamento do Funil</p>
                                    <div className="flex items-center justify-between min-w-[680px] relative px-4">
                                        <div className="absolute left-10 right-10 top-4 h-[1px] bg-[#e5e5e5] dark:bg-zinc-800 -z-10" />
                                        {steps.slice(0, 7).map((step, idx) => {
                                            const isCompleted = idx < currentStepIdx;
                                            const isActive = idx === currentStepIdx;
                                            return (
                                                <div key={step} className="flex flex-col items-center gap-2 bg-[#fcfcfc] dark:bg-zinc-950 px-2 relative z-10">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-[#0412dd] border-[#0412dd] text-white' : isActive ? 'border-[#0412dd] bg-white dark:bg-zinc-900' : 'border-[#ccc] dark:border-zinc-700 bg-white dark:bg-zinc-900'}`}>
                                                        {isCompleted ? <Check size={16} strokeWidth={3} /> : isActive ? <div className="w-2.5 h-2.5 rounded-full bg-[#0412dd]" /> : null}
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`text-[11px] font-bold whitespace-nowrap ${isActive ? 'text-[#0412dd] dark:text-[#3b48ff]' : isCompleted ? 'text-black dark:text-white' : 'text-[#9f9f9f]'}`}>{step}</p>
                                                        {isCompleted && <p className="text-[9px] font-medium text-[#9f9f9f]">Concluído</p>}
                                                        {isActive && <p className="text-[9px] font-bold text-[#0412dd] dark:text-[#3b48ff]">Atual</p>}
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
                                            { label: 'Serviço', value: currentDeal?.serviceInterest || 'Registro de Marca' },
                                            { label: 'Marca', value: dealTitle },
                                            { label: 'Apresentação', value: currentDeal?.presentation || 'Nominativa' },
                                            { label: 'Natureza', value: currentDeal?.nature || 'Mista / Produto ou Serviço' },
                                            { label: 'Classe de Nice', value: currentDeal?.process?.brand?.nclClasses?.[0] ? `NCL ${currentDeal.process.brand.nclClasses[0]}` : currentDeal?.nclClass || 'NCL 1' },
                                            { label: 'Titular', value: clientName },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between py-3 border-b border-[#f0f0f0] dark:border-zinc-800/50 last:border-0 group">
                                                <span className="text-[13px] font-semibold text-[#666] dark:text-zinc-400 w-1/3">{item.label}</span>
                                                <div className="flex-1 flex justify-between items-center">
                                                    <span className="text-[13px] font-medium text-black dark:text-white">{item.value}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Observações */}
                                <div>
                                    <p className="text-[11px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-4">Anotações e Histórico Rápido</p>
                                    
                                    <div className="flex flex-col gap-4 mb-5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {observations.length === 0 ? (
                                            <p className="text-[12px] text-[#9f9f9f] italic">Nenhuma anotação registrada.</p>
                                        ) : (
                                            observations.map((obs, idx) => (
                                                <div key={idx} className="flex gap-3">
                                                    <div className="w-7 h-7 rounded-full bg-[#eef2ff] dark:bg-blue-900/30 text-[#0412dd] dark:text-[#3b48ff] flex items-center justify-center text-[10px] font-bold shrink-0">{obs.author}</div>
                                                    <div className="min-w-0 font-sans">
                                                        <div className="flex items-baseline gap-2 mb-0.5">
                                                            <span className="text-[12px] font-bold text-black dark:text-white">{obs.name}</span>
                                                            <span className="text-[10px] font-medium text-[#9f9f9f]">{obs.date}</span>
                                                        </div>
                                                        <p className="text-[12px] font-medium text-[#555] dark:text-zinc-300 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-[#e5e5e5] dark:border-zinc-800 shadow-xs inline-block mt-0.5 max-w-full break-words">{obs.text}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="relative flex items-center">
                                        <input 
                                            type="text" 
                                            placeholder="Escreva uma nova anotação e aperte Enter..."
                                            value={newObservation}
                                            onChange={(e) => setNewObservation(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddObservation();
                                            }}
                                            className="w-full border border-[#e5e5e5] dark:border-zinc-700 rounded-lg pl-4 pr-12 py-3 text-[13px] font-medium bg-white dark:bg-zinc-900 focus:border-[#0412dd] outline-none transition-colors dark:text-white shadow-sm"
                                        />
                                        <button 
                                            onClick={handleAddObservation}
                                            className="absolute right-3 p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[#0412dd] dark:text-[#3b48ff] transition-colors"
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>
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
                                    <p className="text-[13px] font-medium text-[#666] dark:text-zinc-400 mb-1 flex items-center gap-2 font-mono">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect><polyline points="3 7 12 13 21 7"></polyline></svg>
                                        <span className="truncate">{clientEmail}</span>
                                    </p>
                                    <p className="text-[13px] font-medium text-[#666] dark:text-zinc-400 mb-4 flex items-center gap-2 font-mono">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                        <span>{clientPhone}</span>
                                    </p>
                                </div>

                                {/* Arquivos recentes */}
                                <div className="border-t border-[#e5e5e5] dark:border-zinc-800 pt-8 relative">
                                    <p className="text-[11px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-4">Arquivos anexados</p>
                                    
                                    <div className="flex flex-col gap-2 mb-4 max-h-[250px] overflow-y-auto custom-scrollbar">
                                        {filesList.length ? filesList.map((file: any, idx: number) => (
                                            <div key={idx} className="flex flex-col p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-[#e5e5e5] dark:border-zinc-700/50 gap-1.5 relative group/file">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/20 text-red-500 flex items-center justify-center shrink-0">
                                                        <FileText size={14} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[11px] font-bold text-black dark:text-white leading-tight truncate" title={file.name}>{file.name}</p>
                                                        <p className="text-[9.5px] font-medium text-[#9f9f9f]">{file.date} • {file.size}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => setPreviewFile(file)}
                                                        className="text-[10px] font-bold text-[#0412dd] dark:text-[#3b48ff] hover:underline shrink-0"
                                                    >
                                                        Ver
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-zinc-200/55 dark:border-zinc-850 pt-1.5 mt-0.5">
                                                    <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded ${
                                                        file.isPublic 
                                                            ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' 
                                                            : 'bg-red-50 text-red-750 dark:bg-red-950/20 dark:text-red-400'
                                                    }`}>
                                                        {file.isPublic ? 'Público (Cliente)' : 'Privado (Apenas Time)'}
                                                    </span>
                                                </div>
                                            </div>
                                        )) : (
                                            <p className="text-[12px] text-[#9f9f9f] italic">Nenhum arquivo anexado ainda.</p>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <button 
                                            onClick={() => setShowUploadMenu(!showUploadMenu)}
                                            className="text-[12px] font-bold text-[#0412dd] dark:text-[#3b48ff] flex items-center gap-1 hover:underline cursor-pointer"
                                        >
                                            {uploadingFile ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Plus size={14} strokeWidth={3} />
                                            )} 
                                            {uploadingFile ? 'Enviando...' : 'Upload de arquivo'}
                                        </button>
                                        
                                        {showUploadMenu && (
                                            <div className="absolute left-0 bottom-full mb-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-30 py-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                                                <label className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer">
                                                    <span>Procuração Assinada (Público)</span>
                                                    <input type="file" className="hidden" onChange={(e) => { handleFileUpload(e.target.files?.[0], 'proxy'); setShowUploadMenu(false); }} />
                                                </label>
                                                <label className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer">
                                                    <span>Guia GRU (Público)</span>
                                                    <input type="file" className="hidden" onChange={(e) => { handleFileUpload(e.target.files?.[0], 'gru'); setShowUploadMenu(false); }} />
                                                </label>
                                                <label className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer">
                                                    <span>Comprovante GRU (Público)</span>
                                                    <input type="file" className="hidden" onChange={(e) => { handleFileUpload(e.target.files?.[0], 'gru_receipt'); setShowUploadMenu(false); }} />
                                                </label>
                                                <label className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer">
                                                    <span>Recibo de Protocolo (Privado - Time)</span>
                                                    <input type="file" className="hidden" onChange={(e) => { handleFileUpload(e.target.files?.[0], 'protocol'); setShowUploadMenu(false); }} />
                                                </label>
                                                <label className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer">
                                                    <span>Certificado de Registro (Público)</span>
                                                    <input type="file" className="hidden" onChange={(e) => { handleFileUpload(e.target.files?.[0], 'certificate'); setShowUploadMenu(false); }} />
                                                </label>
                                            </div>
                                        )}
                                    </div>
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
                            </div>

                            <div className="space-y-3">
                                {stageTasks.length === 0 ? (
                                    <p className="text-sm font-medium text-zinc-500 italic">Nenhum checklist de ação específico para esta etapa.</p>
                                ) : (
                                    stageTasks.map((task) => {
                                        const isCompleted = completedTasks.includes(task.id);
                                        return (
                                            <div 
                                                key={task.id}
                                                onClick={() => handleToggleTask(task.id)}
                                                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                                                    isCompleted 
                                                        ? 'bg-zinc-50 dark:bg-zinc-900 border-transparent opacity-65' 
                                                        : 'bg-white dark:bg-zinc-900 border-[#e5e5e5] dark:border-zinc-800 shadow-sm hover:border-[#0412dd] dark:hover:border-[#3b48ff]'
                                                }`}
                                            >
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                    isCompleted 
                                                        ? 'bg-[#0412dd] border-[#0412dd] dark:bg-[#3b48ff] dark:border-[#3b48ff] text-white' 
                                                        : 'border-zinc-350 dark:border-zinc-700 bg-white dark:bg-zinc-950'
                                                }`}>
                                                    {isCompleted && <Check size={12} strokeWidth={4} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-[13.5px] font-bold truncate ${
                                                        isCompleted 
                                                            ? 'text-zinc-400 dark:text-zinc-500 line-through font-normal' 
                                                            : 'text-black dark:text-white font-medium'
                                                    }`}>
                                                        {task.title}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <span className={`text-[11.5px] font-bold flex items-center gap-1 ${
                                                        isCompleted 
                                                            ? 'text-zinc-400' 
                                                            : task.due === 'Hoje' 
                                                                ? 'text-red-500 dark:text-red-400' 
                                                                : 'text-zinc-500 dark:text-zinc-400'
                                                    }`}>
                                                        <Calendar size={13} /> {task.due}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: DOCUMENTOS */}
                    {activeTab === 'Documentos' && (
                        <div className="p-8 pb-16 max-w-4xl mx-auto min-h-full flex flex-col gap-6">
                            
                            {/* Interactive Upload Dropzone */}
                            <div 
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    const droppedFile = e.dataTransfer.files?.[0];
                                    if (droppedFile) {
                                        const type = prompt('Selecione o tipo de arquivo:\n1 = Procuração Assinada\n2 = Guia GRU\n3 = Comprovante GRU\n4 = Recibo de Protocolo (Privado)\n5 = Certificado', '1');
                                        const typeMap: Record<string, string> = { '1': 'proxy', '2': 'gru', '3': 'gru_receipt', '4': 'protocol', '5': 'certificate' };
                                        if (type && typeMap[type]) {
                                            handleFileUpload(droppedFile, typeMap[type]);
                                        }
                                    }
                                }}
                                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors ${
                                    isDragging 
                                        ? 'border-[#0412dd] bg-blue-50/50 dark:bg-blue-900/20' 
                                        : 'border-[#e5e5e5] dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10'
                                }`}
                            >
                                <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm mb-3 text-[#0412dd] dark:text-[#3b48ff]">
                                    <UploadCloud size={24} />
                                </div>
                                <h4 className="text-[15px] font-bold text-black dark:text-white mb-1">Central de Upload de Documentos</h4>
                                <p className="text-[12.5px] text-[#666] dark:text-zinc-400 mb-4 max-w-[360px]">
                                    Arraste seus arquivos para cá ou clique abaixo para enviar um documento do processo.
                                </p>
                                
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {[
                                        { label: '+ Procuração', type: 'proxy' },
                                        { label: '+ Guia GRU', type: 'gru' },
                                        { label: '+ Comprovante GRU', type: 'gru_receipt' },
                                        { label: '+ Recibo de Protocolo (Privado)', type: 'protocol' },
                                        { label: '+ Certificado', type: 'certificate' },
                                    ].map(btn => (
                                        <label key={btn.type} className="bg-white dark:bg-zinc-800 border border-[#e5e5e5] dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors shadow-xs cursor-pointer">
                                            {btn.label}
                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e.target.files?.[0], btn.type)} />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Documents Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {filesList.length === 0 ? (
                                    <div className="col-span-2 text-center py-12 text-zinc-400 dark:text-zinc-500 font-medium text-sm">
                                        Nenhum documento anexado ainda a este processo.
                                    </div>
                                ) : (
                                    filesList.map((file) => (
                                        <div key={file.key} className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 p-4 rounded-xl flex items-start gap-4 hover:shadow-md transition-all relative group">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-[#0412dd] dark:text-[#3b48ff] flex items-center justify-center shrink-0">
                                                <FileText size={20} />
                                            </div>
                                            
                                            <div className="flex-1 min-w-0 pr-6">
                                                {editingFileId === file.key ? (
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <input 
                                                            type="text" 
                                                            value={editingFileNameInput} 
                                                            onChange={(e) => setEditingFileNameInput(e.target.value)}
                                                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveFileName(file.key); }}
                                                            className="text-xs font-bold border border-[#0412dd] rounded px-1.5 py-0.5 w-full bg-white dark:bg-zinc-950 text-black dark:text-white outline-none"
                                                            autoFocus
                                                        />
                                                        <button 
                                                            onClick={() => handleSaveFileName(file.key)}
                                                            className="text-xs text-green-600 font-bold px-1"
                                                        >
                                                            OK
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <p className="text-[13.5px] font-bold text-black dark:text-white leading-tight mb-1 truncate" title={file.name}>
                                                        {file.name}
                                                    </p>
                                                )}
                                                
                                                <p className="text-[11.5px] text-[#666] dark:text-zinc-400 mb-2">{file.date} • {file.size}</p>
                                                
                                                <div className="flex items-center justify-between">
                                                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded ${
                                                        file.isPublic 
                                                            ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' 
                                                            : 'bg-red-50 text-red-750 dark:bg-red-950/20 dark:text-red-400'
                                                    }`}>
                                                        {file.isPublic ? 'Público (Cliente)' : 'Privado (Apenas Time)'}
                                                    </span>

                                                    <button 
                                                        onClick={() => setPreviewFile(file)}
                                                        className="text-[11px] font-bold text-[#0412dd] dark:text-[#3b48ff] hover:underline flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Eye size={12} /> Visualizar
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Action Menu (Three Dots) */}
                                            <div className="absolute right-3 top-3 z-10">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuFileKey(openMenuFileKey === file.key ? null : file.key);
                                                    }}
                                                    className="p-1 text-zinc-400 hover:text-black dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {openMenuFileKey === file.key && (
                                                    <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                                        <button 
                                                            onClick={() => { setPreviewFile(file); setOpenMenuFileKey(null); }}
                                                            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                                                        >
                                                            <Eye size={14} /> Visualizar
                                                        </button>
                                                        <button 
                                                            onClick={() => { 
                                                                setEditingFileId(file.key); 
                                                                setEditingFileNameInput(file.name); 
                                                                setOpenMenuFileKey(null); 
                                                            }}
                                                            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                                                        >
                                                            <Edit2 size={14} /> Renomear
                                                        </button>
                                                        <button 
                                                            onClick={() => { handleDeleteFile(file.key, file.name); setOpenMenuFileKey(null); }}
                                                            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-1.5"
                                                        >
                                                            <Trash2 size={14} /> Excluir
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: FINANCEIRO */}
                    {activeTab === 'Financeiro' && (
                        <div className="p-8 pb-16 max-w-4xl mx-auto min-h-full flex flex-col gap-8">
                            
                            {/* KPI Metrics */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                                    <div className="w-10 h-10 bg-[#eef2ff] dark:bg-blue-900/30 text-[#0412dd] dark:text-[#3b48ff] rounded-full flex items-center justify-center mb-4">
                                        <DollarSign size={20} />
                                    </div>
                                    <p className="text-[12px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-1">Valor Contratado</p>
                                    <h3 className="font-season text-[32px] font-[420] text-black dark:text-white">{formattedContracted}</h3>
                                </div>

                                <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                                        <CreditCard size={20} />
                                    </div>
                                    <p className="text-[12px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-1">Total Recebido</p>
                                    <h3 className="font-season text-[32px] font-[420] text-green-600 dark:text-green-400">{formattedPaid}</h3>
                                </div>

                                <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mb-4">
                                        <Clock size={20} />
                                    </div>
                                    <p className="text-[12px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-1">A Receber</p>
                                    <h3 className="font-season text-[32px] font-[420] text-amber-600 dark:text-amber-400">{formattedPending}</h3>
                                </div>
                            </div>

                            {/* Invoices List Container */}
                            <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
                                <div className="p-6 border-b border-[#e5e5e5] dark:border-zinc-800 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-season text-[20px] font-[420] text-black dark:text-white">Faturas e Cobranças do Cliente</h4>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Gestão de boletos, pix e confirmações de honorários.</p>
                                    </div>

                                    <button 
                                        onClick={() => setIsCreateInvoiceOpen(true)}
                                        className="text-[13px] font-bold bg-[#0412dd] dark:bg-[#3b48ff] text-white px-4 py-2 rounded-xl hover:bg-blue-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Plus size={14} strokeWidth={3} /> Gerar Nova Fatura
                                    </button>
                                </div>

                                <div className="p-6">
                                    {isLoadingInvoices ? (
                                        <div className="flex justify-center py-10 opacity-50">
                                            <Loader2 className="animate-spin text-[#0412dd] mr-2" size={18} />
                                            <span className="text-xs font-semibold text-black dark:text-white">Buscando faturas...</span>
                                        </div>
                                    ) : invoices.length === 0 ? (
                                        <div className="text-center py-12 bg-zinc-50/50 dark:bg-zinc-950/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                            <Receipt size={32} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
                                            <p className="text-[14px] text-zinc-700 dark:text-zinc-300 font-bold mb-1">Nenhuma fatura emitida para este cliente.</p>
                                            <p className="text-xs text-zinc-400 mb-4 max-w-xs mx-auto">Gere uma fatura comercial para enviar cobrança via Pix/Boleto e notificar o cliente por WhatsApp.</p>
                                            <button 
                                                onClick={() => setIsCreateInvoiceOpen(true)}
                                                className="text-xs font-bold text-[#0412dd] dark:text-[#3b48ff] hover:underline"
                                            >
                                                + Emitir primeira fatura agora
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            {invoices.map((inv) => {
                                                const isPaid = inv.status === 'PAID';
                                                const formattedVal = `R$ ${Number(inv.amount || 0).toFixed(2).replace('.', ',')}`;
                                                const formattedDate = inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('pt-BR') : '--';

                                                return (
                                                    <div 
                                                        key={inv.id} 
                                                        className="flex items-center justify-between p-4 bg-zinc-50/70 dark:bg-zinc-800/30 rounded-xl border border-zinc-200/70 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all relative group"
                                                    >
                                                        <div className="flex items-center gap-4 min-w-0 pr-4">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                                isPaid 
                                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                                                                    : 'bg-blue-100 dark:bg-blue-900/30 text-[#0412dd] dark:text-[#3b48ff]'
                                                            }`}>
                                                                <Receipt size={20} />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <h5 className="text-[13.5px] font-bold text-black dark:text-white truncate">
                                                                    {inv.description || 'Fatura de Honorários'}
                                                                </h5>
                                                                <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                                    <span>Vencimento: <strong className="text-zinc-700 dark:text-zinc-300">{formattedDate}</strong></span>
                                                                    <span>•</span>
                                                                    <span className="uppercase font-semibold text-zinc-650 dark:text-zinc-350">{inv.paymentMethod || 'PIX'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4 shrink-0">
                                                            <span className="text-[15px] font-bold text-black dark:text-white">{formattedVal}</span>
                                                            
                                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                                                                isPaid 
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                                    : inv.status === 'OVERDUE'
                                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                            }`}>
                                                                {isPaid ? 'Pago' : inv.status === 'OVERDUE' ? 'Vencido' : 'Aguardando'}
                                                            </span>

                                                            {/* Actions Dropdown Button */}
                                                            <div className="relative">
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setOpenInvoiceMenuId(openInvoiceMenuId === inv.id ? null : inv.id);
                                                                    }}
                                                                    className="p-1 text-zinc-400 hover:text-black dark:hover:text-white rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                                                >
                                                                    <MoreVertical size={16} />
                                                                </button>

                                                                {openInvoiceMenuId === inv.id && (
                                                                    <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-30 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                                                        <a 
                                                                            href={`https://cliente.asterysko.com/portal/financial?invoiceId=${inv.id}`}
                                                                            target="_blank" 
                                                                            rel="noreferrer"
                                                                            className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                                                                        >
                                                                            <ExternalLink size={14} /> Ver Página da Fatura
                                                                        </a>
                                                                        
                                                                        <button 
                                                                            onClick={() => { handleCopyInvoiceLink(inv); setOpenInvoiceMenuId(null); }}
                                                                            className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                                                                        >
                                                                            <Copy size={14} /> Copiar Link de Pagamento
                                                                        </button>

                                                                        <button 
                                                                            onClick={() => { setEditingInvoice(inv); setOpenInvoiceMenuId(null); }}
                                                                            className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                                                                        >
                                                                            <Edit2 size={14} /> Editar Fatura
                                                                        </button>

                                                                        <button 
                                                                            onClick={() => { handleDeleteInvoice(inv.id); setOpenInvoiceMenuId(null); }}
                                                                            className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-1.5"
                                                                        >
                                                                            <Trash2 size={14} /> Excluir Fatura
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: HISTÓRICO */}
                    {activeTab === 'Histórico' && (
                        <div className="p-8 pb-16 max-w-3xl mx-auto min-h-full">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="font-season text-[24px] font-[420] text-black dark:text-white">Linha do Tempo e Log de Notificações</h3>
                                    <p className="text-[13px] text-[#666] dark:text-zinc-400">Histórico completo de auditoria do processo e disparos de comunicação.</p>
                                </div>
                            </div>
                            
                            <div className="relative border-l-2 border-[#e5e5e5] dark:border-zinc-800 ml-4 space-y-8 pb-8">
                                {currentDeal?.activities?.length ? (
                                    currentDeal.activities.map((event: any, idx: number) => {
                                        const authorName = event.user?.name || 'Sistema Asterysko';
                                        const eventDate = new Date(event.createdAt).toLocaleString('pt-BR', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });

                                        const dispatches = getNotificationDispatchesForActivity(event);

                                        return (
                                            <div key={idx} className="relative pl-8 group">
                                                <div className="absolute -left-[17px] w-8 h-8 rounded-full border-4 border-[#fcfcfc] dark:border-zinc-950 bg-blue-100 text-[#0412dd] dark:bg-blue-900/40 dark:text-[#3b48ff] flex items-center justify-center shadow-xs">
                                                    <Clock size={12} strokeWidth={3} />
                                                </div>

                                                <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex flex-col gap-3">
                                                    <div>
                                                        <h4 className="text-[14px] font-bold text-black dark:text-white leading-snug mb-1">
                                                            {event.content}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-[11.5px] text-zinc-500 dark:text-zinc-400 font-medium">
                                                            <span className="flex items-center gap-1">
                                                                <User size={12} className="text-zinc-400" /> {authorName}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{eventDate}</span>
                                                        </div>
                                                    </div>

                                                    {/* Notification Dispatches Badges */}
                                                    {dispatches.length > 0 && (
                                                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-2">
                                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                                                Notificações Disparadas (Clique para ver o mockup):
                                                            </p>

                                                            <div className="flex flex-wrap gap-2">
                                                                {dispatches.map((disp, dIdx) => (
                                                                    <button 
                                                                        key={dIdx}
                                                                        onClick={() => setActiveNotificationMockup({
                                                                            type: disp.type,
                                                                            title: disp.mockupTitle,
                                                                            text: disp.mockupText,
                                                                            recipientName: clientName,
                                                                            recipientPhone: clientPhone,
                                                                            recipientEmail: clientEmail,
                                                                            date: new Date(event.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                                                                        })}
                                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                                                                            disp.type === 'whatsapp' 
                                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50'
                                                                                : disp.type === 'email'
                                                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50'
                                                                                    : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/50'
                                                                        }`}
                                                                    >
                                                                        {disp.type === 'whatsapp' && <MessageCircle size={13} className="shrink-0" />}
                                                                        {disp.type === 'email' && <Mail size={13} className="shrink-0" />}
                                                                        {disp.type === 'app' && <Bell size={13} className="shrink-0" />}
                                                                        
                                                                        <span>{disp.label}</span>
                                                                        <CheckCircle2 size={12} className="ml-1 opacity-70" />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="relative pl-8">
                                        <div className="absolute -left-[17px] w-8 h-8 rounded-full border-4 border-[#fcfcfc] dark:border-zinc-950 bg-green-100 text-green-600 flex items-center justify-center">
                                            <Plus size={12} strokeWidth={3} />
                                        </div>
                                        <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex flex-col gap-3">
                                            <div>
                                                <h4 className="text-[14px] font-bold text-black dark:text-white mb-1">
                                                    Lead criado na etapa {getStatusLabel(currentDeal?.status)}
                                                </h4>
                                                <p className="text-[12px] font-medium text-[#666] flex items-center gap-2">
                                                    <span>Por: Sistema</span> • <span>{dealDate}</span>
                                                </p>
                                            </div>

                                            {/* Default Initial Notifications Dispatches */}
                                            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-2">
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                                    Notificações Iniciais Enviadas ao Cliente (Clique no mockup):
                                                </p>

                                                <div className="flex flex-wrap gap-2">
                                                    <button 
                                                        onClick={() => setActiveNotificationMockup({
                                                            type: 'whatsapp',
                                                            title: `WhatsApp: Lead criado (${dealTitle})`,
                                                            text: `Olá ${clientName}! Seu pedido de registro da marca "${dealTitle}" foi recebido e cadastrado com sucesso pela equipe da Asterysko.`,
                                                            recipientName: clientName,
                                                            recipientPhone: clientPhone,
                                                            recipientEmail: clientEmail,
                                                            date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                                                        })}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50 cursor-pointer"
                                                    >
                                                        <MessageCircle size={13} /> WhatsApp Sent <CheckCircle2 size={12} className="ml-1 opacity-70" />
                                                    </button>

                                                    <button 
                                                        onClick={() => setActiveNotificationMockup({
                                                            type: 'email',
                                                            title: `Bem-vindo à Asterysko - Registro de Marca ${dealTitle}`,
                                                            text: `Bem-vindo(a) ${clientName}!\n\nSeu cadastro foi realizado no portal da Asterysko para o acompanhamento do registro da marca ${dealTitle}.\n\nAcompanhe seu processo em tempo real.`,
                                                            recipientName: clientName,
                                                            recipientPhone: clientPhone,
                                                            recipientEmail: clientEmail,
                                                            date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                                                        })}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50 cursor-pointer"
                                                    >
                                                        <Mail size={13} /> E-mail Transacional <CheckCircle2 size={12} className="ml-1 opacity-70" />
                                                    </button>

                                                    <button 
                                                        onClick={() => setActiveNotificationMockup({
                                                            type: 'app',
                                                            title: `Processo ${dealTitle} Iniciado`,
                                                            text: `Seu processo de registro de marca foi cadastrado e iniciado com sucesso!`,
                                                            recipientName: clientName,
                                                            recipientPhone: clientPhone,
                                                            recipientEmail: clientEmail,
                                                            date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                                                        })}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/50 cursor-pointer"
                                                    >
                                                        <Bell size={13} /> App Push <CheckCircle2 size={12} className="ml-1 opacity-70" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="bg-white dark:bg-zinc-950 border-t border-[#e5e5e5] dark:border-zinc-800 p-6 flex items-center justify-between shrink-0 z-10">
                    <button 
                        onClick={handleArchiveLead}
                        className="flex-1 max-w-[200px] h-12 bg-white dark:bg-transparent border-2 border-[#eef2ff] dark:border-blue-900 text-[#0412dd] dark:text-[#3b48ff] text-[14px] font-bold rounded-xl hover:bg-[#eef2ff] dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
                    >
                        Arquivar lead
                    </button>
                    <button 
                        onClick={handleAdvanceStage}
                        className="flex-1 max-w-[400px] ml-4 h-12 bg-[#0412dd] dark:bg-[#3b48ff] text-white text-[14px] font-bold rounded-xl hover:bg-blue-800 transition-colors shadow-sm cursor-pointer"
                    >
                        Avançar etapa do funil
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AsteryskoDealDetailsModal;
