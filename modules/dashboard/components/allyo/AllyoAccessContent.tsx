import type { LucideIcon } from 'lucide-react';
import {
    AppWindow,
    Bot,
    CheckCircle2,
    Cloud,
    Database,
    FileText,
    Film,
    KeyRound,
    LifeBuoy,
    LockKeyhole,
    Mail,
    MessageCircle,
    Palette,
    Presentation,
    ShieldCheck,
    Sparkles,
    UsersRound,
    Video,
    XCircle,
} from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';

type AccessKind = 'individual' | 'shared';
type AccessStatus = 'enabled' | 'request' | 'none';
type Tool = { name: string; purpose: string; description: string; access: AccessKind; icon: LucideIcon };
type ToolGroup = { title: string; icon: LucideIcon; tools: Tool[] };
type MatrixRow = { tool: string; leadership: AccessStatus; account: AccessStatus; creativeOps: AccessStatus; creators: AccessStatus; public: AccessStatus };

const toolGroups: ToolGroup[] = [
    {
        title: 'Comunicação & reuniões',
        icon: MessageCircle,
        tools: [
            { name: 'Slack', purpose: 'Comunicação interna e externa', description: 'Mensagens, gestão de grupos, threads e alinhamentos críticos do dia a dia.', access: 'individual', icon: MessageCircle },
            { name: 'WhatsApp Business', purpose: 'Comunicação com clientes', description: 'Mensagens rápidas, alinhamentos e atendimento nos canais autorizados.', access: 'individual', icon: MessageCircle },
            { name: 'Gmail', purpose: 'Comunicação formal', description: 'Organização das comunicações externas com clientes, parceiros e fornecedores.', access: 'individual', icon: Mail },
            { name: 'Google Meet', purpose: 'Reuniões online', description: 'Calls com clientes, rituais recorrentes e alinhamentos internos por vídeo.', access: 'individual', icon: Video },
            { name: 'Google Calendar', purpose: 'Organização de agenda', description: 'Reuniões, rituais, lembretes e compromissos recorrentes.', access: 'individual', icon: AppWindow },
            { name: 'MeetRox', purpose: 'Transcrição de reuniões', description: 'Atas e transcrições automáticas para consulta e registro posterior.', access: 'individual', icon: FileText },
        ],
    },
    {
        title: 'Gestão & dados',
        icon: Database,
        tools: [
            { name: 'ManySpace', purpose: 'Gestão de entregas e créditos', description: 'Tarefas, pautas, prazos, cadastros, avaliações e consumo de créditos.', access: 'individual', icon: AppWindow },
            { name: 'HubSpot', purpose: 'CRM e gestão de contas', description: 'Saúde da conta, reuniões, interações, riscos e oportunidades comerciais.', access: 'individual', icon: Database },
            { name: 'Metabase', purpose: 'Análise de dados', description: 'Dashboards de usabilidade, consumo, avaliações e indicadores operacionais.', access: 'individual', icon: Database },
            { name: 'Tako', purpose: 'Gestão de pessoas', description: 'Recrutamento, folha e rotinas de People Ops com apoio de automação.', access: 'individual', icon: UsersRound },
        ],
    },
    {
        title: 'Produtividade & documentos',
        icon: Cloud,
        tools: [
            { name: 'Google Drive', purpose: 'Arquivos e documentos', description: 'Materiais de apoio, apresentações, referências e backups organizados.', access: 'individual', icon: Cloud },
            { name: 'Google Docs', purpose: 'Documentação colaborativa', description: 'Briefings, atas, propostas, roteiros e documentação operacional.', access: 'individual', icon: FileText },
            { name: 'Google Slides', purpose: 'Apresentações', description: 'Decks comerciais, materiais para reuniões e apresentações de resultados.', access: 'individual', icon: Presentation },
            { name: 'Google Sheets', purpose: 'Planilhas e controles', description: 'Controles de pauta, fechamentos, acompanhamentos e análises operacionais.', access: 'individual', icon: AppWindow },
            { name: 'Office 365', purpose: 'Produtividade formal', description: 'Word, Excel, PowerPoint e documentos compatíveis com o ambiente do cliente.', access: 'shared', icon: AppWindow },
        ],
    },
    {
        title: 'Design & produção',
        icon: Palette,
        tools: [
            { name: 'Illustrator', purpose: 'Ilustração vetorial', description: 'Logos, ícones, grafismos e ilustrações vetoriais escaláveis.', access: 'individual', icon: Palette },
            { name: 'Photoshop', purpose: 'Edição de imagens', description: 'Tratamento, composição e manipulação avançada de imagens e fotos.', access: 'individual', icon: Palette },
            { name: 'InDesign', purpose: 'Editoração e diagramação', description: 'E-books, apresentações, manuais e materiais editoriais.', access: 'individual', icon: FileText },
            { name: 'Adobe Reader', purpose: 'Leitura e revisão de PDFs', description: 'Visualização, comentários e conferência de arquivos PDF.', access: 'individual', icon: FileText },
            { name: 'After Effects', purpose: 'Motion design', description: 'Animações, composições e efeitos visuais para conteúdos em movimento.', access: 'individual', icon: Film },
            { name: 'Premiere', purpose: 'Edição de vídeo', description: 'Edição profissional de vídeos, comerciais e materiais audiovisuais.', access: 'individual', icon: Film },
            { name: 'Media Encoder', purpose: 'Renderização e exportação', description: 'Compressão e exportação de vídeos em diferentes especificações.', access: 'individual', icon: Film },
            { name: 'Canva', purpose: 'Design ágil', description: 'Templates, peças rápidas e materiais editáveis quando previstos no escopo.', access: 'shared', icon: Palette },
            { name: 'Figma', purpose: 'Design colaborativo', description: 'Interfaces, landing pages, protótipos e colaboração visual.', access: 'shared', icon: AppWindow },
            { name: 'CapCut', purpose: 'Edição de vídeos curtos', description: 'Reels, cortes e conteúdos rápidos para redes sociais.', access: 'shared', icon: Film },
            { name: 'LottieFiles', purpose: 'Animações Lottie', description: 'Biblioteca e edição de animações leves para produtos digitais.', access: 'shared', icon: Sparkles },
            { name: 'OFFS Brasil', purpose: 'Acompanhamento de consumo', description: 'Controle de serviços contratados, locuções e consumo de produção.', access: 'shared', icon: Database },
        ],
    },
    {
        title: 'IA & geração de conteúdo',
        icon: Bot,
        tools: [
            { name: 'ChatGPT', purpose: 'Assistente de IA', description: 'Pesquisa, análise, brainstorm, copy e apoio à revisão criativa.', access: 'shared', icon: Bot },
            { name: 'ElevenLabs', purpose: 'Geração de voz', description: 'Síntese de voz e locuções com IA para conteúdos de áudio e vídeo.', access: 'shared', icon: MessageCircle },
            { name: 'HeyGen', purpose: 'Vídeos com avatares', description: 'Avatares, dublagem e variações rápidas de conteúdo audiovisual.', access: 'shared', icon: Video },
            { name: 'HappyScribe', purpose: 'Transcrição e legendagem', description: 'Transcrição, legendas e apoio a traduções de materiais audiovisuais.', access: 'shared', icon: FileText },
            { name: 'Lovart', purpose: 'Geração visual', description: 'Exploração de conceitos, imagens e composições com inteligência artificial.', access: 'shared', icon: Sparkles },
            { name: 'Magnific', purpose: 'Upscale de imagens', description: 'Aumento de resolução e refinamento de detalhes em imagens.', access: 'shared', icon: Sparkles },
            { name: 'Envato', purpose: 'Banco de assets', description: 'Templates, vídeos, áudios, fontes e imagens licenciadas para entregas.', access: 'shared', icon: Cloud },
        ],
    },
];

