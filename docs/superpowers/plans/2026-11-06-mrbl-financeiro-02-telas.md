# MRBL Financeiro — Plano 02: telas ligadas à planilha (executado em 06/11/2026)

> Substitui as fases 02 a 06 da visão geral no que diz respeito às telas: como o protótipo é um arquivo só, portar as sete telas de uma vez saiu mais simples e mais seguro do que portar tela a tela.

**Entregue**

1. **Servidor** (`apps-script/Sync.js`, `Carga.js`):
   - `dados.carregar` devolve tudo que as telas usam, mais os últimos 1.000 logs e a lista de usuários (com o convite pendente só para o administrador).
   - `sync.aplicar` recebe só o que mudou (`{ Contas: { up, del }, …, Config }`), grava em lote com trava e registra o log. O responsável de despesa e entrada é sempre o usuário da sessão; cliente novo entra em Clientes.
   - `usuarios.adicionar` e `usuarios.redefinir` (só administrador, `Config.admins`, padrão `["Lucca"]`) geram código de convite; redefinir encerra as sessões da pessoa.
   - `carga.importar`: só administrador e só com a planilha vazia.
   - Esquema: `Contas` ganhou `hist`, `histEnt`, `log` e `extra` (JSON); `Despesas` e `Entradas` ganharam `extra`; saíram `ContasHist`, `PrevRevisao` e `Listas` (a revisão de previsões fica em `Config.prevRevisao`).
2. **Telas** (`src/app/telas.js`): o código do protótipo v57, com o estado vindo do servidor. `save()` virou `sync.salvar()` (`src/app/sync.js`), que compara com a última gravação e manda só a diferença, em fila. Desfazer volta a tela e grava a volta. Ids aleatórios para duas pessoas não colidirem.
3. **Carga inicial** (`src/app/carga.js`): painel que aparece para o administrador enquanto a planilha está vazia; lê `carga-inicial.json` e chama `carga.importar`. O arquivo é gerado do protótipo privado e nunca entra neste repositório.

**Como foi testado**

- 40 testes (`npm test`).
- `tools/servidor-local.mjs` roda o servidor real sobre a planilha simulada; com a carga do protótipo, o texto de todas as telas ficou idêntico ao do protótipo (só saíram os avisos de "mock").
- Ações no navegador (pagar, prorrogar, nova conta, desfazer, chegada de oficina, Usar + registrar despesa, nova entrada, novo fornecedor) e recarga da página: tudo voltou igual da planilha, e cada ação apareceu no log com o usuário certo.

**Atualizar o servidor publicado** (enquanto não houver o segredo `CLASPRC_JSON`): colar os arquivos de `apps-script/` na ordem do `.clasp.json` em `Código.gs`, salvar, rodar `setupPlanilha` se o esquema mudou, e em Implantar › Gerenciar implantações › editar › Nova versão.
