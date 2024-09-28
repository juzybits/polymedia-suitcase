import {
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
    ? T extends Record<string, unknown>
        ? keyof T
        : T extends string
            ? T
            : never
    : never;

/**
 * An `ObjectOwner` of a specific kind.
 * ```
 */
export type OwnerKind<K extends OwnerKeys> = Extract<ObjectOwner, Record<K, unknown> | K>;

/**
 * Type guard to check if an `ObjectOwner` is of a specific kind.
 */
export function isOwnerKind<K extends OwnerKeys>(
    owner: ObjectOwner,
    kind: K
): owner is OwnerKind<K> {
    return kind === owner || (typeof owner === "object" && kind in owner);
}

// === SuiArgument ===

/**
 * All possible `SuiArgument` subtypes.
 */
type ArgKeys = SuiArgument extends infer T
    ? T extends Record<string, unknown>
        ? keyof T
        : T extends string
            ? T
            : never
    : never;

/**
 * A `SuiArgument` of a specific kind.
 */
export type ArgKind<K extends ArgKeys> = Extract<SuiArgument, Record<K, unknown> | K>;

/**
 * Type guard to check if a `SuiArgument` is of a specific kind.
 */
export function isArgKind<K extends ArgKeys>(
    arg: SuiArgument,
    kind: K
): arg is ArgKind<K> {
    return kind === arg || (typeof arg === "object" && kind in arg);
}

// === SuiObjectChange ===

/**
 * All possible `SuiObjectChange` subtypes.
 */
type ObjChangeKeys = SuiObjectChange extends { type: infer T } ? T : never;

/**
 * A `SuiObjChange` of a specific kind.
 */
export type ObjChangeKind<K extends ObjChangeKeys> = Extract<SuiObjectChange, { type: K }>;

/**
 * Type guard to check if a `SuiObjectChange` is of a specific kind.
 */
export function isObjChangeKind<K extends ObjChangeKeys>(
    change: SuiObjectChange,
    kind: K
): change is ObjChangeKind<K> {
    return change.type === kind;
}

// === SuiObjectRef ===

/** Type guard to check if an object is a `SuiObjectRef`. */
export function isSuiObjectRef(obj: unknown): obj is SuiObjectRef {
    return typeof obj === "object" && obj !== null
        && "objectId" in obj
        && "version" in obj
        && "digest" in obj;
}

// === SuiParsedData ===

/**
 * All possible `SuiParsedData` subtypes.
 */
type ParsedDataKeys = SuiParsedData extends infer T
    ? T extends { dataType: infer DT }
        ? DT
        : never
    : never;

/**
 * A `SuiParsedData` of a specific kind.
 */
export type ParsedDataKind<K extends ParsedDataKeys> = Extract<SuiParsedData, { dataType: K }>;

/**
 * Type guard to check if a `SuiParsedData` is of a specific kind.
 */
export function isParsedDataKind<K extends ParsedDataKeys>(
    data: SuiParsedData,
    kind: K
): data is ParsedDataKind<K> {
    return data.dataType === kind;
}

// === SuiTransaction ===

/**
 * All possible `SuiTransaction` subtypes.
 */
type TxKeys = SuiTransaction extends infer T
    ? T extends Record<string, unknown>
        ? keyof T
        : never
    : never;

/**
 * A `SuiTransaction` of a specific kind.
 */
export type TxKind<K extends TxKeys> = Extract<SuiTransaction, Record<K, unknown> | K>;

/**
 * Type guard to check if a `SuiTransaction` is of a specific kind.
 */
export function isTxKind<K extends TxKeys>(
    tx: SuiTransaction,
    kind: K
): tx is TxKind<K> {
    return kind in tx;
}
