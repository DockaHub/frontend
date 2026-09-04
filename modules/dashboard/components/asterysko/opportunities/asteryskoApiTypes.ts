import axios from 'axios';

interface ApiErrorPayload {
    error?: string;
    message?: string;
}

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError<ApiErrorPayload>(error)) {
        return error.response?.data?.error ?? error.response?.data?.message ?? error.message ?? fallback;
    }
    return error instanceof Error ? error.message : fallback;
};

export type ContactCandidateType = 'email' | 'phone' | 'whatsapp' | 'website' | 'contact_form';
export type ContactCandidateStatus = 'suggested' | 'validated' | 'accepted' | 'rejected' | 'stale' | 'archived';
export type PrivacyClassification = 'business' | 'possible_personal' | 'sensitive' | 'unknown';
export type ValidationStatus = 'valid' | 'invalid' | 'risky' | 'unverifiable' | 'pending';
export type EnrichmentStatus =
    | 'pending'
    | 'running'
    | 'completed'
    | 'completed_partial'
    | 'review_required'
    | 'no_contact_found'
    | 'failed'
    | 'cancelled'
    | 'skipped';

export interface ContactEvidence {
    id: string;
    type: string;
    source?: string | null;
    url?: string | null;
    weight: number;
}

export interface ContactCandidate {
    id: string;
    type: ContactCandidateType;
    displayValue: string;
    confidence: number;
    status: ContactCandidateStatus;
    privacyClassification: PrivacyClassification;
    validationStatus?: ValidationStatus | null;
    isRoleBased?: boolean;
    evidences?: ContactEvidence[];
}

export interface ContactEnrichmentAttempt {
    id: string;
    opportunityId?: string | null;
    officialDomain?: string | null;
    officialWebsiteUrl?: string | null;
    websiteStatus?: string | null;
    status: EnrichmentStatus;
    finalResult?: string | null;
    finalConfidence?: number | null;
    pagesAnalyzed?: number | null;
    cacheHit?: boolean;
    dryRun?: boolean;
    candidateCount?: number;
    acceptedCandidateCount?: number;
    createdAt: string;
    candidates?: ContactCandidate[];
    evidences?: ContactEvidence[];
}

export interface ContactAttemptListResponse {
    attempts: ContactEnrichmentAttempt[];
    total: number;
    page: number;
    limit: number;
}

interface AttemptCount {
    status: EnrichmentStatus;
    _count: number;
}

interface CandidateCount {
    type: ContactCandidateType;
    status: ContactCandidateStatus;
    _count: number;
}

export interface ContactCountsResponse {
    counts: {
        attempts: AttemptCount[];
        candidates: CandidateCount[];
    };
    config: {
        enabled: boolean;
        dryRun: boolean;
        autoRun: boolean;
    };
}

export interface IngestionSourceRef {
    id?: string;
    name?: string;
}

export interface IngestionRun {
    id: string;
    status: string;
    createdAt: string;
    source?: IngestionSourceRef | null;
    dryRun?: boolean;
    itemsFetched?: number;
    opportunitiesCreated?: number;
}

export interface IngestionStats {
    isEngineEnabled: boolean;
    activeSources: number;
    totalRuns24h: number;
    captured24h: number;
    waitingBrand: number;
    lastRun?: IngestionRun | null;
    recentFailures?: IngestionFailure[];
}

export interface IngestionSource {
    id: string;
    key: string;
    name: string;
    status: string;
    batchSize: number;
    maxItemsPerRun?: number;
    lastRunAt?: string | null;
}

export interface IngestionFailure {
    id: string;
    fingerprint: string;
    lastError?: string | null;
    createdAt: string;
    processingAttempts: number;
    source?: IngestionSourceRef | null;
}

export interface ItemsResponse<T> {
    items: T[];
}

export interface ScoutSearchProfile {
    cities: string[];
    states: string[];
    segments: string[];
    desiredSignals: string[];
    exclusions: string[];
    maxCompanies: number;
    minimumConfidence: number;
    customPrompt?: string | null;
    autoCrm?: boolean;
}

