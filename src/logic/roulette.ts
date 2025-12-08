// --- European Wheel (clockwise order starting from 0) ---
export const EUROPEAN_WHEEL = [
    0,
    32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30,
    8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29,
    7, 28, 12, 35, 3, 26
];

// --- Neighbors Analysis (Target-based) ---
export interface NeighborStats {
    k: number;
    numbers: number[];
    hits: number;
    totalOccurrences: number;
    percentage: number;
}

export interface NeighborsAnalysisResult {
    targetNumber: number;
    windowSize: number;
    targetOccurrences: number;
    validOccurrences: number; // Occurrences with enough spins after them
    neighborStats: NeighborStats[];
    bestK: number;
    bestPercentage: number;
}

export function getNeighbors(center: number, k: number): number[] {
    const idx = EUROPEAN_WHEEL.indexOf(center);
    if (idx === -1) return [];

    const result: number[] = [center];
    const n = EUROPEAN_WHEEL.length;

    for (let i = 1; i <= k; i++) {
        const leftIndex = (idx - i + n) % n;
        const rightIndex = (idx + i) % n;
        result.push(EUROPEAN_WHEEL[leftIndex]);
        result.push(EUROPEAN_WHEEL[rightIndex]);
    }

    // Remove duplicates if any
    return Array.from(new Set(result));
}

export function analyzeNeighborsTargetBased(
    numbers: number[],
    targetNumber: number,
    windowSize: number
): NeighborsAnalysisResult {
    // Find all occurrences of the target number
    const targetIndices: number[] = [];
    numbers.forEach((num, idx) => {
        if (num === targetNumber) {
            targetIndices.push(idx);
        }
    });

    const totalOccurrences = targetIndices.length;

    // Filter occurrences that have enough spins after them
    const validIndices = targetIndices.filter(idx => idx + windowSize < numbers.length);
    const validOccurrences = validIndices.length;

    const neighborStats: NeighborStats[] = [];
    let bestK = 2;
    let bestPercentage = 0;

    // Analyze for k = 2 to 6
    for (let k = 2; k <= 6; k++) {
        const neighborsSet = getNeighbors(targetNumber, k);
        let hits = 0;

        // For each valid occurrence of the target number
        validIndices.forEach(targetIdx => {
            // Look at the next windowSize spins
            const nextSpins = numbers.slice(targetIdx + 1, targetIdx + 1 + windowSize);

            // Check if any of these spins is in the neighbors set
            const foundNeighbor = nextSpins.some(spin => neighborsSet.includes(spin));

            if (foundNeighbor) {
                hits++;
            }
        });

        const percentage = validOccurrences > 0 ? (hits / validOccurrences) * 100 : 0;

        neighborStats.push({
            k,
            numbers: neighborsSet.sort((a, b) => a - b),
            hits,
            totalOccurrences: validOccurrences,
            percentage
        });

        if (percentage > bestPercentage) {
            bestPercentage = percentage;
            bestK = k;
        }
    }

    return {
        targetNumber,
        windowSize,
        targetOccurrences: totalOccurrences,
        validOccurrences,
        neighborStats,
        bestK,
        bestPercentage
    };
}

export const SEQUENCES = {
    1: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    2: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    3: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
};

export type SequenceId = 1 | 2 | 3;

// --- Squares Logic ---
export const SQUARES = {
    1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    2: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    3: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
};

// --- European Roulette Sectors ---
export const SECTORS = {
    tier: [5, 8, 10, 11, 13, 16, 23, 24, 27, 30, 33, 36],
    orphelins: [1, 6, 9, 14, 17, 20, 31, 34],
    voisins: [0, 2, 3, 4, 7, 12, 15, 18, 19, 21, 22, 25, 26, 28, 29, 32, 35],
};

export type SectorId = 'tier' | 'orphelins' | 'voisins';

export function getSectorForNumber(num: number): SectorId | null {
    if (SECTORS.tier.includes(num)) return 'tier';
    if (SECTORS.orphelins.includes(num)) return 'orphelins';
    if (SECTORS.voisins.includes(num)) return 'voisins';
    return null;
}

export interface SectorStats {
    hits: number;
    percentage: number;
    maxGap: number;
    maxGapRange: string;
}

