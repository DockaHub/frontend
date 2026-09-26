import type { AllyoUser, AllyoUserCategory } from '../../../../services/allyoService';

export const ALLYO_CATEGORY_LABELS: Record<AllyoUserCategory, string> = {
    CREATIVE_EXCELLENCE_SR_MANAGER: 'Creative Excellence Sr. Manager',
    ADMIN_ATENDIMENTO: 'Admin Atendimento',
    ADMIN_CRIATIVO: 'Admin Criativo',
    CREATIVE_ACCOUNT_MANAGER: 'Creative Account Manager',
    CREATIVE_QUALITY_SPECIALIST: 'Creative Quality Specialist',
    CREATIVE_ACCOUNT_SUPPORT: 'Creative Account Support',
    CUSTOMER_SUPPORT: 'Customer Support',
    SQUAD_LEADER: 'Squad Leader',
    ATENDIMENTO: 'Atendimento',
    CRIATIVO: 'Criativo',
    CRIATIVO_SMB: 'Criativo SMB',
    ART_DIRECTOR: 'Art Director',
    CLIENTE: 'Cliente',
};

export const allyoUserRoleLabel = (user: AllyoUser) =>
    user.jobTitle?.trim() || user.categoryLabel?.trim() || ALLYO_CATEGORY_LABELS[user.category] || user.role?.trim() || 'Criativo';

export const isAssignableAllyoUser = (user: AllyoUser) =>
    user.category !== 'CLIENTE' && String(user.status || 'Ativo').toLocaleLowerCase('pt-BR') !== 'inativo';

export const normalizeAllyoPerson = (value: string) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR');
