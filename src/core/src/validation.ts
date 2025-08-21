// TODO: add to README.md
// === float ===

import { TypeTagSerializer } from "@mysten/sui/bcs";
import type { CoinMetaFetcher } from "./coins.js";
import { REGEX_TYPE_BASIC } from "./constants.js";

export const REGEX_FLOAT = /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;

export function isFloat(val: string): boolean {
	return REGEX_FLOAT.test(val);
}

export function validateFloat({
	value,
	min,
	max,
	required = true,
}: {
	value: string;
	min?: number;
	max?: number;
	required?: boolean;
}): string | undefined {
	if (required && !value.length) {
		return "Required";
	}
	if (!isFloat(value)) {
		return "Invalid number";
	}
	if (min !== undefined && parseFloat(value) < min) {
		return `Min value is ${min}`;
	}
	if (max !== undefined && parseFloat(value) > max) {
		return `Max value is ${max}`;
	}
	return undefined;
}

// === coin type ===

export function isBasicSuiType(val: string): boolean {
	return new RegExp(`^${REGEX_TYPE_BASIC.source}$`).test(val);
}

export async function validateCoinType({
	value,
	coinMetaFetcher,
	required = true,
}: {
	value: string;
	coinMetaFetcher: CoinMetaFetcher;
	required?: boolean;
}): Promise<string | undefined> {
	if (required && !value.length) {
		return "Required";
	}
	if (!isBasicSuiType(value)) {
		return "Invalid coin type";
	}
	try {
		const coinMeta = await coinMetaFetcher.getCoinMeta(value);
		if (coinMeta === null) {
			return "CoinMetadata not found";
		}
	} catch (_err) {
		return "Failed to fetch coin metadata";
	}
	return undefined;
}

// === struct type ===

export function validateStructType({
	value,
	required = true,
}: {
	value: string;
	required?: boolean;
}): string | undefined {
	if (required && !value.length) {
		return "Required";
	}
	const startsOk = REGEX_TYPE_BASIC.test(value);
	if (!startsOk) {
		return "Invalid type";
	}
	try {
		const type = TypeTagSerializer.parseFromStr(value);
		if (!("struct" in type)) {
			return "Invalid type";
		}
	} catch (_err) {
		return "Invalid type";
	}
	return undefined;
}
