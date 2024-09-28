import {
    MoveStruct,
    ObjectOwner,
    SuiArgument,
    SuiObjectChange,
    SuiObjectRef,
    SuiParsedData,
    SuiTransaction
} from "@mysten/sui/client";

// === ObjectOwner ===

/**
 * All possible `ObjectOwner` subtypes.
 */
type OwnerKeys = ObjectOwner extends infer T
    ? T extends { [K: string]: any }
        ? keyof T
        : T extends string
            ? T
            : never
    : never;

/**
 * An `ObjectOwner` of a specific kind.
 * @example
 * ```ts
 * const owner: OwnerKind<"AddressOwner"> = ...
 * const address = owner.AddressOwner;
 * ```
 */
export type OwnerKind<K extends OwnerKeys> = Extract<ObjectOwner, { [P in K]: any } | K>;

/**
 * Type guard to check if an `ObjectOwner` is of a specific kind.
 * @example
 * ```ts
 * if (isOwnerKind(resp.data.owner, "AddressOwner")) {
 *     const owner = resp.data.owner.AddressOwner;
 * }
 * ```
 */
export function isOwnerKind<K extends OwnerKeys>(
    owner: ObjectOwner,
    kind: K
): owner is OwnerKind<K> {
    return kind === owner || (typeof owner === "object" && kind in owner);
}

// === SuiArgument ===

/** Type guard to check if a `SuiArgument` is a `GasCoin`. */
export function isArgGasCoin(arg: SuiArgument): arg is "GasCoin" {
    return arg === "GasCoin";
}

/** Type guard to check if a `SuiArgument` is an `Input`. */
export function isArgInput(arg: SuiArgument): arg is { Input: number } {
    return typeof arg === "object" && "Input" in arg;
}

/** Type guard to check if a `SuiArgument` is a `NestedResult`. */
export function isArgNestedResult(arg: SuiArgument): arg is { NestedResult: [number, number] } {
    return typeof arg === "object" && "NestedResult" in arg;
}

/** Type guard to check if a `SuiArgument` is a `Result`. */
export function isArgResult(arg: SuiArgument): arg is { Result: number } {
    return typeof arg === "object" && "Result" in arg;
}

// === SuiObjectChange ===

/** A `SuiObjectChange` with `type: "created"`. */
export type SuiObjectChangeCreated = Extract<SuiObjectChange, { type: "created" }>;

/** A `SuiObjectChange` with `type: "deleted"`. */
export type SuiObjectChangeDeleted = Extract<SuiObjectChange, { type: "deleted" }>;

/** A `SuiObjectChange` with `type: "mutated"`. */
export type SuiObjectChangeMutated = Extract<SuiObjectChange, { type: "mutated" }>;

/** A `SuiObjectChange` with `type: "published"`. */
export type SuiObjectChangePublished = Extract<SuiObjectChange, { type: "published" }>;

/** A `SuiObjectChange` with `type: "transferred"`. */
export type SuiObjectChangeTransferred = Extract<SuiObjectChange, { type: "transferred" }>;

/** A `SuiObjectChange` with `type: "wrapped"`. */
export type SuiObjectChangeWrapped = Extract<SuiObjectChange, { type: "wrapped" }>;

// === SuiObjectRef ===

/** Type guard to check if an object is a `SuiObjectRef`. */
/* eslint-disable */
export function isSuiObjectRef(obj: any): obj is SuiObjectRef {
    return obj
        && typeof obj.objectId !== "undefined"
        && typeof obj.version !== "undefined"
        && typeof obj.digest !== "undefined";
}
/* eslint-enable */

// === SuiParsedData ===

/** Type guard to check if a `SuiParsedData` is a `moveObject`. */
export function isParsedDataObject(data: SuiParsedData): data is {
    dataType: "moveObject";
    fields: MoveStruct;
    hasPublicTransfer: boolean;
    type: string;
} {
    return (
        data.dataType === "moveObject"
    );
}

/** Type guard to check if a `SuiParsedData` is a `package`. */
export function isParsedDataPackage(data: SuiParsedData): data is {
    dataType: "package";
    disassembled: Record<string, unknown>;
} {
    return data.dataType === "package";
}

// === SuiTransaction ===

/**
 * All possible `SuiTransaction` subtypes.
 */
type TxKeys = SuiTransaction extends infer T
    ? T extends { [K: string]: any }
        ? keyof T
        : never
    : never;

/**
 * A `SuiTransaction` of a specific kind.
 * @example
 * ```ts
 * const tx: TxKind<"MoveCall"> = ...
 * const packageId = tx.MoveCall.package;
 * ```
 */
export type TxKind<K extends TxKeys> = Extract<SuiTransaction, { [P in K]: any }>;

/**
 * Type guard to check if a `SuiTransaction` is of a specific kind.
 * @example
 * ```ts
 * if (isTxKind(tx, "MoveCall")) {
 *     const packageId = tx.MoveCall.package;
 * }
 * ```
 */
export function isTxKind<K extends TxKeys>(
    tx: SuiTransaction,
    kind: K
): tx is TxKind<K> {
    return kind in tx;
}
