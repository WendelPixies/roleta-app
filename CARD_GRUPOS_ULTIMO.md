# Card de Grupos com Último Número

## 📋 Descrição

Novo card especial que aparece **ao lado do card "Com 6 Vizinhos"** mostrando todos os **grupos de 3 números** (da análise de padrões automáticos) que contêm o **último número sorteado**.

## 🎯 Localização

**Aba:** Vizinhos na Roda
**Posição:** Após os 5 cards de vizinhos (2, 3, 4, 5, 6)
**Condição:** Só aparece se houver grupos detectados com o último número

## 🎨 Design Visual

### Cores
- **Borda**: Amarelo (#fbbf24)
- **Fundo**: Amarelo translúcido (rgba(251, 191, 36, 0.05))
- **Badge**: Amarelo com texto preto "⭐ GRUPOS COM [número]"
- **Último número**: Fundo amarelo (#fbbf24) + fonte preta
- **Outros números**: Fundo laranja (#f59e0b) + fonte branca

### Estrutura
```
┌─────────────────────────────────────┐
│ Padrões Detectados    ⭐ GRUPOS COM 26│
├─────────────────────────────────────┤
│ Grupos que contêm o último número:  │
│                                     │
│ ┌─────────────────────────────┐    │
│ │ [10] [16] [26]    3x (9.4%) │    │
│ └─────────────────────────────┘    │
│ ┌─────────────────────────────┐    │
│ │ [8] [23] [26]     2x (6.3%) │    │
│ └─────────────────────────────┘    │
│                                     │
│ 💡 Estes grupos apareceram juntos  │
│    múltiplas vezes                  │
└─────────────────────────────────────┘
```

## 📊 Informações Exibidas

Para cada grupo:
1. **Números do grupo** (3 números)
   - Último número: Amarelo + preto
   - Outros: Laranja + branco
2. **Ocorrências**: Quantas vezes o grupo apareceu
3. **Percentual**: % em relação ao total de giros

## 💡 Como Funciona

### Lógica
```typescript
const lastNumber = last10Analysis.last10Numbers[0];
const groupsWithLastNumber = patternAnalysis.topGroups.filter(group => 
  group.numbers.includes(lastNumber)
);
```

### Exemplo Prático

**Sequência:**
```
26 26 13 13 35 8 24 23 24 8
```

**Último número:** 26

**Grupos detectados automaticamente:**
- [10, 16, 26] - 3 ocorrências
- [8, 23, 26] - 2 ocorrências
- [13, 26, 28] - 4 ocorrências

**Card mostrará:**
```
⭐ GRUPOS COM 26

[10] [16] [26]    3x (9.4%)
      🟠  🟠  🟡

[8] [23] [26]     2x (6.3%)
     🟠  🟠  🟡

[13] [26] [28]    4x (12.5%)
      🟠  🟡  🟠
```

## 🎯 Benefícios

✅ **Visão Rápida**: Veja imediatamente todos os grupos com o último número
✅ **Destaque Visual**: Amarelo chama atenção para o card especial
✅ **Informação Completa**: Ocorrências e percentuais de cada grupo
✅ **Contexto**: Sabe exatamente quais números tendem a aparecer juntos
✅ **Estratégia**: Pode apostar nos grupos completos

## 📈 Casos de Uso

### 1. Identificar Padrões Recorrentes
Se o último número é 26 e você vê que ele aparece frequentemente com 10 e 16, pode considerar apostar nesse trio.

### 2. Validar Apostas
Antes de apostar em vizinhos, veja se há grupos detectados que confirmam o padrão.

### 3. Combinar Estratégias
Use junto com a análise de vizinhos para uma estratégia mais completa:
- Vizinhos: Números próximos na roda física
- Grupos: Números que aparecem juntos estatisticamente

## ⚙️ Condições de Exibição

O card **só aparece** quando:
1. ✅ Há análise de padrões disponível (`patternAnalysis`)
2. ✅ Há análise dos últimos 10 giros (`last10Analysis`)
3. ✅ Existem grupos detectados que contêm o último número
4. ✅ Pelo menos 1 grupo foi encontrado

Se **nenhum grupo** contiver o último número, o card **não é exibido**.

## 🔗 Integração

### Sincronização
O card está sincronizado com:
- **Últimos 10 Giros**: Usa o mesmo número destacado
- **Padrões Automáticos**: Usa os grupos da aba Coincidências
- **Número-Alvo**: Mesmo número do dropdown

### Atualização
- Atualiza automaticamente ao clicar em "Calcular e Simular"
- Muda dinamicamente com cada nova sequência
- Reflete sempre os dados mais recentes

## 🎨 Detalhes de Estilo

### Badge Superior
```css
background: #fbbf24 (amarelo)
color: #000000 (preto)
text: "⭐ GRUPOS COM [número]"
```

### Números
```css
Último número:
  background: #fbbf24
  color: #000000
  
Outros números:
  background: #f59e0b
  color: white
```

### Container dos Grupos
```css
background: rgba(251, 191, 36, 0.1)
border: 1px solid rgba(251, 191, 36, 0.3)
```

## 📊 Exemplo Completo

### Input
```
Sequência: 10 16 26 8 23 26 13 26 28 ...
Último número: 10
```

### Grupos Detectados
- [10, 16, 26] - apareceu 3x
- [8, 10, 23] - apareceu 2x

### Card Exibido
```
┌─────────────────────────────────────┐
│ Padrões Detectados    ⭐ GRUPOS COM 10│
├─────────────────────────────────────┤
│ [10] [16] [26]         3x (15.0%)   │
│  🟡  🟠  🟠                          │
│                                     │
│ [8] [10] [23]          2x (10.0%)   │
│  🟠  🟡  🟠                          │
│                                     │
│ 💡 Estes grupos apareceram juntos   │
│    múltiplas vezes                  │
└─────────────────────────────────────┘
```

## ✨ Resultado

Agora você tem uma **visão completa** de:
1. **Vizinhos na roda física** (cards 2-6 vizinhos)
2. **Grupos estatísticos** (card de padrões)

Combine ambas as análises para uma estratégia mais robusta! 🎰✨
