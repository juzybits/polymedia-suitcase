import {
    SuiCallArg, SuiObjectRef, SuiTransactionBlockResponse
} from "@mysten/sui/client";
import { Transaction, TransactionObjectInput, TransactionResult } from "@mysten/sui/transactions";
import { isSuiObjectRef } from "./guards.js";

/**
 * Either a `TransactionObjectInput` or a `SuiObjectRef`.
 */
export type ObjectInput = TransactionObjectInput | SuiObjectRef;

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
 * Parse a Move abort string (from `tx.effects.status.error`) into its different parts.
 *
 * Based on `sui/crates/sui/src/clever_error_rendering.rs`.
 *
 * Example error string:
 * `MoveAbort(MoveLocation { module: ModuleId { address: 0x123, name: Identifier("the_module") }, function: 1, instruction: 29, function_name: Some("the_function") }, 5008) in command 2`
 */
export function parseTxError(
    error: string,
): {
    packageId: string;
    module: string;
    function: string;
    instruction: number;
    code: number;
    command: number;
} | null
{
    const match = /MoveAbort.*address:\s*(.*?),.* name:.*Identifier\((.*?)\).*instruction:\s+(\d+),.*function_name:.*Some\((.*?)\).*},\s*(\d+).*in command\s*(\d+)/.exec(error);
    if (!match) {
        return null;
    }
    const cleanString = (s: string) => s.replace(/\\/g, "").replace(/"/g, "");
    return {
        packageId: "0x" + match[1],
        module: cleanString(match[2]),
        instruction: parseInt(match[3]),
        function: cleanString(match[4]),
        code: parseInt(match[5]),
        command: parseInt(match[6]),
    };
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
