import React, { useState } from 'react';
import { Image, Megaphone, Music2, Sparkles } from 'lucide-react';
import ManagementView from './ManagementView';
import { PageHeader, Panel } from './FauvesUI';

type Tab = 'slides' | 'artists' | 'ads';

const FauvesMarketingView: React.FC<{ initialTab?: Tab }> = ({ initialTab = 'slides' }) => {
    const [tab, setTab] = useState<Tab>(initialTab);
    const tabs = [
        { id: 'slides' as const, label: 'Slides da Home', icon: Image, description: 'Banners desktop/mobile por UF' },
        { id: 'artists' as const, label: 'Artistas & Spotify', icon: Music2, description: 'Catálogo e sincronização musical' },
        { id: 'ads' as const, label: 'Anúncios', icon: Megaphone, description: 'Avisos globais da plataforma' },
    ];
    return <div className="animate-in fade-in duration-500">
        <PageHeader eyebrow="Curadoria & Growth" title="Marketing da plataforma" description="Gerencie vitrines geolocalizadas, catálogo artístico e comunicação com produtores." />
        <div className="mb-6 grid gap-3 md:grid-cols-3">{tabs.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${tab === item.id ? 'border-teal-400 bg-teal-50 shadow-sm dark:border-teal-700 dark:bg-teal-950/25' : 'border-slate-200 bg-white hover:border-teal-200 dark:border-zinc-800 dark:bg-zinc-900'}`}><div className={`rounded-xl p-2.5 ${tab === item.id ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-zinc-800'}`}><item.icon size={18} /></div><div><div className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</div><div className="mt-1 text-[10px] text-slate-400">{item.description}</div></div></button>)}</div>
        {tab === 'artists' && <Panel className="mb-6 flex items-start gap-4 border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 p-5 dark:border-teal-900 dark:from-teal-950/30 dark:to-cyan-950/20"><Sparkles size={20} className="mt-0.5 text-teal-600" /><div><h3 className="text-sm font-bold text-teal-950 dark:text-teal-200">Catálogo conectado ao Spotify</h3><p className="mt-1 text-xs leading-5 text-teal-700 dark:text-teal-300">Busque artistas na criação de eventos para importar nome, foto em alta resolução, gêneros e URL oficial.</p></div></Panel>}
        <ManagementView type={tab} hideHeader />
    </div>;
};

export default FauvesMarketingView;
