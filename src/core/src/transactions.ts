import {
    MoveCallSuiTransaction,
    SuiArgument,
    SuiCallArg,
    SuiObjectRef,
    SuiTransaction,
    SuiTransactionBlockResponse,
} from "@mysten/sui/client";
import { Transaction, TransactionObjectInput, TransactionResult } from "@mysten/sui/transactions";
import { isSuiObjectRef } from "./objects.js";

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

// === type guards for SuiArgument ===

/** Type guard to check if a `SuiArgument` is a `GasCoin`. */
export function isArgGasCoin(arg: SuiArgument): arg is "GasCoin" {
    return arg === "GasCoin";
}

/** Type guard to check if a `SuiArgument` is an `Input`. */
export function isArgInput(arg: SuiArgument): arg is { Input: number } {
    return typeof arg === "object" && "Input" in arg;
}

/** Type guard to check if a `SuiArgument` is a `Result`. */
export function isArgResult(arg: SuiArgument): arg is { Result: number } {
    return typeof arg === "object" && "Result" in arg;
}

/** Type guard to check if a `SuiArgument` is a `NestedResult`. */
export function isArgNestedResult(arg: SuiArgument): arg is { NestedResult: [number, number] } {
    return typeof arg === "object" && "NestedResult" in arg;
}

// === type guards for SuiTransaction ===

/** Type guard to check if a `SuiTransaction` is a `MakeMoveVec` tx. */
export function isTxMakeMoveVec(
    tx: SuiTransaction,
): tx is { MakeMoveVec: [string | null, SuiArgument[]] } {
    return "MakeMoveVec" in tx;
}

/** Type guard to check if a `SuiTransaction` is a `MergeCoins` tx. */
export function isTxMergeCoins(
    tx: SuiTransaction,
): tx is { MergeCoins: [SuiArgument, SuiArgument[]] } {
    return "MergeCoins" in tx;
}

/** Type guard to check if a `SuiTransaction` is a `MoveCallSuiTransaction`. */
export function isTxMoveCall(
    tx: SuiTransaction,
): tx is { MoveCall: MoveCallSuiTransaction } {
    return "MoveCall" in tx;
}

/** Type guard to check if a `SuiTransaction` is a `Publish` tx. */
export function isTxPublish(
    tx: SuiTransaction,
): tx is { Publish: string[] } {
    return "Publish" in tx;
}

/** Type guard to check if a `SuiTransaction` is a `SplitCoins` tx. */
export function isTxSplitCoins(
    tx: SuiTransaction,
): tx is { SplitCoins: [SuiArgument, SuiArgument[]] } {
    return "SplitCoins" in tx;
}

/** Type guard to check if a `SuiTransaction` is a `TransferObjects` tx. */
export function isTxTransferObjects(
    tx: SuiTransaction,
): tx is { TransferObjects: [SuiArgument[], SuiArgument] } {
    return "TransferObjects" in tx;
}

/** Type guard to check if a `SuiTransaction` is an `Upgrade` tx. */
export function isTxUpgrade(
    tx: SuiTransaction,
): tx is { Upgrade: [string[], string, SuiArgument] } {
    return "Upgrade" in tx;
}

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
