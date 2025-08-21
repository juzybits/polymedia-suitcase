// TODO: add to README.md
import type { SuiObjectChange, SuiTransactionBlockResponse } from "@mysten/sui/client";

export type SuiObjectChangeExceptPublished = Extract<
	SuiObjectChange,
	{ objectId: string }
>;

function isSuiObjectChangeExceptPublished(
	o: SuiObjectChange,
): o is SuiObjectChangeExceptPublished {
	return "objectId" in o;
}

/**
 * Extract selected object changes from a tx response.
 *
 * @param resp - The tx response to extract objects from.
 * @param kind - The kind of object change to extract.
 * @param typeRegex - Regular expression to match the object type.
 */
export function respToObjs(a: {
	resp: SuiTransactionBlockResponse;
	kind: SuiObjectChangeExceptPublished["type"];
	regex?: RegExp;
}): SuiObjectChangeExceptPublished[] {
	if (!a.resp.objectChanges) {
		throw new Error("No object changes");
	}
	return a.resp.objectChanges
		.filter(isSuiObjectChangeExceptPublished)
		.filter((o) => o.type === a.kind && (a.regex ? a.regex.test(o.objectType) : true));
}
