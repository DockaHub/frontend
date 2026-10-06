import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    Banknote,
    BriefcaseBusiness,
    CalendarClock,
    CheckCircle2,
    ClipboardCheck,
    CopyCheck,
    FileCheck2,
    FolderArchive,
    Gauge,
    HardDriveUpload,
    Layers3,
    ListChecks,
    MessageSquareText,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Target,
    UsersRound,
    Workflow,
} from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';

type Feature = { title: string; text: string; icon: LucideIcon; items?: string[] };
type Template = { title: string; objective: string; message: string };

const costSteps = [
    'Selecionar o período que será fechado no ManySpace.',
    'Consultar os créditos aprovados de cada profissional criativo.',
    'Abrir a planilha oficial de fechamento e localizar o mês correto.',
    'Inserir os créditos aprovados e validar o cálculo automático.',
    'Conferir se regras individuais de remuneração foram preservadas.',
    'Registrar bonificações e ajustes autorizados com a justificativa.',
    'Disponibilizar a planilha para conferência do Financeiro.',
];

const portfolioFeatures: Feature[] = [
    { title: 'Capacidade do Diretor de Arte', text: 'Priorize quem possui menor ocupação planejada e capacidade disponível.', icon: Gauge, items: ['Tamanho da carteira atual', 'Volume de créditos ativos', 'Movimentações futuras', 'Bloqueios ou indisponibilidades'] },
    { title: 'Perfil estratégico da conta', text: 'A senioridade e o contexto da carteira precisam acompanhar a complexidade do cliente.', icon: Target, items: ['Complexidade e potencial de retenção', 'Potencial de expansão', 'MRR e plano contratado', 'Necessidade de direção criativa'] },
    { title: 'Equilíbrio da carteira do CAM', text: 'A distribuição considera mais do que a quantidade absoluta de clientes.', icon: BriefcaseBusiness, items: ['Clientes ativos', 'Créditos e MRR por carteira', 'Mix de planos', 'Clientes em aviso prévio'] },
    { title: 'Restrições operacionais', text: 'Impedimentos devem ser verificados antes de qualquer movimentação.', icon: AlertTriangle, items: ['Sobrecarga ou indisponibilidade', 'Bloqueio temporário', 'Avaliação de performance', 'Orientação específica da liderança'] },
];

const deliveryExceptions: Feature[] = [
    { title: 'HTML para landing page ou e-mail', text: 'A entrega ocorre em arquivo fechado compactado, com HTML, CSS, imagens e scripts necessários.', icon: FolderArchive, items: ['Subir o ZIP no slot de arquivo fechado', 'Não há entrega de editável', 'Preencher o slot obrigatório com um placeholder quando necessário'] },
    { title: 'Montagem na plataforma do cliente', text: 'Quando a execução acontece diretamente no ambiente do cliente, os registros visuais comprovam a conclusão.', icon: HardDriveUpload, items: ['Arquivo fechado: print da página ou e-mail finalizado', 'Arquivo editável: o mesmo print ou registro visual', 'Validar acesso e conclusão antes de liberar'] },
    { title: 'Apresentações', text: 'A entrega final deve respeitar a ferramenta e o formato alinhados no briefing.', icon: Layers3, items: ['Fechado: PDF ou PPS', 'Editável em PowerPoint: PPT', 'Google Slides: link com permissão de cópia e PPT exportado com o link'] },
    { title: 'Entregas com Figma', text: 'O cliente recebe os arquivos exportados e uma forma segura de duplicar o material editável.', icon: CopyCheck, items: ['Fechado: JPG, PNG ou PDF', 'Editável: documento com o link do Figma', 'Link configurado exclusivamente com permissão de cópia'] },
];

