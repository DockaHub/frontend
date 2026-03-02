
import React from 'react';
import { Search, FileText, DollarSign, Calendar, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const CONTRACTS = [
    { 
        id: 'CTR-2024-85', 
        property: 'Av. Paulista, 1000 - Apt 42', 
        tenant: 'João Silva', 
        totalValue: 'R$ 4.500,00', 
        breakdown: { rent: '3.000', condo: '1.200', tax: '300' },
        status: 'active',
        nextPayout: '25/02/2026',
        paymentStatus: 'paid' 
    },
    { 
        id: 'CTR-2024-92', 
        property: 'Al. Lorena, 80 - Studio 12', 
        tenant: 'Ana B.', 
        totalValue: 'R$ 2.800,00', 
        breakdown: { rent: '2.000', condo: '600', tax: '200' },
        status: 'active',
        nextPayout: '25/02/2026',
        paymentStatus: 'overdue' 
    },
];

const UmaChaveContractsView: React.FC = () => {
  return (
    <div className="h-full bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar p-8 transition-colors">
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Contratos de Locação</h1>
                <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gestão unificada: Aluguel + Condomínio + IPTU.</p>
            </div>

            {/* Contract List */}
            <div className="space-y-4">
                {CONTRACTS.map((contract) => (
                    <div key={contract.id} className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-900/30 shrink-0">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-lg">{contract.property}</h3>
                                    <div className="flex items-center gap-3 text-sm text-docka-500 dark:text-zinc-400 mt-1">
                                        <span className="font-mono bg-docka-100 dark:bg-zinc-800 px-1.5 rounded text-xs">{contract.id}</span>
                                        <span>Inquilino: <span className="font-medium text-docka-700 dark:text-zinc-300">{contract.tenant}</span></span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-docka-400 dark:text-zinc-500 uppercase font-bold mb-1">Boleto Total (Mensal)</div>
                                <div className="text-2xl font-bold text-docka-900 dark:text-zinc-100">{contract.totalValue}</div>
                            </div>
                        </div>

                        {/* Financial Breakdown (The core feature) */}
                        <div className="bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg p-4 mb-4 grid grid-cols-3 gap-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-docka-500 dark:text-zinc-400 uppercase font-bold">Aluguel (Líquido)</span>
                                <span className="text-sm font-medium text-docka-900 dark:text-zinc-100">R$ {contract.breakdown.rent}</span>
                                <span className="text-[10px] text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">Repasse ao Dono <ChevronRight size={10} /></span>
                            </div>
                            <div className="flex flex-col border-l border-docka-200 dark:border-zinc-700 pl-4">
                                <span className="text-[10px] text-docka-500 dark:text-zinc-400 uppercase font-bold">Condomínio</span>
                                <span className="text-sm font-medium text-docka-900 dark:text-zinc-100">R$ {contract.breakdown.condo}</span>
                                <span className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">Quitação Automática <CheckCircle2 size={10} /></span>
                            </div>
                            <div className="flex flex-col border-l border-docka-200 dark:border-zinc-700 pl-4">
                                <span className="text-[10px] text-docka-500 dark:text-zinc-400 uppercase font-bold">IPTU</span>
                                <span className="text-sm font-medium text-docka-900 dark:text-zinc-100">R$ {contract.breakdown.tax}</span>
                                <span className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">Quitação Automática <CheckCircle2 size={10} /></span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-4">
                                <div className={`flex items-center gap-2 text-sm font-medium ${contract.paymentStatus === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {contract.paymentStatus === 'paid' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                    {contract.paymentStatus === 'paid' ? 'Boleto Atual Pago' : 'Boleto em Atraso'}
                                </div>
                                <div className="text-xs text-docka-400 dark:text-zinc-500 flex items-center gap-1">
                                    <Calendar size={12} /> Próximo repasse: {contract.nextPayout}
                                </div>
                            </div>
                            <button className="text-sm font-medium text-docka-600 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200 hover:underline">Ver Detalhes</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default UmaChaveContractsView;
