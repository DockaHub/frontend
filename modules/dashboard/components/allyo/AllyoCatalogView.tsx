import { useEffect, useMemo, useState } from 'react';
import {
    Archive, BookOpen, Check, ChevronRight, CircleDollarSign, Clock3, Edit3,
    Eye, EyeOff, FileStack, Image as ImageIcon, Loader2, PackageOpen, Plus,
    RefreshCw, Search, Send, Sparkles, Trash2, Undo2, UploadCloud, X,
} from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import {
    allyoService,
    type AllyoCatalogProduct,
    type AllyoCatalogProductPayload,
    type AllyoCatalogProductStatus,
} from '../../../../services/allyoService';
import { ALLYO_BORDER, AllyoPageHeader } from './AllyoUI';
import {
    AllyoField, AllyoInput, AllyoPrimaryButton, AllyoSecondaryButton,
    AllyoTextarea, AllyoToggle,
} from './AllyoForm';

type EditorSection = 'product' | 'pricing' | 'delivery';

const emptyProduct = (): AllyoCatalogProductPayload => ({
    code: '',
    name: '',
    description: '',
    imageUrl: null,
    category: '',
    subcategory: null,
    specialistRole: '',
    status: 'draft',
    catalogVisibility: 'internal',
    publishedInPublicCatalog: false,
    visibleToClient: false,
    slaHours: 24,
    deliveryQuantity: 1,
    billing: {
        label: 'A cada peça',
        ruleKey: null,
        unit: 'peças',
        step: 1,
        includedGroups: 1,
        includedQuantity: 1,
        countablePieces: false,
        maxQuantity: null,
        unitNote: null,
        wordsPerUnit: null,
        characterCredits: null,
    },
    credits: {
        original: 1,
        additional: 0,
        resize: 0,
        variation: 0,
        additionalAllowed: false,
        resizeAllowed: false,
        variationAllowed: false,
    },
    formats: { editable: [], final: [], available: [], sizesAndRatios: [], channels: [] },
    addons: [],
    relatedOptions: [],
    sourceUrl: null,
});

const statusMeta: Record<AllyoCatalogProductStatus, { label: string; classes: string }> = {
    draft: { label: 'Rascunho', classes: 'bg-amber-50 text-amber-700 dark:bg-amber-950/35 dark:text-amber-300' },
    published: { label: 'Publicado', classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300' },
    archived: { label: 'Arquivado', classes: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400' },
};

const parseList = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);
const formatList = (value?: string[]) => (value || []).join(', ');
const formatCredits = (value?: number | null) => Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const slugify = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const CATALOG_SOURCE_IMAGE_LIMIT = 20 * 1024 * 1024;
const CATALOG_UPLOAD_IMAGE_LIMIT = 5 * 1024 * 1024;

const optimizeCatalogImage = (file: File): Promise<File> => new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    const finish = () => URL.revokeObjectURL(objectUrl);
    image.onerror = () => {
        finish();
        reject(new Error('Não foi possível ler esta imagem. Escolha outro arquivo.'));
    };
    image.onload = () => {
        const maxWidth = 1600;
        const maxHeight = 1200;
        const scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext('2d');
        if (!context) {
            finish();
            reject(new Error('Seu navegador não conseguiu preparar a imagem.'));
            return;
        }

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
            finish();
            if (!blob) {
                reject(new Error('Não foi possível otimizar esta imagem.'));
                return;
            }
            const neutralId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
            const outputType = blob.type === 'image/webp' ? 'image/webp' : blob.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
            const outputExtension = outputType === 'image/webp' ? 'webp' : outputType === 'image/jpeg' ? 'jpg' : 'png';
            resolve(new File([blob], `produto-${neutralId}.${outputExtension}`, { type: outputType, lastModified: Date.now() }));
        }, 'image/webp', 0.82);
    };
    image.src = objectUrl;
});

const apiErrorMessage = (error: any, fallback: string) => {
    const details = error?.response?.data?.details;
    if (typeof details === 'string') return details;
    if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') return 'O navegador não conseguiu concluir o envio. Verifique a conexão e tente novamente com a imagem otimizada.';
    return error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;
};

