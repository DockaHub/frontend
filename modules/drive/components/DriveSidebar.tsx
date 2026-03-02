
import React, { useState } from 'react';
import { HardDrive, Share2, Clock, Star, Trash2, Plus, PanelLeftClose, PanelLeftOpen, FolderPlus, FileUp, FileText, FileSpreadsheet } from 'lucide-react';
import Modal from '../../../components/common/Modal';

interface DriveSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onCreateFolder: (name: string) => Promise<void>;
  onUploadFile: (file: File) => Promise<void>;
}

const DriveSidebar: React.FC<DriveSidebarProps> = ({ activeView, onViewChange, onCreateFolder, onUploadFile }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [createMode, setCreateMode] = useState<'select' | 'folder'>('select');
  const [newFolderName, setNewFolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const items = [
    { id: 'my-drive', icon: HardDrive, label: 'Meu Drive' },
    { id: 'shared', icon: Share2, label: 'Compartilhados' },
    { id: 'recent', icon: Clock, label: 'Recentes' },
    { id: 'starred', icon: Star, label: 'Com estrela' },
    { id: 'trash', icon: Trash2, label: 'Lixeira' },
  ];

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      setIsSubmitting(true);
      await onCreateFolder(newFolderName);
      setNewFolderName('');
      setIsNewModalOpen(false);
      setCreateMode('select');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setIsNewModalOpen(false); // Fecha modal antes de começar upload
        await onUploadFile(file);
      } catch (error) {
        console.error(error);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleCloseModal = () => {
    setIsNewModalOpen(false);
    setNewFolderName('');
    setTimeout(() => setCreateMode('select'), 300); // Reset after animation
  };

  return (
    <div className={`${isCollapsed ? 'w-[60px]' : 'w-[240px]'} flex flex-col bg-docka-50 dark:bg-zinc-900 pt-4 h-full border-r border-docka-200/50 dark:border-zinc-800 hidden lg:flex transition-all duration-300`}>

      {/* Header / Toggle */}
      <div className={`px-4 mb-6 flex items-center ${isCollapsed ? 'flex-col-reverse gap-4' : 'justify-between'}`}>
        {/* New Button */}
        <button
          onClick={() => setIsNewModalOpen(true)}
          className={`bg-white dark:bg-zinc-800 hover:bg-docka-100 dark:hover:bg-zinc-700 text-docka-900 dark:text-zinc-100 border border-docka-200 dark:border-zinc-700 flex items-center justify-center space-x-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95 duration-200 ${isCollapsed ? 'w-10 h-10 p-0' : 'w-full py-2'}`}
          title="Novo"
        >
          <Plus size={16} />
          {!isCollapsed && <span>Novo</span>}
        </button>

        {/* Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 p-1.5 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md transition-colors ${!isCollapsed ? '-mr-2' : ''}`}
        >
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <div className="space-y-1 px-2 flex-1">
        {!isCollapsed && <h3 className="px-3 text-xs font-semibold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Armazenamento</h3>}
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            title={isCollapsed ? item.label : undefined}
            className={`w-full flex items-center px-3 py-1.5 text-sm rounded-md transition-all duration-200 group ${activeView === item.id
              ? 'bg-docka-200 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100 font-medium'
              : 'text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 hover:text-docka-900 dark:hover:text-zinc-200'
              } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <item.icon
              size={16}
              className={`shrink-0 transition-colors ${activeView === item.id ? 'text-docka-900 dark:text-zinc-100' : 'text-docka-500 dark:text-zinc-500 group-hover:text-docka-800 dark:group-hover:text-zinc-300'} ${!isCollapsed ? 'mr-3' : ''}`}
            />
            {!isCollapsed && item.label}
          </button>
        ))}
      </div>

      {/* NEW ITEM MODAL */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={handleCloseModal}
        title={createMode === 'select' ? "Adicionar ao Drive" : "Nova Pasta"}
        size="sm"
        footer={createMode === 'folder' ? (
          <>
            <button onClick={() => setCreateMode('select')} disabled={isSubmitting} className="px-3 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Voltar</button>
            <button onClick={handleCreateFolder} disabled={isSubmitting} className="px-5 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white rounded-lg shadow-sm disabled:opacity-50">
              {isSubmitting ? 'Criando...' : 'Criar'}
            </button>
          </>
        ) : undefined}
      >
        {createMode === 'select' ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setCreateMode('folder')}
              className="flex flex-col items-center justify-center p-4 bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl hover:bg-white dark:hover:bg-zinc-700 hover:border-docka-300 dark:hover:border-zinc-600 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                <FolderPlus size={20} />
              </div>
              <span className="text-sm font-medium text-docka-700 dark:text-zinc-300">Nova Pasta</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-4 bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl hover:bg-white dark:hover:bg-zinc-700 hover:border-docka-300 dark:hover:border-zinc-600 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
                <FileUp size={20} />
              </div>
              <span className="text-sm font-medium text-docka-700 dark:text-zinc-300">Upload Arquivo</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
            />

            <button className="flex flex-col items-center justify-center p-4 bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl hover:bg-white dark:hover:bg-zinc-700 hover:border-docka-300 dark:hover:border-zinc-600 hover:shadow-md transition-all group">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white mb-2 group-hover:scale-110 transition-transform shadow-sm">
                <FileText size={20} />
              </div>
              <span className="text-sm font-medium text-docka-700 dark:text-zinc-300">Docka Doc</span>
            </button>

            <button className="flex flex-col items-center justify-center p-4 bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl hover:bg-white dark:hover:bg-zinc-700 hover:border-docka-300 dark:hover:border-zinc-600 hover:shadow-md transition-all group">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white mb-2 group-hover:scale-110 transition-transform shadow-sm">
                <FileSpreadsheet size={20} />
              </div>
              <span className="text-sm font-medium text-docka-700 dark:text-zinc-300">Planilha</span>
            </button>
          </div>
        ) : (
          <div className="py-2 animate-in fade-in slide-in-from-right-4 duration-300">
            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2">Nome da Pasta</label>
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              placeholder="Sem título"
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100"
            />
          </div>
        )}
      </Modal>

    </div>
  );
};

export default DriveSidebar;
