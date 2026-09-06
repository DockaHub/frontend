import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, Search, Upload, UserRound, X } from 'lucide-react';
import api from '../../../../services/api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    organizationId?: string;
}

interface ClientOption {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    cpfCnpj?: string | null;
}

const InputField = ({ label, name, placeholder, value, isSelect = false, options = [], type = "text", onChange }: any) => (
    <div className="flex flex-col border-b border-[#e5e5e5] dark:border-zinc-800 py-3 px-6 relative">
        <label className="text-[10px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-1">
            {label}
        </label>
        {isSelect ? (
            <div className="relative">
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full bg-transparent border-none outline-none font-sans text-[13px] font-semibold text-black dark:text-white appearance-none cursor-pointer"
                >
                    {options.map((opt: string) => (
                        <option key={opt} value={opt} className="text-black">{opt}</option>
                    ))}
                </select>
                <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#9f9f9f] pointer-events-none" />
            </div>
        ) : (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-transparent border-none outline-none font-sans text-[13px] font-semibold text-black dark:text-white placeholder:text-[#ccc]"
            />
        )}
    </div>
);

const AsteryskoNewProcessModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, organizationId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [clientMenuOpen, setClientMenuOpen] = useState(false);
    const [formData, setFormData] = useState({
        clientId: '',
        clientName: '', 
        brandName: '',
        apresentacao: 'Nominativa',
        natureza: 'Produto ou serviço',
        nclClass: '1',
        titular: '', 
        responsavel: 'Pessoa da Asterysko encarregada',
        situacao: 'Em preparação',
        origem: 'Novo pedido',
        plano: '',
        valor: 'R$0,00',
        pagamento: 'Mensalmente',
        taxas: 'Nenhuma',
        contrato: '00001',
        canal: 'Instagram',
        prioridade: 'Normal',
        tags: 'Urgente',
        observacoes: '',
        // Conditional fields for Processo já existente
        inpiProcessNumber: '',
        protocolNumber: '',
        depositDate: '',
        asterykoDate: '',
        inpiStatus: '',
        processLink: '',
        nextDeadline: '',
        historyNotes: '',
        // Conditional fields for Mista/Figurativa
        nominativeElements: '',
        claimedColors: ''
    });

    useEffect(() => {
        if (!isOpen) return;
        setClientMenuOpen(false);
        const headers = organizationId ? { 'x-organization-id': organizationId } : undefined;
        api.get('/asterysko/crm/client-options', { headers })
            .then(res => {
                setClients(Array.isArray(res.data) ? res.data : []);
            })
            .catch(err => {
                console.error('Failed to load client options', err);
            });
    }, [isOpen, organizationId]);

    const filteredClients = useMemo(() => {
        const term = formData.clientName.trim().toLocaleLowerCase('pt-BR');
        if (!term || formData.clientId) return clients.slice(0, 8);
        return clients.filter(client => `${client.name} ${client.email || ''} ${client.phone || ''} ${client.cpfCnpj || ''}`.toLocaleLowerCase('pt-BR').includes(term)).slice(0, 8);
    }, [clients, formData.clientId, formData.clientName]);

    const existingClientSelected = Boolean(formData.clientId);

    const selectClient = (client: ClientOption) => {
        setFormData(current => ({
            ...current,
            clientId: client.id,
            clientName: client.name || '',
            titular: current.titular ? current.titular : (client.name || '')
        }));
        setClientMenuOpen(false);
    };

    const clearSelectedClient = () => {
        setFormData(current => ({ ...current, clientId: '', clientName: '' }));
        setClientMenuOpen(true);
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.clientName.trim() || !formData.brandName.trim()) {
            alert('Por favor, informe o cliente e a marca.');
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                brandName: formData.brandName.trim(),
                clientName: formData.clientName.trim(),
                clientId: formData.clientId || undefined,
                nclClass: formData.nclClass,
                status: 'NEW', 
                inpiProcessNumber: formData.inpiProcessNumber?.trim() || undefined,
                brandType: formData.apresentacao.toUpperCase(),
                organizationId
            };
            
            await api.post('/asterysko/processes', payload);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create process', error);
            alert('Erro ao criar processo. Verifique os dados e tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const isMistaOrFigurativa = formData.apresentacao === 'Mista' || formData.apresentacao === 'Figurativa';
    const isProcessoExistente = formData.origem === 'Processo já existente';

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 dark:bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="w-[420px] bg-white dark:bg-zinc-950 m-4 rounded-[20px] shadow-2xl flex flex-col overflow-hidden animate-slide-left">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e5e5] dark:border-zinc-800 shrink-0">
                    <h2 className="font-season text-[22px] font-[420] text-black dark:text-white">
                        Novo processo
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-[#9f9f9f] cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pb-6">
                    {/* Pesquisa ou criação de cliente */}
                    <div className="relative border-b border-[#e5e5e5] px-6 py-3 dark:border-zinc-800">
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#9f9f9f]">
                            Cliente
                        </label>
                        <div className="flex items-center gap-2">
                            {existingClientSelected ? <Check size={16} className="text-emerald-600 shrink-0" /> : <Search size={16} className="text-[#9f9f9f] shrink-0" />}
                            <input
                                className="w-full bg-transparent border-none outline-none font-sans text-[13px] font-semibold text-black dark:text-white placeholder:text-[#ccc]"
                                value={formData.clientName}
                                placeholder="Pesquise por nome, e-mail, telefone ou CPF/CNPJ"
                                onFocus={() => setClientMenuOpen(true)}
                                onChange={event => {
                                    setFormData(current => ({ ...current, clientId: '', clientName: event.target.value }));
                                    setClientMenuOpen(true);
                                }}
                            />
                            {existingClientSelected && (
                                <button type="button" onClick={clearSelectedClient} className="text-[11px] font-bold text-[#0412dd] hover:underline shrink-0 cursor-pointer">
                                    Trocar
                                </button>
                            )}
                        </div>
                        {clientMenuOpen && !existingClientSelected && (
                            <div className="absolute left-4 right-4 top-[58px] z-20 max-h-56 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                                {filteredClients.map(client => (
                                    <button
                                        key={client.id}
                                        type="button"
                                        onClick={() => selectClient(client)}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                                    >
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
                                            <UserRound size={15} />
                                        </span>
                                        <span className="min-w-0">
                                            <strong className="block truncate text-xs text-black dark:text-white">{client.name}</strong>
                                            <small className="block truncate text-[11px] text-[#8f8f8f]">{client.email || client.phone || client.cpfCnpj}</small>
                                        </span>
                                    </button>
                                ))}
                                {formData.clientName.trim() && (
                                    <button
                                        type="button"
                                        onClick={() => setClientMenuOpen(false)}
                                        className="mt-1 w-full rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 text-left text-xs font-semibold text-[#0412dd] hover:bg-indigo-50 dark:border-zinc-700 dark:hover:bg-indigo-950/30 cursor-pointer"
                                    >
                                        {filteredClients.length ? 'Não é nenhum destes? ' : 'Nenhum cliente encontrado. '}Continuar com “{formData.clientName.trim()}” como novo cliente
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    {existingClientSelected && (
                        <p className="mx-6 mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                            Cliente existente selecionado. O processo será vinculado a este cadastro.
                        </p>
                    )}

                    <InputField label="Marca" name="brandName" placeholder="Nome da marca" value={formData.brandName} onChange={handleChange} />
                    <InputField label="Apresentação da marca" name="apresentacao" value={formData.apresentacao} isSelect options={['Nominativa', 'Mista', 'Figurativa', 'Tridimensional']} onChange={handleChange} />
                    
                    {/* Condicionais Mista/Figurativa */}
                    {isMistaOrFigurativa && (
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 border-y border-[#e5e5e5] dark:border-zinc-800">
                            <div className="px-6 py-3 border-b border-[#e5e5e5] dark:border-zinc-800">
                                <label className="text-[10px] font-bold text-[#0412dd] dark:text-[#3b48ff] uppercase tracking-wider mb-2 block">
                                    Upload da imagem/logo
                                </label>
                                <div className="border-2 border-dashed border-[#ccc] dark:border-zinc-700 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                    <Upload size={20} className="text-[#9f9f9f] mb-2" />
                                    <span className="text-xs font-semibold text-[#666] dark:text-[#aaa]">Clique para anexar a logo</span>
                                </div>
                            </div>
                            <InputField label="Elementos nominativos da marca" name="nominativeElements" placeholder="Quais os textos presentes na imagem?" value={formData.nominativeElements} onChange={handleChange} />
                            <InputField label="Cores reivindicadas, se aplicável" name="claimedColors" placeholder="Ex: Azul, Vermelho..." value={formData.claimedColors} onChange={handleChange} />
                        </div>
                    )}

                    <InputField label="Natureza" name="natureza" value={formData.natureza} isSelect options={['Produto ou serviço', 'Produto', 'Serviço']} onChange={handleChange} />
                    <InputField label="Classe de Nice" name="nclClass" value={formData.nclClass} isSelect options={Array.from({length: 45}, (_, i) => `${i + 1}`)} onChange={handleChange} />
                    
                    <InputField label="Titular do pedido" name="titular" placeholder="Pesquise por um cliente cadastrado" value={formData.titular} onChange={handleChange} />
                    <InputField label="Responsável interno" name="responsavel" value={formData.responsavel} placeholder="Pessoa da Asterysko encarregada" onChange={handleChange} />
                    <InputField label="Situação atual" name="situacao" value={formData.situacao} isSelect options={['Em preparação', 'Protocolado', 'Exame de Mérito', 'Concedido']} onChange={handleChange} />
                    
                    <InputField label="Origem do processo" name="origem" value={formData.origem} isSelect options={['Novo pedido', 'Processo já existente', 'Transferência', 'Oposição']} onChange={handleChange} />

                    {/* Condicionais Processo já existente */}
                    {isProcessoExistente && (
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 border-y border-[#e5e5e5] dark:border-zinc-800">
                            <InputField label="Número do processo no INPI" name="inpiProcessNumber" placeholder="Ex: 999999999" value={formData.inpiProcessNumber} onChange={handleChange} />
                            <InputField label="Número do protocolo, se houver" name="protocolNumber" placeholder="Ex: 888888888" value={formData.protocolNumber} onChange={handleChange} />
                            <div className="flex border-b border-[#e5e5e5] dark:border-zinc-800">
                                <div className="flex-1 border-r border-[#e5e5e5] dark:border-zinc-800">
                                    <InputField label="Data do depósito" name="depositDate" type="date" value={formData.depositDate} onChange={handleChange} />
                                </div>
                                <div className="flex-1">
                                    <InputField label="Asterysko assumiu em" name="asterykoDate" type="date" value={formData.asterykoDate} onChange={handleChange} />
                                </div>
                            </div>
                            <InputField label="Situação atual no INPI" name="inpiStatus" placeholder="Ex: Aguardando exame de mérito" value={formData.inpiStatus} onChange={handleChange} />
                            <InputField label="Link do processo" name="processLink" placeholder="https://busca.inpi.gov.br/..." value={formData.processLink} onChange={handleChange} />
                            <InputField label="Próximo prazo" name="nextDeadline" type="date" value={formData.nextDeadline} onChange={handleChange} />
                            <InputField label="Observações sobre o histórico" name="historyNotes" placeholder="Digite os detalhes..." value={formData.historyNotes} onChange={handleChange} />
                        </div>
                    )}

                    <div className="px-6 py-5">
                        <h3 className="font-season text-[18px] font-[420] text-black dark:text-white">
                            Gestão interna
                        </h3>
                    </div>

                    <InputField label="Plano contratado" name="plano" placeholder="00.000.000/0001-00" value={formData.plano} onChange={handleChange} />
                    <InputField label="Valor contratado" name="valor" placeholder="R$0,00" value={formData.valor} onChange={handleChange} />
                    <InputField label="Condição de pagamento" name="pagamento" value={formData.pagamento} isSelect options={['Mensalmente', 'À vista', 'Anual']} onChange={handleChange} />
                    <InputField label="Taxas incluídas" name="taxas" value={formData.taxas} isSelect options={['Nenhuma', 'Federais', 'Todas']} onChange={handleChange} />
                    <InputField label="Número do contrato" name="contrato" placeholder="00001" value={formData.contrato} onChange={handleChange} />
                    <InputField label="Canal de origem do cliente" name="canal" placeholder="Instagram" value={formData.canal} onChange={handleChange} />
                    <InputField label="Prioridade" name="prioridade" placeholder="Normal" value={formData.prioridade} onChange={handleChange} />
                    
                    <div className="flex flex-col border-b border-[#e5e5e5] dark:border-zinc-800 py-3 px-6">
                        <label className="text-[10px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-2">
                            Tags
                        </label>
                        <div className="flex items-center">
                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold cursor-pointer">
                                Urgente
                            </span>
                        </div>
                    </div>

                    <InputField label="Observações internas" name="observacoes" placeholder="Digite aqui alguma observação" value={formData.observacoes} onChange={handleChange} />

                </form>

                {/* Footer Action */}
                <div className="p-6 shrink-0 bg-white dark:bg-zinc-950">
                    <button 
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full h-12 bg-[#0412dd] dark:bg-[#3b48ff] text-white rounded-lg flex items-center justify-center text-[13px] font-bold transition-colors hover:bg-blue-800 disabled:opacity-50"
                    >
                        {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AsteryskoNewProcessModal;
