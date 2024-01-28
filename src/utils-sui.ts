/* Sui utils */

import { isValidSuiAddress, normalizeSuiAddress } from '@mysten/sui.js/utils';
import { NetworkName, SuiExplorerItem } from './types.js';

/**
 * Generate a random Sui address (for development only)
 */
export function generateRandomAddressDevOnly() {
    // Function to generate a random byte in hexadecimal format
    const randomByteHex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0');

    // Generate 32 random bytes and convert each to hex
    const address = '0x' + Array.from({ length: 32 }, randomByteHex).join('');

    return address;
}

/**
 * Build a Sui Explorer URL, like 'https://suiexplorer.com/address/0x123...456?network=testnet'
 */
export function makeSuiExplorerUrl(
    network: NetworkName,
    kind: SuiExplorerItem,
    address: string,
): string {
    const baseUrl = network === 'localnet'
        ? 'http://localhost:3000'
        : 'https://suiexplorer.com';
    let url = `${baseUrl}/${kind}/${address}`;
    if (network !== 'mainnet') {
        const networkLabel = network === 'localnet' ? 'local' : network;
        url += `?network=${networkLabel}`;
    }
    return url;
}

/**
 * Shorten a Sui address. Default format is '1234..5678' (given an address
 * like '0x1234000000000000000000000000000000000000000000000000000000005678')
 */
export function shortenSuiAddress(address: string|null|undefined, start=4, end=4, prefix='', separator='..'): string {
    return !address ? '' : prefix + address.slice(2, 2+start) + separator + address.slice(-end);
}

/**
 * Validate a Sui address and return its normalized form, or `null` if invalid.
 */
export function validateAndNormalizeSuiAddress(address: string): string | null {
    const normalizedAddr = normalizeSuiAddress(address);
    if (!isValidSuiAddress(normalizedAddr)) {
        return null;
    }
    return normalizedAddr;
}