export interface SectorAnalysisResult {
    stats: Record<SectorId, SectorStats>;
    hottestSector: { id: SectorId; percentage: number };
    recentStats: Record<SectorId, { hits: number; percentage: number }>;
    endingsAnalysis: {
        ending: number;
        count: number;
        sectorDistribution: Record<SectorId, number>;
    }[];
}

export function analyzeSectors(numbers: number[], recentCount: number = 10): SectorAnalysisResult {
    const sectorHits: Record<SectorId, number> = { tier: 0, orphelins: 0, voisins: 0 };
    const sectorCurrentGaps: Record<SectorId, number> = { tier: 0, orphelins: 0, voisins: 0 };
    const sectorMaxGaps: Record<SectorId, number> = { tier: 0, orphelins: 0, voisins: 0 };
    const sectorGapRanges: Record<SectorId, string> = { tier: '-', orphelins: '-', voisins: '-' };
    const sectorGapStartIndices: Record<SectorId, number> = { tier: 0, orphelins: 0, voisins: 0 };

    // Analyze all numbers for max gaps
    numbers.forEach((num, idx) => {
        const sector = getSectorForNumber(num);

        if (sector) {
            sectorHits[sector]++;
            sectorCurrentGaps[sector] = 0;
            sectorGapStartIndices[sector] = idx + 1;

            // Increment gaps for other sectors
            (['tier', 'orphelins', 'voisins'] as SectorId[]).forEach(id => {
                if (id !== sector) {
                    sectorCurrentGaps[id]++;
                    if (sectorCurrentGaps[id] > sectorMaxGaps[id]) {
                        sectorMaxGaps[id] = sectorCurrentGaps[id];
                        sectorGapRanges[id] = `Giro ${sectorGapStartIndices[id]} ao ${idx + 1}`;
                    }
                }
            });
        } else {
            // Number 0 or not in any sector - increment all gaps
            (['tier', 'orphelins', 'voisins'] as SectorId[]).forEach(id => {
                sectorCurrentGaps[id]++;
                if (sectorCurrentGaps[id] > sectorMaxGaps[id]) {
                    sectorMaxGaps[id] = sectorCurrentGaps[id];
                    sectorGapRanges[id] = `Giro ${sectorGapStartIndices[id]} ao ${idx + 1}`;
                }
            });
        }
    });

    const totalSpins = numbers.length;
    const stats: Record<SectorId, SectorStats> = {
        tier: {
            hits: sectorHits.tier,
            percentage: totalSpins > 0 ? (sectorHits.tier / totalSpins) * 100 : 0,
            maxGap: sectorMaxGaps.tier,
            maxGapRange: sectorGapRanges.tier
        },
        orphelins: {
            hits: sectorHits.orphelins,
            percentage: totalSpins > 0 ? (sectorHits.orphelins / totalSpins) * 100 : 0,
            maxGap: sectorMaxGaps.orphelins,
            maxGapRange: sectorGapRanges.orphelins
        },
        voisins: {
            hits: sectorHits.voisins,
            percentage: totalSpins > 0 ? (sectorHits.voisins / totalSpins) * 100 : 0,
            maxGap: sectorMaxGaps.voisins,
            maxGapRange: sectorGapRanges.voisins
        }
    };

    // Analyze recent spins
    const recentNumbers = numbers.slice(-recentCount);
    const recentSectorHits: Record<SectorId, number> = { tier: 0, orphelins: 0, voisins: 0 };

    recentNumbers.forEach(num => {
        const sector = getSectorForNumber(num);
        if (sector) recentSectorHits[sector]++;
    });

    const recentStats: Record<SectorId, { hits: number; percentage: number }> = {
        tier: {
            hits: recentSectorHits.tier,
            percentage: recentCount > 0 ? (recentSectorHits.tier / recentCount) * 100 : 0
        },
        orphelins: {
            hits: recentSectorHits.orphelins,
            percentage: recentCount > 0 ? (recentSectorHits.orphelins / recentCount) * 100 : 0
        },
        voisins: {
            hits: recentSectorHits.voisins,
            percentage: recentCount > 0 ? (recentSectorHits.voisins / recentCount) * 100 : 0
        }
    };

    // Find hottest sector in recent spins
    let hottestSector: { id: SectorId; percentage: number } = { id: 'tier', percentage: 0 };
    (['tier', 'orphelins', 'voisins'] as SectorId[]).forEach(id => {
        if (recentStats[id].percentage > hottestSector.percentage) {
            hottestSector = { id, percentage: recentStats[id].percentage };
        }
    });

    // Analyze endings in recent spins
    const endingCounts: Record<number, number> = {};
    const endingSectors: Record<number, Record<SectorId, number>> = {};

    recentNumbers.forEach(num => {
        const ending = num % 10;
        endingCounts[ending] = (endingCounts[ending] || 0) + 1;

        if (!endingSectors[ending]) {
            endingSectors[ending] = { tier: 0, orphelins: 0, voisins: 0 };
        }

        const sector = getSectorForNumber(num);
        if (sector) {
            endingSectors[ending][sector]++;
        }
    });

    const endingsAnalysis = Object.entries(endingCounts)
        .map(([ending, count]) => ({
            ending: parseInt(ending),
            count,
            sectorDistribution: endingSectors[parseInt(ending)]
        }))
        .filter(item => item.count > 1)
        .sort((a, b) => b.count - a.count);

    return {
        stats,
        hottestSector,
        recentStats,
        endingsAnalysis
    };
}


