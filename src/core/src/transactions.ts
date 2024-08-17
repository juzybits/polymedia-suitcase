import { Transaction } from "@mysten/sui/transactions";
import { isSuiObjectRef } from "./clients.js";
import { ObjectArg } from "./types.js";

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
