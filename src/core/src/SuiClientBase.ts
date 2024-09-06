import { QueryTransactionBlocksParams, SuiClient, SuiObjectResponse, SuiTransactionBlockResponse, SuiTransactionBlockResponseOptions } from "@mysten/sui/client";
import { SignatureWithBytes } from "@mysten/sui/cryptography";
import { Transaction } from "@mysten/sui/transactions";
import { chunkArray } from "./misc.js";
import { objResToId } from "./objects.js";
import { SignTransaction } from "./types.js";

/**
 * Options for `SuiClient.waitForTransaction()`.
 */
export type WaitForTxOptions = {
    timeout: number;
    pollInterval: number;
};

/**
 * The maximum number of objects that can be fetched from the RPC in a single request.
 */
const MAX_OBJECTS_PER_REQUEST = 50;

/**
 * Abstract class to sign and execute Sui transactions.
 */
export abstract class SuiClientBase
{
    public readonly suiClient: SuiClient;
    public readonly signTransaction: SignTransaction;
    protected readonly txResponseOptions: SuiTransactionBlockResponseOptions;
    protected readonly waitForTxOptions: WaitForTxOptions | false;

    /**
     * @param suiClient The client used to communicate with Sui.
     * @param signTransaction A function that signs transactions.
     * @param txResponseOptions Which fields to include in transaction responses.
     * @param waitForTxOptions Options for `SuiClient.waitForTransaction()`.
     */
    constructor(
        suiClient: SuiClient,
        signTransaction: SignTransaction,
        txResponseOptions: SuiTransactionBlockResponseOptions = { showEffects: true, showObjectChanges: true },
        waitForTxOptions: WaitForTxOptions = { timeout: 60_000, pollInterval: 333 },
    ) {
        this.suiClient = suiClient;
        this.signTransaction = signTransaction;
        this.txResponseOptions = txResponseOptions;
        this.waitForTxOptions = waitForTxOptions;
    }

    // === data fetching ===

    /**
     * Fetch and parse objects from the RPC and cache them.
     * @param objectIds The IDs of the objects to fetch.
     * @param cache The cache to use (if any). Keys are object IDs and values are the parsed objects.
     * @param fetchFn A function that fetches objects from the Sui network.
     * @param parseFn A function that parses a `SuiObjectResponse` into an object.
     * @returns The parsed objects.
     */
    public async fetchAndParseObjects<T>(
        objectIds: string[],
        cache: Map<string, T> | null,
        fetchFn: (ids: string[]) => Promise<SuiObjectResponse[]>,
        parseFn: (objRes: SuiObjectResponse) => T | null
    ): Promise<T[]>
    {
        const results: T[] = [];
        const uncachedIds: string[] = [];

        for (const id of objectIds) {
            const cachedObject = cache ? cache.get(id) : undefined;
            if (cachedObject) {
                results.push(cachedObject);
            } else {
                uncachedIds.push(id);
            }
        }

        if (uncachedIds.length === 0) {
            return results;
        }

        const idChunks = chunkArray(uncachedIds, MAX_OBJECTS_PER_REQUEST);
        const allResults = await Promise.allSettled(
            idChunks.map(fetchFn)
        );

        for (const result of allResults) {
            if (result.status === "fulfilled") {
                const pagObjRes = result.value;
                for (const objRes of pagObjRes) {
                    const parsedObject = parseFn(objRes);
                    if (parsedObject) {
                        results.push(parsedObject);
                        if (cache) {
                            cache.set(objResToId(objRes), parsedObject);
                        }
                    }
                }
            } else {
                console.warn(`[fetchAndParseObjects] Failed to fetch objects: ${result.reason}`);
            }
        }

        return results;
    }

    /**
     * Fetch and parse transactions from the RPC.
     */
    public async fetchAndParseTxs<T>(
        parseFn: (txRes: SuiTransactionBlockResponse) => T | null,
        query: QueryTransactionBlocksParams,
    ) {
        const pagTxRes = await this.suiClient.queryTransactionBlocks(query);

        const results = {
            cursor: pagTxRes.nextCursor,
            hasNextPage: pagTxRes.hasNextPage,
            data: pagTxRes.data
                .map(txRes => parseFn(txRes))
                .filter(result => result !== null),
        };

        return results;
    }

    // === errors ===

    /**
     * Extract the numeric error code from a tx response and map it to an error message.
     *
     * Example error string:
     * `MoveAbort(MoveLocation { module: ModuleId { address: 0x123, name: Identifier("the_module") }, function: 1, instruction: 29, function_name: Some("the_function") }, 5008) in command 2`
     */
    public parseErrorCode(
        txRes: SuiTransactionBlockResponse,
        errors: Record<number, string>,
    ): string
    {
        if (!txRes.effects?.status.error) {
            return "unknown error";
        }
        const match = txRes.effects.status.error.match(/MoveAbort.+, (\d+)\)/);
        if (!match) {
            return txRes.effects.status.error;
        }
        const code = parseInt(match[1]);
        if (isNaN(code) || !(code in errors)) {
            return txRes.effects.status.error;
        }
        return errors[code];
    }

    // === transactions ===

    public async executeTransaction(
        signedTx: SignatureWithBytes,
        waitForTxOptions: WaitForTxOptions | false = this.waitForTxOptions,
        txResponseOptions: SuiTransactionBlockResponseOptions = this.txResponseOptions,
    ): Promise<SuiTransactionBlockResponse>
    {
        const resp = await this.suiClient.executeTransactionBlock({
            transactionBlock: signedTx.bytes,
            signature: signedTx.signature,
            options: txResponseOptions,
        });

        if (!waitForTxOptions) {
            return resp;
        }

        return await this.suiClient.waitForTransaction({
            digest: resp.digest,
            options: txResponseOptions,
            timeout: waitForTxOptions.timeout,
            pollInterval: waitForTxOptions.pollInterval,
        });
    }

    public async signAndExecuteTransaction(
        tx: Transaction,
        waitForTxOptions: WaitForTxOptions | false = this.waitForTxOptions,
        txResponseOptions: SuiTransactionBlockResponseOptions = this.txResponseOptions,
    ): Promise<SuiTransactionBlockResponse>
    {
        const signedTx = await this.signTransaction(tx);
        return this.executeTransaction(signedTx, waitForTxOptions, txResponseOptions);
    }
}
