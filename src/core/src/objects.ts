import {
    ObjectOwner,
    SuiObjectRef,
    SuiObjectResponse
} from "@mysten/sui/client";
import { ObjectDisplay } from "./types.js";

/**
 * Type guard to check if an object is a `SuiObjectRef`.
 */
/* eslint-disable */
export function isSuiObjectRef(obj: any): obj is SuiObjectRef {
    return obj
        && typeof obj.objectId !== "undefined"
        && typeof obj.version !== "undefined"
        && typeof obj.digest !== "undefined";
}
/* eslint-enable */

/**
 * Type guard to check if an object is owned by a single address.
 */
export function isOwnerAddress(
    owner: ObjectOwner,
): owner is { AddressOwner: string } {
    return typeof owner === "object" && owner !== null && "AddressOwner" in owner;
}

/**
 * Type guard to check if an object is owned by a single object.
 */
export function isOwnerObject(
    owner: ObjectOwner,
): owner is { ObjectOwner: string } {
    return typeof owner === "object" && owner !== null && "ObjectOwner" in owner;
}

/**
 * Type guard to check if an object can be used by any address.
 */
export function isOwnerShared(
    owner: ObjectOwner,
): owner is { Shared: { initial_shared_version: string } } {
    return typeof owner === "object" && owner !== null && "Shared" in owner;
}

/**
 * Type guard to check if an object is immutable.
 */
export function isOwnerImmutable(
    owner: ObjectOwner,
): owner is "Immutable" {
    return owner === "Immutable";
}

/**
 * Validate a `SuiObjectResponse` and return its `.data.display.data` or `null`.
 */
export function objResToDisplay(
    objRes: SuiObjectResponse,
): ObjectDisplay
{
    if (objRes.error) {
        throw Error(`response error: ${JSON.stringify(objRes, null, 2)}`);
    }
    if (!objRes.data?.display) {
        throw Error(`response has no display: ${JSON.stringify(objRes, null, 2)}`);
    }
    if (objRes.data.display.error) {
        throw Error(`display has error: ${JSON.stringify(objRes, null, 2)}`);
    }

    const defaultDisplay: ObjectDisplay = {
        name: null,
        description: null,
        link: null,
        image_url: null,
        thumbnail_url: null,
        project_name: null,
        project_url: null,
        project_image_url: null,
        creator: null,
    };

    return {
        ...defaultDisplay,
        ...objRes.data.display.data,
    };
}

/**
 * Validate a `SuiObjectResponse` and return its `.data.content.fields`.
 */
export function objResToFields(
    objRes: SuiObjectResponse,
): Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
{
    if (objRes.error) {
        throw Error(`response error: ${JSON.stringify(objRes, null, 2)}`);
    }
    if (objRes.data?.content?.dataType !== "moveObject") {
        throw Error(`response content missing: ${JSON.stringify(objRes, null, 2)}`);
    }
    return objRes.data.content.fields as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Validate a `SuiObjectResponse` and return its `.data.objectId`.
 */
export function objResToId(
    objRes: SuiObjectResponse,
): string {
    if (objRes.error) {
        throw Error(`response error: ${JSON.stringify(objRes, null, 2)}`);
    }
    if (!objRes.data) {
        throw Error(`response has no data: ${JSON.stringify(objRes, null, 2)}`);
    }
    return objRes.data.objectId;
}

/**
 * Validate a `SuiObjectResponse` and return its `{.data.objectId, .data.digest, .data.version}`.
 */
export function objResToRef(
    objRes: SuiObjectResponse,
): SuiObjectRef {
    if (objRes.error) {
        throw Error(`response error: ${JSON.stringify(objRes, null, 2)}`);
    }
    if (!objRes.data) {
        throw Error(`response has no data: ${JSON.stringify(objRes, null, 2)}`);
    }
    return {
        objectId: objRes.data.objectId,
        digest: objRes.data.digest,
        version: objRes.data.version,
    };
}

/**
 * Validate a `SuiObjectResponse` and return its `.data.type`.
 */
export function objResToType(
    objRes: SuiObjectResponse,
): string {
    if (objRes.error) {
        throw Error(`response error: ${JSON.stringify(objRes, null, 2)}`);
    }
    if (!objRes.data?.type) {
        throw Error(`response has no type: ${JSON.stringify(objRes, null, 2)}`);
    }
    return objRes.data.type;
}

/**
 * Call `SuiClient.devInspectTransactionBlock()` and return the deserialized return values.
 * @returns An array with the deserialized return values of each transaction in the TransactionBlock.
 *
export async function devInspectAndGetReturnValues( // TODO
    suiClient: SuiClient,
    tx: Transaction,
    sender = "0x7777777777777777777777777777777777777777777777777777777777777777",
): Promise<unknown[][]> {
    const results = await devInspectAndGetResults(suiClient, tx, sender);
    // The values returned from each of the transactions in the TransactionBlock
    const blockReturnValues: unknown[][] = [];
    for (const txnResult of results) {
        if (!txnResult.returnValues?.length) {
            throw Error(`transaction didn't return any values: ${JSON.stringify(txnResult, null, 2)}`);
        }
        // The values returned from the transaction (a function can return multiple values)
        const txnReturnValues: unknown[] = [];
        for (const value of txnResult.returnValues) {
            const valueData = Uint8Array.from(value[0]);
            const valueType = value[1];
            let valueDeserialized: unknown;
            if (valueType === "0x1::string::String") {
                valueDeserialized = bcs.string().parse(valueData);
            } else if (valueType === "vector<0x1::string::String>") {
                valueDeserialized = bcs.vector(bcs.string()).parse(valueData);
            } else {
                valueDeserialized = bcs.de(valueType, valueData, "hex");
            }
            txnReturnValues.push(valueDeserialized);
        }
        blockReturnValues.push(txnReturnValues);
    }
    return blockReturnValues;
}
*/
