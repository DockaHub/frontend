import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { FileText, CheckCircle, Smartphone, Shield } from 'lucide-react';

interface ContractSignaturePageProps {
    dealId: string;
}

export const ContractSignaturePage: React.FC<ContractSignaturePageProps> = ({ dealId }) => {
    const [deal, setDeal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [contractHtml, setContractHtml] = useState('');
    const [signing, setSigning] = useState(false);
    const [signatureName, setSignatureName] = useState('');
    const [agreed, setAgreed] = useState(false);
    const { addToast } = useToast();
    const [signed, setSigned] = useState(false);

    useEffect(() => {
        fetchDeal();
    }, [dealId]);

    const fetchDeal = async () => {
        try {
            // In a real scenario, this endpoint should be public or secured by a token
            // For MVP, we might need a public endpoint wrapper or use the existing one if auth is bypassed
            // Let's assume we have a public endpoint for viewing/signing
            const response = await api.get(`/asterysko/public/deals/${dealId}/contract`);
            setDeal(response.data.deal);
            setContractHtml(response.data.html);
            // Check signedAt OR status. 'preparation' is set after signing in backend.
            if (response.data.deal.signedAt || response.data.deal.status === 'contract_signed' || response.data.deal.status === 'preparation') {
                setSigned(true);
            }
        } catch (error) {
            console.error('Error fetching contract', error);
            addToast({ type: 'error', title: 'Erro', message: 'Não foi possível carregar o contrato.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSign = async () => {
        if (!signatureName || !agreed) {
            addToast({ type: 'warning', title: 'Atenção', message: 'Preencha seu nome e aceite os termos.' });
            return;
        }

        setSigning(true);
        try {
            await api.post(`/asterysko/public/deals/${dealId}/sign`, {
                signatureName,
                agreed: true
            });
            setSigned(true);
            addToast({ type: 'success', title: 'Assinado!', message: 'Contrato assinado com sucesso.' });
        } catch (error) {
            console.error('Error signing', error);
            addToast({ type: 'error', title: 'Erro', message: 'Falha ao assinar contrato.' });
        } finally {
            setSigning(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-gray-100 dark:bg-zinc-950 flex flex-col transition-colors duration-300 print:bg-white print:overflow-visible">
            {/* Header */}
            <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 py-4 px-6 fixed top-0 w-full z-10 shadow-sm transition-colors duration-300 print:hidden">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <FileText className="text-white h-5 w-5" />
                        </div>
                        <span className="font-bold text-xl text-gray-900 dark:text-zinc-100">Asterysko Sign</span>
                    </div>
                    {signed && (
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-100 transition-colors"
                        >
                            <Smartphone size={16} /> Imprimir / PDF
                        </button>
                    )}
                    <div className="hidden sm:block text-sm text-gray-500 dark:text-zinc-400">
                        {signed ? 'Documento Assinado' : 'Visualizando contrato seguro'}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 pt-20 pb-32 px-4 print:pt-0 print:pb-0 print:px-0">
                <div className="max-w-4xl mx-auto space-y-6 print:space-y-0">
                    {signed && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 p-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 print:hidden">
                            <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center shrink-0">
                                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-emerald-900 dark:text-emerald-400 text-sm">Contrato Assinado Digitalmente</h3>
                                <p className="text-xs text-emerald-700 dark:text-emerald-500/80">Este documento possui validade jurídica e foi formalizado eletronicamente.</p>
                            </div>
                        </div>
                    )}

                    {/* CONTRACT PAPER */}
                    <div className="bg-white shadow-xl rounded-xl overflow-hidden min-h-[800px] border border-gray-200 dark:border-zinc-800 print:shadow-none print:border-none print:rounded-none">
                        <div className="p-8 md:p-12 text-gray-900" dangerouslySetInnerHTML={{ __html: contractHtml }} />

                        {signed && deal && (
                            <div className="mt-8 border-t-2 border-dashed border-gray-200 p-8 md:p-12 bg-gray-50 print:bg-white">
                                <div className="flex items-center gap-3 mb-6">
                                    <Shield className="text-indigo-600 h-6 w-6" />
                                    <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Certificado de Assinatura Digital</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-gray-500 font-medium">Assinante</p>
                                        <p className="text-gray-900 font-bold text-base">{deal.signatureData?.replace('Assinado digitalmente por ', '') || deal.contactName}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-500 font-medium">Data e Hora</p>
                                        <p className="text-gray-900 font-bold text-base">
                                            {deal.signedAt ? new Date(deal.signedAt).toLocaleString('pt-BR') : 'Não disponível'}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-500 font-medium">Endereço IP</p>
                                        <p className="text-gray-900 font-mono tracking-tight">{deal.signedByIP || '0.0.0.0'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-500 font-medium">Dispositivo / Navegador</p>
                                        <p className="text-gray-900 text-xs break-all leading-tight">{deal.signedByUserAgent || 'Identidade Verificada'}</p>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Autenticado por Asterysko Propriamente Intelectual via Plataforma Segura</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Signature Bar */}
            {!signed && (
                <footer className="fixed bottom-0 w-full bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-20 transition-colors duration-300">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex-1 w-full md:w-auto">
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="checkbox"
                                    id="agree"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
                                />
                                <label htmlFor="agree" className="text-sm text-gray-700 dark:text-zinc-300">Li e concordo com os termos do contrato acima.</label>
                            </div>
                            <input
                                type="text"
                                placeholder="Digite seu nome completo para assinar"
                                value={signatureName}
                                onChange={(e) => setSignatureName(e.target.value)}
                                className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors"
                            />
                        </div>
                        <button
                            onClick={handleSign}
                            disabled={signing || !agreed || !signatureName}
                            className={`w-full md:w-auto px-8 py-3 rounded-lg font-bold text-white shadow-md transition-all ${signing || !agreed || !signatureName
                                ? 'bg-gray-400 dark:bg-zinc-700 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5'
                                }`}
                        >
                            {signing ? 'Assinando...' : 'Assinar Documento'}
                        </button>
                    </div>
                </footer>
            )}
        </div>
    );
};
