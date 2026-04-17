
import React, { useState } from 'react';
import { Hash, Lock, Plus, Search, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { ChatChannel, Organization } from '../../../types';
import UserAvatar from '../../../components/common/UserAvatar';

interface ChatSidebarProps {
  channels: ChatChannel[];
  selectedChannelId: string;
  onSelectChannel: (id: string) => void;
  currentOrg: Organization;
  onAddChannel?: () => void;
  onNewDM: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  channels,
  selectedChannelId,
  onSelectChannel,
  currentOrg,
  onAddChannel,
  onNewDM
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Group channels by organization
  const groupedChannels = channels.reduce((acc, channel) => {
    const orgId = channel.organizationId || currentOrg.id;
    const orgName = channel.organization?.name || currentOrg.name;
    
    if (!acc[orgId]) {
      acc[orgId] = {
        name: orgName,
        channels: []
      };
    }
    acc[orgId].channels.push(channel);
    return acc;
  }, {} as Record<string, { name: string; channels: ChatChannel[] }>);

  const ChannelItem: React.FC<{ channel: ChatChannel }> = ({ channel }) => {
    const isSelected = selectedChannelId === channel.id;
    return (
      <button
        onClick={() => onSelectChannel(channel.id)}
        title={isCollapsed ? channel.name : undefined}
        className={`w-full flex items-center px-3 py-1.5 text-sm rounded-md transition-all duration-200 group mb-0.5 ${isSelected
            ? 'bg-docka-200 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100 font-medium'
            : 'text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800/50 hover:text-docka-900 dark:hover:text-zinc-200'
          } ${isCollapsed ? 'justify-center relative' : ''}`}
      >
        {channel.type === 'dm' ? (
          <div className={`relative ${!isCollapsed ? 'mr-2' : ''}`}>
            <UserAvatar src={channel.userAvatar} name={channel.name} size="xs" className="rounded-md" />
            {channel.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-white dark:border-zinc-900 rounded-full"></div>}
          </div>
        ) : (
          <span className={`${!isCollapsed ? 'mr-2' : ''} text-docka-400 dark:text-zinc-500 group-hover:text-docka-600 dark:group-hover:text-zinc-300`}>
            {channel.type === 'private' ? <Lock size={14} /> : <Hash size={14} />}
          </span>
        )}

        {!isCollapsed && (
          <>
            <span className="truncate flex-1 text-left">{channel.name}</span>
            {channel.unreadCount && channel.unreadCount > 0 && (
              <span className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] px-1.5 rounded-full font-bold ml-2">
                {channel.unreadCount}
              </span>
            )}
          </>
        )}
        {/* Collapsed Unread Dot */}
        {isCollapsed && channel.unreadCount && channel.unreadCount > 0 && (
          <span className="absolute top-0 right-1 w-2 h-2 bg-docka-900 dark:bg-zinc-100 rounded-full border border-white dark:border-zinc-900" />
        )}
      </button>
    )
  }

  return (
    <div className={`${isCollapsed ? 'w-[60px]' : 'w-[240px]'} flex flex-col bg-docka-50 dark:bg-zinc-900 pt-4 h-full border-r border-docka-200 dark:border-zinc-800 hidden lg:flex transition-all duration-300`}>
      {/* Global Header */}
      <div className={`mb-4 flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        {!isCollapsed && <h2 className="text-sm font-bold text-docka-900 dark:text-zinc-100 truncate mr-2">Chat Global</h2>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 p-1.5 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
        >
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="px-4 mb-4 animate-in fade-in">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
            <input
              className="w-full bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-md py-1.5 pl-8 text-xs focus:ring-1 focus:ring-docka-300 dark:focus:ring-zinc-600 outline-none text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600"
              placeholder="Ir para..."
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 space-y-6 custom-scrollbar pb-6">
        {Object.entries(groupedChannels).map(([orgId, group]) => (
          <div key={orgId} className="space-y-1">
            {!isCollapsed && (
              <div className="flex items-center justify-between px-2 mb-2">
                 <h3 className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest">{group.name}</h3>
                 {orgId === currentOrg.id && onAddChannel && (
                    <button onClick={onAddChannel} className="p-0.5 rounded hover:bg-docka-200 dark:hover:bg-zinc-800 text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 transition-all">
                      <Plus size={12} />
                    </button>
                 )}
              </div>
            )}
            
            <div className="space-y-0.5">
              {/* Separate by types within organization? Or mixed? User suggested Group by Org */}
              {group.channels
                .filter(c => c.type !== 'dm')
                .map(c => <ChannelItem key={c.id} channel={c} />)}
              
              {group.channels
                .filter(c => c.type === 'dm')
                .map(c => <ChannelItem key={c.id} channel={c} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
