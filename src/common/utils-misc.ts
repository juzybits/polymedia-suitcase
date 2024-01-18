/* Miscellaneous utils */

/**
 * Split an array into multiple chunks of a certain size.
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        chunks.push(chunk);
    }
    return chunks;
}

/**
 * Format a number into a readable string.
 * - If the number is < 1000, show 2 decimals.
 * - If the number is >= 1000, don't show any decimals.
 */
export function formatNumber(num: number | BigInt): string {
    if (typeof num === 'bigint') {
        return num.toLocaleString('en-US');
    }

    if (num as number < 1000) {
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/**
 * Wait for a number of milliseconds.
 */
export async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
