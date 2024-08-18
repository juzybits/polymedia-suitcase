import { SuiObjectRef, SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction, TransactionObjectInput, TransactionResult } from "@mysten/sui/transactions";
import { isSuiObjectRef } from "./objects";

/**
 * An object argument for `Transaction.moveCall()`.
 */
export type ObjectArg = TransactionObjectInput | SuiObjectRef;

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

/**
 * Validate a `SuiTransactionBlockResponse` of the `ProgrammableTransaction` kind
 * and return its `.transaction.data`.
 */
export function txResToData(
    txRes: SuiTransactionBlockResponse,
)
{
    if (txRes.errors && txRes.errors.length > 0) {
        throw Error(`response error: ${JSON.stringify(txRes, null, 2)}`);
    }
    if (txRes.transaction?.data.transaction.kind !== "ProgrammableTransaction") {
        throw Error(`response has no data or is not a ProgrammableTransaction: ${JSON.stringify(txRes, null, 2)}`);
    }
    return {
        sender: txRes.transaction.data.sender,
        gasData: txRes.transaction.data.gasData,
        inputs: txRes.transaction.data.transaction.inputs,
        txs: txRes.transaction.data.transaction.transactions,
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
        obj: ObjectArg,
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
        obj: ObjectArg,
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
        obj: ObjectArg,
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
