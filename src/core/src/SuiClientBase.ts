import { SuiClient, SuiTransactionBlockResponse, SuiTransactionBlockResponseOptions } from "@mysten/sui/client";
import { SignatureWithBytes } from "@mysten/sui/cryptography";
import { Transaction } from "@mysten/sui/transactions";
import { SignTransaction } from "./types.js";

export type WaitForTxOptions = {
    timeout: number;
    pollInterval: number;
};

/**
 * Abstract class to sign and execute Sui transactions.
 */
export abstract class SuiClientBase
{
    public readonly suiClient: SuiClient;
    public readonly signTransaction: SignTransaction;
    protected readonly txResponseOptions: SuiTransactionBlockResponseOptions;
    protected readonly waitForTxOptions: WaitForTxOptions;

    /**
     * @param suiClient The client used to communicate with Sui.
     * @param signTransaction A function that signs transactions.
     * @param txResponseOptions Which fields to include in transaction responses.
     * @param waitForTxOptions Options for `SuiClient.waitForTransaction()`.
     */
    constructor(
        suiClient: SuiClient,
        signTransaction: SignTransaction,
        txResponseOptions: SuiTransactionBlockResponseOptions = { showEffects: true },
        waitForTxOptions: WaitForTxOptions = { timeout: 60_000, pollInterval: 333 },
    ) {
        this.suiClient = suiClient;
        this.signTransaction = signTransaction;
        this.txResponseOptions = txResponseOptions;
        this.waitForTxOptions = waitForTxOptions;
    }

    public async executeTransaction(
        signedTx: SignatureWithBytes,
        waitForTx: boolean = true,
    ): Promise<SuiTransactionBlockResponse>
    {
        const resp = await this.suiClient.executeTransactionBlock({
            transactionBlock: signedTx.bytes,
            signature: signedTx.signature,
            options: this.txResponseOptions,
        });

        if (!waitForTx) {
            return resp;
        }

        return await this.suiClient.waitForTransaction({
            digest: resp.digest,
            options: this.txResponseOptions,
            timeout: this.waitForTxOptions.timeout,
            pollInterval: this.waitForTxOptions.pollInterval,
        });
    }

    public async signAndExecuteTransaction(
        tx: Transaction,
        waitForTx: boolean = true,
    ): Promise<SuiTransactionBlockResponse>
    {
        const signedTx = await this.signTransaction(tx);
        return this.executeTransaction(signedTx, waitForTx);
    }
}
