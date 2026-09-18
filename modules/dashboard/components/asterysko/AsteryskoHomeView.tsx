import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import api from '../../../../services/api';
import { useSearchParams } from 'react-router-dom';
import { formatStatusLabel } from './utils/statusPresentation';

function todayLabel() {
  const now = new Date();
  const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${weekdays[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}. de ${now.getFullYear()}`;
}

interface KpiCardProps { 
  label: string; 
  value: string | number; 
  sub: string; 
  onClick?: () => void;
}
const KpiCard: React.FC<KpiCardProps> = ({ label, value, sub, onClick }) => (
  <div 
    onClick={onClick}
    className={`border-r border-b border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 sm:p-6 lg:p-[30px] min-w-0 overflow-hidden flex flex-col justify-between gap-6 lg:gap-[50px] transition-colors duration-150 ${
      onClick ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/30' : ''
    }`}
  >
    <span className="font-sans text-xs sm:text-sm font-medium text-black dark:text-zinc-300">{label}</span>
    <div className="flex min-w-0 flex-col gap-3 sm:gap-5">
      <span className="break-words font-season text-[clamp(18px,5.5vw,32px)] font-[420] leading-none text-black dark:text-white">{value}</span>
      <span className="font-sans text-[10px] font-semibold leading-4 text-[#9f9f9f] dark:text-zinc-500">{sub}</span>
    </div>
  </div>
);

interface FunilStepProps { 
  label: string; 
  count: number; 
  active?: boolean; 
  onClick?: () => void;
}
const FunilStep: React.FC<FunilStepProps> = ({ label, count, active = false, onClick }) => (
  <div 
    onClick={onClick}
    className={`min-w-0 flex-1 border-r border-[#e5e5e5] dark:border-zinc-800 last:border-r-0 flex flex-col items-center justify-center gap-2 sm:gap-3 px-1 py-4 sm:py-5 bg-white dark:bg-zinc-900/30 transition-colors duration-150 ${
      onClick ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/30' : ''
    }`}
  >
    <span className={`font-season text-[24px] sm:text-[32px] font-[420] leading-none ${active ? 'text-[#0412dd] dark:text-blue-400' : 'text-black dark:text-white'}`}>
      {count}
    </span>
    <span className="max-w-full truncate font-sans text-[9px] sm:text-xs font-semibold text-[#9f9f9f] dark:text-zinc-500">{label}</span>
  </div>
);

interface FilaItemProps { icon: React.ReactNode; client: string; action: string; }
const FilaItem: React.FC<FilaItemProps> = ({ icon, client, action }) => (
  <div className="flex min-h-[58px] items-center justify-between gap-3 border-b border-[#e5e5e5] bg-white px-4 py-2.5 last:border-b-0 dark:border-zinc-800 dark:bg-zinc-900/20 sm:h-[50px] sm:min-h-0 sm:px-6 sm:py-0">
    <div className="flex items-center gap-2 min-w-0">
      <div className="w-5 h-5 flex items-center justify-center text-[#9f9f9f] dark:text-zinc-500 shrink-0">{icon}</div>
      <span className="font-sans text-xs font-semibold text-black dark:text-white truncate">{client}</span>
    </div>
    <span className="max-w-[48%] text-right font-sans text-[11px] sm:text-xs font-normal leading-4 text-[#9f9f9f] dark:text-zinc-500 line-clamp-2">{action}</span>
  </div>
);

interface TableRowProps { priority: string; item: string; responsible: string; date: string; nextStep: string; client: string; }
const TableRow: React.FC<TableRowProps> = ({ priority, item, responsible, date, nextStep, client }) => {
  const colorClass = priority === 'Alta' 
    ? 'text-[#fd6b32] dark:text-orange-400' 
    : priority === 'Média' 
      ? 'text-amber-500 dark:text-amber-400' 
      : 'text-zinc-500 dark:text-zinc-400';
      
  const cell = (content: string, flex = 1, isPriority = false) => (
    <div style={{ flex }} className="px-6 min-w-0 truncate">
      <span className={`font-sans text-xs truncate ${isPriority ? `font-semibold ${colorClass}` : 'font-medium text-black dark:text-zinc-200'}`}>
        {content}
      </span>
    </div>
  );
  return (
    <div className="flex items-center border-b border-[#e5e5e5] dark:border-zinc-800 min-h-[53px] bg-white dark:bg-zinc-900/10 last:border-b-0">
      {cell(priority, 1, true)}
      {cell(item, 2)}
      {cell(responsible, 2)}
      {cell(date, 1.5)}
      {cell(nextStep, 2)}
      {cell(client, 1)}
    </div>
  );
};

const PendingActionCard: React.FC<TableRowProps> = ({ priority, item, responsible, date, nextStep, client }) => {
  const colorClass = priority === 'Alta'
    ? 'bg-orange-50 text-[#fd6b32] dark:bg-orange-950/30 dark:text-orange-400'
    : priority === 'Média'
      ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300';

  return (
    <article className="border-b border-[#e5e5e5] bg-white p-4 last:border-b-0 dark:border-zinc-800 dark:bg-zinc-900/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-sans text-sm font-semibold leading-5 text-black dark:text-zinc-100">{item}</p>
          <p className="mt-1 truncate font-sans text-[11px] text-zinc-500 dark:text-zinc-400">{client}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 font-sans text-[10px] font-semibold ${colorClass}`}>
          {priority}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        <div className="min-w-0">
          <dt className="font-sans text-[9px] font-semibold uppercase tracking-wider text-zinc-400">Responsável</dt>
          <dd className="mt-1 truncate font-sans text-xs font-medium text-zinc-700 dark:text-zinc-200">{responsible}</dd>
        </div>
        <div className="min-w-0">
          <dt className="font-sans text-[9px] font-semibold uppercase tracking-wider text-zinc-400">Prazo</dt>
          <dd className="mt-1 font-sans text-xs font-medium text-zinc-700 dark:text-zinc-200">{date}</dd>
        </div>
        <div className="col-span-2 min-w-0">
          <dt className="font-sans text-[9px] font-semibold uppercase tracking-wider text-zinc-400">Próximo passo</dt>
          <dd className="mt-1 font-sans text-xs font-medium leading-5 text-zinc-700 dark:text-zinc-200">{nextStep}</dd>
        </div>
      </dl>
    </article>
  );
};

