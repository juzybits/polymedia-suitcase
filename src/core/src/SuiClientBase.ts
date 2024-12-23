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
 * Abstract class for building Sui SDK clients.
 */
export abstract class SuiClientBase
{
    public readonly suiClient: SuiClient;
    public readonly signTransaction: SignTransaction;
    protected readonly waitForTxOptions: WaitForTxOptions | false;
    protected readonly txResponseOptions: SuiTransactionBlockResponseOptions;

    /**
     * @param suiClient The client used to communicate with Sui.
     * @param signTransaction A function that signs transactions.
     * @param waitForTxOptions Options for `SuiClient.waitForTransaction()`.
     * @param txResponseOptions Which fields to include in transaction responses.
     */
    constructor(args: {
        suiClient: SuiClient;
        signTransaction: SignTransaction;
        waitForTxOptions?: WaitForTxOptions | false;
        txResponseOptions?: SuiTransactionBlockResponseOptions;
    }) {
        this.suiClient = args.suiClient;
        this.signTransaction = args.signTransaction;
        this.waitForTxOptions = args.waitForTxOptions ?? { timeout: 60_000, pollInterval: 333 };
        this.txResponseOptions = args.txResponseOptions ?? { showEffects: true, showObjectChanges: true };
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
        fetchFn: (ids: string[]) => Promise<SuiObjectResponse[]>,
        parseFn: (resp: SuiObjectResponse) => T | null,
        cache?: Map<string, T>,
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
        const allResults = await Promise.all(
            idChunks.map(fetchFn)
        );

        for (const resps of allResults) {
            for (const resp of resps) {
                const parsedObject = parseFn(resp);
                if (parsedObject) {
                    results.push(parsedObject);
                    if (cache) {
                        cache.set(objResToId(resp), parsedObject);
                    }
                }
            }
        }

        return results;
    }

    /**
     * Fetch and parse transactions from the RPC.
     */
    public async fetchAndParseTxs<T>(
        parseFn: (resp: SuiTransactionBlockResponse) => T | null,
        query: QueryTransactionBlocksParams,
    ) {
        const pagTxRes = await this.suiClient.queryTransactionBlocks(query);

        const results = {
            hasNextPage: pagTxRes.hasNextPage,
            nextCursor: pagTxRes.nextCursor,
            data: pagTxRes.data
                .map(resp => parseFn(resp))
                .filter(result => result !== null),
        };

        return results;
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
        const resp = await this.executeTransaction(signedTx, waitForTxOptions, txResponseOptions);

        if (resp.effects && resp.effects.status.status !== "success") {
            throw new Error(`Transaction failed: ${JSON.stringify(resp, null, 2)}`);
        }

        return resp;
    }
}
