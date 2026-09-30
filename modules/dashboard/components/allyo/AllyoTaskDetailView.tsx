import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CalendarDays, ChevronDown, ChevronUp, Clock3, MessageCircle, Send, Star, CheckCircle2, Eye, FilePenLine, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import AllyoReviewModal from './AllyoReviewModal';
import AllyoSubmitConfirmModal from './AllyoSubmitConfirmModal';
import { useSearchParams } from 'react-router-dom';
import { ALLYO_BORDER, ALLYO_TASKS, FilterSelect, formatTaskCredits, todayLabel, mapDemandToTasks, AllyoTask } from './AllyoUI';
import { DeliveryWorkspace, deliverableCopy, getDeliverableKind, ManagedFile, VersionBundle } from './AllyoDeliveryWorkspaces';
import AllyoMultiDeliverableWorkspace from './AllyoMultiDeliverableWorkspace';
import AllyoTaskChat from './AllyoTaskChat';
import AllyoProjectFlow from './AllyoProjectFlow';
import AllyoTaskResources from './AllyoTaskResources';
import AllyoTaskActions from './AllyoTaskActions';
import AllyoClientDeliveryWorkspace from './AllyoClientDeliveryWorkspace';
import { addTaskActivity } from './allyoTaskActivity';
import { mapDemandToAllyoProject } from './allyoProjects';
import { getTaskResources } from './allyoTaskResourceData';
import { allyoService, type AllyoCatalogProduct, type AllyoDemand, type AllyoUserCategory } from '../../../../services/allyoService';
import { useToast } from '../../../../context/ToastContext';
import { getAllyoTaskItemCount, getAllyoTaskPresentation } from './allyoTaskPresentation';
import { createProductDeliveryProfile, findCatalogProductForTask } from './allyoProductDelivery';

