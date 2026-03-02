import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  icon: LucideIcon;
  description: string;
}

const PlaceholderView: React.FC<PlaceholderProps> = ({ title, icon: Icon, description }) => {
  return (
    <div className="flex-1 h-screen bg-docka-50 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-docka-200 flex items-center justify-center mb-6">
        <Icon size={32} className="text-docka-400" />
      </div>
      <h2 className="text-2xl font-bold text-docka-900 mb-2">{title}</h2>
      <p className="text-docka-500 max-w-md mb-8">{description}</p>
      <button className="px-5 py-2.5 bg-docka-900 text-white rounded-lg font-medium hover:bg-docka-800 transition-colors shadow-sm">
        Solicitar Acesso
      </button>
      <p className="mt-8 text-xs text-docka-400 uppercase tracking-widest font-semibold">Em Breve Q4 2025</p>
    </div>
  );
};

export default PlaceholderView;