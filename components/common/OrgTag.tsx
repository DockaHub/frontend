import React from 'react';
import { ORGANIZATIONS } from '../../constants';

interface OrgTagProps {
  orgId: string;
  size?: 'sm' | 'md';
  showName?: boolean;
}

const OrgTag: React.FC<OrgTagProps> = ({ orgId, size = 'sm', showName = true }) => {
  const org = ORGANIZATIONS.find(o => o.id === orgId);
  if (!org) return null;

  const sizeClasses = size === 'sm' ? 'w-4 h-4 text-[8px]' : 'w-6 h-6 text-[10px]';
  const textClasses = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-md border border-docka-100 bg-docka-50/50 hover:bg-docka-100 transition-colors cursor-default select-none group" title={org.name}>
      <div className={`${sizeClasses} ${org.logoColor} rounded-sm flex items-center justify-center text-white font-bold shrink-0 shadow-sm ring-1 ring-white`}>
        {org.name.substring(0, 1)}
      </div>
      {showName && (
        <span className={`${textClasses} font-medium text-docka-700 group-hover:text-docka-900 truncate max-w-[120px]`}>
            {org.name}
        </span>
      )}
    </div>
  );
};

export default OrgTag;