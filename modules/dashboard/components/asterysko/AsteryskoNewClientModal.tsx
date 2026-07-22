import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../../../services/api';
import { formatPhoneMask, sanitizePhoneForSave } from './utils/phoneMask';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    organizationId?: string;
}

const InputField = ({ label, name, placeholder, value, onChange }: any) => (
    <div className="flex flex-col border-b border-[#e5e5e5] dark:border-zinc-800 py-3 px-6">
        <label className="text-[10px] font-bold text-[#9f9f9f] uppercase tracking-wider mb-1">
            {label}
        </label>
        <input
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-transparent border-none outline-none font-sans text-[13px] font-semibold text-black dark:text-white placeholder:text-[#ccc]"
        />
    </div>
);

const AsteryskoNewClientModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, organizationId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cnpj: '',
        razaoSocial: ''
    });

    // Auto-fill CEP via ViaCEP
    useEffect(() => {
        const fetchCep = async () => {
            const cleanCep = formData.cep.replace(/\D/g, '');
            if (cleanCep.length === 8) {
                try {
                    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                    const data = await res.json();
                    if (!data.erro) {
                        setFormData(prev => ({
                            ...prev,
                            logradouro: data.logradouro || prev.logradouro,
                            bairro: data.bairro || prev.bairro,
                            cidade: data.localidade || prev.cidade,
                            estado: data.uf || prev.estado
                        }));
                    }
                } catch (error) {
                    console.error('Failed to fetch CEP', error);
                }
            }
        };
        fetchCep();
    }, [formData.cep]);

    // Auto-fill CNPJ via BrasilAPI
    useEffect(() => {
        const fetchCnpj = async () => {
            const cleanCnpj = formData.cnpj.replace(/\D/g, '');
            if (cleanCnpj.length === 14) {
                try {
                    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
                    const data = await res.json();
                    if (data.razao_social) {
                        setFormData(prev => ({
                            ...prev,
                            razaoSocial: data.razao_social || prev.razaoSocial
                        }));
                    }
                } catch (error) {
                    console.error('Failed to fetch CNPJ', error);
                }
            }
        };
        fetchCnpj();
    }, [formData.cnpj]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                type: formData.cnpj ? 'PJ' : 'PF',
                cpfCnpj: formData.cnpj || formData.cpf,
                address: `${formData.logradouro}, ${formData.numero} - ${formData.bairro}`,
                city: formData.cidade,
                state: formData.estado,
                postalCode: formData.cep,
                name: formData.name, 
                email: formData.email,
                phone: sanitizePhoneForSave(formData.phone),
                organizationId
            };
            
            await api.post('/asterysko/clients', payload);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create client', error);
            alert('Erro ao criar cliente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        
        // Basic masking
        if (e.target.name === 'cep') {
            value = value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').substring(0, 9);
        } else if (e.target.name === 'cnpj') {
            value = value.replace(/\D/g, '')
                         .replace(/^(\d{2})(\d)/, '$1.$2')
                         .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                         .replace(/\.(\d{3})(\d)/, '.$1/$2')
                         .replace(/(\d{4})(\d)/, '$1-$2')
                         .substring(0, 18);
        } else if (e.target.name === 'cpf') {
            value = value.replace(/\D/g, '')
                         .replace(/(\d{3})(\d)/, '$1.$2')
                         .replace(/(\d{3})(\d)/, '$1.$2')
                         .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
                         .substring(0, 14);
        } else if (e.target.name === 'phone') {
            value = formatPhoneMask(value);
        }

        setFormData({ ...formData, [e.target.name]: value });
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 dark:bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="w-[420px] bg-white dark:bg-zinc-950 m-4 rounded-[20px] shadow-2xl flex flex-col overflow-hidden animate-slide-left">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e5e5] dark:border-zinc-800 shrink-0">
                    <h2 className="font-season text-[22px] font-[420] text-black dark:text-white">
                        Novo cliente
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-[#9f9f9f]">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pb-6">
                    <InputField label="Nome" name="name" placeholder="Digite o nome do cliente" value={formData.name} onChange={handleChange} />
                    <InputField label="Email" name="email" placeholder="email@email.com" value={formData.email} onChange={handleChange} />
                    <InputField label="Whatsapp" name="phone" placeholder="(98) 99999-9999" value={formData.phone} onChange={handleChange} />
                    <InputField label="CPF" name="cpf" placeholder="000.000.000-00" value={formData.cpf} onChange={handleChange} />

                    <div className="px-6 py-5">
                        <h3 className="font-season text-[18px] font-[420] text-black dark:text-white">
                            Endereço
                        </h3>
                    </div>

                    <InputField label="CEP" name="cep" placeholder="00000-000" value={formData.cep} onChange={handleChange} />
                    <InputField label="Logradouro" name="logradouro" placeholder="Rua Canuto de Aguiar" value={formData.logradouro} onChange={handleChange} />
                    <InputField label="Número" name="numero" placeholder="1080" value={formData.numero} onChange={handleChange} />
                    <InputField label="Bairro" name="bairro" placeholder="Meireles" value={formData.bairro} onChange={handleChange} />
                    
                    <div className="flex border-b border-[#e5e5e5] dark:border-zinc-800">
                        <div className="flex-1 border-r border-[#e5e5e5] dark:border-zinc-800">
                            <InputField label="Cidade" name="cidade" placeholder="Fortaleza" value={formData.cidade} onChange={handleChange} />
                        </div>
                        <div className="flex-1">
                            <InputField label="Estado" name="estado" placeholder="Ceará" value={formData.estado} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="px-6 py-5">
                        <h3 className="font-season text-[18px] font-[420] text-black dark:text-white">
                            Empresa
                        </h3>
                    </div>

                    <InputField label="CNPJ" name="cnpj" placeholder="00.000.000/0001-00" value={formData.cnpj} onChange={handleChange} />
                    <InputField label="Razão social" name="razaoSocial" placeholder="Empresa LTDA" value={formData.razaoSocial} onChange={handleChange} />

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

export default AsteryskoNewClientModal;
