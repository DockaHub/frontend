import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [actions, people, service, earnings, playbook, dashboard, taskList] = await Promise.all([
    read('modules/dashboard/components/allyo/AllyoTaskActions.tsx'),
    read('modules/dashboard/components/allyo/AllyoPeopleContent.tsx'),
    read('../backend/src/modules/allyo/allyo.service.ts'),
    read('modules/dashboard/components/allyo/AllyoEarningsView.tsx'),
    read('modules/dashboard/components/allyo/AllyoPlaybookView.tsx'),
    read('modules/dashboard/components/AllyoDashboard.tsx'),
    read('modules/dashboard/components/allyo/AllyoTasksView.tsx'),
]);

assert.doesNotMatch(actions, /credits\s*\*\s*12|1 crédito = 12 horas/, 'A tela de tarefa não pode manter o hardcode de 12h');
assert.doesNotMatch(people, /Cada booster reduz 24h|Após 16h: inicia/, 'As páginas de pessoas devem seguir a política canônica de SLA');
assert.match(service, /ALLYO_ALLOW_DEMO_FALLBACK/, 'Fallback demonstrativo precisa ser explícito');
assert.match(earnings, /payableTaskIdsAfterStackClosure/, 'Ganhos devem depender do fechamento integral da Stack');
assert.match(earnings, /booster\?\.approvedUnits/, 'Relatório de ganhos deve contabilizar Boosters reais');
assert.match(playbook, /ALLYO_PLATFORM_GUIDE_IDS/, 'Guias da Plataforma Allyo não podem ser placeholders');
assert.match(dashboard, /case 'metrics':\s*return <AllyoMetricsView/, 'Métricas devem estar disponíveis aos papéis operacionais');
for (const feature of ['Buscar tarefa', 'Especialidade', 'Ordenação', 'Colunas', 'localStorage']) {
    assert.match(taskList, new RegExp(feature), `Lista de tarefas deve implementar: ${feature}`);
}

console.log('Alinhamento Allyo: SLA, Stack, Booster, métricas, guias e lista de tarefas validados.');
