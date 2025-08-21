/** Time units in milliseconds. */
export enum TimeUnit {
	ONE_SECOND = 1000,
	ONE_MINUTE = 60_000,
	ONE_HOUR = 3_600_000,
	ONE_DAY = 86_400_000,
}

/**
 * Return a human-readable string from a number of basis points.
 * E.g. "100 bps" -> "1%".
 */
export const formatBps = (bps: number): string => {
	return `${bps / 100}%`;
};

/**
 * Return a human-readable date string from a timestamp in milliseconds.
 */
export const formatDate = (ms: number): string => {
	return new Date(ms).toLocaleString();
};

/**
 * Return a human-readable string from a number of milliseconds.
 * E.g. "1 day", "2 hours", "3 minutes", "4 seconds".
 */
export const formatDuration = (ms: number): string => {
	const formatUnit = (value: number, unit: string) =>
		`${value} ${unit}${value !== 1 ? "s" : ""}`;

	if (ms >= Number(TimeUnit.ONE_DAY)) {
		return formatUnit(Math.floor(ms / TimeUnit.ONE_DAY), "day");
	}
	if (ms >= Number(TimeUnit.ONE_HOUR)) {
		return formatUnit(Math.floor(ms / TimeUnit.ONE_HOUR), "hour");
	}
	if (ms >= Number(TimeUnit.ONE_MINUTE)) {
		return formatUnit(Math.floor(ms / TimeUnit.ONE_MINUTE), "minute");
	}
	return formatUnit(Math.floor(ms / TimeUnit.ONE_SECOND), "second");
};

/**
 * Return a human-readable string with the time difference between two timestamps.
 * E.g. "30s"/"30 sec", "1h"/"1 hour", "2d"/"2 days".
 */
export function formatTimeDiff({
	timestamp,
	now = Date.now(),
	format = "short",
	minTimeUnit = TimeUnit.ONE_SECOND,
}: {
	timestamp: number;
	now?: number;
	format?: "short" | "long";
	minTimeUnit?: TimeUnit;
}): string {
	if (!timestamp) return "";

	let diff = Math.abs(now - timestamp);

	if (diff < Number(minTimeUnit)) {
		return getEndLabel(minTimeUnit, format);
	}

	let timeUnit: [string, number][];
	if (diff >= Number(TimeUnit.ONE_DAY)) {
		timeUnit = [
			[TIME_LABEL.day[format], TimeUnit.ONE_DAY],
			[TIME_LABEL.hour[format], TimeUnit.ONE_HOUR],
		];
	} else if (diff >= Number(TimeUnit.ONE_HOUR)) {
		timeUnit = [
			[TIME_LABEL.hour[format], TimeUnit.ONE_HOUR],
			[TIME_LABEL.min[format], TimeUnit.ONE_MINUTE],
		];
	} else {
		timeUnit = [
			[TIME_LABEL.min[format], TimeUnit.ONE_MINUTE],
			[TIME_LABEL.sec[format], TimeUnit.ONE_SECOND],
		];
	}

	const convertAmount = (amount: number, label: string) => {
		const spacing = format === "short" ? "" : " ";
		if (amount > 1) return `${amount}${spacing}${label}${format === "long" ? "s" : ""}`;
		if (amount === 1) return `${amount}${spacing}${label}`;
		return "";
	};

	const resultArr = timeUnit.map(([label, denom]) => {
		const whole = Math.floor(diff / denom);
		diff = diff - whole * denom;
		return convertAmount(whole, label);
	});

	const result = resultArr.join(" ").trim();

	return result || getEndLabel(minTimeUnit, format);
}

const TIME_LABEL = {
	year: { long: "year", short: "y" },
	month: { long: "month", short: "m" },
	day: { long: "day", short: "d" },
	hour: { long: "hour", short: "h" },
	min: { long: "min", short: "m" },
	sec: { long: "sec", short: "s" },
};

function getEndLabel(minTimeUnit: TimeUnit, format: "short" | "long"): string {
	let minLabel = "";
	switch (minTimeUnit) {
		case TimeUnit.ONE_DAY:
			minLabel = TIME_LABEL.day[format];
			break;
		case TimeUnit.ONE_HOUR:
			minLabel = TIME_LABEL.hour[format];
			break;
		case TimeUnit.ONE_MINUTE:
			minLabel = TIME_LABEL.min[format];
			break;
		default:
			minLabel = TIME_LABEL.sec[format];
	}
	if (format === "short") {
		return `< 1${minLabel}`;
	} else {
		return `< 1 ${minLabel}`;
	}
}

/**
 * Return the domain from a URL.
 * E.g. `"https://polymedia.app"` -> `"polymedia.app"`.
 */
export const urlToDomain = (url: string): string => {
	const match = /^https?:\/\/([^/]+)/.exec(url);
	return match ? match[1] : "";
};

/**
 * Return a shortened version of a transaction digest.
 * E.g. "yjxT3tJvRdkg5p5NFN64hGUGSntWoB8MtA34ErFYMgW" -> "yjxT…YMgW".
 */
export const shortenDigest = (
	digest: string,
	start = 4,
	end = 4,
	separator = "…",
): string => {
	return digest.slice(0, start) + separator + digest.slice(-end);
};
