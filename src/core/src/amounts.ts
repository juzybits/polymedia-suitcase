// TODO: add to README.md
import { TimeUnit } from "./format.js";

// === UI -> onchain ===

export function percentToBps(pct: string): bigint {
	return BigInt(Math.floor(Number(pct) * 100));
}

export function minutesToMs(minutes: string): bigint {
	return BigInt(Math.floor(Number(minutes) * TimeUnit.ONE_MINUTE));
}

export function hoursToMs(hours: string): bigint {
	return BigInt(Math.floor(Number(hours) * TimeUnit.ONE_HOUR));
}

// === onchain -> UI ===

export function bpsToPercent(bps: bigint, decimals: number = 2): string {
	const result = Number(bps) / 100;
	return result.toFixed(decimals);
}

export function msToMinutes(ms: bigint, decimals: number = 2): string {
	const result = Number(ms) / TimeUnit.ONE_MINUTE;
	return result.toFixed(decimals);
}

export function msToHours(ms: bigint, decimals: number = 2): string {
	const result = Number(ms) / TimeUnit.ONE_HOUR;
	return result.toFixed(decimals);
}
