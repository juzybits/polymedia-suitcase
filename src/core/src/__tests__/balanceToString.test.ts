import { balanceToString } from "../balances.js";

describe("balanceToString", () => {

    it("should convert basic BigInt values with no decimals to string", () => {
        expect(balanceToString(123n, 0)).toBe("123");
        expect(balanceToString(0n, 0)).toBe("0");
        expect(balanceToString(-123n, 0)).toBe("-123");
    });

    it("should convert BigInt values with decimals to string", () => {
        expect(balanceToString(123456n, 3)).toBe("123.456");
        expect(balanceToString(1000000001n, 9)).toBe("1.000000001");
        expect(balanceToString(123456789n, 6)).toBe("123.456789");
    });

    it("should handle trailing zeros in fractional part", () => {
        expect(balanceToString(123400n, 3)).toBe("123.4");
        expect(balanceToString(12345000n, 5)).toBe("123.45");
        expect(balanceToString(123000000n, 6)).toBe("123");
    });

    it("should handle cases where there are fewer digits than decimals", () => {
        expect(balanceToString(1n, 3)).toBe("0.001");
        expect(balanceToString(100n, 5)).toBe("0.001");
        expect(balanceToString(100000n, 6)).toBe("0.1");
    });

    it("should handle large BigInt values correctly", () => {
        expect(balanceToString(123456789012345678901234567890n, 0)).toBe("123456789012345678901234567890");
        expect(balanceToString(123456789012345678901234567890123456789n, 9)).toBe("123456789012345678901234567890.123456789");
    });

    it("should handle very small fractional values correctly", () => {
        expect(balanceToString(1n, 9)).toBe("0.000000001");
        expect(balanceToString(1000n, 9)).toBe("0.000001");
    });

    it('should return "0" for a zero value regardless of decimals', () => {
        expect(balanceToString(0n, 3)).toBe("0");
        expect(balanceToString(0n, 0)).toBe("0");
    });

    it("should correctly handle negative values with decimals", () => {
        expect(balanceToString(-123456n, 3)).toBe("-123.456");
        expect(balanceToString(-1000000001n, 9)).toBe("-1.000000001");
        expect(balanceToString(-123456789n, 6)).toBe("-123.456789");
    });

    it("should correctly handle edge cases where fractional part is all zeros", () => {
        expect(balanceToString(1000n, 3)).toBe("1");
        expect(balanceToString(123000000n, 6)).toBe("123");
        expect(balanceToString(-1000n, 3)).toBe("-1");
        expect(balanceToString(-123000000n, 6)).toBe("-123");
    });

    it("should handle numbers with leading and trailing zeros correctly", () => {
        expect(balanceToString(123000n, 6)).toBe("0.123");
        expect(balanceToString(123000000n, 9)).toBe("0.123");
        expect(balanceToString(123n, 5)).toBe("0.00123");
    });

    it("should correctly format numbers with large decimals", () => {
        expect(balanceToString(1n, 18)).toBe("0.000000000000000001");
        expect(balanceToString(1000000000000000000n, 18)).toBe("1");
    });

    it("should correctly format numbers with large integer part and small decimals", () => {
        expect(balanceToString(1234567890000000000n, 18)).toBe("1.23456789");
        expect(balanceToString(1234567890000000000n, 15)).toBe("1234.56789");
    });

});
