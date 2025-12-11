
import { type BettingResult, type BettingSpinDetail, DEFAULT_BET_VALUES } from './roulette';

export function simulateExpandedBetting(
    numbers: number[],
    targetNumbers: number[],
    initialBankroll: number,
    betValues: number[] = DEFAULT_BET_VALUES
): BettingResult {
    let currentBetIndex = 0;
    let balance = initialBankroll;
    let lowestBalance = initialBankroll;
    let maxBetUsed = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let status: 'SURVIVED' | 'BROKE' = 'SURVIVED';

    const log: BettingSpinDetail[] = [];
    const numbersCount = targetNumbers.length;

    if (numbersCount === 0) {
        return {
            finalBalance: balance,
            lowestBalance,
            maxBetUsed,
            totalSpins: 0,
            totalWins,
            totalLosses,
            status,
            log
        };
    }

    for (let idx = 0; idx < numbers.length; idx++) {
        const num = numbers[idx];
        const isHit = targetNumbers.includes(num);

        const betUnit = betValues[currentBetIndex]; // Value per chip/number
        const totalBetAmount = betUnit * numbersCount;

        // Check for bankruptcy before betting
        if (balance < totalBetAmount) {
            status = 'BROKE';
            break;
        }

        if (totalBetAmount > maxBetUsed) {
            maxBetUsed = totalBetAmount;
        }

        let profit = 0;
        let result: 'WIN' | 'LOSS';

        if (isHit) {
            // WIN
            result = 'WIN';
            // Payout for a single number win is 35:1 + original bet back = 36 * unit
            const winAmount = 36 * betUnit;
            profit = winAmount - totalBetAmount;
            totalWins++;

            // Reset bet to start
            currentBetIndex = 0;
        } else {
            // LOSS
            result = 'LOSS';
            profit = -totalBetAmount;
            totalLosses++;

            // Increase bet (if not at max)
            if (currentBetIndex < betValues.length - 1) {
                currentBetIndex++;
            }
        }

        balance += profit;
        if (balance < lowestBalance) {
            lowestBalance = balance;
        }

        log.push({
            spinIndex: idx + 1,
            number: num,
            betSequence: 1, // Placeholder, as we are betting on a custom set
            betAmount: totalBetAmount,
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
