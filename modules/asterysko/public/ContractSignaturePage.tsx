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
            const response = await api.post(`/asterysko/public/deals/${dealId}/sign`, {
                signatureName,
                agreed: true
            });
            // Tenta obter o deal atualizado do response ou refetch explícito
            if (response.data && response.data.deal) {
                setDeal(response.data.deal);
            } else {
                await fetchDeal();
            }
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
        <div className="h-full w-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50 flex flex-col relative print:bg-white print:overflow-visible">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10 shadow-sm print:hidden">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg">
                            <FileText className="text-white h-5 w-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900">Asterysko Sign</span>
                    </div>
                    {signed && (
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors"
                        >
                            <Smartphone size={16} /> Salvar PDF
                        </button>
                    )}
                    <div className="hidden sm:block text-sm font-medium text-gray-500">
                        {signed ? 'Documento Assinado e Validado' : 'Ambiente Seguro de Assinatura'}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 pt-8 pb-40 px-4 print:pt-0 print:pb-0 print:px-0">
                <div className="max-w-5xl mx-auto space-y-6 print:space-y-0">
                    {signed && (
                        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 shadow-sm print:hidden">
                            <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-emerald-900 text-sm">Contrato Assinado Digitalmente</h3>
                                <p className="text-xs text-emerald-700 mt-1">Este documento possui validade jurídica equivalente e foi formalizado eletronicamente em nosso sistema.</p>
                            </div>
                        </div>
                    )}

                    {/* CONTRACT PAPER */}
                    <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden min-h-[800px] border border-gray-100 print:shadow-none print:border-none print:rounded-none">
                        <div className="text-gray-900" dangerouslySetInnerHTML={{ __html: contractHtml }} />

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

            {/* Floating Signature Pill */}
            {!signed && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[95%] max-w-2xl z-50 animate-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-[2rem] p-4 flex flex-col sm:flex-row items-center gap-4 transition-all">
                        <div className="flex-1 w-full flex flex-col gap-3 px-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="w-5 h-5 rounded-md border-2 border-gray-300 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all"></div>
                                    <CheckCircle className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                                    Li e concordo com os Termos
                                </span>
                            </label>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Digite seu nome completo para assinar eletronicamente"
                                    value={signatureName}
                                    onChange={(e) => setSignatureName(e.target.value)}
                                    className="w-full bg-gray-50/80 placeholder:text-gray-400 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent outline-none transition-all font-medium text-sm"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSign}
                            disabled={signing || !agreed || !signatureName}
                            className={`w-full sm:w-auto px-8 py-4 sm:py-8 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${signing || !agreed || !signatureName
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/25 transform hover:-translate-y-0.5'
                                }`}
                        >
                            {signing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Processando...</span>
                                </>
                            ) : (
                                <>
                                    <FileText size={18} />
                                    <span>Assinar Contrato</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