export interface SpinDetail {
    spinIndex: number;
    number: number;
    activeSeqBefore: SequenceId;
    isHit: boolean;
    activeSeqAfter: SequenceId;
    currentGap: number;
}

export interface SquareSpinDetail {
    spinIndex: number;
    number: number;
    hitSquare: SequenceId | null;
    gaps: Record<SequenceId, number>;
}

export interface SquareStats {
    hits: number;
    percentage: number;
    maxGap: number;
}

export interface AnalysisResult {
    maxGaps: Record<SequenceId, number>;
    gapDetails: Record<SequenceId, string>;
    sequenceStats: Record<SequenceId, { hits: number; percentage: number }>;
    squareStats: Record<SequenceId, SquareStats>;
    log: SpinDetail[];
    squaresLog: SquareSpinDetail[];
}

export function analyzeRoulette(numbers: number[]): AnalysisResult {
    const cycle: SequenceId[] = [1, 2, 3, 2];
    let cycleIndex = 0;

    const currentGaps: Record<SequenceId, number> = { 1: 0, 2: 0, 3: 0 };
    const maxGaps: Record<SequenceId, number> = { 1: 0, 2: 0, 3: 0 };
    const gapDetails: Record<SequenceId, string> = { 1: "-", 2: "-", 3: "-" };
    const gapStartIndices: Record<SequenceId, number> = { 1: 0, 2: 0, 3: 0 };

    // Stats for each sequence (independent of strategy)
    const seqHits: Record<SequenceId, number> = { 1: 0, 2: 0, 3: 0 };

    // Stats for Squares
    const squareHits: Record<SequenceId, number> = { 1: 0, 2: 0, 3: 0 };
    const squareCurrentGaps: Record<SequenceId, number> = { 1: 0, 2: 0, 3: 0 };
    const squareMaxGaps: Record<SequenceId, number> = { 1: 0, 2: 0, 3: 0 };

    const log: SpinDetail[] = [];
    const squaresLog: SquareSpinDetail[] = [];

    numbers.forEach((num, idx) => {
        // 1. Update general stats (Sequences)
        if (SEQUENCES[1].includes(num)) seqHits[1]++;
        if (SEQUENCES[2].includes(num)) seqHits[2]++;
        if (SEQUENCES[3].includes(num)) seqHits[3]++;

        // 2. Update Squares Stats
        // Determine which square hit (if any)
        let hitSquare: SequenceId | null = null;
        if (SQUARES[1].includes(num)) hitSquare = 1;
        else if (SQUARES[2].includes(num)) hitSquare = 2;
        else if (SQUARES[3].includes(num)) hitSquare = 3;

        if (hitSquare) {
            squareHits[hitSquare]++;
            squareCurrentGaps[hitSquare] = 0;
            // Increment gaps for others
            ([1, 2, 3] as SequenceId[]).forEach(id => {
                if (id !== hitSquare) {
                    squareCurrentGaps[id]++;
                    if (squareCurrentGaps[id] > squareMaxGaps[id]) squareMaxGaps[id] = squareCurrentGaps[id];
                }
            });
        } else {
            // Missed all squares (e.g. 0)
            ([1, 2, 3] as SequenceId[]).forEach(id => {
                squareCurrentGaps[id]++;
                if (squareCurrentGaps[id] > squareMaxGaps[id]) squareMaxGaps[id] = squareCurrentGaps[id];
            });
        }

        squaresLog.push({
            spinIndex: idx + 1,
            number: num,
            hitSquare,
            gaps: { ...squareCurrentGaps }
        });

        // 3. Run Strategy Logic (Sequences)
        const activeSeqId = cycle[cycleIndex];
        const sequence = SEQUENCES[activeSeqId];
        const isHit = sequence.includes(num);

        const activeSeqBefore = activeSeqId;
        let activeSeqAfter = activeSeqId;
        let currentGapVal = currentGaps[activeSeqId];

        if (isHit) {
            currentGaps[activeSeqId] = 0;
            gapStartIndices[activeSeqId] = idx + 1;
            cycleIndex = (cycleIndex + 1) % 4;
            activeSeqAfter = cycle[cycleIndex];
        } else {
            currentGaps[activeSeqId]++;
            currentGapVal = currentGaps[activeSeqId];

            if (currentGapVal > maxGaps[activeSeqId]) {
                maxGaps[activeSeqId] = currentGapVal;
                gapDetails[activeSeqId] = `Entre giro ${gapStartIndices[activeSeqId] + 1} e ${idx + 1}`;
            }
        }

        log.push({
            spinIndex: idx + 1,
            number: num,
            activeSeqBefore,
            isHit,
            activeSeqAfter,
            currentGap: isHit ? 0 : currentGapVal
        });
    });

    const totalSpins = numbers.length;
    const sequenceStats: Record<SequenceId, { hits: number; percentage: number }> = {
        1: { hits: seqHits[1], percentage: totalSpins > 0 ? (seqHits[1] / totalSpins) * 100 : 0 },
        2: { hits: seqHits[2], percentage: totalSpins > 0 ? (seqHits[2] / totalSpins) * 100 : 0 },
        3: { hits: seqHits[3], percentage: totalSpins > 0 ? (seqHits[3] / totalSpins) * 100 : 0 },
    };

    const squareStats: Record<SequenceId, SquareStats> = {
        1: { hits: squareHits[1], percentage: totalSpins > 0 ? (squareHits[1] / totalSpins) * 100 : 0, maxGap: squareMaxGaps[1] },
        2: { hits: squareHits[2], percentage: totalSpins > 0 ? (squareHits[2] / totalSpins) * 100 : 0, maxGap: squareMaxGaps[2] },
        3: { hits: squareHits[3], percentage: totalSpins > 0 ? (squareHits[3] / totalSpins) * 100 : 0, maxGap: squareMaxGaps[3] },
    };

    return { maxGaps, gapDetails, sequenceStats, squareStats, log, squaresLog };
}

