import { DevInspectTransactionBlockParams, QueryTransactionBlocksParams, SuiClient, SuiObjectResponse, SuiTransactionBlockResponse, SuiTransactionBlockResponseOptions } from "@mysten/sui/client";
import { SignatureWithBytes } from "@mysten/sui/cryptography";
import { Transaction } from "@mysten/sui/transactions";

import { chunkArray } from "./misc.js";
import { objResToId } from "./objects.js";
import { SignTx } from "./txs.js";

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
    public readonly signTx: SignTx;
    public readonly txRespOptions: SuiTransactionBlockResponseOptions;
    public readonly waitForTxOptions: WaitForTxOptions | false;

    /**
     * @param suiClient The client used to communicate with Sui.
     * @param signTx A function that can sign a `Transaction`.
     * @param txRespOptions Which fields to include in transaction responses.
     * @param waitForTxOptions Options for `SuiClient.waitForTransaction()`.
     */
    constructor({
        suiClient,
        signTx,
        txRespOptions = { showEffects: true, showObjectChanges: true },
        waitForTxOptions = { timeout: 45_000, pollInterval: 250 },
    }: {
        suiClient: SuiClient;
        signTx: SignTx;
        txRespOptions?: SuiTransactionBlockResponseOptions;
        waitForTxOptions?: WaitForTxOptions | false;
    }) {
        this.suiClient = suiClient;
        this.signTx = signTx;
        this.txRespOptions = txRespOptions;
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
    public async fetchAndParseObjs<T>({
        ids,
        fetchFn,
        parseFn,
        cache,
    }: {
        ids: string[];
        fetchFn: (ids: string[]) => Promise<SuiObjectResponse[]>;
        parseFn: (resp: SuiObjectResponse) => T | null;
        cache?: Map<string, T>;
    }): Promise<T[]>
    {
        const results: T[] = [];
        const uncachedIds: string[] = [];

        for (const id of ids) {
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
    public async fetchAndParseTxs<T>({
        parseFn,
        query,
    }: {
        parseFn: (resp: SuiTransactionBlockResponse) => T | null;
        query: QueryTransactionBlocksParams;
    }) {
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

    public async executeTx({
        signedTx,
        waitForTxOptions = this.waitForTxOptions,
        txRespOptions = this.txRespOptions,
        dryRun = false,
        sender,
    }: {
        signedTx: SignatureWithBytes;
        waitForTxOptions?: WaitForTxOptions | false;
        txRespOptions?: SuiTransactionBlockResponseOptions;
        dryRun?: boolean;
        sender?: string;
    }): Promise<SuiTransactionBlockResponse>
    {
        if (dryRun) {
            return this.dryRunTx({ tx: signedTx.bytes, sender });
        }

        const resp = await this.suiClient.executeTransactionBlock({
            transactionBlock: signedTx.bytes,
            signature: signedTx.signature,
            options: txRespOptions,
        });

        if (resp.effects && resp.effects.status.status !== "success") {
            throw new Error(`transaction failed: ${JSON.stringify(resp, null, 2)}`);
        }

        if (!waitForTxOptions) {
            return resp;
        }

        return await this.suiClient.waitForTransaction({
            digest: resp.digest,
            options: txRespOptions,
            timeout: waitForTxOptions.timeout,
            pollInterval: waitForTxOptions.pollInterval,
        });
    }

    public async signAndExecuteTx({
        tx,
        waitForTxOptions = this.waitForTxOptions,
        txRespOptions = this.txRespOptions,
        dryRun = false,
        sender,
    }: {
        tx: Transaction;
        waitForTxOptions?: WaitForTxOptions | false;
        txRespOptions?: SuiTransactionBlockResponseOptions;
        dryRun?: boolean;
        sender?: string;
    }): Promise<SuiTransactionBlockResponse>
    {
        if (dryRun) {
            return await this.dryRunTx({ tx, sender });
        }

        const signedTx = await this.signTx(tx);
        const resp = await this.executeTx({ signedTx, waitForTxOptions, txRespOptions });

        return resp;
    }

    public async dryRunTx({
        tx,
        sender = "0x7777777777777777777777777777777777777777777777777777777777777777",
    }: {
        tx: DevInspectTransactionBlockParams["transactionBlock"];
        sender?: string | undefined;
    }): Promise<SuiTransactionBlockResponse>
    {
        const resp = await this.suiClient.devInspectTransactionBlock({
            sender,
            transactionBlock: tx,
        });
        if (resp.effects && resp.effects.status.status !== "success") {
            throw new Error(`devInspect failed: ${JSON.stringify(resp, null, 2)}`);
        }
        return { digest: "", ...resp };
    }
}
