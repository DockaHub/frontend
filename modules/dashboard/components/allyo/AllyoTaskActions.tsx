import { useEffect, useRef, useState } from 'react';
import {
    Activity, Ban, BriefcaseBusiness, CheckCircle2, Copy, EllipsisVertical,
    Link2, LockKeyhole, Pencil, Power, Trash2, UserRoundCog,
} from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { useToast } from '../../../../context/ToastContext';
import { allyoService } from '../../../../services/allyoService';
import { AllyoField, AllyoInput, AllyoPrimaryButton, AllyoSecondaryButton, AllyoSelect } from './AllyoForm';
import type { AllyoTask } from './AllyoUI';
import { addTaskActivity, readTaskActivity } from './allyoTaskActivity';

type Confirmation = 'deactivate-project' | 'deactivate-task' | 'delete-task' | null;

interface AllyoTaskActionsProps {
    task: AllyoTask;
    currentStatus: string;
    userName?: string;
    onTaskEdited: (changes: Partial<AllyoTask>) => void;
    onStatusChanged: (status: string) => void;
    onDeleted: () => void;
}

const confirmationCopy: Record<Exclude<Confirmation, null>, { title: string; description: string; action: string; danger?: boolean }> = {
    'deactivate-project': {
        title: 'Inativar projeto',
        description: 'O projeto e suas tarefas deixarão de aparecer entre os trabalhos ativos. O histórico será preservado.',
        action: 'Inativar projeto',
    },
    'deactivate-task': {
        title: 'Inativar tarefa',
        description: 'A tarefa sairá do fluxo ativo, mas continuará disponível no histórico do projeto.',
        action: 'Inativar tarefa',
    },
    'delete-task': {
        title: 'Excluir tarefa',
        description: 'Esta ação remove a tarefa do projeto e não pode ser desfeita.',
        action: 'Excluir definitivamente',
        danger: true,
    },
};

