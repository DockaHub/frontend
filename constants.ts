
import { Email, Domain, User, Organization, ChatChannel, ChatMessage, CalendarEvent, DriveItem, Contact, Mailbox, Task } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Alex Arquiteto',
  email: 'alex@docka.io',
  avatar: 'https://picsum.photos/id/64/200/200',
  role: 'admin',
};

export const ORGANIZATIONS: Organization[] = [
  { id: 'ae14ea68-91f6-4be3-bd67-d6c1d9762e67', name: 'Docka', slug: 'docka', logoColor: 'bg-slate-900', type: 'SAAS', features: { calendar: true, drive: true, contacts: true } },
  { id: 'org_2', name: 'Fauves', slug: 'fauves', logoColor: 'bg-amber-700', type: 'EVENT_TECH', features: { calendar: true, drive: true, contacts: true } },
  { id: '2a89b3f0-643f-4514-b201-3c7e43db859a', name: 'Tokyon', slug: 'tokyon', logoColor: 'bg-red-600', type: 'INFRASTRUCTURE', features: { calendar: false, drive: false, contacts: false } },
  { id: 'org_4', name: 'Asterysko', slug: 'asterysko', logoColor: 'bg-blue-600', type: 'AGENCY' },
  { id: 'org_5', name: 'Postizi', slug: 'postizi', logoColor: 'bg-purple-600', type: 'SAAS' },
  { id: 'org_6', name: 'Hostizi', slug: 'hostizi', logoColor: 'bg-emerald-600', type: 'INFRASTRUCTURE' },
  { id: 'org_7', name: 'Uma Chave', slug: 'umachave', logoColor: 'bg-orange-500', type: 'AGENCY' },
];

export const INITIAL_DOMAINS: Domain[] = [
  { id: 'd1', name: 'docka.io', status: 'VERIFIED' },
  { id: 'd2', name: 'fauves.com', status: 'VERIFIED' },
  { id: 'd3', name: 'tokyon.jp', status: 'PENDING' },
];

export const MOCK_MAILBOXES: Mailbox[] = [
  {
    id: 'mb_personal',
    name: 'Alex Arquiteto',
    email: 'alex@docka.io',
    type: 'personal',
    avatar: 'https://picsum.photos/id/64/200/200'
  },
  {
    id: 'mb_sales',
    name: 'Time de Vendas',
    email: 'vendas@docka.io',
    type: 'shared',
    color: 'bg-emerald-500'
  },
  {
    id: 'mb_support',
    name: 'Suporte',
    email: 'suporte@docka.io',
    type: 'shared',
    color: 'bg-blue-500'
  }
];

export const MOCK_CHANNELS: ChatChannel[] = [
  { id: 'c1', name: 'geral', type: 'public', unreadCount: 0 },
  { id: 'c2', name: 'produto-design', type: 'public', unreadCount: 3 },
  { id: 'c3', name: 'engenharia', type: 'private', unreadCount: 0 },
  { id: 'dm1', name: 'Sarah Engenheira', type: 'dm', userAvatar: 'https://picsum.photos/id/32/200/200', isOnline: true },
  { id: 'dm2', name: 'Mike Vendas', type: 'dm', userAvatar: 'https://picsum.photos/id/11/200/200', isOnline: false },
];

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    senderId: 'u2',
    senderName: 'Sarah Engenheira',
    senderAvatar: 'https://picsum.photos/id/32/200/200',
    content: 'Alguém viu as últimas especificações no Figma para o fluxo de checkout?',
    timestamp: '10:32',
  },
  {
    id: 'm2',
    senderId: 'u3',
    senderName: 'Mike Vendas',
    senderAvatar: 'https://picsum.photos/id/11/200/200',
    content: 'Acho que o Alex postou no #produto-design ontem.',
    timestamp: '10:34',
  },
  {
    id: 'm3',
    senderId: 'u1',
    senderName: 'Alex Arquiteto',
    senderAvatar: 'https://picsum.photos/id/64/200/200',
    content: 'Sim, acabei de fixar no canal. Me avisem se precisarem da exportação.',
    timestamp: '10:35',
  }
];