const queueFeatures: Feature[] = [
    { title: 'Leitura estratégica do briefing', text: 'Antes de iniciar, confirme objetivo, público, canal, formatos, textos finais, assets, referências, diretrizes e histórico.', icon: ClipboardCheck },
    { title: 'Identificação de riscos', text: 'Briefing incompleto, ausência de assets, prazo incompatível, dependências e direcionamentos contraditórios devem ser tratados antes da produção.', icon: AlertTriangle },
    { title: 'Reaproveitamento inteligente', text: 'Consulte campanhas, peças aprovadas, Brand Kit e estruturas validadas para acelerar a execução com consistência.', icon: RefreshCw },
    { title: 'Priorização por impacto', text: 'Considere prazo, valor estratégico, risco de retrabalho, dependências, complexidade, boosters e lançamentos.', icon: Target },
    { title: 'Checkpoints de qualidade', text: 'KV, campanhas, materiais institucionais e demandas sensíveis pedem validações antes das etapas mais caras.', icon: ShieldCheck },
    { title: 'Gestão de versionamento', text: 'Agrupe feedbacks, valide a direção e diferencie ajuste de mudança real de escopo.', icon: Layers3 },
    { title: 'Proteção da capacidade', text: 'Revise a pauta semanalmente, antecipe gargalos, reorganize prioridades e comunique riscos cedo.', icon: Gauge },
    { title: 'Aprendizado contínuo', text: 'Erros, gargalos, refações e feedbacks recorrentes devem virar atualização de processo e conhecimento compartilhado.', icon: Sparkles },
];

const communicationTemplates: Template[] = [
    { title: 'Incentivo à usabilidade', objective: 'Criar oportunidades relevantes para o ciclo.', message: 'Olá, [nome]! Percebemos que ainda há espaço para aproveitar melhor os recursos deste ciclo. Posso sugerir algumas ideias conectadas ao calendário e aos objetivos da marca?' },
    { title: 'Follow-up de pendência', objective: 'Destravar uma demanda com cordialidade.', message: 'Oi, [nome]! Passando para reforçar o alinhamento sobre a demanda [ID]. Você consegue nos confirmar o status para avançarmos?' },
    { title: 'Materiais pendentes', objective: 'Solicitar insumos sem perder contexto.', message: 'Para iniciarmos a demanda, precisamos dos materiais de marca indicados no briefing. Você pode enviá-los pelo repositório do ManySpace?' },
    { title: 'Avaliação negativa', objective: 'Entender a insatisfação e iniciar a recuperação.', message: 'Recebemos seu feedback sobre a tarefa [ID]. Pode compartilhar mais detalhes para investigarmos a causa e alinharmos as próximas entregas?' },
    { title: 'Tarefa sem avaliação', objective: 'Estimular feedback estruturado.', message: 'A tarefa [ID] foi aprovada, mas ainda não recebeu avaliação. Sua nota nos ajuda a entender a satisfação e identificar melhorias.' },
    { title: 'Melhoria de briefing', objective: 'Construir um processo mais claro em conjunto.', message: 'Gostaríamos de revisar os briefings recentes para entender como tornar a organização mais eficiente e reduzir dúvidas durante a produção.' },
    { title: 'Validação antes da produção', objective: 'Evitar ajustes causados por conteúdo provisório.', message: 'Sobre a tarefa [ID], podemos seguir com o conteúdo atual do briefing ou ainda haverá ajustes de texto e imagem antes de iniciarmos?' },
    { title: 'Confirmação de escopo', objective: 'Alinhar peças, slots e impacto em créditos.', message: 'A solicitação prevê [quantidade] peças, mas encontramos [quantidade] slots. Podemos ajustar o escopo e os créditos para seguir corretamente?' },
    { title: 'Solicitação de editáveis', objective: 'Viabilizar redimensionamento ou desdobramento.', message: 'Para manter fidelidade ao material original, precisamos dos arquivos editáveis da peça-base. Você pode adicioná-los ao repositório da tarefa?' },
    { title: 'Prazo após o horário', objective: 'Explicar o início da contagem do SLA.', message: 'Como a tarefa foi enviada após as 16h, o prazo começa a contar às 9h do próximo dia útil, conforme nossa política operacional.' },
];

