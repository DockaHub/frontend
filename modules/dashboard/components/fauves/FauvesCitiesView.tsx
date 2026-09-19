import React, { useEffect, useMemo, useState } from 'react';
import { Eye, ImagePlus, MapPin, Pencil, Plus, RefreshCw, Upload } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { fauvesService } from '../../../../services/fauvesService';
import { EmptyState, FauvesPageHeader, LoadingState, Panel, PrimaryButton, SearchInput, SecondaryButton, StatusBadge, useFauvesToast } from './FauvesUI';

interface CityItem {
    id: string;
    name: string;
    slug: string;
    uf: string;
    iconSvg?: string | null;
    imageUrl?: string | null;
    description?: string | null;
    isActive: boolean;
    sortOrder: number;
    eventCount?: number;
}

interface CityForm {
    name: string;
    slug: string;
    uf: string;
    iconSvg: string;
    imageUrl: string;
    description: string;
    isActive: boolean;
    sortOrder: string;
}

const emptyForm: CityForm = {
    name: '', slug: '', uf: '', iconSvg: '', imageUrl: '', description: '', isActive: true, sortOrder: '0',
};

const states = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
const slugify = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const svgDataUrl = (svg?: string | null) => svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : '';
const fieldClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-base text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white';
const labelClass = 'block text-xs font-bold text-slate-600 dark:text-zinc-300';

const fileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
});

