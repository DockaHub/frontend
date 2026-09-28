import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { FilePenLine, MessageCircle, Send, CheckCircle2, Eye } from 'lucide-react';
import AllyoReviewModal from './AllyoReviewModal';
import type { AllyoDesignAsset } from '../../../../services/allyoService';
import type { AllyoTask } from './AllyoUI';
import { addTaskActivity, readTaskActivity, subscribeToTaskActivity, type AllyoActivity } from './allyoTaskActivity';
import { allyoService } from '../../../../services/allyoService';
import { socketService } from '../../../../services/socketService';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

const AllyoTaskChat = ({ task, userName }: { task: AllyoTask; userName?: string }) => {
    const [history, setHistory] = useState<AllyoActivity[]>(() => readTaskActivity(task.id));
    const [draft, setDraft] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [selectedReviewDesign, setSelectedReviewDesign] = useState<AllyoDesignAsset | null>(null);
    const [taskDesigns, setTaskDesigns] = useState<AllyoDesignAsset[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const refresh = () => setHistory(readTaskActivity(task.id));
        refresh();
        return subscribeToTaskActivity(task.id, refresh);
    }, [task.id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [history.length]);

    // Sincroniza anotações e entregas do servidor
    useEffect(() => {
        const currentProjectId = task.projectId || task.id;
        allyoService.getDemands().then((res) => {
            if (!res || !Array.isArray(res.demands)) return;
            const project = res.demands.find((d) => d.id === currentProjectId || d.tasksList?.some((t) => t.id === task.id));
            if (project && project.designs) {
                const designsForTask = project.designs.filter((d) => !d.taskId || d.taskId === task.id);
                setTaskDesigns(designsForTask);
                for (const d of designsForTask) {
                    if (d.comments && d.comments.length > 0) {
                        for (const c of d.comments) {
                            const currentList = readTaskActivity(task.id);
                            const exists = currentList.some((item) => item.text.includes(c.text));
                            if (!exists) {
                                addTaskActivity(task.id, {
                                    type: 'client_file_change',
                                    author: c.author || 'Cliente Allyo',
                                    role: 'client',
                                    text: `Anotação no arquivo: "${c.text}"`,
                                    fileName: d.name,
                                    version: d.version,
                                    designId: d.id,
                                });
                            }
                        }
                    }
                }
            }
        }).catch(() => {});
    }, [task.id, task.projectId]);

    const processRemoteMessage = useCallback((msg: any) => {
        if (!msg || !msg.text) return;
        // Ignora notificações automáticas de upload de arquivo com deliveryId
        if (msg.deliveryId != null && msg.role === 'Time criativo') return;

        const isCreativeLead = msg.role === 'Creative Lead';
        addTaskActivity(task.id, {
            id: msg.id ? `remote-msg-${msg.id}` : undefined,
            type: 'message',
            author: msg.person || (isCreativeLead ? 'Criativo' : 'Cliente Allyo'),
            role: isCreativeLead ? 'creative' : 'client',
            text: msg.text,
            createdAt: msg.createdAt || new Date().toISOString(),
        });
    }, [task.id]);

    const syncProjectMessages = useCallback(async () => {
        const currentProjectId = task.projectId || task.id;
        if (!currentProjectId) return;
        try {
            const res = await allyoService.getProjectMessages(currentProjectId);
            if (res && Array.isArray(res.messages)) {
                for (const msg of res.messages) {
                    processRemoteMessage(msg);
                }
            }
        } catch (err) {
            console.warn('[AllyoTaskChat] Erro ao sincronizar mensagens do projeto:', err);
        }
    }, [task.id, task.projectId, processRemoteMessage]);

    // Polling periódico e carga inicial das mensagens do projeto
    useEffect(() => {
        syncProjectMessages();
        const interval = setInterval(syncProjectMessages, 4000);
        return () => clearInterval(interval);
    }, [syncProjectMessages]);

    // Escuta eventos em tempo real do WebSocket ManySpace (disparados pelo Webhook da Allyo)
    useEffect(() => {
        socketService.connect();

        const handleRealtimeEvent = (event: any) => {
            const currentProjectId = task.projectId || task.id;
            if (event.projectId && event.projectId !== currentProjectId) {
                return;
            }

            if (event.type === 'MESSAGE_SENT') {
                const msg = event.data?.message;
                processRemoteMessage(msg);
            } else if (event.type === 'DESIGN_APPROVED') {
                addTaskActivity(task.id, {
                    type: 'approval_sent',
                    author: 'Cliente Allyo',
                    role: 'client',
                    version: 'Aprovado',
                    text: '✨ Design aprovado com sucesso pelo cliente no portal!',
                });
            } else if (event.type === 'REVIEW_COMMENT_ADDED') {
                const comment = event.data?.comment;
                const designName = event.data?.designName || 'Arquivo da entrega';
                const deliveryId = event.data?.deliveryId;
                addTaskActivity(task.id, {
                    type: 'client_file_change',
                    author: comment?.author || 'Cliente Allyo',
                    role: 'client',
                    text: comment?.text ? `Anotação com marcador: "${comment.text}"` : 'Fez uma anotação diretamente no arquivo.',
                    fileName: designName,
                    version: comment?.version ? `v${comment.version}` : undefined,
                    designId: deliveryId,
                });
            } else if (event.type === 'ANNOTATION_ADDED') {
                const designName = event.data?.designName || 'Arquivo da entrega';
                const deliveryId = event.data?.deliveryId;
                addTaskActivity(task.id, {
                    type: 'client_file_change',
                    author: 'Cliente Allyo',
                    role: 'client',
                    text: 'Adicionou marcações visuais diretamente sobre o arquivo.',
                    fileName: designName,
                    designId: deliveryId,
                });
            }
        };

        socketService.on('allyo:event', handleRealtimeEvent);
        return () => {
            socketService.off('allyo:event', handleRealtimeEvent);
        };
    }, [task.id, task.projectId, processRemoteMessage]);

    const openDesignReview = async (designId?: number, fileName?: string) => {
        if (designId) {
            const found = taskDesigns.find((d) => d.id === designId);
            if (found) {
                setSelectedReviewDesign(found);
                return;
            }
            try {
                const fetched = await allyoService.getDesignReview(designId);
                if (fetched) {
                    setSelectedReviewDesign(fetched);
                    return;
                }
            } catch {}
        }
        if (taskDesigns.length > 0) {
            setSelectedReviewDesign(taskDesigns[0]);
        } else {
            setSelectedReviewDesign({
                id: designId || 1,
                projectId: task.projectId || task.id,
                taskId: task.id,
                name: fileName || task.name,
                version: 'v1',
                color: '#d7ff70',
                approved: false,
                createdAt: new Date().toISOString(),
            });
        }
    };

    const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const text = draft.trim();
        if (!text || isSending) return;

        const author = userName?.trim() || task.creative || 'Levy';

        // 1. Atualização instantânea na interface local
        addTaskActivity(task.id, {
            type: 'message',
            author,
            role: 'creative',
            text,
        });
        setDraft('');

        // 2. Envio para a API do Allyo Space no Railway
        setIsSending(true);
        try {
            const projectId = task.projectId || task.id;
            const res = await allyoService.sendProjectMessage(projectId, {
                person: author,
                role: 'Creative Lead',
                initials: author.slice(0, 2).toUpperCase(),
                text,
            });
            if (res && res.id) {
                addTaskActivity(task.id, {
                    id: `remote-msg-${res.id}`,
                    type: 'message',
                    author,
                    role: 'creative',
                    text,
                    createdAt: res.createdAt,
                });
            }
        } catch (err) {
            console.warn('[AllyoTaskChat] Mensagem salva localmente, mas API Railway retornou:', err);
        } finally {
            setIsSending(false);
        }
    };

    let previousDate = '';
    return (
        <section className="flex min-h-[620px] flex-col bg-[#f7f8f7] px-4 py-5 sm:px-[30px] sm:py-7 dark:bg-zinc-950" aria-label={`Mensagens da tarefa ${task.name}`}>
            <div className="mx-auto flex w-full max-w-[960px] flex-1 flex-col gap-3 rounded-[14px] bg-white px-4 py-6 shadow-sm sm:px-8 dark:bg-zinc-900">
                {history.length === 0 && (
                    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center py-16 text-center text-[#858b88] dark:text-zinc-400">
                        <MessageCircle size={30} strokeWidth={1.5} />
                        <h2 className="mt-4 font-season text-xl text-[#17211c] dark:text-white">Conversa da tarefa</h2>
                        <p className="mt-2 text-sm leading-6">As mensagens e os eventos de aprovação desta tarefa aparecem aqui, em ordem cronológica.</p>
                    </div>
                )}
                {history.map((item) => {
                    const date = new Date(item.createdAt);
                    const dateKey = date.toDateString();
                    const showDate = dateKey !== previousDate;
                    previousDate = dateKey;
                    return (
                        <div key={item.id}>
                            {showDate && (
                                <div className="mb-5 mt-2 flex items-center gap-3 text-center text-xs text-[#909590]">
                                    <span className="h-px flex-1 bg-[#dadfda] dark:bg-zinc-700" />
                                    <span>{dateFormatter.format(date)}</span>
                                    <span className="h-px flex-1 bg-[#dadfda] dark:bg-zinc-700" />
                                </div>
                            )}
                            {item.type === 'approval_sent' ? (
                                <div className="mx-auto my-5 max-w-[640px] rounded-[10px] border border-emerald-200 bg-emerald-50/50 px-5 py-4 dark:border-emerald-800 dark:bg-emerald-950/20">
                                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                        <CheckCircle2 size={16} />
                                        <span className="text-[10px] font-semibold uppercase tracking-[.08em]">Status da Aprovação</span>
                                    </div>
                                    <p className="mt-1 font-season text-lg text-[#17211c] dark:text-white">{task.name}</p>
                                    <p className="mt-2 text-xs text-[#858b88]">{item.author} · {item.version} · {timeFormatter.format(date)}</p>
                                    <p className="mt-3 text-sm text-[#435146] dark:text-zinc-300">{item.text}</p>
                                </div>
                            ) : item.type === 'client_file_change' ? (
                                <div className="mx-auto my-5 max-w-[640px] rounded-[10px] border border-[#d5e5d8] bg-[#f2f8f3] px-5 py-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                                    <div className="flex items-start gap-3">
                                        <span className="rounded-full bg-[#dceee0] p-2 text-[#30704b] dark:bg-emerald-900/50"><FilePenLine size={17} /></span>
                                        <div className="min-w-0">
                                            <span className="text-[10px] font-semibold uppercase tracking-[.08em] text-[#4c8060]">Alterações no arquivo pelo cliente</span>
                                            <p className="mt-1 break-words text-sm font-semibold text-[#183725] dark:text-emerald-100">{item.fileName || 'Arquivo da tarefa'}</p>
                                            <p className="mt-1 text-sm text-[#435d4a] dark:text-emerald-200">{item.text}</p>
                                            <p className="mt-2 text-xs text-[#6f8974]">{item.author}{item.version ? ` · ${item.version}` : ''} · {timeFormatter.format(date)}</p>
                                            <div className="mt-3">
                                                <button
                                                    type="button"
                                                    onClick={() => openDesignReview(item.designId, item.fileName)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#20442c] px-3 py-1.5 text-xs font-semibold text-[#d0f08e] transition hover:bg-[#2b5a3b] shadow-sm"
                                                >
                                                    <Eye size={13} /> Ver anotações no arquivo
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={`mb-5 flex ${item.role === 'creative' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[78%] ${item.role === 'creative' ? 'text-right' : ''}`}>
                                        <div className="mb-1 flex items-center gap-2 text-xs text-[#5b625c]">
                                            <strong className="font-semibold">{item.author}</strong>
                                            <span className="text-[10px] text-[#959b96]">{timeFormatter.format(date)}</span>
                                        </div>
                                        <p className={`whitespace-pre-wrap break-words rounded-[7px] px-4 py-3 text-left text-sm leading-6 text-[#203027] ${item.role === 'creative' ? 'bg-[#dff0e1] dark:bg-emerald-900/50 dark:text-emerald-50' : 'bg-[#f2f6f2] dark:bg-zinc-800 dark:text-zinc-100'}`}>
                                            {item.text}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={sendMessage} className="mx-auto mt-3 w-full max-w-[960px] rounded-[14px] bg-white px-4 py-3 shadow-sm dark:bg-zinc-900">
                <label htmlFor="allyo-task-message" className="sr-only">Escreva sua mensagem</label>
                <textarea
                    id="allyo-task-message"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            event.currentTarget.form?.requestSubmit();
                        }
                    }}
                    placeholder="Escreva sua mensagem para o cliente..."
                    rows={2}
                    className="w-full resize-none bg-transparent py-1 text-sm leading-6 outline-none placeholder:text-[#959b96] dark:text-white"
                />
                <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] text-[#9aa09a]">Enter para enviar · Shift + Enter para quebrar linha</span>
                    <button
                        type="submit"
                        disabled={!draft.trim() || isSending}
                        className="inline-flex items-center gap-2 rounded-full bg-[#003f35] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#115b4e] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Send size={14} /> {isSending ? 'Enviando...' : 'Enviar'}
                    </button>
                </div>
            </form>
            <AllyoReviewModal
                isOpen={Boolean(selectedReviewDesign)}
                onClose={() => setSelectedReviewDesign(null)}
                design={selectedReviewDesign}
                taskName={task.name}
            />
        </section>
    );
};

export default AllyoTaskChat;
