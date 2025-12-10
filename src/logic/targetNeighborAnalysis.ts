
export const europeanWheel = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6,
    27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
    16, 33, 1, 20, 14, 31, 9, 22, 18, 29,
    7, 28, 12, 35, 3, 26
];

export interface CenterAnalysis {
    center: number;
    k: number;
    targetOccurrences: number; // NN
    hits: number; // MM
    coveredNumbers: number[]; // List of numbers that were hits
    percentage: number;
}

export interface TargetAsNeighborResult {
    target: number;
    k: number;
    centers: CenterAnalysis[];
}

export function getNeighbors(center: number, k: number): number[] {
    const centerIndex = europeanWheel.indexOf(center);
    if (centerIndex === -1) return [];

    const neighbors: number[] = [];
    const wheelLength = europeanWheel.length;

    // Add center
    neighbors.push(center);

    // Add k neighbors to the left (counter-clockwise)
    for (let i = 1; i <= k; i++) {
        let index = (centerIndex - i + wheelLength) % wheelLength;
        neighbors.push(europeanWheel[index]);
    }

    // Add k neighbors to the right (clockwise)
    for (let i = 1; i <= k; i++) {
        let index = (centerIndex + i) % wheelLength;
        neighbors.push(europeanWheel[index]);
    }

    return neighbors;
}

export function analyzeTargetAsNeighbor(
    history: number[],
    target: number,
    k: number
): TargetAsNeighborResult {
    // 1. Identify relevant centers
    // A center C is relevant if its neighborhood (C +/- k) contains the target.
    const relevantCenters: number[] = [];

    for (const candidateCenter of europeanWheel) {
        const neighbors = getNeighbors(candidateCenter, k);
        if (neighbors.includes(target)) {
            relevantCenters.push(candidateCenter);
        }
    }

    // Initialize stats for each relevant center
    const stats: Map<number, CenterAnalysis> = new Map();
    for (const center of relevantCenters) {
        stats.set(center, {
            center,
            k,
            targetOccurrences: 0,
            hits: 0,
            coveredNumbers: [],
            percentage: 0
        });
    }

    // 2. Iterate through history
    // History is ordered from most recent to oldest (index 0 is newest).
    // The user prompt says: "Percorra a lista de resultados na ordem cronológica (do mais antigo para o mais recente)."
    // But the app usually stores history as [newest, ..., oldest].
    // Let's verify the order. In App.tsx: "Lista está de trás para frente (último sorteio primeiro)" checkbox reverses it.
    // Standard logic usually expects [newest, ..., oldest] for display, but for chronological analysis we iterate reverse or flip.
    // The prompt says: "Sempre que encontrar o número alvo (ex.: 20) na posição i: Pegue o sorteio seguinte na posição i+1 (se existir)."
    // IF the list is [Oldest, ..., Newest], then "next" is i+1.
    // IF the list is [Newest, ..., Oldest], then "next" (chronologically after) is i-1.

    // Let's assume the input `history` to this function is ordered [Newest, ..., Oldest] because that's how `numbersToProcess` is usually passed in App.tsx (unless reversed).
    // Wait, let's check App.tsx line 76:
    // let numbersToProcess = [...numbers];
    // if (isReversed) numbersToProcess.reverse();
    // Usually users paste [Newest ... Oldest]. If isReversed is checked, it becomes [Oldest ... Newest].
    // But `analyzeRoulette` and others usually expect [Newest ... Oldest] or handle it consistently.

    // Let's look at `analyzeNeighborsTargetBased` usage in App.tsx.
    // It takes `numbersToProcess`.

    // Let's standardize: The function will assume `history` is [Newest, ..., Oldest].
    // So if we find Target at index `i`, the *chronologically next* number is at index `i-1`.
    // Wait, if index 0 is Newest (Time T), index 1 is Time T-1.
    // If Target is at index `i` (Time T-i), the number that came *after* it is at index `i-1` (Time T-i+1).
    // Example: [Hit, Target, Previous] -> Index 0: Hit, Index 1: Target.
    // Chronologically: Previous -> Target -> Hit.
    // So if we find Target at index `i`, we look at `i-1`.

    // HOWEVER, the prompt says: "Percorra a lista de resultados na ordem cronológica (do mais antigo para o mais recente). Sempre que encontrar o número alvo... na posição i: Pegue o sorteio seguinte na posição i+1".
    // This implies the prompt assumes the list is [Oldest, ..., Newest].

    // To avoid confusion, I will convert the input history to [Oldest, ..., Newest] internally for the loop, or just adjust the index logic.
    // Let's stick to the prompt's logic: Iterate chronological.
    // So I'll reverse the input array to be [Oldest, ..., Newest].

    const chronologicalHistory = [...history].reverse();

    for (let i = 0; i < chronologicalHistory.length - 1; i++) {
        const currentNum = chronologicalHistory[i];

        if (currentNum === target) {
            const nextNum = chronologicalHistory[i + 1]; // The number that appeared AFTER the target

            // Update stats for all relevant centers
            for (const center of relevantCenters) {
                const centerStats = stats.get(center)!;
                centerStats.targetOccurrences++;

                const centerNeighbors = getNeighbors(center, k);
                if (centerNeighbors.includes(nextNum)) {
                    centerStats.hits++;
                    centerStats.coveredNumbers.push(nextNum);
                }
            }
        }
    }

    // Calculate percentages
    const results: CenterAnalysis[] = [];
    for (const centerStats of stats.values()) {
        if (centerStats.targetOccurrences > 0) {
            centerStats.percentage = (centerStats.hits / centerStats.targetOccurrences) * 100;
        }
        // Only include if it had at least one hit? 
        // Prompt says: "Para cada número central C que realmente tenha coberto algum N_next"
        if (centerStats.hits > 0) {
            results.push(centerStats);
        }
    }

    // Sort results? Maybe by percentage or hits?
    // Prompt doesn't specify sort order, but usually highest hit rate is best.
    results.sort((a, b) => b.percentage - a.percentage);

    return {
        target,
        k,
        centers: results
    };
}
