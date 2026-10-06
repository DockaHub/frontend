import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    AudioLines,
    Bot,
    BrainCircuit,
    Captions,
    CheckCircle2,
    ChevronDown,
    CircleAlert,
    Clapperboard,
    ExternalLink,
    FileText,
    Gauge,
    Image,
    Images,
    Lightbulb,
    Maximize2,
    MessageSquareText,
    MonitorPlay,
    PlayCircle,
    Presentation,
    RefreshCw,
    ScanSearch,
    ShieldCheck,
    Sparkles,
    Target,
    UsersRound,
    Video,
    WandSparkles,
    XCircle,
} from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';

type Tone = 'blue' | 'violet' | 'mint' | 'orange' | 'rose';
type AiItem = {
    title: string;
    icon: LucideIcon;
    tone: Tone;
    summary: string;
    ideal: string[];
    required: string[];
    optional?: string[];
    tools: string[];
    flow: string[];
    curation: string[];
    promptGoal?: string;
    promptTemplate?: string;
    steps: string[];
    links?: { label: string; href: string }[];
};

const itemNames = ['Locução via IA', 'Legendagem via IA', 'Geração de vídeo via IA', 'Animação de imagem via IA', 'Geração de imagem via IA', 'Redimensionamento via IA', 'Avatar via IA', 'Mascote via IA'];

const valuePoints = [
    'Acelerar etapas de produção',
    'Reduzir dependências complexas',
    'Ampliar possibilidades criativas',
    'Gerar assets para campanhas',
    'Aumentar eficiência operacional',
    'Viabilizar prazos e orçamentos reduzidos',
];

