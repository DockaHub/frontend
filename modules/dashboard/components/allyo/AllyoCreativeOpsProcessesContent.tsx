import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    CalendarClock,
    CheckCircle2,
    ClipboardCheck,
    Gauge,
    HeartHandshake,
    Lightbulb,
    MessageSquare,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Target,
    UsersRound,
    Workflow,
} from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';

type Ritual = { title: string; purpose: string; description: string; icon: LucideIcon };
type Protocol = { title: string; description: string; items: string[]; icon: LucideIcon };
type WorkflowItem = { title: string; owner: string; frequency: string; objective: string; steps: string[]; rule?: string };

const clientRituals: Ritual[] = [
    { title: 'Onboarding', purpose: 'Apresentar a operação e alinhar expectativas.', description: 'Primeiro encontro oficial após a contratação. Define canais, modelo de trabalho, objetivos, responsáveis e próximos passos da parceria.', icon: HeartHandshake },
    { title: 'Imersão', purpose: 'Compreender profundamente a marca.', description: 'Explora contexto, posicionamento, diferenciais, público, concorrentes, desafios e objetivos de negócio antes da execução criativa.', icon: Target },
    { title: 'Refresh de imersão', purpose: 'Atualizar o conhecimento sobre a marca.', description: 'Aplicado quando há reposicionamento, novos desafios ou mudanças relevantes nas diretrizes e objetivos do cliente.', icon: RefreshCw },
    { title: 'Refresh de onboarding', purpose: 'Integrar novos participantes.', description: 'Reapresenta processos, canais e responsabilidades quando o time do cliente muda, preservando continuidade e contexto.', icon: UsersRound },
    { title: 'Alinhamento de marca', purpose: 'Revisar identidade e comunicação.', description: 'Aprofunda diretrizes de identidade visual, voz, posicionamento e critérios para manter consistência nas entregas.', icon: Sparkles },
    { title: 'Alinhamento de novo projeto', purpose: 'Definir escopo e critérios de sucesso.', description: 'Organiza objetivos, entregáveis, cronograma, responsabilidades e riscos de campanhas ou iniciativas específicas.', icon: ClipboardCheck },
    { title: 'Brainstorming', purpose: 'Explorar caminhos criativos.', description: 'Gera hipóteses, conceitos e perspectivas para orientar futuras entregas sem limitar a conversa a respostas imediatas.', icon: Lightbulb },
    { title: 'Acompanhamento de demanda', purpose: 'Manter a execução no rumo certo.', description: 'Monitora andamento, esclarece dúvidas, valida direcionamentos e antecipa riscos antes que causem impacto.', icon: Workflow },
    { title: 'Checkpoint', purpose: 'Revisar a saúde da parceria.', description: 'Avalia uso da operação, percepção do cliente, oportunidades de melhoria e aproveitamento dos recursos contratados.', icon: CalendarClock },
    { title: 'Planejamento de comunicação', purpose: 'Conectar estratégia e calendário.', description: 'Define prioridades, pautas, campanhas, formatos e oportunidades para os próximos ciclos.', icon: MessageSquare },
    { title: 'Apresentação de resultados', purpose: 'Traduzir indicadores em valor.', description: 'Apresenta créditos, usabilidade, volume, avaliações, versionamentos, economia de tempo, aprendizados e próximos passos.', icon: Target },
    { title: 'Feedback pós-projeto', purpose: 'Registrar aprendizados.', description: 'Após projetos relevantes, revisa resultados, boas práticas e oportunidades de melhoria para os próximos ciclos.', icon: RefreshCw },
    { title: 'Crise ou recuperação', purpose: 'Restabelecer confiança.', description: 'Investiga causa raiz, cria plano de ação e acompanha a resolução com transparência, escuta ativa e foco em solução.', icon: AlertTriangle },
];

