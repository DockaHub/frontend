
import React, { useState } from 'react';
import { X, Server, ShieldCheck, Mail, Save, AlertCircle } from 'lucide-react';
import { Mailbox } from '../../../types';
import { mailService } from '../../../services/mailService';
import { useToast } from '../../../context/ToastContext';

interface MailboxSettingsModalProps {
  mailbox: Mailbox;
  onClose: () => void;
  onUpdate: () => void;
}

const MailboxSettingsModal: React.FC<MailboxSettingsModalProps> = ({ mailbox, onClose, onUpdate }) => {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // SMTP State
  const [smtpHost, setSmtpHost] = useState(mailbox.smtpHost || '');
  const [smtpPort, setSmtpPort] = useState(mailbox.smtpPort?.toString() || '587');
  const [smtpUser, setSmtpUser] = useState(mailbox.smtpUser || '');
  const [smtpPass, setSmtpPass] = useState(mailbox.smtpPass || '');
  const [smtpSecure, setSmtpSecure] = useState(mailbox.smtpSecure ?? true);

  // IMAP State
  const [imapHost, setImapHost] = useState(mailbox.imapHost || '');
  const [imapPort, setImapPort] = useState(mailbox.imapPort?.toString() || '993');
  const [imapUser, setImapUser] = useState(mailbox.imapUser || '');
  const [imapPass, setImapPass] = useState(mailbox.imapPass || '');
  const [imapSecure, setImapSecure] = useState(mailbox.imapSecure ?? true);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await mailService.updateMailbox(mailbox.id, {
        smtpHost,
        smtpPort: parseInt(smtpPort),
        smtpUser,
        smtpPass,
        smtpSecure,
        imapHost,
        imapPort: parseInt(imapPort),
        imapUser,
        imapPass,
        imapSecure
      });

      addToast({
        type: 'success',
        title: 'Configurações salvas',
        message: 'As credenciais de e-mail foram atualizadas com sucesso.',
        duration: 3000
      });
      onUpdate();
      onClose();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erro ao salvar',
        message: error.response?.data?.error || 'Não foi possível salvar as configurações.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-docka-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 flex justify-between items-center bg-docka-50/30 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="bg-docka-100 dark:bg-zinc-800 p-2 rounded-lg text-docka-600 dark:text-zinc-300">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="font-bold text-docka-900 dark:text-zinc-100">Configurações de E-mail</h3>
              <p className="text-xs text-docka-500 dark:text-zinc-500">{mailbox.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-full text-docka-400 dark:text-zinc-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-8 flex gap-3">
            <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">Dica para Zoho/Gmail:</p>
              <p>Não use sua senha principal. Você deve gerar uma <strong>Senha de Aplicativo (App Password)</strong> nas configurações de segurança do seu provedor.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* SMTP Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Send size={16} className="text-docka-500" />
                <h4 className="text-sm font-bold text-docka-700 dark:text-zinc-300 uppercase tracking-wider">Envio (SMTP)</h4>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-docka-500 dark:text-zinc-500 mb-1 block">Servidor SMTP</label>
                  <input 
                    value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.zoho.com"
                    className="w-full bg-docka-50/50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-docka-500 outline-none transition-all dark:text-zinc-200"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-docka-500 dark:text-zinc-500 mb-1 block">Usuário/E-mail</label>
                    <input 
                      value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)}
                      className="w-full bg-docka-50/50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-docka-500 outline-none transition-all dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-docka-500 dark:text-zinc-500 mb-1 block">Porta</label>
                    <input 
                      value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)}
                      className="w-full bg-docka-50/50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-docka-500 outline-none transition-all dark:text-zinc-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-docka-500 dark:text-zinc-500 mb-1 block">Senha / App Password</label>
                  <input 
                    type="password"
                    value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)}
                    className="w-full bg-docka-50/50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-docka-500 outline-none transition-all dark:text-zinc-200"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input 
                    type="checkbox" id="smtpSecure" 
                    checked={smtpSecure} onChange={(e) => setSmtpSecure(e.target.checked)}
                    className="rounded border-docka-300 text-docka-600 focus:ring-docka-500"
                  />
                  <label htmlFor="smtpSecure" className="text-xs text-docka-600 dark:text-zinc-400 flex items-center gap-1">
                    <ShieldCheck size={14} /> Usar SSL/TLS Seguro
                  </label>
                </div>
              </div>
            </div>

            {/* IMAP Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Server size={16} className="text-docka-500" />
                <h4 className="text-sm font-bold text-docka-700 dark:text-zinc-300 uppercase tracking-wider">Recebimento (IMAP)</h4>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-docka-500 dark:text-zinc-500 mb-1 block">Servidor IMAP</label>
                  <input 
                    value={imapHost} onChange={(e) => setImapHost(e.target.value)}
                    placeholder="imap.zoho.com"
                    className="w-full bg-docka-50/50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-docka-500 outline-none transition-all dark:text-zinc-200"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-docka-500 dark:text-zinc-500 mb-1 block">Usuário/E-mail</label>
                    <input 
                      value={imapUser} onChange={(e) => setImapUser(e.target.value)}
                      className="w-full bg-docka-50/50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-docka-500 outline-none transition-all dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-docka-500 dark:text-zinc-500 mb-1 block">Porta</label>
                    <input 
                      value={imapPort} onChange={(e) => setImapPort(e.target.value)}
                      className="w-full bg-docka-50/50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-docka-500 outline-none transition-all dark:text-zinc-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-docka-500 dark:text-zinc-500 mb-1 block">Senha / App Password</label>
                  <input 
                    type="password"
                    value={imapPass} onChange={(e) => setImapPass(e.target.value)}
                    className="w-full bg-docka-50/50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-docka-500 outline-none transition-all dark:text-zinc-200"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input 
                    type="checkbox" id="imapSecure" 
                    checked={imapSecure} onChange={(e) => setImapSecure(e.target.checked)}
                    className="rounded border-docka-300 text-docka-600 focus:ring-docka-500"
                  />
                  <label htmlFor="imapSecure" className="text-xs text-docka-600 dark:text-zinc-400 flex items-center gap-1">
                    <ShieldCheck size={14} /> Usar SSL/TLS Seguro
                  </label>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-900/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={isLoading}
            className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2 rounded-lg text-sm font-bold hover:bg-docka-800 dark:hover:bg-white/90 shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
          >
            {isLoading ? (
              <>Sincronizando...</>
            ) : (
              <>
                <Save size={16} /> Salvar Configurações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MailboxSettingsModal;
