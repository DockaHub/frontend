import React, { useState, useEffect } from 'react';
import { Inbox, Send, Archive, Trash2, PenSquare, ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen, Plus, X, Check } from 'lucide-react';
import { MailFolder, Mailbox, Label } from '../../../types';
import { mailService } from '../../../services/mailService';

interface MailSidebarProps {
  mailboxes: Mailbox[];
  currentMailboxId: string;
  onMailboxChange: (mailboxId: string) => void;
  currentFolder: MailFolder;
  onFolderChange: (folder: MailFolder) => void;
  onCompose: () => void;
  unreadCounts: Record<string, number>;
}

const MailSidebar: React.FC<MailSidebarProps> = ({
  mailboxes,
  currentMailboxId,
  onMailboxChange,
  currentFolder,
  onFolderChange,
  onCompose,
  unreadCounts
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMailboxes, setExpandedMailboxes] = useState<Record<string, boolean>>({
    [currentMailboxId]: true
  });

  // Labels State
  const [labels, setLabels] = useState<Label[]>([]);
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#ef4444');

  useEffect(() => {
    if (currentMailboxId) {
      loadLabels(currentMailboxId);
    }
  }, [currentMailboxId]);

  const loadLabels = async (id: string) => {
    try {
      const data = await mailService.getLabels(id);
      setLabels(data);
    } catch (error) {
      console.error('Failed to load labels:', error);
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
      const newLabel = await mailService.createLabel(currentMailboxId, { name: newLabelName, color: newLabelColor });
      setLabels([...labels, newLabel]);
      setIsCreatingLabel(false);
      setNewLabelName('');
    } catch (e) {
      console.error('Failed to create label:', e);
    }
  };

  const handleDeleteLabel = async (id: string) => {
    try {
      await mailService.deleteLabel(id);
      setLabels(labels.filter(l => l.id !== id));
    } catch (e) {
      console.error('Failed to delete label:', e);
    }
  };

  const toggleMailbox = (id: string) => {
    if (isCollapsed) setIsCollapsed(false);
    setExpandedMailboxes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectMailbox = (id: string) => {
    onMailboxChange(id);
    if (isCollapsed) setIsCollapsed(false);
    if (!expandedMailboxes[id]) {
      setExpandedMailboxes(prev => ({ ...prev, [id]: true }));
    }
  };

  const folders = [
    { id: 'inbox', icon: Inbox, label: 'Entrada' },
    { id: 'sent', icon: Send, label: 'Enviados' },
    { id: 'archive', icon: Archive, label: 'Arquivados' },
    { id: 'trash', icon: Trash2, label: 'Lixeira' },
  ];

  return (
    <div className={`${isCollapsed ? 'w-[60px]' : 'w-full lg:w-[200px]'} flex flex-col bg-docka-50 dark:bg-zinc-900 pt-4 h-full border-r border-docka-200/50 dark:border-zinc-800 transition-all duration-300 relative`}>

      {/* Compose & Toggle */}
      <div className={`px-3 mb-6 flex items-center gap-2 ${isCollapsed ? 'flex-col-reverse' : ''}`}>
        <button
          onClick={onCompose}
          className={`flex-1 bg-white dark:bg-zinc-800 hover:bg-docka-100 dark:hover:bg-zinc-700 text-docka-900 dark:text-zinc-100 border border-docka-200 dark:border-zinc-700 flex items-center justify-center rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95 duration-200 ${isCollapsed ? 'w-10 h-10 p-0' : 'py-2 space-x-2'}`}
          title="Escrever"
        >
          <PenSquare size={16} />
          {!isCollapsed && <span>Escrever</span>}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 p-1.5 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md transition-colors hidden lg:block"
        >
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4">
        {mailboxes.map(mailbox => {
          const isExpanded = expandedMailboxes[mailbox.id];
          const isActiveMailbox = currentMailboxId === mailbox.id;

          return (
            <div key={mailbox.id} className="mb-4">
              {/* Mailbox Header */}
              <div
                onClick={() => toggleMailbox(mailbox.id)}
                className={`group flex items-center px-2 py-1.5 rounded-md cursor-pointer transition-colors ${isActiveMailbox ? 'bg-docka-100/50 dark:bg-zinc-800/50' : 'hover:bg-docka-100/50 dark:hover:bg-zinc-800/30'} ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title={isCollapsed ? mailbox.name : undefined}
              >
                <div className="flex items-center min-w-0" onClick={(e) => { e.stopPropagation(); handleSelectMailbox(mailbox.id); }}>
                  {mailbox.type === 'personal' ? (
                    <img src={mailbox.avatar} className={`w-6 h-6 rounded-full border border-docka-200 dark:border-zinc-700 ${!isCollapsed ? 'mr-2' : ''}`} alt="" />
                  ) : (
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold ${mailbox.color || 'bg-docka-500'} ${!isCollapsed ? 'mr-2' : ''}`}>
                      {mailbox.name.substring(0, 1)}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0">
                    {!isCollapsed && (
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold truncate ${isActiveMailbox ? 'text-docka-900 dark:text-zinc-100' : 'text-docka-600 dark:text-zinc-400'}`}>
                          {mailbox.name}
                        </span>
                        {unreadCounts[`${mailbox.id}-inbox`] > 0 && (
                          <span className="flex h-2 w-2 rounded-full bg-red-500"></span>
                        )}
                      </div>
                    )}
                    {!isCollapsed && mailbox.organization && (
                      <span className="text-[10px] text-docka-400 dark:text-zinc-500 truncate">
                        {mailbox.organization.name}
                      </span>
                    )}
                  </div>
                </div>
                {!isCollapsed && (
                  <button className="text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-300">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                )}
              </div>

              {/* Folders List */}
              {isExpanded && (
                <div className={`mt-1 ${isCollapsed ? '' : 'space-y-0.5 ml-2 pl-2 border-l border-docka-200 dark:border-zinc-800'}`}>
                  {folders.map(item => {
                    const isSelected = isActiveMailbox && currentFolder === item.id;
                    const unreadKey = `${mailbox.id}-${item.id}`;
                    const count = unreadCounts[unreadKey] || 0;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (!isActiveMailbox) onMailboxChange(mailbox.id);
                          onFolderChange(item.id as MailFolder);
                        }}
                        title={isCollapsed ? item.label : undefined}
                        className={`w-full flex items-center px-2 py-1.5 text-sm rounded-md transition-all duration-200 group ${isSelected
                          ? 'bg-docka-200 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100 font-medium'
                          : 'text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800/50 hover:text-docka-900 dark:hover:text-zinc-200'
                          } ${isCollapsed ? 'justify-center my-1 relative' : ''}`}
                      >
                        <item.icon
                          size={16}
                          className={`shrink-0 transition-colors ${isSelected ? 'text-docka-900 dark:text-zinc-100' : 'text-docka-400 dark:text-zinc-500 group-hover:text-docka-600 dark:group-hover:text-zinc-300'} ${!isCollapsed ? 'mr-3' : ''}`}
                        />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.id === 'inbox' && count > 0 && (
                              <span className="text-[10px] font-bold bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                                {count}
                              </span>
                            )}
                          </>
                        )}
                        {/* Dot Badge for collapsed state */}
                        {isCollapsed && item.id === 'inbox' && count > 0 && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-docka-900 dark:bg-zinc-100 rounded-full border border-white dark:border-zinc-900" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {!isCollapsed && (
          <div className="mt-8 pt-4 border-t border-docka-200 dark:border-zinc-800 px-1 animate-in fade-in">
            <div className="px-2 flex items-center justify-between group mb-2">
              <h3 className="text-xs font-semibold text-docka-400 dark:text-zinc-500 uppercase tracking-wider">Marcadores</h3>
              <button
                onClick={() => setIsCreatingLabel(true)}
                className="text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Novo Marcador"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Create Label UI */}
            {isCreatingLabel && (
              <div className="px-2 mb-3 bg-white dark:bg-zinc-800 p-2 rounded-md border border-docka-200 dark:border-zinc-700 shadow-sm">
                <input
                  autoFocus
                  type="text"
                  placeholder="Nome do marcador"
                  className="w-full text-xs p-1 mb-2 bg-transparent border-b border-docka-200 dark:border-zinc-700 focus:outline-none focus:border-indigo-500 dark:text-zinc-200"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateLabel()}
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'].map(color => (
                      <button
                        key={color}
                        onClick={() => setNewLabelColor(color)}
                        className={`w-3 h-3 rounded-full ${newLabelColor === color ? 'ring-1 ring-offset-1 ring-docka-400 dark:ring-zinc-400' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setIsCreatingLabel(false)} className="text-docka-400 hover:text-red-500"><X size={12} /></button>
                    <button onClick={handleCreateLabel} className="text-docka-400 hover:text-green-500"><Check size={12} /></button>
                  </div>
                </div>
              </div>
            )}

            {labels.length === 0 && !isCreatingLabel && (
              <div className="px-2 text-xs text-docka-400 dark:text-zinc-600 italic">Sem marcadores</div>
            )}

            {labels.map(label => (
              <button key={label.id} className="w-full flex items-center justify-between group px-2 py-1.5 text-sm rounded-md text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 transition-colors">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: label.color }} />
                  <span className="truncate max-w-[120px]">{label.name}</span>
                </div>
                <div
                  onClick={(e) => { e.stopPropagation(); handleDeleteLabel(label.id); }}
                  className="opacity-0 group-hover:opacity-100 text-docka-400 hover:text-red-500 p-1"
                >
                  <X size={12} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default MailSidebar;
