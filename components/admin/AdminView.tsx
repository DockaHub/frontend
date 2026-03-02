import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Users, Globe, Shield, Activity, Plus, LayoutDashboard, ArrowUpRight, Search, Building2 } from 'lucide-react';
import { INITIAL_DOMAINS, CURRENT_USER } from '../../constants';
import { Organization } from '../../types';
import api from '../../services/api';
import MailboxManager from './MailboxManager';
import DomainManager from './DomainManager';
import UserManager from './UserManager';
import { useToast } from '../../context/ToastContext';

interface AdminViewProps {
  onSelectOrg: (org: Organization) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ onSelectOrg }) => {
  // Sync with URL params
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as any;
  const [activeTab, setActiveTab] = useState<'overview' | 'organizations' | 'mailboxes' | 'domains' | 'users'>(tabParam || 'overview');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  // State for Editing Org
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editName, setEditName] = useState('');
  const [editLogoColor, setEditLogoColor] = useState('');

  useEffect(() => {
    if (tabParam && ['overview', 'organizations', 'mailboxes', 'domains', 'users'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/organizations/list/all');
      if (Array.isArray(response.data)) {
        setOrganizations(response.data);
      } else {
        console.error('Invalid organizations data:', response.data);
        setOrganizations([]);
      }
    } catch (error) {
      console.error("Failed to load organizations", error);
      addToast({ type: 'error', title: 'Erro ao carregar organizações', duration: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = newOrgName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 7);

      await api.post('/organizations', {
        name: newOrgName,
        slug: slug,
        type: 'SAAS',
        logoColor: 'bg-blue-600'
      });

      addToast({ type: 'success', title: 'Organização criada!', duration: 3000 });
      setNewOrgName('');
      setIsCreatingOrg(false);
      loadOrganizations();
    } catch (error) {
      console.error("Failed to create org", error);
      addToast({ type: 'error', title: 'Erro ao criar organização', duration: 3000 });
    }
  };

  const handleOpenEdit = (org: Organization) => {
    setEditingOrg(org);
    setEditName(org.name);
    setEditLogoColor(org.logoColor || 'bg-blue-600');
    setIsEditModalOpen(true);
  };

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;

    try {
      await api.patch(`/organizations/${editingOrg.id}`, {
        name: editName,
        logoColor: editLogoColor
      });

      addToast({ type: 'success', title: 'Organização atualizada!', duration: 3000 });
      setIsEditModalOpen(false);
      loadOrganizations();
    } catch (error) {
      console.error("Failed to update org", error);
      addToast({ type: 'error', title: 'Erro ao atualizar organização', duration: 3000 });
    }
  };

  return (
    <div className="h-screen w-full bg-docka-50 overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-docka-200 px-8 py-5 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-docka-900">Admin Console</h1>
            <p className="text-sm text-docka-500 mt-1">Gerenciamento global da Suíte Docka Workspace.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <div className="text-sm font-medium text-docka-900">{CURRENT_USER.name}</div>
              <div className="text-xs text-docka-500 uppercase tracking-wider font-semibold">Super Admin</div>
            </div>
            <img src={CURRENT_USER.avatar} className="w-10 h-10 rounded-full border border-docka-200" alt="Admin" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Create Org Modal */}
        {isCreatingOrg && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">Nova Organização</h2>
              <form onSubmit={handleCreateOrg}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Organização</label>
                  <input
                    type="text"
                    required
                    value={newOrgName}
                    onChange={e => setNewOrgName(e.target.value)}
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: Minha Empresa"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingOrg(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Criar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Org Modal */}
        {isEditModalOpen && editingOrg && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">Editar Organização</h2>
              <form onSubmit={handleUpdateOrg}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cor do Logo (Tailwind Class)</label>
                  <input
                    type="text"
                    required
                    value={editLogoColor}
                    onChange={e => setEditLogoColor(e.target.value)}
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="bg-blue-600"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Empty State / Welcome */}
        {organizations.length === 0 && !isLoading ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 size={40} className="text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo ao Docka Hub!</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Para começar a gerenciar domínios e e-mails, você precisa criar sua primeira organização.
            </p>
            <button
              onClick={() => setIsCreatingOrg(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all"
            >
              Criar Minha Organização
            </button>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-docka-100 p-1 rounded-lg mb-8 w-fit">
              <button
                onClick={() => handleTabChange('overview')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-white text-docka-900 shadow-sm' : 'text-docka-500 hover:text-docka-900'}`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => handleTabChange('organizations')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'organizations' ? 'bg-white text-docka-900 shadow-sm' : 'text-docka-500 hover:text-docka-900'}`}
              >
                Organizações
              </button>
              <button
                onClick={() => handleTabChange('mailboxes')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'mailboxes' ? 'bg-white text-docka-900 shadow-sm' : 'text-docka-500 hover:text-docka-900'}`}
              >
                Mailboxes
              </button>
              <button
                onClick={() => handleTabChange('domains')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'domains' ? 'bg-white text-docka-900 shadow-sm' : 'text-docka-500 hover:text-docka-900'}`}
              >
                Domínios
              </button>
              <button
                onClick={() => handleTabChange('users')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-white text-docka-900 shadow-sm' : 'text-docka-500 hover:text-docka-900'}`}
              >
                Usuários
              </button>
            </div>

            {activeTab === 'overview' && (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  {[
                    { label: 'Total de Usuários Ativos', value: '1,248', change: '+12% este mês', icon: Users },
                    { label: 'Organizações Gerenciadas', value: organizations.length.toString(), change: 'Todos os Sistemas Operacionais', icon: Globe },
                    { label: 'Pontuação Global de Segurança', value: '99.9%', change: '0 Ameaças Detectadas', icon: Shield },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-docka-200 shadow-sm flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-docka-500">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-docka-900 mt-2">{stat.value}</h3>
                        <span className="text-xs font-medium text-emerald-600 mt-1 block">{stat.change}</span>
                      </div>
                      <div className="p-3 bg-docka-50 rounded-lg text-docka-400">
                        <stat.icon size={24} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Audit Log Snippet */}
                <div className="bg-white rounded-xl border border-docka-200 shadow-sm p-6">
                  <div className="flex items-center mb-4 space-x-2">
                    <Activity size={20} className="text-docka-400" />
                    <h2 className="text-lg font-bold text-docka-900">Log de Auditoria do Sistema</h2>
                  </div>
                  <div className="space-y-4">
                    {[
                      { action: 'Usuário Criado', target: 'sarah@fauves.com', time: 'Há 2 min', actor: 'Alex Arquiteto' },
                      { action: 'Acesso ao Dashboard', target: 'Fauves Dashboard', time: 'Há 15 min', actor: 'Alex Arquiteto (Super Admin)' },
                      { action: 'Método de Pagamento Atualizado', target: 'Faturamento Tokyon', time: 'Há 3 horas', actor: 'Sistema' },
                    ].map((log, i) => (
                      <div key={i} className="flex justify-between items-center text-sm pb-3 border-b border-docka-50 last:border-0 last:pb-0">
                        <div>
                          <span className="font-semibold text-docka-900 mr-2">{log.action}</span>
                          <span className="text-docka-500">em {log.target}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-docka-900 text-xs font-medium">{log.actor}</div>
                          <div className="text-docka-400 text-xs">{log.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'organizations' && (
              <div className="bg-white rounded-xl border border-docka-200 shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-docka-200 flex justify-between items-center bg-white">
                  <div>
                    <h2 className="text-lg font-bold text-docka-900">Gerenciamento de Organizações</h2>
                    <p className="text-xs text-docka-500">Gerencie tenants, domínios e acesse dashboards de negócios específicos.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-docka-400" size={14} />
                      <input className="pl-8 pr-3 py-1.5 text-sm bg-docka-50 border border-docka-200 rounded-md outline-none focus:border-docka-400 transition-colors w-48" placeholder="Buscar organização..." />
                    </div>
                    <button
                      onClick={() => setIsCreatingOrg(true)}
                      className="flex items-center px-3 py-1.5 text-sm bg-docka-900 text-white rounded-md hover:bg-docka-800 transition-colors shadow-sm"
                    >
                      <Plus size={16} className="mr-2" /> Nova Org
                    </button>
                  </div>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-docka-50 text-docka-500 uppercase text-xs font-semibold tracking-wider">
                    <tr>
                      <th className="px-6 py-3 border-b border-docka-100">Organização</th>
                      <th className="px-6 py-3 border-b border-docka-100">Domínio Principal</th>
                      <th className="px-6 py-3 border-b border-docka-100">Tipo</th>
                      <th className="px-6 py-3 border-b border-docka-100">Status</th>
                      <th className="px-6 py-3 border-b border-docka-100 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-docka-100">
                    {organizations.map((org) => {
                      // Mock finding a domain for the org
                      const domain = INITIAL_DOMAINS.find(d => d.name.includes(org.slug)) || { name: `${org.slug}.com`, status: 'active' };

                      return (
                        <tr key={org.id} className="hover:bg-docka-50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-xs mr-3 shadow-sm ${org.logoColor || 'bg-gray-500'}`}>
                                {org.name.substring(0, 1)}
                              </div>
                              <span className="font-semibold text-docka-900">{org.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-docka-600">{(org as any).emailDomain || domain.name}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-docka-100 text-docka-600 capitalize border border-docka-200">
                              {org.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                              <span className="text-xs font-medium text-docka-600">Ativo</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenEdit(org)}
                                className="text-xs font-medium text-docka-500 hover:text-docka-900 px-2 py-1 hover:bg-docka-200 rounded transition-colors"
                              >
                                Config
                              </button>
                              <button
                                onClick={() => onSelectOrg(org)}
                                className="flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors border border-indigo-100"
                              >
                                <LayoutDashboard size={12} className="mr-1.5" /> Abrir Dashboard <ArrowUpRight size={10} className="ml-1" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'mailboxes' && (
              <MailboxManager organizations={organizations} />
            )}

            {activeTab === 'domains' && (
              <DomainManager organizations={organizations} />
            )}

            {activeTab === 'users' && (
              <UserManager organizations={organizations} />
            )}
          </>
        )}

      </main>
    </div>
  );
};
export default AdminView;