const catalog: AiItem[] = [
    {
        title: 'Locução via IA', icon: AudioLines, tone: 'blue',
        summary: 'Transforma roteiros aprovados em narrações sintéticas com diferentes tons, ritmos e estilos.',
        ideal: ['Vídeos institucionais curtos', 'Treinamentos e tutoriais', 'Conteúdos educativos', 'Chamadas promocionais'],
        required: ['Texto final ou autorização para criação', 'Idioma', 'Tom desejado', 'Pronúncia de nomes e termos técnicos'],
        optional: ['Referência de voz', 'Ritmo desejado'],
        tools: ['Envato ⭐', 'HeyGen'],
        flow: ['Gerar a voz a partir do roteiro', 'Testar entonação, ritmo e velocidade', 'Integrar a locução ao vídeo', 'Aplicar trilhas ou efeitos quando necessário'],
        curation: ['Revisar o roteiro', 'Ajustar pronúncias sensíveis', 'Garantir naturalidade, clareza e aderência ao tom da marca'],
        promptGoal: 'Combinar o texto narrado limpo com uma direção objetiva de voz: contexto, tom, ritmo, energia, pausas, dicção, ênfases, pronúncias e restrições.',
        promptTemplate: 'Contexto: [tipo de conteúdo e objetivo]. Direção: tom [x], ritmo [x], energia [x], pausas [x], dicção [x]. Ênfases: [palavras]. Pronúncia: [termos]. Evitar: [restrições]. Texto narrado: [texto final limpo].',
        steps: ['Separe somente o texto que será narrado', 'Abra o Voice Gen no Envato', 'Escolha a voz', 'Adicione roteiro e direção ao prompt', 'Gere e ajuste primeiro ritmo/pausas, depois tom/energia e por fim pronúncia/ênfase'],
        links: [{ label: 'Passo a passo', href: 'https://www.loom.com/share/9be918181888441a9c7c3172290c0cc3' }, { label: 'Exemplos', href: 'https://drive.google.com/drive/folders/1hKIF_LemmTCgxpLSh0OPTm-1r-f1VWLy?usp=sharing' }],
    },
    {
        title: 'Legendagem via IA', icon: Captions, tone: 'mint',
        summary: 'Automatiza transcrição e sincronização de legendas, com revisão humana para precisão, legibilidade e clareza.',
        ideal: ['Redes sociais', 'Vídeos institucionais', 'Materiais educativos', 'Conteúdos acessíveis e multilíngues'],
        required: ['Vídeo final', 'Idioma da legenda', 'Duração do vídeo'],
        optional: ['Estilo mais formal ou leve', 'Palavras-chave a destacar'],
        tools: ['Happy Scribe'],
        flow: ['Transcrever o áudio', 'Aplicar legendas inicialmente', 'Ajustar visual e sincronização', 'Exportar e integrar ao vídeo final'],
        curation: ['Revisar ortografia, gramática e pontuação', 'Ajustar entrada e saída', 'Garantir conforto de leitura', 'Adaptar o visual à marca'],
        steps: ['Separe o vídeo final', 'Crie a legenda no Happy Scribe', 'Defina idioma e estilo', 'Revise e corrija', 'Exporte o vídeo legendado'],
        links: [{ label: 'Passo a passo', href: 'https://www.loom.com/share/ce13a1a9fed74c66accb13e875b1e31a' }, { label: 'Exemplos', href: 'https://drive.google.com/drive/folders/1RC3P0G3taLZnZPbFIdc99cpCwl5Wui6J?usp=sharing' }],
    },
    {
        title: 'Geração de vídeo via IA', icon: Video, tone: 'violet',
        summary: 'Cria cenas, takes e sequências a partir de prompts, imagens ou referências, combinando geração artificial com edição humana.',
        ideal: ['Cenas de apoio e teasers', 'Redes sociais', 'Vinhetas e loops', 'Conteúdos institucionais simples'],
        required: ['Objetivo', 'Duração', 'Ação ou narrativa principal', 'Canal de veiculação'],
        optional: ['Estilo visual', 'Ritmo', 'Referências visuais ou de movimento'],
        tools: ['Loveart ⭐', 'Envato', 'Freepik'],
        flow: ['Gerar vídeos ou cenas-base', 'Complementar com assets visuais e sonoros', 'Editar ritmo, cortes e fluidez', 'Exportar no formato final'],
        curation: ['Definir narrativa e estrutura', 'Garantir coerência entre cenas', 'Ajustar timing e ritmo', 'Validar canal, formato e objetivo'],
        promptGoal: 'Controlar início, meio e fim, movimento, coerência, estilo, luz, cores, ângulo, câmera e proporção, criando uma base sólida para edição.',
        promptTemplate: 'Contexto: vídeo curto para [canal]. Descrição: [ação principal]. Estilo: [realista/cinematográfico/animado]. Iluminação: [atmosfera]. Cores: [paleta]. Composição: [ângulo e câmera]. Formato: [proporção]. Evitar: textos automáticos, distorções e movimentos excessivos.',
        steps: ['Traduza o briefing em prompt', 'Abra a ferramenta escolhida', 'Configure proporção e detalhes', 'Gere as cenas', 'Revise coerência e prepare para edição'],
        links: [{ label: 'Passo a passo', href: 'https://www.loom.com/share/918f1c15df974a12a359ae47ddaf7ec5' }, { label: 'Exemplos', href: 'https://drive.google.com/drive/folders/1PqRl0yUuvHndamk9WzeeZIFYDJcxYpX2?usp=sharing' }],
    },
    {
        title: 'Animação de imagem via IA', icon: PlayCircle, tone: 'orange',
        summary: 'Adiciona movimento a imagens estáticas para criar vídeos curtos, loops suaves e animações simples.',
        ideal: ['Posts animados', 'Stories, reels e banners', 'Campanhas promocionais', 'Conteúdos efêmeros'],
        required: ['Peça estática final aprovada', 'Objetivo da animação', 'Duração'],
        tools: ['Loveart ⭐', 'Adobe Firefly', 'Envato', 'Freepik', 'Canva'],
        flow: ['Aplicar movimento à imagem', 'Criar loop simples', 'Ajustar timing e fluidez', 'Exportar no formato final'],
        curation: ['Definir o que deve se mover', 'Controlar intensidade e velocidade', 'Preservar textos e logos', 'Manter identidade visual'],
        promptGoal: 'Adicionar movimento sutil e elegante sem comprometer layout, legibilidade, enquadramento, paleta ou identidade.',
        promptTemplate: 'Contexto: animação leve para [canal]. Descrição: [elementos que se movem]. Estilo: clean e fluido. Manter iluminação, cores e enquadramento. Formato: [proporção]. Evitar: movimentos bruscos e distorções em texto ou logo.',
        steps: ['Crie o prompt', 'Abra a ferramenta', 'Faça upload da peça', 'Configure duração e movimento', 'Revise loop, legibilidade e fluidez'],
        links: [{ label: 'Passo a passo', href: 'https://www.loom.com/share/8da50104650f49d989eb2f9af49e8f1b' }, { label: 'Tarefa de exemplo', href: 'https://platform.fstr.co/task-redirect/58901' }, { label: 'Exemplos', href: 'https://drive.google.com/drive/folders/1q2iIlHozLnmC7gUJc3HWqSbdlusdbvPK?usp=sharing' }],
    },
    {
        title: 'Geração de imagem via IA', icon: Image, tone: 'blue',
        summary: 'Cria imagens, cenários, composições e conceitos visuais com direção de briefing, referências e curadoria criativa.',
        ideal: ['Key Visuals e conceitos', 'Moodboards e ambientações', 'Fundos, mockups e ilustrações', 'Base para animação'],
        required: ['Objetivo', 'Elemento principal', 'Estilo visual', 'Formato final'],
        optional: ['Paleta de cores', 'Referências visuais', 'Restrições'],
        tools: ['Loveart ⭐', 'Freepik', 'Envato', 'Adobe Firefly', 'Canva'],
        flow: ['Explorar e gerar via prompts', 'Usar referências de estilo', 'Refinar técnica e visualmente', 'Preparar o arquivo final'],
        curation: ['Construir e ajustar prompts', 'Selecionar outputs aderentes', 'Corrigir cor, enquadramento e estilo', 'Validar identidade da marca'],
        promptGoal: 'Traduzir o briefing em uma imagem controlada por contexto, objeto, estilo, ambiente, luz, cores, composição, proporção e restrições.',
        promptTemplate: 'Contexto: imagem para [uso e marca]. Descrição: [objeto ou cena]. Estilo: [fotográfico/3D/cartoon/editorial]. Iluminação: [tipo]. Cores: [paleta]. Composição: [ângulo]. Formato: [proporção]. Evitar: textos, marcas d’água e distorções.',
        steps: ['Interprete o briefing', 'Crie o prompt completo', 'Configure formato e referências', 'Gere variações', 'Selecione, refine e valide'],
        links: [{ label: 'Passo a passo', href: 'https://www.loom.com/share/9999de7b314e43908c3859653773a3eb' }, { label: 'Exemplos', href: 'https://drive.google.com/drive/folders/1AoVRQ0xJcHVEy63kG0eBlSG4u_Gj6BXI?usp=sharing' }],
    },
    {
        title: 'Redimensionamento via IA', icon: Maximize2, tone: 'mint',
        summary: 'Expande e adapta imagens aprovadas a novos formatos preservando intenção, qualidade, contexto e coerência visual.',
        ideal: ['Novos formatos e proporções', 'Expansão de fundos', 'Ajuste de enquadramento', 'Mídia paga, social e banners'],
        required: ['Imagem original', 'Formato final'],
        optional: ['Composição desejada', 'Elementos intocáveis', 'Prioridade visual', 'Variações e canal', 'Área segura para texto, logo ou CTA'],
        tools: ['Loveart', 'Freepik', 'Envato'],
        flow: ['Analisar a imagem', 'Definir novo formato', 'Expandir ou ajustar a cena', 'Corrigir enquadramento', 'Preparar o arquivo'],
        curation: ['Preservar intenção e marca', 'Avaliar cortes e distorções', 'Ajustar por canal', 'Validar luz, sombra e perspectiva'],
        promptGoal: 'Orientar a expansão com continuidade natural e fidelidade ao conceito, sem introduzir objetos aleatórios ou alterar o elemento principal.',
        promptTemplate: 'Contexto: adaptação para [canal]. Manter: [elementos]. Expandir: [laterais/topo/base]. Formato: [proporção]. Composição: espaço para [texto/logo/CTA]. Evitar: distorções, textos, marcas d’água e novos objetos.',
        steps: ['Identifique o elemento principal', 'Defina o formato', 'Aplique o novo canvas', 'Complete áreas vazias com IA', 'Revise cortes, luz e perspectiva', 'Exporte'],
    },
    {
        title: 'Avatar via IA', icon: Bot, tone: 'violet',
        summary: 'Cria apresentadores sintéticos, realistas ou estilizados, com voz, sincronização labial e cenas coerentes com o storyboard.',
        ideal: ['Vídeos explicativos', 'Tutoriais', 'Treinamentos', 'Comunicados e conteúdos recorrentes'],
        required: ['Texto da locução', 'Imagens da pessoa', 'Gravação da voz original', 'Storyboard apenas com cenários'],
        tools: ['HeyGen ⭐'],
        flow: ['Criar avatar e clonar voz', 'Aplicar locução e sincronização labial', 'Gerar cenas e enquadramentos', 'Legendar, finalizar e exportar'],
        curation: ['Definir roteiro e intenção', 'Avaliar expressão e naturalidade', 'Ajustar ritmo, pausas e enquadramento', 'Garantir credibilidade'],
        promptGoal: 'Preservar aparência, expressão e voz da pessoa, integrando o avatar ao estilo, cenário, iluminação e enquadramento definidos no storyboard.',
        promptTemplate: 'Contexto: avatar [apresentador/instrutor]. Descrição: [idade, traços, expressão e postura]. Estilo: [realista/cartoon]. Iluminação e cores: [storyboard/marca]. Composição: [plano e câmera]. Formato: [proporção]. Evitar: rigidez, exageros e desconexão com o cenário.',
        steps: ['Separe falas, imagem e voz', 'Crie o avatar por imagem no HeyGen', 'Clone a voz e configure afinidade', 'Gere cenas com planos variados', 'Monte a sequência no Studio AI', 'Renderize, revise pronúncia e exporte'],
        links: [{ label: 'Criar avatar', href: 'https://www.loom.com/share/9078b4437fc642ac8d94b220f364749a' }, { label: 'Criar cenas', href: 'https://www.loom.com/share/1146346f899f44f49738b5b2fe2da013' }, { label: 'Cenas — complemento', href: 'https://www.loom.com/share/b1a4a99de3d447a0bce9f8a9fd7c508d' }, { label: 'Montar vídeo', href: 'https://www.loom.com/share/adc5e6c855544e9890b29d7786514447' }, { label: 'Exemplos', href: 'https://drive.google.com/drive/folders/1UP55sLlxU21BRvCNvxBHhPzJrbEhYkO6?usp=sharing' }],
    },
    {
        title: 'Mascote via IA', icon: WandSparkles, tone: 'orange',
        summary: 'Explora personagens memoráveis que representam a marca de forma lúdica, consistente e reutilizável.',
        ideal: ['Campanhas temáticas', 'Endomarketing', 'Conteúdo educativo', 'Ativações e personagens recorrentes'],
        required: ['Personalidade', 'Tom de comunicação', 'Estilo 2D, 3D, realista ou ilustrado', 'Uso previsto'],
        optional: ['Referências existentes', 'Poses e expressões'],
        tools: ['Loveart ⭐', 'Freepik', 'Envato', 'Adobe Firefly', 'Canva'],
        flow: ['Criar o personagem', 'Explorar variações', 'Refinar e padronizar o estilo', 'Preparar para uso recorrente'],
        curation: ['Definir personalidade e postura', 'Garantir consistência entre versões', 'Adaptar a aplicações', 'Evitar estereótipos e excessos'],
        promptGoal: 'Criar identidade clara, leitura facial, consistência visual e potencial de recorrência alinhados à personalidade da marca.',
        promptTemplate: 'Contexto: mascote para [marca/finalidade]. Descrição: [aparência, expressão e personalidade]. Estilo: [cartoon/3D/etc.]. Iluminação: suave. Cores: alinhadas à marca. Composição: foco no personagem. Formato: [proporção]. Evitar: estereótipos e poluição visual.',
        steps: ['Interprete personalidade e uso', 'Crie o prompt', 'Gere variações', 'Selecione uma direção', 'Refine consistência, poses e aplicações'],
        links: [{ label: 'Passo a passo', href: 'https://www.loom.com/share/b4ee41b94138459da6e18a1b7ce93140' }, { label: 'Exemplos', href: 'https://drive.google.com/drive/folders/1LH1O0lXt9z46QRM4FZtUxNn50jhHuKt-?usp=sharing' }],
    },
];

