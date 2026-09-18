import React from 'react';
import { Target, Clock } from 'lucide-react';

interface Props {
    organization?: any;
}

const AsteryskoPerformanceView: React.FC<Props> = () => {
    return (
        <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-[#fafafa] pb-[env(safe-area-inset-bottom)] font-sans transition-colors duration-300 dark:bg-zinc-950">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e5e5e5] bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6 lg:px-10 lg:pb-6 lg:pt-8">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="font-season text-[22px] font-[420] text-black dark:text-white">Minhas Metas</span>
                    <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Inativo Temporariamente
                    </span>
                </div>
            </div>

            {/* Inactive State Container */}
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:p-12">
                <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs mb-6 animate-pulse">
                    <Target size={38} strokeWidth={1.8} />
                </div>

                <h3 className="font-season text-[26px] font-[420] text-black dark:text-white mb-3">
                    Módulo de Metas em Atualização
                </h3>

                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed mb-8">
                    O módulo de acompanhamento de metas comerciais e performance da equipe está temporariamente inativo para melhorias na plataforma. Voltaremos com este recurso em breve.
                </p>

                <div className="flex max-w-lg flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:gap-6 sm:text-left">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center shrink-0">
                        <Clock size={18} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-black dark:text-white">Novos gráficos e kpis individuais</h4>
                        <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400">Em breve você poderá definir metas de faturamento e comissionamento por consultor.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AsteryskoPerformanceView;
