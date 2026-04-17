import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { Lock, Save, LogOut, CheckCircle2 } from 'lucide-react';

export const ForcePasswordChange: React.FC = () => {
    const { user, refreshUser, logout } = useAuth();
    const { addToast } = useToast();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword.length < 6) {
            addToast({ type: 'error', title: 'Senha muito curta', message: 'A senha deve ter pelo menos 6 caracteres.', duration: 4000 });
            return;
        }

        if (newPassword !== confirmPassword) {
            addToast({ type: 'error', title: 'Senhas não conferem', message: 'As senhas digitadas são diferentes.', duration: 4000 });
            return;
        }

        setIsSaving(true);
        try {
            await userService.setPassword(user!.id, newPassword);
            addToast({ type: 'success', title: 'Senha atualizada!', message: 'Sua conta agora está segura e você pode acessar o sistema.', duration: 5000 });
            await refreshUser(); // This should clear the requirePasswordChange flag from the local user state
        } catch (error: any) {
            console.error('Failed to update password:', error);
            addToast({ type: 'error', title: 'Erro ao atualizar', message: error.response?.data?.error || 'Tente novamente.', duration: 4000 });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-docka-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-docka-200 overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-docka-900 p-8 text-white text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                        <Lock size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">Segurança Obrigatória</h1>
                    <p className="text-docka-300 text-sm mt-2">
                        Como este é seu primeiro acesso, você deve definir uma senha definitiva para garantir a segurança da sua conta.
                    </p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-docka-500 uppercase tracking-widest block">Nova Senha</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-docka-200 rounded-xl focus:ring-2 focus:ring-docka-900 outline-none transition-all"
                                placeholder="Crie uma senha forte"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-docka-500 uppercase tracking-widest block">Confirmar Senha</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-docka-200 rounded-xl focus:ring-2 focus:ring-docka-900 outline-none transition-all"
                                placeholder="Digite a mesma senha novamente"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-4 bg-docka-900 text-white rounded-xl font-bold hover:bg-docka-800 shadow-lg hover:shadow-xl transition-all flex items-center justify-center disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 size={20} className="mr-2" />
                                        Ativar Conta e Continuar
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-docka-100 flex justify-center">
                        <button 
                            onClick={() => logout()}
                            className="text-sm font-medium text-docka-400 hover:text-red-500 flex items-center transition-colors"
                        >
                            <LogOut size={16} className="mr-2" />
                            Sair da conta
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-docka-400 text-sm font-medium">
                © {new Date().getFullYear()} Docka Workspace • Advanced Agentic Coding
            </div>
        </div>
    );
};
