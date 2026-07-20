import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import api from '../../../../services/api';

function todayLabel() {
  const now = new Date();
  const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${weekdays[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}. de ${now.getFullYear()}`;
}

interface KpiCardProps { label: string; value: string | number; sub: string; }
const KpiCard: React.FC<KpiCardProps> = ({ label, value, sub }) => (
  <div className="border-r border-b border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-[30px] flex-1 min-w-0 flex flex-col gap-[50px]">
    <span className="font-sans text-sm font-medium text-black dark:text-zinc-300">{label}</span>
    <div className="flex flex-col gap-5">
      <span className="font-season text-[32px] font-[420] text-black dark:text-white leading-none">{value}</span>
      <span className="font-sans text-[10px] font-semibold text-[#9f9f9f] dark:text-zinc-500">{sub}</span>
    </div>
  </div>
);

interface FunilStepProps { label: string; count: number; active?: boolean; }
const FunilStep: React.FC<FunilStepProps> = ({ label, count, active = false }) => (
  <div className="flex-1 border-r border-[#e5e5e5] dark:border-zinc-800 last:border-r-0 flex flex-col items-center justify-center gap-3 py-5 bg-white dark:bg-zinc-900/30">
    <span className={`font-season text-[32px] font-[420] leading-none ${active ? 'text-[#0412dd] dark:text-blue-400' : 'text-black dark:text-white'}`}>
      {count}
    </span>
    <span className="font-sans text-xs font-semibold text-[#9f9f9f] dark:text-zinc-500">{label}</span>
  </div>
);

interface FilaItemProps { icon: React.ReactNode; client: string; action: string; }
const FilaItem: React.FC<FilaItemProps> = ({ icon, client, action }) => (
  <div className="flex items-center justify-between px-6 border-b border-[#e5e5e5] dark:border-zinc-800 last:border-b-0 h-[50px] bg-white dark:bg-zinc-900/20">
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 flex items-center justify-center text-[#9f9f9f] dark:text-zinc-500">{icon}</div>
      <span className="font-sans text-xs font-semibold text-black dark:text-white">{client}</span>
    </div>
    <span className="font-sans text-xs font-normal text-[#9f9f9f] dark:text-zinc-500">{action}</span>
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
    <div style={{ flex }} className="px-6">
      <span className={`font-sans text-xs ${isPriority ? `font-semibold ${colorClass}` : 'font-medium text-black dark:text-zinc-200'}`}>
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

interface AsteryskoHomeViewProps { userName?: string; }

const AsteryskoHomeView: React.FC<AsteryskoHomeViewProps> = ({ userName = 'Levy' }) => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/asterysko/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const metrics = stats?.metrics || {};
  const pendingTasks = stats?.pendingTasks || [];

  const kpis = [
    { label: 'Processos ativos', value: metrics.activeProcesses ?? 5, sub: '+2% vs mês anterior' },
    { label: 'Prazos críticos', value: metrics.urgentCount ?? 0, sub: 'Sem prazos críticos' },
    { label: 'A receber', value: 'R$ 997,00', sub: '+5% vs mês anterior' },
    { label: 'Novos leads', value: 3, sub: '+1% vs mês anterior' },
  ];

  const funilSteps = [
    { label: 'Lead', count: metrics.activeProcesses ?? 5, active: true },
    { label: 'Viabilidade', count: 1 },
    { label: 'Contrato', count: 1 },
    { label: 'Protocolo', count: 1 },
    { label: 'Exame', count: 1 },
  ];

  const filaItems = [
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

  const tableRows: TableRowProps[] = pendingTasks.length > 0
    ? pendingTasks.slice(0, 3).map((t: any) => ({
        priority: t.priority || 'Alta',
        item: t.title || 'Pagamento INPI',
        responsible: t.assignee?.name || 'Levy Câmara',
        date: t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR') : '15/06/2026',
        nextStep: t.nextStep || 'Confirmar pagamento',
        client: t.client || 'Asterysko',
      }))
    : [
        { priority: 'Alta', item: 'Pagamento INPI', responsible: 'Levy Câmara', date: '15/06/2026', nextStep: 'Confirmar pagamento', client: 'Asterysko' },
        { priority: 'Alta', item: 'Pagamento INPI', responsible: 'Levy Câmara', date: '15/06/2026', nextStep: 'Confirmar pagamento', client: 'Asterysko' },
        { priority: 'Alta', item: 'Pagamento INPI', responsible: 'Levy Câmara', date: '15/06/2026', nextStep: 'Confirmar pagamento', client: 'Asterysko' },
      ];

  const tableCols = ['Prioridade', 'Item', 'Responsável', 'Prazo', 'Próximo passo', 'Cliente'];
  const colFlex =  [1, 2, 2, 1.5, 2, 1];

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-full overflow-y-auto font-sans transition-colors duration-300">

      {/* Header */}
      <div className="flex items-center justify-between px-7 h-[75px] border-b border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10 transition-colors duration-300">
        <span className="font-season text-[22px] font-[420] text-black dark:text-white">Olá, {userName}</span>
        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
          <Calendar size={18} />
          <span className="font-sans text-sm font-semibold text-black dark:text-zinc-300">{todayLabel()}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="flex border-t border-l border-[#e5e5e5] dark:border-zinc-800 transition-colors duration-300">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Funil + Fila */}
      <div className="flex flex-col lg:flex-row transition-colors duration-300">
        {/* Funil */}
        <div className="flex-1 border-r border-b border-[#e5e5e5] dark:border-zinc-800">
          <div className="px-6 py-5 border-b border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-950/20">
            <span className="font-sans text-sm font-medium text-black dark:text-zinc-300">Funil operacional</span>
          </div>
          <div className="flex h-[150px]">
            {funilSteps.map(s => <FunilStep key={s.label} {...s} />)}
          </div>
        </div>

        {/* Fila de ações */}
        <div className="flex-1 border-b border-[#e5e5e5] dark:border-zinc-800">
          <div className="px-6 py-5 border-b border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-950/20">
            <span className="font-sans text-sm font-medium text-black dark:text-zinc-300">Fila de ações</span>
          </div>
          <div className="flex flex-col">
            {filaItems.map(i => <FilaItem key={i.client} {...i} />)}
          </div>
        </div>
      </div>

      {/* Ações Pendentes */}
      <div className="border border-t-0 border-[#e5e5e5] dark:border-zinc-800 transition-colors duration-300">
        <div className="px-6 py-5 border-b border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-950/20">
          <span className="font-sans text-sm font-medium text-black dark:text-zinc-300">Ações pendentes</span>
        </div>

        {/* Table header */}
        <div className="flex items-center border-b border-[#e5e5e5] dark:border-zinc-800 h-[42px] bg-zinc-50 dark:bg-zinc-900/50">
          {tableCols.map((col, i) => (
            <div key={col} style={{ flex: colFlex[i] }} className="px-6">
              <span className="font-sans text-xs font-semibold text-zinc-500 dark:text-zinc-400">{col}</span>
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          {tableRows.map((row, i) => <TableRow key={i} {...row} />)}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 h-[70px] border-t border-[#e5e5e5] dark:border-zinc-800">
          <button className="flex items-center justify-center gap-2 text-[#0412dd] dark:text-blue-400 hover:opacity-85 transition-opacity py-2 px-4 rounded-lg">
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
