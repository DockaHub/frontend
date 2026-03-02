
import React, { useEffect, useState } from 'react';
import { FileSignature, Search, Filter, Download, FileText, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { api } from '../../../../services/api';
import { useToast } from '../../../../context/ToastContext';

interface DocumentItem {
    id: string;
    type: string;
    title: string;
    client: string;
    status: 'signed' | 'pending';
    date: string;
    source: 'deal' | 'process';
    downloadUrl: string;
}

const AsteryskoDocumentsView: React.FC = () => {
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await api.get('/asterysko/documents');
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents', error);
            addToast({ type: 'error', title: 'Erro', message: 'Falha ao carregar documentos.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (doc: DocumentItem) => {
        if (doc.type === 'Contrato' && doc.source === 'deal') {
            // Open the public contract view (or sign page if pending)
            window.open(`/sign/${doc.id}`, '_blank');
        } else if (doc.downloadUrl) {
            window.open(doc.downloadUrl, '_blank');
        } else {
            addToast({ type: 'info', title: 'Indisponível', message: 'Visualização não disponível.' });
        }
    };

    const filteredDocs = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.client.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        pending: documents.filter(d => d.status === 'pending').length,
        signed: documents.filter(d => d.status === 'signed').length,
        modelos: 3 // Hardcoded for now
    };

    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar p-8 transition-colors">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Documentos & Assinaturas</h1>
                        <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gestão centralizada de contratos e procurações.</p>
                    </div>
                    {/* <div className="flex gap-2">
                        <button className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2">
                            <Upload size={16} /> Upload Manual
                        </button>
                    </div> */}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-docka-200 dark:border-zinc-800 flex items-center gap-4 shadow-sm">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><Clock size={24} /></div>
                        <div>
                            <div className="text-2xl font-bold text-docka-900 dark:text-zinc-100">{stats.pending}</div>
                            <div className="text-xs text-docka-500 dark:text-zinc-500 uppercase font-bold">Aguardando Assinatura</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-docka-200 dark:border-zinc-800 flex items-center gap-4 shadow-sm">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><CheckCircle2 size={24} /></div>
                        <div>
                            <div className="text-2xl font-bold text-docka-900 dark:text-zinc-100">{stats.signed}</div>
                            <div className="text-xs text-docka-500 dark:text-zinc-500 uppercase font-bold">Documentos Validados</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-docka-200 dark:border-zinc-800 flex items-center gap-4 shadow-sm opacity-50">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><FileText size={24} /></div>
                        <div>
                            <div className="text-2xl font-bold text-docka-900 dark:text-zinc-100">{stats.modelos}</div>
                            <div className="text-xs text-docka-500 dark:text-zinc-500 uppercase font-bold">Modelos (Em Breve)</div>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm min-h-[400px]">
                    <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 flex justify-between items-center bg-docka-50/30 dark:bg-zinc-800/30">
                        <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm">Recentes</h3>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={12} />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-7 pr-2 py-1 text-xs bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-md w-48 outline-none focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600"
                                    placeholder="Buscar documento..."
                                />
                            </div>
                            <button className="p-1 text-docka-500 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-700 rounded"><Filter size={14} /></button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-docka-900 dark:border-zinc-100"></div>
                        </div>
                    ) : filteredDocs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-docka-400 dark:text-zinc-500">
                            <FileSignature size={48} className="mb-2 opacity-20" />
                            <p>Nenhum documento encontrado.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white dark:bg-zinc-900 text-docka-500 dark:text-zinc-500 font-semibold text-xs uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4">Documento</th>
                                    <th className="px-6 py-4">Cliente / Parte</th>
                                    <th className="px-6 py-4">Tipo</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                                {filteredDocs.map((doc) => (
                                    <tr key={`${doc.source}-${doc.id}`} className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                            <FileText size={16} className="text-docka-400 dark:text-zinc-500" />
                                            {doc.title}
                                        </td>
                                        <td className="px-6 py-4 text-docka-600 dark:text-zinc-400">{doc.client}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-docka-100 dark:bg-zinc-800 text-docka-600 dark:text-zinc-400 px-2 py-1 rounded text-xs font-medium">{doc.type}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {doc.status === 'signed' ? (
                                                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded w-fit border border-emerald-100 dark:border-emerald-800">
                                                    <CheckCircle2 size={12} /> Assinado
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded w-fit border border-amber-100 dark:border-amber-800">
                                                    <Clock size={12} /> Pendente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-docka-500 dark:text-zinc-500 text-xs">
                                            {new Date(doc.date).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDownload(doc)}
                                                className="text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200"
                                                title="Visualizar/Baixar"
                                            >
                                                {doc.status === 'signed' ? <Download size={16} /> : <ExternalLink size={16} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AsteryskoDocumentsView;
