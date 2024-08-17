import { SuiClient, SuiTransactionBlockResponse, SuiTransactionBlockResponseOptions } from "@mysten/sui/client";
import { SignatureWithBytes } from "@mysten/sui/cryptography";
import { Transaction } from "@mysten/sui/transactions";
import { SignTransaction } from "./types.js";

/**
 * Abstract class to sign and execute Sui transactions.
 */
export abstract class SuiClientBase
{
    public readonly suiClient: SuiClient;
    public readonly signTransaction: SignTransaction;
    protected readonly txResponseOptions: SuiTransactionBlockResponseOptions;

    /**
     * @param suiClient The client used to communicate with Sui.
     * @param signTransaction A function that signs transactions.
     * @param txResponseOptions Options for the transaction response.
     */
    constructor(
        suiClient: SuiClient,
        signTransaction: SignTransaction,
        txResponseOptions: SuiTransactionBlockResponseOptions = { showEffects: true },
    ) {
        this.suiClient = suiClient;
        this.signTransaction = signTransaction;
        this.txResponseOptions = txResponseOptions;
    }

    public async executeTransaction(
        signedTx: SignatureWithBytes,
    ): Promise<SuiTransactionBlockResponse>
    {
        return await this.suiClient.executeTransactionBlock({
            transactionBlock: signedTx.bytes,
            signature: signedTx.signature,
            options: this.txResponseOptions,
        });
    }

    public async signAndExecuteTransaction(
        tx: Transaction,
    ): Promise<SuiTransactionBlockResponse>
    {
        const signedTx = await this.signTransaction(tx);
        return this.executeTransaction(signedTx);
    }
}
