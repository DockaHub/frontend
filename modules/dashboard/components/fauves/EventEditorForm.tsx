import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  Globe2,
  Image as ImageIcon,
  Info,
  Loader2,
  MapPinned,
  Palette,
  Plus,
  Search,
  Settings2,
  TicketCheck,
  Users,
} from "lucide-react";
import { fauvesService } from "../../../../services/fauvesService";

type EditorTab =
  | "content"
  | "schedule"
  | "publishing"
  | "style"
  | "registration"
  | "lineup";

type EventFormState = {
  name: string;
  subtitle: string;
  description: string;
  image: string;
  startDate: string;
  endDate: string;
  timezone: string;
  location: string;
  locationName: string;
  locationAddress: string;
  locationCity: string;
  locationUf: string;
  locationLatitude: string;
  locationLongitude: string;
  onlineUrl: string;
  categoryId: string;
  organizationId: string;
  status: string;
  isPublished: boolean;
  privacy: string;
  type: string;
  priceFrom: string;
  isExternal: boolean;
  externalUrl: string;
  themeId: string;
  customColor: string;
  customFont: string;
  customStyle: string;
  customDisplay: string;
  showGuestsList: boolean;
  restrictLocation: boolean;
  requireApproval: boolean;
  capacity: string;
  waitingListEnabled: boolean;
  acceptingRegistrations: boolean;
  registrationType: string;
  allowGroupRegistration: boolean;
  registrationFormJson: string;
  lineup: any[];
};

const INPUT =
  "w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-colors";
const LABEL =
  "block text-[11px] font-bold text-docka-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5";

const UF_TIMEZONES: Record<string, string> = {
  AC: "America/Rio_Branco",
  AM: "America/Manaus",
  RO: "America/Porto_Velho",
  RR: "America/Boa_Vista",
  MT: "America/Cuiaba",
  MS: "America/Campo_Grande",
  PA: "America/Belem",
  AP: "America/Belem",
  TO: "America/Araguaina",
  MA: "America/Fortaleza",
  PI: "America/Fortaleza",
  CE: "America/Fortaleza",
  RN: "America/Fortaleza",
  PB: "America/Fortaleza",
  PE: "America/Recife",
  AL: "America/Maceio",
  SE: "America/Maceio",
  BA: "America/Bahia",
};

const STATE_UF: Record<string, string> = {
  acre: "AC",
  alagoas: "AL",
  amapa: "AP",
  amazonas: "AM",
  bahia: "BA",
  ceara: "CE",
  "distrito federal": "DF",
  "espirito santo": "ES",
  goias: "GO",
  maranhao: "MA",
  "mato grosso": "MT",
  "mato grosso do sul": "MS",
  "minas gerais": "MG",
  para: "PA",
  paraiba: "PB",
  parana: "PR",
  pernambuco: "PE",
  piaui: "PI",
  "rio de janeiro": "RJ",
  "rio grande do norte": "RN",
  "rio grande do sul": "RS",
  rondonia: "RO",
  roraima: "RR",
  "santa catarina": "SC",
  "sao paulo": "SP",
  sergipe: "SE",
  tocantins: "TO",
};

const TIMEZONES = [
  "America/Sao_Paulo",
  "America/Fortaleza",
  "America/Recife",
  "America/Bahia",
  "America/Maceio",
  "America/Belem",
  "America/Araguaina",
  "America/Cuiaba",
  "America/Campo_Grande",
  "America/Manaus",
  "America/Porto_Velho",
  "America/Boa_Vista",
  "America/Rio_Branco",
];

const parseObject = (value: unknown): Record<string, any> => {
  if (value && typeof value === "object" && !Array.isArray(value))
    return value as Record<string, any>;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  }
  return {};
};

const toLocalDateTime = (value: unknown, timezone: string) => {
  if (!value) return "";
  const raw = String(value);
  if (!/[zZ]$|[+-]\d{2}:?\d{2}$/.test(raw)) return raw.substring(0, 16);
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const read = (type: string) =>
    parts.find((part) => part.type === type)?.value || "";
  return `${read("year")}-${read("month")}-${read("day")}T${read("hour")}:${read("minute")}`;
};

