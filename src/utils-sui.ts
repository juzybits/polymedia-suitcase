/* Sui utils */

import { bcs } from '@mysten/sui.js/bcs';
import { DynamicFieldInfo, SuiClient, SuiExecutionResult, SuiObjectResponse } from '@mysten/sui.js/client';
import { TransactionBlock, TransactionResult } from '@mysten/sui.js/transactions';
import { isValidSuiAddress, normalizeSuiAddress } from '@mysten/sui.js/utils';
import { NetworkName, SuiExplorerItem } from './types.js';
import { sleep } from './utils-misc.js';

/**
 * Call `SuiClient.devInspectTransactionBlock()` and return the results.
 */
export async function devInspectAndGetResults(
    suiClient: SuiClient,
    txb: TransactionBlock,
    sender = '0x7777777777777777777777777777777777777777777777777777777777777777',
): Promise<SuiExecutionResult[]> {
    return await suiClient.devInspectTransactionBlock({
        sender: sender,
        transactionBlock: txb
    }).then(resp => {
        if (resp.error) {
            throw Error(`response error: ${JSON.stringify(resp, null, 2)}`);
        }
        if (!resp.results?.length) {
            throw Error(`response has no results: ${JSON.stringify(resp, null, 2)}`);
        }
        return resp.results;
    });
}

/**
 * Call `SuiClient.devInspectTransactionBlock()` and return the deserialized return values.
 * @returns An array with the deserialized return values of each transaction in the TransactionBlock.
 */
export async function devInspectAndGetReturnValues(
    suiClient: SuiClient,
    txb: TransactionBlock,
    sender = '0x7777777777777777777777777777777777777777777777777777777777777777',
): Promise<unknown[][]> {
    return await devInspectAndGetResults(
        suiClient,
        txb,
        sender,
    ).then(results => {
        /**
         * The values returned from each of the transactions in the TransactionBlock.
         */
        const blockReturnValues: unknown[][] = [];
        for (const txnResult of results) {
            if (!txnResult.returnValues?.length) {
                throw Error(`transaction didn't return any values: ${JSON.stringify(txnResult, null, 2)}`);
            }
            /**
             * The values returned from the transaction (a function can return multiple values).
             */
            const txnReturnValues: unknown[] = [];
            for (const value of txnResult.returnValues) {
                const valueData = Uint8Array.from(value[0]);
                const valueType = value[1];
                const valueDeserialized: unknown = bcs.de(valueType, valueData, 'hex');
                txnReturnValues.push(valueDeserialized);
            }
            blockReturnValues.push(txnReturnValues);
        }
        return blockReturnValues;
    });
}

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
 * Generate a random Sui address (for development only).
 */
export function generateRandomAddress() {
    // Function to generate a random byte in hexadecimal format
    const randomByteHex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0');

    // Generate 32 random bytes and convert each to hex
    const address = '0x' + Array.from({ length: 32 }, randomByteHex).join('');

    return address;
}

/**
 * Get a `Coin<T>` of a given value from the owner. Handles coin merging and splitting.
 * Assumes that the owner has enough balance.
 */
export async function getCoinOfValue(
    suiClient: SuiClient,
    txb: TransactionBlock,
    ownerAddress: string,
    coinType: string,
    coinValue: number|bigint,
): Promise<TransactionResult> {
    let coinOfValue: TransactionResult;
    coinType = removeLeadingZeros(coinType);
    if (coinType === '0x2::sui::SUI') {
        coinOfValue = txb.splitCoins(txb.gas, [txb.pure(coinValue)]);
    }
    else {
        const paginatedCoins = await suiClient.getCoins({ owner: ownerAddress, coinType });
        // if (paginatedCoins.hasNextPage) // TODO

        // Merge all coins into one
        const [firstCoin, ...otherCoins] = paginatedCoins.data;
        const firstCoinInput = txb.object(firstCoin.coinObjectId);
        if (otherCoins.length > 0) {
            txb.mergeCoins(
                firstCoinInput,
                otherCoins.map(coin => txb.object(coin.coinObjectId))
            );
        }
        coinOfValue = txb.splitCoins(firstCoinInput, [txb.pure(coinValue)]);
    }
    return coinOfValue;
}

/**
 * Validate a SuiObjectResponse and return its content.
 * @param resp A `SuiObjectResponse` from `SuiClient.getObject()` / `.multiGetObjects()` / `.getDynamicFieldObject()`
 * @param typeRegex (optional) A regular expression to check that `resp.data.content.type` has the right type
 * @returns The contents of `resp.data.content.fields`
 */
export function getSuiObjectResponseFields(
    resp: SuiObjectResponse,
    typeRegex?: string,
): Record<string, any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (resp.error) {
        throw Error(`response error: ${JSON.stringify(resp, null, 2)}`);
    }
    if (resp.data?.content?.dataType !== 'moveObject') {
        throw Error(`content missing: ${JSON.stringify(resp, null, 2)}`);
    }
    if (typeRegex && !new RegExp(typeRegex).test(resp.data.content.type)) {
        throw Error(`wrong object type: ${JSON.stringify(resp, null, 2)}`);
    }
    return resp.data.content.fields as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
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
 * Remove leading zeros from a Sui address (lossless). For example it will turn
 * '0x0000000000000000000000000000000000000000000000000000000000000002' into '0x2'.
 */
export function removeLeadingZeros(address: string): string {
    return address.replaceAll(/0x0+/g, '0x');
}

/**
 * Get SUI from the faucet on localnet/devnet/testnet.
 */
export async function requestSuiFromFaucet(network: 'localnet'|'devnet'|'testnet', address: string) {
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
 * Abbreviate a Sui address for display purposes (lossy). Default format is '1234..5678',
 * given an address like '0x1234000000000000000000000000000000000000000000000000000000005678'.
 */
export function shortenSuiAddress(
    text: string|null|undefined, start=4, end=4, prefix='0x', separator='..'
): string {
    if (!text) return '';

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
export function validateAndNormalizeSuiAddress(address: string): string | null {
    const normalizedAddr = normalizeSuiAddress(address);
    if (!isValidSuiAddress(normalizedAddr)) {
        return null;
    }
    return normalizedAddr;
}
