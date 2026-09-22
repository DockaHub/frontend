import type { ReactNode } from 'react';
import { ChevronRight, FileArchive, FileText, Grid2X2, ImageIcon, Paperclip } from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';
import type { AllyoTaskResources as TaskResources } from './allyoTaskResourceData';

const AllyoTaskResources = ({ resources, onOpenTask }: { resources: TaskResources; onOpenTask: (taskId: string) => void }) => (
    <>
        <ResourceSection icon={<Grid2X2 size={15} />} title="Referências de tarefas" description="Tarefas anteriores adicionadas pelo cliente">
            {resources.references.length > 0 ? <div className="space-y-2">{resources.references.map((reference) => {
                const content = <><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#eef3e4] text-[#72844d] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]"><Grid2X2 size={13} /></span><span className="min-w-0 flex-1"><strong className="block truncate text-xs font-semibold">{reference.title}</strong><small className="mt-1 block text-[10px] text-[#8d938e]">#{reference.id} · {reference.category}</small></span>{reference.linkedTaskId && <ChevronRight size={14} className="shrink-0 text-[#a0a5a0]" />}</>;
                return reference.linkedTaskId ? <button key={reference.id} type="button" onClick={() => onOpenTask(reference.linkedTaskId!)} className={`flex w-full items-center gap-2.5 rounded-[10px] border bg-white p-2.5 text-left transition hover:border-[#b7c99a] dark:bg-zinc-900 ${ALLYO_BORDER}`}>{content}</button> : <div key={reference.id} className={`flex items-center gap-2.5 rounded-[10px] border bg-white p-2.5 dark:bg-zinc-900 ${ALLYO_BORDER}`}>{content}</div>;
            })}</div> : <EmptyResource>Nenhuma tarefa foi adicionada como referência.</EmptyResource>}
        </ResourceSection>

        <ResourceSection icon={<Paperclip size={15} />} title="Arquivos para a tarefa" description="Uploads enviados pelo cliente">
            {resources.attachments.length > 0 ? <div className="space-y-2">{resources.attachments.map((file) => <div key={file.id} className={`flex items-center gap-2.5 rounded-[10px] border bg-white p-2.5 dark:bg-zinc-900 ${ALLYO_BORDER}`}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#f2f3ef] text-[#737b72] dark:bg-zinc-800">{file.extension === 'ZIP' ? <FileArchive size={14} /> : file.extension === 'MP4' ? <ImageIcon size={14} /> : <FileText size={14} />}</span><span className="min-w-0 flex-1"><strong className="block truncate text-xs font-semibold">{file.name}</strong><small className="mt-1 block text-[10px] text-[#8d938e]">{file.purpose} · {file.size}</small></span><span className="shrink-0 rounded-[5px] border border-[#dfe2dc] px-1.5 py-1 text-[8px] font-bold text-[#737b72] dark:border-zinc-700">{file.extension}</span></div>)}</div> : <EmptyResource>Nenhum arquivo foi enviado pelo cliente.</EmptyResource>}
        </ResourceSection>
    </>
);

const ResourceSection = ({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children: ReactNode }) => <section className={`border-b p-5 ${ALLYO_BORDER}`}><div className="mb-3 flex items-start gap-2.5"><span className="mt-0.5 text-[#81915f]">{icon}</span><span><h3 className="font-season text-base font-normal">{title}</h3><p className="mt-1 text-[10px] leading-4 text-[#929792]">{description}</p></span></div>{children}</section>;
const EmptyResource = ({ children }: { children: ReactNode }) => <p className="rounded-[9px] bg-[#f6f7f4] px-3 py-3 text-[11px] leading-4 text-[#8b918b] dark:bg-zinc-900">{children}</p>;

export default AllyoTaskResources;
