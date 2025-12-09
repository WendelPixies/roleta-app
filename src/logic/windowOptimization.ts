
import type { CoincidenceConfig } from './roulette';

export interface WindowStat {
    windowSize: number;
    hits: number;
    percentage: number;
}

export type UrgencyLevel = 'Alta Urgência' | 'Médio Prazo' | 'Baixa Eficiência';

export interface OptimizedCoincidenceResult {
    config: CoincidenceConfig;
    triggerCount: number;
    bestWindow: number;
    bestPercentage: number;
    urgency: UrgencyLevel;
    windowStats: WindowStat[];
    efficiencyIcon: string;
}

export function analyzeWindowOptimization(
    numbers: number[],
    configs: CoincidenceConfig[]
): OptimizedCoincidenceResult[] {
    return configs.map(config => {
        const triggerIndices: number[] = [];
        numbers.forEach((num, idx) => {
            if (num === config.trigger) {
                triggerIndices.push(idx);
            }
        });

        const windowStats: WindowStat[] = [];
        let bestWindow = 2;
        let bestPercentage = -1;

        // Calculate for windows 2 to 10
        for (let w = 2; w <= 10; w++) {
            let validTriggersForWindow = 0;
            let hits = 0;

            triggerIndices.forEach(idx => {
                // Check if we have enough data (check logic: valid if we can look w spins ahead)
                if (idx + w < numbers.length) {
                    validTriggersForWindow++;
                    const slice = numbers.slice(idx + 1, idx + 1 + w);
                    const hasHit = slice.some(n => n >= config.targetRangeStart && n <= config.targetRangeEnd);
                    if (hasHit) hits++;
                }
            });

            const percentage = validTriggersForWindow > 0 ? (hits / validTriggersForWindow) * 100 : 0;
            windowStats.push({ windowSize: w, hits, percentage });

            // Track best window (Highest Percentage, then Smallest Window)
            if (percentage > bestPercentage) {
                bestPercentage = percentage;
                bestWindow = w;
            }
        }

        let urgency: UrgencyLevel = 'Baixa Eficiência';
        let efficiencyIcon = '🔴';

        if (bestWindow <= 4) {
            urgency = 'Alta Urgência';
            efficiencyIcon = '⭐';
        } else if (bestWindow <= 7) {
            urgency = 'Médio Prazo';
            efficiencyIcon = '🟡';
        }

        return {
            config,
            triggerCount: triggerIndices.length,
            bestWindow,
            bestPercentage,
            urgency,
            windowStats,
            efficiencyIcon
        };
    }).sort((a, b) => a.bestWindow - b.bestWindow);
}
