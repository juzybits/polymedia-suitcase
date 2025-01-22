import { SuiCallArg, SuiClient, SuiObjectRef, SuiTransactionBlockResponse } from "@mysten/sui/client";
import { SignatureWithBytes, Signer } from "@mysten/sui/cryptography";
import { Transaction, TransactionObjectInput, TransactionResult } from "@mysten/sui/transactions";

import { isSuiObjectRef } from "./guards.js";

/**
 * An item in the array returned by a `Transaction.moveCall()` call.
 */
export type NestedResult = ReturnType<Transaction["moveCall"]> extends (infer Item)[] ? Item : never;

/**
 * Either a `TransactionObjectInput` or a `SuiObjectRef`.
 */
export type ObjectInput = TransactionObjectInput | SuiObjectRef;

/**
 * A function that can sign a `Transaction`.
 *
 * For apps that use `@mysten/dapp-kit` to sign with a Sui wallet:
    ```
    const { mutateAsync: walletSignTx } = useSignTransaction();
    const signTx: SignTx = async (tx) => {
        return walletSignTx({ transaction: tx });
    };
    ```
 * For code that has direct access to the private key:
    ```
    const secretKey = "suiprivkey1...";
    const signer = pairFromSecretKey(secretKey)
    const signTx: SignTx = async (tx) => {
        tx.setSenderIfNotSet(signer.toSuiAddress());
        const txBytes = await tx.build({ client: suiClient });
        return signer.signTransaction(txBytes);
    };
    ```
 */
export type SignTx = (tx: Transaction) => Promise<SignatureWithBytes>;

/**
 * Get the value of a `SuiCallArg` (transaction input).
 * If the argument is a pure value, return it.
 * If the argument is an object, return its ID.
 */
export function getArgVal<T>(arg: SuiCallArg): T {
    if (arg.type === "pure") {
        return arg.value as T;
    }
    return arg.objectId as T;
}

/**
 * Create a `SignTx` function that uses a `Signer` to sign a `Transaction`.
 */
export function newSignTx(
    suiClient: SuiClient,
    signer: Signer,
): SignTx
{
    return async (tx: Transaction) => {
        tx.setSenderIfNotSet(signer.toSuiAddress());
        const txBytes = await tx.build({ client: suiClient });
        return signer.signTransaction(txBytes);
    };
}

/**
 * Transform an `ObjectInput` into an argument for `Transaction.moveCall()`.
 */
export function objectArg(
    tx: Transaction,
    obj: ObjectInput,
) {
    return isSuiObjectRef(obj)
        ? tx.objectRef(obj)
        : tx.object(obj);
}

/**
 * Validate a `SuiTransactionBlockResponse` of the `ProgrammableTransaction` kind
 * and return its `.transaction.data`.
 */
export function txResToData(
    resp: SuiTransactionBlockResponse,
)
{
    if (resp.errors && resp.errors.length > 0) {
        throw Error(`response error: ${JSON.stringify(resp, null, 2)}`);
    }
    if (resp.transaction?.data.transaction.kind !== "ProgrammableTransaction") {
        throw Error(`response has no data or is not a ProgrammableTransaction: ${JSON.stringify(resp, null, 2)}`);
    }
    return {
        sender: resp.transaction.data.sender,
        gasData: resp.transaction.data.gasData,
        inputs: resp.transaction.data.transaction.inputs,
        txs: resp.transaction.data.transaction.transactions,
    };
}

/**
 * Build transactions for the `sui::transfer` module.
 */
export const TransferModule =
{
    public_freeze_object(
        tx: Transaction,
        obj_type: string,
        obj: ObjectInput,
    ): TransactionResult
    {
        return tx.moveCall({
            target: "0x2::transfer::public_freeze_object",
            typeArguments: [ obj_type ],
            arguments: [ objectArg(tx, obj) ],
        });
    },

    public_share_object(
        tx: Transaction,
        obj_type: string,
        obj: ObjectInput,
    ): TransactionResult
    {
        return tx.moveCall({
            target: "0x2::transfer::public_share_object",
            typeArguments: [ obj_type ],
            arguments: [ objectArg(tx, obj) ],
        });
    },

    public_transfer(
        tx: Transaction,
        obj_type: string,
        obj: ObjectInput,
        recipient: string,
    ): TransactionResult
    {
        return tx.moveCall({
            target: "0x2::transfer::public_transfer",
            typeArguments: [ obj_type ],
            arguments: [
                objectArg(tx, obj),
                tx.pure.address(recipient),
            ],
        });
    },
};
