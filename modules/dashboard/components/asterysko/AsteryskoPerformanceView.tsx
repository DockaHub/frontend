import React from 'react';
import { Target, Lock, Clock, ArrowLeft } from 'lucide-react';

interface Props {
    organization?: any;
}

const AsteryskoPerformanceView: React.FC<Props> = () => {
    return (
        <div className="bg-[#fafafa] dark:bg-zinc-950 min-h-full font-sans transition-colors duration-300 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pt-8 px-10 pb-6 border-b border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <div className="flex items-center gap-3">
                    <span className="font-season text-[22px] font-[420] text-black dark:text-white">Minhas Metas</span>
                    <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Inativo Temporariamente
                    </span>
                </div>
            </div>

            {/* Inactive State Container */}
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs mb-6 animate-pulse">
                    <Target size={38} strokeWidth={1.8} />
                </div>

                <h3 className="font-season text-[26px] font-[420] text-black dark:text-white mb-3">
                    Módulo de Metas em Atualização
                </h3>

                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed mb-8">
                    O módulo de acompanhamento de metas comerciais e performance da equipe está temporariamente inativo para melhorias na plataforma. Voltaremos com este recurso em breve.
                </p>

                <div className="flex items-center gap-6 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs text-left max-w-lg">
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
