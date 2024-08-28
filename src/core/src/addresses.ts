import { isValidSuiAddress, normalizeSuiAddress } from "@mysten/sui/utils";

/**
 * Regular expression to match a normalized Sui address.
 */
export const NORMALIZED_ADDRESS_REGEX = "0[xX][a-fA-F0-9]{64}";

/**
 * The 0x0 address.
 */
export const ZERO_ADDRESS = normalizeSuiAddress("0x0");

/**
 * Generate a random Sui address (for development only).
 */
export function generateRandomAddress() {
    // Function to generate a random byte in hexadecimal format
    const randomByteHex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0");

    // Generate 32 random bytes and convert each to hex
    const address = "0x" + Array.from({ length: 32 }, randomByteHex).join("");

    return address;
}

/**
 * Remove leading zeros from a Sui address (lossless). For example it will turn
 * '0x0000000000000000000000000000000000000000000000000000000000000002' into '0x2'.
 */
export function removeAddressLeadingZeros(
    address: string,
): string {
    return address.replaceAll(/0x0+/g, "0x");
}

/**
 * Abbreviate a Sui address for display purposes (lossy). Default format is '0x1234…5678',
 * given an address like '0x1234000000000000000000000000000000000000000000000000000000005678'.
 */
export function shortenAddress(
    text: string|null|undefined, start=4, end=4, separator="…", prefix="0x",
): string {
    if (!text) return "";

    const addressRegex = /0[xX][a-fA-F0-9]{1,}/g;

    return text.replace(addressRegex, (match) => {
        // check if the address is too short to be abbreviated
        if (match.length - prefix.length <= start + end) {
            return match;
        }
        // otherwise, abbreviate the address
        return prefix + match.slice(2, 2 + start) + separator + match.slice(-end);
    });
}

/**
 * Validate a Sui address and return its normalized form, or `null` if invalid.
 */
export function validateAndNormalizeSuiAddress(
    address: string,
): string | null {
    if (address.length === 0) {
        return null;
    }
    const normalizedAddr = normalizeSuiAddress(address);
    if (!isValidSuiAddress(normalizedAddr)) {
        return null;
    }
    return normalizedAddr;
}
