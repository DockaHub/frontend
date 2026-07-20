import React, { useState } from 'react';
import { X, ChevronDown, Upload } from 'lucide-react';
import api from '../../../../services/api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    organizationId?: string;
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
    const [formData, setFormData] = useState({
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

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                brandName: formData.brandName,
                clientName: formData.clientName,
                nclClass: formData.nclClass,
                status: 'NEW', 
                organizationId
            };
            
            await api.post('/asterysko/processes', payload);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create process', error);
            alert('Erro ao criar processo. Verifique se preencheu o cliente e a marca.');
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
                    <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-[#9f9f9f]">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pb-6">
                    <InputField label="Cliente" name="clientName" placeholder="Pesquise por um cliente cadastrado" value={formData.clientName} onChange={handleChange} />
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
