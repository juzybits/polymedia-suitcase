const TIME_LABEL = {
    year: { full: "year", short: "y" },
    month: { full: "month", short: "m" },
    day: { full: "day", short: "d" },
    hour: { full: "hour", short: "h" },
    min: { full: "min", short: "m" },
    sec: { full: "sec", short: "s" },
};

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
export const formatDuration = (ms: number): string =>
{
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
export function formatTimeDiff(
    timestamp: number,
    now: number = Date.now(),
    shortenTimeLabel = true,
    endLabel = "< 1 sec",
    maxTimeUnit: TimeUnit = TimeUnit.ONE_DAY
): string {
    if (!timestamp) return "";

    const dateKeyType = shortenTimeLabel ? "short" : "full";
    let timeCol = Math.abs(now - timestamp);

    let timeUnit: [string, number][];
    if (timeCol >= Number(maxTimeUnit) && Number(maxTimeUnit) >= Number(TimeUnit.ONE_DAY)) {
        timeUnit = [
            [TIME_LABEL.day[dateKeyType], TimeUnit.ONE_DAY],
            [TIME_LABEL.hour[dateKeyType], TimeUnit.ONE_HOUR],
        ];
    } else if (timeCol >= Number(TimeUnit.ONE_HOUR)) {
        timeUnit = [
            [TIME_LABEL.hour[dateKeyType], TimeUnit.ONE_HOUR],
            [TIME_LABEL.min[dateKeyType], TimeUnit.ONE_MINUTE],
        ];
    } else {
        timeUnit = [
            [TIME_LABEL.min[dateKeyType], TimeUnit.ONE_MINUTE],
            [TIME_LABEL.sec[dateKeyType], TimeUnit.ONE_SECOND],
        ];
    }

    const convertAmount = (amount: number, label: string) => {
        const spacing = shortenTimeLabel ? "" : " ";
        if (amount > 1) return `${amount}${spacing}${label}${!shortenTimeLabel ? "s" : ""}`;
        if (amount === 1) return `${amount}${spacing}${label}`;
        return "";
    };

    const resultArr = timeUnit.map(([label, denom]) => {
        const whole = Math.floor(timeCol / denom);
        timeCol = timeCol - whole * denom;
        return convertAmount(whole, label);
    });

    const result = resultArr.join(" ").trim();

    return result || endLabel;
}

/**
 * Return the domain from a URL.
 * E.g. `"https://polymedia.app"` -> `"polymedia.app"`.
 */
export const urlToDomain = (url: string): string => {
    const match = url.match(/^https?:\/\/([^/]+)/);
    return match ? match[1] : "";
};

/**
 * Return a shortened version of a transaction digest.
 * E.g. "yjxT3tJvRdkg5p5NFN64hGUGSntWoB8MtA34ErFYMgW" -> "yjxT…YMgW".
 */
export const shortenDigest = (
    digest: string, start=4, end=4, separator="…",
): string => {
    return digest.slice(0, start) + separator + digest.slice(-end);
};