// --- Betting Simulation ---

export const DEFAULT_BET_VALUES = [3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584];

export interface BettingSpinDetail {
    spinIndex: number;
    number: number;
    betSequence: SequenceId;
    betAmount: number;
    result: 'WIN' | 'LOSS';
    profit: number;
    balanceAfter: number;
}

export interface BettingResult {
    finalBalance: number;
    lowestBalance: number;
    maxBetUsed: number;
    totalSpins: number;
    totalWins: number;
    totalLosses: number;
    status: 'SURVIVED' | 'BROKE';
    log: BettingSpinDetail[];
}

export function simulateBettingStrategy(
    numbers: number[],
    initialBankroll: number,
    betValues: number[] = DEFAULT_BET_VALUES
): BettingResult {
    const cycle: SequenceId[] = [1, 2, 3, 2];
    let cycleIndex = 0; // Starts at Seq 1

    let currentBetIndex = 0;
    let balance = initialBankroll;
    let lowestBalance = initialBankroll;
    let maxBetUsed = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let status: 'SURVIVED' | 'BROKE' = 'SURVIVED';

    const log: BettingSpinDetail[] = [];

    for (let idx = 0; idx < numbers.length; idx++) {
        const num = numbers[idx];
        const activeSeqId = cycle[cycleIndex];
        const sequence = SEQUENCES[activeSeqId];
        const isHit = sequence.includes(num);

        const betAmount = betValues[currentBetIndex];

        // Check for bankruptcy before betting
        if (balance < betAmount) {
            status = 'BROKE';
            break;
        }

        if (betAmount > maxBetUsed) {
            maxBetUsed = betAmount;
        }

        let profit = 0;
        let result: 'WIN' | 'LOSS';

        if (isHit) {
            // WIN
            result = 'WIN';
            profit = 2 * betAmount; // Pays 2:1
            totalWins++;

            // Reset bet to start
            currentBetIndex = 0;

            // Switch sequence
            cycleIndex = (cycleIndex + 1) % 4;
        } else {
            // LOSS
            result = 'LOSS';
            profit = -betAmount;
            totalLosses++;

            // Increase bet (if not at max)
            if (currentBetIndex < betValues.length - 1) {
                currentBetIndex++;
            }
            // Sequence stays same
        }

        balance += profit;
        if (balance < lowestBalance) {
            lowestBalance = balance;
        }

        log.push({
            spinIndex: idx + 1,
            number: num,
            betSequence: activeSeqId,
            betAmount,
            result,
            profit,
            balanceAfter: balance
        });

        if (balance <= 0) {
            status = 'BROKE';
            break;
        }
    }

    return {
        finalBalance: balance,
        lowestBalance,
        maxBetUsed,
        totalSpins: log.length,
        totalWins,
        totalLosses,
        status,
        log
    };
}

