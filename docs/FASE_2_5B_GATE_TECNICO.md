# Fase 2.5B — gate técnico de possíveis decisores

Data: 26/07/2026  
Estado: implementação concluída; gate persistente isolado pendente por indisponibilidade de PostgreSQL local aprovado. Produção permanece desativada.

## 1–10. Estado, arquitetura e modelagem

1. **Estado inicial:** backend e frontend já continham alterações não commitadas das Fases 2.1–2.5A. `git status`, `git diff`, `git diff --stat` e não rastreados foram auditados antes da primeira edição; nenhum arquivo anterior foi descartado.
2. **Diagnóstico:** `AsteryskoOpportunityContact` mistura identidade e canal comercial aceito e não serve como candidato técnico. `Contact` representa pessoas do workspace. Não havia stakeholder/decision maker reutilizável.
3. **Entidades reutilizadas:** Organization, User, Opportunity, SourceItem, OpportunityHistory, PageCache, BusinessContactEnrichmentAttempt/Candidate, scheduler e transporte HTTP oficial.
4. **Entidades criadas:** `AsteryskoDecisionMakerEnrichmentJob`, `AsteryskoDecisionMakerEnrichmentAttempt`, `AsteryskoDecisionMakerCandidate`, `AsteryskoDecisionMakerEvidence` e `AsteryskoOpportunityDecisionMaker`.
5. **Migration:** `20260726180000_add_decision_maker_enrichment/migration.sql`, incremental e sem alteração de migrations antigas. Nenhum `db push`, `accept-data-loss` ou deploy foi executado.
6. **Taxonomia:** 14 categorias de papel: proprietário/fundador, sócio-administrador, liderança, PI, jurídico, marketing/marca, administração/operações, comercial, financeiro/compras, atendimento, tecnologia, privacidade/compliance, outro e desconhecido.
7. **Relevância:** proprietário, fundador, sócio-administrador, PI e jurídico têm prioridade; direção/head de marketing também. Operações/compliance são secundários; comercial/financeiro são fallback; suporte/tecnologia sem atribuição de marca não são recomendados.
8. **Senioridade:** owner, founder, partner, C-level, VP, director, head, manager, coordinator, specialist, analyst, assistant, department e unknown.
9. **Atualidade:** current_confirmed requer linguagem atual em fonte oficial; current_probable é preservado como provável; `ex-`, notícia antiga ou saída de cargo geram historical/outdated; conflito nunca é silenciado.
10. **Separação conceitual:** pessoa, cargo, departamento, canal empresarial, candidato técnico e possível decisor manualmente confirmado são registros distintos.

## 11–20. Fontes, extração, privacidade e score

11. **Fontes permitidas:** homepage e páginas oficiais de equipe, liderança, governança, institucional, jurídico, privacidade, imprensa, notícias e contato; JSON-LD Person/founder/employee; dados empresariais já autorizados.
12. **Fontes bloqueadas:** LinkedIn, Instagram, Facebook, X/Twitter, conteúdo autenticado, CAPTCHA, diretórios não autorizados, scraping social e portais protegidos.
13. **Extração determinística:** headings/cards, padrões pessoa–cargo e cargo–pessoa, JSON-LD e departamentos sem pessoa. A fase funciona sem LLM.
14. **Nomes:** NFC, espaços, honoríficos, sufixos profissionais e comparação sem acentos. Iniciais continuam ambíguas; sobrenome/gênero nunca são inferidos.
15. **Cargos:** original e normalizado são preservados; categoria e senioridade são calculadas separadamente.
16. **Sócios:** apenas fontes empresariais já autorizadas podem contribuir; nenhum portal protegido ou CPF é consultado.
17. **Relação com 2.5A:** FK opcional para tentativa/candidato de canal, sem atribuir e-mail geral a uma pessoa.
18. **Privacidade:** CPF, e-mail e telefone são redigidos do snippet antes da persistência. possible_personal, sensitive, ambiguous_identity e unknown não podem ser aceitos.
19. **Deduplicação:** SHA-256 inclui tenant, oportunidade, identidade/função, cargo e domínio. Evidência usa URL, tipo e identidade. Homônimos de empresas diferentes não são fundidos.
20. **Scoring:** fonte oficial, alinhamento empresarial, relevância, senioridade, atualidade, contradição, histórico e privacidade são componentes independentes; score não afirma certeza pessoal.

## 21–30. Execução, concorrência, dry-run e API

