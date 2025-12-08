# Teste de Detecção Automática de Padrões

## 📝 Sequência de Teste

```
13 1 28 36 36 14 15 27 22 25 13 28 36 4 8 1 18 2 29 8 7 18 13 21 0 12 27 5 24 36 34 28
```

## 🔍 Padrões Esperados

### Pares Frequentes
Baseado na sua observação, esperamos ver:
- **13 + 28**: Aparecem próximos
- **13 + 36**: Aparecem próximos
- **28 + 36**: Aparecem próximos

### Análise Manual

Vamos verificar as posições:
- Posição 0: **13**
- Posição 2: **28**
- Posição 3: **36**
- Posição 4: **36**
- Posição 10: **13**
- Posição 11: **28**
- Posição 12: **36**
- Posição 22: **13**
- Posição 29: **36**
- Posição 31: **28**

### Janela de 5 Giros

**Ocorrência 1 (posições 0-4):**
- Números: 13, 1, 28, 36, 36
- Pares: 13-28, 13-36, 28-36 ✅

**Ocorrência 2 (posições 10-14):**
- Números: 13, 28, 36, 4, 8
- Pares: 13-28, 13-36, 28-36 ✅

**Ocorrência 3 (posições 22-26):**
- Números: 13, 21, 0, 12, 27
- Não tem 28 nem 36 próximos ❌

**Ocorrência 4 (posições 29-31):**
- Números: 36, 34, 28
- Par: 36-28 ✅

## 🎯 Resultado Esperado

O sistema deve detectar automaticamente que os números **13, 28 e 36** aparecem frequentemente próximos uns dos outros, formando um padrão recorrente.

### Pares Esperados (Top 3):
1. **13 + 28**: ~3 ocorrências
2. **13 + 36**: ~3 ocorrências
3. **28 + 36**: ~4 ocorrências

### Grupo Esperado:
- **13, 28, 36**: Grupo de 3 números que aparecem juntos com frequência

## 📊 Como Testar

1. Cole a sequência no campo de entrada
2. Clique em "Calcular e Simular"
3. Vá para a aba "Coincidências"
4. Role até a seção "🔍 Padrões Detectados Automaticamente"
5. Verifique se os números 13, 28 e 36 aparecem nos pares e grupos mais frequentes

## 💡 Interpretação

Se o sistema detectar corretamente:
- **Pares Frequentes**: Mostrará 13+28, 13+36, 28+36 com alta frequência
- **Grupos de 3**: Mostrará o grupo [13, 28, 36]
- **Números Mais Frequentes**: 13, 28 e 36 devem estar entre os mais frequentes

Isso confirma que o algoritmo está funcionando corretamente para detectar padrões automáticos!
