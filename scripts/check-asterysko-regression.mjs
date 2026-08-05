import { spawnSync } from 'node:child_process';

const GLOBAL_ERROR_BASELINE = 197;
const ASTERYSKO_PATHS = [
    'modules/dashboard/components/asterysko/',
    'modules/asterysko/',
    'context/AuthContext.tsx',
];

const run = (command, args, capture = false) => spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
});

const isolated = run('npm', ['run', 'typecheck:asterysko']);
if (isolated.status !== 0) {
    process.exit(isolated.status ?? 1);
}

const global = run('npx', ['tsc', '--noEmit', '--pretty', 'false'], true);
const globalOutput = `${global.stdout ?? ''}${global.stderr ?? ''}`;
const diagnostics = globalOutput.split(/\r?\n/).filter(line => /error TS\d+/.test(line));
const scopedDiagnostics = diagnostics.filter(line => ASTERYSKO_PATHS.some(path => line.includes(path)));

if (scopedDiagnostics.length > 0) {
    console.error(scopedDiagnostics.join('\n'));
    console.error(`Regressão: ${scopedDiagnostics.length} erro(s) no escopo Asterysko.`);
    process.exit(1);
}

if (diagnostics.length > GLOBAL_ERROR_BASELINE) {
    console.error(
        `Regressão: typecheck global passou de ${GLOBAL_ERROR_BASELINE} para ${diagnostics.length} erros.`
    );
    process.exit(1);
}

const build = run('npm', ['run', 'build']);
if (build.status !== 0) {
    process.exit(build.status ?? 1);
}

console.log(
    `Gate Asterysko aprovado: 0 erros isolados, ${diagnostics.length}/${GLOBAL_ERROR_BASELINE} erros globais e build aprovado.`
);
