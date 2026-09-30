import React, { useRef, useState } from 'react';
import {
    ArrowDown,
    ArrowUp,
    CheckCircle2,
    Clock3,
    Copy,
    Download,
    FileText,
    Image as ImageIcon,
    LayoutTemplate,
    Loader2,
    Lock,
    MessageSquare,
    Monitor,
    Plus,
    Presentation,
    Smartphone,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import type { AllyoTask } from './AllyoUI';
import { ALLYO_BORDER, FilterSelect } from './AllyoUI';
import AllyoFileViewerModal, { type AllyoPreviewFile } from './AllyoFileViewerModal';
import { ALLYO_TASK_PRESENTATIONS, getAllyoTaskItemCount, getAllyoTaskPresentation, getAllyoTaskStructureItems, resolveAllyoTaskType, type AllyoTaskType } from './allyoTaskPresentation';

export type DeliverableKind = AllyoTaskType;

export interface ManagedFile {
    id: string;
    name: string;
    size: number;
    file?: File;
    fileUrl?: string;
    uploading?: boolean;
    progress?: number;
    error?: string;
}

export const getDeliverableKind = (task: AllyoTask): DeliverableKind => resolveAllyoTaskType(task);

export const deliverableCopy = Object.fromEntries(Object.entries(ALLYO_TASK_PRESENTATIONS).map(([key, definition]) => [key, {
    type: definition.label,
    count: `${definition.defaultCount} ${definition.itemLabel}${definition.defaultCount === 1 ? '' : 's'}`,
    approval: definition.approval,
    editable: definition.editable,
    software: definition.software,
    next: definition.creativeNext,
    helper: definition.creativeHelper,
}])) as Record<DeliverableKind, { type: string; count: string; approval: string; editable: string; software: string; next: string; helper: string }>;

export const DeliveryWorkspace = ({ kind, task, itemCountOverride, approvalLabel, sourceLabel }: { kind: DeliverableKind; task: AllyoTask; itemCountOverride?: number; approvalLabel?: string; sourceLabel?: string }) => {
    if (kind === 'carousel') return <CarouselWorkspace task={task} itemCountOverride={itemCountOverride} />;
    return <StructuredWorkspace task={task} itemCountOverride={itemCountOverride} approvalLabel={approvalLabel} sourceLabel={sourceLabel} />;
};

const landingSections = [
    { id: '01', label: 'Hero', state: 'complete', eyebrow: 'Título', title: 'Transforme benefícios em experiências que aproximam', body: 'Uma página objetiva para apresentar a solução e conduzir o público até uma demonstração.', cta: 'Agende uma demonstração' },
    { id: '02', label: 'Benefícios', state: 'complete', eyebrow: 'Destaques', title: 'Tudo o que sua equipe precisa em um só lugar', body: 'Apresente três benefícios com leitura rápida, ícones simples e foco no impacto para o usuário.', cta: 'Conheça os benefícios' },
    { id: '03', label: 'Como funciona', state: 'comment', eyebrow: 'Passo a passo', title: 'Começar é mais simples do que parece', body: 'Explique o fluxo em três etapas: diagnóstico, configuração e acompanhamento.', cta: 'Entenda o processo' },
    { id: '04', label: 'CTA final', state: 'pending', eyebrow: 'Conversão', title: 'Pronto para dar o próximo passo?', body: 'Retome a proposta de valor e finalize com um CTA direto para o formulário.', cta: 'Falar com especialista' },
];

const LandingWorkspace = () => {
    const [active, setActive] = useState(0);
    const [device, setDevice] = useState<'Desktop' | 'Mobile'>('Desktop');
    const section = landingSections[active];

    return (
        <WorkspaceShell icon={<LayoutTemplate size={17} />} title="Landing page · 1440 px" subtitle="As seções organizam o conteúdo; a entrega continua sendo um único arquivo.">
            <StepNavigation items={landingSections} active={active} onChange={setActive} noun="Seção" />
            <div className={`grid overflow-hidden rounded-[14px] border ${ALLYO_BORDER} lg:grid-cols-[minmax(280px,.75fr)_minmax(420px,1.25fr)]`}>
                <div className={`p-5 sm:p-6 lg:border-r ${ALLYO_BORDER}`}>
                    <div className="flex items-center justify-between gap-3">
                        <div><span className="text-[11px] font-bold uppercase tracking-[.08em] text-[#9db669]">Seção {section.id}</span><h3 className="mt-1 font-season text-xl">{section.label}</h3></div>
                        <CompletionState state={section.state} />
                    </div>
                    <div className="mt-6 space-y-5 text-sm">
                        <ContentField label={section.eyebrow} value={section.title} />
                        <ContentField label="Texto de apoio" value={section.body} />
                        <ContentField label="CTA" value={section.cta} />
                    </div>
                    {section.state === 'comment' && <div className="mt-5 flex gap-2 rounded-[10px] bg-[#fff6ef] p-3 text-xs leading-5 text-[#9b572e] dark:bg-orange-500/10 dark:text-orange-300"><MessageSquare size={15} className="mt-0.5 shrink-0" /> Simplificar o título e trazer o benefício principal primeiro.</div>}
                </div>
                <div className="bg-[#f7f8f5] p-4 sm:p-6 dark:bg-zinc-900/60">
                    <div className="mb-4 flex justify-end gap-1 rounded-full">
                        {(['Desktop', 'Mobile'] as const).map((item) => <button key={item} type="button" onClick={() => setDevice(item)} className={`flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition ${device === item ? 'bg-[#131f15] text-white' : 'bg-white text-[#777] dark:bg-zinc-800'}`}>{item === 'Desktop' ? <Monitor size={14} /> : <Smartphone size={14} />}{item}</button>)}
                    </div>
                    <div className={`mx-auto overflow-hidden rounded-[12px] border border-[#dedede] bg-white shadow-sm transition-all dark:border-zinc-700 dark:bg-zinc-950 ${device === 'Mobile' ? 'max-w-[250px]' : 'max-w-full'}`}>
                        <div className="flex h-8 items-center gap-1.5 border-b border-[#eeeeee] px-3 dark:border-zinc-800"><i className="h-1.5 w-1.5 rounded-full bg-[#ff7d6e]" /><i className="h-1.5 w-1.5 rounded-full bg-[#ffc45c]" /><i className="h-1.5 w-1.5 rounded-full bg-[#78c987]" /></div>
                        <div className={`grid min-h-[330px] items-center gap-5 p-7 ${device === 'Desktop' ? 'grid-cols-[1fr_.85fr]' : 'grid-cols-1'}`}>
                            <div><span className="text-[11px] font-bold uppercase tracking-[.12em] text-[#9db669]">{section.eyebrow}</span><h4 className="mt-3 font-season text-[clamp(22px,2.3vw,34px)] leading-[1.05]">{section.title}</h4><p className="mt-4 text-xs leading-5 text-[#777]">{section.body}</p><span className="mt-5 inline-flex rounded-full bg-[#131f15] px-4 py-2.5 text-[11px] font-semibold text-white">{section.cta}</span></div>
                            <div className="flex aspect-[4/3] items-center justify-center rounded-[10px] bg-gradient-to-br from-[#dce9c3] via-[#f4f6e8] to-[#cfd6ff]"><ImageIcon size={28} className="text-[#839065]" /></div>
                        </div>
                    </div>
                </div>
            </div>
        </WorkspaceShell>
    );
};

const presentationSlides = [
    { id: '01', label: 'Capa', state: 'complete', title: 'Uma nova forma de aproximar pessoas e marcas', body: 'Apresentação comercial · 2026', comments: 0 },
    { id: '02', label: 'Cenário', state: 'complete', title: 'O contexto está mudando rapidamente', body: 'Apresentar os principais movimentos de mercado e o desafio atual.', comments: 0 },
    { id: '03', label: 'Problema', state: 'comment', title: 'Mais canais não significam mais conexão', body: 'Evidenciar a fragmentação da jornada e os impactos para o negócio.', comments: 2 },
    { id: '04', label: 'Solução', state: 'complete', title: 'Uma operação criativa conectada de ponta a ponta', body: 'Introduzir a solução e seus diferenciais centrais.', comments: 0 },
    { id: '05', label: 'Produto', state: 'pending', title: 'Como a plataforma funciona', body: 'Demonstração visual dos módulos e do fluxo principal.', comments: 0 },
    { id: '06', label: 'Benefícios', state: 'pending', title: 'Impacto que pode ser medido', body: 'Velocidade, consistência e eficiência operacional.', comments: 0 },
    { id: '07', label: 'Cases', state: 'pending', title: 'Resultados construídos em conjunto', body: 'Inserir cases e indicadores aprovados.', comments: 0 },
    { id: '08', label: 'Próximo passo', state: 'pending', title: 'Vamos construir o próximo capítulo?', body: 'CTA para reunião de diagnóstico.', comments: 0 },
];

const PresentationWorkspace = () => {
    const [active, setActive] = useState(2);
    const slide = presentationSlides[active];

    return (
        <WorkspaceShell icon={<Presentation size={17} />} title="Apresentação comercial · 16:9" subtitle="Comentários ficam ligados aos slides; PDF e PowerPoint são enviados apenas uma vez por versão.">
            <div className={`grid overflow-hidden rounded-[14px] border ${ALLYO_BORDER} lg:grid-cols-[220px_minmax(0,1fr)]`}>
                <nav className={`max-h-[590px] overflow-y-auto border-b p-2 lg:border-b-0 lg:border-r ${ALLYO_BORDER}`} aria-label="Slides da apresentação">
                    <div className="flex gap-2 overflow-x-auto lg:block lg:space-y-1">
                        {presentationSlides.map((item, index) => <button key={item.id} type="button" onClick={() => setActive(index)} className={`flex min-w-[185px] items-center gap-3 rounded-[10px] px-3 py-3 text-left transition lg:w-full ${active === index ? 'bg-[#f0f5e7] dark:bg-[#d0f08e]/10' : 'hover:bg-[#f7f7f5] dark:hover:bg-zinc-900'}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] border text-xs font-bold ${active === index ? 'border-[#9db669] bg-white text-[#739044] dark:bg-zinc-950' : 'border-[#e5e5e5] text-[#999] dark:border-zinc-700'}`}>{item.id}</span><span className="min-w-0 flex-1"><strong className="block truncate text-[13px] font-semibold">{item.label}</strong><span className="mt-1 flex items-center gap-1.5 text-[11px] text-[#888]">{item.comments > 0 ? <><MessageSquare size={12} />{item.comments} comentários</> : item.state === 'complete' ? 'Completo' : 'Pendente'}</span></span><StateDot state={item.state} /></button>)}
                    </div>
                </nav>
                <div className="min-w-0 p-4 sm:p-6">
                    <div className="aspect-video overflow-hidden rounded-[12px] border border-[#dedede] bg-[#172019] p-[7%] text-white shadow-sm dark:border-zinc-700">
                        <div className="flex h-full flex-col justify-between">
                            <div className="flex justify-between text-[11px] font-semibold uppercase tracking-[.12em] text-[#d0f08e]"><span>ALLYO</span><span>{slide.id} / 08</span></div>
                            <div className="max-w-[78%]"><h3 className="font-season text-[clamp(22px,3.4vw,48px)] leading-[1.02]">{slide.title}</h3><p className="mt-4 max-w-[80%] text-[clamp(8px,1vw,13px)] leading-relaxed text-white/65">{slide.body}</p></div>
                            <div className="h-1 w-16 rounded-full bg-[#d0f08e]" />
                        </div>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2"><ContentField label="Título do slide" value={slide.title} /><ContentField label="Orientação de conteúdo" value={slide.body} /></div>
                    {slide.comments > 0 && <div className="mt-4 rounded-[10px] border border-[#f0d6c3] bg-[#fff8f3] p-4 text-[13px] text-[#9b572e] dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300"><strong>{slide.comments} comentários neste slide</strong><p className="mt-1 leading-5">Dar mais contraste ao dado principal e reduzir a quantidade de texto.</p></div>}
                </div>
            </div>
        </WorkspaceShell>
    );
};

interface StoryboardScene {
    id: string;
    title: string;
    duration: string;
    locution: string;
    lettering: string;
    action: string;
    notes: string;
    preview?: string;
}

const initialScenes: StoryboardScene[] = [
    { id: '1', title: 'Abertura', duration: '06s', locution: 'Todos os dias, empresas enfrentam o desafio de conectar pessoas e resultados.', lettering: 'Pessoas. Processos. Resultados.', action: 'Montagem rápida com profissionais em diferentes rotinas de trabalho.', notes: 'Ritmo dinâmico. Usar cortes secos acompanhando a trilha.' },
    { id: '2', title: 'O desafio', duration: '08s', locution: 'Enquanto o trabalho muda, a comunicação precisa acompanhar esse movimento.', lettering: 'O trabalho mudou.', action: 'Personagem diante do computador; elementos gráficos surgem ao redor.', notes: 'Movimento sutil de câmera e entrada lateral dos cards.' },
    { id: '3', title: 'A solução', duration: '10s', locution: 'Com a plataforma, todas as etapas ficam conectadas em um único fluxo.', lettering: 'Tudo conectado.', action: 'Interface do produto assume o centro e os módulos se conectam.', notes: 'Usar gravação do produto fornecida nas referências.' },
    { id: '4', title: 'Encerramento', duration: '05s', locution: 'Simplifique o trabalho e amplie o impacto.', lettering: 'Vamos juntos?', action: 'Logo, assinatura e CTA centralizados.', notes: 'Finalizar com dois segundos de respiro para leitura.' },
];

const StoryboardWorkspace = () => {
    const [scenes, setScenes] = useState(initialScenes);
    const [active, setActive] = useState(0);
    const bulkInput = useRef<HTMLInputElement>(null);
    const frameInput = useRef<HTMLInputElement>(null);
    const scene = scenes[active];

    const updateScene = (key: keyof StoryboardScene, value: string) => setScenes((current) => current.map((item, index) => index === active ? { ...item, [key]: value } : item));
    const addScene = () => {
        const next = { id: String(scenes.length + 1), title: `Nova cena`, duration: '05s', locution: '', lettering: '', action: '', notes: '' };
        setScenes((current) => [...current, next]);
        setActive(scenes.length);
    };
    const duplicateScene = () => {
        const duplicate = { ...scene, id: String(Date.now()), title: `${scene.title} (cópia)` };
        setScenes((current) => [...current.slice(0, active + 1), duplicate, ...current.slice(active + 1)]);
        setActive(active + 1);
    };
    const removeScene = () => {
        if (scenes.length === 1) return;
        setScenes((current) => current.filter((_, index) => index !== active));
        setActive(Math.max(0, active - 1));
    };
    const moveScene = (direction: -1 | 1) => {
        const target = active + direction;
        if (target < 0 || target >= scenes.length) return;
        setScenes((current) => {
            const next = [...current];
            [next[active], next[target]] = [next[target], next[active]];
            return next;
        });
        setActive(target);
    };
    const addFrames = (files: FileList | null, replaceCurrent = false) => {
        if (!files?.length) return;
        const incoming = Array.from(files);
        if (replaceCurrent) {
            updateScene('preview', URL.createObjectURL(incoming[0]));
            return;
        }
        const created = incoming.map((file, index) => ({ id: `${Date.now()}-${index}`, title: file.name.replace(/\.[^.]+$/, ''), duration: '05s', locution: '', lettering: '', action: '', notes: '', preview: URL.createObjectURL(file) }));
        setScenes((current) => [...current, ...created]);
        setActive(scenes.length);
    };
    const generatePdf = () => {
        const pages = scenes.map((item, index) => `<section><header>Cena ${index + 1} · ${escapeHtml(item.title)} <small>${escapeHtml(item.duration)}</small></header>${item.preview ? `<img src="${item.preview}" alt="Cena ${index + 1}">` : '<div class="placeholder">Frame da cena</div>'}<div class="grid"><p><b>Locução</b>${escapeHtml(item.locution) || '—'}</p><p><b>Lettering</b>${escapeHtml(item.lettering) || '—'}</p><p><b>Ação e movimento</b>${escapeHtml(item.action) || '—'}</p><p><b>Observações</b>${escapeHtml(item.notes) || '—'}</p></div></section>`).join('');
        const html = `<!doctype html><html><head><title>Storyboard Allyo</title><style>body{font-family:Arial,sans-serif;color:#171717;margin:32px}h1{font-size:24px}section{page-break-inside:avoid;margin:28px 0;border:1px solid #ddd;border-radius:12px;overflow:hidden}header{padding:14px 18px;background:#172019;color:#fff;font-weight:bold}small{float:right;color:#d0f08e}img,.placeholder{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:#f2f3ef}.placeholder{display:grid;place-items:center;color:#999}.grid{display:grid;grid-template-columns:1fr 1fr}.grid p{min-height:80px;margin:0;padding:16px;border-top:1px solid #ddd}.grid p:nth-child(odd){border-right:1px solid #ddd}b{display:block;font-size:11px;text-transform:uppercase;color:#888;margin-bottom:8px}@media print{body{margin:12mm}section{page-break-inside:avoid}}</style></head><body><h1>Storyboard · ${scenes.length} cenas</h1>${pages}</body></html>`;
        const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
        const preview = window.open(url, '_blank');
        if (preview) preview.onload = () => { preview.focus(); preview.print(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
    };

    return (
        <WorkspaceShell icon={<ImageIcon size={17} />} title="Storyboard · 1920 × 1080 px" subtitle="Monte as cenas na Allyo e gere o documento de aprovação sem precisar passar pelo PowerPoint.">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs text-[#777]"><span className="flex items-center gap-1.5"><Clock3 size={14} /> {sumDuration(scenes)} estimados</span><span>{scenes.length} cenas</span></div>
                <div className="flex flex-wrap gap-2"><button type="button" onClick={() => bulkInput.current?.click()} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#dedede] bg-white px-4 py-2 text-xs font-semibold transition hover:border-[#9db669] dark:border-zinc-700 dark:bg-zinc-900"><Upload size={14} /> Importar frames</button><input ref={bulkInput} type="file" multiple accept="image/*" className="hidden" onChange={(event) => { addFrames(event.target.files); event.target.value = ''; }} /><button type="button" onClick={addScene} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#dedede] bg-white px-4 py-2 text-xs font-semibold transition hover:border-[#9db669] dark:border-zinc-700 dark:bg-zinc-900"><Plus size={14} /> Nova cena</button><button type="button" onClick={generatePdf} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#131f15] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#283d2b]"><Download size={14} /> Gerar PDF</button></div>
            </div>
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                {scenes.map((item, index) => <button key={item.id} type="button" onClick={() => setActive(index)} className={`min-w-[150px] rounded-[10px] border p-3 text-left transition ${index === active ? 'border-[#9db669] bg-[#f4f7ed] shadow-[0_0_0_2px_rgba(157,182,105,.12)] dark:bg-[#d0f08e]/10' : 'border-[#e5e5e5] hover:border-[#bdc9a4] dark:border-zinc-700'}`}><span className="flex items-center justify-between text-[11px] text-[#888]"><b>CENA {index + 1}</b><span>{item.duration}</span></span><span className="mt-2 block truncate text-[13px] font-semibold">{item.title}</span></button>)}
            </div>
            <div className={`grid overflow-hidden rounded-[14px] border ${ALLYO_BORDER} xl:grid-cols-[minmax(360px,1fr)_minmax(320px,.85fr)]`}>
                <div className={`bg-[#f6f7f3] p-4 sm:p-6 xl:border-r ${ALLYO_BORDER} dark:bg-zinc-900/50`}>
                    <div className="mb-3 flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-[.08em] text-[#777]">Frame da cena {active + 1}</span><div className="flex gap-1"><IconAction label="Mover para cima" onClick={() => moveScene(-1)} disabled={active === 0}><ArrowUp size={14} /></IconAction><IconAction label="Mover para baixo" onClick={() => moveScene(1)} disabled={active === scenes.length - 1}><ArrowDown size={14} /></IconAction><IconAction label="Duplicar cena" onClick={duplicateScene}><Copy size={14} /></IconAction><IconAction label="Excluir cena" onClick={removeScene} disabled={scenes.length === 1}><Trash2 size={14} /></IconAction></div></div>
                    <button type="button" onClick={() => frameInput.current?.click()} className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-[12px] border border-dashed border-[#bcc8a3] bg-white transition hover:border-[#8ca05f] dark:bg-zinc-950">{scene.preview ? <img src={scene.preview} alt={`Frame da cena ${active + 1}`} className="h-full w-full object-cover" /> : <span className="flex flex-col items-center gap-2 text-[13px] font-semibold text-[#7e8d60]"><ImageIcon size={27} /><span>Adicionar frame da cena</span><small className="text-xs font-normal text-[#888]">PNG ou JPG</small></span>}<span className="absolute inset-x-3 bottom-3 translate-y-2 rounded-full bg-black/70 px-3 py-2.5 text-[11px] font-semibold text-white opacity-0 backdrop-blur transition group-hover:translate-y-0 group-hover:opacity-100">Clique para substituir o frame</span></button>
                    <input ref={frameInput} type="file" accept="image/*" className="hidden" onChange={(event) => { addFrames(event.target.files, true); event.target.value = ''; }} />
                </div>
                <div className="space-y-4 p-4 sm:p-6">
                    <EditableField label="Nome da cena" value={scene.title} onChange={(value) => updateScene('title', value)} compact />
                    <EditableField label="Duração" value={scene.duration} onChange={(value) => updateScene('duration', value)} compact />
                    <EditableField label="Locução" value={scene.locution} onChange={(value) => updateScene('locution', value)} />
                    <EditableField label="Lettering" value={scene.lettering} onChange={(value) => updateScene('lettering', value)} />
                    <EditableField label="Ação e movimento" value={scene.action} onChange={(value) => updateScene('action', value)} />
                    <EditableField label="Observações" value={scene.notes} onChange={(value) => updateScene('notes', value)} />
                </div>
            </div>
        </WorkspaceShell>
    );
};

const taskItems = (task: AllyoTask, itemCountOverride?: number) => {
    return getAllyoTaskStructureItems(task, getAllyoTaskPresentation(task), itemCountOverride).map((item) => ({
        ...item,
        description: item.description === 'Conforme briefing' && task.briefing?.formats?.length
            ? task.briefing.formats.join(' · ')
            : item.description,
    }));
};

const CarouselWorkspace = ({ task, itemCountOverride }: { task: AllyoTask; itemCountOverride?: number }) => {
    const items = taskItems(task, itemCountOverride);
    const cards = items.length > 0 ? items : [{ id: 'card-1', title: 'Card principal', description: 'Conteúdo definido no briefing' }];
    return (
        <WorkspaceShell icon={<LayoutTemplate size={17} />} title={`Carrossel · ${cards.length} ${cards.length === 1 ? 'card' : 'cards'}`} subtitle="A sequência, a continuidade visual e o CTA são revisados como uma única entrega.">
            <div className="flex gap-3 overflow-x-auto pb-2">
                {cards.map((card, index) => <article key={card.id} className={`min-w-[210px] max-w-[240px] flex-1 overflow-hidden rounded-[12px] border bg-white dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex aspect-[4/5] flex-col justify-between bg-gradient-to-br from-[#eef3e4] via-white to-[#e6e9ff] p-5 dark:from-zinc-900 dark:via-zinc-950 dark:to-[#283024]"><span className="text-[10px] font-bold uppercase tracking-[.1em] text-[#7c8f56]">Card {String(index + 1).padStart(2, '0')}</span><div><strong className="block font-season text-xl leading-tight">{card.title}</strong><p className="mt-2 text-xs leading-5 text-[#747b72] dark:text-zinc-400">{card.description}</p></div><span className="h-1 w-10 rounded-full bg-[#9db669]" /></div></article>)}
            </div>
        </WorkspaceShell>
    );
};

const StructuredWorkspace = ({ task, itemCountOverride, approvalLabel, sourceLabel }: { task: AllyoTask; itemCountOverride?: number; approvalLabel?: string; sourceLabel?: string }) => {
    const definition = getAllyoTaskPresentation(task);
    const items = taskItems(task, itemCountOverride);
    const count = getAllyoTaskItemCount(task, definition, itemCountOverride);
    return (
        <WorkspaceShell icon={<FileText size={17} />} title={`${definition.label} · ${count} ${definition.itemLabel}${count === 1 ? '' : 's'}`} subtitle={definition.creativeHelper}>
            <div className={`grid overflow-hidden rounded-[14px] border lg:grid-cols-[minmax(0,1fr)_300px] ${ALLYO_BORDER}`}>
                <div className="p-5 sm:p-6">
                    <span className="text-[10px] font-bold uppercase tracking-[.08em] text-[#829454]">Estrutura da entrega</span>
                    <div className="mt-4 space-y-2">
                        {(items.length > 0 ? items : [{ id: 'single', title: task.name, description: task.briefing?.objective || 'Siga as orientações do briefing.' }]).map((item, index) => <div key={item.id} className={`flex items-start gap-3 rounded-[10px] border p-3 ${ALLYO_BORDER}`}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[#eef3e4] text-[11px] font-bold text-[#71854e] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]">{index + 1}</span><span><strong className="block text-xs font-semibold">{item.title}</strong><small className="mt-1 block text-[11px] leading-4 text-[#858b84]">{item.description}</small></span></div>)}
                    </div>
                </div>
                <aside className={`border-t bg-[#fafbf8] lg:border-l lg:border-t-0 dark:bg-zinc-900/50 ${ALLYO_BORDER}`}><Specification label="Aprovação" value={approvalLabel || definition.approval} /><Specification label="Editável" value={sourceLabel || definition.editable} /><Specification label="Software" value={sourceLabel || definition.software} last /></aside>
            </div>
        </WorkspaceShell>
    );
};

const SocialWorkspace = () => (
    <WorkspaceShell icon={<ImageIcon size={17} />} title="Post para Instagram · 1080 × 1350 px" subtitle="Conteúdo e especificações da peça selecionada.">
        <div className={`grid overflow-hidden rounded-[14px] border ${ALLYO_BORDER} lg:grid-cols-[1.25fr_.75fr]`}>
            <div className={`p-5 sm:p-6 lg:border-r ${ALLYO_BORDER}`}><h3 className="font-season text-lg">Copy do criativo</h3><div className="mt-5 space-y-3 text-sm leading-5 text-[#858585]"><p><strong className="text-black dark:text-zinc-200">Tema:</strong> Ver mais é bom. Ter resposta é melhor.</p><p><strong className="text-black dark:text-zinc-200">Título:</strong><br />Não é só ver. É poder agir.</p><p><strong className="text-black dark:text-zinc-200">Visual:</strong><br />Câmera em destaque em um ambiente residencial real, com clima de rotina e proteção.</p><p><strong className="text-black dark:text-zinc-200">Copy de apoio:</strong><br />Acompanhe o ambiente com um sistema conectado à Central de Monitoramento 24h.</p></div></div>
            <div><Specification label="Dimensões" value="1080 × 1350" /><Specification label="Software" value="Photoshop" /><Specification label="Extensão" value="PNG" last /></div>
        </div>
    </WorkspaceShell>
);

export const VersionBundle = ({
    kind,
    version,
    onVersionChange,
    versionOptions,
    approvalFiles,
    sourceFiles,
    onApprovalFilesChange,
    onSourceFilesChange,
    onUploadApprovalFile,
    onUploadSourceFile,
    disabled = false,
    disabledReason,
    expectedApprovalFiles = 1,
    approvalAcceptOverride,
    sourceAcceptOverride,
    approvalDescriptionOverride,
    sourceDescriptionOverride,
    sourceRequired = true,
    allowSourceLink = false,
}: {
    kind: DeliverableKind;
    version: string;
    onVersionChange: (value: string) => void;
    versionOptions?: string[];
    approvalFiles: ManagedFile[];
    sourceFiles: ManagedFile[];
    onApprovalFilesChange: (files: ManagedFile[]) => void;
    onSourceFilesChange: (files: ManagedFile[]) => void;
    onUploadApprovalFile?: (file: File, onProgress?: (percent: number) => void) => Promise<{ fileUrl: string; name: string; size: number }>;
    onUploadSourceFile?: (file: File, onProgress?: (percent: number) => void) => Promise<{ fileUrl: string; name: string; size: number }>;
    disabled?: boolean;
    disabledReason?: string;
    expectedApprovalFiles?: number;
    approvalAcceptOverride?: string;
    sourceAcceptOverride?: string;
    approvalDescriptionOverride?: string;
    sourceDescriptionOverride?: string;
    sourceRequired?: boolean;
    allowSourceLink?: boolean;
}) => {
    const definition = ALLYO_TASK_PRESENTATIONS[kind] || ALLYO_TASK_PRESENTATIONS.generic;
    const approvalAccept = approvalAcceptOverride || definition.approvalAccept;
    const sourceAccept = sourceAcceptOverride || definition.sourceAccept;
    const displayedOptions = Array.isArray(versionOptions) && versionOptions.length > 0 ? versionOptions : [version || 'Versão 1'];
    const safeCopy = deliverableCopy[kind] || deliverableCopy.social;
    const isOrderedSequence = kind === 'carousel' && expectedApprovalFiles > 1;
    const approvalDescription = isOrderedSequence
        ? `Envie ${expectedApprovalFiles} imagens na ordem dos cards ou um único PDF com ${expectedApprovalFiles} páginas`
        : approvalDescriptionOverride || `Material que o cliente irá visualizar · ${safeCopy?.approval || definition.approval}`;
    return (
        <section className={`border-b ${ALLYO_BORDER}`}>
            <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-5 sm:px-[30px] ${ALLYO_BORDER}`}>
                <div>
                    <span className="text-[11px] font-bold uppercase tracking-[.08em] text-[#9db669]">Pacote de entrega</span>
                    <h2 className="mt-1 font-season text-lg">Arquivos da versão</h2>
                </div>
                <div className="flex items-center gap-2">
                    <FilterSelect label="Versão" value={version} options={displayedOptions} onChange={onVersionChange} includeAll={false} />
                </div>
            </div>
            {disabled && (
                <div className="border-b border-amber-200/60 bg-amber-50/70 px-5 py-2.5 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300 flex items-center gap-2 sm:px-[30px]">
                    <Lock size={13} className="shrink-0" />
                    <span>{disabledReason || 'O envio de arquivos fica liberado apenas quando a tarefa estiver com o status "Em andamento".'}</span>
                </div>
            )}
            <div className="grid gap-4 p-5 sm:p-[30px] lg:grid-cols-2">
                <FileSlot
                    icon={<CheckCircle2 size={17} />}
                    title="Arquivo para aprovação"
                    description={approvalDescription}
                    files={approvalFiles}
                    onFilesChange={onApprovalFilesChange}
                    accept={approvalAccept}
                    onUploadFile={onUploadApprovalFile}
                    disabled={disabled}
                    disabledReason={disabledReason}
                    ordered={isOrderedSequence}
                    expectedCount={isOrderedSequence ? expectedApprovalFiles : undefined}
                />
                <FileSlot
                    icon={<FileText size={17} />}
                    title="Arquivo aberto e editável"
                    description={sourceDescriptionOverride || `${sourceRequired ? 'Fonte de trabalho obrigatória' : 'Fonte de trabalho opcional'} · ${safeCopy?.software || 'Photoshop'}`}
                    files={sourceFiles}
                    onFilesChange={onSourceFilesChange}
                    accept={sourceAccept}
                    onUploadFile={onUploadSourceFile}
                    disabled={disabled}
                    disabledReason={disabledReason}
                    optional={!sourceRequired}
                    allowExternalUrl={allowSourceLink}
                />
            </div>
        </section>
    );
};

const WorkspaceShell = ({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) => <section className={`border-b ${ALLYO_BORDER}`}><div className="px-5 py-6 sm:px-[30px]"><div className="mb-6 flex items-start gap-3"><span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef3e4] text-[#798d50] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]">{icon}</span><div><h2 className="font-season text-xl">{title}</h2><p className="mt-1.5 text-[13px] leading-5 text-[#7f7f7f]">{subtitle}</p></div></div>{children}</div></section>;

const StepNavigation = ({ items, active, onChange, noun }: { items: typeof landingSections; active: number; onChange: (index: number) => void; noun: string }) => <div className="mb-4 flex gap-2 overflow-x-auto pb-1">{items.map((item, index) => <button key={item.id} type="button" onClick={() => onChange(index)} className={`flex min-w-[155px] items-center gap-3 rounded-[10px] border px-3 py-3 text-left transition ${index === active ? 'border-[#9db669] bg-[#f4f7ed] dark:bg-[#d0f08e]/10' : 'border-[#e5e5e5] hover:border-[#bdc9a4] dark:border-zinc-700'}`}><span className={`flex h-8 w-8 items-center justify-center rounded-[7px] text-xs font-bold ${index === active ? 'bg-[#9db669] text-white' : 'bg-[#f4f4f2] text-[#999] dark:bg-zinc-800'}`}>{item.id}</span><span className="min-w-0"><small className="block text-[11px] uppercase text-[#888]">{noun}</small><strong className="block truncate text-[13px]">{item.label}</strong></span><StateDot state={item.state} /></button>)}</div>;
const StateDot = ({ state }: { state: string }) => <span className={`ml-auto h-2 w-2 shrink-0 rounded-full ${state === 'complete' ? 'bg-emerald-500' : state === 'comment' ? 'bg-[#fd6b32]' : 'bg-[#d5d5d5] dark:bg-zinc-700'}`} />;
const CompletionState = ({ state }: { state: string }) => <span className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${state === 'complete' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : state === 'comment' ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300' : 'bg-[#f3f3f3] text-[#888] dark:bg-zinc-800'}`}>{state === 'complete' ? 'Completo' : state === 'comment' ? 'Com comentários' : 'Pendente'}</span>;
const ContentField = ({ label, value }: { label: string; value: string }) => <div><span className="text-[11px] font-bold uppercase tracking-[.06em] text-[#969696]">{label}</span><p className="mt-1.5 text-sm leading-6 text-[#555] dark:text-zinc-300">{value}</p></div>;
const Specification = ({ label, value, last = false }: { label: string; value: string; last?: boolean }) => <div className={`flex min-h-[74px] items-center justify-between gap-4 px-5 ${last ? '' : `border-b ${ALLYO_BORDER}`}`}><span className="text-[13px] text-[#8d8d8d]">{label}</span><strong className="text-[13px] font-medium">{value}</strong></div>;
const EditableField = ({ label, value, onChange, compact = false }: { label: string; value: string; onChange: (value: string) => void; compact?: boolean }) => <label className="block"><span className="mb-2 block text-[11px] font-bold uppercase tracking-[.06em] text-[#888]">{label}</span>{compact ? <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-[9px] border border-[#e2e2e2] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#9db669] focus:ring-2 focus:ring-[#9db669]/10 dark:border-zinc-700 dark:bg-zinc-900" /> : <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="w-full resize-none rounded-[9px] border border-[#e2e2e2] bg-white px-3.5 py-3 text-sm leading-6 outline-none transition focus:border-[#9db669] focus:ring-2 focus:ring-[#9db669]/10 dark:border-zinc-700 dark:bg-zinc-900" />}</label>;
const IconAction = ({ label, onClick, disabled = false, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) => <button type="button" onClick={onClick} disabled={disabled} title={label} aria-label={label} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#dedede] bg-white text-[#777] transition hover:border-[#9db669] hover:text-[#739044] disabled:cursor-not-allowed disabled:opacity-30 dark:border-zinc-700 dark:bg-zinc-900">{children}</button>;

export const FileSlot = ({
    icon,
    title,
    description,
    files,
    onFilesChange,
    accept,
    optional = false,
    onUploadFile,
    disabled = false,
    disabledReason,
    ordered = false,
    expectedCount,
    allowExternalUrl = false,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    files: ManagedFile[];
    onFilesChange: (files: ManagedFile[]) => void;
    accept: string;
    optional?: boolean;
    onUploadFile?: (file: File, onProgress?: (percent: number) => void) => Promise<{ fileUrl: string; name: string; size: number }>;
    disabled?: boolean;
    disabledReason?: string;
    ordered?: boolean;
    expectedCount?: number;
    allowExternalUrl?: boolean;
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewFile, setPreviewFile] = useState<AllyoPreviewFile | null>(null);
    const [externalUrl, setExternalUrl] = useState('');
    const [externalUrlError, setExternalUrlError] = useState('');
    const safeFiles = Array.isArray(files) ? files.filter(Boolean) : [];
    const isUploadingAny = safeFiles.some((f) => Boolean(f?.uploading));
    const hasSinglePdf = ordered && safeFiles.length === 1 && /\.pdf(?:$|[?#])/i.test(safeFiles[0].fileUrl || safeFiles[0].name);
    const hasExpectedImageSequence = ordered && Boolean(expectedCount) && safeFiles.length === expectedCount
        && safeFiles.every((file) => /\.(?:png|jpe?g)(?:$|[?#])/i.test(file.fileUrl || file.name));

    const moveFile = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= safeFiles.length) return;
        const next = [...safeFiles];
        [next[index], next[target]] = [next[target], next[index]];
        onFilesChange(next);
    };

    const addFiles = async (incoming: FileList | null) => {
        if (disabled) return;
        if (!incoming || incoming.length === 0) return;
        const incomingArray = Array.from(incoming);
        const decodeSafe = (str: string): string => {
            try { return decodeURIComponent(str); } catch { return str; }
        };
        const newEntries: ManagedFile[] = incomingArray.map((file) => ({
            id: `${file.name}-${file.lastModified}-${file.size}`,
            name: decodeSafe(file.name),
            size: file.size,
            file,
            uploading: Boolean(onUploadFile),
            progress: 0,
        }));

        let currentList = [...files.filter((file) => !newEntries.some((item) => item.id === file.id)), ...newEntries];
        onFilesChange(currentList);

        if (onUploadFile) {
            for (const file of incomingArray) {
                const targetId = `${file.name}-${file.lastModified}-${file.size}`;
                try {
                    const uploaded = await onUploadFile(file, (percent) => {
                        currentList = currentList.map((item) =>
                            item.id === targetId ? { ...item, progress: percent } : item
                        );
                        onFilesChange(currentList);
                    });
                    currentList = currentList.map((item) =>
                        item.id === targetId
                            ? { ...item, fileUrl: uploaded.fileUrl, uploading: false, progress: 100, error: undefined }
                            : item
                    );
                    onFilesChange(currentList);
                } catch (err: any) {
                    currentList = currentList.map((item) =>
                        item.id === targetId
                            ? { ...item, uploading: false, error: err?.response?.data?.message || err?.message || "Falha no upload" }
                            : item
                    );
                    onFilesChange(currentList);
                }
            }
        }
    };

    const addExternalUrl = () => {
        if (disabled) return;
        const value = externalUrl.trim();
        try {
            const parsed = new URL(value);
            if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('invalid');
            const id = `external-${value}`;
            if (!safeFiles.some((file) => file.id === id)) {
                onFilesChange([...safeFiles, { id, name: parsed.hostname, size: 0, fileUrl: value }]);
            }
            setExternalUrl('');
            setExternalUrlError('');
        } catch {
            setExternalUrlError('Cole um link válido iniciado por http:// ou https://.');
        }
    };

    return (
        <>
        <div className={`rounded-[14px] border p-5 ${ALLYO_BORDER}`}>
            <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1f4eb] text-[#81915f] dark:bg-[#d0f08e]/10">
                    {icon}
                </span>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{title}</h3>
                        {optional && <span className="text-[11px] font-semibold uppercase text-[#999]">Opcional</span>}
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-[#888]">{description}</p>
                </div>
            </div>
            <button
                type="button"
                disabled={disabled || isUploadingAny}
                onClick={() => {
                    if (!disabled) inputRef.current?.click();
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                    event.preventDefault();
                    if (!disabled && !isUploadingAny) void addFiles(event.dataTransfer.files);
                }}
                className={`mt-4 flex min-h-[84px] w-full items-center justify-center gap-2 rounded-[10px] border border-dashed px-3 text-xs font-semibold transition ${
                    disabled
                        ? 'border-zinc-200 bg-zinc-50/80 text-zinc-400 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-500'
                        : 'border-[#cdd4c0] text-[#72844d] hover:bg-[#fafcf6] disabled:cursor-wait disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900'
                }`}
            >
                {disabled ? (
                    <>
                        <Lock size={15} className="text-zinc-400 dark:text-zinc-500" />
                        <span>{disabledReason || 'Envio liberado apenas quando a tarefa estiver "Em andamento"'}</span>
                    </>
                ) : isUploadingAny ? (
                    <>
                        <Loader2 size={17} className="animate-spin text-[#9db669]" />
                        <span>Enviando anexo para a plataforma...</span>
                    </>
                ) : (
                    <>
                        <Upload size={17} />
                        <span>Arraste ou selecione seus arquivos</span>
                    </>
                )}
            </button>
            <input
                ref={inputRef}
                type="file"
                multiple
                accept={accept}
                className="hidden"
                onChange={(event) => {
                    if (!disabled) {
                        void addFiles(event.target.files);
                    }
                    event.target.value = "";
                }}
            />
            {allowExternalUrl && !disabled && (
                <div className="mt-3">
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={externalUrl}
                            onChange={(event) => { setExternalUrl(event.target.value); setExternalUrlError(''); }}
                            onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addExternalUrl(); } }}
                            placeholder="Ou cole o link editável do Canva, Figma ou Google Slides"
                            className="min-h-10 min-w-0 flex-1 rounded-[9px] border border-[#dedede] bg-white px-3 text-xs outline-none transition focus:border-[#9db669] dark:border-zinc-700 dark:bg-zinc-950"
                        />
                        <button type="button" onClick={addExternalUrl} className="rounded-[9px] border border-[#cdd4c0] px-3 text-xs font-semibold text-[#72844d] transition hover:bg-[#fafcf6] dark:border-zinc-700">
                            Adicionar link
                        </button>
                    </div>
                    {externalUrlError && <p className="mt-1.5 text-[11px] text-red-500">{externalUrlError}</p>}
                </div>
            )}
            {safeFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                    {ordered && expectedCount && (
                        <p className={`text-[11px] font-medium ${hasExpectedImageSequence || hasSinglePdf ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {hasSinglePdf
                                ? `PDF único selecionado · confira se ele contém ${expectedCount} páginas.`
                                : `${safeFiles.length} de ${expectedCount} imagens selecionadas. A ordem abaixo será a ordem do carrossel.`}
                        </p>
                    )}
                    {safeFiles.map((file, index) => (
                        <div key={file.id} className="relative overflow-hidden rounded-[9px] border border-zinc-200/80 bg-[#f7f8f5] px-3 py-2.5 text-xs transition dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex items-center gap-2">
                                {ordered && <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-white text-[10px] font-bold text-[#718746] shadow-sm dark:bg-zinc-950">{index + 1}</span>}
                                {file.uploading ? (
                                    <Loader2 size={15} className="shrink-0 animate-spin text-[#9db669]" />
                                ) : (
                                    <FileText size={15} className={`shrink-0 ${file.error ? "text-red-500" : "text-[#9db669]"}`} />
                                )}
                                <div className="min-w-0 flex-1 truncate">
                                    <span className="font-medium text-zinc-800 dark:text-zinc-200" title={file.name}>
                                        {file.name}
                                    </span>
                                    {file.uploading && (
                                        <span className="ml-2 font-mono text-[10px] font-semibold text-[#718746] dark:text-[#a0bf64]">
                                            Enviando... {typeof file.progress === 'number' && file.progress > 0 ? `${file.progress}%` : ''}
                                        </span>
                                    )}
                                    {file.error && (
                                        <span className="ml-2 text-[10px] font-medium text-red-500">({file.error})</span>
                                    )}
                                </div>
                                {file.fileUrl && !file.uploading && (
                                    <button
                                        type="button"
                                        className="text-[11px] font-semibold text-[#72844d] hover:underline dark:text-[#a0bf64]"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setPreviewFile({ name: file.name, url: file.fileUrl!, sizeLabel: file.size > 0 ? formatFileSize(file.size) : undefined });
                                        }}
                                    >
                                        Abrir
                                    </button>
                                )}
                                <span className="text-[11px] text-[#888]">
                                    {file.size > 0 ? formatFileSize(file.size) : "Enviado"}
                                </span>
                                {ordered && (
                                    <span className="flex items-center gap-1">
                                        <button type="button" disabled={disabled || file.uploading || index === 0} onClick={() => moveFile(index, -1)} aria-label={`Mover ${file.name} para cima`} className="text-[#999] transition hover:text-[#718746] disabled:opacity-25"><ArrowUp size={13} /></button>
                                        <button type="button" disabled={disabled || file.uploading || index === safeFiles.length - 1} onClick={() => moveFile(index, 1)} aria-label={`Mover ${file.name} para baixo`} className="text-[#999] transition hover:text-[#718746] disabled:opacity-25"><ArrowDown size={13} /></button>
                                    </span>
                                )}
                                <button
                                    type="button"
                                    disabled={disabled || file.uploading}
                                    onClick={() => onFilesChange(files.filter((item) => item.id !== file.id))}
                                    aria-label={`Remover ${file.name}`}
                                    className="text-[#999] hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Barra de progresso animada */}
                            {file.uploading && (
                                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                    <div
                                        className="h-full rounded-full bg-[#9db669] transition-all duration-200 ease-out"
                                        style={{ width: `${Math.max(6, file.progress || 0)}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
        <AllyoFileViewerModal file={previewFile} onClose={() => setPreviewFile(null)} />
        </>
    );
};

const formatFileSize = (bytes: number) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
const sumDuration = (scenes: StoryboardScene[]) => `${scenes.reduce((sum, item) => sum + (Number.parseInt(item.duration, 10) || 0), 0)}s`;
const escapeHtml = (value: string) => {
    const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
    return value.replace(/[&<>'"]/g, (character) => entities[character] || character);
};
