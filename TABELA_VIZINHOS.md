# Tabela Completa de Vizinhos - Visão Geral

## 📋 Descrição

A **Tabela Completa de Vizinhos** oferece uma visão panorâmica de TODOS os números (0-36) e suas taxas de acerto para diferentes quantidades de vizinhos (2, 3, 4, 5 e 6), sem precisar selecionar cada número individualmente.

## 🎯 Como Usar

1. **Insira os números** no campo principal
2. Clique em **"Calcular e Simular"**
3. Vá para a aba **"Vizinhos na Roda"**
4. Configure a **Janela de Análise** (quantos giros seguintes analisar)
5. Clique no botão **"Gerar Tabela Completa (Todos os Números)"** (azul)

## 📊 Estrutura da Tabela

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Número** | Número da roleta (0-36) |
| **Ocorrências** | Quantas vezes o número apareceu na sequência |
| **2 Vizinhos** | Taxa de acerto com 2 vizinhos de cada lado |
| **3 Vizinhos** | Taxa de acerto com 3 vizinhos de cada lado |
| **4 Vizinhos** | Taxa de acerto com 4 vizinhos de cada lado |
| **5 Vizinhos** | Taxa de acerto com 5 vizinhos de cada lado |
| **6 Vizinhos** | Taxa de acerto com 6 vizinhos de cada lado |

### Linhas

- **37 linhas** (uma para cada número de 0 a 36)
- Ordenadas numericamente de 0 a 36

## 🎨 Código de Cores

### Percentuais
- **Verde (≥70%)**: Excelente taxa de acerto - Alta probabilidade
- **Laranja (≥50%)**: Boa taxa de acerto - Probabilidade moderada
- **Branco (<50%)**: Taxa normal

### Destaques
- **🏆 Troféu**: Indica a MELHOR quantidade de vizinhos para aquele número específico
- **Fundo verde claro**: Destaca a célula com melhor desempenho em cada linha
- **-** (traço): Número não apareceu na sequência analisada

## 💡 Como Interpretar

### Exemplo de Linha

```
Número | Ocorrências | 2 Viz | 3 Viz | 4 Viz | 5 Viz | 6 Viz
  13   |     5       | 40.0% | 60.0% | 80.0%🏆| 80.0% | 80.0%
```

**Interpretação:**
- O número **13** apareceu **5 vezes** na sequência
- Com **4 vizinhos** teve a melhor taxa: **80%** 🏆
- Isso significa que em 80% das vezes que o 13 saiu, algum de seus vizinhos (com k=4) apareceu no próximo giro

### Análise Estratégica

1. **Identifique números frequentes** (coluna "Ocorrências")
2. **Veja qual quantidade de vizinhos** tem melhor desempenho (🏆)
3. **Compare percentuais** entre diferentes números
4. **Foque nos verdes** (≥70%) para estratégias mais agressivas

## 🔍 Casos de Uso

### 1. Encontrar Padrões Globais
Veja rapidamente quais números têm **consistentemente** altas taxas de acerto, independente da quantidade de vizinhos.

### 2. Otimizar Estratégia por Número
Para cada número, identifique a **quantidade ideal de vizinhos** para apostar.

### 3. Comparar Desempenho
Compare lado a lado como diferentes números se comportam com a mesma quantidade de vizinhos.

### 4. Identificar Números "Quentes"
Números com **muitas ocorrências** e **altos percentuais** são candidatos para apostas.

## 📈 Exemplo Prático

### Sequência de Teste
```
13 1 28 36 36 14 15 27 22 25 13 28 36 4 8 1 18 2 29 8 7 18 13 21 0 12 27 5 24 36 34 28
```

### Resultado Esperado

| Número | Ocorrências | 2 Viz | 3 Viz | 4 Viz | 5 Viz | 6 Viz |
|--------|-------------|-------|-------|-------|-------|-------|
| 13     | 3           | 66.7% | 100%🏆| 100%  | 100%  | 100%  |
| 28     | 3           | 66.7% | 100%🏆| 100%  | 100%  | 100%  |
| 36     | 4           | 75.0% | 100%🏆| 100%  | 100%  | 100%  |

**Insight:** Os números 13, 28 e 36 têm **excelente desempenho** com 3+ vizinhos!

## ⚙️ Configurações

### Janela de Análise
- **1 giro**: Mais restritivo, mostra correlação imediata
- **2-3 giros**: Equilíbrio entre precisão e taxa de acerto
- **4+ giros**: Mais permissivo, percentuais maiores

### Quantidade de Vizinhos
- **2 vizinhos**: 5 números no conjunto (centro + 2 esq + 2 dir)
- **3 vizinhos**: 7 números no conjunto
- **4 vizinhos**: 9 números no conjunto
- **5 vizinhos**: 11 números no conjunto
- **6 vizinhos**: 13 números no conjunto

## 🎯 Dicas de Uso

1. **Comece com janela = 1**: Veja correlações imediatas
2. **Procure por 🏆**: Indica a configuração ótima para cada número
3. **Foque nos verdes**: Taxas ≥70% são muito promissoras
4. **Compare números similares**: Veja se números próximos na roda têm padrões similares
5. **Use com outras análises**: Combine com a análise de padrões automáticos

## 📊 Vantagens

✅ **Visão completa** de todos os números de uma vez
✅ **Comparação fácil** entre diferentes configurações
✅ **Identificação rápida** dos melhores números e vizinhanças
✅ **Sem necessidade** de calcular número por número
✅ **Destaque visual** automático dos melhores resultados

## ⚠️ Observações

- Números que **não apareceram** na sequência mostram **"-"** em todas as colunas
- A tabela tem **scroll vertical** se houver muitos números
- O **🏆** só aparece se houver pelo menos 1 ocorrência do número
- Percentuais são calculados apenas para ocorrências **válidas** (com giros suficientes após elas)

## 🔗 Integração com Outras Funcionalidades

Esta tabela complementa:
- **Análise individual** de vizinhos (para detalhes específicos)
- **Padrões automáticos** (para ver grupos frequentes)
- **Setores da roda** (Tier/Orphelins/Voisins)

Use todas em conjunto para uma análise completa! 🎰✨