export const MOCK_EMAILS: Email[] = [
  {
    id: 'e1',
    mailboxId: 'mb_personal',
    from: { name: 'Equipe Docka', email: 'ola@docka.io', avatar: 'https://picsum.photos/id/20/200/200' },
    to: ['alex@docka.io'],
    subject: 'Bem-vindo ao Docka Workspace v1.0',
    preview: 'A arquitetura multi-tenant agora está ativa...',
    body: `
      <h2>Docka Workspace v1.0</h2>
      <p>Olá Alex,</p>
      <p>Nós implementamos com sucesso a nova <strong>Arquitetura Multi-Tenant</strong>.</p>
      <p><em>Equipe de Produto Docka</em></p>
    `,
    timestamp: '10:00',
    read: false,
    starred: true,
    labels: ['Important', 'System'],
    folder: 'inbox',
  },
  {
    id: 'e2',
    mailboxId: 'mb_personal',
    from: { name: 'Sarah Engenheira', email: 'sarah@fauves.com', avatar: 'https://picsum.photos/id/32/200/200' },
    to: ['alex@docka.io'],
    subject: 'Ativos da Coleção de Inverno Fauves',
    preview: 'As novas imagens da campanha estão prontas para revisão no Drive...',
    body: `<p>Oi Alex, os arquivos foram sincronizados.</p>`,
    timestamp: 'Ontem',
    read: true,
    starred: false,
    labels: ['Work'],
    folder: 'inbox',
  },
  {
    id: 'e3',
    mailboxId: 'mb_personal',
    from: { name: 'Servidor Tokyon', email: 'alert@tokyon.jp' },
    to: ['alex@docka.io'],
    subject: '[Alerta] Alta latência no nó Asia-East',
    preview: 'Tempo de resposta > 500ms detectado...',
    body: `<p>Sistema de alerta automatizado para infraestrutura <strong>Tokyon</strong>.</p>`,
    timestamp: 'Há 2 dias',
    read: true,
    starred: false,
    labels: ['Updates'],
    folder: 'inbox',
  },
  // Sales Mailbox Emails
  {
    id: 'e4',
    mailboxId: 'mb_sales',
    from: { name: 'Big Client Corp', email: 'compras@bigclient.com' },
    to: ['vendas@docka.io'],
    subject: 'RFP para Serviços de Software Q3',
    preview: 'Estamos convidando vocês para submeter uma proposta...',
    body: `<p>Olá Time de Vendas,</p><p>Por favor, encontrem em anexo a RFP.</p>`,
    timestamp: '11:20',
    read: false,
    starred: true,
    labels: ['Work'],
    folder: 'inbox',
  },
  {
    id: 'e5',
    mailboxId: 'mb_sales',
    from: { name: 'Lead Gen Service', email: 'leads@growth.com' },
    to: ['vendas@docka.io'],
    subject: '50 Novos Leads Qualificados',
    preview: 'Seu relatório semanal de leads está pronto...',
    body: `<p>Baixe seus leads.</p>`,
    timestamp: 'Ontem',
    read: true,
    starred: false,
    labels: [],
    folder: 'inbox',
  },
  // Support Mailbox Emails
  {
    id: 'e6',
    mailboxId: 'mb_support',
    from: { name: 'Usuário Irritado', email: 'irritado@cliente.com' },
    to: ['suporte@docka.io'],
    subject: 'O login não está funcionando!!',
    preview: 'Tentei 5 vezes e diz senha inválida...',
    body: `<p>Arrumem isso agora.</p>`,
    timestamp: '10:05',
    read: false,
    starred: false,
    labels: ['Important'],
    folder: 'inbox',
  }
];