export function simulateSquareBetting(
    numbers: number[],
    initialBankroll: number,
    betValues: number[] = DEFAULT_BET_VALUES
): BettingResult {
    const cycle: SequenceId[] = [1, 2, 3, 2];
    let cycleIndex = 0; // Starts at Square 1

    let currentBetIndex = 0;
    let balance = initialBankroll;
    let lowestBalance = initialBankroll;
    let maxBetUsed = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let status: 'SURVIVED' | 'BROKE' = 'SURVIVED';

    const log: BettingSpinDetail[] = [];

    for (let idx = 0; idx < numbers.length; idx++) {
        const num = numbers[idx];
        const activeSeqId = cycle[cycleIndex];
        const square = SQUARES[activeSeqId];
        const isHit = square.includes(num);

        const betAmount = betValues[currentBetIndex];

        // Check for bankruptcy before betting
        if (balance < betAmount) {
            status = 'BROKE';
            break;
        }

        if (betAmount > maxBetUsed) {
            maxBetUsed = betAmount;
        }

        let profit = 0;
        let result: 'WIN' | 'LOSS';

        if (isHit) {
            // WIN
            result = 'WIN';
            profit = 2 * betAmount; // Pays 2:1
            totalWins++;

            // Reset bet to start
            currentBetIndex = 0;

            // Switch sequence
            cycleIndex = (cycleIndex + 1) % 4;
        } else {
            // LOSS
            result = 'LOSS';
            profit = -betAmount;
            totalLosses++;

            // Increase bet (if not at max)
            if (currentBetIndex < betValues.length - 1) {
                currentBetIndex++;
            }
            // Sequence stays same
        }

        balance += profit;
        if (balance < lowestBalance) {
            lowestBalance = balance;
        }

        log.push({
            spinIndex: idx + 1,
            number: num,
            betSequence: activeSeqId, // Reusing field name for Square ID
            betAmount,
            result,
            profit,
            balanceAfter: balance
        });

        if (balance <= 0) {
            status = 'BROKE';
            break;
        }
    }

    return {
        finalBalance: balance,
        lowestBalance,
        maxBetUsed,
        totalSpins: log.length,
        totalWins,
        totalLosses,
        status,
        log
    };
}

// --- Coincidences Logic ---

export interface CoincidenceConfig {
    id: string;
    trigger: number;
    window: number;
    targetRangeStart: number;
    targetRangeEnd: number;
}

export interface CoincidenceStat {
    config: CoincidenceConfig;
    triggerCount: number;
    hitCount: number;
    percentage: number;
}

export interface EndingStat {
    ending: number;
    count: number;
}

export interface Last10Analysis {
    last10Numbers: number[];
    alerts: string[];
    repeatedEndings: EndingStat[];
}

export const DEFAULT_COINCIDENCES: CoincidenceConfig[] = [
    { id: 'c1', trigger: 4, window: 10, targetRangeStart: 25, targetRangeEnd: 29 },
    { id: 'c2', trigger: 8, window: 8, targetRangeStart: 16, targetRangeEnd: 18 },
    { id: 'c3', trigger: 7, window: 10, targetRangeStart: 15, targetRangeEnd: 18 },
    { id: 'c4', trigger: 2, window: 10, targetRangeStart: 10, targetRangeEnd: 14 },
    { id: 'c5', trigger: 32, window: 10, targetRangeStart: 25, targetRangeEnd: 29 },
];

