
import React from 'react';
import { Home, Key, TrendingUp, AlertTriangle, Users, Wallet } from 'lucide-react';

const UmaChaveOverviewView: React.FC = () => {
  return (
    <div className="h-full bg-docka-50 dark:bg-zinc-950 p-8 overflow-y-auto custom-scrollbar transition-colors">
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Visão Geral UmaChave</h1>
                <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gestão imobiliária centralizada: Morar & Investir.</p>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg"><Home size={20} /></div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">98% Ocupação</span>
                    </div>
                    <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">45</h3>
                    <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Imóveis Geridos</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Key size={20} /></div>
                    </div>
                    <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">42</h3>
                    <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Contratos Ativos</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"><AlertTriangle size={20} /></div>
                        <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">Ação Necessária</span>
                    </div>
                    <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">3</h3>
                    <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Inadimplentes</p>
                </div>
                <div className="bg-orange-600 dark:bg-orange-700 text-white p-6 rounded-xl shadow-lg relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 text-orange-200 dark:text-orange-100">
                             <Wallet size={20} />
                             <span className="text-xs font-bold uppercase tracking-wider">Arrecadação Mensal</span>
                        </div>
                        <h3 className="text-3xl font-bold">R$ 185k</h3>
                        <p className="text-sm text-orange-100 dark:text-orange-200 mt-1">Aluguel + Encargos</p>
                    </div>
                    <div className="absolute -right-6 -bottom-6 opacity-20 transform group-hover:scale-110 transition-transform text-white">
                        <TrendingUp size={100} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activities */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6">
                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm mb-6 flex items-center gap-2">
                        <Users size={16} className="text-docka-400 dark:text-zinc-500" />
                        Últimas Movimentações
                    </h3>
                    <div className="space-y-4">
                        {[
                            { text: 'Novo contrato assinado: Apt 304 - Ed. Solar', type: 'success', time: 'Há 2h' },
                            { text: 'Repasse realizado: Proprietário Carlos M.', type: 'info', time: 'Há 5h' },
                            { text: 'Pagamento de IPTU agendado: Casa 12', type: 'warning', time: 'Ontem' },
                            { text: 'Vistoria de saída: Apt 101 - Jardins', type: 'neutral', time: 'Ontem' },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start pb-4 border-b border-docka-50 dark:border-zinc-800 last:border-0 last:pb-0">
                                <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                                    item.type === 'success' ? 'bg-emerald-500' : 
                                    item.type === 'info' ? 'bg-blue-500' : 
                                    item.type === 'warning' ? 'bg-amber-500' : 'bg-docka-400 dark:bg-zinc-600'
                                }`} />
                                <div>
                                    <p className="text-sm text-docka-900 dark:text-zinc-100 font-medium leading-snug">{item.text}</p>
                                    <p className="text-xs text-docka-500 dark:text-zinc-500 mt-1">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Account Status */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6">
                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm mb-6 flex items-center gap-2">
                        <Wallet size={16} className="text-docka-400 dark:text-zinc-500" />
                        Status de Contas (Mês Atual)
                    </h3>
                    <div className="space-y-5">
                        <div>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-medium text-docka-900 dark:text-zinc-100">Aluguéis Recebidos</span>
                                <span className="text-docka-500 dark:text-zinc-500">85% (38/45)</span>
                            </div>
                            <div className="w-full bg-docka-100 dark:bg-zinc-800 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-medium text-docka-900 dark:text-zinc-100">Condomínios Quitados</span>
                                <span className="text-docka-500 dark:text-zinc-500">40% (18/45)</span>
                            </div>
                            <div className="w-full bg-docka-100 dark:bg-zinc-800 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-medium text-docka-900 dark:text-zinc-100">Repasses aos Proprietários</span>
                                <span className="text-docka-500 dark:text-zinc-500">10% (Inicia dia 25)</span>
                            </div>
                            <div className="w-full bg-docka-100 dark:bg-zinc-800 rounded-full h-2">
                                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '10%' }} />
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 p-3 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-lg text-xs text-docka-500 dark:text-zinc-400 text-center">
                        Próximo lote de pagamentos: <strong>25/02/2026</strong>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default UmaChaveOverviewView;