const matrix: MatrixRow[] = [
    { tool: 'ManySpace', leadership: 'enabled', account: 'enabled', creativeOps: 'enabled', creators: 'enabled', public: 'request' },
    { tool: 'Comunicação corporativa', leadership: 'enabled', account: 'enabled', creativeOps: 'enabled', creators: 'request', public: 'none' },
    { tool: 'Google Workspace', leadership: 'enabled', account: 'enabled', creativeOps: 'enabled', creators: 'enabled', public: 'none' },
    { tool: 'CRM e dados', leadership: 'enabled', account: 'enabled', creativeOps: 'request', creators: 'none', public: 'none' },
    { tool: 'Adobe Creative Cloud', leadership: 'request', account: 'none', creativeOps: 'enabled', creators: 'enabled', public: 'none' },
    { tool: 'Canva e Figma', leadership: 'request', account: 'request', creativeOps: 'enabled', creators: 'enabled', public: 'none' },
    { tool: 'IA e geração de conteúdo', leadership: 'enabled', account: 'request', creativeOps: 'enabled', creators: 'enabled', public: 'none' },
];

const principles = [
    ['Princípio 1', 'Acessos são corporativos e destinados exclusivamente ao trabalho.'],
    ['Princípio 2', 'Credenciais nunca devem ser compartilhadas fora dos canais oficiais.'],
    ['Princípio 3', 'Não crie contas paralelas para produção ou armazenamento oficial.'],
    ['Princípio 4', 'Bloqueios, incidentes ou acessos indevidos devem ser comunicados imediatamente.'],
];