const internalRituals: Ritual[] = [
    { title: 'Daily CAM & CAS', purpose: 'Alinhar a operação das contas.', description: 'Revisa prioridades, pendências, bloqueios, riscos e responsáveis. Deve ser curta, objetiva e orientada a ações imediatas.', icon: CalendarClock },
    { title: 'Checkpoint criativo', purpose: 'Conectar estratégia, briefing e execução.', description: 'Reúne as especialidades necessárias para avaliar riscos, direcionamentos e consistência em contas ou projetos complexos.', icon: Sparkles },
    { title: 'Feedback com liderança', purpose: 'Apoiar desenvolvimento profissional.', description: 'Espaço formal para desafios, evolução, feedbacks e alinhamento entre prioridades da área e atuação individual.', icon: MessageSquare },
    { title: 'One-on-One', purpose: 'Acompanhar pessoas continuamente.', description: 'Conversa próxima e recorrente sobre expectativas, bem-estar, aprendizados, obstáculos e desenvolvimento.', icon: UsersRound },
    { title: 'Reuniões de liderança', purpose: 'Direcionar a evolução sustentável.', description: 'Revisa saúde da operação, capacidade, indicadores, clientes em atenção e iniciativas estratégicas.', icon: ShieldCheck },
    { title: 'Reviews operacionais', purpose: 'Transformar dados em melhoria.', description: 'Identifica padrões, gargalos, riscos e aprendizados que possam aprimorar processos e experiência do cliente.', icon: Target },
    { title: 'Planejamento da área', purpose: 'Construir o futuro da operação.', description: 'Organiza objetivos, prioridades, capacidade, projetos e indicadores para equilibrar crescimento, qualidade e eficiência.', icon: Workflow },
    { title: 'Compartilhamento de boas práticas', purpose: 'Acelerar aprendizado coletivo.', description: 'Dissemina casos, abordagens criativas, melhorias e soluções que podem gerar valor para toda a área.', icon: Lightbulb },
    { title: 'Retrospectivas', purpose: 'Aprender após cada ciclo.', description: 'Revê o que funcionou, o que melhorar e quais aprendizados devem orientar os próximos projetos, sem buscar culpados.', icon: RefreshCw },
];

const callProtocols: Protocol[] = [
    { title: 'Registro e histórico', description: 'Toda reunião relevante precisa preservar contexto e rastreabilidade.', items: ['Temas discutidos', 'Decisões tomadas', 'Responsáveis por cada ação', 'Prazos e próximos passos'], icon: ClipboardCheck },
    { title: 'Gravação e transcrição', description: 'Quando autorizado, utilize a ferramenta aprovada pela Allyo e revise o conteúdo antes do registro oficial.', items: ['Obter consentimento dos participantes', 'Validar nomes, decisões e prazos', 'Vincular o resumo à conta ou projeto'], icon: MessageSquare },
    { title: 'Preparação', description: 'Toda reunião deve ter objetivo claro, contexto revisado e pauta no convite.', items: ['Revisar registros anteriores', 'Separar indicadores e materiais', 'Definir resultado esperado', 'Convidar apenas pessoas necessárias'], icon: CalendarClock },
    { title: 'Condução', description: 'A conversa deve permanecer objetiva, organizada e focada no propósito definido.', items: ['Cobrir os temas previstos', 'Garantir participação equilibrada', 'Controlar o tempo', 'Separar assuntos paralelos'], icon: UsersRound },
    { title: 'Formalização de decisões', description: 'Antes de encerrar, confirme claramente o que acontecerá depois.', items: ['O que foi decidido', 'Quais ações serão realizadas', 'Quem é responsável', 'Qual é o prazo'], icon: CheckCircle2 },
    { title: 'Postura esperada', description: 'A qualidade da reunião também depende do comportamento dos participantes.', items: ['Pontualidade e escuta ativa', 'Postura profissional e consultiva', 'Respeito a opiniões diferentes', 'Colaboração e foco em solução'], icon: ShieldCheck },
    { title: 'Reuniões com clientes', description: 'Atue como parceiro estratégico, transmitindo domínio do contexto e compromisso com resultados.', items: ['Compreender objetivos', 'Antecipar necessidades', 'Construir soluções em conjunto', 'Reforçar percepção de valor'], icon: HeartHandshake },
    { title: 'Reuniões internas', description: 'Promovem alinhamento, circulação de contexto e tomada de decisão.', items: ['Priorizar objetividade', 'Registrar temas críticos', 'Compartilhar decisões com envolvidos', 'Converter informação em ação'], icon: Workflow },
];

