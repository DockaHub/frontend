
import React, { useState } from 'react';
import { Copy, Check, Code, Shield } from 'lucide-react';

interface TrackerSetupViewProps {
    organizationId: string;
}

const TrackerSetupView: React.FC<TrackerSetupViewProps> = ({ organizationId }) => {
    const [copied, setCopied] = useState(false);

    const scriptCode = `<script 
  src="http://localhost:3001/api/tracker/script.js" 
  data-org-id="${organizationId}"
  async
></script>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(scriptCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-docka-200 dark:border-zinc-800 p-6 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Code size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-docka-900 dark:text-zinc-100 mb-1">
                        Código de Monitoramento
                    </h3>
                    <p className="text-sm text-docka-500 dark:text-zinc-400">
                        Instale este código no seu site para capturar Leads automaticamente e rastrear visitantes.
                    </p>
                </div>
            </div>

            <div className="space-y-6">

                {/* Instructions */}
                <div className="bg-docka-50 dark:bg-zinc-800/50 rounded-lg p-4 border border-docka-100 dark:border-zinc-800">
                    <h4 className="text-sm font-bold text-docka-800 dark:text-zinc-200 mb-2 flex items-center gap-2">
                        <Shield size={14} /> Como instalar
                    </h4>
                    <ol className="list-decimal list-inside text-sm text-docka-600 dark:text-zinc-400 space-y-1 ml-1">
                        <li>Copie o código abaixo.</li>
                        <li>Cole antes do fechamento da tag <code className="bg-docka-200 dark:bg-zinc-700 px-1 rounded">&lt;/body&gt;</code> em todas as páginas do seu site.</li>
                        <li>O script irá capturar automaticamente formulários enviados.</li>
                    </ol>
                </div>

                {/* Code Snippet */}
                <div className="relative group">
                    <div className="absolute top-3 right-3">
                        <button
                            onClick={handleCopy}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${copied
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : 'bg-white dark:bg-zinc-800 text-docka-600 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-100 border border-docka-200 dark:border-zinc-700'
                                }`}
                        >
                            {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar Código</>}
                        </button>
                    </div>
                    <pre className="bg-docka-900 dark:bg-black text-docka-50 dark:text-zinc-300 p-4 rounded-lg text-sm overflow-x-auto font-mono border border-docka-800 dark:border-zinc-800">
                        <code>{scriptCode}</code>
                    </pre>
                </div>

                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                    <span className="font-bold">Nota:</span> Certifique-se de que os campos do seu formulário tenham o atributo 'name' (ex: name="email") para que os dados sejam capturados corretamente.
                </div>

            </div>
        </div>
    );
};

export default TrackerSetupView;
