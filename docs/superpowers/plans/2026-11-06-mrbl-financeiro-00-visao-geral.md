# MRBL Financeiro — Visão geral do projeto

> Documento-mãe. Cada fase tem o próprio plano executável em `docs/superpowers/plans/`. Só o plano 01 está detalhado agora; os seguintes são escritos ao fim da fase anterior, a partir do que a fase anterior entregou de verdade.

**Objetivo:** transformar o protótipo (artefato "MRBL A Pagar", versão 57, cópia em `reference/mock.html`) num sistema de verdade, com login por usuário, dados no Google Sheets "Financeiro MRBL" e código no GitHub.

**Planilha de dados:** `1fm5bpU5LTHD5VB2_tCFLZi_eU-rS-6Eu2usUapEOL14` (Google Sheets "Financeiro MRBL", dono contato@rslconsultoria.com). Hoje vazia.

**Decisão confirmada (06/11/2026):** o Google Sheets passa a ter tudo, inclusive despesas e entradas da DRE. O SharePoint da DRE não é tocado e não há integração com ele.

---

## 1. Arquitetura

```
 Navegador (Lucca, Viviane, Cris)
   │  HTML/JS estático (Vite), hospedado a partir do GitHub
   │  fetch POST  text/plain  { acao, token, dados }
   ▼
 Google Apps Script — Web App ("Executar como: eu", "Acesso: qualquer pessoa")
   │  roteador de ações · login próprio (senha com hash) · trava de escrita · logs · desfazer
   ▼
 Google Sheets "Financeiro MRBL" — uma aba por tabela, Logs sempre a última aba
```

Por que assim:

- **Apps Script como servidor** fica dentro da conta Google que já é dona da planilha: nenhuma chave de serviço guardada em lugar nenhum, nenhum servidor pago. É o mesmo tipo de automação que já roda na aba PREVISÕES da DRE antiga.
- **O navegador nunca fala direto com a planilha.** Toda leitura e escrita passa pelo Apps Script, que confere a sessão antes. A URL do Web App é pública, então a segurança está no login próprio (seção 4).
- **Front estático no GitHub**: o código fica versionado, com deploy automático a cada push na `main`.
- **Mesmo modelo de estado do protótipo**: ao entrar, o app carrega tudo (o volume é pequeno: ~1.600 despesas/ano) e cada ação vira uma chamada de escrita. Isso permite portar as telas do protótipo quase como estão.

Limites conhecidos do Apps Script (adequados para 3 usuários): cada chamada leva de 0,5 a 2 s; 30 execuções simultâneas; 6 min por execução. Com isso, a interface atualiza na hora (otimista) e confirma com o servidor por trás; se o servidor recusar, desfaz na tela e avisa.

### Hospedagem do front

GitHub Pages só publica repositório **privado** em planos pagos (Pro/Team). Como é sistema financeiro, o repositório deve ser privado:

- organização `RSLConsultoria` com plano pago → **GitHub Pages**, que é o caminho do plano 01;
- plano Free → **Cloudflare Pages** ligado ao repositório privado (grátis, mesmo build `npm run build`, pasta `dist`). Só muda a tarefa de deploy.

Nenhum dado fica no front: mesmo que o código vazasse, os dados continuam protegidos pelo login.

---

## 2. Abas da planilha (esquema)

Datas são guardadas como texto `aaaa-mm-dd` (coluna formatada como texto) para não sofrer com fuso horário. Valores são números. Booleanos são `TRUE`/`FALSE`. A coluna-chave de cada aba está em **negrito**.

| Aba | Colunas | Para quê |
|---|---|---|
| Usuarios | **nome**, convite, salt, hash, ativo, criadoEm | quem entra no sistema |
| Sessoes | **token**, usuario, expira | sessões abertas (12 h) |
| Contas | **id**, data, orig, forn, cat, sub, valor, estim, pago, pagoEm, dreId, dreSkip, entrega, recebidoEm, payManual, criadoEm, criadoPor | contas a pagar e oficinas |
| ContasHist | **id**, contaId, em, por, tipo, de, para, txt | linha do tempo de cada conta (prorrogações, entregas, observações) |
| Despesas | **id**, data, cat, sub, emp, valor, forn, resp, obs, contaId, criadoEm | saídas da DRE (antiga BASE_DESPESAS) |
| Entradas | **id**, data, cat, cli, nf, valor, resp, obs, criadoEm | entradas da DRE (antiga BASE_ENTRADAS) |
| DreHistorico | mes, tipo, cat, sub, valor | jan–jun/2026 consolidado (aba DRE 2026 antiga) |
| Previsoes | **id**, mes, nome, cat, subs, valor | previsões por mês (`subs` separadas por `;`) |
| PrevRevisao | mes, chave, decisao, em, por | respostas ao "mês fechou, usar a média?" |
| Fornecedores | **id**, nome, cat, sub | listas de fornecedores por categoria |
| Listas | tipo, cat, sub | categorias e subcategorias (despesa e entrada) |
| Clientes | **nome** | lista de clientes das entradas |
| Config | **chave**, valor | prazo das oficinas (15), saldo inicial de janeiro etc. |
| Logs | em, por, tela, txt | quem fez o quê; **sempre a última aba** |

