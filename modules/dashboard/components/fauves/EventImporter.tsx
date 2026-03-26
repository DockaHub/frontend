import React, { useState, useEffect } from 'react';
import { Search, Loader2, Save, Link as LinkIcon, Calendar, MapPin, User, Image as ImageIcon, X, CheckIcon } from 'lucide-react';
import { fauvesService } from '../../../../services/fauvesService';

const BRAZIL_UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
] as const;

const UF_CAPITALS: Record<string, string> = {
  AC: 'Rio Branco', AL: 'Maceió', AP: 'Macapá', AM: 'Manaus',
  BA: 'Salvador', CE: 'Fortaleza', DF: 'Brasília', ES: 'Vitória',
  GO: 'Goiânia', MA: 'São Luís', MT: 'Cuiabá', MS: 'Campo Grande',
  MG: 'Belo Horizonte', PA: 'Belém', PB: 'João Pessoa', PR: 'Curitiba',
  PE: 'Recife', PI: 'Teresina', RJ: 'Rio de Janeiro', RN: 'Natal',
  RS: 'Porto Alegre', RO: 'Porto Velho', RR: 'Boa Vista', SC: 'Florianópolis',
  SP: 'São Paulo', SE: 'Aracaju', TO: 'Palmas'
};

interface EventImporterProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const EventImporter: React.FC<EventImporterProps> = ({ onSuccess, onClose }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'url' | 'edit'>('url');
  
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    locationUf: '',
    locationCity: '',
    producer: '',
    image: '',
    externalUrl: ''
  });

  const [existingOrgs, setExistingOrgs] = useState<any[]>([]);

  useEffect(() => {
    if (step === 'edit') {
      fauvesService.getOrganizations(1, 100)
        .then(data => {
          if (data && data.items) setExistingOrgs(data.items);
        })
        .catch(() => {});
    }
  }, [step]);

  useEffect(() => {
    if (formData.locationUf && UF_CAPITALS[formData.locationUf] && !formData.locationCity) {
      setFormData(prev => ({ ...prev, locationCity: UF_CAPITALS[formData.locationUf] }));
    }
  }, [formData.locationUf]);

  const handleExtract = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const data = await fauvesService.importEventExtract(url);
      
      setFormData({
        name: data.title || '',
        date: data.date ? data.date.substring(0, 16) : '',
        location: data.location || data.locationAddress || '',
        locationUf: data.locationUf || 'CE',
        locationCity: data.locationCity || 'Fortaleza',
        producer: data.producer || '',
        image: data.image || '',
        externalUrl: url
      });
      setStep('edit');
    } catch (error) {
      setFormData({ ...formData, externalUrl: url, locationUf: 'CE', locationCity: 'Fortaleza' });
      setStep('edit');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.date || !formData.producer || !formData.locationUf) {
      alert('Preencha os campos obrigatórios (Nome, Data, Produtora e Estado)');
      return;
    }
    setSaving(true);
    try {
      await fauvesService.importEventSave(formData);
      if (onSuccess) onSuccess();
    } catch (error) {
      alert('Erro ao salvar evento');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-xl overflow-hidden max-w-2xl w-full mx-auto animate-in fade-in zoom-in duration-200">
      <div className="p-4 border-b border-docka-200 dark:border-zinc-800 flex items-center justify-between bg-docka-50 dark:bg-zinc-800/50">
        <h3 className="font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2 m-0 text-base">
          <LinkIcon className="w-5 h-5 text-amber-500" />
          Importador de Eventos
        </h3>
        {onClose && (
          <button onClick={onClose} className="text-docka-400 hover:text-docka-900 dark:hover:text-zinc-100 transition p-1 rounded-full hover:bg-docka-100 dark:hover:bg-zinc-700">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6">
        {step === 'url' ? (
          <div className="space-y-4">
            <p className="text-sm text-docka-500 dark:text-zinc-400 m-0">
              Cole o link de um evento externo (Sympla, Eventbrite, etc) para extrairmos as informações.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-docka-400" />
                <input
                  type="text"
                  placeholder="https://www.sympla.com.br/evento/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-9 pr-3 h-11 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-100 dark:focus:ring-zinc-600 outline-none transition text-sm text-docka-900 dark:text-zinc-100"
                />
              </div>
              <button
                onClick={handleExtract}
                disabled={loading || !url}
                className="px-6 h-11 bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-bold transition disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer hover:bg-docka-800 dark:hover:bg-white"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Buscar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-docka-400">Nome do Evento *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 h-10 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-100 dark:focus:ring-zinc-600 outline-none text-docka-900 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-docka-400">Data e Hora *</label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 h-10 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-100 dark:focus:ring-zinc-600 outline-none text-docka-900 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-docka-400">Produtora *</label>
                <div className="relative">
                  <input
                    type="text"
                    list="existing-orgs"
                    placeholder="Ex: Move Concerts"
                    value={formData.producer}
                    onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
                    className="w-full px-3 h-10 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-100 dark:focus:ring-zinc-600 outline-none text-docka-900 dark:text-zinc-100"
                  />
                  <datalist id="existing-orgs">
                    {existingOrgs.map(org => <option key={org.id} value={org.name} />)}
                  </datalist>
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-docka-400">Local / Endereço</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Arena Castelão ou Rua Exemplo, 123"
                  className="w-full px-3 h-10 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-100 dark:focus:ring-zinc-600 outline-none text-docka-900 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-docka-400">Estado (UF) *</label>
                <select
                  value={formData.locationUf}
                  onChange={(e) => setFormData({ ...formData, locationUf: e.target.value })}
                  className="w-full px-3 h-10 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-100 dark:focus:ring-zinc-600 outline-none text-docka-900 dark:text-zinc-100"
                >
                  {BRAZIL_UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-docka-400">Cidade *</label>
                <input
                  type="text"
                  value={formData.locationCity}
                  onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                  className="w-full px-3 h-10 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-100 dark:focus:ring-zinc-600 outline-none text-docka-900 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-docka-400">URL da Imagem (Banner)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-docka-400" />
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="w-full pl-9 pr-3 h-10 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-100 dark:focus:ring-zinc-600 outline-none text-docka-900 dark:text-zinc-100"
                  />
                </div>
                {formData.image && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-docka-200 dark:border-zinc-800 h-24 bg-docka-50 dark:bg-zinc-800 flex items-center justify-center">
                    <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex gap-2 border-t border-docka-100 dark:border-zinc-800 mt-2">
               <button
                onClick={() => setStep('url')}
                className="flex-1 px-4 h-11 bg-docka-50 dark:bg-zinc-800 text-docka-700 dark:text-zinc-300 rounded-lg font-bold transition hover:bg-docka-100 dark:hover:bg-zinc-700 cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-[2] px-6 h-11 bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-bold transition shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-docka-800 dark:hover:bg-white"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar Evento
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventImporter;