const FauvesCitiesView: React.FC = () => {
    const notify = useFauvesToast();
    const [cities, setCities] = useState<CityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState<CityItem | null>(null);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<CityForm>(emptyForm);

    const load = async () => {
        setLoading(true);
        try {
            setCities(await fauvesService.getCities());
        } catch (error: any) {
            notify(error.response?.data?.message || 'Não foi possível carregar as cidades.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void load(); }, []);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return cities;
        return cities.filter((city) => `${city.name} ${city.uf} ${city.slug}`.toLowerCase().includes(query));
    }, [cities, search]);

    const showCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setOpen(true);
    };

    const showEdit = (city: CityItem) => {
        setEditing(city);
        setForm({
            name: city.name,
            slug: city.slug,
            uf: city.uf,
            iconSvg: city.iconSvg || '',
            imageUrl: city.imageUrl || '',
            description: city.description || '',
            isActive: city.isActive,
            sortOrder: String(city.sortOrder ?? 0),
        });
        setOpen(true);
    };

    const update = <K extends keyof CityForm>(key: K, value: CityForm[K]) => setForm((current) => ({ ...current, [key]: value }));

    const readSvg = async (file?: File) => {
        if (!file) return;
        if (file.size > 100 * 1024) return notify('O SVG deve ter no máximo 100 KB.', 'error');
        const svg = await file.text();
        if (!/^\s*<svg[\s>]/i.test(svg)) return notify('Selecione um arquivo SVG válido.', 'error');
        update('iconSvg', svg.trim());
    };

    const uploadImage = async (file?: File) => {
        if (!file) return;
        if (file.size > 6 * 1024 * 1024) return notify('A imagem deve ter no máximo 6 MB.', 'error');
        setUploading(true);
        try {
            const result = await fauvesService.uploadCityImage(await fileAsDataUrl(file), file.name);
            update('imageUrl', result.url);
            notify('Imagem enviada. Salve a cidade para aplicar.');
        } catch (error: any) {
            notify(error.response?.data?.message || 'Não foi possível enviar a imagem.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const save = async () => {
        if (!form.name.trim() || form.uf.length !== 2) {
            notify('Preencha o nome e a UF da cidade.', 'error');
            return;
        }
        setSaving(true);
        try {
            const payload = { ...form, name: form.name.trim(), slug: form.slug.trim(), uf: form.uf, sortOrder: Number(form.sortOrder) || 0 };
            if (editing) await fauvesService.updateCity(editing.id, payload);
            else await fauvesService.createCity(payload);
            notify(editing ? 'Cidade atualizada com sucesso.' : 'Cidade criada com sucesso.');
            setOpen(false);
            await load();
        } catch (error: any) {
            const message = error.response?.data?.message;
            notify(Array.isArray(message) ? message.join(', ') : message || 'Não foi possível salvar a cidade.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const iconPreview = svgDataUrl(form.iconSvg);

    return (
        <div className="h-full min-h-0 overflow-y-auto bg-white animate-in fade-in duration-300 dark:bg-zinc-950">
            <FauvesPageHeader
                title="Cidades"
                description="Curadoria das páginas locais e cidades detectadas nos eventos Fauves."
                actions={<><SecondaryButton onClick={() => void load()}><RefreshCw size={15} /> Atualizar</SecondaryButton><PrimaryButton onClick={showCreate}><Plus size={15} /> Nova cidade</PrimaryButton></>}
            />

            <Panel className="overflow-hidden rounded-none border-x-0 border-t-0 shadow-none">
                <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                    <SearchInput value={search} onChange={setSearch} placeholder="Buscar cidade, UF ou slug…" />
                    <span className="text-xs font-semibold text-slate-400">{cities.length} cidades cadastradas</span>
                </div>
                {loading ? <LoadingState label="Carregando cidades…" /> : filtered.length === 0 ? (
                    <EmptyState title="Nenhuma cidade encontrada" description="Cadastre uma cidade ou ajuste sua busca." />
                ) : (
                    <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                        {filtered.map((city) => (
                            <article key={city.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                                <div className="relative aspect-[16/7] bg-gradient-to-br from-slate-800 to-slate-950">
                                    {city.imageUrl ? <img src={city.imageUrl} alt={city.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-500"><ImagePlus size={32} /></div>}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                                    <div className="absolute bottom-3 left-3 flex items-center gap-3 text-white">
                                        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-black/30 p-2 backdrop-blur-sm">
                                            {city.iconSvg ? <img src={svgDataUrl(city.iconSvg)} alt="" className="h-full w-full object-contain brightness-0 invert" /> : <MapPin size={19} />}
                                        </span>
                                        <div><h3 className="font-bold">{city.name}</h3><p className="text-[11px] font-semibold text-white/65">{city.uf} · /{city.slug}</p></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-3 p-4">
                                    <div className="flex items-center gap-2"><StatusBadge value={city.isActive ? 'Ativo' : 'Inativo'} /><span className="text-xs text-slate-400">{city.eventCount || 0} evento(s)</span></div>
                                    <div className="flex gap-2">
                                        <a href={`https://fauves.com.br/o-que-fazer-em/${city.slug}`} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:text-teal-600 dark:border-zinc-700" title="Abrir página"><Eye size={15} /></a>
                                        <button onClick={() => showEdit(city)} className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:text-teal-600 dark:border-zinc-700" title="Editar"><Pencil size={15} /></button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </Panel>

            <Modal isOpen={open} onClose={() => !saving && setOpen(false)} title={editing ? `Editar ${editing.name}` : 'Nova cidade'} size="xl" footer={<><SecondaryButton disabled={saving} onClick={() => setOpen(false)}>Cancelar</SecondaryButton><PrimaryButton disabled={saving || uploading} onClick={() => void save()}>{saving ? 'Salvando…' : 'Salvar cidade'}</PrimaryButton></>}>
                <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
                    <div className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
                            <label className={labelClass}>Nome da cidade *<input value={form.name} onChange={(event) => { update('name', event.target.value); if (!editing) update('slug', slugify(event.target.value)); }} className={fieldClass} placeholder="Fortaleza" /></label>
                            <label className={labelClass}>UF *<select value={form.uf} onChange={(event) => update('uf', event.target.value)} className={fieldClass}><option value="">UF</option>{states.map((uf) => <option key={uf}>{uf}</option>)}</select></label>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                            <label className={labelClass}>Slug da página<input value={form.slug} onChange={(event) => update('slug', slugify(event.target.value))} className={fieldClass} placeholder="fortaleza" /></label>
                            <label className={labelClass}>Ordem<input type="number" value={form.sortOrder} onChange={(event) => update('sortOrder', event.target.value)} className={fieldClass} /></label>
                        </div>
                        <label className={labelClass}>Descrição da cidade<textarea value={form.description} onChange={(event) => update('description', event.target.value)} className={`${fieldClass} min-h-28 resize-y`} placeholder="Texto de apresentação exibido na página da cidade…" /></label>
                        <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 dark:border-zinc-700 dark:text-zinc-200"><input type="checkbox" checked={form.isActive} onChange={(event) => update('isActive', event.target.checked)} className="h-4 w-4 accent-teal-600" /> Exibir esta cidade no site e no Discover</label>
                    </div>

                    <div className="space-y-5">
                        <div className="rounded-2xl border border-slate-200 p-4 dark:border-zinc-700">
                            <div className="mb-3 flex items-center justify-between gap-3"><div><h4 className="text-sm font-bold text-slate-900 dark:text-white">Ícone próprio (SVG)</h4><p className="mt-1 text-xs text-slate-400">Envie o arquivo ou cole o código SVG abaixo.</p></div><label className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-teal-400 dark:border-zinc-700 dark:text-zinc-300"><Upload size={14} className="mr-1.5 inline" /> SVG<input type="file" accept=".svg,image/svg+xml" className="hidden" onChange={(event) => void readSvg(event.target.files?.[0])} /></label></div>
                            <div className="mb-3 flex h-20 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800">{iconPreview ? <img src={iconPreview} alt="Prévia do ícone" className="h-14 w-14 object-contain" /> : <MapPin className="text-slate-400" />}</div>
                            <textarea value={form.iconSvg} onChange={(event) => update('iconSvg', event.target.value)} className={`${fieldClass} min-h-24 font-mono text-[11px]`} placeholder={'<svg viewBox="0 0 24 24">…</svg>'} />
                            {form.iconSvg && <button type="button" onClick={() => update('iconSvg', '')} className="mt-2 text-xs font-bold text-rose-500">Remover ícone</button>}
                        </div>

                        <div className="rounded-2xl border border-slate-200 p-4 dark:border-zinc-700">
                            <div className="mb-3 flex items-center justify-between gap-3"><div><h4 className="text-sm font-bold text-slate-900 dark:text-white">Imagem de capa</h4><p className="mt-1 text-xs text-slate-400">JPG, PNG, WEBP ou GIF de até 6 MB.</p></div><label className={`cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-teal-400 dark:border-zinc-700 dark:text-zinc-300 ${uploading ? 'pointer-events-none opacity-50' : ''}`}><ImagePlus size={14} className="mr-1.5 inline" /> {uploading ? 'Enviando…' : 'Enviar'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => void uploadImage(event.target.files?.[0])} /></label></div>
                            <div className="mb-3 aspect-[16/7] overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-800">{form.imageUrl ? <img src={form.imageUrl} alt="Prévia da capa" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs font-semibold text-slate-400">Sem imagem</div>}</div>
                            <label className={labelClass}>Ou informe a URL<input type="url" value={form.imageUrl} onChange={(event) => update('imageUrl', event.target.value)} className={fieldClass} placeholder="https://…" /></label>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default FauvesCitiesView;