Regras que vêm do protótipo e viram regra de servidor:

- Recebimento MRBL e Recebimento STOFFA não entram na DRE (mesma fórmula da aba DRE 2026 antiga: tudo menos essas duas).
- Nada vai para Despesas automaticamente: o pago em Contas a pagar só vira sugestão (Usar/Descartar). Toda despesa é registrada por alguém logado, e o responsável é sempre o usuário da sessão, nunca um campo livre.
- Fornecedor digitado que não está na lista entra em Fornecedores ao salvar.
- Toda ação de escrita gera uma linha em Logs.

---

## 3. Fases (um plano por fase)

| # | Plano | Entrega testável |
|---|---|---|
| 01 | **Fundação** (detalhado) | repositório, esquema da planilha criado por script, servidor Apps Script com login, sessão, logs e desfazer, front com tela de login e menu, deploy automático. Lucca entra no sistema publicado e o login aparece na aba Logs. |
| 02 | Carga inicial | scripts que leem a DRE (BASE_DESPESAS, BASE_ENTRADAS, aba DRE 2026 para jan–jun), o relatório semanal mais recente e as previsões, e gravam na planilha. Conferência de totais por mês contra a planilha de origem antes de liberar. |
| 03 | Contas a pagar + Oficinas | as duas telas portadas do protótipo: semana, calendário, pagar, prorrogar só vencida/hoje, antecipada × prorrogada, modais com linha do tempo e observação, chegada da oficina e pagamento 15 dias depois, busca. |
| 04 | Prorrogadas + Relatório | janela de 4 meses; relatório Nov/Dez com recorte; PDF no formato aprovado na versão 23 (resumo com versões, o que mudou, saídas por semana, bloco especial, lista por semana e dia). |
| 05 | DRE + DRE lançamentos | DRE do ano todo com acumulado, faturamento mês a mês, exportação Excel; lançamentos com Usar/Descartar, despesa vermelha e entrada verde, histórico só leitura, exportação Excel. |
| 06 | Configurações + go-live | listas de fornecedores, previsões (grade do ano, importação Excel com prévia), usuários (convite, redefinir senha), logs paginados (15 por página). QA completo, treinamento das três usuárias, virada. |

Cada fase termina com o sistema publicado e utilizável até onde foi.

---

## 4. Segurança

- **Senha:** nunca guardada; só `hash = SHA-256 iterado(salt + senha + PEPPER)`. O `PEPPER` fica nas Propriedades do Script, fora da planilha.
- **Primeiro acesso com convite:** como a URL é pública, quem ainda não tem senha só cria a senha informando o **código de convite** gerado pelo administrador (coluna `convite`). Sem isso, qualquer pessoa que descobrisse a URL poderia "assumir" um usuário sem senha.
- **Tentativas:** 5 erros de senha seguidos bloqueiam aquele usuário por 15 minutos.
- **Sessão:** token aleatório de 72 caracteres, válido por 12 h, guardado no navegador. "Sair" apaga do servidor.
- **Planilha:** compartilhada só com contato@rslconsultoria.com. Ninguém precisa abrir a planilha para usar o sistema.

---

## 5. Claude Code ou aqui?

Dá para fazer **aqui mesmo**: esta conversa roda sobre o Claude Code na nuvem, com terminal, Node, testes e acesso ao GitHub da RSLConsultoria (escrever o código, rodar os testes, abrir pull request). O plano funciona igual nos dois lugares.

O que precisa de você, nos dois casos, porque exige o seu login Google ou GitHub no navegador (uma vez só, ~15 min, passo a passo no plano 01, tarefa 9):

1. criar o repositório privado `RSLConsultoria/mrbl-financeiro` (ou me autorizar a usar um que você criar);
2. abrir a planilha › Extensões › Apps Script, colar o ID do script no repositório e autorizar o acesso à planilha;
3. publicar o Web App e colar a URL como variável do repositório;
4. gerar o `clasp` de deploy (`npx clasp login` no seu computador) e salvar como segredo do GitHub.

O Claude Code no seu computador ajuda quando você quiser testar contra a planilha real com o seu login (rodar `clasp` localmente). Para escrever e testar o código, aqui resolve.

---

## 6. Fora do escopo (por enquanto)

- Integração com o SharePoint da DRE antiga.
- Conferência de extratos bancários e parcelamentos (citados no início do projeto, ficam para depois do go-live).
- App de celular (o front já funciona no navegador do celular).
