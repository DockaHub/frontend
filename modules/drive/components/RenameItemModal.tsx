import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import { DriveItem } from '../../../types';

interface RenameItemModalProps {
    item: DriveItem | null;
    isOpen: boolean;
    onClose: () => void;
    onRename: (id: string, newName: string) => Promise<void>;
}

const RenameItemModal: React.FC<RenameItemModalProps> = ({ item, isOpen, onClose, onRename }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (item) setName(item.name);
    }, [item]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!item || !name.trim()) return;

        try {
            setLoading(true);
            await onRename(item.id, name);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Renomear item"
            size="sm"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-docka-700 dark:text-zinc-300 mb-1">
                        Nome
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-docka-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-docka-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                        autoFocus
                    />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-docka-700 dark:text-zinc-300 bg-docka-100 dark:bg-zinc-800 rounded-md hover:bg-docka-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !name.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default RenameItemModal;
