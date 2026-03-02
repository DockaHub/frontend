
import React, { useState, useEffect } from 'react';
import { Organization, DriveItem } from '../../types';
import DriveSidebar from './components/DriveSidebar';
import DriveHeader from './components/DriveHeader';
import DriveGrid from './components/DriveGrid';
import FilePreviewModal from './components/FilePreviewModal';
import { useToast } from '../../context/ToastContext';
import { driveService } from '../../services/driveService';
import { ShareItemModal } from './components/ShareItemModal';
import { FileUp } from 'lucide-react';

interface DriveLayoutProps {
  currentOrg: Organization;
  hasAccess?: boolean;
}

const DriveLayout: React.FC<DriveLayoutProps> = () => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeSidebarItem, setActiveSidebarItem] = useState('my-drive');
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Preview Modal State
  const [previewFile, setPreviewFile] = useState<DriveItem | null>(null);
  const [sharingItem, setSharingItem] = useState<DriveItem | null>(null);
  const { addToast } = useToast();

  // Busca token do localStorage
  const getToken = () => {
    return localStorage.getItem('token') || '';
  };

  // Carrega itens do drive
  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();

      let data: DriveItem[] = [];
      if (activeSidebarItem === 'shared') {
        data = await driveService.listSharedItems(token);
      } else {
        data = await driveService.listItems(token);
      }
      setItems(data);
    } catch (err: any) {
      setError(err.message);
      addToast({
        type: 'error',
        title: 'Erro ao carregar arquivos',
        message: err.message,
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Carrega itens inicialmente e quando token mudar (se houver)
  useEffect(() => {
    loadItems();
  }, [activeSidebarItem]); // Recarrega quando mudar a view (My Drive vs Shared)

  // Permission Gate - REMOVIDO PARA DRIVE PESSOAL
  // const canAccess = hasAccess && (currentOrg.features?.drive !== false);

  // if (!canAccess) {
  //   return (
  //     <PlaceholderView
  //       title={`${currentOrg.name} Drive`}
  //       icon={HardDrive}
  //       description={`Cloud storage is not enabled for the ${currentOrg.name} workspace.`}
  //     />
  //   );
  // }

  // Filter Logic
  const currentItems = activeSidebarItem === 'shared'
    ? items // Na view 'shared', não filtramos por pasta pai por enquanto (flat list)
    : items.filter(item => item.parentId === currentFolderId);

  // Breadcrumb Logic
  const getBreadcrumbs = (folderId: string | null): DriveItem[] => {
    if (!folderId) return [];
    const folder = items.find(i => i.id === folderId);
    if (!folder) return [];
    // Recursive breadcrumb building (simplified for mock depth)
    return [folder];
  };

  const breadcrumbs = getBreadcrumbs(currentFolderId);

  const handleItemClick = (item: DriveItem) => {
    if (item.type === 'FOLDER') {
      setCurrentFolderId(item.id);
    } else {
      setPreviewFile(item);
    }
  };

  const handleDeleteFile = async (id: string) => {
    try {
      const token = getToken();
      await driveService.deleteItem(id, false, token);
      setPreviewFile(null);
      await loadItems(); // Recarrega itens
      addToast({
        type: 'info',
        title: 'Arquivo movido para lixeira',
        duration: 3000
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erro ao deletar arquivo',
        message: err.message,
        duration: 5000
      });
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const token = getToken();
      // createFolder(name, parentId, token)
      await driveService.createFolder(name, currentFolderId, token);
      await loadItems();
      addToast({
        type: 'success',
        title: 'Pasta criada com sucesso',
        duration: 3000
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erro ao criar pasta',
        message: err.message,
        duration: 5000
      });
    }
  };

  const handleUploadFile = async (file: File) => {
    try {
      const token = getToken();
      addToast({
        type: 'info',
        title: 'Upload iniciado',
        message: `Enviando ${file.name}...`,
        duration: 3000
      });

      // uploadFile(file, parentId, token)
      await driveService.uploadFile(file, currentFolderId, token);
      await loadItems();

      addToast({
        type: 'success',
        title: 'Upload concluído',
        message: `${file.name} enviado com sucesso`,
        duration: 3000
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erro no upload',
        message: err.message,
        duration: 5000
      });
    }
  };

  const handleDownload = async (item: DriveItem) => {
    try {
      const token = getToken();
      // O endpoint de download retorna o arquivo diretamente
      const downloadUrl = driveService.getDownloadUrl(item.id, token);

      // Criar link temporário para download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', item.name); // Sugerir nome do arquivo
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erro ao baixar arquivo',
        message: err.message,
        duration: 5000
      });
    }
  };

  const handleRenameItem = async (item: DriveItem, newName: string) => {
    try {
      const token = getToken();
      await driveService.updateItem(item.id, { name: newName }, token);
      await loadItems();
      addToast({
        type: 'success',
        title: 'Item renomeado',
        duration: 3000
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erro ao renomear',
        message: err.message,
        duration: 5000
      });
    }
  };

  const handleShareItem = (item: DriveItem) => {
    setSharingItem(item);
  };

  // Drag and Drop Logic
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Upload sequential to avoid overwhelming toast/server (could be parallel)
    for (const file of files) {
      await handleUploadFile(file);
    }
  };

  return (
    <div
      className="flex h-full w-full bg-white dark:bg-zinc-950 overflow-hidden flex-col transition-colors duration-300 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <DriveHeader
        breadcrumbs={breadcrumbs}
        onNavigateBreadcrumb={setCurrentFolderId}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <div className="flex flex-1 overflow-hidden pointer-events-none">
        <div className="pointer-events-auto flex h-full">
          <DriveSidebar
            activeView={activeSidebarItem}
            onViewChange={setActiveSidebarItem}
            onCreateFolder={handleCreateFolder}
            onUploadFile={handleUploadFile}
          />
        </div>
        <div className="pointer-events-auto flex-1 h-full overflow-hidden">
          <DriveGrid
            items={currentItems}
            viewMode={viewMode}
            onItemClick={handleItemClick}
            loading={loading}
            error={error}
            onDownload={handleDownload}
            onDelete={(item) => handleDeleteFile(item.id)}
            onRename={handleRenameItem}
            onShare={handleShareItem}
          />
        </div>
      </div>

      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm z-50 flex items-center justify-center border-2 border-blue-500 border-dashed m-4 rounded-xl pointer-events-none">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-xl flex flex-col items-center animate-bounce">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              <FileUp size={32} />
            </div>
            <h3 className="text-xl font-bold text-docka-800 dark:text-zinc-100">Solte para fazer upload</h3>
            <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Os arquivos serão adicionados à pasta atual</p>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        onDelete={handleDeleteFile}
      />

      <ShareItemModal
        item={sharingItem}
        isOpen={!!sharingItem}
        onClose={() => setSharingItem(null)}
      />
    </div>
  );
};

export default DriveLayout;