const maintenanceWorkflows: WorkflowItem[] = [
    { title: 'Cadastro de contrato', owner: 'CAM', frequency: 'Na entrada ou alteração contratual', objective: 'Formalizar plano, franquia, boosters e início do ciclo.', steps: ['Validar handover e condições contratadas', 'Cadastrar plano, créditos, boosters e data de início no ManySpace', 'Confirmar contrato ativo e usuários cadastrados', 'Enviar boas-vindas e orientar upload de assets'], rule: 'A virada deve seguir a necessidade de acesso: dia 1 para acessos entre 31 e 8; dia 10 entre 9 e 18; dia 20 entre 19 e 30.' },
    { title: 'Informações do cliente', owner: 'CAM', frequency: 'Onboarding e sempre que houver mudança', objective: 'Manter dados críticos completos e confiáveis.', steps: ['Registrar ciclo, serviços e contatos', 'Cadastrar canais, datas sazonais e concorrentes', 'Validar informações com contrato e handover', 'Revisar campos antes de encerrar o onboarding'] },
    { title: 'Créditos bônus', owner: 'CAM', frequency: 'Sob demanda', objective: 'Aplicar condições temporárias de forma rastreável.', steps: ['Validar quantidade e ciclos autorizados', 'Criar vigência futura quando aplicável', 'Comunicar CAS, CQS e AD', 'Registrar motivo e condição aprovada'] },
    { title: 'Estratégias de usabilidade', owner: 'CAM', frequency: 'Revisão semanal ou quinzenal', objective: 'Estimular produção relevante e uso saudável dos créditos.', steps: ['Analisar calendário, segmento e objetivos', 'Identificar oportunidades de conteúdo', 'Sugerir formatos, testes e séries recorrentes', 'Registrar ação e acompanhar resultado'] },
    { title: 'Ceder ou descontar créditos', owner: 'CAM + CAS', frequency: 'Sob demanda', objective: 'Separar consumo, ajustes e exceções com consistência.', steps: ['Selecionar a classificação correta', 'Registrar contexto da decisão', 'Não usar tags antigas ou aproximadas', 'Acionar CESM em casos sensíveis'] },
    { title: 'Avaliações negativas', owner: 'CAM', frequency: 'Diária', objective: 'Resolver insatisfações antes que se tornem risco de churn.', steps: ['Identificar a avaliação e seu contexto', 'Contatar o cliente quando necessário', 'Acionar responsáveis conforme a gravidade', 'Registrar plano e acompanhar até resolução'], rule: 'Nenhuma avaliação negativa deve permanecer sem resposta ou ação por mais de 24 horas.' },
    { title: 'Engajamento das avaliações', owner: 'CAS', frequency: 'Semanal', objective: 'Manter pelo menos 60% das tarefas aprovadas avaliadas.', steps: ['Localizar clientes com baixo engajamento', 'Organizar tarefas não avaliadas por cliente', 'Enviar lembrete cordial com link correto', 'Registrar contato e evolução semanal'] },
    { title: 'Abertura de tarefa pelo time', owner: 'CAS', frequency: 'Sob demanda', objective: 'Ajudar o cliente a criar um briefing completo.', steps: ['Confirmar necessidade e informar o custo de 1 crédito', 'Realizar debriefing', 'Selecionar item e modalidade corretos', 'Validar escopo, prazo e briefing antes de abrir'] },
    { title: 'Usabilidade e consumo', owner: 'CAM + CAS', frequency: 'Quinzenal', objective: 'Reduzir ociosidade e conectar oportunidades ao negócio.', steps: ['Identificar baixa utilização', 'Avaliar contexto, calendário e segmento', 'Propor demandas específicas, nunca genéricas', 'Acompanhar evolução no ciclo seguinte'] },
    { title: 'Aprovação externa', owner: 'CAS', frequency: 'Semanal', objective: 'Evitar entregas paradas sem visibilidade.', steps: ['Ordenar tarefas pela data de envio', 'Priorizar itens próximos de 30 dias', 'Iniciar follow-up preventivo aos 25 dias', 'Registrar contato e retorno do cliente'] },
    { title: 'Pendência de briefing', owner: 'CAS', frequency: 'Diária', objective: 'Impedir que falta de informação vire gargalo.', steps: ['Revisar tarefas pendentes, especialmente às 16h', 'Registrar motivo e status atual', 'Consultar o histórico da conversa', 'Acionar CAM quando houver risco de impacto'] },
    { title: 'Checagem da pauta', owner: 'CAM + CAS', frequency: 'Diária', objective: 'Garantir entregas no prazo e antecipar atrasos.', steps: ['Revisar entregas previstas', 'Identificar tarefas críticas', 'Acionar CQS ou AD para correção imediata', 'Comunicar cliente quando houver impacto'] },
    { title: 'Comunicação e contatos', owner: 'CAM + CAS', frequency: 'Contínua', objective: 'Manter comunicação clara, formal e rastreável.', steps: ['Responder dentro do SLA', 'Separar temas operacionais e estratégicos', 'Revisar mensagens e dados de contato', 'Registrar interações relevantes no ManySpace'] },
    { title: 'Gestão de crises', owner: 'CAM', frequency: 'Sob demanda', objective: 'Responder rapidamente a situações críticas.', steps: ['Identificar gravidade e impacto', 'Acionar CESM e envolvidos', 'Construir e comunicar plano de ação', 'Manter histórico atualizado até a resolução'], rule: 'Situações críticas devem receber resposta inicial em até 2 horas.' },
    { title: 'Saúde da conta', owner: 'CAM', frequency: 'Semanal', objective: 'Classificar risco e manter um plano de ação atualizado.', steps: ['Positiva: operação saudável e engajada', 'Neutra: poucos sinais ou período de transição', 'Negativa: insatisfação, baixo uso ou risco concreto', 'Em saúde negativa, registrar red flag, plano e acompanhamento contínuo'] },
];