const scenarios = [
    { title: 'Vídeo institucional', items: ['Locução', 'Vídeo', 'Imagem', 'Legendagem'], result: 'Menor custo e mais velocidade para criar assets audiovisuais.', icon: Clapperboard },
    { title: 'Campanha digital', items: ['Imagem', 'Animação de imagem', 'Redimensionamento'], result: 'Mais caminhos criativos e produção multiformato.', icon: Images },
    { title: 'Treinamento', items: ['Avatar', 'Locução', 'Legendagem', 'Vídeo'], result: 'Conteúdo escalável sem gravações presenciais recorrentes.', icon: Presentation },
    { title: 'Lançamento de produto', items: ['Imagem', 'Vídeo', 'Animação'], result: 'Validação rápida antes de produções maiores.', icon: Sparkles },
    { title: 'Comunicação interna', items: ['Avatar', 'Locução', 'Animação'], result: 'Demandas recorrentes mais rápidas e dinâmicas.', icon: MessageSquareText },
    { title: 'Eventos corporativos', items: ['Imagem', 'Vídeo', 'Avatar', 'Locução'], result: 'Mais materiais em menos tempo.', icon: MonitorPlay },
    { title: 'Personagem de marca', items: ['Mascote', 'Imagem', 'Animação'], result: 'Teste de personagens antes de modelagem robusta.', icon: Bot },
    { title: 'Reaproveitamento', items: ['Redimensionamento', 'Animação', 'Legendagem'], result: 'Mais valor para ativos já produzidos.', icon: RefreshCw },
];

