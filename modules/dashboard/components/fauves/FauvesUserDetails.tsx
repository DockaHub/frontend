
import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, Mail, Smartphone, Calendar, 
  Activity, Fingerprint, 
  Save, RotateCw, Ban, CheckCircle, 
  AlertCircle, Info, ArrowLeft, Pencil, 
  Lock, Building, Ticket, ShoppingCart, 
  CalendarDays, TrendingUp, Bell, Handshake,
  ChevronRight
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-sm border border-zinc-100 dark:border-zinc-800/50">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-indigo-500/20 overflow-hidden">
            {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover" /> : user.name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              {user.name} <span className="text-zinc-400 dark:text-zinc-600 font-medium">{user.surname}</span>
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-lg ${isEditing ? 'bg-amber-100 text-amber-700 shadow-amber-500/10' : 'bg-indigo-600 text-white shadow-indigo-500/20 hover:scale-[1.02]'}`}
        >
          {isEditing ? <CheckCircle size={18} /> : <Pencil size={18} />}
          {isEditing ? 'Visualizar' : 'Editar Perfil'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* INFORMACAO DO USUARIO */}
          <section className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-zinc-100 dark:border-zinc-800/50">
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center"><Info size={16} /></span>
              Informações do Usuário
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
          <section className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-zinc-100 dark:border-zinc-800/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center"><Lock size={16} /></span>
                Resetar Senha
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Clique em "Resetar" para definir uma nova senha para este usuário.</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 rounded-xl font-bold text-xs hover:bg-amber-100 transition-all border border-amber-100 dark:border-amber-900/30">
              <RotateCw size={14} /> Resetar
            </button>
          </section>

          {/* DADOS PESSOAIS COMPLETOS */}
          <section className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-zinc-100 dark:border-zinc-800/50">
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center"><UserIcon size={16} /></span>
              Dados Pessoais Completos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Nome Completo</p>
                {isEditing ? (
                  <input value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-lg p-2 text-sm font-bold" />
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
                  <input value={formData.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-lg p-2 text-sm font-bold" />
                ) : (
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{user.phone || '—'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">CPF</p>
                {isEditing ? (
                  <input value={formData.cpf || ''} onChange={e => handleInputChange('cpf', e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-lg p-2 text-sm font-bold" />
                ) : (
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{user.cpf || '—'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter flex items-center gap-1.5 text-zinc-400"><Calendar size={10} /> Data de Nascimento</p>
                {isEditing ? (
                  <input type="date" value={formData.birth?.split('T')[0] || ''} onChange={e => handleInputChange('birth', e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-lg p-2 text-sm font-bold" />
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
              <div className="mt-12 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-10 py-3 bg-zinc-900 dark:bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-zinc-900/10 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                >
                  {saving ? <RotateCw className="animate-spin" size={18} /> : <Save size={18} />}
                  Salvar Alterações
                </button>
              </div>
            )}
          </section>

          {/* ORGANIZACOES */}
          <section className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-zinc-100 dark:border-zinc-800/50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center"><Building size={16} /></span>
                Organizações
              </h3>
              <p className="text-xs font-bold text-zinc-400 tracking-tight">{user.organizations?.length || 0} organização</p>
            </div>
            
            <div className="space-y-3">
              {user.organizations?.length > 0 ? (
                user.organizations.map((org: any) => (
                  <div key={org.id} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/20 group hover:border-indigo-100 transition-all cursor-pointer">
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
           <section className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-zinc-100 dark:border-zinc-800/50">
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-900/30 text-pink-500 flex items-center justify-center"><CalendarDays size={16} /></span>
              Eventos Criados
            </h3>
            
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] py-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 text-zinc-400 flex items-center justify-center shadow-lg mb-4">
                 <Ticket size={32} className="opacity-30" />
              </div>
              <h4 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 leading-none mb-1">{user.eventsCreated || 0}</h4>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Nenhum evento criado</p>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* DETALHES TECNICOS */}
          <section className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-zinc-100 dark:border-zinc-800/50">
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 mb-6 uppercase tracking-widest">Detalhes Técnicos</h3>
            <div className="space-y-6">
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
          <section className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-zinc-100 dark:border-zinc-800/50">
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 mb-6 uppercase tracking-widest">Ações Rápidas</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold text-indigo-500 transition-all group">
                <span className="flex items-center gap-2"><ShoppingCart size={14} /> Ver todos os pedidos</span>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold text-amber-500 transition-all group">
                <span className="flex items-center gap-2"><Lock size={14} /> Resetar senha</span>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all" />
              </button>
              <button 
                onClick={toggleStatus}
                className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold transition-all group ${user.disabled ? 'text-emerald-500' : 'text-red-500'}`}
              >
                <span className="flex items-center gap-2">{user.disabled ? <CheckCircle size={14} /> : <Ban size={14} />} {user.disabled ? 'Ativar conta' : 'Banir usuário'}</span>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all" />
              </button>
            </div>
          </section>

          {/* ATIVIDADE E STATUS */}
          <section className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-zinc-100 dark:border-zinc-800/50">
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center"><Activity size={16} /></span>
              Atividade e Status
            </h3>
            
            <div className="space-y-1">
               <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                 <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</p>
                 </div>
                 <p className={`text-xs font-black ${user.isOnline ? 'text-emerald-500' : 'text-zinc-400'}`}>{user.isOnline ? 'ONLINE' : 'OFFLINE'}</p>
               </div>
               
               <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                 <div className="flex items-center gap-3">
                   <Clock size={12} className="text-zinc-400" />
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Último Acesso</p>
                 </div>
                 <p className="text-xs font-black text-zinc-700 dark:text-zinc-300">{new Date(user.lastAccess).toLocaleString('pt-BR')}</p>
               </div>

               <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                 <div className="flex items-center gap-3">
                   <CalendarDays size={12} className="text-zinc-400" />
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Conta criada há</p>
                 </div>
                 <p className="text-xs font-black text-zinc-700 dark:text-zinc-300">{user.daysSinceJoined ? `${user.daysSinceJoined} dias` : 'Hoje'}</p>
               </div>
            </div>
          </section>

          {/* PREFERENCIAS DE PRIVACIDADE */}
          <section className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-zinc-100 dark:border-zinc-800/50">
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 mb-8 flex items-center gap-3">
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
                <div key={pref.key} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-all">
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
          <section className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-zinc-100 dark:border-zinc-800/50">
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 mb-8">Estatísticas</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Pedidos', val: stats.totalOrders, color: 'blue', icon: ShoppingCart },
                { label: 'Gasto Total', val: user.stats?.totalSpent ? `R$ ${user.stats.totalSpent.toFixed(2)}` : 'R$ 0.00', color: 'emerald', icon: TrendingUp },
                { label: 'Ingressos', val: stats.ticketsOwned, color: 'purple', icon: Ticket },
                { label: 'Eventos', val: stats.eventsAttended, color: 'amber', icon: CalendarDays },
              ].map(card => (
                 <div key={card.label} className={`p-4 rounded-2xl bg-${card.color}-50/50 dark:bg-${card.color}-900/10 border border-${card.color}-100 dark:border-${card.color}-900/20`}>
                   <div className="flex items-center gap-1.5 mb-2 text-zinc-400">
                     <card.icon size={12} className={`text-${card.color}-500`} />
                     <p className="text-[10px] font-black uppercase tracking-tighter">{card.label}</p>
                   </div>
                   <p className={`text-sm font-black text-${card.color}-900 dark:text-${card.color}-300 break-all`}>{card.val}</p>
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
