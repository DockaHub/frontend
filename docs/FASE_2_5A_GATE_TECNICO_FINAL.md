# Fase 2.5A — Gate técnico final

Data: 2026-07-26 (America/Fortaleza)  
Status: **APROVADO**  
Escopo: fechamento da Fase 2.5A; a Fase 2.5B não foi iniciada.

## 1. Quantidade total de erros globais encontrada

O inventário anterior a qualquer correção encontrou **275 erros TypeScript em 75 arquivos**.
Os códigos e o inventário detalhado estão em
[`frontend-typecheck-baseline.md`](./frontend-typecheck-baseline.md).

## 2. Erros dentro da Asterysko antes

- `modules/dashboard/components/asterysko/**`: 75 erros em 18 arquivos;
- `modules/asterysko/public/WelcomePage.tsx`: 1 erro;
- dependência compartilhada direta `context/AuthContext.tsx`: 2 erros;
- 43 dos 75 erros do subtree principal estavam nos arquivos ainda não consolidados das Fases
  2.1–2.5A; 32 eram dívida de arquivos Asterysko rastreados anteriormente.

## 3. Erros dentro da Asterysko depois

**Zero** no subtree principal, na página pública Asterysko e nas dependências diretas incluídas no
gate. O typecheck isolado usa as mesmas opções estritas do frontend.

## 4. Arquivos Asterysko corrigidos

- Views existentes: `AsteryskoClientPortal`, `AsteryskoDealDetailsModal`,
  `AsteryskoFinancialView`, `AsteryskoHomeView`, `AsteryskoOverviewView`,
  `AsteryskoPerformanceView`, `AsteryskoProcessesView`, `AsteryskoResearchView`,
  `AsteryskoSettingsView` e `DealDetailsModal`;
- fluxo de oportunidades: `AsteryskoNewOpportunityModal` e `AsteryskoOpportunitiesTab`;
- identificação e screening: `AsteryskoTrademarkGovernanceArea`, `AsteryskoBrandDetailsModal`,
  `AsteryskoBrandIdentificationTab`, `AsteryskoTrademarkDetailsModal` e
  `AsteryskoTrademarkScreeningTab`;
- Fase 2.5A: `AsteryskoBusinessContactEnrichmentTab`,
  `AsteryskoBusinessContactDetailsModal` e `AsteryskoEngineModal`;
- superfície pública: `modules/asterysko/public/WelcomePage.tsx`;
- tipos fortes centralizados em `opportunities/asteryskoApiTypes.ts`.

Foram eliminados os diagnósticos de imports/estados/parâmetros não utilizados, tipos implícitos,
nulabilidade e incompatibilidades de props. Os componentes novos do fluxo 2.5A não possuem
`any`, `@ts-ignore` ou `@ts-nocheck`.

## 5. Dependências compartilhadas corrigidas

- `context/AuthContext.tsx`: normalização explícita da role recebida pela API para o union `User['role']`;
- `types.ts`: inclusão de `clientId?: string` em `KanbanCardData`.

Os demais arquivos compartilhados incluídos no gate já estavam válidos e não foram alterados.

## 6. Conteúdo do tsconfig isolado

Foi criado `tsconfig.asterysko.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": [
    "vite-env.d.ts",
    "modules/dashboard/components/asterysko/**/*.ts",
    "modules/dashboard/components/asterysko/**/*.tsx",
    "modules/asterysko/**/*.ts",
    "modules/asterysko/**/*.tsx",
    "services/api.ts",
    "context/AuthContext.tsx",
    "context/ToastContext.tsx",
    "components/DashboardPage.tsx",
    "components/OrganizationIconSettings.tsx",
    "components/common/Modal.tsx",
    "types.ts"
  ]
}
```

`strict`, `noUnusedLocals`, `noUnusedParameters`, target, libs, JSX, aliases e resolução de módulos
continuam herdados do `tsconfig.json`. `vite/client` limita os tipos ambientes ao runtime do
frontend; nenhuma verificação foi desligada e nenhum arquivo Asterysko foi excluído.

## 7. Scripts criados

```json
"typecheck:asterysko": "tsc --noEmit -p tsconfig.asterysko.json",
"check:asterysko-regression": "node scripts/check-asterysko-regression.mjs"
```

O segundo script executa typecheck isolado, confere o total global e os paths Asterysko e executa o
build completo. Qualquer regressão produz exit code diferente de zero.