export const AllyoCreativeCostContent = () => (
    <Page>
        <Hero icon={Banknote} title="Gestão de custo criativo" description="Consolida créditos aprovados, pagamentos, ajustes e bonificações para sustentar a conferência financeira e o acompanhamento da margem da operação." />
        <div className="grid gap-[10px] md:grid-cols-3">
            <Metric title="Fechamento oficial" value="Mensal" text="No primeiro dia útil, referente ao mês anterior." />
            <Metric title="Acompanhamento" value="Semanal" text="Atualização parcial para antecipar desvios." />
            <Metric title="Bonificação" value="Trimestral" text="Fechamentos de março, junho, setembro e dezembro." />
        </div>
        <Section title="Fechamento mensal" icon={CalendarClock} description="A Gestão de Ganhos do ManySpace é a fonte oficial para validação de créditos."><NumberedList items={costSteps} /></Section>
        <div className="grid gap-[10px] lg:grid-cols-2">
            <Section title="Acompanhamento semanal" icon={Gauge}><BulletList items={['Identificar inconsistências antes do fechamento', 'Monitorar desvios de custo', 'Antecipar comportamentos fora do padrão', 'Acompanhar a evolução da margem criativa']} /></Section>
            <Section title="Bonificação trimestral" icon={Sparkles}><NumberedList items={['Calcular conforme a regra vigente', 'Inserir na coluna correta da planilha', 'Conferir o total da nota fiscal', 'Comunicar individualmente os profissionais impactados', 'Garantir visibilidade ao Financeiro']} /></Section>
        </div>
        <Section title="Notas fiscais e divergências" icon={FileCheck2} description="Quando houver diferença entre nota, planilha e plataforma, prevalece o valor registrado na Gestão de Ganhos."><BulletList items={['Encerramento de contrato', 'Créditos aprovados e pendentes em desligamentos', 'Transferência de tarefas para Diretor de Arte', 'Compensações previamente acordadas', 'Promessas específicas de pagamento', 'Falhas operacionais documentadas']} /><Rule>Todo ajuste manual deve registrar o motivo e permanecer rastreável.</Rule></Section>
        <Section title="Margem de custo criativo" icon={Target}><BulletList items={['Custo criativo total', 'Custo por crédito', 'Percentual do custo sobre a base ativa/MRR', 'Evolução mensal do custo criativo']} /><Rule>A referência histórica é manter o custo próximo ou abaixo de 30% da base ativa, sempre considerando o contexto estratégico.</Rule></Section>
        <Callout title="Cuidados importantes" text="Não altere fórmulas, use sempre a fonte oficial, registre exceções, mantenha a planilha atualizada e garanta que o Financeiro consulte a versão mais recente." />
    </Page>
);

export const AllyoPortfolioManagementContent = () => (
    <Page>
        <Hero icon={BriefcaseBusiness} title="Gestão de carteiras" description="Distribui novas contas de forma equilibrada entre Diretores de Arte e CAMs, considerando capacidade, senioridade, perfil, volume de créditos e potencial de retenção." />
        <section className="grid gap-[10px] lg:grid-cols-2">{portfolioFeatures.map((feature) => <FeatureCard key={feature.title} {...feature} />)}</section>
        <div className="grid gap-[10px] lg:grid-cols-2">
            <Section title="Definição do Diretor de Arte" icon={UsersRound}><NumberedList items={['Abrir a visão de carteiras dos Diretores de Arte', 'Identificar profissionais abaixo da capacidade ideal', 'Verificar restrições operacionais', 'Avaliar o perfil do cliente', 'Definir o responsável', 'Registrar a movimentação no fluxo interno']} /></Section>
            <Section title="Definição do CAM" icon={Target}><NumberedList items={['Abrir os relatórios de distribuição', 'Avaliar clientes ativos, créditos, MRR e mix por carteira', 'Identificar o perfil da nova conta', 'Priorizar senioridade para contas estratégicas', 'Definir o responsável e atualizar o ownership']} /></Section>
        </div>
        <Section title="Atualização de responsáveis" icon={Workflow} description="Depois da decisão, atualize imediatamente o responsável pela parceria e os campos de ownership aplicáveis no sistema oficial."><BulletList items={['Validar a atribuição', 'Comunicar os envolvidos', 'Registrar data e contexto da movimentação', 'Garantir continuidade durante a transição']} /></Section>
        <Section title="Cobertura de férias" icon={ShieldCheck} description="Na ausência da liderança responsável, os processos críticos precisam de substituto designado."><BulletList items={['Fechamento e acompanhamento do custo criativo', 'Bonificações e divergências', 'Análise de capacidade de ADs e CAMs', 'Distribuição de novas contas', 'Atualização de ownership e comunicação interna']} /></Section>
        <Callout title="Regra de equilíbrio" text="Não considere apenas a quantidade de clientes. Cruze créditos, MRR, complexidade, senioridade, restrições e movimentos previstos para proteger a experiência do cliente e a saúde do time." />
    </Page>
);

