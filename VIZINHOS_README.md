# Análise de Vizinhos na Roda Europeia (Baseada em Número-Alvo)

## 📋 Descrição

Esta funcionalidade analisa o que acontece nos próximos giros **após cada vez que um número-alvo aparece**, verificando se ele ou seus vizinhos saem nesse intervalo.

## 🎯 Como Usar

1. **Insira os números sorteados** no campo de entrada principal (ou carregue uma imagem)
2. Clique em **"Calcular e Simular"** para processar os dados
3. Navegue até a aba **"Vizinhos na Roda"**
4. Configure:
   - **Número-Alvo**: O número que você quer analisar (0-36)
   - **Vizinhos de Cada Lado**: Quantos vizinhos considerar (2, 3, 4, 5 ou 6)
   - **Janela de Análise**: Quantos giros seguintes analisar após cada ocorrência (padrão: 1)
5. Clique em **"Calcular Estatística de Vizinhos"**

## 🔍 Lógica de Funcionamento

### Exemplo Prático

Suponha que você escolheu:
- **Número-Alvo**: 0
- **Janela de Análise**: 1 giro (próximo sorteio)
- **Vizinhos**: 3 de cada lado

**Conjunto analisado**: `[0, 26, 3, 15, 32, 19, 12]`
- 0 (alvo)
- 26, 3, 15 (3 vizinhos à esquerda na roda)
- 32, 19, 12 (3 vizinhos à direita na roda)

### Como a Análise Funciona

1. O sistema encontra **todas as ocorrências** do número-alvo (0) na sequência
2. Para cada ocorrência, verifica os **próximos X giros** (janela de análise)
3. Se **algum número** desses X giros pertence ao conjunto de vizinhos, conta como **ACERTO**
4. Se **nenhum número** desses X giros pertence ao conjunto, conta como **FALHA**

### Exemplo com Dados Reais

Sequência: `[12, 0, 15, 8, 22, 0, 3, 9, ...]`

- **1ª ocorrência do 0** (posição 1):
  - Próximo giro: 15
  - 15 está no conjunto? **SIM** ✅ (é vizinho do 0)
  - Resultado: ACERTO

- **2ª ocorrência do 0** (posição 5):
  - Próximo giro: 3
  - 3 está no conjunto? **SIM** ✅ (é vizinho do 0)
  - Resultado: ACERTO

**Taxa de acerto**: 2 de 2 = **100%**

## 📊 Resultados Exibidos

### Card de Resumo
- **Número-Alvo**: O número escolhido para análise
- **Ocorrências do Alvo**: Quantas vezes o número apareceu (com giros suficientes após ele)
- **Janela de Análise**: Quantos giros seguintes foram analisados

### Card de Melhor Desempenho
Mostra qual quantidade de vizinhos teve a **maior taxa de acerto**.

### Cards Individuais (2 a 6 vizinhos)
Para cada quantidade de vizinhos, exibe:
- **Conjunto apostado**: Todos os números incluídos na análise
- **Acertos**: Quantas vezes os vizinhos apareceram na janela
- **Taxa de acerto**: Percentual de sucesso

## 🎰 Roda Europeia

Ordem real dos números (sentido horário, começando do 0):

```
0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30,
8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29,
7, 28, 12, 35, 3, 26
```

### Exemplo de Vizinhos do 0

- **2 vizinhos**: `[0, 26, 3, 32, 15]`
- **3 vizinhos**: `[0, 26, 3, 15, 32, 19, 12]`
- **4 vizinhos**: `[0, 26, 3, 12, 15, 19, 28, 32, 35]`

## 💡 Interpretação dos Resultados

### Taxa de Acerto
- **≥ 50%**: Excelente desempenho (verde) 🟢
- **≥ 30%**: Bom desempenho (laranja) 🟠
- **< 30%**: Desempenho normal ⚪

### Janela de Análise
- **1 giro**: Mais restritivo, percentuais menores
- **2-3 giros**: Equilíbrio entre precisão e taxa de acerto
- **4+ giros**: Mais permissivo, percentuais maiores

### Quantidade de Vizinhos
- **2-3 vizinhos**: Conjunto menor, mais focado
- **4-5 vizinhos**: Equilíbrio
- **6 vizinhos**: Conjunto maior, cobre mais da roda

## ⚙️ Detalhes Técnicos

- **Ocorrências válidas**: Apenas ocorrências do número-alvo que têm giros suficientes após elas são contadas
- **Circularidade**: A roda é circular (26 vem antes do 0, e 32 vem depois)
- **Número-alvo destacado**: Aparece em verde no conjunto apostado
- **Melhor desempenho**: Automaticamente identificado e destacado com badge 🏆

## 📝 Nota Importante

> Os percentuais consideram os X sorteios seguintes a cada vez que o número-alvo apareceu, verificando se ele ou algum dos seus vizinhos saiu nesse intervalo.

Se a última ocorrência do número-alvo não tiver giros suficientes após ela, ela é **ignorada** na estatística.
