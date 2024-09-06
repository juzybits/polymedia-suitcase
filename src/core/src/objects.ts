import {
    SuiObjectRef,
    SuiObjectResponse,
    SuiParsedData
} from "@mysten/sui/client";
import { isParsedDataObject } from "./guards.js";
import { ObjectDisplay } from "./types.js";

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
 * Create an `ObjectDisplay` object with all fields set to `null`.
 */
export function newEmptyDisplay(): ObjectDisplay {
    return {
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

    return {
        ...newEmptyDisplay(),
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