export const AllyoFileDeliveryContent = () => (
    <Page>
        <Hero icon={FileCheck2} title="Entrega de arquivos" description="Padroniza a liberação das tarefas no ManySpace para garantir consistência, segurança dos originais e clareza para o cliente." />
        <div className="grid gap-[10px] lg:grid-cols-2">
            <Section title="Arquivo fechado" icon={FileCheck2} description="Versão final pronta para uso, conforme o briefing."><BulletList items={['JPG ou PNG', 'PDF', 'MP4', 'GIF', 'ZIP nos casos técnicos']} /></Section>
            <Section title="Arquivo editável" icon={Layers3} description="Versão que permite adaptação futura, quando prevista no item contratado."><BulletList items={['Arquivo-fonte ou formato editável acordado', 'Link seguro quando aplicável', 'Instruções mínimas para reutilização', 'Nomenclatura clara e padronizada']} /></Section>
        </div>
        <Section title="Entregas por link" icon={CopyCheck} description="Links de Google Slides, Canva e Figma devem ser compartilhados exclusivamente com permissão de cópia."><Rule>Nunca compartilhe o arquivo original com permissão de edição direta.</Rule><BulletList items={['Testar o link sem solicitar acesso', 'Confirmar a permissão de cópia', 'Subir também um arquivo no slot correspondente', 'Preservar o original e a autonomia do cliente']} /></Section>
        <section className="grid gap-[10px] lg:grid-cols-2">{deliveryExceptions.map((feature) => <FeatureCard key={feature.title} {...feature} />)}</section>
        <Callout title="Checklist obrigatório" text="Preencha todos os slots exigidos, valide links e permissões, confirme exportações, use nomes de arquivo claros e só finalize a tarefa quando o pacote estiver completo." />
    </Page>
);

export const AllyoQueueManagementContent = () => (
    <Page>
        <Hero icon={ListChecks} title="Gestão de pauta" description="Organiza prioridades, direção criativa, capacidade e riscos ao longo de todo o fluxo para equilibrar qualidade, prazo, volume e experiência do cliente." />
        <Section title="Objetivos da gestão de pauta" icon={Target}><BulletList items={['Garantir qualidade e consistência', 'Reduzir retrabalho e versionamento excessivo', 'Melhorar a previsibilidade operacional', 'Priorizar corretamente', 'Antecipar riscos e gargalos', 'Equilibrar capacidade, prazo e impacto']} /></Section>
        <section className="grid gap-[10px] lg:grid-cols-2">{queueFeatures.map((feature) => <FeatureCard key={feature.title} {...feature} />)}</section>
        <Section title="Validação final" icon={ClipboardCheck} description="Nenhuma entrega deve ser aprovada apenas por aparência visual."><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><MiniCheck title="Briefing" items={['Objetivo atendido', 'Solicitações contempladas']} /><MiniCheck title="Marca" items={['Identidade respeitada', 'Tom de voz correto']} /><MiniCheck title="Qualidade" items={['Sem erros técnicos', 'Consistência visual e textual']} /><MiniCheck title="Arquivos" items={['Formatos e nomes corretos', 'Exportações e slots completos']} /></div></Section>
        <Callout title="Princípios da pauta" text="Antecipe antes que vire urgência, priorize com inteligência, valide o que é estratégico, reduza retrabalho, proteja a experiência do cliente e transforme aprendizados em melhoria contínua." />
    </Page>
);