export function analyzeCoincidences(numbers: number[], configs: CoincidenceConfig[]): CoincidenceStat[] {
    return configs.map(config => {
        let triggerCount = 0;
        let hitCount = 0;

        for (let i = 0; i < numbers.length; i++) {
            if (numbers[i] === config.trigger) {
                // Don't count the last number as a trigger for historical stats if we want to predict the future?
                // Let's count it only if there is at least 1 spin after it.
                if (i === numbers.length - 1) continue;

                triggerCount++;
                let found = false;
                const limit = Math.min(numbers.length, i + 1 + config.window);

                for (let j = i + 1; j < limit; j++) {
                    if (numbers[j] >= config.targetRangeStart && numbers[j] <= config.targetRangeEnd) {
                        found = true;
                        break;
                    }
                }

                if (found) hitCount++;
            }
        }

        return {
            config,
            triggerCount,
            hitCount,
            percentage: triggerCount > 0 ? (hitCount / triggerCount) * 100 : 0
        };
    });
}

export function analyzeLast10(numbers: number[], stats: CoincidenceStat[]): Last10Analysis {
    const last10 = numbers.slice(-10).reverse(); // Most recent first
    const alerts: string[] = [];
    const endingCounts: Record<number, number> = {};

    // 1. Analyze triggers in last 10
    last10.forEach((num) => {
        // Find if this number is a trigger in our configs
        const matchingStats = stats.filter(s => s.config.trigger === num);

        matchingStats.forEach(stat => {
            const rangeStr = `${stat.config.targetRangeStart}–${stat.config.targetRangeEnd}`;
            alerts.push(
                `O número ${num} saiu recentemente. Historicamente, ${num} → faixa ${rangeStr} (próx. ${stat.config.window} giros) tem ${stat.percentage.toFixed(1)}% de acerto (${stat.hitCount}/${stat.triggerCount}).`
            );
        });

        // 2. Count endings
        const ending = num % 10;
        endingCounts[ending] = (endingCounts[ending] || 0) + 1;
    });

    // 3. Process endings
    const repeatedEndings: EndingStat[] = Object.entries(endingCounts)
        .map(([ending, count]) => ({ ending: parseInt(ending), count }))
        .filter(item => item.count > 1)
        .sort((a, b) => b.count - a.count);

    return {
        last10Numbers: last10,
        alerts,
        repeatedEndings
    };
}

// --- Automatic Pattern Detection ---
export interface NumberPairPattern {
    number1: number;
    number2: number;
    occurrences: number;
    percentage: number;
}

export interface NumberGroupPattern {
    numbers: number[];
    occurrences: number;
    percentage: number;
    avgDistance: number;
}

export interface PatternAnalysisResult {
    totalSpins: number;
    windowSize: number;
    topPairs: NumberPairPattern[];
    topGroups: NumberGroupPattern[];
    frequentNumbers: { number: number; count: number; percentage: number }[];
}

