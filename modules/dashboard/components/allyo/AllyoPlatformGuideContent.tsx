import { AlertTriangle, CheckCircle2, Layers3, ListChecks, ShieldCheck, UsersRound } from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';

const pages: Record<string, { intro: string; sections: Array<{ title: string; items: string[] }> }> = {
    'playbook-creative-ops-plataforma-visao-geral': {
        intro: 'A plataforma organiza clientes, projetos, tarefas, créditos, SLA, aprovações e remuneração em um único fluxo rastreável.',
        sections: [
            { title: 'Estrutura', items: ['Cliente concentra contrato, plano e franquias', 'Projeto agrupa a demanda e o briefing', 'Tarefa é a unidade operacional de execução e cobrança', 'Stack conecta tarefas dependentes'] },
            { title: 'Fonte da verdade', items: ['Briefing, arquivos, mensagens e decisões devem permanecer na tarefa', 'O catálogo publicado define créditos, formatos e SLA', 'Status e responsáveis precisam refletir a situação real'] },
        ],
    },
    'playbook-creative-ops-plataforma-recursos': {
        intro: 'Os recursos operacionais existem para dar previsibilidade ao trabalho e visibilidade a cada papel.',
        sections: [
            { title: 'Execução', items: ['Lista de tarefas com filtros por cliente, projeto, equipe, prazo e status', 'Detalhe da tarefa com briefing, arquivos, mensagens e histórico', 'Dependências de Stack com bloqueio automático', 'Revisão e aprovação versionadas'] },
            { title: 'Gestão', items: ['Catálogo versionado', 'Política de cliente e franquias', 'Boosters com solicitação e decisão', 'Métricas e relatórios de ganhos'] },
        ],
    },
    'playbook-creative-ops-plataforma-fluxo': {
        intro: 'O fluxo começa no briefing validado e termina somente quando a entrega — ou toda a Stack — está aprovada.',
        sections: [
            { title: 'Sequência padrão', items: ['Validar briefing e produto do catálogo', 'Definir créditos, especialidade e responsável', 'Liberar a tarefa e iniciar o SLA', 'Produzir, revisar e enviar versão', 'Registrar aprovação ou alteração', 'Encerrar a Stack e liberar a remuneração'] },
            { title: 'Exceções', items: ['Pendência externa pausa o consumo de SLA', 'Tarefa dependente permanece bloqueada', 'Booster só altera prazo depois da aprovação operacional'] },
        ],
    },
    'playbook-creative-ops-plataforma-papeis': {
        intro: 'Cada papel atua no mesmo registro, com responsabilidades e visibilidade coerentes com a operação.',
        sections: [
            { title: 'Gestão e atendimento', items: ['CAM/CAS mantêm briefing, cliente e comunicação', 'CQS valida escopo, qualidade, créditos e Booster', 'CESM acompanha capacidade, métricas e riscos'] },
            { title: 'Criação', items: ['AD direciona qualidade e decisões criativas', 'Criativos executam tarefas de sua especialidade', 'Todos registram progresso, arquivos e impedimentos na plataforma'] },
        ],
    },
    'playbook-creative-ops-plataforma-boas-praticas': {
        intro: 'A qualidade do dado operacional influencia diretamente prazo, capacidade e experiência do cliente.',
        sections: [
            { title: 'Sempre faça', items: ['Use o produto correto do catálogo', 'Mantenha status e responsável atualizados', 'Centralize arquivos e feedbacks', 'Configure dependências antes de liberar a Stack', 'Registre justificativas de Booster e decisões'] },
            { title: 'Antes de concluir', items: ['Confira formatos finais e editáveis', 'Valide a aprovação do cliente', 'Confirme que todas as tarefas da Stack terminaram'] },
        ],
    },
    'playbook-creative-ops-plataforma-atencao': {
        intro: 'Inconsistências simples geram prazo incorreto, cobrança errada e perda de rastreabilidade.',
        sections: [
            { title: 'Evite', items: ['Criar tarefa sem briefing validado', 'Usar crédito genérico sem consultar o catálogo', 'Tratar canal externo como histórico oficial', 'Liberar dependente antes da aprovação anterior', 'Aprovar Booster sem saldo ou alinhamento'] },
            { title: 'Escale', items: ['Divergência entre catálogo e contrato', 'Dependência não mapeada', 'Risco de atraso em tarefa acelerada', 'Bloqueio técnico ou de acesso'] },
        ],
    },
};

const icons = [Layers3, ListChecks, UsersRound, ShieldCheck, CheckCircle2, AlertTriangle];

const AllyoPlatformGuideContent = ({ pageId }: { pageId: string }) => {
    const page = pages[pageId] || pages['playbook-creative-ops-plataforma-visao-geral'];
    return <div className="space-y-5"><p className="max-w-4xl text-sm leading-7 text-[#666] dark:text-zinc-300">{page.intro}</p><div className="grid gap-3 md:grid-cols-2">{page.sections.map((section, index) => { const Icon = icons[index % icons.length]; return <article key={section.title} className={`rounded-[14px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#eef3e4] text-[#708346] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Icon size={18} /></span><h3 className="mt-5 font-season text-2xl">{section.title}</h3><ul className="mt-4 space-y-3">{section.items.map((item) => <li key={item} className="flex gap-2 text-xs leading-5 text-[#686d66] dark:text-zinc-400"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#829454]" />{item}</li>)}</ul></article>; })}</div></div>;
};

export const ALLYO_PLATFORM_GUIDE_IDS = Object.keys(pages);
export default AllyoPlatformGuideContent;