export const AllyoClientCommunicationContent = () => (
    <Page>
        <Hero icon={MessageSquareText} title="Comunicação com cliente" description="Define canais, postura, respostas e modelos que tornam a relação mais clara, consultiva, integrada e rastreável." />
        <div className="grid gap-[10px] lg:grid-cols-2">
            <Section title="Canais de contato" icon={MessageSquareText}><BulletList items={['Slack, WhatsApp e e-mail: trocas rápidas, alinhamentos e rotina', 'ManySpace: briefing, insumos, feedbacks e pedidos de alteração', 'Sistema de relacionamento: histórico, decisões e próximos passos']} /><Rule>Materiais e decisões estruturais precisam permanecer no canal oficial da tarefa.</Rule></Section>
            <Section title="Boas práticas diárias" icon={ShieldCheck}><BulletList items={['Responder dentro do SLA acordado', 'Começar com o ID e o link público da tarefa', 'Usar tom cordial, objetivo e consultivo', 'Centralizar feedbacks e insumos no ManySpace', 'Registrar decisões e responsáveis']} /></Section>
        </div>
        <Section title="Uma única equipe diante do cliente" icon={UsersRound} description="CAM, CAS, CQS, ADs, criativos, produto e tecnologia formam uma operação integrada."><BulletList items={['Troque “eles” ou “depende do outro time” por “nós”, “vamos” e “nosso time”', 'Apresente limitações como características do produto, acompanhadas de alternativa', 'Não exponha senioridade dos criativos como justificativa', 'Posicione o Diretor de Arte como valor estratégico, não como correção operacional']} /></Section>
        <Section title="Dúvidas frequentes" icon={ClipboardCheck}><Faq question="Como funcionam os créditos?" answer="Cada tarefa consome créditos conforme o item contratado, sua unidade de cobrança e quantidade solicitada." /><Faq question="Quando o SLA começa?" answer="Quando a tarefa está disponível para execução. Pedidos após 16h iniciam às 9h do próximo dia útil; pendências do cliente pausam a contagem." /><Faq question="O que é redimensionamento?" answer="Adaptação de peça aprovada para outro formato ou dimensão, mantendo composição e estrutura-base." /><Faq question="Posso cancelar sem consumo?" answer="Sim, enquanto a tarefa ainda não tiver sido iniciada operacionalmente. Depois disso, o caso precisa ser avaliado." /><Faq question="Como garantir um bom briefing?" answer="Informe objetivo, contexto, público, canal, formato, textos finais, identidade, referências e todos os assets obrigatórios." /><Faq question="Como funcionam projetos de vídeo?" answer="Roteiro, storyboard, locução e animação podem formar uma sequência de etapas; cada etapa deve ser aprovada antes da dependente." /></Section>
        <Section title="Gestão de crise" icon={AlertTriangle} description="Postura, empatia e estratégia preservam confiança em momentos críticos."><BulletList items={['Investigar a causa raiz de versionamentos recorrentes', 'Registrar insatisfação e escalar com contexto completo', 'Pausar tarefas sem insumos ou briefing suficiente', 'Pedir justificativa clara em reprovações', 'Validar divergências entre briefing e entrega com CQS ou AD', 'Responder ruídos com cordialidade e envolver o CAM quando houver risco']} /></Section>
        <Section title="Modelos de mensagens" icon={MessageSquareText}><div className="grid gap-[10px] lg:grid-cols-2">{communicationTemplates.map((template) => <TemplateCard key={template.title} {...template} />)}</div></Section>
        <Callout title="Resultado esperado" text="Toda mensagem deve aumentar clareza, reduzir atrito e conduzir a uma ação. Antes de enviar, revise se o texto posiciona a Allyo como uma equipe única, responsável e orientada a soluções." />
    </Page>
);

