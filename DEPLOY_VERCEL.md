# Deploy na Vercel

Este projeto está configurado para deploy automático na Vercel.

## Opção 1: Deploy via Interface Web da Vercel (Recomendado)

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Add New Project"
3. Importe o repositório do GitHub/GitLab/Bitbucket
4. A Vercel detectará automaticamente que é um projeto Vite
5. Clique em "Deploy"

## Opção 2: Deploy via CLI da Vercel

### Instalação da CLI

```bash
npm install -g vercel
```

### Deploy

```bash
# Na pasta roleta-app
cd roleta-app

# Login na Vercel (apenas na primeira vez)
vercel login

# Deploy de produção
vercel --prod

# Ou deploy de preview
vercel
```

## Configurações

O arquivo `vercel.json` já está configurado com:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: Vite
- **Rewrites**: Configurado para SPA (Single Page Application)

## Variáveis de Ambiente

Se o projeto usar variáveis de ambiente, adicione-as no painel da Vercel:
1. Acesse o projeto na Vercel
2. Vá em Settings > Environment Variables
3. Adicione as variáveis necessárias

## Build Local (Teste antes do deploy)

```bash
npm run build
npm run preview
```

## Domínio Customizado

Após o deploy, você pode adicionar um domínio customizado:
1. Acesse o projeto na Vercel
2. Vá em Settings > Domains
3. Adicione seu domínio