export const AllyoAccessContent = () => (
    <div className="space-y-10">
        <section className={`rounded-[16px] border bg-gradient-to-br from-[#f2f5eb] via-white to-[#f7f7f3] p-6 dark:from-[#172018] dark:via-zinc-950 dark:to-zinc-900 sm:p-10 ${ALLYO_BORDER}`}>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#708346]"><KeyRound size={16} />Creative Ops · Ferramentas</span>
            <h2 className="mt-5 max-w-[980px] font-season text-[clamp(32px,4vw,48px)] leading-[1.08]">Acessos seguros para uma operação contínua.</h2>
            <p className="mt-5 max-w-[1050px] text-sm leading-7 text-[#626262] dark:text-zinc-400">A stack oficial reúne comunicação, gestão, produção, documentos e inteligência artificial. Use somente as ferramentas aprovadas e respeite o tipo de acesso indicado.</p>
            <div className="mt-8 grid gap-[10px] sm:grid-cols-2 xl:grid-cols-4">{principles.map(([title, text]) => <div key={title} className="rounded-[12px] border border-black/8 bg-white/80 p-4 dark:border-white/10 dark:bg-black/20"><span className="text-[9px] font-bold uppercase tracking-[.15em] text-[#829454]">{title}</span><p className="mt-2 text-xs leading-5 text-[#5f5f5f] dark:text-zinc-400">{text}</p></div>)}</div>
        </section>

        {toolGroups.map((group) => <ToolSection key={group.title} {...group} />)}

        <section>
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#eef3e4] text-[#708346] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><UsersRound size={17} /></span><div><h3 className="font-season text-[26px]">Acessos por função</h3><p className="mt-1 text-xs text-[#707070] dark:text-zinc-400">● liberado · ○ sob demanda · — não aplicável</p></div></div>
            <div className={`mt-5 overflow-x-auto rounded-[14px] border bg-white dark:bg-zinc-950 ${ALLYO_BORDER}`}>
                <table className="w-full min-w-[820px] border-collapse text-left text-xs">
                    <thead className="bg-[#f5f6f2] text-[9px] uppercase tracking-[.12em] text-[#777] dark:bg-zinc-900"><tr><th className="px-5 py-4">Ferramenta</th><th className="px-4 py-4 text-center">Liderança</th><th className="px-4 py-4 text-center">CAM / CAS</th><th className="px-4 py-4 text-center">CQS / AD</th><th className="px-4 py-4 text-center">Criativos</th><th className="px-4 py-4 text-center">Público</th></tr></thead>
                    <tbody>{matrix.map((row) => <tr key={row.tool} className="border-t border-black/8 dark:border-white/10"><td className="px-5 py-4 font-medium">{row.tool}</td><AccessCell status={row.leadership} /><AccessCell status={row.account} /><AccessCell status={row.creativeOps} /><AccessCell status={row.creators} /><AccessCell status={row.public} /></tr>)}</tbody>
                </table>
            </div>
        </section>

        <section className={`rounded-[16px] border bg-white p-6 dark:bg-zinc-950 sm:p-8 ${ALLYO_BORDER}`}>
            <div className="flex items-center gap-3"><ShieldCheck size={20} className="text-[#708346]" /><h3 className="font-season text-[26px]">Uso responsável</h3></div>
            <div className="mt-6 grid gap-[10px] lg:grid-cols-2">
                <PracticeCard title="O que fazer" positive items={['Utilizar somente plataformas aprovadas', 'Respeitar direitos de uso e confidencialidade', 'Solicitar acesso antes de iniciar uma entrega', 'Manter arquivos organizados e dentro do escopo']} />
                <PracticeCard title="O que evitar" items={['Subir materiais sensíveis sem orientação', 'Gerar conteúdo fora dos limites de uso', 'Criar contas paralelas ou usar credenciais pessoais', 'Compartilhar senhas em mensagens ou documentos']} />
            </div>
            <div className="mt-8 border-t border-black/8 pt-6 dark:border-white/10"><h4 className="text-sm font-semibold">Segurança e boas práticas</h4><ul className="mt-4 grid gap-3 text-xs leading-6 text-[#626262] dark:text-zinc-400 sm:grid-cols-2"><li>• Não altere e-mails, senhas ou autenticação de contas compartilhadas.</li><li>• Não conecte integrações externas sem autorização.</li><li>• Não armazene prompts ou materiais sensíveis em ambientes públicos.</li><li>• Finalize sessões e remova downloads de máquinas compartilhadas.</li><li>• Organize arquivos por cliente, tipo de entrega e data.</li><li>• Comunique incidentes assim que forem identificados.</li></ul></div>
        </section>

        <section className="rounded-[16px] border border-[#cbd8b0] bg-[#f3f6ed] p-6 dark:border-[#9db669]/30 dark:bg-[#172018] sm:p-8"><div className="flex items-center gap-3"><LifeBuoy size={20} className="text-[#708346]" /><h3 className="font-season text-[26px]">Problemas de acesso</h3></div><p className="mt-4 text-sm leading-7 text-[#606b55] dark:text-zinc-400">Em caso de código de verificação, erro de login, bloqueio, permissão insuficiente ou suspeita de incidente, acione a liderança responsável pelo canal interno. Nunca publique credenciais no Playbook ou em conversas abertas.</p></section>
    </div>
);