// Helper to create dates relative to today
const getRelativeDate = (daysOffset: number, hours: number, minutes: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 'ev1',
    title: 'Sincronização de Produto',
    start: getRelativeDate(0, 10, 0), // Today 10:00
    end: getRelativeDate(0, 11, 0),
    type: 'meeting',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    location: 'Sala de Reunião A',
  },
  {
    id: 'ev2',
    title: 'Foco Profundo',
    start: getRelativeDate(0, 13, 0), // Today 13:00
    end: getRelativeDate(0, 15, 0),
    type: 'work',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  {
    id: 'ev3',
    title: 'Almoço com Sarah',
    start: getRelativeDate(1, 12, 30), // Tomorrow
    end: getRelativeDate(1, 13, 30),
    type: 'personal',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  {
    id: 'ev4',
    title: 'Revisão de Marca Fauves',
    start: getRelativeDate(-1, 9, 0), // Yesterday
    end: getRelativeDate(-1, 10, 30),
    type: 'meeting',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
  {
    id: 'ev5',
    title: 'Reunião Geral Semanal',
    start: getRelativeDate(2, 16, 0), // Day after tomorrow
    end: getRelativeDate(2, 17, 0),
    type: 'meeting',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  }
];

export const MOCK_DRIVE_ITEMS: DriveItem[] = [
  // Root Folders
  { id: 'f1', parentId: null, name: 'Ativos de Marketing', type: 'folder', modifiedAt: 'Há 2 dias', owner: 'Eu', starred: false },
  { id: 'f2', parentId: null, name: 'Contratos & Jurídico', type: 'folder', modifiedAt: 'Há 1 semana', owner: 'Eu', starred: true },
  { id: 'f3', parentId: null, name: 'Especificações de Produto', type: 'folder', modifiedAt: 'Ontem', owner: 'Sarah', starred: false },
  { id: 'f4', parentId: null, name: 'Financeiro 2026', type: 'folder', modifiedAt: 'Há 3 dias', owner: 'Time Financeiro', starred: false },

  // Root Files
  { id: 'fi1', parentId: null, name: 'Resumo_Executivo_Q1.pdf', type: 'pdf', size: '2.4 MB', modifiedAt: 'Hoje 10:30', owner: 'Eu', starred: false },
  { id: 'fi2', parentId: null, name: 'Logo_Horizontal_Dark.png', type: 'image', size: '1.2 MB', modifiedAt: 'Ontem', owner: 'Design Team', starred: false, thumbnail: 'https://picsum.photos/id/42/400/300' },
  { id: 'fi5', parentId: null, name: 'Manual_do_Colaborador.docx', type: 'doc', size: '850 KB', modifiedAt: 'Mês passado', owner: 'RH', starred: false },

  // Inside Marketing Assets (f1)
  { id: 'fi3', parentId: 'f1', name: 'Briefing_Campanha_Inverno.docx', type: 'doc', size: '450 KB', modifiedAt: 'Há 3 dias', owner: 'Eu', starred: false },
  { id: 'fi4', parentId: 'f1', name: 'Banner_Anuncio_v2.png', type: 'image', size: '3.1 MB', modifiedAt: 'Há 3 dias', owner: 'Eu', starred: false, thumbnail: 'https://picsum.photos/id/26/400/300' },
  { id: 'fi6', parentId: 'f1', name: 'Estrategia_Social_Media.xlsx', type: 'spreadsheet', size: '120 KB', modifiedAt: 'Há 1 semana', owner: 'Eu', starred: false },

  // Inside Product Specs (f3)
  { id: 'fi7', parentId: 'f3', name: 'Fluxos_UX.png', type: 'image', size: '5.6 MB', modifiedAt: 'Ontem', owner: 'Sarah', starred: false, thumbnail: 'https://picsum.photos/id/1/400/300' },
];

export const MOCK_CONTACTS: Contact[] = [
  {
    id: 'u1', name: 'Alex Arquiteto', email: 'alex@docka.io', avatar: 'https://picsum.photos/id/64/200/200',
    role: 'CTO', department: 'Executivo', organizationId: 'org_1', status: 'online', location: 'São Paulo', joinDate: 'Jan 2022'
  },
  {
    id: 'u2', name: 'Sarah Engenheira', email: 'sarah@fauves.com', avatar: 'https://picsum.photos/id/32/200/200',
    role: 'Lead Designer', department: 'Design', organizationId: 'org_2', status: 'busy', location: 'Rio de Janeiro', joinDate: 'Mar 2022'
  },
  {
    id: 'u3', name: 'Mike Vendas', email: 'mike@docka.io', avatar: 'https://picsum.photos/id/11/200/200',
    role: 'Head de Vendas', department: 'Vendas', organizationId: 'org_1', status: 'offline', location: 'Lisboa', joinDate: 'Jun 2023', isStarred: true
  },
  {
    id: 'u4', name: 'Jessica Finanças', email: 'jess@docka.io', avatar: 'https://picsum.photos/id/5/200/200',
    role: 'CFO', department: 'Financeiro', organizationId: 'org_1', status: 'away', location: 'Remoto', joinDate: 'Fev 2024'
  },
  {
    id: 'u5', name: 'Tom DevOps', email: 'tom@tokyon.jp', avatar: 'https://picsum.photos/id/12/200/200',
    role: 'Senior DevOps', department: 'Engenharia', organizationId: 'org_3', status: 'online', location: 'Tóquio', joinDate: 'Nov 2023'
  },
  {
    id: 'u6', name: 'Emily Conteúdo', email: 'emily@fauves.com', avatar: 'https://picsum.photos/id/65/200/200',
    role: 'Gerente de Conteúdo', department: 'Marketing', organizationId: 'org_2', status: 'online', location: 'Paris', joinDate: 'Jan 2025'
  }
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1', title: 'Revisar Relatório Mensal', description: 'Revisar KPIs e aprovar para envio',
    organizationId: 'org_1', status: 'TODO', priority: 'HIGH', dueDate: 'Hoje', assigneeId: 'u1', tags: ['Gestão'],
    createdAt: new Date(), updatedAt: new Date(), creatorId: 'u1'
  },
  {
    id: 't2', title: 'Aprovar Criativos Neon Nights', description: 'Verificar se as cores estão no padrão da marca',
    organizationId: 'org_2', status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: 'Amanhã', assigneeId: 'u1', tags: ['Design', 'Aprovação'],
    createdAt: new Date(), updatedAt: new Date(), creatorId: 'u1'
  },
  {
    id: 't3', title: 'Deploy Orange Program v2', description: 'Atualizar ambiente de produção',
    organizationId: 'org_3', status: 'TODO', priority: 'HIGH', dueDate: '28/02', assigneeId: 'u1', tags: ['DevOps'],
    createdAt: new Date(), updatedAt: new Date(), creatorId: 'u1'
  },
  {
    id: 't4', title: 'Agendar call com investidores', description: 'Preparar pitch deck atualizado',
    organizationId: 'org_1', status: 'BACKLOG', priority: 'LOW', dueDate: 'Sem data', assigneeId: 'u1',
    createdAt: new Date(), updatedAt: new Date(), creatorId: 'u1'
  },
  {
    id: 't5', title: 'Renovar Certificados SSL', description: '*.docka.io e *.fauves.com',
    organizationId: 'org_1', status: 'DONE', priority: 'MEDIUM', dueDate: 'Ontem', assigneeId: 'u1', tags: ['Infra'],
    createdAt: new Date(), updatedAt: new Date(), creatorId: 'u1'
  },
  {
    id: 't6', title: 'Feedback Campanha Inverno', description: 'Coletar feedback da equipe de vendas',
    organizationId: 'org_2', status: 'TODO', priority: 'MEDIUM', dueDate: '01/03', assigneeId: 'u1',
    createdAt: new Date(), updatedAt: new Date(), creatorId: 'u1'
  }
];
