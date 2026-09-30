import React, { useEffect } from 'react';
import { Loader2, X } from 'lucide-react';

interface AllyoSubmitConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    isLoading?: boolean;
}

export const AllyoSubmitConfirmModal: React.FC<AllyoSubmitConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isLoading) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isLoading, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => {
                if (!isLoading) onClose();
            }}
        >
            <div
                className="relative w-full max-w-[370px] overflow-hidden rounded-2xl bg-white p-5 shadow-2xl transition-all dark:bg-[#18231b] dark:border dark:border-zinc-800"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Botão de fechar sutil */}
                <button
                    type="button"
                    onClick={() => {
                        if (!isLoading) onClose();
                    }}
                    aria-label="Fechar"
                    disabled={isLoading}
                    className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/5 text-zinc-400 transition hover:bg-black/10 hover:text-zinc-700 disabled:opacity-40 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-200"
                >
                    <X size={15} />
                </button>

                {/* Banner com gradiente e ilustração 3D */}
                <div className="overflow-hidden rounded-xl bg-gradient-to-r from-[#fcd3e1] via-[#dccbf8] to-[#b6bcf8] shadow-inner">
                    <img
                        src="/brands/allyo/task-approval-banner.png"
                        alt="Tarefa indo para aprovação"
                        className="w-full h-auto object-cover select-none pointer-events-none"
                        draggable={false}
                    />
                </div>

                {/* Conteúdo textual */}
                <div className="mt-4 text-center">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                        Tarefa indo para aprovação
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 px-2 sm:px-3">
                        Confirme se a visualização e o arquivo aberto pertencem à versão atual da tarefa. Os dois serão enviados juntos para aprovação.
                    </p>
                </div>

                {/* Botão de envio azul */}
                <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => void onConfirm()}
                    className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#5770FF] text-sm font-semibold text-white shadow-sm transition hover:bg-[#465fe6] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={16} className="animate-spin text-white" />
                            <span>Enviando para aprovação...</span>
                        </>
                    ) : (
                        'Enviar'
                    )}
                </button>
            </div>
        </div>
    );
};

export default AllyoSubmitConfirmModal;
