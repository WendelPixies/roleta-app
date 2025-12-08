# Exemplo de Uso - Análise de Vizinhos

## 📝 Dados de Teste

Use esta sequência de números para testar a funcionalidade:

```
0 32 15 19 4 21 2 25 17 34 6 27 13 36 11 30 8 23 10 5 24 16 33 1 20 14 31 9 22 18 29 7 28 12 35 3 26 0 15 8 32 0 3 19 4 0 26 12 15 0 32 35 3 0 15 26 19 0 3 32 12
```

## 🎯 Teste 1: Número-Alvo 0, Janela 1 giro

### Configuração
- **Número-Alvo**: 0
- **Vizinhos**: 3 de cada lado
- **Janela**: 1 giro

### Conjunto Analisado (3 vizinhos)
`[0, 3, 12, 15, 26, 32, 35]`

### Análise Manual
Vamos encontrar todas as ocorrências do 0 e ver o próximo giro:

1. **Posição 0**: 0 → próximo: 32 ✅ (32 está no conjunto)
2. **Posição 37**: 0 → próximo: 15 ✅ (15 está no conjunto)
3. **Posição 41**: 0 → próximo: 3 ✅ (3 está no conjunto)
4. **Posição 45**: 0 → próximo: 26 ✅ (26 está no conjunto)
5. **Posição 50**: 0 → próximo: 32 ✅ (32 está no conjunto)
6. **Posição 54**: 0 → próximo: 15 ✅ (15 está no conjunto)
7. **Posição 57**: 0 → próximo: 3 ✅ (3 está no conjunto)

**Resultado Esperado**: 7 acertos de 7 ocorrências = **100%**

## 🎯 Teste 2: Número-Alvo 0, Janela 3 giros

### Configuração
- **Número-Alvo**: 0
- **Vizinhos**: 2 de cada lado
- **Janela**: 3 giros

### Conjunto Analisado (2 vizinhos)
`[0, 3, 15, 26, 32]`

### Análise Manual
Agora vemos os **3 próximos giros** após cada 0:

1. **Posição 0**: 0 → próximos 3: [32, 15, 19] ✅ (32 e 15 estão no conjunto)
2. **Posição 37**: 0 → próximos 3: [15, 8, 32] ✅ (15 e 32 estão no conjunto)
3. **Posição 41**: 0 → próximos 3: [3, 19, 4] ✅ (3 está no conjunto)
4. **Posição 45**: 0 → próximos 3: [26, 12, 15] ✅ (26 e 15 estão no conjunto)
5. **Posição 50**: 0 → próximos 3: [32, 35, 3] ✅ (32 e 3 estão no conjunto)
6. **Posição 54**: 0 → próximos 3: [15, 26, 19] ✅ (15 e 26 estão no conjunto)
7. **Posição 57**: 0 → próximos 3: [3, 32, 12] ✅ (3 e 32 estão no conjunto)

**Resultado Esperado**: 7 acertos de 7 ocorrências = **100%**

## 🎯 Teste 3: Comparando Diferentes Quantidades de Vizinhos

### Configuração
- **Número-Alvo**: 0
- **Janela**: 1 giro
- **Testar**: 2, 3, 4, 5 e 6 vizinhos

### Conjuntos por Quantidade de Vizinhos

**2 vizinhos**: `[0, 3, 15, 26, 32]` (5 números)
**3 vizinhos**: `[0, 3, 12, 15, 26, 32, 35]` (7 números)
**4 vizinhos**: `[0, 3, 12, 15, 19, 26, 28, 32, 35]` (9 números)
**5 vizinhos**: `[0, 3, 4, 7, 12, 15, 19, 26, 28, 32, 35]` (11 números)
**6 vizinhos**: `[0, 3, 4, 7, 12, 15, 19, 21, 26, 28, 29, 32, 35]` (13 números)

### Resultado Esperado
Quanto mais vizinhos, maior a chance de acerto, pois o conjunto é maior.

## 📊 Como Interpretar

### Alta Taxa de Acerto (>70%)
Indica que após o número-alvo aparecer, há uma **forte tendência** de seus vizinhos saírem na janela de análise.

### Taxa Média (40-70%)
Indica uma **tendência moderada** - os vizinhos aparecem com frequência razoável.

### Taxa Baixa (<40%)
Indica que os vizinhos **não têm correlação forte** com o número-alvo na janela escolhida.

## 💡 Dicas de Uso

1. **Comece com janela = 1**: Mais restritivo, mostra correlação imediata
2. **Teste diferentes números-alvo**: Alguns números podem ter padrões diferentes
3. **Compare vizinhanças**: Veja se 2, 3 ou 4 vizinhos têm melhor desempenho
4. **Aumente a janela gradualmente**: Veja como a taxa muda com janelas maiores

## ⚠️ Importante

Esta análise é **descritiva**, não **preditiva**. Ela mostra o que aconteceu no passado, mas não garante que o padrão se repetirá no futuro. Use como ferramenta de análise estatística, não como garantia de resultados.
