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

export type DeliverableKind = 'social' | 'landing' | 'presentation' | 'storyboard';

export interface ManagedFile {
    id: string;
    name: string;
    size: number;
}

export const getDeliverableKind = (task: AllyoTask): DeliverableKind => {
    const searchable = `${task.name} ${task.category}`.toLowerCase();
    if (searchable.includes('landing')) return 'landing';
    if (searchable.includes('apresenta')) return 'presentation';
    if (searchable.includes('storyboard') || searchable.includes('roteiro')) return 'storyboard';
    return 'social';
};

export const deliverableCopy: Record<DeliverableKind, { type: string; count: string; approval: string; editable: string; software: string; next: string; helper: string }> = {
    social: { type: 'Post para Instagram', count: '1 entrega', approval: 'PNG', editable: '1 arquivo editável', software: 'Photoshop', next: 'Produzir a primeira versão', helper: 'Revise o briefing, faça o upload da peça e envie para a revisão interna.' },
    landing: { type: 'Landing page', count: '4 seções', approval: 'PNG ou PDF', editable: '1 arquivo editável', software: 'Figma', next: 'Concluir as seções da página', helper: 'Revise copy e responsividade antes de anexar o preview completo da página.' },
    presentation: { type: 'Apresentação', count: '8 slides', approval: 'PDF', editable: '1 arquivo editável', software: 'PowerPoint', next: 'Revisar slides e arquivos', helper: 'Confira as pendências por slide e envie PDF e editável dentro da mesma versão.' },
    storyboard: { type: 'Storyboard', count: '4 cenas', approval: 'PDF gerado', editable: 'arquivos opcionais', software: 'Allyo', next: 'Montar e revisar as cenas', helper: 'Preencha os campos de cada cena. A Allyo organiza o documento para aprovação.' },
};

