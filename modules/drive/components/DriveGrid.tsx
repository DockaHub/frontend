
import React from 'react';
import { DriveItem, DriveItemType } from '../../../types';
import RenameItemModal from './RenameItemModal';
import { Folder, FileText, Image as ImageIcon, File, MoreHorizontal, FileSpreadsheet, Star, FileUp, Trash2, Edit2, Share2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface DriveGridProps {
    items: DriveItem[];
    viewMode: 'grid' | 'list';
    onItemClick: (item: DriveItem) => void;
    loading?: boolean;
    error?: string | null;
    onDownload?: (item: DriveItem) => void;
    onDelete?: (item: DriveItem) => void;
    onRename?: (item: DriveItem, newName: string) => Promise<void>;
    onShare?: (item: DriveItem) => void;
}

const DriveGrid: React.FC<DriveGridProps> = ({ items, viewMode, onItemClick, loading, error, onDownload, onDelete, onRename, onShare }) => {
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [renamingItem, setRenamingItem] = useState<DriveItem | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Fecha menu ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenuId(null);
            }
        };

        if (activeMenuId) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeMenuId]);

    const getIcon = (type: DriveItemType) => {
        switch (type) {
            case 'FOLDER': return <Folder className="text-blue-500 dark:text-blue-400 fill-current" />;
            case 'IMAGE': return <ImageIcon className="text-purple-600 dark:text-purple-400" />;
            case 'PDF': return <FileText className="text-red-500 dark:text-red-400" />;
            case 'DOC': return <FileText className="text-blue-700 dark:text-blue-400" />;
            case 'SPREADSHEET': return <FileSpreadsheet className="text-green-600 dark:text-green-400" />;
            default: return <File className="text-gray-500 dark:text-zinc-500" />;
        }
    };

    const handleMenuClick = (e: React.MouseEvent, itemId: string) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === itemId ? null : itemId);
    };

    const handleMenuAction = (e: React.MouseEvent, action: 'rename' | 'share' | 'delete' | 'download', item: DriveItem) => {
        e.stopPropagation();
        setActiveMenuId(null);

        switch (action) {
            case 'rename':
                setRenamingItem(item);
                break;
            case 'share':
                if (onShare) onShare(item);
                break;
            case 'delete':
                if (onDelete) onDelete(item);
                break;
            case 'download':
                if (onDownload) onDownload(item);
                break;
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-docka-900 dark:border-zinc-100"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center flex-col text-red-500">
                <p>Erro ao carregar arquivos</p>
                <p className="text-sm mt-2">{error}</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-docka-400 dark:text-zinc-500">
                <Folder size={48} className="mb-4 opacity-20" />
                <p>Esta pasta está vazia</p>
            </div>
        );
    }

    const folders = items.filter(i => i.type === 'FOLDER');
    const files = items.filter(i => i.type !== 'FOLDER');

    // Componente de menu para reutilizar
    const ItemMenu = ({ item }: { item: DriveItem }) => {
        if (activeMenuId !== item.id) return null;

        return (
            <div
                ref={menuRef}
                className="absolute right-2 top-8 w-48 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-docka-100 dark:border-zinc-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={(e) => handleMenuAction(e, 'rename', item)}
                    className="w-full text-left px-4 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                    <Edit2 size={16} /> Renomear
                </button>
                <button
                    onClick={(e) => handleMenuAction(e, 'share', item)}
                    className="w-full text-left px-4 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                    <Share2 size={16} /> Compartilhar
                </button>
                {item.type !== 'FOLDER' && (
                    <button
                        onClick={(e) => handleMenuAction(e, 'download', item)}
                        className="w-full text-left px-4 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                    >
                        <FileUp className="rotate-180" size={16} /> Baixar
                    </button>
                )}
                <div className="h-px bg-docka-100 dark:bg-zinc-800 my-1"></div>
                <button
                    onClick={(e) => handleMenuAction(e, 'delete', item)}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                    <Trash2 size={16} /> Excluir
                </button>
            </div>
        );
    };

    // Render logic para Grid e List
    // ... Código igual ao anterior mas com inserção de menu ...

    return (
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar" onClick={() => setActiveMenuId(null)}>
            {/* Folder Section */}
            {folders.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-4">Pastas</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {folders.map(folder => (
                            <div
                                key={folder.id}
                                onClick={() => onItemClick(folder)}
                                className="group bg-white dark:bg-zinc-900 p-3 rounded-xl border border-docka-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-[110px] relative"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-500 dark:text-blue-400">
                                        <Folder size={20} fill="currentColor" className="opacity-80" />
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={(e) => handleMenuClick(e, folder.id)}
                                            className={`text-docka-300 dark:text-zinc-600 hover:text-docka-900 dark:hover:text-zinc-200 transition-opacity p-1 rounded-md hover:bg-docka-100 dark:hover:bg-zinc-800 ${activeMenuId === folder.id ? 'opacity-100 bg-docka-100 dark:bg-zinc-800' : 'opacity-0 group-hover:opacity-100'}`}
                                        >
                                            <MoreHorizontal size={16} />
                                        </button>
                                        <ItemMenu item={folder} />
                                    </div>
                                </div>
                                <div>
                                    <div className="font-medium text-sm text-docka-900 dark:text-zinc-100 truncate mb-0.5">{folder.name}</div>
                                    <div className="text-[10px] text-docka-400 dark:text-zinc-500">Pasta</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Files Section */}
            <div>
                {files.length > 0 && <h3 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-4">Arquivos</h3>}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {files.map(file => (
                        <div
                            key={file.id}
                            className="group bg-white dark:bg-zinc-900 rounded-xl border border-docka-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col h-[180px] relative"
                            onClick={() => onItemClick(file)}
                        >
                            {/* Thumbnail/Icon Area */}
                            <div className="h-[110px] bg-docka-50 dark:bg-zinc-800 flex items-center justify-center overflow-hidden relative rounded-t-xl">
                                {file.thumbnail ? (
                                    <img src={file.thumbnail} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                                ) : (
                                    <div className="transform group-hover:scale-110 transition-transform duration-300">
                                        {React.cloneElement(getIcon(file.type) as React.ReactElement<any>, { size: 40, strokeWidth: 1.5 })}
                                    </div>
                                )}
                                {file.starred && (
                                    <div className="absolute top-2 left-2 p-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur rounded-full shadow-sm z-10">
                                        <Star size={10} className="text-amber-400 fill-current" />
                                    </div>
                                )}
                            </div>

                            {/* Menu Button - Moved outside overflow-hidden thumbnail */}
                            <div className="absolute top-2 right-2 z-20">
                                <div className="relative">
                                    <button
                                        onClick={(e) => handleMenuClick(e, file.id)}
                                        className={`p-1.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur rounded-md shadow-sm text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200 transition-opacity ${activeMenuId === file.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                    >
                                        <MoreHorizontal size={16} />
                                    </button>
                                    <ItemMenu item={file} />
                                </div>
                            </div>

                            {/* Meta */}
                            <div className="p-3 flex-1 flex flex-col justify-center bg-white dark:bg-zinc-900 relative z-10 border-t border-docka-100 dark:border-zinc-800 rounded-b-xl">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="font-medium text-sm text-docka-900 dark:text-zinc-100 truncate" title={file.name}>{file.name}</div>
                                        <div className="text-[10px] text-docka-400 dark:text-zinc-500 mt-0.5 flex items-center gap-1.5">
                                            <span>{file.size}</span>
                                            <span className="w-0.5 h-0.5 rounded-full bg-docka-300 dark:bg-zinc-600" />
                                            <span>{file.type.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <RenameItemModal
                item={renamingItem}
                isOpen={!!renamingItem}
                onClose={() => setRenamingItem(null)}
                onRename={async (id, newName) => {
                    if (onRename && renamingItem) {
                        await onRename(renamingItem, newName);
                    }
                }}
            />
        </div>
    );
};

export default DriveGrid;