interface AsteryskoHomeViewProps { userName?: string; }

const AsteryskoHomeView: React.FC<AsteryskoHomeViewProps> = ({ userName = 'Usuário' }) => {
  const [stats, setStats] = useState<any>(null);
  const [, setSearchParams] = useSearchParams();

  useEffect(() => {
    api.get('/asterysko/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const handleNavigate = (view: string) => {
    setSearchParams(prev => {
      prev.set('view', view);
      return prev;
    }, { replace: true });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const metrics = stats?.metrics || {};
  const pendingTasks = stats?.pendingTasks || [];
  const dispatches = stats?.recentDispatches || [];

  const kpis = [
    { 
      label: 'Processos ativos', 
      value: metrics.activeProcesses ?? 0, 
      sub: 'Total monitorado no INPI', 
      onClick: () => handleNavigate('processes') 
    },
    { 
      label: 'Prazos críticos', 
      value: metrics.urgentCount ?? 0, 
      sub: 'Processos aguardando ação', 
      onClick: () => handleNavigate('processes') 
    },
    { 
      label: 'A receber', 
      value: metrics.receivables !== undefined ? formatCurrency(metrics.receivables) : 'R$ 0,00', 
      sub: 'Contratos e faturas pendentes', 
      onClick: () => handleNavigate('financial') 
    },
    { 
      label: 'Novos leads', 
      value: metrics.dealCounts?.leads ?? 0, 
      sub: 'Leads não qualificados', 
      onClick: () => handleNavigate('crm') 
    },
  ];

  const funilSteps = [
    { label: 'Lead', count: metrics.dealCounts?.leads ?? 0, active: true, onClick: () => handleNavigate('crm') },
    { label: 'Viabilidade', count: metrics.dealCounts?.viability ?? 0, onClick: () => handleNavigate('crm') },
    { label: 'Contrato', count: metrics.dealCounts?.contract ?? 0, onClick: () => handleNavigate('crm') },
    { label: 'Protocolo', count: metrics.dealCounts?.filed ?? 0, onClick: () => handleNavigate('processes') },
    { label: 'Exame', count: metrics.dealCounts?.examination ?? 0, onClick: () => handleNavigate('processes') },
  ];

  const renderDispatchIcon = (type: string) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {type === 'success' ? (
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
      ) : type === 'warning' ? (
        <>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </>
      )}
    </svg>
  );

  const filaItems: FilaItemProps[] = dispatches.length > 0
    ? dispatches.slice(0, 3).map((d: any) => ({
        icon: renderDispatchIcon(d.type),
        client: d.brand,
        action: formatStatusLabel(d.status)
      }))
    : [
        {
          icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M16 2v4M8 2v4M2 10h20"/></svg>,
          client: 'Fauves', action: 'Confirmar pagamento INPI'
        },
        {
          icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
          client: 'Lefka', action: 'Revisar dados'
        },
        {
          icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>,
          client: 'IR Block', action: 'Pagar decênio'
        },
      ];

  const tableRows: TableRowProps[] = pendingTasks.slice(0, 3).map((t: any) => ({
    priority: t.priority || 'Média',
    item: t.task || t.title || 'Tarefa',
    responsible: t.assignee?.name || 'Sem responsável',
    date: t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR') : 'Sem prazo',
    nextStep: t.nextStep || 'Executar tarefa',
    client: t.client || 'Asterysko',
  }));

  const tableCols = ['Prioridade', 'Item', 'Responsável', 'Prazo', 'Próximo passo', 'Cliente'];
  const colFlex =  [1, 2, 2, 1.5, 2, 1];

  return (
    <div className="h-full min-h-0 w-full overflow-x-hidden overflow-y-auto bg-white pb-[env(safe-area-inset-bottom)] font-sans transition-colors duration-300 dark:bg-zinc-950">

      {/* Header */}
      <div className="sticky top-0 z-10 flex min-h-[76px] flex-col items-start justify-center gap-1.5 border-b border-[#e5e5e5] bg-white/95 px-4 py-3 backdrop-blur-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-950/90 sm:h-[75px] sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-0">
        <span className="max-w-full truncate font-season text-xl sm:text-[22px] font-[420] text-black dark:text-white">Olá, {userName}</span>
        <div className="flex min-w-0 items-center gap-2 text-zinc-400 dark:text-zinc-500">
          <Calendar size={16} className="shrink-0 sm:h-[18px] sm:w-[18px]" />
          <span className="truncate font-sans text-[11px] sm:text-sm font-semibold text-black dark:text-zinc-300">{todayLabel()}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 border-l border-t border-[#e5e5e5] transition-colors duration-300 dark:border-zinc-800 lg:grid-cols-4">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Funil + Fila */}
      <div className="flex flex-col lg:flex-row transition-colors duration-300">
        {/* Funil */}
        <div className="flex-1 border-r border-b border-[#e5e5e5] dark:border-zinc-800">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-950/20">
            <span className="font-sans text-sm font-medium text-black dark:text-zinc-300">Funil operacional</span>
          </div>
          <div className="flex h-[116px] sm:h-[150px]">
            {funilSteps.map(s => <FunilStep key={s.label} {...s} />)}
          </div>
        </div>

        {/* Fila de ações */}
        <div className="flex-1 border-b border-[#e5e5e5] dark:border-zinc-800">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-950/20">
            <span className="font-sans text-sm font-medium text-black dark:text-zinc-300">Últimos Despachos / Fila</span>
          </div>
          <div className="flex flex-col">
            {filaItems.map((i, idx) => <FilaItem key={idx} {...i} />)}
          </div>
        </div>
      </div>

      {/* Ações Pendentes */}
      <div className="border border-t-0 border-[#e5e5e5] dark:border-zinc-800 transition-colors duration-300">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-950/20">
          <span className="font-sans text-sm font-medium text-black dark:text-zinc-300">Ações pendentes</span>
        </div>

        {tableRows.length === 0 ? (
          <div className="flex min-h-[100px] items-center justify-center bg-white px-4 text-center dark:bg-zinc-900/10">
            <span className="font-sans text-xs text-zinc-400 dark:text-zinc-500">Nenhuma ação pendente no momento.</span>
          </div>
        ) : (
          <>
            <div className="lg:hidden">
              {tableRows.map((row, i) => <PendingActionCard key={i} {...row} />)}
            </div>
            <div className="hidden lg:block">
              <div className="flex h-[42px] items-center border-b border-[#e5e5e5] bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                {tableCols.map((col, i) => (
                  <div key={col} style={{ flex: colFlex[i] }} className="px-6">
                    <span className="font-sans text-xs font-semibold text-zinc-500 dark:text-zinc-400">{col}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                {tableRows.map((row, i) => <TableRow key={i} {...row} />)}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="flex h-[64px] sm:h-[70px] items-center justify-center gap-2 border-t border-[#e5e5e5] dark:border-zinc-800">
          <button 
            onClick={() => handleNavigate('crm')}
            className="flex items-center justify-center gap-2 text-[#0412dd] dark:text-blue-400 hover:opacity-85 transition-opacity py-2 px-4 rounded-lg"
          >
            <span className="font-sans text-[10px] font-semibold tracking-wider">
              VER TODAS AS AÇÕES
            </span>
            <svg width="18" height="8" viewBox="0 0 22 10" fill="none" className="stroke-current">
              <path d="M1 5h20M16 1l5 4-5 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
};

export default AsteryskoHomeView;
