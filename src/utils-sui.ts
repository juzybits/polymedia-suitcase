/* Sui utils */

import { DynamicFieldInfo, SuiClient } from '@mysten/sui.js/client';
import { isValidSuiAddress, normalizeSuiAddress } from '@mysten/sui.js/utils';
import { NetworkName, SuiExplorerItem } from './types.js';
import { sleep } from './utils-misc.js';

/**
 * Get all dynamic object fields owned by an object.
 */
export async function fetchAllDynamicFields(
    suiClient: SuiClient,
    parentId: string,
    sleepBetweenRequests = 330, // milliseconds
    verbose = false,
): Promise<DynamicFieldInfo[]> {
    const allFieldsInfo: DynamicFieldInfo[] = [];
    let hasNextPage = true as boolean; // type cast so ESLint doesn't complain about 'no-unnecessary-condition'
    let cursor: string|null = null;
    let pageNumber = 1;
    while (hasNextPage) {
        if (verbose) {
            console.log(`Fetching page ${pageNumber}`);
        }
        pageNumber++;
        await suiClient.getDynamicFields({ parentId, cursor })
        .then(async page => {
            allFieldsInfo.push(...page.data);
            hasNextPage = page.hasNextPage;
            cursor = page.nextCursor;
            if (sleepBetweenRequests > 0) {
                await sleep(sleepBetweenRequests); // give the RPC a break
            }
        });
    }
    return allFieldsInfo;
}

/**
 * Generate a random Sui address (for development only)
 */
export function generateRandomAddress() {
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
 * Send SUI to an address on localnet/devnet/testnet.
 */
export async function useSuiFaucet(network: 'localnet'|'devnet'|'testnet', address: string) {
    let faucetUrl: string;
    if (network == 'localnet') {
        faucetUrl='http://127.0.0.1:9123/gas';
    }
    else if (network == 'devnet') {
        faucetUrl='https://faucet.devnet.sui.io/v1/gas';
    }
    else { // network == 'testnet'
        faucetUrl='https://faucet.testnet.sui.io/v1/gas';
    }

    return fetch(faucetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            FixedAmountRequest: {
                recipient: address
            }
        }),
    });
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
