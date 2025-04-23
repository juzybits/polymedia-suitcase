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
 * Split a string into multiple chunks of a certain size.
 */
export function chunkString(input: string, chunkSize: number): string[] {
    const chunks = [];
    for (let i = 0; i < input.length; i += chunkSize) {
        chunks.push(input.slice(i, i + chunkSize));
    }
    return chunks;
}

/**
 * Generate an array of ranges of a certain size between two numbers.
 *
 * For example, calling `makeRanges(0, 678, 250)` will return:
 * ```
 * [ [ 0, 250 ], [ 250, 500 ], [ 500, 678 ] ]
 * ```
 */
export function makeRanges(from: number, to: number, size: number): number[][] {
    const ranges: number[][] = [];
    for (let start = from; start < to; start += size) {
        const end = Math.min(start + size, to);
        ranges.push([start, end]);
    }
    return ranges;
}

/**
 * Wait for a number of milliseconds.
 */
export async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
