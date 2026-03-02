
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Paperclip, Minimize2, ChevronDown } from 'lucide-react';
import { generateEmailDraft } from '../../../services/geminiService';
import { Email, Mailbox } from '../../../types';

interface ComposeModalProps {
  onClose: () => void;
  onSend: (email: Partial<Email> & { fromMailboxId?: string }) => void;
  initialData?: {
    to?: string;
    subject?: string;
    body?: string;
  };
  mailboxes: Mailbox[];
}

const ComposeModal: React.FC<ComposeModalProps> = ({ onClose, onSend, initialData, mailboxes }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedMailboxId, setSelectedMailboxId] = useState<string>(mailboxes[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiMode, setIsAiMode] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFromOpen, setIsFromOpen] = useState(false);

  const selectedMailbox = mailboxes.find(m => m.id === selectedMailboxId) || mailboxes[0];

  // Pre-fill data if available (Reply/Forward)
  useEffect(() => {
    if (initialData) {
      setTo(initialData.to || '');
      setSubject(initialData.subject || '');
      setBody(initialData.body || '');
    }
  }, [initialData]);

  const handleAiDraft = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    // Include current body context if replying
    const context = body ? `Responding to this email content: "${body}"` : undefined;
    const draft = await generateEmailDraft(aiPrompt, context);

    // Append or Replace logic could go here, for now we replace or append to signature
    setBody(prev => draft + "\n\n" + prev);
    setIsGenerating(false);
    setIsAiMode(false);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-8 z-50 w-64 bg-white dark:bg-zinc-900 border border-docka-300 dark:border-zinc-700 rounded-t-lg shadow-lg flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => setIsMinimized(false)}>
        <span className="font-medium text-sm text-docka-700 dark:text-zinc-200 truncate">{subject || "Nova Mensagem"}</span>
        <div className="flex space-x-2">
          <button onClick={(e) => { e.stopPropagation(); onClose(); }}><X size={14} className="text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200" /></button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 right-0 md:right-12 z-50 w-full md:w-[600px] bg-white dark:bg-zinc-900 shadow-2xl rounded-t-xl md:rounded-xl border border-docka-200 dark:border-zinc-700 flex flex-col md:mb-4 h-[90vh] md:h-[650px] animate-in slide-in-from-bottom-10 fade-in duration-300">

      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-docka-100 dark:border-zinc-800 px-4 py-3 flex justify-between items-center rounded-t-xl">
        <h3 className="font-semibold text-sm text-docka-800 dark:text-zinc-100">Nova Mensagem</h3>
        <div className="flex items-center space-x-1">
          <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 transition-colors"><Minimize2 size={16} /></button>
          <button onClick={onClose} className="p-1.5 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded text-docka-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"><X size={16} /></button>
        </div>
      </div>

      {/* From Selection (Pill Style) */}
      <div className="px-4 py-2 bg-docka-50/50 dark:bg-zinc-900 border-b border-docka-100 dark:border-zinc-800 flex items-center gap-2">
        <span className="text-sm text-docka-500 dark:text-zinc-500">De:</span>
        <div className="relative">
          <button
            onClick={() => setIsFromOpen(!isFromOpen)}
            className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-full px-3 py-1 text-sm hover:shadow-sm transition-all hover:bg-docka-50 dark:hover:bg-zinc-700"
          >
            {selectedMailbox ? (
              <>
                {selectedMailbox.type === 'personal' ? (
                  <img src={selectedMailbox.avatar} className="w-5 h-5 rounded-full" alt="" />
                ) : (
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${selectedMailbox.color || 'bg-docka-500'}`}>
                    {selectedMailbox.name.substring(0, 1)}
                  </div>
                )}
                <div className="flex flex-col items-start leading-none relative top-[1px]">
                  <span className="font-medium text-docka-700 dark:text-zinc-200">
                    {selectedMailbox.name} <span className="font-normal text-docka-400 dark:text-zinc-500 text-xs">({selectedMailbox.email})</span>
                  </span>
                </div>
              </>
            ) : <span className="text-docka-500">Selecione um remetente</span>}
            <ChevronDown size={14} className={`text-docka-400 transition-transform ${isFromOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Custom Dropdown */}
          {isFromOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsFromOpen(false)} />
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl z-20 py-1 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-3 py-2 text-xs font-semibold text-docka-400 dark:text-zinc-500 uppercase tracking-wider bg-docka-50 dark:bg-zinc-900/50">
                  Seus E-mails
                </div>
                {mailboxes.map(mb => (
                  <button
                    key={mb.id}
                    onClick={() => {
                      setSelectedMailboxId(mb.id);
                      setIsFromOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-3 hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors ${selectedMailboxId === mb.id ? 'bg-indigo-50 dark:bg-zinc-800' : ''}`}
                  >
                    {mb.type === 'personal' ? (
                      <img src={mb.avatar} className="w-8 h-8 rounded-full border border-docka-200 dark:border-zinc-700" alt="" />
                    ) : (
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold ${mb.color || 'bg-docka-500'}`}>
                        {mb.name.substring(0, 1)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className={`font-medium ${selectedMailboxId === mb.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-docka-700 dark:text-zinc-200'}`}>
                        {mb.name}
                      </span>
                      <span className="text-xs text-docka-500 dark:text-zinc-500">{mb.email}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* AI Bar (Conditional) */}
      {isAiMode && (
        <div className="bg-indigo-50 dark:bg-indigo-900/30 border-b border-indigo-100 dark:border-indigo-800 p-3 flex gap-2 animate-in slide-in-from-top-2">
          <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400 mt-2 shrink-0" />
          <div className="flex-1">
            <input
              autoFocus
              placeholder="Descreva o que você quer escrever..."
              className="w-full bg-transparent border-none text-sm text-indigo-900 dark:text-indigo-100 placeholder:text-indigo-400 dark:placeholder:text-indigo-300/50 focus:ring-0 p-0 mb-2 font-medium"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiDraft()}
            />
            <div className="flex justify-end">
              <button
                onClick={handleAiDraft}
                disabled={isGenerating || !aiPrompt}
                className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isGenerating ? 'Escrevendo...' : 'Gerar Rascunho'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inputs */}
      <div className="flex flex-col flex-1 p-0 bg-white dark:bg-zinc-900">
        <div className="flex items-center border-b border-docka-100 dark:border-zinc-800 px-4 bg-white dark:bg-zinc-900">
          <span className="text-sm text-docka-400 dark:text-zinc-500 w-16">Para</span>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 py-3 text-sm outline-none placeholder:text-docka-300 dark:placeholder:text-zinc-600 text-docka-900 dark:text-zinc-100 bg-transparent"
            autoFocus={!isAiMode && !to}
          />
        </div>
        <div className="flex items-center border-b border-docka-100 dark:border-zinc-800 px-4 bg-white dark:bg-zinc-900">
          <span className="text-sm text-docka-400 dark:text-zinc-500 w-16">Assunto</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 py-3 text-sm outline-none font-medium placeholder:text-docka-300 dark:placeholder:text-zinc-600 text-docka-900 dark:text-zinc-100 bg-transparent"
          />
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex-1 w-full p-4 text-base outline-none resize-none font-sans leading-relaxed text-docka-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 placeholder:text-docka-300 dark:placeholder:text-zinc-600"
          placeholder="Comece a escrever..."
          autoFocus={!!to && !!subject}
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-docka-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 rounded-b-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSend({ to: [to], subject, body, fromMailboxId: selectedMailboxId })}
            className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2 rounded-lg text-sm font-bold hover:bg-docka-800 dark:hover:bg-white/90 flex items-center shadow-lg shadow-docka-200 dark:shadow-none hover:shadow-xl transition-all active:scale-95"
          >
            Enviar
          </button>
          <button className="text-docka-400 dark:text-zinc-500 hover:bg-docka-100 dark:hover:bg-zinc-800 p-2 rounded-lg transition-colors"><Paperclip size={20} /></button>
          {!isAiMode && (
            <button
              onClick={() => setIsAiMode(true)}
              className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Sparkles size={16} /> AI Writer
            </button>
          )}
        </div>
        <div className="text-xs text-docka-400 dark:text-zinc-600">Rascunho salvo</div>
      </div>
    </div>
  );
};

export default ComposeModal;
