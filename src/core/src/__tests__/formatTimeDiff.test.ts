import { formatTimeDiff, TimeUnit } from "../format";

describe("formatTimeDiff", () => {
    const now = Date.UTC(2024, 0, 1, 0, 0, 0, 0); // Jan 1, 2024, 00:00:00 UTC

    it("shows time diff in seconds, minutes, hours, days", () => {
        expect(formatTimeDiff({
            timestamp: now + (30 * TimeUnit.ONE_SECOND + 123),
            now,
        })).toBe("30s");
        expect(formatTimeDiff({
            timestamp: now + (90 * TimeUnit.ONE_SECOND + 123),
            now,
        })).toBe("1m 30s");
        expect(formatTimeDiff({
            timestamp: now + (2 * TimeUnit.ONE_HOUR) + (5 * TimeUnit.ONE_MINUTE) + (5 * TimeUnit.ONE_SECOND),
            now,
        })).toBe("2h 5m");
        expect(formatTimeDiff({
            timestamp: now + (3 * TimeUnit.ONE_DAY) + (4 * TimeUnit.ONE_HOUR) + (5 * TimeUnit.ONE_MINUTE) + (5 * TimeUnit.ONE_SECOND),
            now,
        })).toBe("3d 4h");
    });

    it("uses full labels if format is 'long'", () => {
        expect(formatTimeDiff({
            timestamp: now + (30 * TimeUnit.ONE_SECOND),
            now,
            format: "long",
        })).toBe("30 secs");
        expect(formatTimeDiff({
            timestamp: now + (90 * TimeUnit.ONE_SECOND),
            now,
            format: "long",
        })).toBe("1 min 30 secs");
        expect(formatTimeDiff({
            timestamp: now + 2 * TimeUnit.ONE_HOUR + 5 * TimeUnit.ONE_MINUTE,
            now,
            format: "long",
        })).toBe("2 hours 5 mins");
        expect(formatTimeDiff({
            timestamp: now + 3 * TimeUnit.ONE_DAY + 4 * TimeUnit.ONE_HOUR,
            now,
            format: "long",
        })).toBe("3 days 4 hours");
    });

    it("returns endLabel if time diff is less than minTimeUnit", () => {
        expect(formatTimeDiff({
            timestamp: now + (TimeUnit.ONE_SECOND - 1),
            now,
            minTimeUnit: TimeUnit.ONE_SECOND,
        })).toBe("< 1s");
        expect(formatTimeDiff({
            timestamp: now + (59 * TimeUnit.ONE_SECOND),
            now,
            minTimeUnit: TimeUnit.ONE_MINUTE,
        })).toBe("< 1m");
        expect(formatTimeDiff({
            timestamp: now + (TimeUnit.ONE_MINUTE - 1),
            now,
            minTimeUnit: TimeUnit.ONE_MINUTE,
            format: "long",
        })).toBe("< 1 min");
        expect(formatTimeDiff({
            timestamp: now + (TimeUnit.ONE_HOUR - 1),
            now,
            minTimeUnit: TimeUnit.ONE_HOUR,
            format: "long",
        })).toBe("< 1 hour");
        expect(formatTimeDiff({
            timestamp: now + (TimeUnit.ONE_DAY - 1),
            now,
            minTimeUnit: TimeUnit.ONE_DAY,
            format: "long",
        })).toBe("< 1 day");
    });

    it("returns only one unit for exact time diffs", () => {
        expect(formatTimeDiff({
            timestamp: now + TimeUnit.ONE_MINUTE,
            now,
            minTimeUnit: TimeUnit.ONE_MINUTE,
        })).toBe("1m");
        expect(formatTimeDiff({
            timestamp: now + TimeUnit.ONE_HOUR,
            now,
            minTimeUnit: TimeUnit.ONE_HOUR,
        })).toBe("1h");
        expect(formatTimeDiff({
            timestamp: now + TimeUnit.ONE_DAY,
            now,
            minTimeUnit: TimeUnit.ONE_DAY,
        })).toBe("1d");

    });

    it("works for past and future timestamps", () => {
        expect(formatTimeDiff({
            timestamp: now - (90 * TimeUnit.ONE_SECOND),
            now,
        })).toBe("1m 30s");
        expect(formatTimeDiff({
            timestamp: now - 2 * TimeUnit.ONE_HOUR - 5 * TimeUnit.ONE_MINUTE,
            now,
        })).toBe("2h 5m");
    });

    it("returns endLabel if result is empty string", () => {
        // This can only happen if time diff is 0
        expect(formatTimeDiff({
            timestamp: now,
            now,
        })).toBe("< 1s");
    });

    it("returns correct result for boundary values (exactly 1m, 1h, 1d)", () => {
        expect(formatTimeDiff({
            timestamp: now + TimeUnit.ONE_MINUTE,
            now,
        })).toBe("1m");
        expect(formatTimeDiff({
            timestamp: now + TimeUnit.ONE_HOUR,
            now,
        })).toBe("1h");
        expect(formatTimeDiff({
            timestamp: now + TimeUnit.ONE_DAY,
            now,
        })).toBe("1d");
        // long format
        expect(formatTimeDiff({
            timestamp: now + TimeUnit.ONE_MINUTE,
            now,
            format: "long",
        })).toBe("1 min");
        expect(formatTimeDiff({
            timestamp: now + TimeUnit.ONE_HOUR,
            now,
            format: "long",
        })).toBe("1 hour");
        expect(formatTimeDiff({
            timestamp: now + TimeUnit.ONE_DAY,
            now,
            format: "long",
        })).toBe("1 day");
    });
});
