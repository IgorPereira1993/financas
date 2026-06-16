# Supabase e Vercel

## 1. Script SQL para criar o banco no Supabase

O arquivo `supabase-schema.sql` já foi criado no projeto. Ele contém as tabelas que correspondem às entidades do app:
- `users`
- `categories`
- `credit_cards`
- `incomes`
- `expenses`
- `installment_groups`
- `financial_goals`

### Como usar
1. Acesse o painel do Supabase em https://app.supabase.com.
2. Crie um novo projeto e aguarde a provisão.
3. No projeto, abra `SQL Editor`.
4. Copie e cole o conteúdo de `supabase-schema.sql`.
5. Execute a query para criar as tabelas.

> Opcional: se quiser usar o CLI do Supabase, instale-o com `npm install -g supabase`.

Exemplo de uso do CLI:
```powershell
supabase login
supabase link --project-ref <PROJECT_REF>
# Depois abra o arquivo supabase-schema.sql e execute manualmente no editor do Supabase.
```

---

## 2. Como configurar deploy / versionamento no Vercel

### Passo 1: Colocar o projeto no Git
1. Crie um repositório remoto no GitHub, GitLab ou Bitbucket.
2. No projeto local, execute:
```powershell
git init
git add .
git commit -m "Inicial commit"
git branch -M main
git remote add origin <URL_DO_REPOSITORIO>
git push -u origin main
```

### Passo 2: Conectar o repositório ao Vercel
1. Acesse https://vercel.com.
2. Clique em `New Project` e conecte o repositório Git.
3. Escolha o projeto correto.

### Passo 3: Configurar build no Vercel
Use estas configurações padrão:
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

### Passo 4: Variáveis de ambiente (se usar Supabase)
No dashboard do Vercel, adicione as variáveis em `Project Settings > Environment Variables`:
- `VITE_SUPABASE_URL` = sua URL do Supabase
- `VITE_SUPABASE_ANON_KEY` = sua chave anônima do Supabase

> No app do Vite, as variáveis devem começar com `VITE_` para serem acessíveis no runtime.

### Passo 5: Versionamento no Vercel
O Vercel faz versionamento automaticamente com o Git:
- `main` (ou `master`) normalmente vira a produção
- branches criam deploys de preview
- cada commit/push gera uma nova versão

Se quiser controlar versões manualmente:
- crie branches nomeadas como `feature/...`, `fix/...`, `release/...`
- faça pull request / merge para `main`
- use tags Git para marcar versões, por exemplo `v1.0.0`

---

## Dica rápida
- Para rodar localmente: `npm install` e `npm run dev`
- Para deploy automático: fazer push para o Git conectado ao Vercel
- Para usar banco Supabase: crie o schema com `supabase-schema.sql` e configure as variáveis no Vercel
