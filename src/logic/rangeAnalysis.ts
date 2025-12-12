
export interface RangeAnalysisStats {
    range: string;
    min: number;
    max: number;
    hits: number;
    total: number;
    probabilidade: number;
}

export const ranges = [
    { nome: "1–12", min: 1, max: 12 },
    { nome: "13–24", min: 13, max: 24 },
    { nome: "25–36", min: 25, max: 36 },
];

export function analyzeRangesByTarget(
    numbers: number[],
    targetNumber: number,
    lookahead: number = 4
): RangeAnalysisStats[] {
    const result = ranges.map((r) => ({
        range: r.nome,
        min: r.min,
        max: r.max,
        hits: 0,
        total: 0,
        probabilidade: 0,
    }));

    // Iterate through the sequence of draws
    for (let i = 0; i < numbers.length; i++) {
        if (numbers[i] === targetNumber) {
            // found target number

            // We check for each range
            for (let r of result) {
                // Count total occurrences analysis for this range (which is effectively just counting the target number occurrences)
                // Note: The user logic says: "Para cada ocorrência do número alvo... Contar isso em totalOcorrencias."
                // And "probabilidade = hits / totalOcorrencias".
                // Since ranges are checked efficiently, we can just increment total for all ranges here.
                r.total++;

                // Slice the window
                // slice end is exclusive, so i + 1 + lookahead
                const janela = numbers.slice(i + 1, i + 1 + lookahead);

                // Check if any number in the window is in the current range
                const temNaFaixa = janela.some((v) => v >= r.min && v <= r.max);
                if (temNaFaixa) {
                    r.hits++;
                }
            }
        }
    }

    // Calculate probabilities
    result.forEach((r) => {
        if (r.total > 0) {
            r.probabilidade = +(r.hits / r.total).toFixed(3);
        } else {
            r.probabilidade = 0;
        }
    });

    // Sort by probability descending
    result.sort((a, b) => b.probabilidade - a.probabilidade);

    return result;
}
