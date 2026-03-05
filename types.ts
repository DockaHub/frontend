
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  phone?: string;
  location?: string;
  jobTitle?: string;
  bio?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string; // e.g., 'fauves', 'tokyon'
  logoColor: string; // Tailwind class for fallback avatar
  type: 'EVENT_TECH' | 'SAAS' | 'INFRASTRUCTURE' | 'AGENCY'; // Defines the dashboard type
  features?: {
    calendar?: boolean;
    drive?: boolean;
    contacts?: boolean;
  };
  memberRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
  logo?: string;
  svgIcon?: string;
  iconColor?: string;
  iconBg?: string;
  iconScale?: number;
  clientPortalDomain?: string;
}

export type EmailLabel = 'Important' | 'Social' | 'Updates' | 'Work' | 'System' | 'Personal';

export interface Mailbox {
  id: string;
  name: string;
  email: string;
  type: 'personal' | 'shared' | 'group';
  avatar?: string; // specific avatar or fallback icon
  color?: string; // for UI accents
  organization?: {
    name: string;
    slug: string;
    emailDomain: string;
  };
  labels?: Label[];
}

export interface Label {
  id: string;
  name: string;
  color: string;
  mailboxId: string;
}

export interface Email {
  id: string;
  mailboxId: string; // Links email to a specific mailbox (Personal, Support, etc.)
  from: {
    name: string;
    email: string;
    avatar?: string;
  };
  to: string[];
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  labels: string[];
  folder: 'inbox' | 'sent' | 'archive' | 'trash';
  hasAttachments?: boolean;
}

export interface Domain {
  id: string;
  name: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED';
  verificationToken?: string;
  dkimTokens?: string[];
  createdAt?: string;
  organizationId?: string;
}

// CHAT TYPES
export interface ChatChannel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'dm';
  unreadCount?: number;
  userAvatar?: string; // For DMs
  isOnline?: boolean; // For DMs
  memberIds?: string[]; // IDs of members in the channel
  isPlaceholder?: boolean; // If true, this is a virtual DM (not yet created in DB)
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  reactions?: Record<string, number>;
}

// CALENDAR TYPES
export type CalendarViewType = 'day' | 'week' | 'month';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'meeting' | 'work' | 'personal' | 'ooo';
  color?: string; // Tailwind class
  attendees?: string[];
  location?: string;
  organizationId?: string;
  createdById?: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  participants?: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

// DRIVE TYPES
export type DriveItemType = 'FOLDER' | 'IMAGE' | 'PDF' | 'DOC' | 'SPREADSHEET' | 'VIDEO';

export interface DriveItem {
  id: string;
  parentId: string | null; // null for root
  name: string;
  type: DriveItemType;
  size?: string;
  path?: string;
  thumbnail?: string; // For images
  starred: boolean;
  organizationId?: string;
  ownerId?: string;
  owner?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  shares?: Array<{
    id: string;
    userId: string;
    permission: 'VIEW' | 'EDIT';
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
  }>;
}

// PEOPLE TYPES
export type ContactStatus = 'online' | 'offline' | 'busy' | 'away';

export interface Contact {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  organizationId: string; // Links contact to an Organization
  status: ContactStatus;
  phone?: string;
  location?: string;
  isStarred?: boolean;
  joinDate?: string;
}

// TASKS TYPES (GLOBAL)
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BACKLOG';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  tags?: string[];

  // Organization
  organizationId: string;
  organization?: {
    id: string;
    name: string;
  };

  // Creator
  creatorId: string;
  creator?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };

  // Assignee
  assigneeId: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

// FAUVES SPECIFIC TYPES
export interface FauvesEvent {
  id: string;
  title: string;
  date: string;
  image: string;
  status: 'published' | 'draft' | 'ended';
  location: string;
  stats?: {
    views: number;
    clicks: number;
    orders: number;
    sales: number;
  };
}

export interface Order {
  id: string;
  code?: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    document?: string;
  };
  amount: number;
  subtotal?: number;
  serviceFee?: number;
  status: 'approved' | 'pending' | 'canceled';
  paymentMethod?: string;
  date: string;
  createdAt?: string;
  event: string;
  eventId?: string;
  eventDate?: string;
  eventLocation?: string;
  tickets?: Array<{
    id: string;
    name: string;
    price: number;
    userName?: string;
    userEmail?: string;
    status: string;
  }>;
  timeline?: Array<{
    status: string;
    date: string;
  }>;
  rawFields?: any;
}

export interface TicketSupport {
  id: string;
  subject: string;
  user: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'closed' | 'pending';
  date: string;
}

// KANBAN / CRM TYPES
export interface KanbanTag {
  label: string;
  color: string; // Tailwind class like 'bg-red-100 text-red-700'
}

export interface KanbanCardData {
  id: string;
  title: string; // Company Name or Project Name
  subtitle?: string; // Contact person or Next Step
  value?: string; // Deal value
  date?: string; // Due date or last interaction
  priority?: 'low' | 'medium' | 'high';
  status?: string;
  tags?: { label: string; color: string }[];
  members?: { id: string; name: string; avatar?: string }[];
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  unread?: boolean;
}

export interface KanbanColumnData {
  id: string;
  title: string;
  color?: string; // Header accent color
  cards: KanbanCardData[];
}

export type ViewState = 'dashboard' | 'mail' | 'calendar' | 'drive' | 'admin' | 'contacts' | 'chat' | 'tasks' | 'meet' | 'crm' | 'processes' | 'clients' | 'documents' | 'financial' | 'settings' | 'asterysko' | 'signature';
export type MailFolder = 'inbox' | 'sent' | 'archive' | 'trash';
