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
 *
 * - 'standard' format:
 *   - If the number is < 1000, show 2 decimals (e.g. '123.45')
 *   - If the number is >= 1000, don't show any decimals (e.g. '1,234')
 *
 * - 'compact' format:
 *   - If the number is < 1 million, use 'standard' format
 *   - If the number is >= 1 million, use word notation (e.g. '540.23M', '20.05B')
 */
export function formatBalance(
    big: bigint,
    decimals: number,
    format: "standard" | "compact" = "standard"
): string {
    const isNegative = big < 0n;
    const absoluteBig = isNegative ? -big : big;
    const stringValue = balanceToString(absoluteBig, decimals);

    // If the number is effectively zero, return "0.00"
    if (stringValue === "0") {
        return "0.00";
    }

    const [integerPart, fractionalPart = ""] = stringValue.split(".");

    const result = format === "standard"
        ? formatBigIntStandard(integerPart, fractionalPart)
        : formatBigIntCompact(integerPart, fractionalPart);

    return isNegative ? "-" + result : result;
}

function formatBigIntStandard(integerPart: string, fractionalPart: string): string {
    const bigIntValue = BigInt(integerPart);
    if (bigIntValue === 0n && fractionalPart !== "") {
        // For very small numbers (0.xxx), show all significant digits
        // Remove trailing zeros from fractional part
        const significantDecimals = fractionalPart.replace(/0+$/, '');
        return `0.${significantDecimals}`;
    }

    if (bigIntValue < 1000n) {
        const formattedFraction = fractionalPart.slice(0, 2).padEnd(2, "0");
        return `${integerPart}.${formattedFraction}`;
    } else {
        return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

function formatBigIntCompact(integerPart: string, fractionalPart: string): string {
    const bigIntValue = BigInt(integerPart);
    if (bigIntValue < 1_000_000n) {
        return formatBigIntStandard(integerPart, fractionalPart);
    } else if (bigIntValue < 1_000_000_000n) {
        return formatCompactPart(integerPart, 6, "M");
    } else if (bigIntValue < 1_000_000_000_000n) {
        return formatCompactPart(integerPart, 9, "B");
    } else {
        return formatCompactPart(integerPart, 12, "T");
    }
}

function formatCompactPart(integerPart: string, digits: number, suffix: string): string {
    const wholePart = integerPart.slice(0, -digits) || "0";
    const decimalPart = integerPart.slice(-digits).padStart(2, "0").slice(0, 2);

    if (wholePart.length <= 3) {
        return `${wholePart}.${decimalPart}${suffix}`;
    } else {
        return `${addThousandsSeparators(wholePart)}${suffix}`;
    }
}

function addThousandsSeparators(numStr: string): string {
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
