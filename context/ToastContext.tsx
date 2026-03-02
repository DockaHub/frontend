
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(({ type, title, message, duration = 4000 }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // Match animation duration
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle size={20} className="text-emerald-500" />;
      case 'error': return <AlertCircle size={20} className="text-red-500" />;
      case 'warning': return <AlertTriangle size={20} className="text-amber-500" />;
      default: return <Info size={20} className="text-blue-500" />;
    }
  };

  const getBorderColor = () => {
      switch (toast.type) {
        case 'success': return 'border-l-emerald-500';
        case 'error': return 'border-l-red-500';
        case 'warning': return 'border-l-amber-500';
        default: return 'border-l-blue-500';
      }
  }

  return (
    <div
      className={`pointer-events-auto min-w-[320px] max-w-[400px] bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 border-l-4 ${getBorderColor()} shadow-lg rounded-lg p-4 flex gap-3 transform transition-all duration-300 ease-in-out ${
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100 animate-in slide-in-from-right-10 fade-in'
      }`}
    >
      <div className="shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100 leading-tight">{toast.title}</h4>
        {toast.message && <p className="text-xs text-docka-500 dark:text-zinc-400 mt-1 leading-relaxed">{toast.message}</p>}
      </div>
      <button 
        onClick={handleClose}
        className="shrink-0 text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 transition-colors self-start -mt-1 -mr-1 p-1 rounded-md"
      >
        <X size={16} />
      </button>
    </div>
  );
};