export function analyzeAutomaticPatterns(
    numbers: number[],
    windowSize: number = 5,
    minOccurrences: number = 3
): PatternAnalysisResult {
    const totalSpins = numbers.length;

    // 1. Find frequent number pairs (numbers that appear within windowSize of each other)
    const pairCounts: Map<string, { num1: number; num2: number; count: number }> = new Map();

    for (let i = 0; i < numbers.length; i++) {
        const currentNum = numbers[i];

        // Look ahead within window
        for (let j = i + 1; j < Math.min(i + windowSize + 1, numbers.length); j++) {
            const nextNum = numbers[j];
            if (currentNum === nextNum) continue; // Skip same number

            // Create a consistent key (smaller number first)
            const key = currentNum < nextNum
                ? `${currentNum}-${nextNum}`
                : `${nextNum}-${currentNum}`;

            if (!pairCounts.has(key)) {
                pairCounts.set(key, {
                    num1: Math.min(currentNum, nextNum),
                    num2: Math.max(currentNum, nextNum),
                    count: 0
                });
            }

            const pair = pairCounts.get(key)!;
            pair.count++;
        }
    }

    // Convert to array and filter by minimum occurrences
    const topPairs: NumberPairPattern[] = Array.from(pairCounts.values())
        .filter(p => p.count >= minOccurrences)
        .map(p => ({
            number1: p.num1,
            number2: p.num2,
            occurrences: p.count,
            percentage: (p.count / totalSpins) * 100
        }))
        .sort((a, b) => b.occurrences - a.occurrences)
        .slice(0, 10); // Top 10 pairs

    // 2. Find groups of 3+ numbers that appear together frequently
    const groupCounts: Map<string, { nums: number[]; count: number; distances: number[] }> = new Map();

    for (let i = 0; i < numbers.length; i++) {
        const windowNums = numbers.slice(i, Math.min(i + windowSize + 1, numbers.length));
        const uniqueNums = Array.from(new Set(windowNums)).sort((a, b) => a - b);

        if (uniqueNums.length >= 3) {
            // Generate all combinations of 3 numbers
            for (let a = 0; a < uniqueNums.length - 2; a++) {
                for (let b = a + 1; b < uniqueNums.length - 1; b++) {
                    for (let c = b + 1; c < uniqueNums.length; c++) {
                        const group = [uniqueNums[a], uniqueNums[b], uniqueNums[c]];
                        const key = group.join('-');

                        if (!groupCounts.has(key)) {
                            groupCounts.set(key, { nums: group, count: 0, distances: [] });
                        }

                        const groupData = groupCounts.get(key)!;
                        groupData.count++;

                        // Calculate average distance between numbers in this window
                        const positions = group.map(num => windowNums.indexOf(num));
                        const maxDist = Math.max(...positions) - Math.min(...positions);
                        groupData.distances.push(maxDist);
                    }
                }
            }
        }
    }

    const topGroups: NumberGroupPattern[] = Array.from(groupCounts.values())
        .filter(g => g.count >= minOccurrences)
        .map(g => ({
            numbers: g.nums,
            occurrences: g.count,
            percentage: (g.count / totalSpins) * 100,
            avgDistance: g.distances.reduce((a, b) => a + b, 0) / g.distances.length
        }))
        .sort((a, b) => b.occurrences - a.occurrences)
        .slice(0, 10); // Top 10 groups

    // 3. Find most frequent individual numbers
    const numberCounts: Map<number, number> = new Map();
    numbers.forEach(num => {
        numberCounts.set(num, (numberCounts.get(num) || 0) + 1);
    });

    const frequentNumbers = Array.from(numberCounts.entries())
        .map(([number, count]) => ({
            number,
            count,
            percentage: (count / totalSpins) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 numbers

    return {
        totalSpins,
        windowSize,
        topPairs,
        topGroups,
        frequentNumbers
    };
}

// --- All Neighbors Analysis (Matrix View) ---
export interface AllNeighborsRow {
    number: number;
    occurrences: number;
    percentages: Record<number, number>; // k -> percentage
}

export interface AllNeighborsAnalysisResult {
    windowSize: number;
    rows: AllNeighborsRow[];
    totalSpins: number;
}

export function analyzeAllNeighbors(
    numbers: number[],
    windowSize: number = 1
): AllNeighborsAnalysisResult {
    const rows: AllNeighborsRow[] = [];

    // Analyze each number from 0 to 36
    for (let targetNum = 0; targetNum <= 36; targetNum++) {
        // Find all occurrences of this target number
        const targetIndices: number[] = [];
        numbers.forEach((num, idx) => {
            if (num === targetNum) {
                targetIndices.push(idx);
            }
        });

        // Filter occurrences that have enough spins after them
        const validIndices = targetIndices.filter(idx => idx + windowSize < numbers.length);
        const validOccurrences = validIndices.length;

        const percentages: Record<number, number> = {};

        // Analyze for k = 2 to 6
        for (let k = 2; k <= 6; k++) {
            const neighborsSet = getNeighbors(targetNum, k);
            let hits = 0;

            // For each valid occurrence of the target number
            validIndices.forEach(targetIdx => {
                // Look at the next windowSize spins
                const nextSpins = numbers.slice(targetIdx + 1, targetIdx + 1 + windowSize);

                // Check if any of these spins is in the neighbors set
                const foundNeighbor = nextSpins.some(spin => neighborsSet.includes(spin));

                if (foundNeighbor) {
                    hits++;
                }
            });

            const percentage = validOccurrences > 0 ? (hits / validOccurrences) * 100 : 0;
            percentages[k] = percentage;
        }

        rows.push({
            number: targetNum,
            occurrences: validOccurrences,
            percentages
        });
    }

    return {
        windowSize,
        rows,
        totalSpins: numbers.length
    };
}
