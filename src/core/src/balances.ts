/**
 * Convert a bigint to a string, scaled down to the specified decimals.
 */
export function balanceToString(value: bigint, coinDecimals: number): string
{
    if (value === 0n) {
        return "0";
    }

    const isNegative = value < 0n;
    const absoluteValue = isNegative ? -value : value;

    const valStr = absoluteValue.toString();

    if (coinDecimals === 0) {
        // if no decimals, return the value as a string
        return (isNegative ? "-" : "") + valStr;
    }

    // pad the string to ensure it has enough digits
    const paddedValStr = valStr.padStart(coinDecimals + 1, "0");
    const integerPart = paddedValStr.slice(0, -coinDecimals);
    const fractionalPart = paddedValStr.slice(-coinDecimals);

    // combine integer and fractional parts
    let result = `${integerPart}.${fractionalPart}`;

    // remove unnecessary trailing zeros after the decimal point
    result = result.replace(/\.?0+$/, "");

    return isNegative ? `-${result}` : result;
}

/**
 * Convert a string to a bigint, scaled up to the specified decimals.
 */
export function stringToBalance(value: string, coinDecimals: number): bigint
{
    value = value.trim();

    if ( ["", ".", "-"].includes(value) ) {
        return 0n;
    }

    // validate the input
    if ( "-." === value || !/^-?\d*\.?\d*$/.test(value) ) {
        throw new Error("Invalid input");
    }

    const [integerPart, rawDecimalPart = ""] = value.split(".");

    // truncate the decimal part if it has more places than the specified decimals
    const decimalPart = rawDecimalPart.slice(0, coinDecimals);

    // pad the decimal part with zeros if it's shorter than the specified decimals
    const fullNumber = integerPart + decimalPart.padEnd(coinDecimals, "0");

    return BigInt(fullNumber);
}

/**
 * Format a number into a readable string.
 *
 * - 'standard' format:
 *   - If the number is < 1000, show 2 decimals (e.g. '123.45')
 *   - If the number is >= 1000, don't show any decimals (e.g. '1,234')
 *
 * - 'compact' format:
 *   - If the number is < 1 million, use 'standard' format
 *   - If the number is >= 1 million, use word notation (e.g. '540.23M', '20.05B')
 */
export function formatNumber(
    num: number,
    format: "standard"|"compact" = "standard"
): string {
    if (format === "standard") {
        return formatNumberStandard(num);
    } else {
        return formatNumberCompact(num);
    }
}

function formatNumberStandard(num: number): string {
    if (num < 1) {
        return String(num);
    } else if (num < 1000) {
        return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
        return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
    }
}

function formatNumberCompact(num: number): string {
    if (num < 1_000_000) {
        return formatNumberStandard(num);
    } else if (num < 1_000_000_000) {
        return formatNumberStandard(num / 1_000_000) + "M";
    } else if (num < 1_000_000_000_000) {
        return formatNumberStandard(num / 1_000_000_000) + "B";
    } else {
        return formatNumberStandard(num / 1_000_000_000_000) + "T";
    }
}

/**
 * Format a bigint into a readable string, scaled down to the specified decimals.
 * @deprecated
 */
export function formatBigInt(
    big: bigint,
    decimals: number,
    format: "standard"|"compact" = "standard"
): string {
    const num = convertBigIntToNumber(big, decimals); // eslint-disable-line @typescript-eslint/no-deprecated
    return formatNumber(num, format);
}

/**
 * Convert a bigint to a number, scaled down to the specified decimals.
 * @deprecated
 * @see balanceToString
 */
export function convertBigIntToNumber(big: bigint, decimals: number): number {
    return Number(big) / 10**decimals;
}

/**
 * Convert a number to a bigint, scaled to the specified decimals.
 * @deprecated
 * @see stringToBalance
 */
export function convertNumberToBigInt(num: number, decimals: number): bigint {
    const numScaledAsString = (num * 10**decimals).toFixed(0);
    return BigInt(numScaledAsString);
}