export interface ScoutRun {
    id: string;
    status: string;
    createdAt: string;
    finishedAt?: string | null;
    itemsFetched?: number;
    opportunitiesCreated?: number;
    metadata?: {
        queries?: string[];
        companiesAnalyzed?: number;
        reviews?: number;
        duplicates?: number;
        rejected?: number;
        errors?: string[];
        usage?: { modelCalls?: number; totalTokens?: number };
    } | null;
}

export interface ScoutStatus {
    enabled: boolean;
    autoRun: boolean;
    provider: string;
    model: string;
    autoPipeline: boolean;
    defaultPrompt?: string;
    safety: {
        autoCrm: boolean;
        autoSend: boolean;
        subordinateAutoRun: boolean;
        concurrency: number;
    };
    limits: {
        searchesPerRun: number;
        modelCallsPerRun: number;
        resultsPerSearch: number;
        companiesPerRun: number;
        companiesPerDay: number;
        pagesPerCompany: number;
        minimumCompanyConfidence: number;
        minimumWebsiteConfidence: number;
        inputTokensPerRun: number;
        outputTokensPerRun: number;
    };
    automation?: {
        availableSegments?: string[];
        defaultCity?: string;
        defaultState?: string;
        cities?: string[];
        states?: string[];
        segments?: string[];
    };
    profile: ScoutSearchProfile;
    recentRuns: ScoutRun[];
    metrics: {
        analyzed: number;
        created: number;
        reviews: number;
        duplicates: number;
        rejected: number;
    };
    reviewItems: Array<{
        id: string;
        opportunityId?: string | null;
        opportunityStatus?: string | null;
        companyName?: string | null;
        websiteCandidate?: string | null;
        companyConfidence: number;
        websiteConfidence: number;
        combinedConfidence?: number | null;
        channels: Array<{ type: string; value: string; confidence: number; status: string }>;
        possibleDecisionMakers: Array<{
            name?: string | null;
            role?: string | null;
            confidence: number;
            status: string;
        }>;
        missingSignals: string[];
        nonPromotionReason: string;
        recommendedAction: string;
        stage: string;
    }>;
}


export interface BrandPayload {
    companyName?: string;
    tradeName?: string;
    cnpj?: string;
    website?: string;
    domain?: string;
}

export interface BrandCandidate {
    id: string;
    displayName: string;
    normalizedName: string;
    confidence: number;
    status: string;
    isSelected: boolean;
    scoreBreakdown?: Array<{ reason: string }>;
}

export interface BrandEvidence {
    id: string;
    type: string;
    value: string;
    strength: string;
    weight: number;
}

export interface BrandIdentificationItem {
    id: string;
    brandIdentificationStatus: string;
    brandIdentificationConfidence?: number | null;
    normalizedPayload?: BrandPayload | null;
    rawPayload?: BrandPayload | null;
    brandCandidates?: BrandCandidate[];
    brandEvidences?: BrandEvidence[];
    opportunity?: {
        brandName?: string | null;
        companyName?: string | null;
        cnpj?: string | null;
    } | null;
}

export interface BrandIdentificationCounts {
    total?: number;
    identified?: number;
    review_required?: number;
    multiple_candidates?: number;
    not_found?: number;
    failed?: number;
}

export type TrademarkRisk = 'low' | 'medium' | 'high';

export interface TrademarkMatch {
    id: string;
    markName: string;
    processNumber: string;
    classes?: string[];
    ownerName?: string | null;
    processStatus: string;
    processStatusGroup: string;
    explanation?: string | null;
    combinedScore: number;
    riskContribution: TrademarkRisk;
}

export interface TrademarkQuery {
    id: string;
    queryType: string;
    rawQuery: string;
    normalizedQuery: string;
    resultCount: number;
    durationMs: number;
}

export interface TrademarkEvidence {
    id: string;
    title: string;
    description: string;
    strength: string;
}

export interface TrademarkScreening {
    id: string;
    brandName: string;
    companyName?: string | null;
    cnpj?: string | null;
    result?: string | null;
    finalRisk?: TrademarkRisk | null;
    finalConfidence?: number | null;
    matches?: TrademarkMatch[];
}

