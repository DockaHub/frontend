import { z } from 'zod';

const numeric = z.coerce.number().finite().catch(0);
const nonNegativeNumeric = z.coerce.number().finite().nonnegative().catch(0);
const percentNumeric = z.coerce.number().finite().min(0).max(100).catch(0);

export const overviewSnapshotSchema = z.object({
    gmv: numeric,
    platformRevenue: numeric,
    ticketsToday: numeric,
    courtesyTicketsToday: numeric,
    pendingWithdrawals: numeric,
    activeEvents: numeric,
    activeOrganizations: numeric,
    paymentMix: z.object({ pix: numeric, card: numeric }),
    revenueSeries: z.array(z.object({ label: z.coerce.string(), current: numeric, previous: numeric })).catch([]),
    integrations: z.array(z.object({
        name: z.coerce.string(),
        status: z.enum(['operational', 'degraded', 'offline']).catch('degraded'),
        latency: z.string().optional(),
    })).catch([]),
    activities: z.array(z.object({
        id: z.coerce.string(), type: z.coerce.string().catch('system'), title: z.coerce.string(),
        description: z.coerce.string().catch(''), createdAt: z.coerce.string(), amount: numeric.optional(),
    })).catch([]),
});

export const withdrawalSchema = z.object({
    id: z.coerce.string().min(1),
    organizationId: z.coerce.string().optional(),
    organizationName: z.coerce.string().min(1),
    eventName: z.coerce.string().optional(),
    amount: nonNegativeNumeric,
    status: z.string().min(1),
    pixKey: z.string().optional(),
    bankAccount: z.union([z.record(z.unknown()), z.string()]).optional(),
    requestedAt: z.string(),
    processedAt: z.string().optional(),
});

export const globalSettingsInputSchema = z.object({
    defaultPlatformFeePercent: percentNumeric,
    maintenanceMode: z.boolean(),
    credentials: z.object({
        efi: z.string().min(8).optional(),
        resend: z.string().min(8).optional(),
        r2: z.string().min(8).optional(),
    }).optional(),
});

export const adminActionSchema = z.object({
    resource: z.enum(['organizations', 'events', 'users', 'orders', 'withdrawals', 'tickets']),
    id: z.string().min(1),
    action: z.string().min(2).regex(/^[a-z0-9-]+$/),
    payload: z.record(z.unknown()),
});
