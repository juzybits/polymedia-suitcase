import { stringToBigint } from "../utils-misc";

describe('stringToBigint', () => {

    it('should convert a basic integer string to BigInt with no decimals', () => {
        expect(stringToBigint('123', 0)).toBe(123n);
        expect(stringToBigint('0', 0)).toBe(0n);
    });

    it('should convert a string with decimals to BigInt', () => {
        expect(stringToBigint('123.456', 3)).toBe(123456n);
        expect(stringToBigint('1.000000001', 9)).toBe(1000000001n);
        expect(stringToBigint('123.456789', 6)).toBe(123456789n);
    });

    it('should handle leading and trailing zeros correctly', () => {
        expect(stringToBigint('000123.456', 3)).toBe(123456n);
        expect(stringToBigint('123.456000', 6)).toBe(123456000n);
        expect(stringToBigint('00123.000456', 6)).toBe(123000456n);
    });

    it('should pad with zeros if the decimal part is shorter than the given decimals', () => {
        expect(stringToBigint('123.4', 3)).toBe(123400n);
        expect(stringToBigint('123.45', 5)).toBe(12345000n);
    });

    it('should handle cases with more decimal places than the specified decimals by truncating', () => {
        expect(stringToBigint('123.45678', 3)).toBe(123456n); // Truncate to 123.456
    });

    it('should return 0n for an empty string or a string with only a decimal point', () => {
        expect(stringToBigint('', 3)).toBe(0n);
        expect(stringToBigint('  ', 3)).toBe(0n);
        expect(stringToBigint('.', 3)).toBe(0n);
    });

    it('should handle large numbers correctly', () => {
        expect(stringToBigint('123456789012345678901234567890', 0)).toBe(123456789012345678901234567890n);
        expect(stringToBigint('123456789012345678901234567890.123456789', 9)).toBe(123456789012345678901234567890123456789n);
    });

    it('should handle very small fractional numbers correctly', () => {
        expect(stringToBigint('0.000000001', 9)).toBe(1n);
        expect(stringToBigint('0.000001', 9)).toBe(1000n);
    });

    it('should return 0n for inputs with only zeros', () => {
        expect(stringToBigint('0', 3)).toBe(0n);
        expect(stringToBigint('0.000', 3)).toBe(0n);
    });

    it('should throw an error for invalid input (non-numeric characters)', () => {
        expect(() => stringToBigint('123abc', 3)).toThrow();
        expect(() => stringToBigint('abc', 3)).toThrow();
        expect(() => stringToBigint('123.456.789', 3)).toThrow(); // Invalid format with multiple dots
    });

    it('should correctly handle negative values', () => {
        expect(stringToBigint('-123.456', 3)).toBe(-123456n);
        expect(stringToBigint('-0.001', 3)).toBe(-1n);
        expect(stringToBigint('-0', 3)).toBe(0n);
        expect(stringToBigint('-0.000', 3)).toBe(0n);
    });

    it('should handle no decimals input correctly', () => {
        expect(stringToBigint('123', 5)).toBe(12300000n);
        expect(stringToBigint('1.5', 0)).toBe(1n); // If no decimals are specified, it should truncate the fractional part
    });

    it('should handle edge case where value is just the decimal separator', () => {
        expect(stringToBigint('.', 5)).toBe(0n);
    });

    it('should handle maximum safe integer value', () => {
        const maxSafeInteger = Number.MAX_SAFE_INTEGER.toString();
        expect(stringToBigint(maxSafeInteger, 0)).toBe(BigInt(maxSafeInteger));
    });

    it('should handle exceedingly long inputs', () => {
        const longInput = '1'.repeat(100) + '.' + '9'.repeat(50);
        const expectedOutput = BigInt('1'.repeat(100) + '9'.repeat(9));
        expect(stringToBigint(longInput, 9)).toBe(expectedOutput);
    });

    it('should throw an error for inputs with special characters or symbols', () => {
        expect(() => stringToBigint('+123.456', 3)).toThrow("Invalid input");
        expect(() => stringToBigint('123$456', 3)).toThrow("Invalid input");
        expect(() => stringToBigint('#123.456', 3)).toThrow("Invalid input");
    });

    it('should handle multiple leading zeros in integer part', () => {
        expect(stringToBigint('0000123.456', 3)).toBe(123456n);
    });

    it('should handle different decimals values correctly', () => {
        expect(stringToBigint('123.456', 0)).toBe(123n);
        expect(stringToBigint('123', 6)).toBe(123000000n);
        expect(stringToBigint('1.234567', 8)).toBe(123456700n);
    });

    it('should handle inputs with leading and trailing whitespace', () => {
        expect(stringToBigint('  123.456  ', 3)).toBe(123456n);
        expect(stringToBigint('  123.456  ', 6)).toBe(123456000n);
    });

});
