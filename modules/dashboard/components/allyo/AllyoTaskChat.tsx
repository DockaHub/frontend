import { FormEvent, useEffect, useRef, useState } from 'react';
import { FilePenLine, MessageCircle, Send } from 'lucide-react';
import type { AllyoTask } from './AllyoUI';
import { addTaskActivity, readTaskActivity, subscribeToTaskActivity, type AllyoActivity } from './allyoTaskActivity';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

const AllyoTaskChat = ({ task, userName }: { task: AllyoTask; userName?: string }) => {
    const [history, setHistory] = useState<AllyoActivity[]>(() => readTaskActivity(task.id));
    const [draft, setDraft] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const refresh = () => setHistory(readTaskActivity(task.id));
        refresh();
        return subscribeToTaskActivity(task.id, refresh);
    }, [task.id]);

    useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), [history.length]);

    const sendMessage = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const text = draft.trim();
        if (!text) return;
        addTaskActivity(task.id, { type: 'message', author: userName?.trim() || task.creative, role: 'creative', text });
        setDraft('');
    };

    let previousDate = '';
    return (
        <section className="flex min-h-[620px] flex-col bg-[#f7f8f7] px-4 py-5 sm:px-[30px] sm:py-7 dark:bg-zinc-950" aria-label={`Mensagens da tarefa ${task.name}`}>
            <div className="mx-auto flex w-full max-w-[960px] flex-1 flex-col gap-3 rounded-[14px] bg-white px-4 py-6 shadow-sm sm:px-8 dark:bg-zinc-900">
                {history.length === 0 && <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center py-16 text-center text-[#858b88] dark:text-zinc-400"><MessageCircle size={30} strokeWidth={1.5} /><h2 className="mt-4 font-season text-xl text-[#17211c] dark:text-white">Conversa da tarefa</h2><p className="mt-2 text-sm leading-6">As mensagens e os eventos de aprovação desta tarefa aparecem aqui, em ordem cronológica.</p></div>}
                {history.map((item) => {
                    const date = new Date(item.createdAt);
                    const dateKey = date.toDateString();
                    const showDate = dateKey !== previousDate;
                    previousDate = dateKey;
                    return (
                        <div key={item.id}>
                            {showDate && <div className="mb-5 mt-2 flex items-center gap-3 text-center text-xs text-[#909590]"><span className="h-px flex-1 bg-[#dadfda] dark:bg-zinc-700" /><span>{dateFormatter.format(date)}</span><span className="h-px flex-1 bg-[#dadfda] dark:bg-zinc-700" /></div>}
                            {item.type === 'approval_sent' ? (
                                <div className="mx-auto my-5 max-w-[640px] rounded-[10px] border border-[#e1e5df] bg-[#fbfcfa] px-5 py-4 dark:border-zinc-700 dark:bg-zinc-800"><span className="text-[10px] font-semibold uppercase tracking-[.08em] text-[#8b938b]">Material enviado para aprovação</span><p className="mt-1 font-season text-lg text-[#17211c] dark:text-white">{task.name}</p><p className="mt-2 text-xs text-[#858b88]">{item.author} · {item.version} · {timeFormatter.format(date)}</p><p className="mt-3 text-sm text-[#435146]">{item.text}</p></div>
                            ) : item.type === 'client_file_change' ? (
                                <div className="mx-auto my-5 max-w-[640px] rounded-[10px] border border-[#d5e5d8] bg-[#f2f8f3] px-5 py-4 dark:border-emerald-900 dark:bg-emerald-950/30"><div className="flex items-start gap-3"><span className="rounded-full bg-[#dceee0] p-2 text-[#30704b] dark:bg-emerald-900/50"><FilePenLine size={17} /></span><div className="min-w-0"><span className="text-[10px] font-semibold uppercase tracking-[.08em] text-[#4c8060]">Alterações no arquivo pelo cliente</span><p className="mt-1 break-words text-sm font-semibold text-[#183725] dark:text-emerald-100">{item.fileName || 'Arquivo da tarefa'}</p><p className="mt-1 text-sm text-[#435d4a] dark:text-emerald-200">{item.text}</p><p className="mt-2 text-xs text-[#6f8974]">{item.author}{item.version ? ` · ${item.version}` : ''} · {timeFormatter.format(date)}</p></div></div></div>
                            ) : (
                                <div className={`mb-5 flex ${item.role === 'creative' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[78%] ${item.role === 'creative' ? 'text-right' : ''}`}><div className="mb-1 flex items-center gap-2 text-xs text-[#5b625c]"><strong className="font-semibold">{item.author}</strong><span className="text-[10px] text-[#959b96]">{timeFormatter.format(date)}</span></div><p className={`whitespace-pre-wrap break-words rounded-[7px] px-4 py-3 text-left text-sm leading-6 text-[#203027] ${item.role === 'creative' ? 'bg-[#dff0e1] dark:bg-emerald-900/50 dark:text-emerald-50' : 'bg-[#f2f6f2] dark:bg-zinc-800 dark:text-zinc-100'}`}>{item.text}</p></div></div>
                            )}
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>
            <form onSubmit={sendMessage} className="mx-auto mt-3 w-full max-w-[960px] rounded-[14px] bg-white px-4 py-3 shadow-sm dark:bg-zinc-900"><label htmlFor="allyo-task-message" className="sr-only">Escreva sua mensagem</label><textarea id="allyo-task-message" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="Escreva sua mensagem..." rows={2} className="w-full resize-none bg-transparent py-1 text-sm leading-6 outline-none placeholder:text-[#959b96]" /><div className="flex items-center justify-between gap-3"><span className="text-[11px] text-[#9aa09a]">Enter para enviar · Shift + Enter para quebrar linha</span><button type="submit" disabled={!draft.trim()} className="inline-flex items-center gap-2 rounded-full bg-[#003f35] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#115b4e] disabled:cursor-not-allowed disabled:opacity-40"><Send size={14} /> Enviar</button></div><p className="mt-2 text-[11px] text-[#8a928b]">Prévia local: a mensagem fica neste navegador e ainda não chega ao cliente.</p></form>
        </section>
    );
};

export default AllyoTaskChat;
