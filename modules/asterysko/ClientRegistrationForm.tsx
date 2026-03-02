import React, { useState } from 'react';
import { Mail, Phone, Loader2 } from 'lucide-react';
import api from '../../services/api';

interface ClientRegistrationFormProps {
    onCancel: () => void;
    onSuccess: () => void;
    initialData?: {
        brandName?: string;
    };
    organizationId?: string;
}

const ClientRegistrationForm: React.FC<ClientRegistrationFormProps> = ({ onCancel, onSuccess, initialData, organizationId }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '', // Represents company name or contact depending on perspective, mapping to user name for now
        companyName: '',
        status: 'ACTIVE',
        email: '',
        phone: '',
        cpfCnpj: '',
        address: '',
        city: '',
        state: '',
        postalCode: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!formData.name || !formData.email || !organizationId) {
            alert("Por favor preencha nome, email e certifique-se que uma organização está selecionada.");
            return;
        }

        setLoading(true);
        try {
            await api.post('/asterysko/clients', {
                ...formData,
                type: 'PJ', // Defaulting to PJ for now
                organizationId
            });
            onSuccess();
        } catch (error) {
            console.error('Error creating client:', error);
            alert("Erro ao cadastrar cliente. Verifique o console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20 mb-6">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 text-sm">Cadastro Inicial</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Preencha os dados do cliente para iniciar o processo de registro da marca <strong>{initialData?.brandName}</strong>.
                </p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Empresa / Razão Social</label>
                        <input name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100 transition-all" placeholder="Ex: Minha Empresa LTDA" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Nome do Contato</label>
                        <input name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100 transition-all" placeholder="Nome completo" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">E-mail Principal</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
                            <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100 transition-all" placeholder="cliente@email.com" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Telefone / WhatsApp</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
                            <input name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100 transition-all" placeholder="(00) 00000-0000" />
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">CNPJ / CPF</label>
                    <input name="cpfCnpj" value={formData.cpfCnpj} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100 transition-all" placeholder="00.000.000/0000-00" />
                </div>
                <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" className="accent-docka-900 dark:accent-zinc-100" defaultChecked />
                        <span className="text-sm text-docka-600 dark:text-zinc-400 group-hover:text-docka-800 dark:group-hover:text-zinc-200 transition-colors">Enviar e-mail de boas-vindas com acesso ao portal</span>
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-docka-100 dark:border-zinc-800 mt-6">
                <button
                    onClick={onCancel}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                >
                    Voltar
                </button>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white/90 rounded-lg shadow-sm transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? 'Cadastrando...' : 'Salvar e Continuar'}
                </button>
            </div>
        </div>
    );
};

export default ClientRegistrationForm;
