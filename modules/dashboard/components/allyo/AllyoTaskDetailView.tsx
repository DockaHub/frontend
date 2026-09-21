import React, { useState } from 'react';
import { ArrowLeft, CalendarDays, ChevronDown, ChevronUp, Clock3, Send } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ALLYO_BORDER, ALLYO_TASKS, FilterSelect, todayLabel } from './AllyoUI';
import { DeliveryWorkspace, deliverableCopy, getDeliverableKind, ManagedFile, VersionBundle } from './AllyoDeliveryWorkspaces';
import AllyoMultiDeliverableWorkspace from './AllyoMultiDeliverableWorkspace';

const statusOptions = ['Nova', 'Em andamento', 'Em revisão', 'Pronta para entrega', 'Entregue'];
const briefingByKind = {
    social: [
        { title: '1. Objetivo do criativo', items: ['Conversão: levar o público para uma demonstração', 'Comunicar proteção e resposta rápida com clareza'] },
        { title: '2. Especificações técnicas', items: ['Formato principal 1080 × 1350 px para feed', 'Área segura para texto e elementos de interface', 'Arquivo final em PNG e editável em PSD'] },
        { title: '3. Direção de conteúdo', items: ['Hierarquia clara entre título, produto e benefício', 'Evitar excesso de informação e garantir leitura no celular'] },
    ],
    landing: [
        { title: '1. Objetivo da página', items: ['Apresentar a solução e conduzir para uma demonstração', 'Priorizar leitura rápida, clareza e conversão'] },
        { title: '2. Estrutura', items: ['Hero, benefícios, como funciona e CTA final', 'Criar comportamento responsivo para desktop e mobile'] },
        { title: '3. Entrega', items: ['Preview completo em PNG ou PDF', 'Arquivo editável ou link do Figma dentro da mesma versão'] },
    ],
    presentation: [
        { title: '1. Objetivo da apresentação', items: ['Apoiar o discurso comercial com uma narrativa clara', 'Equilibrar dados, conteúdo e impacto visual'] },
        { title: '2. Estrutura', items: ['Oito slides no formato 16:9', 'Cada slide possui copy e orientação próprias'] },
        { title: '3. Entrega', items: ['PDF para aprovação do cliente', 'PPTX editável vinculado à mesma versão'] },
    ],
    storyboard: [
        { title: '1. Objetivo do storyboard', items: ['Validar narrativa, lettering, locução e direção visual', 'Organizar cada momento do filme antes da etapa de motion'] },
        { title: '2. Estrutura', items: ['Uma cena por bloco com frame, duração e orientações', 'Duração total estimada a partir de todas as cenas'] },
        { title: '3. Entrega', items: ['PDF gerado automaticamente pela Allyo', 'Arquivos de apoio são opcionais'] },
    ],
};
const sidebarFiles = {
    social: ['PNG', 'PSD'],
    landing: ['PNG', 'FIG'],
    presentation: ['PDF', 'PPTX'],
    storyboard: ['PDF', 'IMG'],
};
const AllyoTaskDetailView = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const task = ALLYO_TASKS.find((item) => item.id === searchParams.get('task')) || ALLYO_TASKS[0];
    const deliverableKind = getDeliverableKind(task);
    const requestCopy = deliverableCopy[deliverableKind];
    const briefing = briefingByKind[deliverableKind];
    const isMultiDeliverable = Boolean(task.deliverables && task.deliverables.length > 1);
    const [status, setStatus] = useState(task.status === 'Iniciar' ? 'Nova' : task.status === 'Concluída' ? 'Entregue' : task.status);
    const [descriptionOpen, setDescriptionOpen] = useState(true);
    const [orderOpen, setOrderOpen] = useState(true);
    const [brandKitOpen, setBrandKitOpen] = useState(false);
    const [deliveryVersion, setDeliveryVersion] = useState('Versão 1');
    const [filesByVersion, setFilesByVersion] = useState<Record<string, { approval: ManagedFile[]; source: ManagedFile[] }>>({
        'Versão 1': { approval: [], source: [] },
    });
    const [savedLabel, setSavedLabel] = useState('Alterações salvas automaticamente');
    const [readyDeliverables, setReadyDeliverables] = useState(0);
    const currentFiles = filesByVersion[deliveryVersion] || { approval: [], source: [] };

    const goBack = () => {
        setSearchParams((current) => {
            const next = new URLSearchParams(current);
            next.set('view', 'tasks');
            next.delete('task');
            return next;
        });
    };

    const updateStatus = (nextStatus: string) => {
        setStatus(nextStatus);
        setSavedLabel('Status atualizado agora');
    };

    const updateVersionFiles = (slot: 'approval' | 'source', files: ManagedFile[]) => {
        setFilesByVersion((current) => ({
            ...current,
            [deliveryVersion]: { ...(current[deliveryVersion] || { approval: [], source: [] }), [slot]: files },
        }));
        setSavedLabel(`${deliveryVersion} atualizada agora`);
    };

    return (
        <div className="h-full overflow-y-auto bg-white font-sans text-black dark:bg-zinc-950 dark:text-white">
            <header className={`sticky top-0 z-40 flex min-h-[75px] items-center justify-between gap-4 border-b bg-white/95 px-5 py-3 backdrop-blur-sm sm:px-[30px] dark:bg-zinc-950/95 ${ALLYO_BORDER}`}>
                <div className="flex min-w-0 items-center gap-3">
                    <button type="button" onClick={goBack} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] text-black transition hover:border-[#9db669] hover:text-[#739044] dark:border-zinc-700 dark:text-white" aria-label="Voltar para tarefas"><ArrowLeft size={16} /></button>
                    <div className="min-w-0">
                        <h1 className="truncate font-season text-[22px] font-normal leading-tight">{task.name}</h1>
                        <p className="mt-1 truncate text-[11px] font-medium text-[#a4a4a4] sm:text-sm">{task.client} • {task.category} • {requestCopy.type} • #{task.id}</p>
                    </div>
                </div>
                <div className="hidden shrink-0 items-center gap-[5px] text-sm font-semibold md:flex"><CalendarDays size={18} className="text-[#9f9f9f]" />{todayLabel()}</div>
            </header>

            <section className={`sticky top-[75px] z-30 flex flex-wrap items-center gap-x-6 gap-y-3 border-b bg-white/95 px-5 py-3 backdrop-blur-sm sm:px-[30px] dark:bg-zinc-950/95 ${ALLYO_BORDER}`}>
                <div className="flex items-center gap-[10px]"><span className="text-sm text-[#a4a4a4]">Status</span><FilterSelect label="Status" value={status} options={statusOptions} onChange={updateStatus} includeAll={false} /></div>
                <MetaItem label="Consumo" value="1 crédito" />
                <MetaItem label="Deadline" value={`${task.deadline}, ${task.time}`} icon={<Clock3 size={14} />} />
                <div className="flex items-center gap-[10px]"><span className="text-sm text-[#a4a4a4]">Equipe</span><span className="flex -space-x-2"><Avatar initials="MA" color="bg-[#9db669]" /><Avatar initials="LC" color="bg-[#2a2ad7]" /><Avatar initials="JA" color="bg-[#fd6b32]" /></span></div>
                <span className="ml-auto text-[11px] font-medium text-[#8f8f8f]" aria-live="polite">{savedLabel}</span>
            </section>

            <div className={`flex flex-wrap items-center gap-2 border-b px-5 py-4 text-sm text-[#a4a4a4] sm:px-[30px] ${ALLYO_BORDER}`}>
                {isMultiDeliverable ? <><span>Isso é uma solicitação com</span><Tag>{task.deliverables?.length} entregas</Tag><span>com aprovação individual</span><Tag>PNG ou PDF</Tag><span>e um único pacote final de</span><Tag>arquivos editáveis</Tag></> : <><span>Isso é uma solicitação para</span><Tag>{requestCopy.type}</Tag><span>com</span><Tag>{requestCopy.count}</Tag><span>para aprovação em</span><Tag>{requestCopy.approval}</Tag><span>e</span><Tag>{requestCopy.editable}</Tag><span>no</span><Tag>{requestCopy.software}</Tag></>}
            </div>

            <div className="grid min-w-0 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]">
                <main className={`min-w-0 border-r ${ALLYO_BORDER}`}>
                    <CollapsibleSection title="Descrição" open={descriptionOpen} onToggle={() => setDescriptionOpen((value) => !value)}>
                        <div className="space-y-5 text-sm leading-6 text-[#777] dark:text-zinc-400">
                            {briefing.map((block) => <BriefingBlock key={block.title} title={block.title} items={block.items} />)}
                            <BriefingBlock title="4. Identidade visual" items={['Usar paleta, tipografia e logos oficiais do cliente', 'Manter consistência com os materiais já aprovados']} />
                        </div>
                    </CollapsibleSection>

                    <button type="button" onClick={() => setOrderOpen((value) => !value)} className={`flex w-full items-center justify-between border-b px-5 py-5 text-left sm:px-[30px] ${ALLYO_BORDER}`}><h2 className="font-season text-lg font-normal">Visualização do pedido {isMultiDeliverable && <span className="text-[#888]">({task.deliverables?.length})</span>}</h2>{orderOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button>
                    {orderOpen && (isMultiDeliverable && task.deliverables
                        ? <AllyoMultiDeliverableWorkspace key={task.id} deliverables={task.deliverables} onProgressChange={setReadyDeliverables} />
                        : <DeliveryWorkspace kind={deliverableKind} />)}
                    {!isMultiDeliverable && <VersionBundle kind={deliverableKind} version={deliveryVersion} onVersionChange={setDeliveryVersion} approvalFiles={currentFiles.approval} sourceFiles={currentFiles.source} onApprovalFilesChange={(files) => updateVersionFiles('approval', files)} onSourceFilesChange={(files) => updateVersionFiles('source', files)} />}
                </main>

                <aside className="min-w-0 bg-[#fdfdfc] dark:bg-zinc-950">
                    <div className="sticky top-[139px]">
                        <div className={`border-b p-5 ${ALLYO_BORDER}`}>
                            <span className="text-[11px] font-bold uppercase tracking-[.08em] text-[#829454]">Próxima ação</span>
                            <h2 className="mt-2 font-season text-xl font-normal">{isMultiDeliverable ? 'Preparar pedidos para revisão' : requestCopy.next}</h2>
                            <p className="mt-2 text-[13px] leading-5 text-[#707070] dark:text-zinc-400">{isMultiDeliverable ? 'Anexe os arquivos finalizados em cada pedido. Somente os itens prontos serão enviados para revisão.' : requestCopy.helper}</p>
                            <button type="button" disabled={isMultiDeliverable && readyDeliverables === 0} onClick={() => { updateStatus('Em revisão'); if (isMultiDeliverable) setSavedLabel(`${readyDeliverables} ${readyDeliverables === 1 ? 'pedido enviado' : 'pedidos enviados'} para revisão agora`); }} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#131f15] px-4 py-3 text-[13px] font-semibold text-white transition hover:bg-[#283d2b] disabled:cursor-not-allowed disabled:opacity-40"><Send size={15} /> {isMultiDeliverable ? readyDeliverables > 0 ? `Enviar ${readyDeliverables} ${readyDeliverables === 1 ? 'pedido' : 'pedidos'} para revisão` : 'Nenhum pedido pronto' : 'Enviar para revisão'}</button>
                        </div>
                        <SideRow label="Referências de tarefas"><Tag>#123456</Tag><Tag>#123982</Tag></SideRow>
                        <SideRow label="Arquivos para tarefa">{sidebarFiles[deliverableKind].map((file) => <FileBadge key={file} label={file} />)}</SideRow>
                        <button type="button" onClick={() => setBrandKitOpen((value) => !value)} className={`flex w-full items-center justify-between border-b p-5 text-left ${ALLYO_BORDER}`}><span className="font-season text-base">Brand Kit</span>{brandKitOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button>
                        {brandKitOpen && <div className={`border-b px-5 py-4 text-xs leading-5 text-[#7f7f7f] dark:text-zinc-400 ${ALLYO_BORDER}`}><p>Logo principal e negativo</p><p>Paleta: verde, grafite e branco</p><p>Tipografia: Plus Jakarta Sans</p></div>}
                    </div>
                </aside>
            </div>
        </div>
    );
};

const MetaItem = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => <div className="flex items-center gap-[10px] text-sm"><span className="text-[#a4a4a4]">{label}</span><strong className="flex items-center gap-1.5 font-medium text-black dark:text-white">{icon}{value}</strong></div>;
const Avatar = ({ initials, color }: { initials: string; color: string }) => <span className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[8px] font-bold text-white dark:border-zinc-950 ${color}`}>{initials}</span>;
const Tag = ({ children }: { children: React.ReactNode }) => <span className="inline-flex rounded-[5px] border border-[#c2c2c2] bg-white px-2 py-1.5 text-[11px] font-medium leading-none text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">{children}</span>;

const CollapsibleSection = ({ title, icon, open, onToggle, children }: { title: string; icon?: React.ReactNode; open: boolean; onToggle: () => void; children: React.ReactNode }) => (
    <section className={`border-b ${ALLYO_BORDER}`}>
        <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 px-5 py-5 text-left sm:px-[30px]"><span className="flex items-center gap-[10px] font-season text-lg font-normal">{icon}{title}</span>{open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button>
        {open && <div className="px-5 pb-6 sm:px-[30px]">{children}</div>}
    </section>
);

const BriefingBlock = ({ title, items }: { title: string; items: string[] }) => <div><h3 className="font-semibold text-black dark:text-zinc-200">{title}</h3><ul className="mt-1 list-disc pl-5">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;

const SideRow = ({ label, children }: { label: string; children: React.ReactNode }) => <div className={`flex items-center justify-between gap-4 border-b p-5 ${ALLYO_BORDER}`}><span className="text-[13px] text-[#8f8f8f]">{label}</span><span className="flex items-center gap-1.5">{children}</span></div>;
const FileBadge = ({ label }: { label: string }) => <span className="flex h-9 min-w-9 items-center justify-center rounded-[5px] border border-[#c2c2c2] bg-white px-1.5 text-[11px] font-bold text-[#2a2ad7] dark:border-zinc-700 dark:bg-zinc-900">{label}</span>;

export default AllyoTaskDetailView;