const promptElements = [
    ['Contexto', 'O que acontece e qual é o objetivo.'],
    ['Personagens', 'Quem aparece e quais características importam.'],
    ['Ambiente', 'Onde a cena acontece.'],
    ['Estilo', 'Fotográfico, 3D, ilustração, cartoon ou cinema.'],
    ['Fotografia', 'Luz, lente, plano, ângulo e profundidade.'],
    ['Emoção', 'Confiança, inovação, segurança ou proximidade.'],
];

const humanResponsibilities = ['Interpretar o briefing', 'Definir direção criativa', 'Construir e refinar prompts', 'Selecionar resultados', 'Corrigir inconsistências', 'Garantir aderência à marca', 'Preparar a entrega final'];
const commonErrors = [['Anatomia', 'Mãos, dedos, expressões e proporções.'], ['Produtos', 'Embalagens, equipamentos e objetos incorretos.'], ['Textos', 'Palavras incompletas ou ilegíveis.'], ['Identidade', 'Cores, símbolos ou marca fora do padrão.'], ['Contexto', 'Público ou situação representados de forma inadequada.']];
const avoidPromises = ['A IA faz qualquer coisa.', 'Vai ficar exatamente igual à referência.', 'Substitui uma produção profissional.', 'Não precisa de revisão.', 'É só apertar um botão.', 'Vai sair perfeito na primeira versão.', 'Não existe limitação.'];
const preferMessages = ['A IA pode acelerar esta etapa.', 'Podemos explorar caminhos rapidamente.', 'Este item pode reduzir o esforço de execução.', 'A entrega passará por curadoria humana.', 'Buscaremos o resultado mais aderente possível.', 'Este recurso funciona bem para esta necessidade.'];
const opportunities = [['Produção recorrente', 'Treinamentos, comunicados, conteúdos internos e social.'], ['Muitas adaptações', 'Redimensionamentos, versões e conteúdos multilíngues.'], ['Velocidade', 'Eventos, lançamentos e campanhas sazonais.'], ['Exploração visual', 'Moodboards, conceitos e campanhas em desenvolvimento.']];
const poorFits = [['Controle absoluto', 'Projetos que exigem extrema precisão visual.'], ['Produção premium', 'Campanhas de alto investimento e exigência artística.'], ['Emoção humana', 'Conteúdos dependentes de atuação sensível.'], ['Alta regulação', 'Qualquer erro pode gerar impacto legal ou reputacional.']];

