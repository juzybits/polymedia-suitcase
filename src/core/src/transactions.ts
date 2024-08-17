import { SuiObjectRef } from "@mysten/sui/client";
import { Transaction, TransactionObjectInput, TransactionResult } from "@mysten/sui/transactions";
import { isSuiObjectRef } from "./clients.js";

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
