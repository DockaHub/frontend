
import React, { useState } from 'react';
import { Search, Filter, Plus, Home, MapPin, BedDouble, Bath, Square, MoreHorizontal, Image as ImageIcon } from 'lucide-react';
import Modal from '../../../../components/common/Modal';

const PROPERTIES = [
    { id: 'IMO-001', address: 'Av. Paulista, 1000 - Apt 42', type: 'Apartamento', area: '85m²', beds: 2, baths: 2, status: 'occupied', tenant: 'João Silva', owner: 'Maria Oliveira' },
    { id: 'IMO-002', address: 'Rua Oscar Freire, 500 - Casa 2', type: 'Casa de Vila', area: '120m²', beds: 3, baths: 3, status: 'vacant', tenant: '-', owner: 'Roberto K.' },
    { id: 'IMO-003', address: 'Al. Lorena, 80 - Studio 12', type: 'Studio', area: '35m²', beds: 1, baths: 1, status: 'occupied', tenant: 'Ana B.', owner: 'Investimentos LTDA' },
    { id: 'IMO-004', address: 'Rua Augusta, 1500 - Apt 901', type: 'Apartamento', area: '60m²', beds: 2, baths: 1, status: 'maintenance', tenant: '-', owner: 'Carlos D.' },
];

const UmaChavePropertiesView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="h-full bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar p-8 transition-colors">
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Carteira de Imóveis</h1>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gerencie as propriedades disponíveis para aluguel e venda.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-orange-600 dark:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-2"
                >
                    <Plus size={16} /> Novo Imóvel
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-t-xl p-4 flex justify-between items-center">
                <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
                    <input 
                        placeholder="Buscar por endereço, proprietário..." 
                        className="w-full pl-9 pr-4 py-2 bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-800 flex items-center gap-2">
                        <Filter size={14} /> Status
                    </button>
                    <button className="px-3 py-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-800 flex items-center gap-2">
                        <Home size={14} /> Tipo
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 border-t-0 rounded-b-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-semibold text-xs uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4">Imóvel</th>
                            <th className="px-6 py-4">Detalhes</th>
                            <th className="px-6 py-4">Proprietário</th>
                            <th className="px-6 py-4">Inquilino Atual</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                        {PROPERTIES.map((prop) => (
                            <tr key={prop.id} className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-docka-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-docka-400 dark:text-zinc-500 shrink-0">
                                            <ImageIcon size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-docka-900 dark:text-zinc-100">{prop.address}</div>
                                            <div className="text-[10px] text-docka-400 dark:text-zinc-500 font-mono">{prop.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3 text-docka-500 dark:text-zinc-500 text-xs">
                                        <span className="flex items-center gap-1"><Square size={12} /> {prop.area}</span>
                                        <span className="flex items-center gap-1"><BedDouble size={12} /> {prop.beds}</span>
                                        <span className="flex items-center gap-1"><Bath size={12} /> {prop.baths}</span>
                                    </div>
                                    <div className="text-xs font-medium text-docka-700 dark:text-zinc-400 mt-1">{prop.type}</div>
                                </td>
                                <td className="px-6 py-4 text-docka-600 dark:text-zinc-400">{prop.owner}</td>
                                <td className="px-6 py-4 text-docka-600 dark:text-zinc-400">{prop.tenant}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                        prop.status === 'occupied' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                                        prop.status === 'vacant' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800' :
                                        'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800'
                                    }`}>
                                        {prop.status === 'occupied' ? 'Alugado' : prop.status === 'vacant' ? 'Vago' : 'Manutenção'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 p-1.5 rounded hover:bg-docka-100 dark:hover:bg-zinc-800 transition-colors">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Create Modal */}
        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Cadastrar Novo Imóvel"
            size="lg"
            footer={
                <>
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg">Cancelar</button>
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm">Cadastrar</button>
                </>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Endereço Completo</label>
                    <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                        <input className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 focus:border-orange-400 dark:focus:border-orange-500 text-docka-900 dark:text-zinc-100" placeholder="Rua, Número, Complemento, Bairro" />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Tipo de Imóvel</label>
                        <select className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 text-docka-900 dark:text-zinc-100">
                            <option>Apartamento</option>
                            <option>Casa</option>
                            <option>Studio / Kitnet</option>
                            <option>Comercial</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Proprietário (Cliente)</label>
                        <select className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 text-docka-900 dark:text-zinc-100">
                            <option>Selecione da base...</option>
                            <option>Maria Oliveira</option>
                            <option>Roberto K.</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Área (m²)</label>
                        <input type="number" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 text-docka-900 dark:text-zinc-100" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Quartos</label>
                        <input type="number" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 text-docka-900 dark:text-zinc-100" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Banheiros</label>
                        <input type="number" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 text-docka-900 dark:text-zinc-100" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Status Inicial</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm text-docka-600 dark:text-zinc-400">
                            <input type="radio" name="status" className="accent-orange-600 dark:accent-orange-500" defaultChecked /> Vago (Disponível)
                        </label>
                        <label className="flex items-center gap-2 text-sm text-docka-600 dark:text-zinc-400">
                            <input type="radio" name="status" className="accent-orange-600 dark:accent-orange-500" /> Ocupado (Já alugado)
                        </label>
                    </div>
                </div>
            </div>
        </Modal>
    </div>
  );
};

export default UmaChavePropertiesView;