const normalizeStatus = (status: unknown, published: boolean) => {
  const value = String(status || "").toLowerCase();
  if (
    published ||
    ["published", "publicado", "active", "ativo"].includes(value)
  )
    return "Publicado";
  if (["ended", "encerrado"].includes(value)) return "Encerrado";
  if (["cancelled", "canceled", "cancelado"].includes(value))
    return "Cancelado";
  return "Rascunho";
};

const normalizeUf = (value: unknown) => {
  const raw = String(value || "")
    .replace(/^BR-/i, "")
    .trim();
  if (/^[a-z]{2}$/i.test(raw)) return raw.toUpperCase();
  const normalized = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return STATE_UF[normalized] || "";
};

const initialLocationType = (event: any) => {
  const known = ["Local", "Evento online", "Local será anunciado em breve"];
  if (known.includes(event?.location)) return event.location;
  if (event?.onlineUrl) return "Evento online";
  return "Local";
};

const SectionIntro = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-3 mb-5">
    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-docka-900 dark:text-zinc-100">{title}</h3>
      <p className="text-xs text-docka-500 dark:text-zinc-500 mt-0.5">
        {description}
      </p>
    </div>
  </div>
);

const Toggle = ({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) => (
  <label className="flex items-center justify-between gap-4 p-3 rounded-lg border border-docka-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer">
    <span>
      <span className="block text-sm font-semibold text-docka-800 dark:text-zinc-200">
        {label}
      </span>
      {description && (
        <span className="block text-[11px] text-docka-500 dark:text-zinc-500 mt-0.5">
          {description}
        </span>
      )}
    </span>
    <span
      className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${checked ? "bg-indigo-600" : "bg-docka-200 dark:bg-zinc-700"}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`}
      />
    </span>
  </label>
);

const RichTextField = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value)
      editorRef.current.innerHTML = value || "";
  }, []);
  return (
    <div>
      <label className={LABEL}>Descrição</label>
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={(event) => onChange(event.currentTarget.innerHTML)}
          onBlur={(event) => onChange(event.currentTarget.innerHTML)}
          className={`${INPUT} min-h-[190px] overflow-y-auto prose prose-sm dark:prose-invert max-w-none`}
        />
        {!value && (
          <span className="absolute top-3 left-3 text-sm text-docka-400 pointer-events-none">
            Conte a história do evento...
          </span>
        )}
      </div>
    </div>
  );
};

export const EventEditorForm: React.FC<{
  initialData?: any;
  onCancel: () => void;
  onSuccess: () => void;
  categories: any[];
  organizations: any[];
}> = ({ initialData, onCancel, onSuccess, categories, organizations }) => {
  const registration = useMemo(
    () => parseObject(initialData?.registrationForm),
    [initialData],
  );
  const timezone =
    initialData?.timezone ||
    registration.timezone ||
    UF_TIMEZONES[String(initialData?.locationUf || "").toUpperCase()] ||
    "America/Sao_Paulo";
  const sourceLocation = initialLocationType(initialData);
  const [activeTab, setActiveTab] = useState<EditorTab>("content");
  const [form, setForm] = useState<EventFormState>({
    name: initialData?.name || initialData?.title || "",
    subtitle: initialData?.subtitle || "",
    description: initialData?.description || "",
    image: initialData?.image || "",
    startDate: toLocalDateTime(initialData?.startDate, timezone),
    endDate: toLocalDateTime(initialData?.endDate, timezone),
    timezone,
    location: sourceLocation,
    locationName: initialData?.locationName || "",
    locationAddress:
      initialData?.locationAddress ||
      (sourceLocation === "Local" &&
      !["Local", "Evento online", "Local será anunciado em breve"].includes(
        initialData?.location,
      )
        ? initialData?.location || ""
        : ""),
    locationCity: initialData?.locationCity || "",
    locationUf: initialData?.locationUf || "",
    locationLatitude: initialData?.locationLatitude?.toString() || "",
    locationLongitude: initialData?.locationLongitude?.toString() || "",
    onlineUrl: initialData?.onlineUrl || "",
    categoryId: initialData?.categoryId || "",
    organizationId:
      initialData?.organizationId || initialData?.organization?.id || "",
    status: normalizeStatus(
      initialData?.status,
      Boolean(initialData?.isPublished),
    ),
    isPublished: Boolean(
      initialData?.isPublished ||
      ["published", "Publicado", "active"].includes(initialData?.status),
    ),
    privacy: initialData?.privacy || "public",
    type: initialData?.type || "",
    priceFrom: initialData?.priceFrom?.toString() || "",
    isExternal: Boolean(
      initialData?.isExternal ||
      initialData?.externalUrl ||
      initialData?.externalLink,
    ),
    externalUrl: initialData?.externalUrl || initialData?.externalLink || "",
    themeId: initialData?.themeId || "minimal",
    customColor: initialData?.customColor || "#6d28d9",
    customFont: initialData?.customFont || "",
    customStyle: initialData?.customStyle || "",
    customDisplay: initialData?.customDisplay || "",
    showGuestsList: Boolean(initialData?.showGuestsList),
    restrictLocation: Boolean(initialData?.restrictLocation),
    requireApproval: Boolean(
      initialData?.requireApproval ?? registration.requireApproval,
    ),
    capacity: String(initialData?.capacity ?? registration.capacity ?? ""),
    waitingListEnabled: Boolean(
      initialData?.waitingListEnabled ?? registration.waitingListEnabled,
    ),
    acceptingRegistrations:
      initialData?.acceptingRegistrations ??
      registration.acceptingRegistrations ??
      true,
    registrationType:
      initialData?.registrationType || registration.registrationType || "",
    allowGroupRegistration:
      initialData?.allowGroupRegistration ??
      registration.allowGroupRegistration ??
      true,
    registrationFormJson: JSON.stringify(registration, null, 2),
    lineup:
      initialData?.artists?.map((item: any) => item.artist) ||
      initialData?.lineup ||
      [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const selectedAddress = useRef("");
  const [artistSearch, setArtistSearch] = useState("");
  const [artistSuggestions, setArtistSuggestions] = useState<any[]>([]);
  const [isSearchingArtists, setIsSearchingArtists] = useState(false);

  const set = <K extends keyof EventFormState>(
    key: K,
    value: EventFormState[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (
      form.location !== "Local" ||
      form.locationAddress.trim().length < 3 ||
      form.locationAddress === selectedAddress.current
    ) {
      setSuggestions([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      setIsSearchingAddress(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.locationAddress)}&addressdetails=1&namedetails=1&limit=5&countrycodes=br`,
        );
        const data = await response.json();
        setSuggestions(Array.isArray(data) ? data : []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 650);
    return () => window.clearTimeout(timer);
  }, [form.location, form.locationAddress]);

  useEffect(() => {
    if (artistSearch.trim().length < 2) {
      setArtistSuggestions([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      setIsSearchingArtists(true);
      try {
        setArtistSuggestions(
          await fauvesService.searchArtists(artistSearch.trim()),
        );
      } catch {
        setArtistSuggestions([]);
      } finally {
        setIsSearchingArtists(false);
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [artistSearch]);

  const chooseAddress = (suggestion: any) => {
    const address = suggestion.address || {};
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      "";
    const uf = normalizeUf(
      address.state_code || address["ISO3166-2-lvl4"] || address.state,
    );
    const nextAddress = suggestion.display_name || "";
    selectedAddress.current = nextAddress;
    setForm((current) => ({
      ...current,
      locationName:
        suggestion.namedetails?.name ||
        suggestion.name ||
        nextAddress.split(",")[0] ||
        "",
      locationAddress: nextAddress,
      locationCity: city,
      locationUf: uf,
      locationLatitude: suggestion.lat || "",
      locationLongitude: suggestion.lon || "",
      timezone: UF_TIMEZONES[uf] || "America/Sao_Paulo",
    }));
    setShowSuggestions(false);
  };

  const addArtist = (artist: any) => {
    if (
      !form.lineup.some(
        (item) =>
          (item.spotifyId || item.id) === (artist.spotifyId || artist.id),
      )
    ) {
      set("lineup", [...form.lineup, artist]);
    }
    setArtistSearch("");
    setArtistSuggestions([]);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.startDate) {
      setActiveTab("content");
      alert("Preencha o nome e a data de início do evento.");
      return;
    }
    if (
      form.location === "Local" &&
      (!form.locationAddress || !form.locationCity || !form.locationUf)
    ) {
      setActiveTab("schedule");
      alert("Selecione um endereço válido para preencher cidade e estado.");
      return;
    }
    if (form.isExternal && !form.externalUrl) {
      setActiveTab("publishing");
      alert("Informe o link da bilheteria externa.");
      return;
    }

    let registrationForm: Record<string, any> = {};
    try {
      registrationForm = form.registrationFormJson.trim()
        ? JSON.parse(form.registrationFormJson)
        : {};
    } catch {
      setActiveTab("registration");
      alert("A configuração avançada do formulário não é um JSON válido.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...form,
        organizationId: form.organizationId || null,
        categoryId: form.categoryId || null,
        locationLatitude: form.locationLatitude
          ? Number(form.locationLatitude)
          : null,
        locationLongitude: form.locationLongitude
          ? Number(form.locationLongitude)
          : null,
        priceFrom: form.priceFrom === "" ? null : Number(form.priceFrom),
        capacity: form.capacity === "" ? 0 : Number(form.capacity),
        externalUrl: form.isExternal ? form.externalUrl : null,
        isExternal: form.isExternal,
        registrationForm,
      };
      delete (payload as any).registrationFormJson;
      if (initialData?.id)
        await fauvesService.updateEvent(initialData.id, payload);
      else await fauvesService.createEvent(payload);
      onSuccess();
    } catch (error: any) {
      console.error("Error saving Fauves event:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Erro ao salvar evento.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const tabs: Array<{ id: EditorTab; label: string; icon: React.ReactNode }> = [
    { id: "content", label: "Conteúdo", icon: <Info size={15} /> },
    { id: "schedule", label: "Data e local", icon: <MapPinned size={15} /> },
    { id: "publishing", label: "Publicação", icon: <Globe2 size={15} /> },
    { id: "style", label: "Estilo", icon: <Palette size={15} /> },
    {
      id: "registration",
      label: "Inscrições",
      icon: <TicketCheck size={15} />,
    },
    { id: "lineup", label: "Lineup", icon: <Users size={15} /> },
  ];

  return (
    <div className="relative -m-2 sm:-m-3">
      <div className="grid grid-cols-1 lg:grid-cols-[190px_minmax(0,1fr)] min-h-[610px] max-h-[74vh]">
        <nav className="border-b lg:border-b-0 lg:border-r border-docka-100 dark:border-zinc-800 p-2 lg:pr-4 flex lg:flex-col gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === tab.id ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300" : "text-docka-500 hover:bg-docka-50 dark:text-zinc-500 dark:hover:bg-zinc-800"}`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <Check size={13} className="ml-auto hidden lg:block" />
              )}
            </button>
          ))}
        </nav>

        <div className="overflow-y-auto px-2 sm:px-5 lg:px-7 pb-24">
          {activeTab === "content" && (
            <section>
              <SectionIntro
                icon={<Info size={18} />}
                title="Conteúdo do evento"
                description="Capa, título e informações que aparecem na página pública."
              />
              <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-6">
                <div>
                  <label className={LABEL}>Capa do evento</label>
                  <div className="aspect-square rounded-xl overflow-hidden border border-docka-200 dark:border-zinc-700 bg-docka-50 dark:bg-zinc-800">
                    {form.image ? (
                      <img
                        key={form.image}
                        src={form.image}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                        className="w-full h-full object-cover"
                        alt="Prévia quadrada da capa"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-docka-400 dark:text-zinc-500">
                        <ImageIcon size={36} />
                        <span className="text-xs">Sem imagem</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="url"
                    value={form.image}
                    onChange={(event) => set("image", event.target.value)}
                    className={`${INPUT} mt-3`}
                    placeholder="https://.../capa.jpg"
                  />
                  <p className="text-[11px] text-docka-400 mt-2">
                    A prévia usa corte quadrado, como na dashboard.
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={LABEL}>Nome do evento *</label>
                    <input
                      value={form.name}
                      onChange={(event) => set("name", event.target.value)}
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Subtítulo</label>
                    <input
                      value={form.subtitle}
                      onChange={(event) => set("subtitle", event.target.value)}
                      className={INPUT}
                      placeholder="Uma frase curta para apresentar o evento"
                    />
                  </div>
                  <RichTextField
                    value={form.description}
                    onChange={(value) => set("description", value)}
                  />
                </div>
              </div>
            </section>
          )}

          {activeTab === "schedule" && (
            <section>
              <SectionIntro
                icon={<Clock3 size={18} />}
                title="Data, horário e localização"
                description="O horário é salvo no fuso escolhido e o endereço preenche cidade, UF e coordenadas."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Início *</label>
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(event) => set("startDate", event.target.value)}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className={LABEL}>Término</label>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(event) => set("endDate", event.target.value)}
                    className={INPUT}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={LABEL}>Fuso horário</label>
                  <select
                    value={form.timezone}
                    onChange={(event) => set("timezone", event.target.value)}
                    className={INPUT}
                  >
                    {TIMEZONES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={LABEL}>Formato do evento</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      "Local",
                      "Evento online",
                      "Local será anunciado em breve",
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => set("location", item)}
                        className={`px-3 py-2.5 rounded-lg border text-xs font-semibold ${form.location === item ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300" : "border-docka-200 dark:border-zinc-700 text-docka-600 dark:text-zinc-400"}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                {form.location === "Local" && (
                  <>
                    <div>
                      <label className={LABEL}>Nome do local</label>
                      <input
                        value={form.locationName}
                        onChange={(event) =>
                          set("locationName", event.target.value)
                        }
                        className={INPUT}
                        placeholder="Ex.: Teatro Arthur Azevedo"
                      />
                    </div>
                    <div className="relative">
                      <label className={LABEL}>
                        Buscar endereço *{" "}
                        {isSearchingAddress && (
                          <Loader2 size={11} className="inline animate-spin" />
                        )}
                      </label>
                      <input
                        value={form.locationAddress}
                        onChange={(event) => {
                          selectedAddress.current = "";
                          set("locationAddress", event.target.value);
                        }}
                        onFocus={() =>
                          suggestions.length > 0 && setShowSuggestions(true)
                        }
                        className={INPUT}
                        placeholder="Rua, número, bairro e cidade"
                      />
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl">
                          {suggestions.map((item, index) => (
                            <button
                              type="button"
                              key={`${item.place_id}-${index}`}
                              onClick={() => chooseAddress(item)}
                              className="w-full text-left px-3 py-2.5 text-xs text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 border-b border-docka-100 dark:border-zinc-800 last:border-0"
                            >
                              {item.display_name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className={LABEL}>Cidade *</label>
                      <input
                        value={form.locationCity}
                        onChange={(event) =>
                          set("locationCity", event.target.value)
                        }
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>UF *</label>
                      <input
                        value={form.locationUf}
                        onChange={(event) => {
                          const uf = event.target.value
                            .toUpperCase()
                            .slice(0, 2);
                          setForm((current) => ({
                            ...current,
                            locationUf: uf,
                            timezone: UF_TIMEZONES[uf] || current.timezone,
                          }));
                        }}
                        className={INPUT}
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={form.locationLatitude}
                        onChange={(event) =>
                          set("locationLatitude", event.target.value)
                        }
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={form.locationLongitude}
                        onChange={(event) =>
                          set("locationLongitude", event.target.value)
                        }
                        className={INPUT}
                      />
                    </div>
                  </>
                )}
                {form.location === "Evento online" && (
                  <div className="md:col-span-2">
                    <label className={LABEL}>Link do evento online</label>
                    <input
                      type="url"
                      value={form.onlineUrl}
                      onChange={(event) => set("onlineUrl", event.target.value)}
                      className={INPUT}
                      placeholder="https://..."
                    />
                  </div>
                )}
                {form.location === "Local será anunciado em breve" && (
                  <>
                    <div>
                      <label className={LABEL}>Cidade</label>
                      <input
                        value={form.locationCity}
                        onChange={(event) =>
                          set("locationCity", event.target.value)
                        }
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>UF</label>
                      <input
                        value={form.locationUf}
                        onChange={(event) => {
                          const uf = event.target.value
                            .toUpperCase()
                            .slice(0, 2);
                          setForm((current) => ({
                            ...current,
                            locationUf: uf,
                            timezone: UF_TIMEZONES[uf] || current.timezone,
                          }));
                        }}
                        className={INPUT}
                        maxLength={2}
                      />
                    </div>
                  </>
                )}
                <div className="md:col-span-2">
                  <Toggle
                    checked={form.restrictLocation}
                    onChange={(value) => set("restrictLocation", value)}
                    label="Restringir a exibição do endereço"
                    description="Útil quando o endereço só deve aparecer para pessoas inscritas."
                  />
                </div>
              </div>
            </section>
          )}

          {activeTab === "publishing" && (
            <section>
              <SectionIntro
                icon={<Globe2 size={18} />}
                title="Publicação e classificação"
                description="Controle onde o evento aparece e como o público acessa os ingressos."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Categoria</label>
                  <select
                    value={form.categoryId}
                    onChange={(event) => set("categoryId", event.target.value)}
                    className={INPUT}
                  >
                    <option value="">Sem categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name || category.col1}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Organização / produtora</label>
                  <select
                    value={form.organizationId}
                    onChange={(event) =>
                      set("organizationId", event.target.value)
                    }
                    className={INPUT}
                  >
                    <option value="">Curadoria Fauves (sem organização)</option>
                    {[...organizations]
                      .sort((a, b) =>
                        String(a.name).localeCompare(String(b.name)),
                      )
                      .map((organization) => (
                        <option key={organization.id} value={organization.id}>
                          {organization.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Status</label>
                  <select
                    value={form.status}
                    onChange={(event) => {
                      const status = event.target.value;
                      setForm((current) => ({
                        ...current,
                        status,
                        isPublished: status === "Publicado",
                      }));
                    }}
                    className={INPUT}
                  >
                    {["Rascunho", "Publicado", "Encerrado", "Cancelado"].map(
                      (status) => (
                        <option key={status}>{status}</option>
                      ),
                    )}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Privacidade</label>
                  <select
                    value={form.privacy}
                    onChange={(event) => set("privacy", event.target.value)}
                    className={INPUT}
                  >
                    <option value="public">Público</option>
                    <option value="private">Privado</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Tipo interno</label>
                  <input
                    value={form.type}
                    onChange={(event) => set("type", event.target.value)}
                    className={INPUT}
                    placeholder="Ex.: show, festival, conferência"
                  />
                </div>
                <div>
                  <label className={LABEL}>Preço a partir de (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.priceFrom}
                    onChange={(event) => set("priceFrom", event.target.value)}
                    className={INPUT}
                  />
                </div>
                <div className="md:col-span-2">
                  <Toggle
                    checked={form.isPublished}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        isPublished: value,
                        status: value ? "Publicado" : "Rascunho",
                      }))
                    }
                    label="Evento publicado"
                    description="Quando ativo, o evento pode aparecer no site Fauves conforme a privacidade."
                  />
                </div>
                <div className="md:col-span-2">
                  <Toggle
                    checked={form.isExternal}
                    onChange={(value) => set("isExternal", value)}
                    label="Bilheteria externa"
                    description="Direciona o público para Sympla, Ingresse, Shotgun ou outro parceiro."
                  />
                </div>
                {form.isExternal && (
                  <div className="md:col-span-2">
                    <label className={LABEL}>
                      Link da bilheteria externa *
                    </label>
                    <input
                      type="url"
                      value={form.externalUrl}
                      onChange={(event) =>
                        set("externalUrl", event.target.value)
                      }
                      className={INPUT}
                      placeholder="https://..."
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === "style" && (
            <section>
              <SectionIntro
                icon={<Palette size={18} />}
                title="Estilo da página"
                description="As mesmas opções visuais armazenadas no evento da Fauves."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Tema</label>
                  <select
                    value={form.themeId}
                    onChange={(event) => set("themeId", event.target.value)}
                    className={INPUT}
                  >
                    {[
                      "minimal",
                      "quantum",
                      "warp",
                      "emoji",
                      "confetti",
                      "pattern",
                    ].map((theme) => (
                      <option key={theme} value={theme}>
                        {theme}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Cor principal</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={
                        /^#[0-9a-f]{6}$/i.test(form.customColor)
                          ? form.customColor
                          : "#6d28d9"
                      }
                      onChange={(event) =>
                        set("customColor", event.target.value)
                      }
                      className="w-12 h-11 rounded-lg border border-docka-200 dark:border-zinc-700 bg-white p-1"
                    />
                    <input
                      value={form.customColor}
                      onChange={(event) =>
                        set("customColor", event.target.value)
                      }
                      className={INPUT}
                      placeholder="#6d28d9"
                    />
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Fonte personalizada</label>
                  <input
                    value={form.customFont}
                    onChange={(event) => set("customFont", event.target.value)}
                    className={INPUT}
                    placeholder="Ex.: Inter, Space Grotesk"
                  />
                </div>
                <div>
                  <label className={LABEL}>Modo de exibição</label>
                  <input
                    value={form.customDisplay}
                    onChange={(event) =>
                      set("customDisplay", event.target.value)
                    }
                    className={INPUT}
                    placeholder="Configuração de exibição"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={LABEL}>Estilo personalizado</label>
                  <textarea
                    value={form.customStyle}
                    onChange={(event) => set("customStyle", event.target.value)}
                    className={`${INPUT} min-h-32 font-mono text-xs`}
                    placeholder="Configuração visual personalizada do evento"
                  />
                </div>
              </div>
            </section>
          )}

          {activeTab === "registration" && (
            <section>
              <SectionIntro
                icon={<TicketCheck size={18} />}
                title="Inscrições e convidados"
                description="Defina aprovação, limite, lista de espera e comportamento das inscrições."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Toggle
                  checked={form.acceptingRegistrations}
                  onChange={(value) => set("acceptingRegistrations", value)}
                  label="Aceitar inscrições"
                />
                <Toggle
                  checked={form.requireApproval}
                  onChange={(value) => set("requireApproval", value)}
                  label="Exigir aprovação"
                />
                <Toggle
                  checked={form.waitingListEnabled}
                  onChange={(value) => set("waitingListEnabled", value)}
                  label="Ativar lista de espera"
                />
                <Toggle
                  checked={form.allowGroupRegistration}
                  onChange={(value) => set("allowGroupRegistration", value)}
                  label="Permitir inscrição em grupo"
                />
                <Toggle
                  checked={form.showGuestsList}
                  onChange={(value) => set("showGuestsList", value)}
                  label="Mostrar lista de convidados"
                />
                <div>
                  <label className={LABEL}>Capacidade</label>
                  <input
                    type="number"
                    min="0"
                    value={form.capacity}
                    onChange={(event) => set("capacity", event.target.value)}
                    className={INPUT}
                    placeholder="0 = sem limite"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={LABEL}>Tipo de inscrição</label>
                  <input
                    value={form.registrationType}
                    onChange={(event) =>
                      set("registrationType", event.target.value)
                    }
                    className={INPUT}
                    placeholder="Ex.: ticket, RSVP"
                  />
                </div>
                <details className="md:col-span-2 rounded-lg border border-docka-200 dark:border-zinc-800 p-4">
                  <summary className="text-sm font-semibold text-docka-700 dark:text-zinc-300 cursor-pointer flex items-center gap-2">
                    <Settings2 size={15} /> Formulário avançado (JSON)
                  </summary>
                  <p className="text-[11px] text-docka-500 mt-2">
                    Campos personalizados existentes são preservados. Edite aqui
                    somente quando precisar controlar a configuração completa.
                  </p>
                  <textarea
                    value={form.registrationFormJson}
                    onChange={(event) =>
                      set("registrationFormJson", event.target.value)
                    }
                    className={`${INPUT} min-h-52 mt-3 font-mono text-xs`}
                    spellCheck={false}
                  />
                </details>
              </div>
            </section>
          )}

          {activeTab === "lineup" && (
            <section>
              <SectionIntro
                icon={<Users size={18} />}
                title="Lineup e artistas"
                description="Busque no Spotify e organize quem participa do evento."
              />
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-3.5 text-docka-400"
                />
                <input
                  value={artistSearch}
                  onChange={(event) => setArtistSearch(event.target.value)}
                  className={`${INPUT} pl-9`}
                  placeholder="Buscar artista no Spotify..."
                />
                {isSearchingArtists && (
                  <Loader2
                    size={15}
                    className="absolute right-3 top-3.5 animate-spin text-docka-400"
                  />
                )}
                {artistSuggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl">
                    {artistSuggestions.map((artist) => (
                      <button
                        type="button"
                        key={artist.id}
                        onClick={() => addArtist(artist)}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-docka-50 dark:hover:bg-zinc-800 border-b border-docka-100 dark:border-zinc-800 last:border-0"
                      >
                        <div className="w-9 h-9 rounded-full bg-docka-100 dark:bg-zinc-800 overflow-hidden">
                          {artist.imageUrl && (
                            <img
                              src={artist.imageUrl}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-docka-900 dark:text-zinc-100">
                            {artist.name}
                          </p>
                          <p className="text-[10px] text-docka-500">
                            {artist.genres?.slice(0, 2).join(", ")}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-5 space-y-2">
                {form.lineup.map((artist, index) => (
                  <div
                    key={artist.spotifyId || artist.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-docka-200 dark:border-zinc-800"
                  >
                    <span className="text-xs font-bold text-docka-400 w-5">
                      {index + 1}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-docka-100 dark:bg-zinc-800 overflow-hidden">
                      {artist.imageUrl && (
                        <img
                          src={artist.imageUrl}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      )}
                    </div>
                    <span className="flex-1 text-sm font-semibold text-docka-800 dark:text-zinc-200">
                      {artist.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "lineup",
                          form.lineup.filter(
                            (item) =>
                              (item.spotifyId || item.id) !==
                              (artist.spotifyId || artist.id),
                          ),
                        )
                      }
                      className="p-1.5 text-docka-400 hover:text-red-500"
                    >
                      <Plus size={17} className="rotate-45" />
                    </button>
                  </div>
                ))}
                {form.lineup.length === 0 && (
                  <div className="py-12 text-center text-sm text-docka-400">
                    Nenhum artista adicionado.
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="absolute left-0 right-0 bottom-0 px-6 py-4 border-t border-docka-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur flex items-center justify-between rounded-b-xl">
        <span className="hidden sm:flex items-center gap-2 text-xs text-docka-400">
          <CalendarDays size={14} /> Todos os campos são salvos diretamente na
          Fauves
        </span>
        <div className="flex gap-2 ml-auto">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-docka-600 dark:text-zinc-400"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-lg bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-bold flex items-center gap-2 disabled:opacity-60"
          >
            {isSaving && <Loader2 size={15} className="animate-spin" />}
            {initialData?.id ? "Salvar alterações" : "Criar evento"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventEditorForm;
