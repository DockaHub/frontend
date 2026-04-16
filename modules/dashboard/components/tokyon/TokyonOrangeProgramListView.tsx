
import { 
    Zap, Users, ArrowRight,
    Search, Filter, LayoutGrid 
} from 'lucide-react';

interface ClientCard {
    id: string;
    name: string;
    project: string;
    health: 'on-track' | 'at-risk' | 'delayed';
    nextPillar: string;
    progress: number;
    logo?: string;
}

const ORANGE_CLIENTS: ClientCard[] = [
    { 
        id: 'xp-inc', 
        name: 'XP Inc.', 
        project: 'Retenção Criativa 2026', 
        health: 'on-track', 
        nextPillar: 'Marketing de Conteúdo',
        progress: 75,
        logo: 'https://logo.clearbit.com/xpinc.com.br' 
    },
    { 
        id: 'taurus', 
        name: 'Taurus', 
        project: 'Brand Core Rebranding', 
        health: 'on-track', 
        nextPillar: 'Design UI/UX',
        progress: 40,
        logo: 'https://logo.clearbit.com/taurus.com.br' 
    },
    { 
        id: 'gerdau', 
        name: 'Gerdau', 
        project: 'Portal RI Estratégico', 
        health: 'at-risk', 
        nextPillar: 'Desenvolvimento Web',
        progress: 60,
        logo: 'https://logo.clearbit.com/gerdau.com.br' 
    },
    { 
        id: 'coca-cola', 
        name: 'Coca-Cola', 
        project: 'Campanha América Latina', 
        health: 'delayed', 
        nextPillar: 'Tráfego Pago',
        progress: 25,
        logo: 'https://logo.clearbit.com/cocacola.com' 
    }
];

interface TokyonOrangeProgramListViewProps {
    onSelectClient: (client: any) => void;
}

const TokyonOrangeProgramListView: React.FC<TokyonOrangeProgramListViewProps> = ({ onSelectClient }) => {
    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-500">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-600 rounded-lg text-white shadow-lg shadow-orange-900/20">
                                <Zap size={24} fill="currentColor" />
                            </div>
                            <h1 className="text-3xl font-black text-docka-900 dark:text-zinc-100 tracking-tight">Orange Program</h1>
                        </div>
                        <p className="text-docka-500 dark:text-zinc-400 text-sm font-medium">Gestão estratégica de alto impacto para clientes de elite.</p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400" size={16} />
                            <input 
                                className="pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20 w-full md:w-64 transition-all" 
                                placeholder="Buscar cliente..."
                            />
                        </div>
                        <button className="p-2.5 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl text-docka-500 hover:bg-docka-50 transition-colors">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                {/* Clients Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ORANGE_CLIENTS.map((client) => (
                        <button 
                            key={client.id}
                            onClick={() => onSelectClient(client)}
                            className="group relative bg-white dark:bg-zinc-900 rounded-3xl border border-docka-200 dark:border-zinc-800 p-6 text-left hover:border-orange-500 dark:hover:border-orange-500/50 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-900/10 active:scale-95"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-docka-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center border border-docka-100 dark:border-zinc-700 overflow-hidden group-hover:scale-110 transition-transform">
                                    {client.logo ? (
                                        <img src={client.logo} alt={client.name} className="w-10 h-10 object-contain" />
                                    ) : (
                                        <Users className="text-docka-300" size={24} />
                                    )}
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    client.health === 'on-track' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 
                                    client.health === 'at-risk' ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/30' : 
                                    'bg-red-50 text-red-600 dark:bg-red-950/30'
                                }`}>
                                    <div className={`w-2 h-2 rounded-full ${
                                        client.health === 'on-track' ? 'bg-emerald-500' : 
                                        client.health === 'at-risk' ? 'bg-orange-500' : 
                                        'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                                    }`} />
                                    {client.health === 'on-track' ? 'No Prazo' : client.health === 'at-risk' ? 'Atenção' : 'Atrasado'}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-black text-docka-900 dark:text-zinc-100 mb-1 leading-tight">{client.name}</h3>
                                <p className="text-xs text-docka-500 dark:text-zinc-500 font-medium truncate">{client.project}</p>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-docka-50 dark:border-zinc-800">
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold text-docka-400 uppercase mb-5 tracking-tighter">
                                        <span>Progresso Estratégico</span>
                                        <span className="text-docka-900 dark:text-zinc-100">{client.progress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-docka-50 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-orange-600 rounded-full shadow-[0_0_10px_rgba(234,88,12,0.4)] transition-all duration-1000" 
                                            style={{ width: `${client.progress}%` }} 
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-orange-600/60 uppercase tracking-widest">Próximo Marco</span>
                                        <span className="text-xs font-bold text-docka-800 dark:text-zinc-300">{client.nextPillar}</span>
                                    </div>
                                    <ArrowRight size={18} className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>

                            {/* Hover effect overlays */}
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-orange-600 to-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-3xl" />
                        </button>
                    ))}

                    {/* Empty Stat / Add New */}
                    <button className="bg-docka-50/50 dark:bg-zinc-900/30 border-2 border-dashed border-docka-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:bg-white dark:hover:bg-zinc-900 hover:border-orange-300 transition-all active:scale-95">
                        <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center border border-docka-100 dark:border-zinc-700 mb-4 group-hover:scale-110 transition-transform">
                            <LayoutGrid className="text-docka-300" size={24} />
                        </div>
                        <span className="text-sm font-bold text-docka-400 dark:text-zinc-500">Integrar Novo Cliente</span>
                        <p className="text-[10px] text-docka-400/60 mt-1 max-w-[120px]">Habilitar gestão estratégica de 5 pilares</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TokyonOrangeProgramListView;
