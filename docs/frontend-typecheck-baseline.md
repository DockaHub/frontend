# Baseline de typecheck do frontend

Data da medição: 2026-07-26 (America/Fortaleza)  
Comando: `npx tsc --noEmit --pretty false`

## Resultado vigente

- Erros globais: **197**
- Arquivos afetados: **55**
- Erros em `modules/dashboard/components/asterysko/**`: **0**
- Erros em `modules/asterysko/**`: **0**
- Erros na dependência direta `context/AuthContext.tsx`: **0**
- Resultado esperado do typecheck global: exit code diferente de zero enquanto a dívida abaixo existir.

O baseline registra a dívida; ele não é usado para excluir arquivos ou suprimir diagnósticos. O gate
`npm run typecheck:asterysko` continua sendo estrito e deve terminar com zero erros.

## Inventário anterior às correções

A primeira execução encontrou **275 erros em 75 arquivos**:

- 75 erros em 18 arquivos de `modules/dashboard/components/asterysko/**`;
- 2 erros TS2345 em `context/AuthContext.tsx`, dependência compartilhada direta;
- 1 erro TS6133 em `modules/asterysko/public/WelcomePage.tsx`;
- 197 erros históricos fora do escopo Asterysko e de suas dependências diretas;
- dos 75 erros no subtree principal, 43 estavam em arquivos criados/alterados pelas Fases 2.1–2.5A
  ainda não consolidados e 32 já existiam em arquivos Asterysko rastreados.

Classificação total do inventário: **43 erros introduzidos nas fases em fechamento** e **232
preexistentes**. Foram corrigidos os 43 erros das fases, os 32 erros históricos no subtree Asterysko,
os 2 erros da dependência direta e o erro da página pública Asterysko. Restaram os 197 diagnósticos
históricos abaixo.

Códigos no inventário inicial:

| Código | Quantidade |
| --- | ---: |
| TS6133 | 193 |
| TS2322 | 24 |
| TS2339 | 19 |
| TS2820 | 11 |
| TS2304 | 6 |
| TS2345 | 5 |
| TS2554 | 3 |
| TS7006 | 3 |
| TS18047 | 2 |
| TS2367 | 2 |
| TS18048 | 1 |
| TS2551 | 1 |
| TS2678 | 4 |
| TS6192 | 1 |

## Códigos no baseline vigente

| Código | Quantidade |
| --- | ---: |
| TS6133 | 124 |
| TS2322 | 23 |
| TS2339 | 17 |
| TS2820 | 11 |
| TS2304 | 6 |
| TS2678 | 4 |
| TS2345 | 3 |
| TS2554 | 3 |
| TS2367 | 2 |
| TS18048 | 1 |
| TS2551 | 1 |
| TS6192 | 1 |
| TS7006 | 1 |

## Agrupamento por módulo

| Módulo/grupo | Erros |
| --- | ---: |
| dashboard não Asterysko | 69 |
| components compartilhados/admin/auth | 39 |
| constants.ts | 22 |
| mail | 18 |
| drive | 13 |
| chat | 11 |
| people | 6 |
| context não Asterysko | 5 |
| calendar | 4 |
| tasks | 4 |
| App.tsx | 3 |
| meet | 3 |
| Asterysko | **0** |

## Arquivos afetados no baseline vigente

<details>
<summary>55 arquivos e respectivas quantidades</summary>

- `App.tsx`: 3
- `components/admin/AdminView.tsx`: 1
- `components/admin/MailboxManager.tsx`: 13
- `components/admin/UserManager.tsx`: 2
- `components/auth/ForcePasswordChange.tsx`: 1
- `components/auth/RoleGuard.tsx`: 1
- `components/common/CommandPalette.tsx`: 7
- `components/NotificationPanel.tsx`: 2
- `components/Sidebar.tsx`: 1
- `components/UnifiedSidebar.tsx`: 11
- `constants.ts`: 22
- `context/CallContext.tsx`: 5
- `modules/calendar/CalendarLayout.tsx`: 3
- `modules/calendar/components/CalendarGrid.tsx`: 1
- `modules/chat/ChatLayout.tsx`: 2
- `modules/chat/components/ChatSidebar.tsx`: 1
- `modules/chat/components/ChatStream.tsx`: 5
- `modules/chat/components/MessageActionsToolbar.tsx`: 3
- `modules/dashboard/components/AsteryskoDashboard.tsx`: 3
- `modules/dashboard/components/docka/DockaBillingView.tsx`: 2
- `modules/dashboard/components/docka/DockaEcosystemView.tsx`: 4
- `modules/dashboard/components/docka/DockaFormsView.tsx`: 9
- `modules/dashboard/components/docka/DockaGroupFinanceView.tsx`: 1
- `modules/dashboard/components/docka/DockaOverviewView.tsx`: 5
- `modules/dashboard/components/fauves/EventImporter.tsx`: 4
- `modules/dashboard/components/fauves/FinanceView.tsx`: 2
- `modules/dashboard/components/GenericDashboard.tsx`: 3
- `modules/dashboard/components/hostizi/HostiziClientsView.tsx`: 6
- `modules/dashboard/components/hostizi/HostiziDomainsView.tsx`: 1
- `modules/dashboard/components/hostizi/HostiziFinancialView.tsx`: 6
- `modules/dashboard/components/hostizi/HostiziHostingView.tsx`: 2
- `modules/dashboard/components/hostizi/HostiziSupportView.tsx`: 4
- `modules/dashboard/components/hostizi/HostiziWebmailView.tsx`: 3
- `modules/dashboard/components/tokyon/TokyonClientsView.tsx`: 6
- `modules/dashboard/components/tokyon/TokyonOverviewView.tsx`: 3
- `modules/dashboard/components/umachave/UmaChaveContractsView.tsx`: 2
- `modules/dashboard/components/umachave/UmaChaveFinanceView.tsx`: 2
- `modules/dashboard/DashboardLayout.tsx`: 1
- `modules/drive/components/DriveGrid.tsx`: 2
- `modules/drive/components/FilePreviewModal.tsx`: 10
- `modules/drive/components/ShareItemModal.tsx`: 1
- `modules/mail/components/MailboxSettingsModal.tsx`: 11
- `modules/mail/components/MailList.tsx`: 1
- `modules/mail/components/MailReader.tsx`: 2
- `modules/mail/components/MailSidebar.tsx`: 1
- `modules/mail/MailLayout.tsx`: 3
- `modules/meet/components/ActiveCall.tsx`: 1
- `modules/meet/components/MeetRoom.tsx`: 1
- `modules/meet/MeetHome.tsx`: 1
- `modules/people/components/PeopleGrid.tsx`: 1
- `modules/people/components/ProfilePanel.tsx`: 3
- `modules/people/PeopleLayout.tsx`: 2
- `modules/tasks/components/TaskDetailModal.tsx`: 1
- `modules/tasks/components/TasksList.tsx`: 2
- `modules/tasks/TasksLayout.tsx`: 1

</details>

## Regra de regressão

`npm run check:asterysko-regression` confirma, em sequência:

1. typecheck isolado Asterysko com zero erros;
2. nenhum diagnóstico global nos paths Asterysko ou em `AuthContext.tsx`;
3. total global menor ou igual a 197;
4. build Vite completo aprovado.

O limite só pode ser reduzido quando erros históricos forem corrigidos; não deve ser aumentado para
acomodar regressões.