export const DeliveryWorkspace = ({ kind }: { kind: DeliverableKind }) => {
    if (kind === 'landing') return <LandingWorkspace />;
    if (kind === 'presentation') return <PresentationWorkspace />;
    if (kind === 'storyboard') return <StoryboardWorkspace />;
    return <SocialWorkspace />;
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

const SocialWorkspace = () => (
    <WorkspaceShell icon={<ImageIcon size={17} />} title="Post para Instagram · 1080 × 1350 px" subtitle="Conteúdo e especificações da peça selecionada.">
        <div className={`grid overflow-hidden rounded-[14px] border ${ALLYO_BORDER} lg:grid-cols-[1.25fr_.75fr]`}>
            <div className={`p-5 sm:p-6 lg:border-r ${ALLYO_BORDER}`}><h3 className="font-season text-lg">Copy do criativo</h3><div className="mt-5 space-y-3 text-sm leading-5 text-[#858585]"><p><strong className="text-black dark:text-zinc-200">Tema:</strong> Ver mais é bom. Ter resposta é melhor.</p><p><strong className="text-black dark:text-zinc-200">Título:</strong><br />Não é só ver. É poder agir.</p><p><strong className="text-black dark:text-zinc-200">Visual:</strong><br />Câmera em destaque em um ambiente residencial real, com clima de rotina e proteção.</p><p><strong className="text-black dark:text-zinc-200">Copy de apoio:</strong><br />Acompanhe o ambiente com um sistema conectado à Central de Monitoramento 24h.</p></div></div>
            <div><Specification label="Dimensões" value="1080 × 1350" /><Specification label="Software" value="Photoshop" /><Specification label="Extensão" value="PNG" last /></div>
        </div>
    </WorkspaceShell>
);

export const VersionBundle = ({ kind, version, onVersionChange, approvalFiles, sourceFiles, onApprovalFilesChange, onSourceFilesChange }: { kind: DeliverableKind; version: string; onVersionChange: (value: string) => void; approvalFiles: ManagedFile[]; sourceFiles: ManagedFile[]; onApprovalFilesChange: (files: ManagedFile[]) => void; onSourceFilesChange: (files: ManagedFile[]) => void }) => {
    const approvalAccept = kind === 'social' || kind === 'landing' ? '.png,.jpg,.jpeg,.pdf' : '.pdf';
    const sourceAccept = kind === 'landing' ? '.fig,.zip' : kind === 'presentation' ? '.ppt,.pptx,.ai,.indd,.zip' : kind === 'storyboard' ? '.ppt,.pptx,.psd,.ai,.zip' : '.psd,.ai,.fig,.zip';
    return (
        <section className={`border-b ${ALLYO_BORDER}`}>
            <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-5 sm:px-[30px] ${ALLYO_BORDER}`}><div><span className="text-[11px] font-bold uppercase tracking-[.08em] text-[#9db669]">Pacote de entrega</span><h2 className="mt-1 font-season text-lg">Arquivos da versão</h2></div><div className="flex items-center gap-2"><span className="rounded-full bg-[#f2f4ee] px-3 py-1.5 text-[11px] font-semibold text-[#76805f] dark:bg-zinc-900">Rascunho</span><FilterSelect label="Versão" value={version} options={['Versão 1', 'Versão 2', 'Versão 3']} onChange={onVersionChange} includeAll={false} /></div></div>
            <div className="grid gap-4 p-5 sm:p-[30px] lg:grid-cols-2">
                <FileSlot icon={<CheckCircle2 size={17} />} title="Arquivo para aprovação" description={kind === 'storyboard' ? 'PDF gerado pela Allyo ou enviado manualmente.' : `Material que o cliente irá visualizar · ${deliverableCopy[kind].approval}`} files={approvalFiles} onFilesChange={onApprovalFilesChange} accept={approvalAccept} />
                <FileSlot icon={<FileText size={17} />} title={kind === 'storyboard' ? 'Arquivos complementares' : 'Arquivo editável'} description={kind === 'storyboard' ? 'Opcional: referências ou fonte usada nos frames.' : `Fonte de trabalho · ${deliverableCopy[kind].software}`} files={sourceFiles} onFilesChange={onSourceFilesChange} accept={sourceAccept} optional={kind === 'storyboard'} />
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

export const FileSlot = ({ icon, title, description, files, onFilesChange, accept, optional = false }: { icon: React.ReactNode; title: string; description: string; files: ManagedFile[]; onFilesChange: (files: ManagedFile[]) => void; accept: string; optional?: boolean }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const addFiles = (incoming: FileList | null) => {
        if (!incoming) return;
        const next = Array.from(incoming).map((file) => ({ id: `${file.name}-${file.lastModified}-${file.size}`, name: file.name, size: file.size }));
        onFilesChange([...files.filter((file) => !next.some((item) => item.id === file.id)), ...next]);
    };
    return <div className={`rounded-[14px] border p-5 ${ALLYO_BORDER}`}><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1f4eb] text-[#81915f] dark:bg-[#d0f08e]/10">{icon}</span><div><div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{title}</h3>{optional && <span className="text-[11px] font-semibold uppercase text-[#999]">Opcional</span>}</div><p className="mt-1.5 text-xs leading-5 text-[#888]">{description}</p></div></div><button type="button" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files); }} className="mt-4 flex min-h-[84px] w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#cdd4c0] px-3 text-xs font-semibold text-[#72844d] transition hover:bg-[#fafcf6] dark:border-zinc-700 dark:hover:bg-zinc-900"><Upload size={17} /> Arraste ou selecione seus arquivos</button><input ref={inputRef} type="file" multiple accept={accept} className="hidden" onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }} />{files.length > 0 && <div className="mt-2 space-y-1.5">{files.map((file) => <div key={file.id} className="flex items-center gap-2 rounded-[8px] bg-[#f7f8f5] px-3 py-2.5 text-xs dark:bg-zinc-900"><FileText size={14} className="text-[#9db669]" /><span className="min-w-0 flex-1 truncate">{file.name}</span><span className="text-[11px] text-[#888]">{formatFileSize(file.size)}</span><button type="button" onClick={() => onFilesChange(files.filter((item) => item.id !== file.id))} aria-label={`Remover ${file.name}`}><X size={14} /></button></div>)}</div>}</div>;
};

const formatFileSize = (bytes: number) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
const sumDuration = (scenes: StoryboardScene[]) => `${scenes.reduce((sum, item) => sum + (Number.parseInt(item.duration, 10) || 0), 0)}s`;
const escapeHtml = (value: string) => {
    const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
    return value.replace(/[&<>'"]/g, (character) => entities[character] || character);
};
