
import React, { useState, useEffect } from 'react';
import { Email, MailFolder, Organization, Mailbox } from '../../types';
import MailSidebar from './components/MailSidebar';
import MailList from './components/MailList';
import MailReader from './components/MailReader';
import ComposeModal from './components/ComposeModal';
import { Menu, X, RefreshCw } from 'lucide-react';
import { mailService } from '../../services/mailService';
import { useToast } from '../../context/ToastContext';

interface MailLayoutProps {
  currentOrg?: Organization;
}

const MailLayout: React.FC<MailLayoutProps> = ({ currentOrg }) => {
  // State
  const [mailboxes, setMailboxes] = useState<any[]>([]);
  const [currentMailboxId, setCurrentMailboxId] = useState<string>('');
  const [currentFolder, setCurrentFolder] = useState<MailFolder>('inbox');
  const { addToast } = useToast();

  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // New: State for pre-filling Compose (Reply/Forward)
  const [composeInitialData, setComposeInitialData] = useState<{ to?: string, subject?: string, body?: string } | undefined>(undefined);

  // Load Mailboxes (Global)
  useEffect(() => {
    loadMailboxes();
  }, []); // Run once on mount, not dependent on currentOrg anymore

  const loadMailboxes = async () => {
    try {
      const data = await mailService.getUserMailboxes(); // Use Global Endpoint
      setMailboxes(data);

      // Safety check: verify if currentMailboxId is still valid in the new list
      const currentIsValid = data.find((m: any) => m.id === currentMailboxId);

      if (data.length > 0) {
        if (!currentMailboxId || !currentIsValid) {
          // If no current selection or invalid, default to first one
          console.log('MailLayout: Switching to default mailbox', data[0].id);
          setCurrentMailboxId(data[0].id);
        }
      } else {
        // No mailboxes, clear selection
        setCurrentMailboxId('');
      }
    } catch (error) {
      console.error("Failed to load mailboxes", error);
      setMailboxes([]);
      setCurrentMailboxId('');
    }
  };

  // Load Emails Effect
  useEffect(() => {
    // Only load if we have a mailbox AND it matches one in our current list (safety)
    const isValid = mailboxes.some(m => m.id === currentMailboxId);

    if (currentMailboxId && isValid) {
      loadEmails();
      loadCounts();
    } else {
      setEmails([]);
    }
  }, [currentMailboxId, currentFolder, mailboxes]); // Removed currentOrg dependency

  const loadEmails = async () => {
    if (!currentMailboxId) return;
    setIsLoading(true);
    try {
      const data = await mailService.getEmails(currentMailboxId, currentFolder);
      setEmails(data);
    } catch (error) {
      console.error("Failed to load emails", error);
      setEmails([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCounts = async () => {
    // Global counts (no org needed)
    try {
      const counts = await mailService.getUnreadCounts();
      setUnreadCounts(counts);
    } catch (error) {
      console.error("Failed to load counts", error);
    }
  };

  // Reset selection when changing context
  useEffect(() => {
    setSelectedEmailId(null);
  }, [currentOrg, currentFolder, currentMailboxId]);

  // Handlers
  const handleSelectEmail = async (id: string) => {
    setSelectedEmailId(id);
    // Optimistic update for UI
    setEmails(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
    // Backend call
    await mailService.toggleRead(id);
    loadCounts(); // Refresh counts
  };

  const handleArchive = async (e: React.MouseEvent | null, id: string) => {
    e?.stopPropagation();
    // Optimistic update
    setEmails(prev => prev.filter(email => email.id !== id));
    if (selectedEmailId === id) setSelectedEmailId(null);

    // Backend call
    await mailService.moveEmail(id, 'archive');
    loadCounts();

    addToast({
      type: 'success',
      title: 'Conversa arquivada',
      duration: 2000
    });
  };

  const handleDelete = async (e: React.MouseEvent | null, id: string) => {
    e?.stopPropagation();
    // Optimistic update
    setEmails(prev => prev.filter(email => email.id !== id));
    if (selectedEmailId === id) setSelectedEmailId(null);

    // Backend call
    await mailService.moveEmail(id, 'trash');
    loadCounts();

    addToast({
      type: 'info',
      title: 'Conversa movida para lixeira',
      duration: 2000
    });
  };

  const handleToggleRead = async (e: React.MouseEvent | null, id: string) => {
    e?.stopPropagation();
    const email = emails.find(e => e.id === id);
    if (!email) return;

    // Optimistic
    setEmails(prev => prev.map(e => e.id === id ? { ...e, read: !e.read } : e));

    // Backend
    await mailService.toggleRead(id);
    loadCounts();
  };

  const handleSendEmail = async (emailData: Partial<Email> & { fromMailboxId?: string }) => {
    try {
      if (!currentMailboxId && !emailData.fromMailboxId) {
        addToast({
          type: 'error',
          title: 'Erro ao enviar',
          message: 'Nenhuma caixa de entrada selecionada'
        });
        return;
      }

      // Use the selected mailbox from composer, or fallback to current one
      const senderMailboxId = emailData.fromMailboxId || currentMailboxId;

      await mailService.sendEmail(senderMailboxId, { // Use dynamic mailbox ID
        to: emailData.to || [],
        subject: emailData.subject || '',
        body: emailData.body || '',
      });
      addToast({
        type: 'success',
        title: 'E-mail enviado',
        message: 'Sua mensagem foi enviada com sucesso'
      });
      setIsComposeOpen(false);
      setComposeInitialData(undefined); // Clear initial data
      loadEmails(); // Reload emails for the current folder
      loadCounts(); // Refresh unread counts
    } catch (error: any) {
      console.error(error);
      addToast({
        type: 'error',
        title: 'Erro ao enviar',
        message: error.response?.data?.error || 'Não foi possível enviar o e-mail. Tente novamente.'
      });
    }
  };

  const handleComposeOpen = () => {
    setComposeInitialData(undefined);
    setIsComposeOpen(true);
    setIsMobileMenuOpen(false);
  }

  // Reply Logic
  const handleReply = (email: Email) => {
    setComposeInitialData({
      to: email.from.email,
      subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
      body: `\n\n\n\n--- Mensagem Original de ${email.from.name} em ${email.timestamp} ---\n${email.body.replace(/<[^>]*>?/gm, '')}` // Simple strip html for quote
    });
    setIsComposeOpen(true);
  };

  // Forward Logic
  const handleForward = (email: Email) => {
    setComposeInitialData({
      subject: email.subject.startsWith('Fwd:') ? email.subject : `Fwd: ${email.subject}`,
      body: `\n\n\n\n--- Mensagem Encaminhada ---\nDe: ${email.from.name} <${email.from.email}>\nData: ${email.timestamp}\n\n${email.body.replace(/<[^>]*>?/gm, '')}`
    });
    setIsComposeOpen(true);
  };

  const selectedEmail = emails.find(e => e.id === selectedEmailId);

  return (
    <div className="flex h-full w-full bg-white dark:bg-zinc-950 overflow-hidden relative">

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar Container (Drawer on Mobile, Static on Desktop) */}
      <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-auto lg:z-auto border-r border-docka-200 dark:border-zinc-800
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-docka-200 dark:border-zinc-800 text-docka-900 dark:text-zinc-100">
            <span className="font-bold text-lg">Menu</span>
            <button onClick={() => setIsMobileMenuOpen(false)}><X size={20} /></button>
          </div>
          <MailSidebar
            mailboxes={mailboxes}
            currentMailboxId={currentMailboxId}
            onMailboxChange={(id) => { setCurrentMailboxId(id); setIsMobileMenuOpen(false); }}
            currentFolder={currentFolder}
            onFolderChange={(folder) => { setCurrentFolder(folder); setIsMobileMenuOpen(false); }}
            onCompose={handleComposeOpen}
            unreadCounts={unreadCounts}
          />
        </div>
      </div>

      {/* Mail List Area */}
      <div className={`
          flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-zinc-950 lg:w-[400px] lg:flex-none border-r border-docka-200 dark:border-zinc-800
          ${selectedEmailId ? 'hidden lg:flex' : 'flex'}
      `}>
        {/* Mobile Header */}
        <div className="lg:hidden h-16 border-b border-docka-200 dark:border-zinc-800 flex items-center px-4 shrink-0 bg-white dark:bg-zinc-900 justify-between sticky top-0 z-20">
          <div className="flex items-center">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 mr-2 text-docka-600 dark:text-zinc-400 rounded-md hover:bg-docka-100 dark:hover:bg-zinc-800">
              <Menu size={20} />
            </button>
            <span className="font-bold text-docka-900 dark:text-zinc-100 capitalize text-lg">{currentFolder === 'inbox' ? 'Entrada' : currentFolder}</span>
          </div>
          <div className="text-xs font-medium text-docka-500 dark:text-zinc-400 bg-docka-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
            {emails.length}
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-docka-400 dark:text-zinc-500">
            <RefreshCw className="animate-spin mb-2" size={24} />
            <span className="text-xs font-medium">Sincronizando...</span>
          </div>
        ) : (
          <MailList
            emails={emails}
            selectedEmailId={selectedEmailId}
            onSelectEmail={handleSelectEmail}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onToggleRead={handleToggleRead}
          />
        )}
      </div>

      {/* Mail Reader Area */}
      <div className={`
         fixed inset-0 z-30 bg-white dark:bg-zinc-950 lg:static lg:z-auto lg:flex-1
         ${selectedEmailId ? 'flex flex-col' : 'hidden lg:flex'}
      `}>
        <MailReader
          email={selectedEmail}
          onClose={() => setSelectedEmailId(null)}
          onArchive={() => selectedEmail && handleArchive(null, selectedEmail.id)}
          onDelete={() => selectedEmail && handleDelete(null, selectedEmail.id)}
          onReply={() => selectedEmail && handleReply(selectedEmail)}
          onForward={() => selectedEmail && handleForward(selectedEmail)}
          onToggleRead={() => selectedEmail && handleToggleRead(null, selectedEmail.id)}
        />
      </div>

      {isComposeOpen && (
        <ComposeModal
          onClose={() => setIsComposeOpen(false)}
          onSend={handleSendEmail}
          initialData={composeInitialData}
          mailboxes={mailboxes}
        />
      )}
    </div>
  );
};

export default MailLayout;