export const AllyoClientRitualsContent = () => <RitualsPage title="Rituais com cliente" description="Momentos estruturados de alinhamento, planejamento, acompanhamento e evolução da parceria. Cada ritual deve ser usado conforme maturidade da conta e contexto da operação." rituals={clientRituals} />;
export const AllyoInternalRitualsContent = () => <RitualsPage title="Rituais internos" description="Mecanismos de alinhamento, decisão, compartilhamento de contexto e evolução contínua que sustentam previsibilidade, eficiência e desenvolvimento do time." rituals={internalRituals} />;

export const AllyoCallRulesContent = () => (
    <div className="space-y-10">
        <Hero icon={MessageSquare} eyebrow="Creative Ops · Processos" title="Reuniões que geram clareza, decisão e ação." description="As calls são pontos importantes de contato entre equipes, clientes e áreas. Independentemente do ritual, devem preservar organização, rastreabilidade, eficiência e postura consultiva." />
        <section className="grid gap-[10px] lg:grid-cols-2">
            {callProtocols.map((protocol) => <ProtocolCard key={protocol.title} {...protocol} />)}
        </section>
        <ResultCallout title="Resultado esperado" text="Ao final de qualquer ritual, todos devem compreender o contexto, as decisões, os próximos passos e suas responsabilidades. Informação só gera valor quando se transforma em ação concreta." />
    </div>
);

export const AllyoAccountMaintenanceContent = () => (
    <div className="space-y-10">
        <Hero icon={Gauge} eyebrow="Creative Ops · Processos" title="Saúde da conta exige rotina, contexto e ação." description="A manutenção reúne processos recorrentes para garantir boa experiência, uso adequado dos créditos, previsibilidade operacional e resposta rápida a riscos." />
        <section className="grid gap-[10px] xl:grid-cols-2">
            {maintenanceWorkflows.map((workflow, index) => <WorkflowCard key={workflow.title} index={index + 1} {...workflow} />)}
        </section>
        <ResultCallout title="Princípio de manutenção" text="Toda exceção precisa de enquadramento claro; todo risco precisa de responsável e plano; toda interação relevante precisa permanecer registrada no ManySpace." />
    </div>
);