export interface TrademarkScreeningDetails extends TrademarkScreening {
    createdAt: string;
    baseVersion?: string | null;
    baseReferenceDate?: string | null;
    candidateClasses?: string[];
    queries?: TrademarkQuery[];
    evidences?: TrademarkEvidence[];
    reviewDecision?: string | null;
    reviewNotes?: string | null;
    reviewedAt?: string | null;
    opportunity?: {
        trademarkScreeningLocked: boolean;
    } | null;
}

export interface TrademarkCounts {
    total: number;
    lowRisk: number;
    mediumRisk: number;
    highRisk: number;
    reviewRequired: number;
    baseVersion: string;
}

export interface AsteryskoOpportunity {
    id: string;
    code?: string;
    brandName: string;
    companyName?: string | null;
    tradeName?: string | null;
    cnpj?: string | null;
    segment?: string | null;
    city?: string | null;
    state?: string | null;
    sourceType?: string | null;
    status: string;
    commercialPotential?: number | null;
    preliminaryViability?: number | null;
    protectionNeed?: number | null;
}

export interface OpportunityCounts {
    total: number;
    review: number;
    qualified: number;
    sent_to_crm: number;
    discarded: number;
    captured: number;
    processing: number;
    doNotContact: number;
}

export interface OpportunityListResponse {
    items: AsteryskoOpportunity[];
    pagination?: {
        totalPages?: number;
    };
}

export interface DuplicateWarning {
    hasDuplicates: boolean;
    warnings: Array<{ message: string }>;
}

export type DecisionMakerResult =
    | 'person_identified' | 'role_only_identified' | 'multiple_candidates'
    | 'partial' | 'review_required' | 'no_candidate_found' | 'failed';

export interface DecisionMakerEvidence {
    id: string;
    type: string;
    source: string;
    url?: string | null;
    value: string;
    roleTitle?: string | null;
    department?: string | null;
    strength: string;
    weight: number;
    pageTitle?: string | null;
    sanitizedSnippet?: string | null;
    publishedAt?: string | null;
}

export interface DecisionMakerCandidate {
    id: string;
    candidateType: 'person' | 'role' | 'department';
    fullName?: string | null;
    roleTitle?: string | null;
    roleCategory: string;
    department?: string | null;
    seniority: string;
    authorityLevel: string;
    decisionRelevance: string;
    employmentStatus: string;
    companyAlignment: string;
    confidence: number;
    rank: number;
    status: string;
    privacyClassification: string;
    warnings?: string[];
    evidences?: DecisionMakerEvidence[];
}

export interface DecisionMakerOpportunityRef {
    id: string;
    code?: string;
    brandName: string;
    companyName?: string | null;
    website?: string | null;
    domain?: string | null;
    decisionMakerEnrichmentLocked?: boolean;
}

export interface DecisionMakerAttempt {
    id: string;
    opportunityId?: string | null;
    sourceItemId?: string | null;
    status: string;
    finalResult?: DecisionMakerResult | null;
    finalConfidence?: number | null;
    candidateCount: number;
    pagesAnalyzed: number;
    cacheHit: boolean;
    dryRun: boolean;
    officialDomain?: string | null;
    officialWebsiteUrl?: string | null;
    createdAt: string;
    opportunity?: DecisionMakerOpportunityRef | null;
    candidates?: DecisionMakerCandidate[];
    evidences?: DecisionMakerEvidence[];
    _count?: { candidates: number; evidences: number };
}

export interface DecisionMakerAttemptList {
    attempts: DecisionMakerAttempt[];
    total: number;
    page: number;
    limit: number;
}

export interface DecisionMakerCounts {
    counts: {
        attempts: Array<{ status: string; _count: number }>;
        candidates: Array<{ candidateType: string; status: string; _count: number }>;
        accepted: number;
    };
    config: {
        enabled: boolean;
        dryRun: boolean;
        autoRun: boolean;
        autoAccept: boolean;
        externalProviders: boolean;
        searchProvider: boolean;
        llm: boolean;
    };
}
