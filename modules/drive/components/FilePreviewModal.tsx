
import React from 'react';
import { X, Download, Share2, Star, Trash2, FileText, Image as ImageIcon, File, FileSpreadsheet, Info } from 'lucide-react';
import { DriveItem, DriveItemType } from '../../../types';
import Modal from '../../../components/common/Modal';

interface FilePreviewModalProps {
    file: DriveItem | null;
    isOpen: boolean;
    onClose: () => void;
    onDelete: (id: string) => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, isOpen, onClose, onDelete }) => {
    if (!file) return null;

    const getIcon = (type: DriveItemType) => {
        switch (type) {
            case 'image': return <ImageIcon size={64} className="text-purple-600 dark:text-purple-400" />;
            case 'pdf': return <FileText size={64} className="text-red-500 dark:text-red-400" />;
            case 'doc': return <FileText size={64} className="text-blue-700 dark:text-blue-400" />;
            case 'spreadsheet': return <FileSpreadsheet size={64} className="text-green-600 dark:text-green-400" />;
            default: return <File size={64} className="text-gray-500 dark:text-zinc-500" />;
        }
    };

    const handleDelete = () => {
        if (confirm('Tem certeza que deseja excluir este arquivo?')) {
            onDelete(file.id);
            onClose();
        }
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-docka-200 dark:border-zinc-800">

                {/* Header / Toolbar */}
                <div className="h-16 border-b border-docka-100 dark:border-zinc-800 flex items-center justify-between px-6 bg-white dark:bg-zinc-900 z-10 shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-docka-100 dark:bg-zinc-800 rounded-lg">
                            {React.cloneElement(getIcon(file.type) as React.ReactElement<any>, { size: 20 })}
                        </div>
                        <h3 className="font-bold text-docka-900 dark:text-zinc-100 truncate">{file.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-docka-500 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors" title="Abrir em nova aba">
                            <Download size={20} />
                        </button>
                        <button className="p-2 text-docka-500 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors" title="Compartilhar">
                            <Share2 size={20} />
                        </button>
                        <button className={`p-2 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors ${file.starred ? 'text-amber-400' : 'text-docka-500 dark:text-zinc-400'}`} title="Favoritar">
                            <Star size={20} fill={file.starred ? "currentColor" : "none"} />
                        </button>
                        <button onClick={handleDelete} className="p-2 text-docka-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Excluir">
                            <Trash2 size={20} />
                        </button>
                        <div className="w-px h-6 bg-docka-200 dark:bg-zinc-700 mx-2" />
                        <button onClick={onClose} className="p-2 text-docka-500 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Preview Stage */}
                    <div className="flex-1 bg-docka-50/50 dark:bg-black/20 flex items-center justify-center p-8 relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                        {file.thumbnail || file.type === 'image' ? (
                            <img
                                src={file.thumbnail || `https://placehold.co/800x600?text=${file.name}`}
                                alt={file.name}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/10"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-32 h-32 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-sm mb-6">
                                    {getIcon(file.type)}
                                </div>
                                <p className="text-docka-500 dark:text-zinc-400 text-sm">Pré-visualização não disponível para este tipo de arquivo.</p>
                                <button className="mt-4 px-4 py-2 bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:bg-docka-800 dark:hover:bg-white/90 transition-colors shadow-sm">
                                    Baixar para visualizar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Details */}
                    <div className="w-80 bg-white dark:bg-zinc-900 border-l border-docka-200 dark:border-zinc-800 p-6 overflow-y-auto hidden md:block">
                        <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <Info size={14} /> Detalhes do Arquivo
                        </h4>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs text-docka-500 dark:text-zinc-500 block mb-1">Tipo</label>
                                <div className="text-sm font-medium text-docka-900 dark:text-zinc-100 capitalize">{file.type}</div>
                            </div>
                            <div>
                                <label className="text-xs text-docka-500 dark:text-zinc-500 block mb-1">Tamanho</label>
                                <div className="text-sm font-medium text-docka-900 dark:text-zinc-100">{file.size || 'Desconhecido'}</div>
                            </div>
                            <div>
                                <label className="text-xs text-docka-500 dark:text-zinc-500 block mb-1">Localização</label>
                                <div className="text-sm font-medium text-docka-900 dark:text-zinc-100 truncate" title={file.parentId || 'Meu Drive'}>
                                    {file.parentId ? 'Pasta > ...' : 'Meu Drive'}
                                </div>
                            </div>
                            <div className="h-px bg-docka-100 dark:bg-zinc-800" />
                            <div>
                                <label className="text-xs text-docka-500 dark:text-zinc-500 block mb-1">Proprietário</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
                                        {file.owner.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-docka-900 dark:text-zinc-100">{file.owner}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-docka-500 dark:text-zinc-500 block mb-1">Modificado em</label>
                                <div className="text-sm font-medium text-docka-900 dark:text-zinc-100">{file.modifiedAt}</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FilePreviewModal;