const ToolSection = ({ title, icon: Icon, tools }: ToolGroup) => <section><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#eef3e4] text-[#708346] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Icon size={17} /></span><h3 className="font-season text-[26px]">{title}</h3></div><div className="mt-5 grid gap-[10px] md:grid-cols-2 xl:grid-cols-3">{tools.map((tool) => <ToolCard key={tool.name} {...tool} />)}</div></section>;
const ToolCard = ({ name, purpose, description, access, icon: Icon }: Tool) => <article className={`rounded-[14px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#f1f3ed] text-[#708346] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Icon size={16} /></span><h4 className="text-sm font-semibold">{name}</h4></div><AccessBadge access={access} /></div><span className="mt-4 block text-[9px] font-bold uppercase tracking-[.14em] text-[#919191]">{purpose}</span><p className="mt-2 text-xs leading-5 text-[#626262] dark:text-zinc-400">{description}</p>{access === 'shared' && <p className="mt-3 flex items-center gap-1.5 text-[10px] text-[#7b884f]"><LockKeyhole size={12} />Credenciais no cofre corporativo</p>}</article>;
const AccessBadge = ({ access }: { access: AccessKind }) => <span className={access === 'individual' ? 'rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-[8px] font-bold uppercase tracking-[.08em] text-sky-600 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300' : 'rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[8px] font-bold uppercase tracking-[.08em] text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300'}>{access === 'individual' ? 'Individual' : 'Compartilhado'}</span>;
const AccessCell = ({ status }: { status: AccessStatus }) => <td className="px-4 py-4 text-center text-sm font-semibold"><span className={status === 'enabled' ? 'text-[#708346]' : status === 'request' ? 'text-[#9a7620]' : 'text-[#aaa]'} aria-label={status === 'enabled' ? 'Liberado' : status === 'request' ? 'Sob demanda' : 'Não aplicável'}>{status === 'enabled' ? '●' : status === 'request' ? '○' : '—'}</span></td>;
const PracticeCard = ({ title, positive = false, items }: { title: string; positive?: boolean; items: string[] }) => <div className="rounded-[12px] bg-[#f7f8f4] p-5 dark:bg-zinc-900"><h4 className="text-xs font-semibold">{title}</h4><ul className="mt-4 space-y-3">{items.map((item) => <li key={item} className="flex items-start gap-2 text-xs leading-5 text-[#626262] dark:text-zinc-400">{positive ? <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" /> : <XCircle size={15} className="mt-0.5 shrink-0 text-red-500" />}{item}</li>)}</ul></div>;

export default AllyoAccessContent;