const Page = ({ children }: { children: ReactNode }) => <div className="space-y-10">{children}</div>;
const Hero = ({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) => <section className={`rounded-[16px] border bg-gradient-to-br from-[#f2f5eb] via-white to-[#f7f7f3] p-6 dark:from-[#172018] dark:via-zinc-950 dark:to-zinc-900 sm:p-10 ${ALLYO_BORDER}`}><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#708346]"><Icon size={16} />Creative Ops · Processos</span><h2 className="mt-5 max-w-[980px] font-season text-[clamp(32px,4vw,48px)] leading-[1.08]">{title}</h2><p className="mt-5 max-w-[980px] text-sm leading-7 text-[#626262] dark:text-zinc-400">{description}</p></section>;
const Metric = ({ title, value, text }: { title: string; value: string; text: string }) => <article className={`rounded-[14px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className="text-[10px] font-bold uppercase tracking-[.12em] text-[#829454]">{title}</span><strong className="mt-3 block font-season text-[28px] font-normal">{value}</strong><p className="mt-2 text-xs leading-5 text-[#666] dark:text-zinc-400">{text}</p></article>;
const Section = ({ title, icon: Icon, description, children }: { title: string; icon: LucideIcon; description?: string; children: ReactNode }) => <section className={`rounded-[14px] border bg-white p-6 dark:bg-zinc-950 sm:p-8 ${ALLYO_BORDER}`}><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[#eef3e4] text-[#708346] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Icon size={17} /></span><h3 className="font-season text-[24px]">{title}</h3></div>{description && <p className="mt-4 max-w-[1000px] text-xs leading-6 text-[#666] dark:text-zinc-400">{description}</p>}<div className="mt-5">{children}</div></section>;
const FeatureCard = ({ title, text, icon: Icon, items }: Feature) => <article className={`rounded-[14px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[#eef3e4] text-[#708346] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Icon size={17} /></span><h3 className="font-season text-xl">{title}</h3></div><p className="mt-4 text-xs leading-6 text-[#666] dark:text-zinc-400">{text}</p>{items && <BulletList items={items} />}</article>;
const BulletList = ({ items }: { items: string[] }) => <ul className="space-y-2.5">{items.map((item) => <li key={item} className="flex items-start gap-2.5 text-xs leading-6 text-[#626262] dark:text-zinc-400"><CheckCircle2 size={15} className="mt-1 shrink-0 text-[#8aa05b]" />{item}</li>)}</ul>;
const NumberedList = ({ items }: { items: string[] }) => <ol className="space-y-3">{items.map((item, index) => <li key={item} className="flex items-start gap-3 text-xs leading-6 text-[#626262] dark:text-zinc-400"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eef3e4] text-[10px] font-bold text-[#708346] dark:bg-[#9db669]/10 dark:text-[#d0f08e]">{index + 1}</span>{item}</li>)}</ol>;
const Rule = ({ children }: { children: ReactNode }) => <p className="mt-5 rounded-[10px] border-l-2 border-[#9db669] bg-[#f4f7ee] px-4 py-3 text-xs leading-6 text-[#5f6b4c] dark:bg-[#172018] dark:text-zinc-300"><strong>Regra:</strong> {children}</p>;
const MiniCheck = ({ title, items }: { title: string; items: string[] }) => <div><strong className="text-xs">{title}</strong><BulletList items={items} /></div>;
const Faq = ({ question, answer }: { question: string; answer: string }) => <div className="border-b border-black/8 py-4 last:border-0 dark:border-white/10"><h4 className="text-xs font-semibold">{question}</h4><p className="mt-2 text-xs leading-6 text-[#666] dark:text-zinc-400">{answer}</p></div>;
const TemplateCard = ({ title, objective, message }: Template) => <article className="rounded-[12px] bg-[#f7f8f4] p-5 dark:bg-zinc-900"><span className="text-[9px] font-bold uppercase tracking-[.12em] text-[#829454]">{objective}</span><h4 className="mt-2 font-season text-lg">{title}</h4><p className="mt-3 border-l-2 border-[#9db669] pl-4 text-xs italic leading-6 text-[#626262] dark:text-zinc-400">“{message}”</p></article>;
const Callout = ({ title, text }: { title: string; text: string }) => <section className="rounded-[16px] border border-[#cbd8b0] bg-[#f3f6ed] p-6 dark:border-[#9db669]/30 dark:bg-[#172018] sm:p-8"><h2 className="font-season text-[28px]">{title}</h2><p className="mt-3 max-w-[1050px] text-sm leading-7 text-[#606b55] dark:text-zinc-400">{text}</p></section>;

export default AllyoCreativeCostContent;