const AllyoCatalogView = () => {
    const [products, setProducts] = useState<AllyoCatalogProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('Todos');
    const [status, setStatus] = useState<'all' | AllyoCatalogProductStatus>('all');
    const [editing, setEditing] = useState<AllyoCatalogProduct | null | undefined>(undefined);
    const [busyCode, setBusyCode] = useState('');

    const loadCatalog = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await allyoService.getCatalog();
            setProducts(Array.isArray(response?.products) ? response.products : []);
        } catch (loadError) {
            setError(apiErrorMessage(loadError, 'Não foi possível carregar o catálogo.'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { void loadCatalog(); }, []);

    const categories = useMemo(() => [...new Set(products.map((product) => product.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [products]);
    const categoryCounts = useMemo(() => products.reduce<Record<string, number>>((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
    }, {}), [products]);
    const filtered = useMemo(() => products.filter((product) => {
        const term = query.trim().toLocaleLowerCase('pt-BR');
        if (term && ![product.name, product.code, product.category, product.subcategory, product.specialistRole].some((value) => String(value || '').toLocaleLowerCase('pt-BR').includes(term))) return false;
        if (category !== 'Todos' && product.category !== category) return false;
        return status === 'all' || product.status === status;
    }).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')), [products, query, category, status]);

    const mutateProduct = async (product: AllyoCatalogProduct, action: 'publish' | 'archive' | 'restore') => {
        const actionLabel = action === 'publish' ? 'publicar' : action === 'archive' ? 'arquivar' : 'restaurar';
        if (action === 'archive' && !window.confirm(`Arquivar “${product.name}”? Ele deixará de aparecer para novos projetos, mas continuará nos históricos.`)) return;
        setBusyCode(product.code);
        setError('');
        try {
            if (action === 'publish') await allyoService.publishCatalogProduct(product.code, product.version);
            if (action === 'archive') await allyoService.archiveCatalogProduct(product.code);
            if (action === 'restore') await allyoService.updateCatalogProduct(product.code, {
                expectedVersion: product.version,
                status: 'draft',
                catalogVisibility: 'internal',
                publishedInPublicCatalog: false,
                visibleToClient: false,
            });
            setNotice(`Produto ${action === 'publish' ? 'publicado' : action === 'archive' ? 'arquivado' : 'restaurado como rascunho'}.`);
            await loadCatalog();
        } catch (mutationError) {
            setError(apiErrorMessage(mutationError, `Não foi possível ${actionLabel} o produto.`));
        } finally {
            setBusyCode('');
        }
    };

    const published = products.filter((product) => product.status === 'published').length;
    const drafts = products.filter((product) => product.status === 'draft').length;
    const hidden = products.filter((product) => !product.visibleToClient).length;

    return (
        <div className="h-full overflow-y-auto bg-white font-sans text-black dark:bg-zinc-950 dark:text-white">
            <AllyoPageHeader title="Catálogo de produtos" actions={<AllyoPrimaryButton onClick={() => setEditing(null)}><Plus size={15} /> Novo produto</AllyoPrimaryButton>} />

            <section className={`border-b px-5 py-7 sm:px-[30px] ${ALLYO_BORDER}`}>
                <div className="mx-auto max-w-[1500px]">
                    <div className="mb-5 max-w-2xl">
                        <h2 className="font-season text-[26px] font-normal leading-tight">Serviços disponíveis na Allyo</h2>
                        <p className="mt-2 text-sm leading-6 text-[#686868] dark:text-zinc-400">Organize imagens, escopo, créditos e prazos dos produtos usados na criação de novos projetos.</p>
                    </div>
                    <div className="grid overflow-hidden rounded-[14px] border border-[#e0e3dc] bg-[#fbfcf8] sm:grid-cols-2 xl:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-900">
                        <CatalogMetric icon={<BookOpen size={17} />} label="Produtos" value={products.length} />
                        <CatalogMetric icon={<Eye size={17} />} label="Publicados" value={published} tone="text-emerald-600" />
                        <CatalogMetric icon={<Edit3 size={17} />} label="Em preparação" value={drafts} tone="text-amber-600" />
                        <CatalogMetric icon={<EyeOff size={17} />} label="Internos ou ocultos" value={hidden} />
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-[30px]">
                {notice && <div className="mt-4 flex items-center justify-between rounded-[12px] border border-[#cbd9ad] bg-[#f3f7e9] px-4 py-3 text-xs text-[#566a2f] dark:border-[#9db669]/30 dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><span className="flex items-center gap-2"><Check size={15} /> {notice}</span><button onClick={() => setNotice('')} className="font-semibold">Fechar</button></div>}
                {error && <div className="mt-4 flex items-center justify-between gap-4 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"><span>{error}</span><button onClick={() => void loadCatalog()} className="flex shrink-0 items-center gap-1 font-semibold"><RefreshCw size={13} /> Tentar novamente</button></div>}

                <div className="grid min-h-[560px] overflow-hidden rounded-[16px] border border-[#e0e3dc] bg-white lg:grid-cols-[240px_minmax(0,1fr)] dark:border-zinc-800 dark:bg-zinc-900">
                    <aside className="border-b border-[#e5e5e5] p-5 lg:border-b-0 lg:border-r dark:border-zinc-800">
                        <p className="px-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#73796f]">Categorias</p>
                        <div className="mt-3 flex gap-2 overflow-x-auto lg:block lg:space-y-1">
                            <CategoryButton active={category === 'Todos'} label="Todos os produtos" count={products.length} onClick={() => setCategory('Todos')} />
                            {categories.map((item) => <CategoryButton key={item} active={category === item} label={item} count={categoryCounts[item]} onClick={() => setCategory(item)} />)}
                        </div>
                        <div className="mt-6 hidden rounded-[12px] bg-[#f4f6ef] p-4 text-xs leading-5 text-[#657052] lg:block dark:bg-zinc-800 dark:text-zinc-400">
                            <Sparkles size={16} className="mb-2 text-[#9db669]" />
                            O código identifica o produto para sempre. Alterações futuras criam uma nova versão sem mudar projetos antigos.
                        </div>
                    </aside>

                    <main className="min-w-0">
                        <div className={`flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center ${ALLYO_BORDER}`}>
                            <div className="relative min-w-0 flex-1"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8b8b]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar produto, código ou especialidade" className="h-11 w-full rounded-full border border-[#dedede] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#9db669] focus:ring-2 focus:ring-[#9db669]/15 dark:border-zinc-700 dark:bg-zinc-950" /></div>
                            <div className="flex gap-1 overflow-x-auto rounded-full bg-[#f1f2ee] p-1 dark:bg-zinc-800">
                                {([['all', 'Todos'], ['published', 'Publicados'], ['draft', 'Rascunhos'], ['archived', 'Arquivados']] as const).map(([value, label]) => <button key={value} onClick={() => setStatus(value)} className={`h-9 whitespace-nowrap rounded-full px-4 text-xs font-semibold transition ${status === value ? 'bg-white text-black shadow-sm dark:bg-zinc-700 dark:text-white' : 'text-[#696969] dark:text-zinc-400'}`}>{label}</button>)}
                            </div>
                        </div>

                        {isLoading ? <CatalogLoading /> : filtered.length === 0 ? <CatalogEmpty hasProducts={products.length > 0} onCreate={() => setEditing(null)} /> : <ProductList products={filtered} busyCode={busyCode} onEdit={(product) => setEditing(product)} onAction={mutateProduct} />}
                    </main>
                </div>
            </div>

            {editing !== undefined && <CatalogEditor product={editing} categories={categories} onClose={() => setEditing(undefined)} onSaved={async (message) => { setEditing(undefined); setNotice(message); await loadCatalog(); }} />}
        </div>
    );
};

const CatalogMetric = ({ icon, label, value, tone = 'text-[#738259]' }: { icon: React.ReactNode; label: string; value: number; tone?: string }) => (
    <div className="flex min-h-[96px] items-center gap-4 border-b border-r border-[#e5e5e5] px-5 last:border-r-0 sm:px-6 sm:[&:nth-child(3)]:border-b-0 sm:[&:nth-child(4)]:border-b-0 xl:border-b-0 dark:border-zinc-800">
        <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-[#edf2e2] ${tone} dark:bg-[#9db669]/10`}>{icon}</span>
        <span><strong className="block font-season text-[28px] font-normal leading-none">{value}</strong><small className="mt-1 block text-xs text-[#6f6f6f] dark:text-zinc-400">{label}</small></span>
    </div>
);

const CategoryButton = ({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) => (
    <button onClick={onClick} className={`flex min-w-max items-center justify-between gap-4 rounded-[10px] px-3 py-3 text-left text-[13px] transition lg:w-full ${active ? 'bg-[#eaf0dd] font-semibold text-[#52672f] dark:bg-[#9db669]/15 dark:text-[#d0f08e]' : 'text-[#595959] hover:bg-[#f5f5f2] dark:text-zinc-400 dark:hover:bg-zinc-800'}`}><span>{label}</span><span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] dark:bg-zinc-900/60">{count}</span></button>
);

const ProductList = ({ products, busyCode, onEdit, onAction }: { products: AllyoCatalogProduct[]; busyCode: string; onEdit: (product: AllyoCatalogProduct) => void; onAction: (product: AllyoCatalogProduct, action: 'publish' | 'archive' | 'restore') => void }) => (
    <div>
        <div className="hidden grid-cols-[minmax(300px,1.6fr)_110px_100px_120px_120px] gap-5 border-b border-[#eceee9] px-6 py-4 text-[11px] font-bold uppercase tracking-[.08em] text-[#747474] xl:grid dark:border-zinc-800">
            <span>Produto</span><span>Créditos</span><span>Prazo</span><span>Visibilidade</span><span className="text-right">Ações</span>
        </div>
        {products.map((product) => {
            const meta = statusMeta[product.status];
            const busy = busyCode === product.code;
            return <div key={product.code} className="group border-b border-[#eceee9] p-4 last:border-b-0 hover:bg-[#fafbf8] sm:p-5 xl:grid xl:grid-cols-[minmax(300px,1.6fr)_110px_100px_120px_120px] xl:items-center xl:gap-5 xl:px-6 dark:border-zinc-800 dark:hover:bg-zinc-800/35">
                <button onClick={() => onEdit(product)} className="flex min-w-0 items-center gap-4 text-left">
                    <ProductImage product={product} />
                    <span className="min-w-0 flex-1">
                        <span className="flex min-w-0 items-center gap-2"><strong className="truncate text-[15px] font-semibold">{product.name}</strong><span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.classes}`}>{meta.label}</span></span>
                        <span className="mt-1.5 block truncate text-xs text-[#6f6f6f] dark:text-zinc-400">{product.code} · {product.subcategory || product.category}</span>
                        <span className="mt-1 block truncate text-xs text-[#969696]">{product.specialistRole}</span>
                    </span>
                </button>
                <div className="mt-4 flex items-center justify-between xl:mt-0 xl:block"><span className="text-xs text-[#777] xl:hidden">Créditos</span><span className="flex items-center gap-2 text-sm font-semibold"><CircleDollarSign size={15} className="text-[#819b52]" /> {formatCredits(product.credits.original)}</span></div>
                <div className="mt-2 flex items-center justify-between xl:mt-0 xl:block"><span className="text-xs text-[#777] xl:hidden">Prazo</span><span className="flex items-center gap-2 text-sm"><Clock3 size={15} className="text-[#888]" /> {product.slaHours}h</span></div>
                <div className="mt-2 flex items-center justify-between xl:mt-0"><span className="text-xs text-[#777] xl:hidden">Visibilidade</span><span className={`flex items-center gap-2 text-xs font-medium ${product.visibleToClient ? 'text-emerald-600' : 'text-[#777]'}`}>{product.visibleToClient ? <Eye size={15} /> : <EyeOff size={15} />}{product.visibleToClient ? 'Cliente' : 'Interno'}</span></div>
                <div className="mt-4 flex justify-end gap-1 xl:mt-0">
                    <button disabled={busy} onClick={() => onEdit(product)} title="Editar" aria-label={`Editar ${product.name}`} className="rounded-full p-2.5 text-[#666] hover:bg-[#eef2e6] hover:text-[#63783b] disabled:opacity-40 dark:hover:bg-zinc-700"><Edit3 size={16} /></button>
                    {product.status === 'draft' && <button disabled={busy} onClick={() => onAction(product, 'publish')} title="Publicar" aria-label={`Publicar ${product.name}`} className="rounded-full p-2.5 text-[#666] hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-40 dark:hover:bg-emerald-950/40">{busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}</button>}
                    {product.status === 'archived' ? <button disabled={busy} onClick={() => onAction(product, 'restore')} title="Restaurar" aria-label={`Restaurar ${product.name}`} className="rounded-full p-2.5 text-[#666] hover:bg-amber-50 hover:text-amber-600 disabled:opacity-40 dark:hover:bg-amber-950/40">{busy ? <Loader2 size={16} className="animate-spin" /> : <Undo2 size={16} />}</button> : <button disabled={busy} onClick={() => onAction(product, 'archive')} title="Arquivar" aria-label={`Arquivar ${product.name}`} className="rounded-full p-2.5 text-[#999] hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-950/30"><Archive size={16} /></button>}
                </div>
            </div>;
        })}
    </div>
);

const ProductImage = ({ product }: { product: Pick<AllyoCatalogProduct, 'name' | 'imageUrl'> }) => (
    <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-[#e3e6dd] bg-[#f2f5eb] text-[#829267] dark:border-zinc-700 dark:bg-zinc-800">
        {product.imageUrl ? <img src={product.imageUrl} alt={`Imagem de ${product.name}`} className="h-full w-full object-cover" /> : <ImageIcon size={22} strokeWidth={1.6} />}
    </span>
);

const CatalogLoading = () => <div className="flex min-h-[400px] items-center justify-center text-sm text-[#777]"><Loader2 size={20} className="mr-2 animate-spin text-[#9db669]" /> Carregando catálogo da Allyo…</div>;
const CatalogEmpty = ({ hasProducts, onCreate }: { hasProducts: boolean; onCreate: () => void }) => <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center"><PackageOpen size={34} className="text-[#aab39a]" /><strong className="mt-4 text-base">{hasProducts ? 'Nenhum produto neste filtro' : 'O catálogo ainda está vazio'}</strong><p className="mt-2 max-w-sm text-sm leading-6 text-[#777]">{hasProducts ? 'Ajuste a busca, categoria ou situação para encontrar outros produtos.' : 'Cadastre o primeiro serviço que poderá ser solicitado pelos clientes.'}</p>{!hasProducts && <AllyoPrimaryButton className="mt-5" onClick={onCreate}><Plus size={14} /> Novo produto</AllyoPrimaryButton>}</div>;

const CatalogEditor = ({ product, categories, onClose, onSaved }: { product: AllyoCatalogProduct | null; categories: string[]; onClose: () => void; onSaved: (message: string) => Promise<void> }) => {
    const isNew = !product;
    const [form, setForm] = useState<AllyoCatalogProductPayload>(() => product ? JSON.parse(JSON.stringify(product)) : emptyProduct());
    const [section, setSection] = useState<EditorSection>('product');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [hasPendingImageChange, setHasPendingImageChange] = useState(false);
    const [imageSaved, setImageSaved] = useState(false);
    const [error, setError] = useState('');

    const setRoot = <K extends keyof AllyoCatalogProductPayload>(key: K, value: AllyoCatalogProductPayload[K]) => setForm((current) => ({ ...current, [key]: value }));
    const setBilling = (key: keyof AllyoCatalogProductPayload['billing'], value: any) => setForm((current) => ({ ...current, billing: { ...current.billing, [key]: value } }));
    const setCredits = (key: keyof AllyoCatalogProductPayload['credits'], value: any) => setForm((current) => ({ ...current, credits: { ...current.credits, [key]: value } }));
    const setFormats = (key: keyof AllyoCatalogProductPayload['formats'], value: string[]) => setForm((current) => ({ ...current, formats: { ...current.formats, [key]: value } }));

    const uploadImage = async (file?: File) => {
        if (!file) return;
        setError('');
        setImageSaved(false);
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setError('Escolha uma imagem em PNG, JPG ou WebP.');
            return;
        }
        if (file.size > CATALOG_SOURCE_IMAGE_LIMIT) {
            setError('A imagem original precisa ter no máximo 20 MB.');
            return;
        }
        setIsUploadingImage(true);
        try {
            const optimizedFile = await optimizeCatalogImage(file);
            if (optimizedFile.size > CATALOG_UPLOAD_IMAGE_LIMIT) throw new Error('Mesmo após a otimização, a imagem ficou maior que 5 MB. Escolha outra imagem.');
            const uploaded = await allyoService.uploadCatalogProductImage(optimizedFile, product?.code);
            setRoot('imageUrl', uploaded.imageUrl);
            setHasPendingImageChange(!uploaded.persisted);
            setImageSaved(uploaded.persisted);
        } catch (uploadError) {
            setError(apiErrorMessage(uploadError, 'Não foi possível enviar a imagem do produto.'));
        } finally {
            setIsUploadingImage(false);
        }
    };

    const removeImage = async () => {
        setError('');
        setImageSaved(false);
        if (isNew || !product) {
            setRoot('imageUrl', null);
            setHasPendingImageChange(true);
            return;
        }
        setIsUploadingImage(true);
        try {
            await allyoService.removeCatalogProductImage(product.code);
            setRoot('imageUrl', null);
            setHasPendingImageChange(false);
            setImageSaved(true);
        } catch (removeError) {
            setError(apiErrorMessage(removeError, 'Não foi possível remover a imagem do produto.'));
        } finally {
            setIsUploadingImage(false);
        }
    };

    const save = async () => {
        setError('');
        if (!form.code.trim() || !form.name.trim() || !form.category.trim() || !form.specialistRole.trim()) {
            setSection('product');
            setError('Preencha código, nome, categoria e especialidade responsável.');
            return;
        }
        if (form.slaHours <= 0 || form.credits.original < 0 || form.billing.step < 1 || form.billing.includedGroups < 1) {
            setSection('pricing');
            setError('Revise créditos, prazo e as quantidades de cobrança.');
            return;
        }
        if (form.addons.some((addon) => !addon.name.trim() || !addon.code.trim() || addon.credits < 0)) {
            setSection('delivery');
            setError('Preencha o nome e os créditos de cada adicional ou remova as linhas vazias.');
            return;
        }
        setIsSaving(true);
        try {
            if (isNew) {
                await allyoService.createCatalogProduct({ ...form, code: form.code.trim(), status: 'draft', catalogVisibility: 'internal', publishedInPublicCatalog: false, visibleToClient: false });
                await onSaved('Produto criado como rascunho. Revise e publique quando estiver pronto.');
            } else {
                const { code: _code, ...changes } = form;
                await allyoService.updateCatalogProduct(product.code, { ...changes, expectedVersion: product.version });
                await onSaved('Produto atualizado e nova versão registrada.');
            }
        } catch (saveError) {
            setError(apiErrorMessage(saveError, 'Não foi possível salvar o produto.'));
        } finally {
            setIsSaving(false);
        }
    };

    return <Modal isOpen onClose={onClose} title={isNew ? 'Novo produto' : `Editar · ${product.name}`} size="2xl" footer={<><AllyoSecondaryButton type="button" onClick={onClose}>Cancelar</AllyoSecondaryButton><AllyoPrimaryButton type="button" disabled={isSaving || isUploadingImage} onClick={() => void save()}>{isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}{isSaving ? 'Salvando...' : isNew ? 'Criar rascunho' : 'Salvar nova versão'}</AllyoPrimaryButton></>}>
        <div className="grid gap-7 lg:grid-cols-[210px_minmax(0,1fr)]">
            <nav className="space-y-1">
                <EditorNav active={section === 'product'} icon={<BookOpen size={15} />} label="Informações" description="Nome e organização" onClick={() => setSection('product')} />
                <EditorNav active={section === 'pricing'} icon={<CircleDollarSign size={15} />} label="Créditos e prazo" description="Cobrança e SLA" onClick={() => setSection('pricing')} />
                <EditorNav active={section === 'delivery'} icon={<FileStack size={15} />} label="Entrega" description="Arquivos e formatos" onClick={() => setSection('delivery')} />
                {!isNew && <div className="mt-5 rounded-[12px] bg-[#f4f6ef] p-4 text-xs leading-5 text-[#667050] dark:bg-zinc-800 dark:text-zinc-400"><strong className="block">Versão {product.version || 1}</strong><span>Código {product.code}</span></div>}
            </nav>

            <div className="min-w-0">
                {error && <div className="mb-5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
                {section === 'product' && <section><SectionTitle title="Informações do produto" description="Dados usados para encontrar, distribuir e apresentar este serviço." />
                    <CatalogImageField imageUrl={form.imageUrl} productName={form.name} uploading={isUploadingImage} pending={hasPendingImageChange} saved={imageSaved} saveLabel={isNew ? 'Criar rascunho' : 'Salvar nova versão'} onFile={(file) => void uploadImage(file)} onRemove={() => void removeImage()} />
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <AllyoField label="Código" required hint={isNew ? 'não poderá ser alterado' : 'imutável'}><AllyoInput value={form.code} disabled={!isNew} onChange={(event) => setRoot('code', event.target.value)} placeholder="Ex.: SOCIAL-POST" /></AllyoField>
                    <AllyoField label="Nome do produto" required><AllyoInput value={form.name} onChange={(event) => setRoot('name', event.target.value)} placeholder="Ex.: Post para redes sociais" /></AllyoField>
                    <AllyoField className="sm:col-span-2" label="Descrição"><AllyoTextarea value={form.description} onChange={(event) => setRoot('description', event.target.value)} placeholder="Explique o que será entregue e quais limites fazem parte do produto." /></AllyoField>
                    <AllyoField label="Categoria" required><AllyoInput list="allyo-catalog-categories" value={form.category} onChange={(event) => setRoot('category', event.target.value)} placeholder="Ex.: Redes Sociais" /><datalist id="allyo-catalog-categories">{categories.map((item) => <option key={item} value={item} />)}</datalist></AllyoField>
                    <AllyoField label="Subcategoria"><AllyoInput value={form.subcategory || ''} onChange={(event) => setRoot('subcategory', event.target.value || null)} placeholder="Ex.: Conteúdo orgânico" /></AllyoField>
                    <AllyoField className="sm:col-span-2" label="Especialidade responsável" required><AllyoInput value={form.specialistRole} onChange={(event) => setRoot('specialistRole', event.target.value)} placeholder="Ex.: Graphic Designer, Copywriter, Motion Designer" /></AllyoField>
                    </div>
                </section>}

                {section === 'pricing' && <section><SectionTitle title="Créditos e prazo" description="Defina a unidade cobrada, o que está incluído e o tempo de produção." /><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <AllyoField label="Crédito base" required><AllyoInput type="number" min="0" step="0.1" value={form.credits.original} onChange={(event) => setCredits('original', Number(event.target.value))} /></AllyoField>
                    <AllyoField label="Prazo interno" required hint="horas úteis"><AllyoInput type="number" min="1" step="1" value={form.slaHours} onChange={(event) => setRoot('slaHours', Number(event.target.value))} /></AllyoField>
                    <AllyoField label="Quantidade entregue"><AllyoInput type="number" min="0" step="1" value={form.deliveryQuantity ?? ''} onChange={(event) => setRoot('deliveryQuantity', event.target.value === '' ? null : Number(event.target.value))} /></AllyoField>
                    <AllyoField label="Forma de cobrança"><AllyoInput value={form.billing.label || ''} onChange={(event) => setBilling('label', event.target.value || null)} placeholder="Ex.: A cada peça" /></AllyoField>
                    <AllyoField label="Unidade" required><AllyoInput value={form.billing.unit} onChange={(event) => setBilling('unit', event.target.value)} placeholder="peças, telas, palavras…" /></AllyoField>
                    <AllyoField label="Quantidade por grupo"><AllyoInput type="number" min="1" step="1" value={form.billing.step} onChange={(event) => setBilling('step', Number(event.target.value))} /></AllyoField>
                    <AllyoField label="Grupos incluídos"><AllyoInput type="number" min="1" step="1" value={form.billing.includedGroups} onChange={(event) => setBilling('includedGroups', Number(event.target.value))} /></AllyoField>
                    <AllyoField label="Quantidade incluída"><AllyoInput type="number" min="0" step="1" value={form.billing.includedQuantity} onChange={(event) => setBilling('includedQuantity', Number(event.target.value))} /></AllyoField>
                </div><div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <CreditOption label="Adicional" checked={form.credits.additionalAllowed} value={form.credits.additional} onToggle={(value) => setCredits('additionalAllowed', value)} onValue={(value) => setCredits('additional', value)} />
                    <CreditOption label="Redimensionamento" checked={form.credits.resizeAllowed} value={form.credits.resize} onToggle={(value) => setCredits('resizeAllowed', value)} onValue={(value) => setCredits('resize', value)} />
                    <CreditOption label="Variação" checked={form.credits.variationAllowed} value={form.credits.variation} onToggle={(value) => setCredits('variationAllowed', value)} onValue={(value) => setCredits('variation', value)} />
                </div></section>}

                {section === 'delivery' && <section><SectionTitle title="Entrega e compatibilidade" description="Cadastre listas separadas por vírgula. Elas ajudam o cliente e o criativo a escolherem o escopo certo." /><div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <ListField label="Arquivos editáveis" value={form.formats.editable} placeholder="Figma, Illustrator, After Effects" onChange={(value) => setFormats('editable', value)} />
                    <ListField label="Arquivos finais" value={form.formats.final} placeholder="PNG, PDF, MP4" onChange={(value) => setFormats('final', value)} />
                    <ListField label="Formatos disponíveis" value={form.formats.available} placeholder="Post, Story, Reels" onChange={(value) => setFormats('available', value)} />
                    <ListField label="Tamanhos e proporções" value={form.formats.sizesAndRatios} placeholder="1080×1350, 9:16, A4" onChange={(value) => setFormats('sizesAndRatios', value)} />
                    <ListField className="sm:col-span-2" label="Canais" value={form.formats.channels} placeholder="Instagram, LinkedIn, YouTube" onChange={(value) => setFormats('channels', value)} />
                </div><AddonEditor addons={form.addons} onChange={(addons) => setRoot('addons', addons)} /><div className="mt-6"><ListField label="Opções relacionadas" value={form.relatedOptions} placeholder="Legenda, Locução, Thumbnail" onChange={(value) => setRoot('relatedOptions', value)} /></div>{!isNew && <div className="mt-6"><AllyoToggle checked={form.visibleToClient} onChange={(visible) => setForm((current) => ({ ...current, visibleToClient: visible, catalogVisibility: visible ? 'public' : 'internal', publishedInPublicCatalog: visible && current.status === 'published' }))} label="Visível para o cliente" description="Produtos publicados e visíveis aparecem na criação de novos projetos no Allyo Space." /></div>}</section>}
            </div>
        </div>
    </Modal>;
};

const CatalogImageField = ({ imageUrl, productName, uploading, pending, saved, saveLabel, onFile, onRemove }: { imageUrl?: string | null; productName: string; uploading: boolean; pending: boolean; saved: boolean; saveLabel: string; onFile: (file?: File) => void; onRemove: () => void }) => (
    <div className="mt-6 rounded-[14px] border border-[#e1e4dc] bg-[#fbfcf8] p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="grid items-center gap-5 sm:grid-cols-[220px_minmax(0,1fr)]">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[12px] border border-[#dfe3d8] bg-[#edf2e2] dark:border-zinc-700 dark:bg-zinc-800">
                {imageUrl ? <img src={imageUrl} alt={productName ? `Imagem de ${productName}` : 'Prévia da imagem do produto'} className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center text-[#7f9062]"><ImageIcon size={30} strokeWidth={1.5} /><span className="mt-2 text-xs font-medium">Prévia do produto</span></div>}
                {uploading && <div className="absolute inset-0 flex items-center justify-center bg-[#0d1e1d]/70 text-sm font-semibold text-white"><Loader2 size={19} className="mr-2 animate-spin" /> Enviando</div>}
            </div>
            <div>
                <strong className="block text-sm font-semibold">Imagem de apresentação</strong>
                <p className="mt-1.5 max-w-md text-xs leading-5 text-[#6f6f6f] dark:text-zinc-400">Use uma imagem horizontal. PNG, JPG ou WebP de até 20 MB; reduzimos para no máximo 1600 × 1200 px, convertemos para WebP e removemos o nome e os metadados do arquivo.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <label className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0d1e1d] px-4 text-xs font-semibold text-white transition hover:bg-[#1d3432] dark:bg-[#9db669] dark:text-[#0d1e1d] ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
                        <UploadCloud size={15} /> {imageUrl ? 'Trocar imagem' : 'Escolher imagem'}
                        <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={uploading} onChange={(event) => { onFile(event.target.files?.[0]); event.target.value = ''; }} />
                    </label>
                    {imageUrl && <button type="button" disabled={uploading} onClick={onRemove} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#d7d7d7] px-4 text-xs font-semibold text-[#555] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-red-950/30"><X size={14} /> Remover</button>}
                </div>
                {pending && <p className="mt-3 text-xs font-semibold text-amber-700 dark:text-amber-300">Imagem pronta. Clique em “{saveLabel}” para concluir.</p>}
                {saved && <p className="mt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">Imagem salva no produto. Você já pode atualizar a página.</p>}
            </div>
        </div>
    </div>
);

const EditorNav = ({ active, icon, label, description, onClick }: { active: boolean; icon: React.ReactNode; label: string; description: string; onClick: () => void }) => <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-[11px] px-3 py-3.5 text-left transition ${active ? 'bg-[#eaf0dd] text-[#52672f] dark:bg-[#9db669]/15 dark:text-[#d0f08e]' : 'text-[#666] hover:bg-[#f5f5f2] dark:hover:bg-zinc-800'}`}><span>{icon}</span><span className="min-w-0 flex-1"><strong className="block text-sm font-semibold">{label}</strong><small className="mt-0.5 block text-[11px] opacity-75">{description}</small></span><ChevronRight size={14} /></button>;
const SectionTitle = ({ title, description }: { title: string; description: string }) => <div><h3 className="font-season text-2xl font-normal">{title}</h3><p className="mt-1 text-sm leading-6 text-[#727272] dark:text-zinc-400">{description}</p></div>;
const ListField = ({ label, value, placeholder, onChange, className = '' }: { label: string; value: string[]; placeholder: string; onChange: (value: string[]) => void; className?: string }) => <AllyoField label={label} hint="separe por vírgula" className={className}><AllyoInput value={formatList(value)} onChange={(event) => onChange(parseList(event.target.value))} placeholder={placeholder} /></AllyoField>;
const CreditOption = ({ label, checked, value, onToggle, onValue }: { label: string; checked: boolean; value?: number | null; onToggle: (value: boolean) => void; onValue: (value: number) => void }) => <div className={`rounded-[12px] border p-4 ${checked ? 'border-[#b9c99a] bg-[#f8faF4] dark:border-[#9db669]/40 dark:bg-[#9db669]/5' : 'border-[#e5e5e5] dark:border-zinc-800'}`}><label className="flex cursor-pointer items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={checked} onChange={(event) => onToggle(event.target.checked)} className="accent-[#7f9b4e]" /> {label}</label><AllyoInput className="!mt-3" type="number" min="0" step="0.1" disabled={!checked} value={value ?? 0} onChange={(event) => onValue(Number(event.target.value))} /></div>;

const AddonEditor = ({ addons, onChange }: { addons: AllyoCatalogProductPayload['addons']; onChange: (addons: AllyoCatalogProductPayload['addons']) => void }) => {
    const update = (index: number, patch: Partial<AllyoCatalogProductPayload['addons'][number]>) => onChange(addons.map((addon, itemIndex) => itemIndex === index ? { ...addon, ...patch } : addon));
    const add = () => onChange([...addons, { code: `adicional-${Date.now()}`, name: '', credits: 0, billable: true }]);
    return <div className="mt-7 border-t border-[#e8e9e5] pt-6 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-3"><div><strong className="block text-sm font-semibold">Adicionais disponíveis</strong><p className="mt-1 text-xs leading-5 text-[#777]">Serviços opcionais que podem ser somados ao produto.</p></div><AllyoSecondaryButton type="button" className="!h-9 !px-3" onClick={add}><Plus size={13} /> Adicional</AllyoSecondaryButton></div>
        {addons.length === 0 ? <div className="mt-4 rounded-[11px] border border-dashed border-[#d8dbd3] px-4 py-5 text-center text-xs text-[#777] dark:border-zinc-700">Nenhum adicional configurado.</div> : <div className="mt-4 space-y-2">{addons.map((addon, index) => <div key={`${addon.code}-${index}`} className="grid items-end gap-2 rounded-[11px] border border-[#e5e5e5] p-3 sm:grid-cols-[minmax(0,1fr)_110px_92px_34px] dark:border-zinc-800">
            <AllyoField label="Nome"><AllyoInput className="!mt-1 !h-10" value={addon.name} onChange={(event) => update(index, { name: event.target.value, code: addon.code.startsWith('adicional-') ? (slugify(event.target.value) || addon.code) : addon.code })} placeholder="Ex.: Legenda" /></AllyoField>
            <AllyoField label="Créditos"><AllyoInput className="!mt-1 !h-10" type="number" min="0" step="0.1" value={addon.credits} onChange={(event) => update(index, { credits: Number(event.target.value) })} /></AllyoField>
            <label className="flex h-10 items-center gap-2 text-xs font-medium"><input type="checkbox" checked={addon.billable} onChange={(event) => update(index, { billable: event.target.checked })} className="accent-[#7f9b4e]" /> Cobrável</label>
            <button type="button" onClick={() => onChange(addons.filter((_, itemIndex) => itemIndex !== index))} className="flex h-9 w-9 items-center justify-center rounded-full text-[#aaa] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30" aria-label={`Remover ${addon.name || 'adicional'}`}><Trash2 size={14} /></button>
        </div>)}</div>}
    </div>;
};

export default AllyoCatalogView;
