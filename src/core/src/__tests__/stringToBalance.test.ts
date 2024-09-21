import { stringToBalance } from "../balances.js";

describe("stringToBalance", () => {

    it("should convert a basic integer string to BigInt with no decimals", () => {
        expect(stringToBalance("123", 0)).toBe(123n);
        expect(stringToBalance("0", 0)).toBe(0n);
    });

    it("should convert a string with decimals to BigInt", () => {
        expect(stringToBalance("123.456", 3)).toBe(123456n);
        expect(stringToBalance("1.000000001", 9)).toBe(1000000001n);
        expect(stringToBalance("123.456789", 6)).toBe(123456789n);
    });

    it("should handle leading and trailing zeros correctly", () => {
        expect(stringToBalance("000123.456", 3)).toBe(123456n);
        expect(stringToBalance("123.456000", 6)).toBe(123456000n);
        expect(stringToBalance("00123.000456", 6)).toBe(123000456n);
    });

    it("should pad with zeros if the decimal part is shorter than the given decimals", () => {
        expect(stringToBalance("123.4", 3)).toBe(123400n);
        expect(stringToBalance("123.45", 5)).toBe(12345000n);
    });

    it("should handle cases with more decimal places than the specified decimals by truncating", () => {
        expect(stringToBalance("123.45678", 3)).toBe(123456n); // Truncate to 123.456
    });

    it("should handle large numbers correctly", () => {
        expect(stringToBalance("123456789012345678901234567890", 0)).toBe(123456789012345678901234567890n);
        expect(stringToBalance("123456789012345678901234567890.123456789", 9)).toBe(123456789012345678901234567890123456789n);
    });

    it("should handle very small fractional numbers correctly", () => {
        expect(stringToBalance("0.000000001", 9)).toBe(1n);
        expect(stringToBalance("0.000001", 9)).toBe(1000n);
    });

    it("should return 0n for inputs with only zeros", () => {
        expect(stringToBalance("0", 3)).toBe(0n);
        expect(stringToBalance("0.000", 3)).toBe(0n);
    });

    it("should return 0n for empty inputs", () => {
        expect(stringToBalance("", 3)).toBe(0n);
        expect(stringToBalance("  ", 3)).toBe(0n);
        expect(stringToBalance(".", 3)).toBe(0n);
        expect(stringToBalance("-", 3)).toBe(0n);
    });

    it("should throw an error for inputs with special characters or symbols", () => {
        expect(() => stringToBalance("-.", 3)).toThrow();
        expect(() => stringToBalance("1-2", 3)).toThrow();
        expect(() => stringToBalance("1..2", 3)).toThrow();
        expect(() => stringToBalance("123abc", 3)).toThrow();
        expect(() => stringToBalance("abc", 3)).toThrow();
        expect(() => stringToBalance("123.456.789", 3)).toThrow();
        expect(() => stringToBalance("+123.456", 3)).toThrow("Invalid input");
        expect(() => stringToBalance("123$456", 3)).toThrow("Invalid input");
        expect(() => stringToBalance("#123.456", 3)).toThrow("Invalid input");
    });

    it("should correctly handle negative values", () => {
        expect(stringToBalance("-123.456", 3)).toBe(-123456n);
        expect(stringToBalance("-0.001", 3)).toBe(-1n);
        expect(stringToBalance("-0", 3)).toBe(0n);
        expect(stringToBalance("-0.000", 3)).toBe(0n);
    });

    it("should handle no decimals input correctly", () => {
        expect(stringToBalance("123", 5)).toBe(12300000n);
        expect(stringToBalance("1.5", 0)).toBe(1n); // If no decimals are specified, it should truncate the fractional part
    });

    it("should handle maximum safe integer value", () => {
        const maxSafeInteger = Number.MAX_SAFE_INTEGER.toString();
        expect(stringToBalance(maxSafeInteger, 0)).toBe(BigInt(maxSafeInteger));
    });

    it("should handle exceedingly long inputs", () => {
        const longInput = "1".repeat(100) + "." + "9".repeat(50);
        const expectedOutput = BigInt("1".repeat(100) + "9".repeat(9));
        expect(stringToBalance(longInput, 9)).toBe(expectedOutput);
    });

    it("should handle multiple leading zeros in integer part", () => {
        expect(stringToBalance("0000123.456", 3)).toBe(123456n);
    });

    it("should handle different decimals values correctly", () => {
        expect(stringToBalance("123.456", 0)).toBe(123n);
        expect(stringToBalance("123", 6)).toBe(123000000n);
        expect(stringToBalance("1.234567", 8)).toBe(123456700n);
    });

    it("should handle inputs with leading and trailing whitespace", () => {
        expect(stringToBalance("  123.456  ", 3)).toBe(123456n);
        expect(stringToBalance("  123.456  ", 6)).toBe(123456000n);
    });

});