const statusOptions = ['Nova', 'Em andamento', 'Em revisão', 'Alteração', 'Pronta para entrega', 'Entregue'];
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

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class TaskDetailErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[AllyoTaskDetailView] Erro capturado pelo ErrorBoundary:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-full min-h-[480px] w-full flex-col items-center justify-center p-8 text-center bg-white dark:bg-zinc-950">
                    <div className="max-w-md rounded-2xl border border-red-200 bg-red-50/70 p-6 shadow-sm dark:border-red-900/40 dark:bg-red-950/20">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
                        <h2 className="font-season text-xl font-bold text-red-900 dark:text-red-200">
                            Erro ao carregar a tarefa
                        </h2>
                        <p className="mt-2 text-xs text-red-700 dark:text-red-300">
                            {this.state.error?.message || 'Ocorreu uma falha inesperada na renderização da tarefa.'}
                        </p>
                        <div className="mt-5 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    this.setState({ hasError: false, error: null });
                                    window.location.reload();
                                }}
                                className="rounded-full bg-red-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition"
                            >
                                Recarregar página
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const params = new URLSearchParams(window.location.search);
                                    params.delete('task');
                                    params.set('view', 'overview');
                                    window.location.search = params.toString();
                                }}
                                className="rounded-full border border-red-300 bg-white px-5 py-2 text-xs font-semibold text-red-800 hover:bg-red-50 transition dark:border-red-800 dark:bg-zinc-900 dark:text-red-300"
                            >
                                Voltar para Visão Geral
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const AllyoTaskDetailViewInner = ({ userName }: { userName?: string }) => {
    const { addToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const taskId = searchParams.get('task');
    const [liveTask, setLiveTask] = useState<AllyoTask | null>(null);
    const [liveDemand, setLiveDemand] = useState<AllyoDemand | null>(null);
    const [catalogProducts, setCatalogProducts] = useState<AllyoCatalogProduct[]>([]);
    const [taskChanges, setTaskChanges] = useState<Partial<AllyoTask>>({});
    const [canManageTask, setCanManageTask] = useState(false);
    const [viewerCategory, setViewerCategory] = useState<AllyoUserCategory | null>(null);
    const [permissionsLoaded, setPermissionsLoaded] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);

    useEffect(() => {
        if (!taskId) return;
        setLiveDemand(null);
        allyoService.getDemands().then((res) => {
            if (res && Array.isArray(res.demands)) {
                const found = res.demands.find((d) => d.id === taskId || d.tasksList?.some((item) => item.id === taskId));
                if (found) {
                    setLiveDemand(found);
                    setLiveTask(mapDemandToTasks(found).find((item) => item.id === taskId) || mapDemandToTasks(found)[0]);
                }
            }
        }).catch((err) => console.warn('[AllyoTaskDetailView] Erro ao carregar demanda da API:', err));
    }, [taskId]);

    useEffect(() => {
        let active = true;
        allyoService.getCatalog()
            .then((catalog) => { if (active) setCatalogProducts(Array.isArray(catalog?.products) ? catalog.products : []); })
            .catch((error) => console.warn('[AllyoTaskDetailView] Não foi possível carregar as regras do catálogo:', error));
        return () => { active = false; };
    }, []);

    useEffect(() => {
        let active = true;
        allyoService.getPermissions()
            .then((permissions) => { if (active) { setCanManageTask(permissions.canManageProjects); setViewerCategory(permissions.category); setPermissionsLoaded(true); } })
            .catch(() => { if (active) { setCanManageTask(false); setViewerCategory(null); setPermissionsLoaded(true); } });
        return () => { active = false; };
    }, []);

    const defaultTask: AllyoTask = ALLYO_TASKS[0] || {
        id: '123456',
        name: 'Tarefa',
        projectId: 'project-fauves-launch',
        projectName: 'Campanha de lançamento',
        credits: 1,
        category: 'Design',
        client: 'Fauves',
        deadline: 'A definir',
        time: 'A definir',
        status: 'Em andamento',
        cam: 'Marina',
        creative: 'Levy',
    };
    const sourceTask = liveTask || ALLYO_TASKS.find((item) => item.id === taskId) || defaultTask;
    const task = { ...sourceTask, ...taskChanges };
    const catalogProduct = useMemo(() => findCatalogProductForTask(task, catalogProducts), [catalogProducts, task]);
    const deliveryProfile = useMemo(() => catalogProduct ? createProductDeliveryProfile(catalogProduct) : null, [catalogProduct]);
    const presentationTask = deliveryProfile ? { ...task, taskType: deliveryProfile.taskType } : task;
    const project = liveDemand ? mapDemandToAllyoProject(liveDemand) : null;
    const projectTasks = project?.stages.flatMap((stage) => stage.tasks) || [];
    const projectTask = projectTasks.find((item) => item.id === task.id);
    const isTaskBlocked = projectTask?.status === 'blocked';
    const blockingTasks = (projectTask?.dependsOn || []).map((id) => projectTasks.find((item) => item.id === id)?.title).filter(Boolean);
    const taskResources = getTaskResources(task.id);
    const initialStatus = isTaskBlocked ? 'Bloqueada' : task.status === 'Iniciar' ? 'Nova' : task.status === 'Concluída' ? 'Entregue' : (task.status || 'Em andamento');
    const [status, setStatus] = useState<string>(initialStatus);

    const taskDesigns = useMemo(() => {
        return (liveDemand?.designs || [])
            .filter((d) => Boolean(d && (d.taskId === task.id || (task.publicId && d.taskId === task.publicId))))
            .sort((a, b) => {
                const versionDifference = (Number(String(b.version || '').match(/\d+/)?.[0]) || 0)
                    - (Number(String(a.version || '').match(/\d+/)?.[0]) || 0);
                if (versionDifference !== 0) return versionDifference;
                const leftOrder = Number(String(a.name || '').match(/card\s*0*(\d+)/i)?.[1]) || Number.MAX_SAFE_INTEGER;
                const rightOrder = Number(String(b.name || '').match(/card\s*0*(\d+)/i)?.[1]) || Number.MAX_SAFE_INTEGER;
                return leftOrder - rightOrder;
            });
    }, [liveDemand?.designs, task.id, task.publicId]);

    const activeReviewDesign = taskDesigns[0] || null;

    const existingVersionNums = useMemo(() => {
        const nums = taskDesigns
            .map((d) => Number(String(d.version || '').replace(/\D/g, '')))
            .filter((v) => !isNaN(v) && v > 0);
        return Array.from(new Set(nums)).sort((a, b) => a - b);
    }, [taskDesigns]);

    const highestSubmittedVersion = existingVersionNums.length > 0 ? Math.max(...existingVersionNums) : 0;
    const isCurrentAlteracao = 
        task.status === 'Alteração' || 
        (task as any).status === 'Em alteração' || 
        status === 'Alteração' || 
        task.delivery === 'Em alteração';

    // A versão atual da tarefa:
    // Se o cliente solicitou alterações, a tarefa avança para a próxima versão (highestSubmittedVersion + 1)
    // Se não está em alteração, a versão atual é a última enviada (ou 1 se nenhuma foi enviada ainda)
    const inferredCurrentVersionNum = isCurrentAlteracao
        ? (highestSubmittedVersion > 0 ? highestSubmittedVersion + 1 : 2)
        : Math.max(1, highestSubmittedVersion);
    const configuredVersionNum = Number(String(task.version || '').replace(/\D/g, '')) || 0;
    const currentVersionNum = configuredVersionNum > 0 ? configuredVersionNum : inferredCurrentVersionNum;

    const latestVersionLabel = `Versão ${currentVersionNum}`;

    // O dropdown de versões exibe estritamente as versões existentes até a versão atual (1..currentVersionNum)
    // Novas versões são adicionadas somente conforme o cliente solicita alterações
    const versionOptions = useMemo(() => {
        const maxV = Math.max(1, currentVersionNum);
        return Array.from({ length: maxV }, (_, i) => `Versão ${i + 1}`);
    }, [currentVersionNum]);

    // Permite que o criativo alterne entre versões pelo dropdown se desejar, mas por padrão
    // carrega exatamente na versão atual (última) da tarefa para não confundir o dia a dia
    const [selectedVersionByUser, setSelectedVersionByUser] = useState<string | null>(null);
    const lastTaskIdRef = useRef<string>(task.id);

    useEffect(() => {
        if (lastTaskIdRef.current !== task.id) {
            lastTaskIdRef.current = task.id;
            setSelectedVersionByUser(null);
        }
    }, [task.id]);

    const deliveryVersion = (selectedVersionByUser && versionOptions.includes(selectedVersionByUser))
        ? selectedVersionByUser
        : latestVersionLabel;

    const totalComments = Array.isArray(activeReviewDesign?.comments) ? activeReviewDesign.comments.length : 0;
    const totalAnnotations = Array.isArray(activeReviewDesign?.annotations) ? activeReviewDesign.annotations.length : 0;
    const hasClientAnnotations = totalComments > 0 || totalAnnotations > 0;
    const deliverableKind = getDeliverableKind(presentationTask);
    const taskPresentation = getAllyoTaskPresentation(presentationTask);
    const requestCopy = deliverableCopy[deliverableKind] || deliverableCopy.social;
    const catalogStructuredQuantity = ['cards', 'slides', 'scenes'].includes(taskPresentation.structure)
        && Number(catalogProduct?.deliveryQuantity) > 1
        && Number(catalogProduct?.deliveryQuantity) <= 100
        ? Number(catalogProduct?.deliveryQuantity)
        : undefined;
    const taskItemCount = getAllyoTaskItemCount(presentationTask, taskPresentation, catalogStructuredQuantity);
    const isClientView = permissionsLoaded && !canManageTask && (viewerCategory === 'CLIENTE' || viewerCategory === null);
    const briefing = task.briefing
        ? [
            { title: '1. Objetivo desta tarefa', items: [task.briefing.objective].filter((item): item is string => Boolean(item)) },
            { title: '2. Contexto herdado do projeto', items: [task.briefing.overview, task.briefing.audience ? `Público: ${task.briefing.audience}` : null, task.briefing.tone ? `Tom: ${task.briefing.tone}` : null].filter((item): item is string => Boolean(item)) },
            { title: '3. Entregáveis', items: Array.isArray(task.briefing.deliverables) ? task.briefing.deliverables : [] },
            { title: '4. Formatos', items: Array.isArray(task.briefing.formats) ? task.briefing.formats : [] },
            { title: '5. Direção criativa', items: Array.isArray(task.briefing.creativeDirection) ? task.briefing.creativeDirection : [] },
        ].filter((block) => block.items.length > 0)
        : briefingByKind[deliverableKind as keyof typeof briefingByKind] || [
            { title: `1. Objetivo de ${taskPresentation.label.toLocaleLowerCase('pt-BR')}`, items: [taskPresentation.creativeHelper] },
            { title: '2. Estrutura', items: [`Organizar a entrega em ${taskPresentation.itemLabel}${taskItemCount === 1 ? '' : 's'} conforme o briefing`, `Formato de aprovação: ${taskPresentation.approval}`] },
            { title: '3. Entrega', items: [`Anexar ${taskPresentation.editable}`, `Produção em ${taskPresentation.software}`] },
        ];
    const deliverableTypes = new Set((task.deliverables || []).map((item) => item.type.trim().toLocaleLowerCase('pt-BR')).filter(Boolean));
    const hasSeveralDeliverables = Boolean(task.deliverables && task.deliverables.length > 1);
    const isMultiDeliverable = hasSeveralDeliverables && (deliverableTypes.size > 1 || taskPresentation.type === 'social' || taskPresentation.type === 'generic');
    const [descriptionOpen, setDescriptionOpen] = useState(true);
    const [orderOpen, setOrderOpen] = useState(true);
    const [brandKitOpen, setBrandKitOpen] = useState(false);
    const [filesByVersion, setFilesByVersion] = useState<Record<string, { approval: ManagedFile[]; source: ManagedFile[] }>>({
        'Versão 1': { approval: [], source: [] },
        'Versão 2': { approval: [], source: [] },
    });
    const [savedLabel, setSavedLabel] = useState('Alterações salvas automaticamente');
    const [readyDeliverables, setReadyDeliverables] = useState(0);
    const [multiSourceFileUrl, setMultiSourceFileUrl] = useState<string | undefined>();
    const [multiReviewFiles, setMultiReviewFiles] = useState<Array<{ name: string; fileUrl: string; sourceFileUrl?: string; order: number }>>([]);
    const [isMultiFileUploading, setIsMultiFileUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'messages'>('details');
    const [administrativeBlock, setAdministrativeBlock] = useState<boolean | null>(null);
    const [isSendingReview, setIsSendingReview] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const currentFiles = filesByVersion[deliveryVersion] || { approval: [], source: [] };
    const approvalFiles = Array.isArray(currentFiles.approval) ? currentFiles.approval.filter(Boolean) : [];
    const sourceFiles = Array.isArray(currentFiles.source) ? currentFiles.source.filter(Boolean) : [];
    const readyApprovalFiles = approvalFiles.filter((file) => Boolean(file.fileUrl) && !file.error);
    const isCarouselSequence = taskPresentation.type === 'carousel' && taskItemCount > 1;
    const hasSingleApprovalPdf = readyApprovalFiles.length === 1 && /\.pdf(?:$|[?#])/i.test(readyApprovalFiles[0].fileUrl || readyApprovalFiles[0].name);
    const hasCompleteCarouselImages = readyApprovalFiles.length === taskItemCount
        && readyApprovalFiles.every((file) => /\.(?:png|jpe?g)(?:$|[?#])/i.test(file.fileUrl || file.name));
    const hasCompleteCarouselSequence = !isCarouselSequence || hasSingleApprovalPdf || hasCompleteCarouselImages;
    const isCurrentlyBlocked = administrativeBlock ?? (isTaskBlocked || status === 'Bloqueada');
    const isInactive = status === 'Inativa';
    const isTaskInProgress = status?.trim()?.toLowerCase() === 'em andamento' || status === 'Alteração';
    const deliveryVersionNum = Number(deliveryVersion.replace(/\D/g, '')) || 1;
    const isCurrentVersionSelected = deliveryVersionNum === currentVersionNum;
    const isAnyFileUploading = isMultiFileUploading || approvalFiles.some((f) => Boolean(f?.uploading)) || sourceFiles.some((f) => Boolean(f?.uploading));
    const hasApprovalReady = isMultiDeliverable ? multiReviewFiles.length > 0 : readyApprovalFiles.length > 0 && hasCompleteCarouselSequence;
    const sourceRequired = deliveryProfile?.sourceRequired ?? true;
    const hasSourceReady = !sourceRequired || (isMultiDeliverable ? Boolean(multiSourceFileUrl) : sourceFiles.some((file) => Boolean(file.fileUrl) && !file.error));
    const canSendForReview = permissionsLoaded && !isClientView && isTaskInProgress && !isCurrentlyBlocked && !isInactive && !isSendingReview && !isAnyFileUploading && isCurrentVersionSelected && hasApprovalReady && hasSourceReady;

    useEffect(() => {
        setStatus(isTaskBlocked ? 'Bloqueada' : task.status === 'Iniciar' ? 'Nova' : task.status === 'Concluída' ? 'Entregue' : task.status);
        setTaskChanges({});
        setAdministrativeBlock(null);
        setActiveTab('details');
    }, [isTaskBlocked, sourceTask.id]);

    useEffect(() => {
        if (!liveDemand) return;
        const matchedDesigns = (liveDemand.designs || [])
            .filter((d) => Boolean(d && (d.taskId === task.id || (task.publicId && d.taskId === task.publicId))))
            .sort((a, b) => {
                const leftOrder = Number(String(a.name || '').match(/card\s*0*(\d+)/i)?.[1]) || Number.MAX_SAFE_INTEGER;
                const rightOrder = Number(String(b.name || '').match(/card\s*0*(\d+)/i)?.[1]) || Number.MAX_SAFE_INTEGER;
                return leftOrder - rightOrder;
            });
        
        // Popula todas as versões existentes em filesByVersion
        matchedDesigns.forEach((d) => {
            const vNum = Number(String(d.version || '').replace(/\D/g, '')) || 1;
            const vLabel = `Versão ${vNum}`;
            setFilesByVersion((current) => {
                const currentVersionFiles = current[vLabel] || { approval: [], source: [] };
                const hasSource = currentVersionFiles.source.some((item) => item.fileUrl || item.file);
                const sourceFileUrl = d.sourceFileUrl;
                const designId = `design-${d.id}`;
                const approvalAlreadyPresent = currentVersionFiles.approval.some((item) => item.id === designId || (d.fileUrl && item.fileUrl === d.fileUrl));
                const approval = d.fileUrl && !approvalAlreadyPresent
                    ? [...currentVersionFiles.approval, {
                        id: designId,
                        name: (() => {
                            const n = (d as any).name || 'Arquivo em revisão';
                            try { return decodeURIComponent(n); } catch { return n; }
                        })(),
                        size: 0,
                        fileUrl: d.fileUrl,
                    }]
                    : currentVersionFiles.approval;
                const source = hasSource || !sourceFileUrl ? currentVersionFiles.source : [{
                    id: `source-${d.id}`,
                    name: `Arquivo aberto · ${d.name}`,
                    size: 0,
                    fileUrl: sourceFileUrl,
                }];
                if (approval === currentVersionFiles.approval && source === currentVersionFiles.source) return current;
                return {
                    ...current,
                    [vLabel]: {
                        approval,
                        source,
                    },
                };
            });
        });

        // Garante que a versão atual exista em filesByVersion pronta para upload
        setFilesByVersion((current) => {
            if (current[latestVersionLabel]) return current;
            return { ...current, [latestVersionLabel]: { approval: [], source: [] } };
        });
    }, [liveDemand, task.id, task.publicId, latestVersionLabel]);

    const goBack = () => {
        setSearchParams((current) => {
            const next = new URLSearchParams(current);
            next.set('view', 'tasks');
            next.delete('task');
            return next;
        });
    };

    const openReferencedTask = (taskId: string) => {
        setSearchParams((current) => {
            const next = new URLSearchParams(current);
            next.set('view', 'task-detail');
            next.set('task', taskId);
            return next;
        });
    };

    const updateStatus = async (nextStatus: string) => {
        setStatus(nextStatus);
        setSavedLabel('Status atualizado agora');

        try {
            const apiStatusMap: Record<string, 'A iniciar' | 'Em andamento' | 'Em revisão' | 'Alteração' | 'Concluído'> = {
                'Nova': 'A iniciar',
                'Em andamento': 'Em andamento',
                'Em revisão': 'Em revisão',
                'Alteração': 'Alteração',
                'Pronta para entrega': 'Em revisão',
                'Entregue': 'Concluído',
            };
            const mapped = apiStatusMap[nextStatus];
            if (mapped) {
                await allyoService.updateTask(task.id, { status: mapped });
            }
        } catch (err) {
            console.warn('[AllyoTaskDetailView] Erro ao sincronizar status com Railway:', err);
        }
    };

    const updateVersionFiles = (slot: 'approval' | 'source', files: ManagedFile[]) => {
        setFilesByVersion((current) => ({
            ...current,
            [deliveryVersion]: { ...(current[deliveryVersion] || { approval: [], source: [] }), [slot]: files },
        }));
        setSavedLabel(`${deliveryVersion} atualizada agora`);
    };

    const applyTaskChanges = (changes: Partial<AllyoTask>) => {
        if (changes.version !== undefined) setSelectedVersionByUser(null);
        setTaskChanges((current) => ({ ...current, ...changes }));
        setLiveDemand((current) => current ? {
            ...current,
            tasksList: current.tasksList?.map((item) => item.id === task.id ? {
                ...item,
                ...(changes.name !== undefined ? { title: changes.name } : {}),
                ...(changes.category !== undefined ? { team: changes.category } : {}),
                ...(changes.creative !== undefined ? { assignee: changes.creative } : {}),
                ...(changes.workflowStage !== undefined ? { workflowStage: changes.workflowStage } : {}),
                ...(changes.dependsOn !== undefined ? { dependsOn: changes.dependsOn } : {}),
                ...(changes.requiresClientApproval !== undefined ? { requiresClientApproval: changes.requiresClientApproval } : {}),
                ...(changes.version !== undefined ? { version: changes.version } : {}),
                ...(changes.taskType !== undefined ? { taskType: changes.taskType } : {}),
                ...(changes.dependencyBlocked !== undefined ? { dependencyBlocked: changes.dependencyBlocked } : {}),
            } : item),
        } : current);
    };

    const applyStatusChange = (nextStatus: string) => {
        setStatus(nextStatus);
        setAdministrativeBlock(nextStatus === 'Bloqueada');
        setSavedLabel('Status atualizado agora');
        const apiStatus = nextStatus === 'Nova' ? 'A iniciar' : nextStatus === 'Entregue' ? 'Concluído' : nextStatus;
        setLiveDemand((current) => current ? { ...current, tasksList: current.tasksList?.map((item) => item.id === task.id ? { ...item, status: apiStatus } : item) } : current);
    };

    const sendForReview = async (): Promise<boolean> => {
        if (isSendingReview) return false;
        if (!isCurrentVersionSelected) {
            addToast({ type: 'warning', title: 'Versão anterior protegida', message: `O envio está liberado somente na ${latestVersionLabel}. Para voltar uma versão, use “Reduzir versão atual” no menu de ações.` });
            return false;
        }
        if (!hasApprovalReady || !hasSourceReady) {
            const message = isCarouselSequence && !hasCompleteCarouselSequence
                ? `Anexe exatamente ${taskItemCount} imagens na ordem dos cards ou um PDF único com ${taskItemCount} páginas${hasSourceReady ? '.' : ', além do arquivo aberto/editável.'}`
                : sourceRequired
                ? 'Anexe o arquivo para aprovação e o arquivo aberto/editável da versão atual.'
                : 'Anexe o material final da versão atual.';
            addToast({ type: 'warning', title: 'Pacote de entrega incompleto', message });
            return false;
        }
        setIsSendingReview(true);
        try {
            const decodeSafe = (str: string): string => {
                try { return decodeURIComponent(str); } catch { return str; }
            };
            const rawNames = isMultiDeliverable ? '' : currentFiles.approval.map((file) => decodeSafe(file.name)).join(', ');
            const fileNames = decodeSafe(rawNames);
            const projectId = task.projectId || liveDemand?.id || task.id;
            const reviewFiles = isMultiDeliverable
                ? []
                : currentFiles.approval.filter((file) => Boolean(file.fileUrl) && !file.error);

            if ((reviewFiles.length === 0 && !isMultiDeliverable) || (isMultiDeliverable && multiReviewFiles.length === 0)) {
                addToast({ type: 'warning', title: 'Arquivo ainda não está pronto', message: 'Anexe o material e aguarde o fim do upload antes de enviar para revisão.' });
                return false;
            }

            if (isCarouselSequence && !hasCompleteCarouselSequence) {
                addToast({
                    type: 'warning',
                    title: 'Sequência do carrossel incompleta',
                    message: `Envie exatamente ${taskItemCount} imagens, uma para cada card, ou um único PDF com ${taskItemCount} páginas.`,
                });
                return false;
            }

            const sourceFileUrl = isMultiDeliverable
                ? multiSourceFileUrl!
                : sourceFiles.find((file) => file.fileUrl)?.fileUrl;
            const orderedReviewFiles = isMultiDeliverable
                ? [...multiReviewFiles].sort((left, right) => left.order - right.order)
                : reviewFiles.map((file, index) => ({
                    name: isCarouselSequence && !hasSingleApprovalPdf
                        ? `Card ${String(index + 1).padStart(2, '0')} · ${decodeSafe(file.name)}`
                        : decodeSafe(file.name),
                    fileUrl: file.fileUrl!,
                    sourceFileUrl,
                    order: index,
                }));

            setSavedLabel('Enviando entrega para aprovação...');
            await allyoService.submitDesignRevision(projectId, {
                name: hasSingleApprovalPdf ? decodeSafe(reviewFiles[0]?.name || task.name) : task.name,
                taskId: task.id,
                version: deliveryVersion,
                color: '#d7ff70',
                fileUrl: orderedReviewFiles.length === 1 ? orderedReviewFiles[0].fileUrl : undefined,
                files: orderedReviewFiles.length > 1 ? orderedReviewFiles : undefined,
                sourceFileUrl: orderedReviewFiles[0]?.sourceFileUrl || sourceFileUrl,
            });

            // Atualiza estado local de designs para incluir a nova entrega enviada
            setLiveDemand((current: any) => {
                if (!current) return current;
                const newDesigns = (orderedReviewFiles.length > 0 ? orderedReviewFiles : [{ name: task.name, fileUrl: undefined, order: 0 }]).map((file, index) => ({
                    id: Date.now() + index,
                    taskId: task.id,
                    name: file.name || fileNames || task.name,
                    version: deliveryVersion,
                    fileUrl: file.fileUrl,
                    sourceFileUrl: file.sourceFileUrl || sourceFileUrl,
                    createdAt: new Date().toISOString(),
                }));
                const existingDesigns = current.designs || [];
                return {
                    ...current,
                    designs: [...newDesigns, ...existingDesigns],
                };
            });

            addTaskActivity(task.id, {
                type: 'approval_sent',
                author: userName?.trim() || task.creative,
                role: 'system',
                version: isMultiDeliverable ? `${readyDeliverables} ${readyDeliverables === 1 ? 'pedido' : 'pedidos'}` : deliveryVersion,
                text: isCarouselSequence && !hasSingleApprovalPdf
                    ? `${orderedReviewFiles.length} cards enviados em sequência para aprovação.`
                    : fileNames ? `Arquivo para aprovação: ${fileNames}` : 'Material enviado para aprovação do cliente.',
            });

            await updateStatus('Em revisão');
            setSelectedVersionByUser(null);
            setSavedLabel(`${deliveryVersion} enviada para aprovação do cliente com sucesso!`);
            setActiveTab('messages');
            addToast({ type: 'success', title: 'Material enviado para revisão', message: `${deliveryVersion} está disponível para o cliente.` });
            return true;
        } catch (err: any) {
            console.error('[AllyoTaskDetailView] Erro ao enviar revisão para Railway:', err);
            const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Erro ao registrar entrega na Allyo Space';
            addToast({ type: 'error', title: 'Não foi possível enviar para revisão', message: msg });
            return false;
        } finally {
            setIsSendingReview(false);
        }
    };

    const handleConfirmReviewSend = async () => {
        const ok = await sendForReview();
        if (ok) {
            setConfirmModalOpen(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto bg-white font-sans text-black dark:bg-zinc-950 dark:text-white">
            <header className={`sticky top-0 z-40 flex min-h-[75px] items-center justify-between gap-4 border-b bg-white/95 px-5 py-3 backdrop-blur-sm sm:px-[30px] dark:bg-zinc-950/95 ${ALLYO_BORDER}`}>
                <div className="flex min-w-0 items-center gap-3">
                    <button type="button" onClick={goBack} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] text-black transition hover:border-[#9db669] hover:text-[#739044] dark:border-zinc-700 dark:text-white" aria-label="Voltar para tarefas"><ArrowLeft size={16} /></button>
                    <div className="min-w-0">
                        <h1 className="truncate font-season text-[22px] font-normal leading-tight">{task.name}</h1>
                        <p className="mt-1 truncate text-[11px] font-medium text-[#a4a4a4] sm:text-sm">{task.projectName} • {task.client} • {task.category} • #{task.publicId || task.id}</p>
                    </div>
                </div>
                <div className="hidden shrink-0 items-center gap-[5px] text-sm font-semibold md:flex"><CalendarDays size={18} className="text-[#9f9f9f]" />{todayLabel()}</div>
            </header>

            <section className={`sticky top-[75px] z-30 flex flex-wrap items-center gap-x-6 gap-y-3 border-b bg-white/95 px-5 py-3 backdrop-blur-sm sm:px-[30px] dark:bg-zinc-950/95 ${ALLYO_BORDER}`}>
                <div className="flex items-center gap-[10px]"><span className="text-sm text-[#a4a4a4]">Status</span>{isCurrentlyBlocked || isInactive || isClientView || !permissionsLoaded ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f2ef] px-3 py-2 text-xs font-semibold text-[#737a72] dark:bg-zinc-800 dark:text-zinc-300"><span className={`h-1.5 w-1.5 rounded-full ${isInactive ? 'bg-red-400' : status === 'Em revisão' ? 'bg-amber-400' : 'bg-[#8e958d]'}`} />{isInactive ? 'Inativa' : isCurrentlyBlocked ? 'Bloqueada' : status}</span> : <FilterSelect label="Status" value={status} options={statusOptions} onChange={updateStatus} includeAll={false} />}</div>
                <MetaItem label="Créditos da tarefa" value={formatTaskCredits(task.credits)} />
                <MetaItem label="Deadline" value={`${task.deadline}, ${task.time}`} icon={<Clock3 size={14} />} />
                <div className="flex items-center gap-[10px]"><span className="text-sm text-[#a4a4a4]">Equipe</span><span className="flex -space-x-2"><Avatar initials="MA" color="bg-[#9db669]" /><Avatar initials="LC" color="bg-[#2a2ad7]" /><Avatar initials="JA" color="bg-[#fd6b32]" /></span></div>
                <div className="ml-auto flex items-center gap-3">
                    <span className="hidden text-[11px] font-medium text-[#8f8f8f] lg:inline" aria-live="polite">{savedLabel}</span>
                    {canManageTask && <AllyoTaskActions task={task} currentStatus={isInactive ? 'Inativa' : isCurrentlyBlocked ? 'Bloqueada' : status} userName={userName} onTaskEdited={applyTaskChanges} onStatusChanged={applyStatusChange} onDeleted={goBack} currentVersion={latestVersionLabel} versionOptions={versionOptions} />}
                </div>
            </section>

            <nav className={`flex items-center gap-7 border-b bg-white px-5 sm:px-[30px] dark:bg-zinc-950 ${ALLYO_BORDER}`} aria-label="Seções da tarefa">
                <button type="button" onClick={() => setActiveTab('details')} aria-current={activeTab === 'details' ? 'page' : undefined} className={`min-h-12 border-b-2 text-sm font-semibold transition ${activeTab === 'details' ? 'border-[#003f35] text-[#003f35] dark:border-[#d0f08e] dark:text-[#d0f08e]' : 'border-transparent text-[#717b73] hover:text-[#003f35]'}`}>Detalhes</button>
                <button type="button" onClick={() => setActiveTab('messages')} aria-current={activeTab === 'messages' ? 'page' : undefined} className={`inline-flex min-h-12 items-center gap-2 border-b-2 text-sm font-semibold transition ${activeTab === 'messages' ? 'border-[#003f35] text-[#003f35] dark:border-[#d0f08e] dark:text-[#d0f08e]' : 'border-transparent text-[#717b73] hover:text-[#003f35]'}`}><MessageCircle size={15} /> Mensagens</button>
            </nav>

            <div hidden={activeTab !== 'messages'}>
                <AllyoTaskChat task={task} userName={userName} />
            </div>
            <div hidden={activeTab !== 'details'}>
                {task.feedback && typeof task.feedback.rating === 'number' && !isNaN(task.feedback.rating) && (
                    <div className="mx-5 my-4 sm:mx-[30px] rounded-xl border border-amber-200/90 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2.5">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                        <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                                        Aprovado com feedback
                                    </span>
                                    <div className="flex items-center gap-0.5 text-amber-500">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                size={15}
                                                className={i < (task.feedback?.rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-700'}
                                            />
                                        ))}
                                        <span className="ml-1 text-xs font-bold text-amber-900 dark:text-amber-200">
                                            {Number(task.feedback.rating || 0).toFixed(1)} / 5.0
                                        </span>
                                    </div>
                                </div>
                                {task.feedback.comment ? (
                                    <p className="mt-2 text-sm italic text-zinc-800 dark:text-zinc-200">
                                        "{task.feedback.comment}"
                                    </p>
                                ) : (
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                        Aprovado pelo cliente com nota {task.feedback.rating} de 5 estrelas.
                                    </p>
                                )}
                            </div>
                            {task.feedback.createdAt && (
                                <span className="shrink-0 text-[11px] text-zinc-400">
                                    {new Date(task.feedback.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                            )}
                        </div>
                    </div>
                )}<div className={`flex flex-wrap items-center gap-2 border-b px-5 py-4 text-sm text-[#a4a4a4] sm:px-[30px] ${ALLYO_BORDER}`}>
                {isMultiDeliverable ? <><span>Isso é uma solicitação com</span><Tag>{task.deliverables?.length} entregas</Tag><span>com aprovação individual</span><Tag>{deliveryProfile?.approvalLabel || taskPresentation.approval}</Tag>{sourceRequired && <><span>e um pacote final de</span><Tag>{deliveryProfile?.sourceLabel || taskPresentation.editable}</Tag></>}</> : <><span>Isso é uma solicitação para</span><Tag>{taskPresentation.label}</Tag><span>com</span><Tag>{taskItemCount} {taskPresentation.itemLabel}{taskItemCount === 1 ? '' : 's'}</Tag><span>para aprovação em</span><Tag>{deliveryProfile?.approvalLabel || taskPresentation.approval}</Tag>{sourceRequired && <><span>e</span><Tag>{deliveryProfile?.sourceLabel || taskPresentation.editable}</Tag></>}</>}
            </div>

            {project && <AllyoProjectFlow project={project} currentTaskId={task.id} />}

            <div className="grid min-w-0 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]">
                <main className={`min-w-0 border-r ${ALLYO_BORDER}`}>
                    <CollapsibleSection title="Descrição" open={descriptionOpen} onToggle={() => setDescriptionOpen((value) => !value)}>
                        <div className="space-y-5 text-sm leading-6 text-[#777] dark:text-zinc-400">
                            {briefing.map((block) => <BriefingBlock key={block.title} title={block.title} items={block.items} />)}
                            <BriefingBlock title="4. Identidade visual" items={['Usar paleta, tipografia e logos oficiais do cliente', 'Manter consistência com os materiais já aprovados']} />
                        </div>
                    </CollapsibleSection>

                    <div className={`flex w-full items-center justify-between border-b px-5 py-4 sm:px-[30px] ${ALLYO_BORDER}`}>
                        <button type="button" onClick={() => setOrderOpen((value) => !value)} className="flex items-center gap-3 text-left">
                            <h2 className="font-season text-lg font-normal">Visualização do pedido {isMultiDeliverable && <span className="text-[#888]">({task.deliverables?.length})</span>}</h2>
                            {orderOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                    </div>
                    {activeReviewDesign && (status === 'Alteração' || hasClientAnnotations) && (
                        <div className={`mx-5 my-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 text-xs sm:mx-[30px] ${status === 'Alteração' ? 'border-amber-300 bg-amber-50/90 text-amber-950 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200' : 'border-emerald-200 bg-emerald-50/70 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200'}`}>
                            <div className="flex items-center gap-3">
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${status === 'Alteração' ? 'bg-amber-500 text-white' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'}`}>
                                    <FilePenLine size={17} />
                                </span>
                                <div>
                                    <strong className="block text-sm font-semibold">
                                        {status === 'Alteração' ? 'Revisão solicitada pelo cliente' : `Feedback em ${activeReviewDesign.name}`}
                                    </strong>
                                    <p className="mt-0.5 text-xs opacity-80">
                                        {status === 'Alteração'
                                            ? `Revise o feedback da versão anterior e envie o material atualizado na ${latestVersionLabel}.`
                                            : `${totalComments} ${totalComments === 1 ? 'comentário' : 'comentários'} e ${totalAnnotations} ${totalAnnotations === 1 ? 'marcação' : 'marcações'} no arquivo.`}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setReviewModalOpen(true)}
                                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition ${status === 'Alteração' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#003f35] hover:bg-[#12584b]'}`}
                            >
                                <Eye size={14} /> Revisar feedback
                            </button>
                        </div>
                    )}
                    {!permissionsLoaded && orderOpen && <div className="px-5 py-10 text-center text-xs text-[#8b918b] sm:px-[30px]">Carregando a experiência desta tarefa...</div>}
                    {permissionsLoaded && orderOpen && (isClientView
                        ? <AllyoClientDeliveryWorkspace task={presentationTask} designs={taskDesigns} itemCountOverride={catalogStructuredQuantity} onReview={() => setReviewModalOpen(true)} />
                        : isMultiDeliverable && task.deliverables
                        ? <AllyoMultiDeliverableWorkspace
                            key={task.id}
                            deliverables={task.deliverables}
                            onProgressChange={({ ready, sourceFileUrl, isUploading, reviewFiles }) => {
                                setReadyDeliverables(ready);
                                setMultiSourceFileUrl(sourceFileUrl);
                                setIsMultiFileUploading(isUploading);
                                setMultiReviewFiles(reviewFiles);
                            }}
                            onUploadFile={async (file, onProgress) => {
                                const projectId = task.projectId || liveDemand?.id || task.id;
                                return allyoService.uploadDeliveryFile(projectId, file, onProgress);
                            }}
                            disabled={!isTaskInProgress}
                            disabledReason="O envio de arquivos fica liberado apenas quando a tarefa estiver com o status 'Em andamento' ou 'Alteração'."
                            versionOptions={versionOptions}
                            currentVersion={deliveryVersion}
                            sourceRequired={sourceRequired}
                            sourceAccept={deliveryProfile?.sourceAccept}
                            allowSourceLink={deliveryProfile?.allowSourceLink ?? true}
                          />
                        : <DeliveryWorkspace kind={deliverableKind} task={presentationTask} itemCountOverride={catalogStructuredQuantity} approvalLabel={deliveryProfile?.approvalLabel} sourceLabel={deliveryProfile?.sourceLabel} />)}
                    {permissionsLoaded && !isClientView && !isMultiDeliverable && (
                        <VersionBundle
                            kind={deliverableKind}
                            version={deliveryVersion}
                            versionOptions={versionOptions}
                            onVersionChange={(v) => {
                                setSelectedVersionByUser(v);
                                setFilesByVersion((current) => current[v] ? current : { ...current, [v]: { approval: [], source: [] } });
                            }}
                            approvalFiles={currentFiles.approval}
                            sourceFiles={currentFiles.source}
                            onApprovalFilesChange={(files) => updateVersionFiles('approval', files)}
                            onSourceFilesChange={(files) => updateVersionFiles('source', files)}
                            onUploadApprovalFile={async (file, onProgress) => {
                                const projectId = task.projectId || liveDemand?.id || task.id;
                                return allyoService.uploadDeliveryFile(projectId, file, onProgress);
                            }}
                            onUploadSourceFile={async (file, onProgress) => {
                                const projectId = task.projectId || liveDemand?.id || task.id;
                                return allyoService.uploadDeliveryFile(projectId, file, onProgress);
                            }}
                            expectedApprovalFiles={isCarouselSequence ? taskItemCount : 1}
                            approvalAcceptOverride={deliveryProfile?.approvalAccept}
                            sourceAcceptOverride={deliveryProfile?.sourceAccept}
                            approvalDescriptionOverride={deliveryProfile ? `Material final conforme o catálogo · ${deliveryProfile.approvalLabel}` : undefined}
                            sourceDescriptionOverride={deliveryProfile ? `${sourceRequired ? 'Fonte de trabalho obrigatória' : 'Opcional para este produto'} · ${deliveryProfile.sourceLabel}` : undefined}
                            sourceRequired={sourceRequired}
                            allowSourceLink={deliveryProfile?.allowSourceLink}
                            disabled={!isTaskInProgress || !isCurrentVersionSelected}
                            disabledReason={!isCurrentVersionSelected ? `A ${deliveryVersion} está disponível somente para consulta. Anexe os arquivos na ${latestVersionLabel}.` : "O envio de arquivos fica liberado apenas quando a tarefa estiver com o status 'Em andamento' ou 'Alteração'."}
                        />
                    )}
                    {permissionsLoaded && !isClientView && <div className="mx-5 mb-12 mt-6 rounded-[14px] border border-[#dfe5d6] bg-[#fafcf7] p-5 sm:mx-[30px] sm:mb-16 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <div className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaf1dd] text-[#71864b] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]"><ShieldCheck size={17} /></span>
                            <div><strong className="text-sm font-semibold">Pacote seguro para aprovação</strong><p className="mt-1 text-xs leading-5 text-[#747b72] dark:text-zinc-400">Na {latestVersionLabel}, envie {sourceRequired ? 'o material final e o arquivo aberto/editável correspondente' : 'o material final nos formatos definidos pelo catálogo'}. Versões anteriores ficam protegidas para preservar o histórico.</p></div>
                        </div>
                    </div>}
                </main>

                <aside className="min-w-0 bg-[#fdfdfc] dark:bg-zinc-950">
                    <div className="sticky top-[139px]">
                        <div className={`border-b p-5 ${ALLYO_BORDER}`}>
                            <span className="text-[11px] font-bold uppercase tracking-[.08em] text-[#829454]">{isInactive ? 'Tarefa inativa' : isCurrentlyBlocked ? 'Dependência do projeto' : 'Próxima ação'}</span>
                            <h2 className="mt-2 font-season text-xl font-normal">{isClientView ? activeReviewDesign ? 'Revisar a versão enviada' : 'Aguardar a primeira versão' : isInactive ? 'Execução pausada' : isCurrentlyBlocked ? 'Aguardando liberação' : status === 'Nova' ? 'Iniciar a tarefa' : status === 'Em revisão' ? 'Aguardar retorno do cliente' : status === 'Entregue' ? 'Tarefa concluída' : status === 'Alteração' ? 'Preparar versão revisada' : isMultiDeliverable ? 'Preparar pedidos para revisão' : requestCopy.next}</h2>
                            <p className="mt-2 text-[13px] leading-5 text-[#707070] dark:text-zinc-400">{isClientView ? activeReviewDesign ? taskPresentation.clientHelper : 'O time criativo está preparando o material. Você será avisado quando a versão estiver pronta para revisão.' : isInactive ? 'A equipe administrativa pode reativar esta tarefa pelo menu de ações.' : isCurrentlyBlocked ? `Esta tarefa será liberada quando ${blockingTasks.join(' e ') || 'o bloqueio administrativo'} for removido.` : status === 'Nova' ? 'Mude o status para “Em andamento” quando começar a produção.' : status === 'Em revisão' ? 'A entrega já foi enviada. Você será avisado quando o cliente responder.' : status === 'Entregue' ? 'Nenhuma ação é necessária neste momento.' : status === 'Alteração' ? `Aplique o feedback na ${latestVersionLabel}, anexe o material e envie novamente.` : isMultiDeliverable ? 'Anexe os arquivos finalizados em cada pedido. Somente os itens prontos serão enviados para revisão.' : requestCopy.helper}</p>
                            {isClientView && activeReviewDesign && <button type="button" onClick={() => setReviewModalOpen(true)} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#131f15] px-4 py-3 text-[13px] font-semibold text-white transition hover:bg-[#283d2b]"><Eye size={15} /> Abrir revisão</button>}
                            {!isClientView && isTaskInProgress && !isCurrentlyBlocked && !isInactive && <button
                                type="button"
                                disabled={!canSendForReview}
                                onClick={() => setConfirmModalOpen(true)}
                                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#131f15] px-4 py-3 text-[13px] font-semibold text-white transition hover:bg-[#283d2b] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {isSendingReview ? (
                                    <>
                                        <Loader2 size={15} className="animate-spin text-[#d0f08e]" />
                                        Enviando para revisão...
                                    </>
                                ) : isAnyFileUploading ? (
                                    <>
                                        <Loader2 size={15} className="animate-spin text-[#d0f08e]" />
                                        Fazendo upload dos anexos...
                                    </>
                                ) : (
                                    <>
                                        <Send size={15} />
                                        {isMultiDeliverable
                                            ? readyDeliverables > 0
                                                ? `Enviar ${readyDeliverables} ${readyDeliverables === 1 ? 'pedido' : 'pedidos'} para revisão`
                                                : 'Nenhum pedido pronto'
                                            : isCarouselSequence
                                            ? `Enviar ${taskItemCount} cards para revisão`
                                            : 'Enviar para revisão'}
                                    </>
                                )}
                            </button>}
                            {!isClientView && isTaskInProgress && !isCurrentlyBlocked && !isInactive && !canSendForReview && (
                                <p className="mt-2 text-center text-xs text-[#8f8f8f]">
                                    {isAnyFileUploading
                                        ? 'Aguarde o upload dos arquivos terminar para enviar.'
                                        : isSendingReview
                                        ? 'Processando entrega na nuvem...'
                                        : !isCurrentVersionSelected
                                        ? `A ${deliveryVersion} é somente para consulta. Selecione a ${latestVersionLabel} para enviar.`
                                        : !hasApprovalReady && !hasSourceReady
                                        ? 'Anexe o arquivo para aprovação e o arquivo aberto/editável.'
                                        : !hasApprovalReady
                                        ? isCarouselSequence
                                            ? `Anexe exatamente ${taskItemCount} imagens na ordem dos cards ou um PDF único com ${taskItemCount} páginas.`
                                            : 'Anexe o arquivo para aprovação.'
                                        : sourceRequired ? 'Anexe o arquivo aberto/editável para liberar o envio.' : 'Anexe o material final para liberar o envio.'}
                                </p>
                            )}
                        </div>
                        <AllyoTaskResources resources={taskResources} onOpenTask={openReferencedTask} />
                        <button type="button" onClick={() => setBrandKitOpen((value) => !value)} className={`flex w-full items-center justify-between border-b p-5 text-left ${ALLYO_BORDER}`}><span className="font-season text-base">Brand Kit</span>{brandKitOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button>
                        {brandKitOpen && <div className={`border-b px-5 py-4 text-xs leading-5 text-[#7f7f7f] dark:text-zinc-400 ${ALLYO_BORDER}`}><p>Logo principal e negativo</p><p>Paleta: verde, grafite e branco</p><p>Tipografia: Plus Jakarta Sans</p></div>}
                    </div>
                </aside>
            </div></div>
            <AllyoSubmitConfirmModal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmReviewSend}
                isLoading={isSendingReview}
                description={isCarouselSequence
                    ? `Confirme a ordem dos ${taskItemCount} cards e o arquivo aberto da ${deliveryVersion}. A sequência completa será enviada para aprovação.`
                    : sourceRequired
                    ? undefined
                    : `Confirme o material final da ${deliveryVersion}. Este produto não exige arquivo aberto/editável.`}
            />
            <AllyoReviewModal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                design={activeReviewDesign}
                availableVersions={taskDesigns}
                taskName={task.name}
            />
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

const AllyoTaskDetailView = (props: { userName?: string }) => (
    <TaskDetailErrorBoundary>
        <AllyoTaskDetailViewInner {...props} />
    </TaskDetailErrorBoundary>
);

export default AllyoTaskDetailView;
