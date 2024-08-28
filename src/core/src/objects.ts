import {
    MoveStruct,
    ObjectOwner,
    SuiObjectRef,
    SuiObjectResponse,
    SuiParsedData
} from "@mysten/sui/client";
import { ObjectDisplay } from "./types.js";

/** Type guard to check if an object is a `SuiObjectRef`. */
/* eslint-disable */
export function isSuiObjectRef(obj: any): obj is SuiObjectRef {
    return obj
        && typeof obj.objectId !== "undefined"
        && typeof obj.version !== "undefined"
        && typeof obj.digest !== "undefined";
}
/* eslint-enable */

/** Type guard to check if an `ObjectOwner` is `Address` (a single address). */
export function isOwnerAddress(
    owner: ObjectOwner,
): owner is { AddressOwner: string } {
    return typeof owner === "object" && "AddressOwner" in owner;
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

/** Type guard to check if an `ObjectOwner` is `Immutable`. */
export function isOwnerImmutable(
    owner: ObjectOwner,
): owner is "Immutable" {
    return owner === "Immutable";
}

/** Type guard to check if a `SuiParsedData` is a `moveObject`. */
export function isParsedDataObject(data: SuiParsedData): data is {
    dataType: 'moveObject';
    fields: MoveStruct;
    hasPublicTransfer: boolean;
    type: string;
} {
    return (
        data.dataType === 'moveObject'
    );
}

/** Type guard to check if a `SuiParsedData` is a `package`. */
export function isParsedDataPackage(data: SuiParsedData): data is {
    dataType: 'package';
    disassembled: {
        [key: string]: unknown;
    };
} {
    return data.dataType === 'package';
}

/**
 * Validate a `SuiObjectResponse` and return its `.data.content`.
 */
export function objResToContent(
    objRes: SuiObjectResponse,
): SuiParsedData {
    if (objRes.error) {
        throw Error(`response error: ${JSON.stringify(objRes, null, 2)}`);
    }
    if (!objRes.data?.content) {
        throw Error(`response has no content: ${JSON.stringify(objRes, null, 2)}`);
    }
    return objRes.data.content;
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
 * Validate a `SuiObjectResponse` and return its `.data.content.type`.
 */
export function objResToType(
    objRes: SuiObjectResponse,
): string {
    if (objRes.error) {
        throw Error(`response error: ${JSON.stringify(objRes, null, 2)}`);
    }
    if (!objRes.data?.content) {
        throw Error(`response has no content: ${JSON.stringify(objRes, null, 2)}`);
    }
    if (!isParsedDataObject(objRes.data.content)) {
        throw Error(`response data is not a moveObject: ${JSON.stringify(objRes, null, 2)}`);
    }
    return objRes.data.content.type;
}
