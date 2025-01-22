import {
    SuiObjectRef,
    SuiObjectResponse,
    SuiParsedData
} from "@mysten/sui/client";

import { isOwnerKind, isParsedDataKind } from "./guards.js";
import { ObjectDisplay } from "./types.js";

/**
 * Validate a `SuiObjectResponse` and return its `.data.content`.
 */
export function objResToContent(
    resp: SuiObjectResponse,
): SuiParsedData {
    if (resp.error) {
        throw Error(`response error: ${JSON.stringify(resp, null, 2)}`);
    }
    if (!resp.data?.content) {
        throw Error(`response has no content: ${JSON.stringify(resp, null, 2)}`);
    }
    return resp.data.content;
}

/**
 * Validate a `SuiObjectResponse` and return its `.data.display.data` or `null`.
 */
export function objResToDisplay(
    resp: SuiObjectResponse,
): ObjectDisplay
{
    if (resp.error) {
        throw Error(`response error: ${JSON.stringify(resp, null, 2)}`);
    }
    if (!resp.data?.display) {
        throw Error(`response has no display: ${JSON.stringify(resp, null, 2)}`);
    }

    return {
        ...newEmptyDisplay(),
        ...resp.data.display.data,
    };
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
 * Validate a `SuiObjectResponse` and return its `.data.content.fields`.
 */
export function objResToFields(
    resp: SuiObjectResponse,
): Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
{
    if (resp.error) {
        throw Error(`response error: ${JSON.stringify(resp, null, 2)}`);
    }
    if (resp.data?.content?.dataType !== "moveObject") {
        throw Error(`response content missing: ${JSON.stringify(resp, null, 2)}`);
    }
    return resp.data.content.fields as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Validate a `SuiObjectResponse` and return its `.data.objectId`.
 */
export function objResToId(
    resp: SuiObjectResponse,
): string {
    if (resp.error) {
        throw Error(`response error: ${JSON.stringify(resp, null, 2)}`);
    }
    if (!resp.data) {
        throw Error(`response has no data: ${JSON.stringify(resp, null, 2)}`);
    }
    return resp.data.objectId;
}

/**
 * Validate a `SuiObjectResponse` and return its owner: an address, object ID, "shared" or "immutable".
 */
export function objResToOwner(
    resp: SuiObjectResponse,
): string
{
    if (resp.error) {
        throw Error(`response error: ${JSON.stringify(resp, null, 2)}`);
    }
    if (!resp.data?.owner) {
        throw Error(`response has no owner data: ${JSON.stringify(resp, null, 2)}`);
    }
    if (isOwnerKind(resp.data.owner, "AddressOwner")) {
        return resp.data.owner.AddressOwner;
    }
    if (isOwnerKind(resp.data.owner, "ObjectOwner")) {
        return resp.data.owner.ObjectOwner;
    }
    if (isOwnerKind(resp.data.owner, "Shared")) {
        return "shared";
    }
    if (isOwnerKind(resp.data.owner, "Immutable")) {
        return "immutable";
    }
    return "unknown";
}

/**
 * Validate a `SuiObjectResponse` and return its `{.data.objectId, .data.digest, .data.version}`.
 */
export function objResToRef(
    resp: SuiObjectResponse,
): SuiObjectRef {
    if (resp.error) {
        throw Error(`response error: ${JSON.stringify(resp, null, 2)}`);
    }
    if (!resp.data) {
        throw Error(`response has no data: ${JSON.stringify(resp, null, 2)}`);
    }
    return {
        objectId: resp.data.objectId,
        digest: resp.data.digest,
        version: resp.data.version,
    };
}

/**
 * Validate a `SuiObjectResponse` and return its `.data.content.type`.
 */
export function objResToType(
    resp: SuiObjectResponse,
): string {
    if (resp.error) {
        throw Error(`response error: ${JSON.stringify(resp, null, 2)}`);
    }
    if (!resp.data?.content) {
        throw Error(`response has no content: ${JSON.stringify(resp, null, 2)}`);
    }
    if (!isParsedDataKind(resp.data.content, "moveObject")) {
        throw Error(`response data is not a moveObject: ${JSON.stringify(resp, null, 2)}`);
    }
    return resp.data.content.type;
}
