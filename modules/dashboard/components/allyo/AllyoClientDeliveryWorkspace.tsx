import { CheckCircle2, Eye, FileText, Image as ImageIcon, Layers3 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { AllyoDesignAsset } from '../../../../services/allyoService';
import type { AllyoTask } from './AllyoUI';
import { ALLYO_BORDER } from './AllyoUI';
import { getAllyoTaskItemCount, getAllyoTaskPresentation } from './allyoTaskPresentation';

const AllyoClientDeliveryWorkspace = ({ task, designs, onReview }: { task: AllyoTask; designs: AllyoDesignAsset[]; onReview: () => void }) => {
    const definition = getAllyoTaskPresentation(task);
    const count = getAllyoTaskItemCount(task, definition);
    const activeDesign = designs[0];
    const structureItems = (task.deliverables || []).flatMap((deliverable) =>
        deliverable.scenes?.length
            ? deliverable.scenes.map((scene) => ({ id: `${deliverable.id}-${scene.id}`, title: scene.title || scene.label }))
            : [{ id: deliverable.id, title: deliverable.title }],
    );
    const fallbackItems = (task.briefing?.deliverables || []).map((title, index) => ({ id: `brief-${index}`, title }));
    const items = structureItems.length > 0 ? structureItems : fallbackItems;

    return (
        <section className={`border-b ${ALLYO_BORDER}`}>
            <div className="px-5 py-6 sm:px-[30px]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef3e4] text-[#798d50] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]"><Layers3 size={18} /></span>
                        <div><span className="text-[10px] font-bold uppercase tracking-[.08em] text-[#829454]">Visualização do cliente</span><h2 className="mt-1 font-season text-xl">{definition.label}</h2><p className="mt-1.5 max-w-xl text-xs leading-5 text-[#7f7f7f]">{definition.clientHelper}</p></div>
                    </div>
                    <div className="flex flex-wrap gap-2"><ClientTag>{count} {definition.itemLabel}{count === 1 ? '' : 's'}</ClientTag><ClientTag>{definition.approval}</ClientTag></div>
                </div>

                {items.length > 0 && (
                    <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item, index) => <div key={item.id} className={`flex items-center gap-3 rounded-[11px] border bg-[#fafbf8] p-3 dark:bg-zinc-900/50 ${ALLYO_BORDER}`}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-white text-xs font-bold text-[#758653] shadow-sm dark:bg-zinc-950">{String(index + 1).padStart(2, '0')}</span><strong className="min-w-0 truncate text-xs font-semibold">{item.title}</strong></div>)}
                    </div>
                )}

                <div className={`mt-5 overflow-hidden rounded-[14px] border ${activeDesign ? 'border-[#cdd9b9]' : ALLYO_BORDER}`}>
                    {activeDesign ? <div className="flex flex-wrap items-center gap-4 bg-[#fbfcf9] p-4 dark:bg-zinc-900/60"><span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#eef3e4] text-[#748653] dark:bg-zinc-950">{activeDesign.thumbnailUrl ? <img src={activeDesign.thumbnailUrl} alt="" className="h-full w-full object-cover" /> : activeDesign.contentType?.startsWith('image/') ? <ImageIcon size={19} /> : <FileText size={19} />}</span><span className="min-w-0 flex-1"><span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-[#71854e]"><CheckCircle2 size={12} /> Versão disponível</span><strong className="mt-1 block truncate text-sm">{activeDesign.name}</strong><small className="mt-1 block text-[11px] text-[#858b84]">{activeDesign.version || 'Versão atual'} · pronta para comentários e aprovação</small></span><button type="button" onClick={onReview} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#172019] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#28372b]"><Eye size={14} /> Abrir revisão</button></div> : <div className="flex items-center gap-3 bg-[#fafbf8] p-5 text-[#7c837b] dark:bg-zinc-900/50"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-zinc-950"><FileText size={16} /></span><span><strong className="block text-xs font-semibold text-[#555d55] dark:text-zinc-300">Produção em andamento</strong><small className="mt-1 block text-[11px]">A versão para aprovação aparecerá aqui quando o time criativo concluir o envio.</small></span></div>}
                </div>
            </div>
        </section>
    );
};

const ClientTag = ({ children }: { children: ReactNode }) => <span className="inline-flex rounded-full border border-[#dbe2d1] bg-[#f7faf2] px-3 py-1.5 text-[10px] font-semibold text-[#697a4c] dark:border-zinc-700 dark:bg-zinc-900 dark:text-[#d0f08e]">{children}</span>;

export default AllyoClientDeliveryWorkspace;
