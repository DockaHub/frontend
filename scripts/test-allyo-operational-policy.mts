import assert from 'node:assert/strict';
import { calculateAllyoSlaHours, normalizeAllyoTaskStatus, payableTaskIdsAfterStackClosure } from '../modules/dashboard/components/allyo/allyoOperationalPolicy.ts';

assert.equal(calculateAllyoSlaHours({ credits: 1.2, slaHours: 12 }), 24);
assert.equal(calculateAllyoSlaHours({ credits: 5, slaHours: 12, revisionNumber: 2, category: 'Design' }), 8);
assert.equal(calculateAllyoSlaHours({ credits: 5, slaHours: 12, revisionNumber: 2, category: 'Motion' }), 24);
assert.equal(calculateAllyoSlaHours({ credits: 2, slaHours: 10, boosterUnits: 1 }), 10);
assert.equal(normalizeAllyoTaskStatus('cancelado'), 'Inativa');
assert.equal(normalizeAllyoTaskStatus('status desconhecido'), 'Bloqueada');

const openStack = payableTaskIdsAfterStackClosure([
    { id: 'copy', status: 'Concluído' },
    { id: 'design', status: 'Em andamento', dependsOn: ['copy'] },
]);
assert.equal(openStack.size, 0, 'Nenhum crédito da Stack deve ser pago antes do fechamento integral');

const closedStack = payableTaskIdsAfterStackClosure([
    { id: 'copy', status: 'Concluído' },
    { id: 'design', status: 'Concluída', dependsOn: ['copy'] },
]);
assert.deepEqual([...closedStack].sort(), ['copy', 'design']);

const standalone = payableTaskIdsAfterStackClosure([{ id: 'banner', status: 'Concluído' }]);
assert.deepEqual([...standalone], ['banner']);

console.log('Política de interface Allyo: status, SLA e fechamento de Stack validados.');
