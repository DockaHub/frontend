
import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousBodyOverflow = useRef('');
  const titleId = useId();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      previousBodyOverflow.current = document.body.style.overflow;
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (isOpen) document.body.style.overflow = previousBodyOverflow.current;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl'
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-0 backdrop-blur-[2px] animate-in fade-in duration-200 sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`flex h-[100dvh] min-h-0 w-full ${maxWidthClasses[size]} flex-col bg-white pt-[env(safe-area-inset-top)] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 dark:bg-zinc-900 sm:h-auto sm:max-h-[90dvh] sm:rounded-xl sm:border sm:border-docka-200 sm:pt-0 dark:sm:border-zinc-800`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-docka-100 px-4 py-4 dark:border-zinc-800 sm:px-6">
          <h3 id={titleId} className="text-lg font-bold text-docka-900 dark:text-zinc-100">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-1.5 text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-4 dark:text-zinc-300 sm:p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-docka-100 bg-docka-50/50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-zinc-800 dark:bg-zinc-950/50 sm:rounded-b-xl sm:px-6 sm:py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
