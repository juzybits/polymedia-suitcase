import { BcsType } from "@mysten/sui/bcs";
import {
    DynamicFieldInfo,
    SuiClient,
    SuiExecutionResult,
    SuiObjectRef
} from "@mysten/sui/client";
import { Transaction, TransactionResult } from "@mysten/sui/transactions";

import { removeAddressLeadingZeros } from "./addresses.js";
import { RPC_QUERY_MAX_RESULTS } from "./constants.js";
import { sleep } from "./misc.js";

/**
 * Call `SuiClient.devInspectTransactionBlock()` and return the execution results.
 */
export async function devInspectAndGetExecutionResults(
    suiClient: SuiClient,
    tx: Transaction | Uint8Array | string,
    sender = "0x7777777777777777777777777777777777777777777777777777777777777777",
): Promise<SuiExecutionResult[]>
{
    const resp = await suiClient.devInspectTransactionBlock({
        sender: sender,
        transactionBlock: tx,
    });
    if (resp.error) {
        throw new Error(`Response error: ${JSON.stringify(resp, null, 2)}`);
    }
    if (!resp.results?.length) {
        throw new Error(`Response has no results: ${JSON.stringify(resp, null, 2)}`);
    }
    return resp.results;
}

/**
 * Call `SuiClient.devInspectTransactionBlock()` and return the deserialized return values.
 * @returns An array with the deserialized return values of each transaction in the TransactionBlock.
 *
 * @example
    ```
    const blockReturnValues = await devInspectAndGetReturnValues(suiClient, tx, [
        [
            bcs.vector(bcs.Address),
            bcs.Bool,
            bcs.U64,
        ],
    ]);
    ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function devInspectAndGetReturnValues<T extends any[]>(
    suiClient: SuiClient,
    tx: Transaction | Uint8Array | string,
    blockParsers: BcsType<T[number]>[][],
    sender = "0x7777777777777777777777777777777777777777777777777777777777777777",
): Promise<T[]>
{
    const blockResults = await devInspectAndGetExecutionResults(suiClient, tx, sender);

    if (blockParsers.length !== blockResults.length) {
        throw new Error(`You provided parsers for ${blockParsers.length} txs but the txblock contains ${blockResults.length} txs`);
    }

    // The values returned from each of the transactions in the TransactionBlock
    const blockReturns: T[] = [];

    for (const [txIdx, txResult] of blockResults.entries()) {
        if (!txResult.returnValues?.length) {
            throw new Error(`Transaction ${txIdx} didn't return any values: ${JSON.stringify(txResult, null, 2)}`);
        }

        const txParsers = blockParsers[txIdx];

        if (txParsers.length !== txResult.returnValues.length) {
            throw new Error(`You provided parsers for ${txParsers.length} return values but tx ${txIdx} contains ${txResult.returnValues.length} return values`);
        }

        // The values returned from the transaction (a function can return multiple values)
        const txReturns: T[number][] = [];

        for (const [valueIdx, value] of txResult.returnValues.entries()) {
            const parser = txParsers[valueIdx];
            const valueData = Uint8Array.from(value[0]);
            const valueDeserialized = parser.parse(valueData);
            txReturns.push(valueDeserialized);
        }

        blockReturns.push(txReturns as T[number]);
    }

    return blockReturns;
}

/**
 * Get dynamic object fields owned by an object.
 * If limit is not specified, fetch all DOFs.
 */
export async function fetchDynamicFields({
    client, parentId, limit, cursor, sleepMsBetweenReqs, onUpdate,
}: {
    client: SuiClient;
    parentId: string;
    limit?: number;
    cursor?: string | null | undefined;
    sleepMsBetweenReqs?: number;
    onUpdate?: (msg: string) => unknown;
}): Promise<{
    data: DynamicFieldInfo[];
    hasNextPage: boolean;
    cursor: string | null | undefined;
}> {
    const fields: DynamicFieldInfo[] = [];
    let hasNextPage = true;
    while (hasNextPage && (!limit || fields.length < limit))
    {
        onUpdate?.(`Fetching batch ${fields.length}${limit ? `/${limit}` : ""}`);

        const batchLimit = !limit
            ? RPC_QUERY_MAX_RESULTS
            : Math.min(RPC_QUERY_MAX_RESULTS, limit - fields.length);

        const page = await client.getDynamicFields({
            parentId, cursor, limit: batchLimit
        });

        fields.push(...page.data);
        hasNextPage = page.hasNextPage;
        cursor = page.nextCursor;

        sleepMsBetweenReqs && await sleep(sleepMsBetweenReqs);
    }
    return { data: fields, hasNextPage, cursor };
}

/**
 * Get a `Coin<T>` of a given value from the owner. Handles coin merging and splitting.
 * Assumes that the owner has enough balance.
 * @deprecated Use `coinWithBalance` from `@mysten/sui` instead.
 */
export async function getCoinOfValue(
    suiClient: SuiClient,
    tx: Transaction,
    owner: string,
    coinType: string,
    coinValue: number|bigint,
): Promise<TransactionResult>
{
    let coinOfValue: TransactionResult;
    coinType = removeAddressLeadingZeros(coinType);
    if (coinType === "0x2::sui::SUI") {
        coinOfValue = tx.splitCoins(tx.gas, [tx.pure.u64(coinValue)]);
    }
    else {
        const paginatedCoins = await suiClient.getCoins({ owner, coinType });

        // Merge all coins into one
        const [firstCoin, ...otherCoins] = paginatedCoins.data;
        const firstCoinInput = tx.object(firstCoin.coinObjectId);
        if (otherCoins.length > 0) {
            tx.mergeCoins(firstCoinInput, otherCoins.map(coin => coin.coinObjectId));
        }
        coinOfValue = tx.splitCoins(firstCoinInput, [tx.pure.u64(coinValue)]);
    }
    return coinOfValue;
}

/**
 * Fetch the latest version of an object and return its `SuiObjectRef`.
 */
export async function getSuiObjectRef(
    suiClient: SuiClient,
    objectId: string,
): Promise<SuiObjectRef>
{
    const resp = await suiClient.getObject({ id: objectId });
    if (resp.error || !resp.data) {
        throw new Error(`[getSuiObjectRef] failed to fetch objectId | error: ${JSON.stringify(resp.error)}`);
    }
    return {
        objectId: resp.data.objectId,
        digest: resp.data.digest,
        version: resp.data.version,
    };
}