const AllyoTaskActions = ({ task, currentStatus, userName, onTaskEdited, onStatusChanged, onDeleted }: AllyoTaskActionsProps) => {
    const { addToast } = useToast();
    const rootRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [modal, setModal] = useState<'edit' | 'responsible' | 'project' | 'activity' | null>(null);
    const [confirmation, setConfirmation] = useState<Confirmation>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [title, setTitle] = useState(task.name);
    const [team, setTeam] = useState(task.category);
    const [responsible, setResponsible] = useState(task.creative);
    const [projectStatus, setProjectStatus] = useState('Em andamento');
    const [projectDeadline, setProjectDeadline] = useState('');
    const activities = modal === 'activity' ? readTaskActivity(task.id).slice().reverse() : [];
    const author = userName?.trim() || 'Equipe Allyo';
    const isBlocked = currentStatus === 'Bloqueada';
    const isInactive = currentStatus === 'Inativa';

    useEffect(() => {
        setTitle(task.name);
        setTeam(task.category);
        setResponsible(task.creative);
    }, [task.category, task.creative, task.id, task.name]);

    useEffect(() => {
        const closeOnOutsideClick = (event: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('mousedown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, []);

    const showModal = (next: typeof modal) => {
        setOpen(false);
        if (next === 'edit') {
            setTitle(task.name);
            setTeam(task.category);
        }
        if (next === 'responsible') setResponsible(task.creative);
        if (next === 'project') {
            setProjectStatus(task.status === 'Concluída' ? 'Concluído' : task.status === 'Em revisão' ? 'Em revisão' : 'Em andamento');
            setProjectDeadline('');
        }
        setModal(next);
    };

    const recordAction = (text: string) => addTaskActivity(task.id, {
        type: 'management_action',
        author,
        role: 'system',
        text,
    });

    const saveTask = async (event: React.FormEvent) => {
        event.preventDefault();
        const normalizedTitle = title.trim();
        const normalizedTeam = team.trim();
        if (normalizedTitle.length < 2 || !normalizedTeam) return;
        setIsSaving(true);
        try {
            await allyoService.updateTask(task.id, { title: normalizedTitle, team: normalizedTeam });
            onTaskEdited({ name: normalizedTitle, category: normalizedTeam });
            recordAction(`Editou a tarefa: título e equipe responsável foram atualizados.`);
            setModal(null);
            addToast({ type: 'success', title: 'Tarefa atualizada', message: 'As alterações foram salvas no projeto.' });
        } catch (error: any) {
            addToast({ type: 'error', title: 'Não foi possível editar a tarefa', message: error.response?.data?.message || 'Tente novamente em alguns instantes.' });
        } finally {
            setIsSaving(false);
        }
    };

    const saveResponsible = async (event: React.FormEvent) => {
        event.preventDefault();
        const normalizedResponsible = responsible.trim();
        if (!normalizedResponsible) return;
        setIsSaving(true);
        try {
            await allyoService.assignProjectTeam(task.projectId, [normalizedResponsible]);
            onTaskEdited({ creative: normalizedResponsible });
            recordAction(`Alterou o responsável da tarefa para “${normalizedResponsible}”.`);
            setModal(null);
            addToast({ type: 'success', title: 'Responsável atualizado' });
        } catch (error: any) {
            addToast({ type: 'error', title: 'Não foi possível alterar o responsável', message: error.response?.data?.message || 'Tente novamente.' });
        } finally {
            setIsSaving(false);
        }
    };

    const saveProject = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSaving(true);
        try {
            await allyoService.updateProjectStatus(task.projectId, {
                status: projectStatus,
                ...(projectDeadline ? { deadline: projectDeadline } : {}),
            });
            recordAction(`Atualizou o projeto “${task.projectName}” para ${projectStatus}.`);
            setModal(null);
            addToast({ type: 'success', title: 'Projeto atualizado', message: 'Status e prazo foram sincronizados.' });
        } catch (error: any) {
            addToast({ type: 'error', title: 'Não foi possível atualizar o projeto', message: error.response?.data?.message || 'Tente novamente.' });
        } finally {
            setIsSaving(false);
        }
    };

    const duplicateTask = async () => {
        setOpen(false);
        setIsSaving(true);
        try {
            await allyoService.createProjectTask(task.projectId, {
                title: `${task.name} (cópia)`,
                team: task.category,
                status: 'A iniciar',
            });
            recordAction('Criou uma cópia desta tarefa no mesmo projeto.');
            addToast({ type: 'success', title: 'Cópia criada', message: 'A nova tarefa foi adicionada ao projeto como “A iniciar”.' });
        } catch (error: any) {
            addToast({ type: 'error', title: 'Não foi possível criar a cópia', message: error.response?.data?.message || 'Tente novamente.' });
        } finally {
            setIsSaving(false);
        }
    };

    const copyLink = async () => {
        setOpen(false);
        try {
            await navigator.clipboard.writeText(window.location.href);
            addToast({ type: 'success', title: 'Link copiado', message: 'O acesso à tarefa está pronto para compartilhar.' });
        } catch {
            addToast({ type: 'error', title: 'Não foi possível copiar o link' });
        }
    };

    const toggleBlocked = async () => {
        setOpen(false);
        const nextStatus = isBlocked ? 'A iniciar' : 'Bloqueada';
        setIsSaving(true);
        try {
            await allyoService.updateTask(task.id, { status: nextStatus });
            onStatusChanged(nextStatus === 'A iniciar' ? 'Nova' : nextStatus);
            recordAction(isBlocked ? 'Removeu o bloqueio da tarefa.' : 'Bloqueou a tarefa.');
            addToast({ type: 'success', title: isBlocked ? 'Bloqueio removido' : 'Tarefa bloqueada' });
        } catch (error: any) {
            addToast({ type: 'error', title: 'Não foi possível alterar o bloqueio', message: error.response?.data?.message || 'Tente novamente.' });
        } finally {
            setIsSaving(false);
        }
    };

    const reactivateTask = async () => {
        setOpen(false);
        setIsSaving(true);
        try {
            await allyoService.updateTask(task.id, { status: 'A iniciar' });
            onStatusChanged('Nova');
            recordAction('Reativou a tarefa.');
            addToast({ type: 'success', title: 'Tarefa reativada' });
        } catch (error: any) {
            addToast({ type: 'error', title: 'Não foi possível reativar a tarefa', message: error.response?.data?.message || 'Tente novamente.' });
        } finally {
            setIsSaving(false);
        }
    };

    const runConfirmedAction = async () => {
        if (!confirmation) return;
        const selected = confirmation;
        setIsSaving(true);
        try {
            if (selected === 'deactivate-project') {
                await allyoService.updateProjectStatus(task.projectId, { status: 'Inativo' });
                recordAction(`Inativou o projeto “${task.projectName}”.`);
                addToast({ type: 'success', title: 'Projeto inativado', message: 'O histórico do projeto foi preservado.' });
            } else if (selected === 'deactivate-task') {
                await allyoService.updateTask(task.id, { status: 'Inativa' });
                onStatusChanged('Inativa');
                recordAction('Inativou a tarefa.');
                addToast({ type: 'success', title: 'Tarefa inativada' });
            } else {
                await allyoService.deleteTask(task.id);
                addToast({ type: 'success', title: 'Tarefa excluída' });
                onDeleted();
            }
            setConfirmation(null);
        } catch (error: any) {
            addToast({ type: 'error', title: 'A ação não pôde ser concluída', message: error.response?.data?.message || 'Tente novamente.' });
        } finally {
            setIsSaving(false);
        }
    };

    const confirmCopy = confirmation ? confirmationCopy[confirmation] : null;

    return (
        <>
            <div ref={rootRef} className="relative shrink-0">
                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    disabled={isSaving}
                    aria-label="Abrir ações administrativas da tarefa"
                    aria-expanded={open}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${open ? 'border-[#9db669] bg-[#f3f7ea] text-[#61793a] shadow-[0_0_0_3px_rgba(157,182,105,.13)] dark:bg-[#9db669]/15' : 'border-[#dedede] text-[#505550] hover:border-[#9db669] hover:text-[#657f3d] dark:border-zinc-700 dark:text-zinc-300'}`}
                >
                    <EllipsisVertical size={17} />
                </button>

                {open && (
                    <div className="absolute right-0 top-[calc(100%+9px)] z-[90] w-[286px] overflow-hidden rounded-[14px] border border-[#e1e3de] bg-white p-1.5 shadow-[0_20px_55px_rgba(19,31,21,.18)] animate-in fade-in zoom-in-95 duration-150 dark:border-zinc-700 dark:bg-zinc-900">
                        <MenuLabel>Gerenciamento</MenuLabel>
                        <MenuItem icon={<Pencil size={15} />} label="Editar tarefa" onClick={() => showModal('edit')} />
                        <MenuItem icon={<Copy size={15} />} label="Criar cópia" onClick={() => void duplicateTask()} />
                        <MenuItem icon={<Activity size={15} />} label="Atividades da tarefa" onClick={() => showModal('activity')} />
                        <MenuItem icon={<Link2 size={15} />} label="Compartilhar tarefa" onClick={() => void copyLink()} />

                        <div className="my-1.5 h-px bg-[#eceee9] dark:bg-zinc-800" />
                        <MenuItem icon={<BriefcaseBusiness size={15} />} label="Gerenciar projeto" onClick={() => showModal('project')} />
                        <MenuItem icon={<UserRoundCog size={15} />} label="Responsáveis" onClick={() => showModal('responsible')} />
                        <MenuItem icon={<LockKeyhole size={15} />} label={isBlocked ? 'Remover bloqueio' : 'Bloquear tarefa'} onClick={() => void toggleBlocked()} />

                        <div className="my-1.5 h-px bg-[#eceee9] dark:bg-zinc-800" />
                        <MenuItem icon={isInactive ? <CheckCircle2 size={15} /> : <Power size={15} />} label={isInactive ? 'Reativar tarefa' : 'Inativar tarefa'} onClick={() => {
                            if (isInactive) void reactivateTask();
                            else {
                                setOpen(false);
                                setConfirmation('deactivate-task');
                            }
                        }} danger={!isInactive} />
                        <MenuItem icon={<Ban size={15} />} label="Inativar projeto" onClick={() => { setOpen(false); setConfirmation('deactivate-project'); }} danger />
                        <MenuItem icon={<Trash2 size={15} />} label="Excluir tarefa" onClick={() => { setOpen(false); setConfirmation('delete-task'); }} danger />
                    </div>
                )}
            </div>

            <Modal isOpen={modal === 'edit'} onClose={() => setModal(null)} title="Editar tarefa" size="md" footer={<><AllyoSecondaryButton type="button" onClick={() => setModal(null)}>Cancelar</AllyoSecondaryButton><AllyoPrimaryButton type="submit" form="allyo-edit-task" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar alterações'}</AllyoPrimaryButton></>}>
                <form id="allyo-edit-task" onSubmit={saveTask} className="space-y-4">
                    <p className="text-sm leading-6 text-[#777] dark:text-zinc-400">Altere as informações operacionais sem sair do contexto do projeto.</p>
                    <AllyoField label="Nome da tarefa" required><AllyoInput required minLength={2} value={title} onChange={(event) => setTitle(event.target.value)} /></AllyoField>
                    <AllyoField label="Equipe ou especialidade" required><AllyoInput required value={team} onChange={(event) => setTeam(event.target.value)} placeholder="Ex.: Design, Motion ou Storyboard" /></AllyoField>
                </form>
            </Modal>

            <Modal isOpen={modal === 'responsible'} onClose={() => setModal(null)} title="Editar responsáveis" size="sm" footer={<><AllyoSecondaryButton type="button" onClick={() => setModal(null)}>Cancelar</AllyoSecondaryButton><AllyoPrimaryButton type="submit" form="allyo-edit-responsible" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Alterar'}</AllyoPrimaryButton></>}>
                <form id="allyo-edit-responsible" onSubmit={saveResponsible}>
                    <p className="mb-4 text-sm leading-6 text-[#777] dark:text-zinc-400">Defina o time, CQS ou Art Director responsável por esta tarefa.</p>
                    <AllyoField label="Responsável" required><AllyoInput required value={responsible} onChange={(event) => setResponsible(event.target.value)} placeholder="Nome do CAM, CQS ou Art Director" /></AllyoField>
                </form>
            </Modal>

            <Modal isOpen={modal === 'project'} onClose={() => setModal(null)} title="Gerenciar projeto" size="sm" footer={<><AllyoSecondaryButton type="button" onClick={() => setModal(null)}>Cancelar</AllyoSecondaryButton><AllyoPrimaryButton type="submit" form="allyo-manage-project" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar projeto'}</AllyoPrimaryButton></>}>
                <form id="allyo-manage-project" onSubmit={saveProject} className="space-y-4">
                    <div className="rounded-[12px] border border-[#e5e5e5] bg-[#fafbf8] p-4 dark:border-zinc-800 dark:bg-zinc-950"><span className="text-[9px] font-bold uppercase tracking-[.08em] text-[#829454]">Projeto</span><strong className="mt-1 block text-sm">{task.projectName}</strong></div>
                    <AllyoField label="Status"><AllyoSelect value={projectStatus} onChange={(event) => setProjectStatus(event.target.value)}><option>Em andamento</option><option>Em revisão</option><option>Concluído</option><option>Rascunho</option></AllyoSelect></AllyoField>
                    <AllyoField label="Novo prazo" hint="opcional"><AllyoInput type="date" value={projectDeadline} onChange={(event) => setProjectDeadline(event.target.value)} /></AllyoField>
                </form>
            </Modal>

            <Modal isOpen={modal === 'activity'} onClose={() => setModal(null)} title="Atividades da tarefa" size="md">
                {activities.length > 0 ? <div className="relative space-y-1 before:absolute before:bottom-4 before:left-[17px] before:top-4 before:w-px before:bg-[#dde1d8] dark:before:bg-zinc-700">{activities.map((activity) => <div key={activity.id} className="relative flex gap-3 rounded-[12px] px-1 py-3"><span className="z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d9dfd0] bg-white text-[#738a4c] dark:border-zinc-700 dark:bg-zinc-900"><Activity size={13} /></span><span className="min-w-0"><strong className="block text-xs font-semibold">{activity.author}</strong><span className="mt-1 block text-sm leading-5 text-[#525852] dark:text-zinc-300">{activity.text}</span><time className="mt-1 block text-[10px] text-[#999]">{new Date(activity.createdAt).toLocaleString('pt-BR')}</time></span></div>)}</div> : <div className="flex min-h-40 flex-col items-center justify-center text-center"><Activity size={24} className="text-[#9db669]" /><strong className="mt-3 text-sm">Nenhuma atividade registrada</strong><span className="mt-1 text-xs text-[#888]">As alterações administrativas aparecerão aqui.</span></div>}
            </Modal>

            <Modal isOpen={Boolean(confirmation)} onClose={() => setConfirmation(null)} title={confirmCopy?.title || 'Confirmar ação'} size="sm" footer={<><AllyoSecondaryButton type="button" onClick={() => setConfirmation(null)}>Cancelar</AllyoSecondaryButton><button type="button" disabled={isSaving} onClick={() => void runConfirmedAction()} className={`inline-flex h-10 items-center justify-center rounded-full px-5 text-xs font-semibold text-white transition disabled:opacity-50 ${confirmCopy?.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0d1e1d] hover:bg-[#1d3432] dark:bg-[#9db669] dark:text-[#0d1e1d]'}`}>{isSaving ? 'Processando...' : confirmCopy?.action}</button></>}>
                <p className="text-sm leading-6 text-[#666] dark:text-zinc-300">{confirmCopy?.description}</p>
            </Modal>
        </>
    );
};

const MenuLabel = ({ children }: { children: React.ReactNode }) => <div className="px-3 pb-1.5 pt-2 text-[9px] font-bold uppercase tracking-[.09em] text-[#999]">{children}</div>;

const MenuItem = ({ icon, label, onClick, danger = false }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) => (
    <button type="button" onClick={onClick} className={`flex w-full items-center gap-3 rounded-[9px] px-3 py-2.5 text-left text-xs font-medium transition ${danger ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30' : 'text-[#202520] hover:bg-[#f4f6f0] dark:text-zinc-200 dark:hover:bg-zinc-800'}`}>
        <span className="flex h-5 w-5 items-center justify-center">{icon}</span><span>{label}</span>
    </button>
);

export default AllyoTaskActions;
