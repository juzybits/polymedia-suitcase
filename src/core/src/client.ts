import {
    DynamicFieldInfo,
    SuiClient,
    SuiExecutionResult,
    SuiObjectRef,
    SuiObjectResponse,
} from "@mysten/sui/client";
import { Transaction, TransactionResult } from "@mysten/sui/transactions";
import { removeAddressLeadingZeros } from "./address.js";
import { sleep } from "./misc.js";
import { measureRpcLatency } from "./rpc.js";
import { ObjectArg } from "./types.js";

/**
 * Call `SuiClient.devInspectTransactionBlock()` and return the results.
 */
export async function devInspectAndGetResults(
    suiClient: SuiClient,
    tx: Transaction,
    sender = "0x7777777777777777777777777777777777777777777777777777777777777777",
): Promise<SuiExecutionResult[]> {
    const resp = await suiClient.devInspectTransactionBlock({
        sender: sender,
        transactionBlock: tx,
    });
    if (resp.error) {
        throw Error(`response error: ${JSON.stringify(resp, null, 2)}`);
    }
    if (!resp.results?.length) {
        throw Error(`response has no results: ${JSON.stringify(resp, null, 2)}`);
    }
    return resp.results;
}

/**
 * Call `SuiClient.devInspectTransactionBlock()` and return the deserialized return values.
 * @returns An array with the deserialized return values of each transaction in the TransactionBlock.
 *
export async function devInspectAndGetReturnValues( // TODO
    suiClient: SuiClient,
    tx: Transaction,
    sender = "0x7777777777777777777777777777777777777777777777777777777777777777",
): Promise<unknown[][]> {
    const results = await devInspectAndGetResults(suiClient, tx, sender);
    // The values returned from each of the transactions in the TransactionBlock
    const blockReturnValues: unknown[][] = [];
    for (const txnResult of results) {
        if (!txnResult.returnValues?.length) {
            throw Error(`transaction didn't return any values: ${JSON.stringify(txnResult, null, 2)}`);
        }
        // The values returned from the transaction (a function can return multiple values)
        const txnReturnValues: unknown[] = [];
        for (const value of txnResult.returnValues) {
            const valueData = Uint8Array.from(value[0]);
            const valueType = value[1];
            let valueDeserialized: unknown;
            if (valueType === "0x1::string::String") {
                valueDeserialized = bcs.string().parse(valueData);
            } else if (valueType === "vector<0x1::string::String>") {
                valueDeserialized = bcs.vector(bcs.string()).parse(valueData);
            } else {
                valueDeserialized = bcs.de(valueType, valueData, "hex");
            }
            txnReturnValues.push(valueDeserialized);
        }
        blockReturnValues.push(txnReturnValues);
    }
    return blockReturnValues;
}
*/

/**
 * Get all dynamic object fields owned by an object.
 */
export async function fetchAllDynamicFields(
    suiClient: SuiClient,
    parentId: string,
    sleepBetweenRequests = 333, // milliseconds
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
 * Get a `Coin<T>` of a given value from the owner. Handles coin merging and splitting.
 * Assumes that the owner has enough balance.
 */
export async function getCoinOfValue(
    suiClient: SuiClient,
    tx: Transaction,
    ownerAddress: string,
    coinType: string,
    coinValue: number|bigint,
): Promise<TransactionResult> {
    let coinOfValue: TransactionResult;
    coinType = removeAddressLeadingZeros(coinType);
    if (coinType === "0x2::sui::SUI") {
        coinOfValue = tx.splitCoins(tx.gas, [tx.pure.u64(coinValue)]);
    }
    else {
        const paginatedCoins = await suiClient.getCoins({ owner: ownerAddress, coinType });
        // if (paginatedCoins.hasNextPage) // TODO

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
    if (resp.data?.content?.dataType !== "moveObject") {
        throw Error(`content missing: ${JSON.stringify(resp, null, 2)}`);
    }
    if (typeRegex && !new RegExp(typeRegex).test(resp.data.content.type)) {
        throw Error(`wrong object type: ${JSON.stringify(resp, null, 2)}`);
    }
    return resp.data.content.fields as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Check if a given object conforms to the `SuiObjectRef` interface.
 */
/* eslint-disable */
export function isSuiObjectRef(obj: any): obj is SuiObjectRef {
    return obj
        && typeof obj.objectId !== "undefined"
        && typeof obj.version !== "undefined"
        && typeof obj.digest !== "undefined";
}
/* eslint-enable */

/**
 * Build an object argument for `Transaction.moveCall()`.
 */
export function objectArg(
    tx: Transaction,
    obj: ObjectArg,
) {
    return isSuiObjectRef(obj)
        ? tx.objectRef(obj)
        : tx.object(obj);
}