const RitualsPage = ({ title, description, rituals }: { title: string; description: string; rituals: Ritual[] }) => <div className="space-y-10"><Hero icon={HeartHandshake} eyebrow="Creative Ops · Processos" title={title} description={description} /><section className="grid gap-[10px] lg:grid-cols-2">{rituals.map((ritual) => <RitualCard key={ritual.title} {...ritual} />)}</section></div>;
const Hero = ({ icon: Icon, eyebrow, title, description }: { icon: LucideIcon; eyebrow: string; title: string; description: string }) => <section className={`rounded-[16px] border bg-gradient-to-br from-[#f2f5eb] via-white to-[#f7f7f3] p-6 dark:from-[#172018] dark:via-zinc-950 dark:to-zinc-900 sm:p-10 ${ALLYO_BORDER}`}><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#708346]"><Icon size={16} />{eyebrow}</span><h2 className="mt-5 max-w-[980px] font-season text-[clamp(32px,4vw,48px)] leading-[1.08]">{title}</h2><p className="mt-5 max-w-[980px] text-sm leading-7 text-[#626262] dark:text-zinc-400">{description}</p></section>;
const RitualCard = ({ title, purpose, description, icon: Icon }: Ritual) => <article className={`rounded-[14px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[#eef3e4] text-[#708346] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Icon size={17} /></span><div><h3 className="font-season text-xl">{title}</h3><span className="mt-1 block text-[9px] font-bold uppercase tracking-[.1em] text-[#829454]">{purpose}</span></div></div><p className="mt-4 text-xs leading-6 text-[#666] dark:text-zinc-400">{description}</p></article>;
const ProtocolCard = ({ title, description, items, icon: Icon }: Protocol) => <article className={`rounded-[14px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[#eef3e4] text-[#708346] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Icon size={17} /></span><h3 className="font-season text-xl">{title}</h3></div><p className="mt-4 text-xs leading-6 text-[#666] dark:text-zinc-400">{description}</p><BulletList items={items} /></article>;
const WorkflowCard = ({ index, title, owner, frequency, objective, steps, rule }: WorkflowItem & { index: number }) => <article className={`rounded-[14px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-start justify-between gap-4"><div><span className="text-[9px] font-bold uppercase tracking-[.12em] text-[#829454]">Processo {String(index).padStart(2, '0')}</span><h3 className="mt-2 font-season text-xl">{title}</h3></div><span className="rounded-full bg-[#eef3e4] px-3 py-1 text-[9px] font-semibold text-[#687a45] dark:bg-[#9db669]/10 dark:text-[#d0f08e]">{owner}</span></div><div className="mt-4 grid gap-2 rounded-[10px] bg-[#f7f8f4] p-4 text-xs dark:bg-zinc-900"><span><strong>Objetivo:</strong> {objective}</span><span><strong>Frequência:</strong> {frequency}</span></div><BulletList items={steps} />{rule && <p className="mt-4 rounded-[10px] border-l-2 border-[#9db669] bg-[#f4f7ee] px-4 py-3 text-xs leading-6 text-[#5f6b4c] dark:bg-[#172018] dark:text-zinc-300"><strong>Regra:</strong> {rule}</p>}</article>;
const BulletList = ({ items }: { items: string[] }) => <ul className="mt-4 space-y-2.5">{items.map((item) => <li key={item} className="flex items-start gap-2.5 text-xs leading-6 text-[#626262] dark:text-zinc-400"><CheckCircle2 size={15} className="mt-1 shrink-0 text-[#8aa05b]" />{item}</li>)}</ul>;
const ResultCallout = ({ title, text }: { title: string; text: string }) => <section className="rounded-[16px] border border-[#cbd8b0] bg-[#f3f6ed] p-6 dark:border-[#9db669]/30 dark:bg-[#172018] sm:p-8"><h2 className="font-season text-[28px]">{title}</h2><p className="mt-3 max-w-[1050px] text-sm leading-7 text-[#606b55] dark:text-zinc-400">{text}</p></section>;

export default AllyoClientRitualsContent;