## 8. Resultado do typecheck Asterysko

`npm run typecheck:asterysko`: **aprovado, zero erros**.

Validação explícita da Fase 2.5A:

- respostas de API, attempts, candidates e evidences possuem interfaces;
- status de tentativa/candidato, classificação de privacidade e validação possuem unions;
- estados de loading e erro estão representados nas abas e modais;
- ações de accept, reject, lock, unlock e reprocess usam os endpoints reais e tratamento de
  `unknown` com narrowing;
- inclusão manual exige attempt válido e a busca por oportunidade resolve primeiro a tentativa mais
  recente, sem construir IDs artificiais.

## 9. Resultado do build frontend

`npm run build`: **aprovado**; 2.900 módulos transformados.

Permanecem apenas warnings não bloqueantes e preexistentes de chunk principal grande e módulos
importados simultaneamente de forma estática e dinâmica. Não existe script de lint funcional no
`package.json`, portanto lint não foi executado.

## 10. Baseline global

Após as correções: **197 erros em 55 arquivos**, todos fora do escopo Asterysko e das dependências
diretas. O detalhamento versionado contém códigos, arquivos e agrupamento por módulo.

## 11. Confirmação de não aumento global

- inventário inicial: 275;
- baseline vigente: 197;
- variação: **-78**;
- limite automatizado: 197;
- `npm run check:asterysko-regression`: **aprovado (197/197)**.

Nenhum diagnóstico aparece em arquivo Asterysko modificado ou em `AuthContext.tsx`.

## 12. Resultado do backend

| Verificação | Resultado |
| --- | --- |
| `npx tsc --noEmit` | aprovado |
| `npm test` | **265/265**, zero falhas |
| testes específicos 2.5A dentro da suíte | **113/113** |
| `npm run build` | aprovado |
| `npx prisma validate` | schema válido |
| `npx prisma migrate status` | 12 migrations; banco atualizado |

Nenhuma migration foi executada e `prisma db push` não foi usado.

## 13. Feature flags

As flags seguras permanecem:

| Flag | Valor |
| --- | ---: |
| `ASTERYSKO_BUSINESS_CONTACT_ENRICHMENT_ENABLED` | `false` |
| `ASTERYSKO_BUSINESS_CONTACT_ENRICHMENT_DRY_RUN` | `true` |
| `ASTERYSKO_BUSINESS_CONTACT_ENRICHMENT_AUTO_RUN` | `false` |
| `ASTERYSKO_BUSINESS_CONTACT_ENRICHMENT_AUTO_ACCEPT` | `false` |

A tarefa não alterou arquivos de ambiente. Os valores coincidem com a configuração efetiva
homologada e com os defaults fail-safe do serviço.

## 14. Delta operacional

Contagens persistentes antes e após o gate:

| Entidade | Antes | Depois | Delta |
| --- | ---: | ---: | ---: |
| opportunities | 41 | 41 | 0 |
| opportunityContacts | 3 | 3 | 0 |
| deals | 10 | 10 | 0 |
| clients | 5 | 5 | 0 |
| processes | 6 | 6 | 0 |
| contracts | 4 | 4 | 0 |
| invoices | 4 | 4 | 0 |
| activities | 34 | 34 | 0 |
| notifications | 38 | 38 | 0 |
| messages | 15 | 15 | 0 |

Os testes criaram somente fixtures controladas e concluíram o cleanup. Delta operacional final:
**zero**.

## 15. Riscos remanescentes

- o typecheck global continua vermelho por 197 diagnósticos históricos fora do escopo;
- o bundle principal continua acima de 500 kB;
- componentes Asterysko antigos ainda contêm tipagem explícita histórica com `any`, embora não
  tenham diagnósticos e nenhuma supressão ou cast genérico tenha sido introduzido neste gate;
- a automação deve manter o limite global em 197 ou menor; aumentá-lo mascararia regressão.

Esses riscos não quebram a Fase 2.5A e não justificam ampliar este fechamento para os módulos
legados.

## 16. Recomendação sobre a Fase 2.5B

**A Fase 2.5A pode ser encerrada tecnicamente.** A Fase 2.5B pode ser iniciada em uma tarefa
separada, após revisão/commit deste gate, preservando as quatro flags seguras até que a próxima fase
tenha critérios próprios de ativação. Nenhum trabalho da Fase 2.5B foi iniciado aqui.