const AllyoArtificialIntelligenceContent = () => (
    <div className="space-y-10">
        <section className="overflow-hidden rounded-[18px] border border-violet-200 bg-gradient-to-br from-[#f1edff] via-white to-[#eaf4ff] p-6 dark:border-violet-500/20 dark:from-violet-950/30 dark:via-zinc-950 dark:to-blue-950/25 sm:p-10">
            <div className="flex flex-wrap gap-2"><Badge tone="violet">Feitos com IA</Badge><Badge tone="blue">Educacional</Badge></div>
            <h2 className="mt-6 max-w-[980px] font-season text-[clamp(30px,4vw,48px)] leading-[1.08]">IA não é um produto isolado. É uma alavanca dentro de projetos reais.</h2>
            <p className="mt-5 max-w-[1000px] text-sm leading-7 text-[#5f6170] dark:text-zinc-300">Clientes buscam resolver problemas, lançar campanhas, treinar pessoas e acelerar entregas. A análise deve começar pela etapa em que a IA gera mais valor — não pela ferramenta disponível.</p>
            <blockquote className="mt-7 max-w-[900px] border-l-2 border-violet-400 pl-5 font-season text-[clamp(20px,3vw,30px)] leading-snug text-violet-900 dark:text-violet-200">“Em qual etapa deste projeto a IA pode gerar mais valor?”</blockquote>
            <div className="mt-8 grid gap-[10px] sm:grid-cols-2 lg:grid-cols-3">{valuePoints.map((point) => <div key={point} className={`flex items-center gap-3 rounded-[12px] border bg-white/70 px-4 py-3 text-xs dark:bg-black/10 ${ALLYO_BORDER}`}><CheckCircle2 size={15} className="shrink-0 text-violet-600 dark:text-violet-300" />{point}</div>)}</div>
        </section>

        <Section title="Oito itens no catálogo" icon={BrainCircuit} description="Cada item resolve uma etapa específica e pode ser combinado com os demais dentro de uma produção maior.">
            <div className="grid gap-[10px] sm:grid-cols-2 xl:grid-cols-4">{catalog.map((item) => <CatalogCard key={item.title} item={item} />)}</div>
        </Section>

        <section className="rounded-[18px] border border-blue-200 bg-blue-50/55 p-6 dark:border-blue-500/20 dark:bg-blue-500/5 sm:p-8">
            <div className="flex items-start gap-4"><IconBox icon={WandSparkles} tone="blue" /><div><Badge tone="blue">Princípio Faster</Badge><h3 className="mt-3 font-season text-[30px]">IA não é a entrega. IA é um asset.</h3></div></div>
            <p className="mt-5 max-w-[1050px] text-xs leading-6 text-[#626976] dark:text-zinc-400">Imagens, vídeos, vozes, personagens, avatares, animações, legendas e adaptações normalmente passam por edição, direção, refinamento e validação antes de chegar ao cliente. A tecnologia potencializa a produção; não substitui estratégia, criatividade ou direção.</p>
            <div className="mt-6 grid gap-[10px] lg:grid-cols-3"><PrincipleCard number="01" title="Briefing" text="Define intenção, objetivo, público e contexto." /><PrincipleCard number="02" title="Referências" text="Direcionam estilo, linguagem e expectativa." /><PrincipleCard number="03" title="Curadoria" text="Seleciona, refina e valida o resultado." /></div>
        </section>

        <Section title="IA em projetos reais" icon={Target} description="Os melhores resultados combinam estratégia humana, direção criativa, curadoria e recursos de Inteligência Artificial.">
            <div className="grid gap-[10px] md:grid-cols-2 xl:grid-cols-4">{scenarios.map((scenario) => <ScenarioCard key={scenario.title} {...scenario} />)}</div>
        </Section>

        <Section title="Do briefing ao prompt" icon={FileText} description="O briefing fornece intenção. O prompt traduz essa intenção em instruções executáveis para a geração.">
            <div className="grid gap-[10px] lg:grid-cols-2"><PromptDefinition title="Briefing" tone="blue" questions={['O que criar?', 'Para quem?', 'Com qual objetivo?', 'Para qual marca?', 'Em qual contexto?']} /><PromptDefinition title="Prompt" tone="violet" questions={['Como gerar?', 'Qual estética?', 'Quais elementos?', 'Como construir a cena?', 'Como câmera e personagens agem?']} /></div>
            <div className="mt-[10px] grid gap-[10px] sm:grid-cols-2 lg:grid-cols-3">{promptElements.map(([title, text]) => <article key={title} className={`rounded-[14px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><strong className="text-xs">{title}</strong><p className="mt-2 text-[11px] leading-5 text-[#696e78] dark:text-zinc-400">{text}</p></article>)}</div>
            <div className="mt-[10px] grid gap-[10px] lg:grid-cols-2"><PromptExample label="Prompt fraco" text="Mulher trabalhando." tone="rose" /><PromptExample label="Prompt forte" text="Mulher brasileira de aproximadamente 40 anos em escritório corporativo moderno, usando notebook, com luz natural lateral, expressão confiante, fotografia editorial e profundidade de campo reduzida." tone="mint" /></div>
            <div className={`mt-[10px] rounded-[16px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center gap-3"><IconBox icon={RefreshCw} tone="violet" /><div><h4 className="font-season text-[22px]">Prompt é hipótese, não garantia</h4><p className="mt-1 text-[11px] text-[#747985] dark:text-zinc-500">Testar → ajustar → refinar → iterar</p></div></div><div className="mt-5 grid gap-2 sm:grid-cols-5">{['Define a cena', 'Melhora personagens', 'Refina iluminação', 'Ajusta composição', 'Aproxima da marca'].map((step, index) => <div key={step} className="rounded-[10px] bg-[#f6f5f8] p-3 text-[11px] leading-5 dark:bg-zinc-900"><span className="mr-2 font-mono text-violet-600">V{index + 1}</span>{step}</div>)}</div></div>
        </Section>

        <Section title="Curadoria transforma geração em entrega" icon={ShieldCheck} description="A IA gera possibilidades; o time transforma essas possibilidades em soluções aderentes ao briefing, à marca e ao negócio.">
            <div className="grid gap-[10px] lg:grid-cols-2">
                <ListPanel title="Responsabilidade humana" icon={UsersRound} tone="mint" items={humanResponsibilities} />
                <ListPanel title="Erros que exigem atenção" icon={ScanSearch} tone="rose" items={commonErrors.map(([title, text]) => `${title}: ${text}`)} />
            </div>
            <div className="mt-[10px] rounded-[18px] border border-violet-300 bg-gradient-to-r from-violet-50 via-white to-blue-50 p-6 text-center dark:border-violet-500/25 dark:from-violet-950/20 dark:via-zinc-950 dark:to-blue-950/20"><span className="text-[9px] font-bold uppercase tracking-[.12em] text-violet-600 dark:text-violet-300">Equação da qualidade</span><p className="mt-3 font-season text-[clamp(25px,4vw,38px)]">Briefing + Prompt + Curadoria</p><p className="mt-3 text-xs text-[#6b6e78] dark:text-zinc-400">IA gera volume. Curadoria gera qualidade.</p></div>
        </Section>

        <Section title="Como posicionar IA para clientes" icon={MessageSquareText} description="O cliente não compra tecnologia: ele compra velocidade, redução de custo, escala, conteúdo e resolução de problemas.">
            <div className="grid gap-[10px] lg:grid-cols-2"><ListPanel title="Evite dizer" icon={XCircle} tone="rose" items={avoidPromises} /><ListPanel title="Prefira dizer" icon={CheckCircle2} tone="mint" items={preferMessages} /></div>
            <div className="mt-[10px] grid gap-[10px] lg:grid-cols-2"><FitPanel title="Boas oportunidades" icon={Sparkles} tone="blue" items={opportunities} /><FitPanel title="Talvez não seja a melhor escolha" icon={CircleAlert} tone="orange" items={poorFits} /></div>
            <div className={`mt-[10px] rounded-[16px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><h4 className="font-season text-[22px]">Comece pelo problema</h4><div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{['Qual é o desafio?', 'Qual resultado esperado?', 'Qual é o prazo?', 'Existe limite de orçamento?', 'É recorrente ou pontual?'].map((question) => <div key={question} className="rounded-[10px] bg-[#f6f7f4] p-3 text-[11px] leading-5 dark:bg-zinc-900">{question}</div>)}</div></div>
        </Section>

        <section className="rounded-[18px] border border-violet-300 bg-[#f4f0ff] p-6 dark:border-violet-500/25 dark:bg-violet-500/5 sm:p-9">
            <div className="flex items-center gap-3"><IconBox icon={Lightbulb} tone="violet" /><Badge tone="violet">Regra de ouro</Badge></div>
            <p className="mt-6 max-w-[1000px] font-season text-[clamp(25px,4vw,38px)] leading-tight">“Estou vendendo uma tecnologia ou estou resolvendo um problema?”</p>
            <p className="mt-4 text-xs leading-6 text-[#656272] dark:text-zinc-400">Se a resposta for tecnologia, volte um passo. Se for problema, você está no caminho certo. A IA é uma ferramenta; o valor está na forma como escolhemos utilizá-la.</p>
        </section>

        <Section title="Workshops e aprofundamento" icon={Presentation}>
            <div className="grid gap-[10px] lg:grid-cols-2"><ResourceLink label="Apresentação do workshop" href="https://docs.google.com/presentation/d/1tMr6PRG10-MhfkNgrvEIPw1O3hpGKy5_3Sga1IU2i-c/present?slide=id.g366190fb139_0_15" icon={Presentation} /><ResourceLink label="Gravação do workshop" href="https://drive.google.com/file/d/1BPqs2AtU72lk6octgQvt2d2dG_9a7FLI/view" icon={MonitorPlay} /></div>
        </Section>

        <Section title="Guias operacionais dos itens" icon={Gauge} description="Consulte briefing, ferramentas, curadoria, prompting, produção e materiais de apoio de cada solução.">
            <div className="space-y-[10px]">{catalog.map((item, index) => <OperationalGuide key={item.title} item={item} open={index === 0} />)}</div>
        </Section>

        <Section title="Direção de cena para avatares" icon={Clapperboard} description="Planos diferentes simulam cortes de câmera, reduzem fadiga visual e deixam o conteúdo sintético mais natural e editável.">
            <div className="grid gap-[10px] lg:grid-cols-3"><ShotCard title="Plano geral" text="Mostra personagem em menor proporção e estabelece sua relação com o ambiente." use="Contextualizar cenário, espaço ou localização." /><ShotCard title="Plano médio" text="Enquadra da cintura para cima, equilibrando expressão, ação e contexto." use="Diálogos, instruções e interação com o ambiente." /><ShotCard title="Plano próximo" text="Prioriza rosto, mãos ou outro detalhe e reduz distrações do fundo." use="Emoção, conexão e destaque de ações importantes." /></div>
            <div className="mt-[10px] flex flex-wrap gap-2">{['Close-up', 'Plano de conjunto', 'Plano detalhe', 'Plano americano'].map((shot) => <Badge key={shot} tone="blue">{shot}</Badge>)}</div>
            <p className="mt-4 text-[11px] leading-5 text-[#6c7078] dark:text-zinc-400">Quando houver inserções posteriores, mantenha fundos neutros ou chroma key. Isso facilita recorte no After Effects, reutilização do avatar e composição com vídeos, gráficos ou telas.</p>
        </Section>
    </div>
);

const tone = {
    blue: { badge: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300', icon: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-500/25', surface: 'bg-blue-50/55 dark:bg-blue-500/5' },
    violet: { badge: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-300', icon: 'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-500/25', surface: 'bg-violet-50/55 dark:bg-violet-500/5' },
    mint: { badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300', icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-500/25', surface: 'bg-emerald-50/55 dark:bg-emerald-500/5' },
    orange: { badge: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-orange-300', icon: 'bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-500/25', surface: 'bg-orange-50/55 dark:bg-orange-500/5' },
    rose: { badge: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300', icon: 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-500/25', surface: 'bg-rose-50/55 dark:bg-rose-500/5' },
};

const Section = ({ title, icon: Icon, description, children }: { title: string; icon: LucideIcon; description?: string; children: ReactNode }) => <section><div className="mb-5 flex items-center gap-2"><Icon size={17} className="text-violet-600 dark:text-violet-300" /><h3 className="font-season text-[24px]">{title}</h3></div>{description && <p className="-mt-3 mb-5 max-w-[1050px] text-xs leading-6 text-[#686b76] dark:text-zinc-400">{description}</p>}{children}</section>;
const Badge = ({ tone: color, children }: { tone: Tone; children: ReactNode }) => <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.08em] ${tone[color].badge}`}>{children}</span>;
const IconBox = ({ icon: Icon, tone: color }: { icon: LucideIcon; tone: Tone }) => <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${tone[color].icon}`}><Icon size={18} /></span>;
const PrincipleCard = ({ number, title, text }: { number: string; title: string; text: string }) => <article className={`rounded-[14px] border bg-white/70 p-5 dark:bg-black/10 ${ALLYO_BORDER}`}><span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-300">{number}</span><strong className="mt-3 block text-sm">{title}</strong><p className="mt-2 text-[11px] leading-5 text-[#686e78] dark:text-zinc-400">{text}</p></article>;

const CatalogCard = ({ item }: { item: AiItem }) => <article className={`rounded-[16px] border p-5 ${tone[item.tone].border} ${tone[item.tone].surface}`}><div className="flex items-center justify-between gap-3"><IconBox icon={item.icon} tone={item.tone} /><span className="font-mono text-[9px] text-[#8d9199]">0{itemNames.indexOf(item.title) + 1}</span></div><h4 className="mt-5 font-season text-xl">{item.title}</h4><p className="mt-3 text-[11px] leading-5 text-[#656b76] dark:text-zinc-400">{item.summary}</p><div className="mt-4 flex flex-wrap gap-1.5">{item.tools.map((tool) => <span key={tool} className={`rounded-full border bg-white/60 px-2 py-1 text-[9px] dark:bg-black/10 ${ALLYO_BORDER}`}>{tool}</span>)}</div></article>;
const ScenarioCard = ({ title, items, result, icon: Icon }: { title: string; items: string[]; result: string; icon: LucideIcon }) => <article className={`rounded-[16px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><IconBox icon={Icon} tone="violet" /><h4 className="mt-4 text-sm font-semibold">{title}</h4><div className="mt-3 flex flex-wrap gap-1.5">{items.map((item) => <Badge key={item} tone="blue">{item}</Badge>)}</div><p className="mt-4 text-[11px] leading-5 text-[#686d77] dark:text-zinc-400">{result}</p></article>;

const PromptDefinition = ({ title, tone: color, questions }: { title: string; tone: Tone; questions: string[] }) => <article className={`rounded-[16px] border p-6 ${tone[color].border} ${tone[color].surface}`}><Badge tone={color}>{title}</Badge><ul className="mt-5 grid gap-2 sm:grid-cols-2">{questions.map((question) => <li key={question} className={`rounded-[10px] border bg-white/60 px-3 py-2 text-[11px] dark:bg-black/10 ${ALLYO_BORDER}`}>{question}</li>)}</ul></article>;
const PromptExample = ({ label, text, tone: color }: { label: string; text: string; tone: Tone }) => <article className={`rounded-[14px] border p-5 ${tone[color].border} ${tone[color].surface}`}><Badge tone={color}>{label}</Badge><p className="mt-4 text-xs leading-6 text-[#626874] dark:text-zinc-400">{text}</p></article>;
const ListPanel = ({ title, icon: Icon, tone: color, items }: { title: string; icon: LucideIcon; tone: Tone; items: string[] }) => <article className={`rounded-[16px] border p-6 ${tone[color].border} ${tone[color].surface}`}><div className="flex items-center gap-3"><IconBox icon={Icon} tone={color} /><h4 className="font-season text-[22px]">{title}</h4></div><BulletList items={items} tone={color} /></article>;
const BulletList = ({ items, tone: color = 'violet' }: { items: string[]; tone?: Tone }) => <ul className="mt-4 space-y-2.5">{items.map((item) => <li key={item} className="flex items-start gap-2.5 text-[11px] leading-5 text-[#656b76] dark:text-zinc-400"><CheckCircle2 size={14} className={`mt-0.5 shrink-0 ${tone[color].icon.split(' ').find((value) => value.startsWith('text-')) || ''}`} />{item}</li>)}</ul>;
const FitPanel = ({ title, icon: Icon, tone: color, items }: { title: string; icon: LucideIcon; tone: Tone; items: string[][] }) => <article className={`rounded-[16px] border p-6 ${tone[color].border} ${tone[color].surface}`}><div className="flex items-center gap-3"><IconBox icon={Icon} tone={color} /><h4 className="font-season text-[22px]">{title}</h4></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{items.map(([label, text]) => <div key={label}><strong className="text-xs">{label}</strong><p className="mt-1 text-[11px] leading-5 text-[#686e78] dark:text-zinc-400">{text}</p></div>)}</div></article>;
const ResourceLink = ({ label, href, icon: Icon }: { label: string; href: string; icon: LucideIcon }) => <a href={href} target="_blank" rel="noreferrer" className={`group flex items-center gap-4 rounded-[16px] border bg-white p-6 transition hover:-translate-y-0.5 hover:border-violet-300 dark:bg-zinc-950 ${ALLYO_BORDER}`}><IconBox icon={Icon} tone="violet" /><strong className="min-w-0 flex-1 text-sm">{label}</strong><ExternalLink size={16} className="shrink-0 text-[#979aa3] transition group-hover:text-violet-600" /></a>;

const OperationalGuide = ({ item, open }: { item: AiItem; open: boolean }) => <details open={open} className={`group rounded-[16px] border bg-white dark:bg-zinc-950 ${tone[item.tone].border}`}><summary className="flex cursor-pointer list-none items-center gap-4 p-5 sm:p-6"><IconBox icon={item.icon} tone={item.tone} /><div className="min-w-0 flex-1"><h4 className="font-season text-[22px]">{item.title}</h4><p className="mt-1 line-clamp-1 text-[11px] text-[#737883] dark:text-zinc-500">{item.summary}</p></div><ChevronDown size={18} className="shrink-0 text-[#8e929a] transition group-open:rotate-180" /></summary><div className="border-t border-black/8 px-5 pb-6 pt-5 dark:border-white/10 sm:px-6"><p className="text-xs leading-6 text-[#646a75] dark:text-zinc-400">{item.summary}</p><div className="mt-5 grid gap-[10px] lg:grid-cols-3"><GuideBlock title="Uso recomendado"><BulletList items={item.ideal} tone={item.tone} /></GuideBlock><GuideBlock title="Briefing obrigatório"><BulletList items={item.required} tone={item.tone} />{item.optional && <><p className="mt-4 text-[9px] font-bold uppercase tracking-[.1em] text-[#858992]">Opcional</p><BulletList items={item.optional} tone={item.tone} /></>}</GuideBlock><GuideBlock title="Ferramentas"><div className="mt-4 flex flex-wrap gap-2">{item.tools.map((tool) => <Badge key={tool} tone={item.tone}>{tool}</Badge>)}</div></GuideBlock><GuideBlock title="Papel no fluxo"><BulletList items={item.flow} tone={item.tone} /></GuideBlock><GuideBlock title="Curadoria humana"><BulletList items={item.curation} tone={item.tone} /></GuideBlock><GuideBlock title="Passo a passo"><ol className="mt-4 space-y-2">{item.steps.map((step, index) => <li key={step} className="flex items-start gap-2 text-[11px] leading-5 text-[#666b75] dark:text-zinc-400"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f0f1ee] text-[9px] font-bold dark:bg-zinc-800">{index + 1}</span>{step}</li>)}</ol></GuideBlock></div>{item.promptGoal && <div className={`mt-[10px] rounded-[14px] border p-5 ${tone[item.tone].surface} ${tone[item.tone].border}`}><Badge tone={item.tone}>Prompting</Badge><p className="mt-4 text-xs leading-6 text-[#626874] dark:text-zinc-400">{item.promptGoal}</p>{item.promptTemplate && <div className={`mt-4 rounded-[10px] border bg-white/65 p-4 font-mono text-[11px] leading-5 text-[#525865] dark:bg-black/10 dark:text-zinc-300 ${ALLYO_BORDER}`}>{item.promptTemplate}</div>}</div>}{item.links && <div className="mt-5 flex flex-wrap gap-2">{item.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-[10px] font-semibold text-violet-700 transition hover:border-violet-400 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-300">{link.label}<ExternalLink size={12} /></a>)}</div>}</div></details>;
const GuideBlock = ({ title, children }: { title: string; children: ReactNode }) => <article className={`rounded-[13px] border bg-[#fafafa] p-5 dark:bg-zinc-900 ${ALLYO_BORDER}`}><strong className="text-xs">{title}</strong>{children}</article>;
const ShotCard = ({ title, text, use }: { title: string; text: string; use: string }) => <article className={`rounded-[16px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><IconBox icon={Clapperboard} tone="blue" /><h4 className="mt-5 font-season text-[22px]">{title}</h4><p className="mt-3 text-xs leading-6 text-[#666c76] dark:text-zinc-400">{text}</p><p className="mt-4 rounded-[10px] bg-blue-50 px-4 py-3 text-[11px] leading-5 text-blue-800 dark:bg-blue-500/10 dark:text-blue-200"><strong>Uso:</strong> {use}</p></article>;

export default AllyoArtificialIntelligenceContent;
