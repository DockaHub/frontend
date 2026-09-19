
import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, Mail, Smartphone, Calendar, 
  Activity, Fingerprint, 
  Save, RotateCw, Ban, CheckCircle, 
  AlertCircle, Info, ArrowLeft, Pencil, 
  Lock, Building, Ticket, ShoppingCart, 
  CalendarDays, TrendingUp, Bell, Handshake,
  ChevronRight, Trash2
  , ShieldCheck
} from 'lucide-react';
import { fauvesService } from '../../../../services/fauvesService';

interface FauvesUserDetailsProps {
  userId: string;
  onBack: () => void;
  onUpdate?: () => void;
}

const FauvesUserDetails: React.FC<FauvesUserDetailsProps> = ({ userId, onBack, onUpdate }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const data = await fauvesService.getUserDetailed(userId);
      setUser(data);
      setFormData(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      setError('Falha ao carregar detalhes do usuário.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fauvesService.updateUser(userId, formData);
      await fetchUserDetails();
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to update user:', err);
      alert('Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    if (!window.confirm(`Deseja ${user?.disabled ? 'ativar' : 'desativar'} esta conta?`)) return;
    
    setSaving(true);
    try {
      await fauvesService.toggleUserStatus(userId);
      await fetchUserDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to toggle status:', err);
      alert('Erro ao alterar status.');
    } finally {
      setSaving(false);
    }
  };

  const toggleAdmin = async () => {
    if (!window.confirm(`${user?.isAdmin ? 'Remover' : 'Conceder'} privilégios de administrador para ${user?.email}?`)) return;
    setSaving(true);
    try {
      await fauvesService.setUserAdmin(userId, !user.isAdmin);
      await fetchUserDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to update admin privileges:', err);
      alert('A API Fauves não concluiu a alteração de privilégios.');
    } finally {
      setSaving(false);
    }
  };

  const resetAccess = async () => {
    if (!window.confirm(`Enviar redefinição de senha / OTP para ${user?.email}?`)) return;
    setSaving(true);
    try {
      await fauvesService.resetUserAccess(userId);
      alert('Redefinição de acesso enviada com sucesso.');
    } catch (err) {
      console.error('Failed to reset access:', err);
      alert('A API Fauves não concluiu o envio da redefinição.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (deleteConfirmEmail !== user?.email) return;
    setDeleting(true);
    try {
      await fauvesService.deleteUser(userId);
      if (onUpdate) onUpdate();
      onBack();
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert('Erro ao excluir o usuário: ' + (err?.response?.data?.message || err.message || 'Erro desconhecido'));
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-docka-400 dark:text-zinc-500 bg-zinc-50/50 dark:bg-black/20 rounded-3xl min-h-[600px]">
        <RotateCw size={40} className="animate-spin mb-6 text-indigo-500" />
        <p className="text-sm font-bold uppercase tracking-widest opacity-50">Sincronizando dados...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-24 text-center text-red-500 bg-white dark:bg-zinc-900 rounded-3xl border border-red-100 dark:border-red-900/20 shadow-xl">
        <AlertCircle size={48} className="mx-auto mb-6 opacity-30" />
        <h3 className="text-xl font-bold mb-2">Ops! Ocorreu um erro</h3>
        <p className="font-medium mb-6">{error || 'Usuário não encontrado'}</p>
        <button onClick={onBack} className="px-6 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl font-bold transition-all">
          Voltar para Lista
        </button>
      </div>
    );
  }

  const stats = user.stats || {};

  return (
    <>
    <div className="h-full overflow-y-auto bg-white pb-12 animate-in fade-in duration-500 dark:bg-zinc-950">
      {/* HEADER PAGE */}
      <div className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between gap-3 border-b border-[#e5e5e5] bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <button 
            onClick={onBack}
            aria-label="Voltar para usuários"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-black dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-50 text-sm font-bold text-[#2a2ad7] dark:bg-indigo-950/40 dark:text-indigo-300">
            {user.photoUrl ? <img src={user.photoUrl} className="h-full w-full object-cover" alt="" /> : user.name?.charAt(0)}
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-season text-lg font-[420] text-black dark:text-white sm:text-xl">
              {user.name} <span className="text-zinc-500 dark:text-zinc-400">{user.surname}</span>
            </h1>
            <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400 sm:text-xs">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3 text-xs font-semibold transition-colors sm:px-4 ${isEditing ? 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300' : 'bg-[#2a2ad7] text-white hover:bg-indigo-800'}`}
        >
          {isEditing ? <CheckCircle size={15} /> : <Pencil size={15} />}
          <span className="hidden sm:inline">{isEditing ? 'Visualizar' : 'Editar perfil'}</span>
        </button>
      </div>

      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-12 lg:p-8">
        {/* LEFT COLUMN */}
        <div className="space-y-4 lg:col-span-8">
          
          {/* INFORMACAO DO USUARIO */}
          <section className="border border-[#e5e5e5] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
            <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-900/30"><Info size={15} /></span>
              Informações do Usuário
            </h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
               <div className="space-y-1">
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Nome</p>
                 <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{user.name}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Email</p>
                 <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{user.email}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Permissões</p>
                 <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{user.isAdmin ? 'Administrador Global' : user.role || 'Usuário comum'}</p>
               </div>
            </div>
          </section>

          {/* RESETAR SENHA */}
          <section className="flex flex-col justify-between gap-4 border border-[#e5e5e5] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:p-5">
            <div>
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center"><Lock size={16} /></span>
                Resetar Senha
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Clique em "Resetar" para definir uma nova senha para este usuário.</p>
            </div>
            <button onClick={resetAccess} disabled={saving} className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-300">
              <RotateCw size={14} /> Enviar redefinição
            </button>
          </section>

          {/* DADOS PESSOAIS COMPLETOS */}
          <section className="border border-[#e5e5e5] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
            <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <span className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center"><UserIcon size={16} /></span>
              Dados Pessoais Completos
            </h3>
            
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Nome Completo</p>
                {isEditing ? (
                  <input value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold outline-none focus:border-[#2a2ad7] dark:border-zinc-700 dark:bg-zinc-900" />
                ) : (
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{user.name} {user.surname}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Email</p>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{user.email}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter flex items-center gap-1.5 text-zinc-400"><Smartphone size={10} /> Telefone</p>
                {isEditing ? (
                  <input value={formData.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold outline-none focus:border-[#2a2ad7] dark:border-zinc-700 dark:bg-zinc-900" />
                ) : (
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{user.phone || '—'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">CPF</p>
                {isEditing ? (
                  <input value={formData.cpf || ''} onChange={e => handleInputChange('cpf', e.target.value)} className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold outline-none focus:border-[#2a2ad7] dark:border-zinc-700 dark:bg-zinc-900" />
                ) : (
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{user.cpf || '—'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter flex items-center gap-1.5 text-zinc-400"><Calendar size={10} /> Data de Nascimento</p>
                {isEditing ? (
                  <input type="date" value={formData.birth?.split('T')[0] || ''} onChange={e => handleInputChange('birth', e.target.value)} className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold outline-none focus:border-[#2a2ad7] dark:border-zinc-700 dark:bg-zinc-900" />
                ) : (
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{user.birth ? new Date(user.birth).toLocaleDateString('pt-BR') : '—'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Função</p>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest text-indigo-500">{user.role || 'ATTENDEE'}</p>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#2a2ad7] px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-800 sm:w-auto"
                >
                  {saving ? <RotateCw className="animate-spin" size={18} /> : <Save size={18} />}
                  Salvar Alterações
                </button>
              </div>
            )}
          </section>

          {/* ORGANIZACOES */}
          <section className="border border-[#e5e5e5] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center"><Building size={16} /></span>
                Organizações
              </h3>
              <p className="text-xs font-bold text-zinc-400 tracking-tight">{user.organizations?.length || 0} organização</p>
            </div>
            
            <div className="space-y-3">
              {user.organizations?.length > 0 ? (
                user.organizations.map((org: any) => (
                  <div key={org.id} className="group flex items-center gap-3 border-b border-[#e5e5e5] py-3 last:border-b-0 dark:border-zinc-800">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center font-black text-indigo-500 shadow-sm overflow-hidden">
                      {org.logoUrl ? <img src={org.logoUrl} className="w-full h-full object-cover" /> : org.name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">{org.name}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">{org.role} • Desde {new Date(org.joinedAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <CheckCircle size={14} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700">
                   <Handshake size={32} className="mb-2 opacity-20" />
                   <p className="text-xs font-bold italic">Nenhuma organização vinculada</p>
                </div>
              )}
            </div>
          </section>

           {/* EVENTOS CRIADOS */}
           <section className="border border-[#e5e5e5] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
            <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <span className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-900/30 text-pink-500 flex items-center justify-center"><CalendarDays size={16} /></span>
              Eventos Criados
            </h3>
            
            <div className="flex flex-col items-center justify-center border border-dashed border-zinc-200 bg-zinc-50/70 py-10 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-zinc-400 dark:bg-zinc-900">
                 <Ticket size={32} className="opacity-30" />
              </div>
              <h4 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 leading-none mb-1">{user.eventsCreated || 0}</h4>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Nenhum evento criado</p>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4 lg:col-span-4">
          
          {/* DETALHES TECNICOS */}
          <section className="border border-[#e5e5e5] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Detalhes da conta</h3>
            <div className="space-y-5">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-zinc-400 uppercase">ID do Usuário</p>
                <p className="text-[10px] font-mono font-bold text-zinc-500 break-all">{user.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Data de Cadastro</p>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <Calendar size={14} className="text-zinc-400" />
                  {new Date(user.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).replace(',', ' •')}
                </div>
              </div>
            </div>
          </section>

          {/* ACOES RAPIDAS */}
          <section className="border border-[#e5e5e5] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Ações rápidas</h3>
            <div className="divide-y divide-[#e5e5e5] dark:divide-zinc-800">
              <button onClick={toggleAdmin} disabled={saving} className="group flex min-h-12 w-full items-center justify-between py-3 text-left text-xs font-semibold text-teal-600 transition-colors disabled:opacity-50">
                <span className="flex items-center gap-2"><ShieldCheck size={14} /> {user.isAdmin ? 'Remover administrador' : 'Tornar administrador'}</span>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all" />
              </button>
              <button className="group flex min-h-12 w-full items-center justify-between py-3 text-left text-xs font-semibold text-indigo-500 transition-colors">
                <span className="flex items-center gap-2"><ShoppingCart size={14} /> Ver todos os pedidos</span>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all" />
              </button>
              <button onClick={resetAccess} disabled={saving} className="group flex min-h-12 w-full items-center justify-between py-3 text-left text-xs font-semibold text-amber-600 transition-colors disabled:opacity-50">
                <span className="flex items-center gap-2"><Lock size={14} /> Resetar senha</span>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all" />
              </button>
              <button 
                onClick={toggleStatus}
                className={`group flex min-h-12 w-full items-center justify-between py-3 text-left text-xs font-semibold transition-colors ${user.disabled ? 'text-emerald-600' : 'text-red-600'}`}
              >
                <span className="flex items-center gap-2">{user.disabled ? <CheckCircle size={14} /> : <Ban size={14} />} {user.disabled ? 'Ativar conta' : 'Banir usuário'}</span>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all" />
              </button>
              <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button 
                  onClick={() => { setDeleteConfirmEmail(''); setShowDeleteModal(true); }}
                  className="group flex min-h-11 w-full items-center justify-between rounded-full border border-red-200 px-4 text-left text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/20"
                >
                  <span className="flex items-center gap-2"><Trash2 size={14} /> Excluir conta permanentemente</span>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all" />
                </button>
              </div>
            </div>
          </section>

          {/* ATIVIDADE E STATUS */}
          <section className="border border-[#e5e5e5] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
            <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center"><Activity size={16} /></span>
              Atividade e Status
            </h3>
            
            <div className="space-y-1">
               <div className="flex min-h-12 items-center justify-between border-b border-[#e5e5e5] py-3 dark:border-zinc-800">
                 <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</p>
                 </div>
                 <p className={`text-xs font-semibold ${user.isOnline ? 'text-emerald-500' : 'text-zinc-400'}`}>{user.isOnline ? 'Online' : 'Offline'}</p>
               </div>
               
               <div className="flex min-h-12 items-center justify-between border-b border-[#e5e5e5] py-3 dark:border-zinc-800">
                 <div className="flex items-center gap-3">
                   <Clock size={12} className="text-zinc-400" />
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Último Acesso</p>
                 </div>
                 <p className="max-w-[48%] text-right text-xs font-semibold text-zinc-700 dark:text-zinc-300">{user.lastAccess ? new Date(user.lastAccess).toLocaleString('pt-BR') : 'Sem registro'}</p>
               </div>

               <div className="flex min-h-12 items-center justify-between py-3">
                 <div className="flex items-center gap-3">
                   <CalendarDays size={12} className="text-zinc-400" />
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Conta criada há</p>
                 </div>
                 <p className="text-xs font-black text-zinc-700 dark:text-zinc-300">{user.daysSinceJoined ? `${user.daysSinceJoined} dias` : 'Hoje'}</p>
               </div>
            </div>
          </section>

          {/* PREFERENCIAS DE PRIVACIDADE */}
          <section className="border border-[#e5e5e5] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
            <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <span className="w-8 h-8 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center"><Fingerprint size={16} /></span>
              Preferências de Privacidade
            </h3>
            
            <div className="space-y-1">
              {[
                { key: 'receiveNewsletter', label: 'Receber Newsletter', icon: Mail },
                { key: 'receiveEventUpdates', label: 'Atualizações de Eventos', icon: Bell },
                { key: 'receivePromotions', label: 'Promoções', icon: Ticket },
                { key: 'allowContact', label: 'Permitir Contato', icon: Smartphone }
              ].map(pref => (
                <div key={pref.key} className="flex min-h-11 items-center justify-between border-b border-[#e5e5e5] py-2.5 last:border-b-0 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <pref.icon size={12} className="text-zinc-400" />
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">{pref.label}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${user.emailPreferences?.[pref.key] ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700'}`}>
                    {user.emailPreferences?.[pref.key] ? 'Sim' : 'Não'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ESTATISTICAS */}
          <section className="border border-[#e5e5e5] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
            <h3 className="mb-5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Estatísticas</h3>
            
            <div className="mb-5 grid grid-cols-2 gap-px overflow-hidden border border-[#e5e5e5] bg-[#e5e5e5] dark:border-zinc-800 dark:bg-zinc-800">
              {[
                { label: 'Pedidos', val: stats.totalOrders, color: 'blue', icon: ShoppingCart },
                { label: 'Gasto Total', val: user.stats?.totalSpent ? `R$ ${user.stats.totalSpent.toFixed(2)}` : 'R$ 0.00', color: 'emerald', icon: TrendingUp },
                { label: 'Ingressos', val: stats.ticketsOwned, color: 'purple', icon: Ticket },
                { label: 'Eventos', val: stats.eventsAttended, color: 'amber', icon: CalendarDays },
              ].map(card => (
                 <div key={card.label} className="bg-white p-3 dark:bg-zinc-950">
                   <div className="flex items-center gap-1.5 mb-2 text-zinc-400">
                     <card.icon size={12} className="text-[#2a2ad7] dark:text-indigo-400" />
                     <p className="text-[10px] font-black uppercase tracking-tighter">{card.label}</p>
                   </div>
                   <p className="break-all text-sm font-semibold text-zinc-900 dark:text-zinc-100">{card.val}</p>
                 </div>
              ))}
            </div>

            <div className="space-y-4">
               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Pedidos por Status</p>
               <div className="flex items-center justify-around gap-2 px-2">
                  <div className="flex flex-col items-center">
                    <p className="text-lg font-black text-emerald-500">{stats.paidOrders || 0}</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase"><CheckCircle size={10} className="text-emerald-500" /> Pagos</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-lg font-black text-amber-500">{stats.pendingOrders || 0}</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase"><Clock size={10} className="text-amber-500" /> Pendentes</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-lg font-black text-red-500">{stats.cancelledOrders || 0}</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase"><AlertCircle size={10} className="text-red-500" /> Cancelados</div>
                  </div>
               </div>
            </div>
          </section>

        </div>
      </div>

    </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md border border-red-100 bg-white p-5 shadow-2xl animate-in zoom-in-95 duration-200 dark:border-red-900/30 dark:bg-zinc-900 sm:p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 flex-shrink-0">
                <Trash2 size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">Excluir conta permanentemente</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Esta ação é <span className="font-black text-red-500">irreversível</span> e não pode ser desfeita.</p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-4 mb-6 border border-red-100 dark:border-red-900/20">
              <p className="text-xs text-red-700 dark:text-red-400 font-bold leading-relaxed">
                Todos os dados deste usuário serão excluídos permanentemente, incluindo tickets, pedidos e associações com organizações.
              </p>
            </div>

            <div className="mb-6">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Confirme digitando o e-mail do usuário</p>
              <p className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2 mb-3 select-all">{user.email}</p>
              <input
                type="email"
                value={deleteConfirmEmail}
                onChange={e => setDeleteConfirmEmail(e.target.value)}
                placeholder="Digite o e-mail para confirmar..."
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:border-red-400 dark:focus:border-red-600 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:font-normal placeholder:text-zinc-400"
                autoFocus
              />
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="min-h-11 flex-1 rounded-full border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleteConfirmEmail !== user.email || deleting}
                className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deleting ? <RotateCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {deleting ? 'Excluindo...' : 'Excluir definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FauvesUserDetails;

function Clock({ size, className }: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
