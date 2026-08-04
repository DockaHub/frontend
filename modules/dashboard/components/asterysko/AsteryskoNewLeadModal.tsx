import React, { useEffect, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
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

const AsteryskoNewLeadModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, organizationId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [plans, setPlans] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        clientName: '',
        contactEmail: '',
        contactPhone: '',
        brandName: '',
        planId: '',
        serviceInterest: 'Registro de marca',
        commercialRep: 'Pessoa da Asterysko encarregada',
        leadOrigin: 'Instagram',
        crmStage: 'Novos leads',
        estimatedValue: 'R$0,00',
        closingForecast: '',
        priority: 'Normal',
        internalNotes: ''
    });

    useEffect(() => {
        if (!isOpen) return;
        api.get('/asterysko/plans')
            .then(response => setPlans(Array.isArray(response.data) ? response.data.filter((plan: any) => plan.active !== false) : []))
            .catch(error => console.error('Failed to load Asterysko plans', error));
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Simulated payload for creating lead, linking/creating client & process
            const payload = {
                title: formData.brandName || 'Novo Lead',
                subtitle: formData.clientName,
                status: 'leads',
                value: formData.estimatedValue,
                contactName: formData.clientName,
                contactEmail: formData.contactEmail,
                contactPhone: formData.contactPhone,
                planId: formData.planId || null,
                organizationId
            };
            
            // Call CRM deal endpoint
            await api.post('/asterysko/crm/deals', payload);
            
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create lead', error);
            alert('Erro ao criar lead. Verifique os dados e tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 dark:bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="w-[420px] bg-white dark:bg-zinc-950 m-4 rounded-[20px] shadow-2xl flex flex-col overflow-hidden animate-slide-left">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e5e5] dark:border-zinc-800 shrink-0">
                    <h2 className="font-season text-[22px] font-[420] text-black dark:text-white">
                        Novo lead
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-[#9f9f9f]">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pb-6">
                    
                    {/* Cliente */}
                    <InputField 
                        label="Cliente" 
                        name="clientName" 
                        placeholder="Pesquise por um cliente cadastrado" 
                        value={formData.clientName} 
                        onChange={handleChange} 
                    />
                    <InputField label="E-mail" name="contactEmail" type="email" placeholder="cliente@email.com" value={formData.contactEmail} onChange={handleChange} />
                    <InputField label="WhatsApp" name="contactPhone" placeholder="(00) 00000-0000" value={formData.contactPhone} onChange={handleChange} />

                    {/* Processo */}
                    <div className="px-6 py-5">
                        <h3 className="font-season text-[18px] font-[420] text-black dark:text-white">
                            Processo
                        </h3>
                    </div>

                    <InputField 
                        label="Marca" 
                        name="brandName" 
                        placeholder="Nome da marca" 
                        value={formData.brandName} 
                        onChange={handleChange} 
                    />
                    
                    <InputField 
                        label="Serviço de interesse" 
                        name="serviceInterest" 
                        value={formData.serviceInterest} 
                        isSelect 
                        options={[
                            'Registro de marca', 
                            'Renovação', 
                            'Recurso', 
                            'Oposição', 
                            'Transferência', 
                            'Acompanhamento', 
                            'Outro'
                        ]} 
                        onChange={handleChange} 
                    />

                    <div className="flex flex-col border-b border-[#e5e5e5] dark:border-zinc-800 py-3 px-6 relative">
                        <label className="text-[10px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-1">Plano comercial</label>
                        <div className="relative">
                            <select
                                name="planId"
                                value={formData.planId}
                                onChange={handleChange}
                                className="w-full bg-transparent border-none outline-none font-sans text-[13px] font-semibold text-black dark:text-white appearance-none cursor-pointer pr-6"
                            >
                                <option value="">Pagamento único legado/manual</option>
                                {plans.map((plan: any) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name} — {plan.billingMode === 'SUBSCRIPTION' ? `R$ ${Number(plan.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês` : `R$ ${Number(plan.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#9f9f9f] pointer-events-none" />
                        </div>
                        {formData.planId && (() => {
                            const plan = plans.find((item: any) => item.id === formData.planId);
                            if (!plan || plan.billingMode !== 'SUBSCRIPTION') return null;
                            const first = Number(plan.value || 0) + (plan.taxChargeTiming === 'FIRST_PAYMENT' ? Number(plan.officialTax || 0) : 0);
                            return <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-300">Primeira cobrança R$ {first.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}; depois R$ {Number(plan.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês.</p>;
                        })()}
                    </div>

                    {/* Informações do lead */}
                    <div className="px-6 py-5">
                        <h3 className="font-season text-[18px] font-[420] text-black dark:text-white">
                            Informações do lead
                        </h3>
                    </div>

                    <InputField 
                        label="Responsável comercial" 
                        name="commercialRep" 
                        placeholder="Pesquise por um encarregado" 
                        value={formData.commercialRep} 
                        onChange={handleChange} 
                    />
                    
                    <InputField 
                        label="Origem do lead" 
                        name="leadOrigin" 
                        value={formData.leadOrigin} 
                        isSelect 
                        options={['Instagram', 'Site', 'Indicação', 'Prospecção ativa', 'Outros']} 
                        onChange={handleChange} 
                    />
                    
                    <InputField 
                        label="Etapa inicial do CRM" 
                        name="crmStage" 
                        value={formData.crmStage} 
                        isSelect 
                        options={['Novos leads', 'Contato inicial', 'Proposta', 'Em negociação']} 
                        onChange={handleChange} 
                    />
                    
                    <InputField 
                        label="Valor estimado" 
                        name="estimatedValue" 
                        placeholder="R$0,00" 
                        value={formData.estimatedValue} 
                        onChange={handleChange} 
                    />
                    
                    <InputField 
                        label="Previsão de fechamento" 
                        name="closingForecast" 
                        type="date"
                        value={formData.closingForecast} 
                        onChange={handleChange} 
                    />
                    
                    <InputField 
                        label="Prioridade" 
                        name="priority" 
                        value={formData.priority} 
                        isSelect
                        options={['Baixa', 'Normal', 'Alta', 'Urgente']}
                        onChange={handleChange} 
                    />
                    
                    <InputField 
                        label="Observações internas" 
                        name="internalNotes" 
                        placeholder="Digite aqui alguma observação" 
                        value={formData.internalNotes} 
                        onChange={handleChange} 
                    />

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

export default AsteryskoNewLeadModal;