21. **Thresholds:** alta 90, revisão 70, margem de múltiplos 8 e mínimo de uma evidência oficial; configuráveis por ambiente.
22. **Fingerprint de tentativa:** tenant + oportunidade/SourceItem + domínio + versão da regra; reprocessamento força nova identidade.
23. **Cache:** PageCache existente, TTL padrão de 168 horas, conteúdo estruturado e hash; HTML bruto não é armazenado.
24. **Jobs:** fila persistente própria compatível com o padrão SourceItem, com scheduledAt, tentativas, maxAttempts, lease, heartbeat, backoff e erro.
25. **Concorrência:** CAS no job, índice parcial de fingerprint ativo, unicidade candidato/tentativa e evidência/tentativa; aceite final tem unicidade tenant/oportunidade/identidade.
26. **Dry-run:** pode gravar somente job, tentativa, candidato, evidência, cache, log e histórico técnico. Opportunity não é atualizada e DecisionMaker confirmado não é criado.
27. **Endpoints:** 15 rotas sob `/asterysko/decision-maker-enrichments` para lista, counts, detalhe, run, dry-run, reprocessamento, candidatos, evidências, histórico, aceite, rejeição, manual, not-found, lock e unlock.
28. **Permissões:** o middleware `adminMiddleware` legado só autentica. A 2.5B usa guarda própria: global ADMIN ou OWNER/ADMIN do tenant; `organizationId` é obrigatório.
29. **Multi-tenant:** todas as leituras e mutações filtram tenant e validam attempt/candidate/opportunity/sourceItem conjuntamente.
30. **Observabilidade:** logs estruturados incluem tenant, oportunidade, SourceItem, attempt, job, domínio, resultado, confiança, duração, regra, dry-run, candidatos, páginas e cache; sem HTML, token, cookie ou segredo.

## 31–40. Interface e validações executadas

31. **Interface:** nova aba “Possíveis decisores” após “Canais empresariais”, com KPIs, filtros, paginação e estados de loading/erro/vazio.
32. **Detalhes:** empresa, resultado, confiança, candidatos, cargo, categoria, senioridade, relevância, vínculo, privacidade e evidências sanitizadas.
33. **Ações:** aceitar, editar e aceitar sem destruir original, rejeitar com motivo, bloquear, desbloquear, reprocessar, abrir website e abrir oportunidade. Nenhuma envia mensagem.
34. **Unitários:** 41/41 aprovados — normalização, taxonomia, JSON-LD, páginas, histórico, externo, departamento, dedup e resultados.
35. **Segurança:** 23/23 aprovados — SSRF IPv4/IPv6/metadata/notações, esquema, porta, credenciais, redes sociais, domínio, XSS, CPF e prompt injection.
36. **Integração persistente:** não executada. O datasource Railway não contém a migration 2.5B e foi preservado; o PostgreSQL efêmero solicitado em `/private/tmp` foi bloqueado pela política de instalação de dependência externa.
37. **Concorrência persistente:** implementação coberta estruturalmente por CAS/uniques, mas o teste PostgreSQL `Promise.all` aguarda banco isolado com a migration aplicada.
38. **Benchmark puro:** 10.000 registros, 530 ms, 18.882 registros/s, zero I/O e zero falhas.
39. **Benchmark persistente/HTTP:** pendentes pelo mesmo banco isolado. O transporte HTTP compartilhado já tem sua suíte 2.5A; a 2.5B não enfraqueceu as proteções.
40. **Prisma:** `validate`, `generate` e geração SQL do schema desde vazio (95.217 bytes, 305 statements estruturais) aprovados.

## 41–50. Gates finais, delta, flags e riscos

41. **Banco vazio:** não aprovado nesta sessão; nenhum PostgreSQL local estava instalado e a instalação efêmera não recebeu autorização de política.
42. **Schema drift:** `migrate status` confirmou 2.5B pendente e divergência histórica alheia ao módulo no Railway (migrations legadas de outro produto registradas no mesmo banco). Nenhuma correção destrutiva foi tentada.
43. **TypeScript backend:** `npx tsc --noEmit` e `npm run build` aprovados.
44. **Frontend:** `typecheck:asterysko` com zero erros; build Vite aprovado.
45. **Regressão global:** 197/197 diagnósticos, zero no escopo Asterysko; baseline não foi elevado.
46. **Delta operacional:** a tabela de decisores ainda não existe no Railway; portanto zero decisores 2.5B aceitos. A fase não criou contatos, leads ou mensagens. A suíte legada limpou fixtures das organizações `org_test_norm_a/b` antes de parar na migration pendente; contadores após cleanup: opportunities 19, contacts 1, deals 9, clients 5, processes 6, invoices 4, activities 33, notifications 12 e messages 15.
47. **Cleanup:** não há fixture 2.5B, job, tentativa, candidato, evidência ou cache criado. O diretório efêmero não chegou a receber instalação.
48. **Flags reais:** enabled=false, dry-run=true, auto-run=false, auto-accept=false, providers/search/LLM=false; limites documentados no `.env.example`. Ausência no ambiente mantém defaults seguros.
49. **Riscos remanescentes:** aplicar a migration apenas em banco isolado/staging, executar testes persistentes/concorrrentes/HTTP e reconciliar o histórico global de migrations antes de qualquer rollout.
50. **Fase 2.6:** não iniciada. A 2.5B só expõe dados técnicos e confirmação humana futura; não há priorização, CRM, contato ou comunicação automática.

## Resultado do gate

O código da Fase 2.5B está implementado e os gates estáticos, unitários, de segurança, TypeScript e builds passaram. O gate técnico final permanece **condicional**, não aprovado para staging/produção, até que migrations e testes persistentes sejam executados em PostgreSQL isolado. Produção segue desativada.
