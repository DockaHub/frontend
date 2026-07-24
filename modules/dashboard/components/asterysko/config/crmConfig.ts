export type CrmPhaseId = 'opportunities' | 'commercial' | 'onboarding' | 'processual';

export interface CrmStageConfig {
    id: string;
    title: string;
    phase: CrmPhaseId;
    color: string;
    colorDot: string;
}

export interface CrmPhaseConfig {
    id: CrmPhaseId;
    label: string;
    description?: string;
    allowCreateLead: boolean;
}

export const CRM_PHASES: CrmPhaseConfig[] = [
    { id: 'opportunities', label: 'Oportunidades', allowCreateLead: false },
    { id: 'commercial', label: 'Comercial', allowCreateLead: true },
    { id: 'onboarding', label: 'Onboarding', allowCreateLead: false },
    { id: 'processual', label: 'Processual', allowCreateLead: false },
];

export const CRM_STAGES: CrmStageConfig[] = [
    // COMERCIAL
    { id: 'leads', title: 'Novos Leads', phase: 'commercial', color: 'bg-blue-400', colorDot: 'bg-blue-500' },
    { id: 'contato_iniciado', title: 'Contato Iniciado', phase: 'commercial', color: 'bg-sky-400', colorDot: 'bg-sky-500' },
    { id: 'em_conversa', title: 'Em Conversa', phase: 'commercial', color: 'bg-teal-400', colorDot: 'bg-teal-500' },
    { id: 'preparation', title: 'Diagnóstico', phase: 'commercial', color: 'bg-cyan-400', colorDot: 'bg-cyan-500' },
    { id: 'viability', title: 'Viabilidade', phase: 'commercial', color: 'bg-indigo-400', colorDot: 'bg-indigo-500' },
    { id: 'proposta', title: 'Proposta', phase: 'commercial', color: 'bg-purple-400', colorDot: 'bg-purple-500' },
    { id: 'contract', title: 'Contrato', phase: 'commercial', color: 'bg-amber-400', colorDot: 'bg-amber-500' },

    // ONBOARDING
    { id: 'service_payment', title: 'Pagamento do Serviço', phase: 'onboarding', color: 'bg-emerald-400', colorDot: 'bg-emerald-500' },
    { id: 'documentation', title: 'Procuração e Documentos', phase: 'onboarding', color: 'bg-violet-400', colorDot: 'bg-violet-500' },
    { id: 'federal_fee', title: 'Taxa Federal (GRU)', phase: 'onboarding', color: 'bg-rose-400', colorDot: 'bg-rose-500' },
    { id: 'ready_to_file', title: 'A Protocolar', phase: 'onboarding', color: 'bg-orange-400', colorDot: 'bg-orange-500' },

    // PROCESSUAL
    { id: 'filed', title: 'Protocolado (RPI)', phase: 'processual', color: 'bg-sky-500', colorDot: 'bg-sky-600' },
    { id: 'examination', title: 'Exame de Mérito', phase: 'processual', color: 'bg-violet-500', colorDot: 'bg-violet-600' },
    { id: 'opposition', title: 'Oposição / Exigência', phase: 'processual', color: 'bg-amber-600', colorDot: 'bg-amber-700' },
    { id: 'granted', title: 'Deferida', phase: 'processual', color: 'bg-emerald-500', colorDot: 'bg-emerald-600' },
    { id: 'won', title: 'Concluído', phase: 'processual', color: 'bg-green-600', colorDot: 'bg-green-700' },
];

export const STAGE_TO_PHASE_MAP: Record<string, CrmPhaseId> = CRM_STAGES.reduce((acc, stage) => {
    acc[stage.id] = stage.phase;
    return acc;
}, {} as Record<string, CrmPhaseId>);

export const getPhaseForStage = (stageId: string): CrmPhaseId => {
    return STAGE_TO_PHASE_MAP[stageId] || 'commercial';
};

export const getStagesForPhase = (phaseId: CrmPhaseId): CrmStageConfig[] => {
    return CRM_STAGES.filter(s => s.phase === phaseId);
};

export const getStageConfig = (stageId: string): CrmStageConfig | undefined => {
    return CRM_STAGES.find(s => s.id === stageId);
};

export const getStageTitle = (stageId: string): string => {
    const stage = getStageConfig(stageId);
    if (stage) return stage.title;

    // Fallback for legacy labels
    if (stageId === 'preparation') return 'Diagnóstico';
    if (stageId === 'service_payment') return 'Pagamento do Serviço';
    if (stageId === 'documentation') return 'Procuração e Documentos';
    return stageId;
};

// Helper for formatting card monetary value
export const formatDisplayValue = (rawVal: string | null | undefined): string | null => {
    if (!rawVal) return null;
    const cleanStr = String(rawVal).replace(/[^\d.,]/g, '').trim();
    if (!cleanStr || cleanStr === '0' || cleanStr === '0.00' || cleanStr === '0,00') {
        return null;
    }
    if (String(rawVal).startsWith('R$')) return rawVal;
    return `R$ ${rawVal}`;
};
