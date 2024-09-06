import {
    MoveCallSuiTransaction,
    MoveStruct,
    ObjectOwner,
    SuiArgument,
    SuiObjectChange,
    SuiObjectRef,
    SuiParsedData,
    SuiTransaction,
} from "@mysten/sui/client";

// === ObjectOwner ===

/** Type guard to check if an `ObjectOwner` is `Address` (a single address). */
export function isOwnerAddress(
    owner: ObjectOwner,
): owner is { AddressOwner: string } {
    return typeof owner === "object" && "AddressOwner" in owner;
}

/** Type guard to check if an `ObjectOwner` is `Immutable`. */
export function isOwnerImmutable(
    owner: ObjectOwner,
): owner is "Immutable" {
    return owner === "Immutable";
}

/** Type guard to check if an `ObjectOwner` is `Object` (a single object). */
export function isOwnerObject(
    owner: ObjectOwner,
): owner is { ObjectOwner: string } {
    return typeof owner === "object" && "ObjectOwner" in owner;
}

/** Type guard to check if an `ObjectOwner` is `Shared` (can be used by any address). */
export function isOwnerShared(
    owner: ObjectOwner,
): owner is { Shared: { initial_shared_version: string } } {
    return typeof owner === "object" && "Shared" in owner;
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
export type SuiObjectChangeCreated = Extract<SuiObjectChange, { type: 'created' }>;

/** A `SuiObjectChange` with `type: "deleted"`. */
export type SuiObjectChangeDeleted = Extract<SuiObjectChange, { type: 'deleted' }>;

/** A `SuiObjectChange` with `type: "mutated"`. */
export type SuiObjectChangeMutated = Extract<SuiObjectChange, { type: 'mutated' }>;

/** A `SuiObjectChange` with `type: "published"`. */
export type SuiObjectChangePublished = Extract<SuiObjectChange, { type: 'published' }>;

/** A `SuiObjectChange` with `type: "transferred"`. */
export type SuiObjectChangeTransferred = Extract<SuiObjectChange, { type: 'transferred' }>;

/** A `SuiObjectChange` with `type: "wrapped"`. */
export type SuiObjectChangeWrapped = Extract<SuiObjectChange, { type: 'wrapped' }>;

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
