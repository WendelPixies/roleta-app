# 📦 Guia: Enviar Projeto para o GitHub

## Passo 1: Inicializar o Repositório Git

```powershell
# Na pasta do projeto
cd f:\roleta\roleta-app

# Inicializar repositório Git
git init

# Configurar seu nome e email (se ainda não configurou)
git config user.name "Seu Nome"
git config user.email "seu-email@exemplo.com"
```

## Passo 2: Adicionar Arquivos ao Git

```powershell
# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "Configurar projeto para deploy na Vercel"
```

## Passo 3: Criar Repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique no botão **"+"** no canto superior direito
3. Selecione **"New repository"**
4. Preencha:
   - **Repository name**: `roleta-app` (ou o nome que preferir)
   - **Description**: (opcional) "Aplicativo de análise de roleta"
   - **Public** ou **Private**: escolha conforme sua preferência
   - **NÃO** marque "Initialize this repository with a README"
5. Clique em **"Create repository"**

## Passo 4: Conectar ao Repositório Remoto

Após criar o repositório no GitHub, você verá instruções. Use estas:

```powershell
# Adicionar o repositório remoto (substitua SEU-USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU-USUARIO/roleta-app.git

# Renomear branch para main (padrão do GitHub)
git branch -M main

# Enviar código para o GitHub
git push -u origin main
```

## Passo 5: Verificar no GitHub

Acesse `https://github.com/SEU-USUARIO/roleta-app` para ver seu código online!

---

## 🔄 Comandos para Atualizações Futuras

Após fazer alterações no código:

```powershell
# Adicionar arquivos modificados
git add .

# Fazer commit com mensagem descritiva
git commit -m "Descrição das alterações"

# Enviar para o GitHub
git push
```

---

## ⚠️ Problemas Comuns

### Erro de autenticação ao fazer push

Se você receber erro de autenticação, o GitHub não aceita mais senha. Use um **Personal Access Token**:

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token" > "Generate new token (classic)"
3. Dê um nome (ex: "Roleta App")
4. Marque o escopo **"repo"**
5. Clique em "Generate token"
6. **COPIE O TOKEN** (você só verá uma vez!)
7. Use o token como senha quando o Git pedir

### Ou use GitHub CLI (mais fácil)

```powershell
# Instalar GitHub CLI
winget install --id GitHub.cli

# Fazer login
gh auth login

# Criar repositório direto pela CLI
gh repo create roleta-app --public --source=. --push
```

---

## 🚀 Próximo Passo: Deploy na Vercel

Depois de enviar para o GitHub, siga o arquivo `DEPLOY_VERCEL.md` para fazer o deploy!
