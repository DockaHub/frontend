
import React, { useState, useEffect } from 'react';
import { Search, Plus, User as UserIcon, Link as LinkIcon, Loader2, RotateCw, MoreHorizontal, Pencil, XCircle, Music, Mic2, Guitar, Headphones, Mic, Volume2, Disc, Film, Palette, Utensils, Plane, Globe, Trash2, Ban, CreditCard } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { fauvesService } from '../../../../services/fauvesService';

interface ManagementViewProps {
    type: 'users' | 'artists' | 'categories' | 'ads' | 'slides';
}

const ManagementView: React.FC<ManagementViewProps> = ({ type }) => {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    // Category form state
    const [categoryName, setCategoryName] = useState('');
    const [categorySlug, setCategorySlug] = useState('');
    const [categoryIcon, setCategoryIcon] = useState('Music');

    // Slide form state
    const [slideTitle, setSlideTitle] = useState('');
    const [slideImage, setSlideImage] = useState('');
    const [slideUF, setSlideUF] = useState('Universal (todos)');
    const [slideOrder, setSlideOrder] = useState('0');
    const [slideLinkType, setSlideLinkType] = useState('Sem link');
    const [slideExternalUrl, setSlideExternalUrl] = useState('');
    const [slideSearchEvent, setSlideSearchEvent] = useState('');
    const [isSlideActive, setIsSlideActive] = useState(true);
    const [showSlideTitle, setShowSlideTitle] = useState(false);

    // Ad form state
    const [adTitle, setAdTitle] = useState('');
    const [adDescription, setAdDescription] = useState('');
    const [adImage, setAdImage] = useState('');
    const [adCategory, setAdCategory] = useState('Novidade');
    const [adPublic, setAdPublic] = useState('Organizadores');
    const [adLink, setAdLink] = useState('');
    const [adLinkText, setAdLinkText] = useState('Saiba mais');
    const [adIsActive, setAdIsActive] = useState(true);
    const [adOrder, setAdOrder] = useState('0');
    const [adStartDate, setAdStartDate] = useState('');
    const [adEndDate, setAdEndDate] = useState('');

    // Ad Filter state
    const [adFilterCategory, setAdFilterCategory] = useState('Todas');
    const [adFilterPublic, setAdFilterPublic] = useState('Todos');
    const [adFilterStatus, setAdFilterStatus] = useState('Todos');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    const config = {
        users: {
            title: 'Usuários',
            subtitle: 'Gerencie todos os usuários da plataforma',
            btn: 'Novo Usuário',
            headers: ['Usuário', 'Email', 'Tipo', 'Cadastro', 'Ações'],
        },
        artists: {
            title: 'Gerenciar Artistas',
            subtitle: 'Verifique e gerencie artistas cadastrados',
            btn: null,
            headers: ['Foto', 'Nome', 'Eventos', 'Spotify', 'Verificado', 'Ações'],
        },
        categories: {
            title: 'Categorias',
            subtitle: 'Gerencie categorias de eventos',
            btn: 'Nova Categoria',
            headers: ['Nome', 'Slug', 'Ordem', 'Status', ''],
        },
        ads: {
            title: 'Anúncios',
            subtitle: 'Gerencie os anúncios exibidos no dashboard',
            btn: 'Novo Anúncio',
            headers: ['Título', 'Categoria', 'Público', 'Status', 'Ordem', 'Ações'],
        },
        slides: {
            title: 'Slides Homepage',
            subtitle: 'Gerencie os slides do carrossel',
            btn: 'Novo Slide',
            headers: ['Preview', 'Título', 'Estado', 'Tipo Link', 'Ordem', 'Status'],
        }
    }[type];

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fauvesService.getManagementData(type, currentPage, itemsPerPage);
            // Handle both legacy array and new paginated object
            if (Array.isArray(response)) {
                setData(response);
                setTotalItems(response.length);
                setTotalPages(1);
            } else {
                setData(response.items || []);
                setTotalItems(response.total || 0);
                setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));
            }
        } catch (err: any) {
            console.error(`Failed to fetch ${type}:`, err);
            const status = err.response?.status;
            const statusText = status === 401 ? 'Não autorizado (Token inválido)' : status === 404 ? 'Não encontrado' : '';
            setError(`Erro ao carregar dados de ${config.title.toLowerCase()}${status ? ` (${status}${statusText ? `: ${statusText}` : ''})` : ''}.`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1); // Reset page on type change
    }, [type]);

    useEffect(() => {
        fetchData();
    }, [type, currentPage]);

    // ... rest of the component uses 'data' instead of 'config.data'
    // ... add loading/error UI blocks

    // Dynamic Modal Content Renderer
    const renderModalContent = () => {
        switch (type) {
            case 'users':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Nome Completo</label>
                            <div className="relative">
                                <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                                <input className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100" placeholder="Ex: João Silva" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">E-mail</label>
                            <input type="email" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100" placeholder="joao@exemplo.com" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Permissão</label>
                            <select className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100">
                                <option>Usuário Padrão</option>
                                <option>Organizador</option>
                                <option>Admin</option>
                            </select>
                        </div>
                    </div>
                );
            case 'categories':
                const iconOptions = [
                    { name: 'Music', icon: Music },
                    { name: 'Mic2', icon: Mic2 },
                    { name: 'Guitar', icon: Guitar },
                    { name: 'Headphones', icon: Headphones },
                    { name: 'Mic', icon: Mic },
                    { name: 'Volume2', icon: Volume2 },
                    { name: 'Disc', icon: Disc },
                    { name: 'Film', icon: Film },
                    { name: 'Palette', icon: Palette },
                    { name: 'Utensils', icon: Utensils },
                    { name: 'Plane', icon: Plane },
                ];

                const SelectedIcon = iconOptions.find(opt => opt.name === categoryIcon)?.icon || Music;

                return (
                    <div className="space-y-4">
                        <p className="text-xs text-docka-500 dark:text-zinc-500">Preencha as informações da categoria. O ícone será usado na interface.</p>

                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 mb-2">Nome da Categoria *</label>
                            <input
                                value={categoryName}
                                onChange={(e) => {
                                    setCategoryName(e.target.value);
                                    // Auto-generate slug
                                    if (!editingItem) {
                                        setCategorySlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                                    }
                                }}
                                className="w-full px-3 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/30 focus:border-amber-500 text-docka-900 dark:text-zinc-100"
                                placeholder="Shows"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 mb-2">Slug (opcional)</label>
                            <input
                                value={categorySlug}
                                onChange={(e) => setCategorySlug(e.target.value)}
                                className="w-full px-3 py-2.5 bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-600 dark:text-zinc-400"
                                placeholder="shows"
                            />
                            <p className="text-[10px] text-docka-400 dark:text-zinc-500 mt-1">Identificador único para URL. Se deixar vazio, será gerado automaticamente.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 mb-3">Ícone</label>

                            <div className="bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg p-4 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                                        <SelectedIcon size={24} className="text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-docka-700 dark:text-zinc-400">Ícone selecionado:</p>
                                        <p className="text-sm font-medium text-docka-900 dark:text-zinc-100">{categoryIcon}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-6 gap-2">
                                {iconOptions.map(({ name, icon: Icon }) => (
                                    <button
                                        key={name}
                                        type="button"
                                        onClick={() => setCategoryIcon(name)}
                                        className={`aspect-square flex items-center justify-center rounded-lg border-2 transition-all hover:border-teal-400 dark:hover:border-teal-600 ${categoryIcon === name
                                            ? 'border-teal-500 dark:border-teal-500 bg-teal-50 dark:bg-teal-900/30'
                                            : 'border-docka-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                                            }`}
                                    >
                                        <Icon size={20} className={categoryIcon === name ? 'text-teal-600 dark:text-teal-400' : 'text-docka-400 dark:text-zinc-500'} />
                                    </button>
                                ))}
                            </div>

                            <p className="text-[10px] text-docka-400 dark:text-zinc-500 mt-2">Clique em um ícone para selecioná-lo</p>
                        </div>
                    </div>
                );
            case 'ads':
                return (
                    <div className="space-y-6 min-w-0">
                        {/* PREVIEW TOP */}
                        <div className="bg-docka-50/50 dark:bg-zinc-800/20 rounded-2xl p-6 border border-docka-100 dark:border-zinc-800">
                            <h3 className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest text-center mb-4">Preview em tempo real</h3>
                            <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm border border-docka-100 dark:border-zinc-800 max-w-sm mx-auto">
                                <div className="flex items-center gap-1.5 mb-3">
                                    <Plus size={14} className="text-purple-500" />
                                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">{adCategory}</span>
                                </div>
                                <h4 className="text-base font-bold text-docka-900 dark:text-zinc-100 mb-2">{adTitle || 'Título do anúncio'}</h4>
                                <p className="text-xs text-docka-500 dark:text-zinc-400 leading-relaxed mb-4">
                                    {adDescription || 'Descrição do anúncio aparecerá aqui...'}
                                </p>
                                {adImage && (
                                    <div className="aspect-video w-full rounded-lg bg-docka-50 overflow-hidden mb-4">
                                        <img src={adImage} className="w-full h-full object-cover" alt="Preview" />
                                    </div>
                                )}
                                {adLink && (
                                    <div className="flex justify-end">
                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                                            {adLinkText}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* FORM SIDE */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-docka-800 dark:text-zinc-200 mb-2">Título *</label>
                                    <input
                                        value={adTitle}
                                        onChange={(e) => setAdTitle(e.target.value)}
                                        placeholder="Ex: Sistema de Embaixadores disponível!"
                                        className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-docka-800 dark:text-zinc-200 mb-2">Descrição *</label>
                                    <textarea
                                        value={adDescription}
                                        onChange={(e) => setAdDescription(e.target.value)}
                                        placeholder="Descreva brevemente o anúncio..."
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100 resize-none"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-docka-800 dark:text-zinc-200 mb-1">URL da Imagem</label>
                                    <input
                                        value={adImage}
                                        onChange={(e) => setAdImage(e.target.value)}
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100"
                                    />
                                    <span className="text-[10px] text-docka-400 mt-1">Opcional. Use Unsplash ou outra URL de imagem.</span>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-docka-800 dark:text-zinc-200 mb-2">Categoria *</label>
                                    <div className="relative">
                                        <select
                                            value={adCategory}
                                            onChange={(e) => setAdCategory(e.target.value)}
                                            className="w-full pl-8 pr-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none appearance-none text-docka-900 dark:text-zinc-100"
                                        >
                                            <option>Novidade</option>
                                            <option>Atualização</option>
                                            <option>Comunicado</option>
                                        </select>
                                        <Plus size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-orange-500" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-docka-800 dark:text-zinc-200 mb-2">Público *</label>
                                    <div className="relative">
                                        <select
                                            value={adPublic}
                                            onChange={(e) => setAdPublic(e.target.value)}
                                            className="w-full pl-8 pr-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none appearance-none text-docka-900 dark:text-zinc-100"
                                        >
                                            <option>Organizadores</option>
                                            <option>Clientes</option>
                                            <option>Todos</option>
                                        </select>
                                        <CreditCard size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-yellow-500" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-docka-800 dark:text-zinc-200 mb-2">Link</label>
                                    <input
                                        value={adLink}
                                        onChange={(e) => setAdLink(e.target.value)}
                                        placeholder="/marketing/embaixadores"
                                        className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-docka-800 dark:text-zinc-200 mb-2">Texto do Link</label>
                                    <input
                                        value={adLinkText}
                                        onChange={(e) => setAdLinkText(e.target.value)}
                                        placeholder="Saiba mais"
                                        className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100"
                                    />
                                </div>

                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={adIsActive}
                                            onChange={(e) => setAdIsActive(e.target.checked)}
                                            className="w-4 h-4 rounded border-docka-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-docka-800 dark:text-zinc-200">Ativo</span>
                                    </label>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-docka-800 dark:text-zinc-200 mb-1">Ordem</label>
                                        <input
                                            type="number"
                                            value={adOrder}
                                            onChange={(e) => setAdOrder(e.target.value)}
                                            className="w-full px-4 py-1.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                    <div>
                                        <label className="block text-xs font-bold text-docka-800 dark:text-zinc-200 mb-2">Data início</label>
                                        <input
                                            type="date"
                                            value={adStartDate}
                                            onChange={(e) => setAdStartDate(e.target.value)}
                                            className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-docka-800 dark:text-zinc-200 mb-2">Data fim</label>
                                        <input
                                            type="date"
                                            value={adEndDate}
                                            onChange={(e) => setAdEndDate(e.target.value)}
                                            className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'slides':
                const states = ['Universal (todos)', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
                const linkTypes = ['Sem link', 'Link para Evento', 'Link Externo'];

                return (
                    <div className="space-y-5">
                        <p className="text-xs text-docka-500 dark:text-zinc-500">Configure as propriedades do slide do carrossel.</p>

                        <div>
                            <label className="block text-sm font-medium text-docka-800 dark:text-zinc-200 mb-2">Título (interno)</label>
                            <input
                                value={slideTitle}
                                onChange={(e) => setSlideTitle(e.target.value)}
                                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border-2 border-docka-900 dark:border-zinc-100 rounded-xl text-sm outline-none font-medium text-docka-900 dark:text-zinc-100 placeholder:text-docka-300 dark:placeholder:text-zinc-600"
                                placeholder="Ex: Promoção Verão 2024"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-docka-800 dark:text-zinc-200 mb-2">Imagem do Slide</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        value={slideImage}
                                        onChange={(e) => setSlideImage(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100 placeholder:text-docka-400"
                                        placeholder="URL da imagem"
                                    />
                                </div>
                                <button className="px-6 py-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 text-docka-900 dark:text-zinc-100 rounded-lg text-sm font-medium hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors shadow-sm">
                                    Upload
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-docka-800 dark:text-zinc-200 mb-2">Estado (UF)</label>
                                <div className="relative">
                                    <select
                                        value={slideUF}
                                        onChange={(e) => setSlideUF(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100 appearance-none"
                                    >
                                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-docka-800 dark:text-zinc-200 mb-2">Ordem</label>
                                <input
                                    type="number"
                                    value={slideOrder}
                                    onChange={(e) => setSlideOrder(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-docka-800 dark:text-zinc-200 mb-2">Tipo de Link</label>
                            <select
                                value={slideLinkType}
                                onChange={(e) => setSlideLinkType(e.target.value)}
                                className={`w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100 ${slideLinkType === 'Link para Evento' ? 'border-2 border-docka-900 dark:border-zinc-100' : ''}`}
                            >
                                {linkTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        {slideLinkType === 'Link Externo' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="block text-sm font-medium text-docka-800 dark:text-zinc-200 mb-2">URL Externa</label>
                                <input
                                    value={slideExternalUrl}
                                    onChange={(e) => setSlideExternalUrl(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100 placeholder:text-docka-300"
                                    placeholder="https://..."
                                />
                            </div>
                        )}

                        {slideLinkType === 'Link para Evento' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-2">
                                <label className="block text-sm font-medium text-docka-800 dark:text-zinc-200 mb-2">Buscar Evento</label>
                                <input
                                    value={slideSearchEvent}
                                    onChange={(e) => setSlideSearchEvent(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100 placeholder:text-docka-300"
                                    placeholder="Digite para buscar..."
                                />
                                <div className="max-h-40 overflow-y-auto border border-docka-200 dark:border-zinc-700 rounded-lg divide-y divide-docka-50 dark:divide-zinc-800">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="px-4 py-2.5 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                                            Summer Vibes Club Night
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-6 pt-2">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsSlideActive(!isSlideActive)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isSlideActive ? 'bg-docka-900 dark:bg-zinc-100' : 'bg-docka-200 dark:bg-zinc-800'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-900 shadow ring-0 transition duration-200 ease-in-out ${isSlideActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                                <span className="text-sm font-medium text-docka-800 dark:text-zinc-200">Slide ativo</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowSlideTitle(!showSlideTitle)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${showSlideTitle ? 'bg-docka-900 dark:bg-zinc-100' : 'bg-docka-200 dark:bg-zinc-800'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-900 shadow ring-0 transition duration-200 ease-in-out ${showSlideTitle ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                                <span className="text-sm font-medium text-docka-800 dark:text-zinc-200">Exibir título</span>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">{type === 'ads' ? 'Anúncios da Plataforma' : config.title}</h1>
                        <span className="text-xs text-docka-400 dark:text-zinc-500">Total: {totalItems} {type === 'artists' ? 'artistas' : type === 'ads' ? 'anúncios' : type}</span>
                    </div>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">{config.subtitle}</p>
                </div>
                <div className="flex gap-2">
                    {config.btn && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 shadow-sm transition-colors flex items-center gap-2"
                        >
                            <Plus size={16} /> {config.btn}
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-transparent mb-6">
                {type === 'ads' ? (
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2">Categoria</label>
                            <select
                                value={adFilterCategory}
                                onChange={(e) => setAdFilterCategory(e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.5rem_center] bg-no-repeat"
                            >
                                <option>Todas</option>
                                <option>Novidade</option>
                                <option>Atualização</option>
                                <option>Comunicado</option>
                                <option>Dica</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2">Público</label>
                            <select
                                value={adFilterPublic}
                                onChange={(e) => setAdFilterPublic(e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.5rem_center] bg-no-repeat"
                            >
                                <option>Todos</option>
                                <option>Organizadores</option>
                                <option>Clientes</option>
                                <option>Todos os públicos</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2">Status</label>
                            <select
                                value={adFilterStatus}
                                onChange={(e) => setAdFilterStatus(e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.5rem_center] bg-no-repeat"
                            >
                                <option>Todos</option>
                                <option>Ativos</option>
                                <option>Inativos</option>
                            </select>
                        </div>
                        <button className="px-10 py-2.5 bg-docka-50 dark:bg-zinc-800 text-docka-600 dark:text-zinc-400 rounded-lg text-sm font-medium hover:bg-docka-100 dark:hover:bg-zinc-700 transition-colors">
                            Filtrar
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl shadow-sm">
                        <div className="p-4 border-b border-docka-200 dark:border-zinc-800 flex justify-between items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
                                <input
                                    placeholder={`Buscar por nome...`}
                                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <select className="px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100">
                                    <option>Todos</option>
                                </select>
                                <button
                                    onClick={fetchData}
                                    disabled={isLoading}
                                    className="p-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-docka-500 hover:text-docka-900 dark:hover:text-zinc-100 disabled:opacity-50"
                                >
                                    <RotateCw size={16} className={isLoading ? 'animate-spin' : ''} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl shadow-sm">

                {isLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-docka-400 dark:text-zinc-500">
                        <Loader2 size={32} className="animate-spin mb-4" />
                        <p className="text-sm">Carregando {config.title.toLowerCase()}...</p>
                    </div>
                ) : error ? (
                    <div className="p-20 flex flex-col items-center justify-center text-red-500">
                        <p className="font-medium mb-2">{error}</p>
                        <button onClick={fetchData} className="text-xs underline">Tentar novamente</button>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-medium text-xs uppercase">
                            <tr>
                                {config.headers.map((h, i) => <th key={i} className="px-6 py-3 border-b border-docka-100 dark:border-zinc-800">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                            {data.length > 0 ? data.map((row: any, i) => (
                                <tr key={i} className={`hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors ${openDropdownId === row.id ? 'z-50 relative' : ''}`}>
                                    {type === 'artists' ? (
                                        <>
                                            <td className="px-6 py-4">
                                                <img src={row.img || 'https://via.placeholder.com/32'} className="w-8 h-8 rounded-full border border-docka-100 dark:border-zinc-800 shadow-sm" alt={row.col1} />
                                            </td>
                                            <td className="px-6 py-4 font-medium text-docka-900 dark:text-zinc-100">{row.col1}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 text-[10px] text-docka-600 dark:text-zinc-400 font-medium">
                                                    {row.col2 || '0'} eventos
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <a href={row.col3} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium hover:underline">
                                                    <LinkIcon size={12} /> Link
                                                </a>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${row.col4 === 'Sim' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800' : 'bg-docka-50 dark:bg-zinc-800 text-docka-500 dark:text-zinc-500 border border-docka-100 dark:border-zinc-800'}`}>
                                                    {row.col4 === 'Sim' ? 'Verificado' : 'Não verificado'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 text-indigo-600 dark:text-indigo-400 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-lg text-xs font-medium transition-colors shadow-sm">
                                                    Verificar Artista
                                                </button>
                                            </td>
                                        </>
                                    ) : type === 'categories' ? (
                                        <>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-docka-900 dark:text-zinc-100">{row.col1}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-xs font-mono text-docka-500 dark:text-zinc-400 bg-docka-50 dark:bg-zinc-800 px-2 py-0.5 rounded">{row.col2}</code>
                                            </td>
                                            <td className="px-6 py-4 text-docka-600 dark:text-zinc-400 text-sm">{row.col3}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                                                    Ativa
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setOpenDropdownId(openDropdownId === row.id ? null : row.id)}
                                                        className="p-1.5 text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                                                    >
                                                        <MoreHorizontal size={16} />
                                                    </button>

                                                    {openDropdownId === row.id && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-[60]"
                                                                onClick={() => setOpenDropdownId(null)}
                                                            />
                                                            <div className={`absolute right-0 ${i >= data.length - 2 ? 'bottom-full mb-1' : 'top-full mt-1'} w-40 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden z-[100]`}>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingItem(row);
                                                                        setCategoryName(row.col1);
                                                                        setCategorySlug(row.col2);
                                                                        setCategoryIcon('Music');
                                                                        setIsModalOpen(true);
                                                                        setOpenDropdownId(null);
                                                                    }}
                                                                    className="w-full px-4 py-2.5 text-left text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                                                                >
                                                                    <Pencil size={14} />
                                                                    Editar
                                                                </button>
                                                                 <button
                                                                    onClick={async () => {
                                                                        if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
                                                                            setIsLoading(true);
                                                                            try {
                                                                                await fauvesService.deleteCategory(row.id);
                                                                                fetchData();
                                                                            } catch (err) {
                                                                                console.error('Failed to delete:', err);
                                                                                alert('Erro ao excluir categoria.');
                                                                            } finally {
                                                                                setIsLoading(false);
                                                                            }
                                                                        }
                                                                        setOpenDropdownId(null);
                                                                    }}
                                                                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                                                                >
                                                                    <Trash2 size={14} />
                                                                    Excluir
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </>
                                    ) : type === 'ads' ? (
                                        <>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-docka-900 dark:text-zinc-100">{row.col1}</div>
                                                <div className="text-xs text-docka-500 dark:text-zinc-500 mt-0.5 line-clamp-1">{row.adDescription || 'Confira um novo sistema para oferecer.'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold border border-purple-100 dark:border-purple-800">
                                                    {row.col2}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-xs text-docka-700 dark:text-zinc-300">
                                                    <CreditCard size={14} className="text-yellow-500" />
                                                    {row.col3}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-100 dark:border-emerald-800">
                                                    Ativo
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-docka-600 dark:text-zinc-400">
                                                {row.col5 || '0'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button className="text-indigo-600 dark:text-indigo-400 hover:scale-110 transition-transform">
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button className="text-orange-500 dark:text-orange-400 hover:scale-110 transition-transform">
                                                        <Ban size={16} />
                                                    </button>
                                                    <button className="text-red-500 dark:text-red-400 hover:scale-110 transition-transform">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : type === 'slides' ? (
                                        <>
                                            <td className="px-6 py-4">
                                                <div className="w-16 h-10 rounded bg-docka-100 dark:bg-zinc-800 overflow-hidden border border-docka-200 dark:border-zinc-700">
                                                    {row.img && <img src={row.img} className="w-full h-full object-cover" alt="" />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-docka-900 dark:text-zinc-100">{row.col1}</td>
                                            <td className="px-6 py-4 text-docka-400 dark:text-zinc-500 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <Globe size={12} className="text-blue-500" />
                                                    {row.col2}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-docka-400 dark:text-zinc-500 text-xs">{row.col3}</td>
                                            <td className="px-6 py-4 text-docka-400 dark:text-zinc-500 text-xs font-mono">{row.order || '0'}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs">Ativo</span>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-docka-900 dark:text-zinc-100">{row.col1}</div>
                                                {row.sub1 && <div className="text-[10px] text-docka-400 dark:text-zinc-500">{row.sub1}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-docka-600 dark:text-zinc-400">{row.col2}</td>
                                            <td className="px-6 py-4">
                                                {row.col3 && <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${row.badge === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-docka-100 dark:bg-zinc-800 text-docka-600 dark:text-zinc-400'}`}>{row.col3}</span>}
                                            </td>
                                            <td className="px-6 py-4 text-docka-500 dark:text-zinc-500 text-xs">{row.col4}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Editar</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={config.headers.length} className="px-6 py-12 text-center text-docka-400 dark:text-zinc-600">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 px-2">
                    <span className="text-sm text-docka-500 dark:text-zinc-500">
                        Mostrando página <span className="font-bold text-docka-900 dark:text-zinc-100">{currentPage}</span> de <span className="font-bold text-docka-900 dark:text-zinc-100">{totalPages}</span>
                        {totalItems > 0 && <span className="ml-1">({totalItems} registros)</span>}
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1 text-sm border border-docka-200 dark:border-zinc-700 rounded-md text-docka-600 dark:text-zinc-400 disabled:opacity-50 hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Anterior
                        </button>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="px-3 py-1 text-sm border border-docka-200 dark:border-zinc-700 rounded-md text-docka-600 dark:text-zinc-400 disabled:opacity-50 hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            )}

            {/* DYNAMIC MODAL */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                    setCategoryName(''); setCategorySlug(''); setCategoryIcon('Music');
                    setSlideTitle(''); setSlideImage(''); setSlideUF('Universal (todos)'); setSlideOrder('0');
                    setSlideLinkType('Sem link'); setSlideExternalUrl(''); setSlideSearchEvent('');
                    setIsSlideActive(true); setShowSlideTitle(false);
                    setAdTitle(''); setAdDescription(''); setAdImage(''); setAdCategory('Novidade'); setAdPublic('Organizadores');
                    setAdLink(''); setAdLinkText('Saiba mais'); setAdIsActive(true); setAdOrder('0'); setAdStartDate(''); setAdEndDate('');
                }}
                title={editingItem ? (type === 'slides' ? 'Editar slide' : type === 'ads' ? 'Editar Anúncio' : 'Editar categoria') : (type === 'slides' ? 'Novo Slide' : type === 'ads' ? 'Novo Anúncio' : `Criar ${config.btn?.replace('Novo ', '').replace('Nova ', '')}`)}
                footer={
                    <>
                        <button
                            onClick={() => {
                                setIsModalOpen(false);
                                setEditingItem(null);
                                setCategoryName(''); setCategorySlug(''); setCategoryIcon('Music');
                                setSlideTitle(''); setSlideImage(''); setSlideUF('Universal (todos)'); setSlideOrder('0');
                                setSlideLinkType('Sem link'); setSlideExternalUrl(''); setSlideSearchEvent('');
                                setIsSlideActive(true); setShowSlideTitle(false);
                                setAdTitle(''); setAdDescription(''); setAdImage(''); setAdCategory('Novidade'); setAdPublic('Organizadores');
                                setAdLink(''); setAdLinkText('Saiba mais'); setAdIsActive(true); setAdOrder('0'); setAdStartDate(''); setAdEndDate('');
                            }}
                            className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={isLoading}
                            onClick={async () => {
                                setIsLoading(true);
                                try {
                                    if (type === 'slides') {
                                        console.log('Saving slide:', { title: slideTitle, image: slideImage });
                                    } else if (type === 'ads') {
                                        console.log('Saving announcement:', { title: adTitle });
                                    } else if (type === 'categories') {
                                        const payload = { name: categoryName, slug: categorySlug, icon: categoryIcon };
                                        if (editingItem) {
                                            await fauvesService.updateCategory(editingItem.id, payload);
                                        } else {
                                            await fauvesService.createCategory(payload);
                                        }
                                        fetchData();
                                    }
                                    setIsModalOpen(false);
                                    setEditingItem(null);
                                } catch (err) {
                                    console.error('Failed to save:', err);
                                    alert('Falha ao salvar. Verifique o console.');
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                            className={`px-6 py-2 text-sm font-bold text-white ${type === 'slides' || type === 'ads' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-teal-600 hover:bg-teal-700'} rounded-lg shadow-sm transition-colors disabled:opacity-50`}
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : (editingItem ? 'Salvar' : (type === 'slides' || type === 'ads' ? 'Criar' : 'Salvar'))}
                        </button>
                    </>
                }
            >
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default ManagementView;
