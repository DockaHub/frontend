
import React, { useState } from 'react';
import { Palette, Info } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Organization } from '../types';

interface OrganizationIconSettingsProps {
    organization: Organization;
    onSaveSuccess?: () => void;
}

const OrganizationIconSettings: React.FC<OrganizationIconSettingsProps> = ({ organization, onSaveSuccess }) => {
    const { addToast } = useToast();
    const [svgIcon, setSvgIcon] = useState(organization?.svgIcon || '');
    const [iconColor, setIconColor] = useState(organization?.iconColor || '#ffffff');
    const [iconBg, setIconBg] = useState(organization?.iconBg || '#2563EB');
    const [iconScale, setIconScale] = useState(organization?.iconScale || 1);
    const [saving, setSaving] = useState(false);

    const handleSaveIcon = async () => {
        if (!organization) return;
        try {
            setSaving(true);
            await api.patch(`/organizations/${organization.id}`, {
                svgIcon,
                iconColor,
                iconBg,
                iconScale
            });
            addToast({
                type: 'success',
                title: 'Ícone atualizado',
                message: 'A personalização da organização foi salva com sucesso.',
            });
            if (onSaveSuccess) {
                onSaveSuccess();
            } else {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error saving icon:', error);
            addToast({
                type: 'error',
                title: 'Erro ao salvar',
                message: 'Não foi possível salvar a personalização.',
            });
        } finally {
            setSaving(false);
        }
    };

    const cleanSvg = (svg: string) => {
        if (!svg) return '';
        return svg
            .replace(/<\?xml.*?\?>/gi, '')
            .replace(/<!DOCTYPE.*?>/gi, '')
            .replace(/<!--.*?-->/gs, '')
            .replace(/<style.*?>.*?<\/style>/gs, '')
            .replace(/<defs.*?>.*?<\/defs>/gs, '')
            .replace(/\s+(fill|stroke)=["'][^"']*["']/gi, ' ')
            .replace(/<svg([^>]*?)\s+(width|height)=["'][^"']*["']/gi, '<svg$1')
            .replace(/<svg([^>]*?)\s+(width|height)=["'][^"']*["']/gi, '<svg$1')
            .trim();
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-docka-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Palette size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-docka-900 dark:text-zinc-100">Ícone da Organização</h3>
                        <p className="text-[10px] text-docka-500 dark:text-zinc-500">Personalize a identidade visual na barra lateral</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                        {/* Cores */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1.5 flex items-center gap-1.5">
                                    <Palette size={12} /> Cor do Fundo
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={iconBg}
                                        onChange={(e) => setIconBg(e.target.value)}
                                        className="w-10 h-10 rounded-lg border border-docka-200 dark:border-zinc-700 bg-transparent cursor-pointer overflow-hidden p-0"
                                    />
                                    <input
                                        type="text"
                                        value={iconBg}
                                        onChange={(e) => setIconBg(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-docka-50/50 dark:bg-zinc-950/50 border border-docka-200 dark:border-zinc-800 rounded-lg text-xs font-mono outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1.5 flex items-center gap-1.5">
                                    <Palette size={12} /> Cor do Ícone
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={iconColor}
                                        onChange={(e) => setIconColor(e.target.value)}
                                        className="w-10 h-10 rounded-lg border border-docka-200 dark:border-zinc-700 bg-transparent cursor-pointer overflow-hidden p-0"
                                    />
                                    <input
                                        type="text"
                                        value={iconColor}
                                        onChange={(e) => setIconColor(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-docka-50/50 dark:bg-zinc-950/50 border border-docka-200 dark:border-zinc-800 rounded-lg text-xs font-mono outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Zoom */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="block text-[10px] font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">
                                    Ajuste de Zoom
                                </label>
                                <span className="text-[10px] font-mono text-docka-500">{Math.round(iconScale * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="4"
                                step="0.1"
                                value={iconScale}
                                onChange={(e) => setIconScale(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-docka-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        {/* SVG Input */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-docka-700 dark:text-zinc-400 uppercase">
                                Código SVG
                            </label>
                            <textarea
                                className="w-full px-4 py-3 bg-docka-50/50 dark:bg-zinc-950/50 border border-docka-200 dark:border-zinc-800 rounded-xl text-sm font-mono text-docka-900 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 min-h-[120px] transition-all"
                                placeholder="<svg ...> ... </svg>"
                                value={svgIcon}
                                onChange={(e) => setSvgIcon(e.target.value)}
                            />
                            <div className="flex items-start gap-2 text-[10px] text-docka-400 dark:text-zinc-500 italic">
                                <Info size={12} className="mt-0.5 shrink-0" />
                                <p>Recomendado: SVGs exportados de IA/Figma. Dimensões fixas e estilos internos serão limpos automaticamente.</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleSaveIcon}
                                disabled={saving || !svgIcon}
                                className="px-8 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-700 dark:hover:bg-blue-600 shadow-md shadow-blue-500/10 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {saving ? 'Salvando...' : 'Salvar Personalização'}
                            </button>
                        </div>
                    </div>

                    {/* Preview Sidebar Area */}
                    <div className="w-full md:w-48 flex flex-col items-center justify-start gap-4">
                        <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase">
                            Preview Lateral
                        </label>
                        <div className="relative group">
                            {/* Fake Sidebar Background */}
                            <div className="absolute -inset-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl -z-10 group-hover:scale-110 transition-transform duration-500"></div>

                            <div
                                className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold shadow-lg overflow-hidden border-2 border-white dark:border-zinc-800 transition-all duration-300 ring-4 ring-docka-50 dark:ring-zinc-900`}
                                style={{ backgroundColor: iconBg, color: iconColor }}
                            >
                                {svgIcon ? (
                                    <div
                                        className="w-full h-full p-3 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current [&>svg]:block transition-transform duration-300"
                                        style={{ transform: `scale(${iconScale})` }}
                                        dangerouslySetInnerHTML={{ __html: cleanSvg(svgIcon) }}
                                    />
                                ) : (
                                    <span className="text-3xl">{organization?.name?.substring(0, 1) || 'A'}</span>
                                )}
                            </div>
                        </div>
                        <p className="text-[10px] text-center text-docka-400 dark:text-zinc-500 mt-2 max-w-[120px]">
                            Como o ícone aparecerá no alternador de empresas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationIconSettings;
