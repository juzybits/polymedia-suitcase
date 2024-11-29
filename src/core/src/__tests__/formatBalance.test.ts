import { formatBalance } from "../balances";

describe("formatBalance", () => {
  describe("standard format", () => {
    it("should format numbers < 1000 with 2 decimals", () => {
      expect(formatBalance(123n, 0)).toBe("123.00");
      expect(formatBalance(123456n, 3)).toBe("123.45");
      expect(formatBalance(999999n, 3)).toBe("999.99");
    });

    it("should format numbers >= 1000 without decimals", () => {
      expect(formatBalance(1000n, 0)).toBe("1,000");
      expect(formatBalance(1234567n, 3)).toBe("1,234");
      expect(formatBalance(1234567890n, 6)).toBe("1,234");
    });

    it("should handle numbers with more than 2 decimal places", () => {
      expect(formatBalance(123456n, 4)).toBe("12.34");
      expect(formatBalance(1234567n, 5)).toBe("12.34");
      expect(formatBalance(123456789n, 18)).toBe("0.000000000123456789");
      expect(formatBalance(1234567890123456789n, 18)).toBe("1.23");
    });

    it("should handle zero correctly", () => {
      expect(formatBalance(0n, 2)).toBe("0.00");
      expect(formatBalance(0n, 0)).toBe("0.00");
    });

    it("should handle negative numbers", () => {
      expect(formatBalance(-123n, 0)).toBe("-123.00");
      expect(formatBalance(-1234n, 0)).toBe("-1,234");
    });

    it("should handle very small positive numbers", () => {
      expect(formatBalance(1n, 18)).toBe("0.000000000000000001");
      expect(formatBalance(10n, 18)).toBe("0.00000000000000001");
      expect(formatBalance(100n, 18)).toBe("0.0000000000000001");
    });

    it("should handle very small negative numbers", () => {
      expect(formatBalance(-1n, 18)).toBe("-0.000000000000000001");
      expect(formatBalance(-10n, 18)).toBe("-0.00000000000000001");
      expect(formatBalance(-100n, 18)).toBe("-0.0000000000000001");
    });

    it("should handle maximum safe integer", () => {
      const maxSafeInteger = BigInt(Number.MAX_SAFE_INTEGER);
      expect(formatBalance(maxSafeInteger, 0)).toBe("9,007,199,254,740,991");
    });

    it("should handle very large numbers", () => {
      expect(formatBalance(1234567890123456789012345678901234567890n, 0)).toBe("1,234,567,890,123,456,789,012,345,678,901,234,567,890");
    });
  });

  describe("compact format", () => {
    it("should use standard format for numbers < 1 million", () => {
      expect(formatBalance(123456n, 0, "compact")).toBe("123,456");
      expect(formatBalance(999999n, 0, "compact")).toBe("999,999");
    });

    it("should format numbers in millions", () => {
      expect(formatBalance(1000000n, 0, "compact")).toBe("1.00M");
      expect(formatBalance(1234567n, 0, "compact")).toBe("1.23M");
      expect(formatBalance(12345678n, 0, "compact")).toBe("12.34M");
      expect(formatBalance(123456789n, 0, "compact")).toBe("123.45M");
    });

    it("should format numbers in billions", () => {
      expect(formatBalance(1000000000n, 0, "compact")).toBe("1.00B");
      expect(formatBalance(1234567890n, 0, "compact")).toBe("1.23B");
      expect(formatBalance(12345678901n, 0, "compact")).toBe("12.34B");
      expect(formatBalance(123456789012n, 0, "compact")).toBe("123.45B");
    });

    it("should format numbers in trillions", () => {
      expect(formatBalance(1000000000000n, 0, "compact")).toBe("1.00T");
      expect(formatBalance(1234567890123n, 0, "compact")).toBe("1.23T");
      expect(formatBalance(12345678901234n, 0, "compact")).toBe("12.34T");
      expect(formatBalance(123456789012345n, 0, "compact")).toBe("123.45T");
    });

    it("should handle decimals in compact format", () => {
      expect(formatBalance(1234567890n, 6, "compact")).toBe("1,234");
      expect(formatBalance(1234567890123n, 9, "compact")).toBe("1,234");
    });

    it("should handle negative numbers in compact format", () => {
      expect(formatBalance(-1234567890n, 0, "compact")).toBe("-1.23B");
      expect(formatBalance(-1234567890123n, 0, "compact")).toBe("-1.23T");
    });

    it("should handle numbers just below and above rounding thresholds", () => {
      expect(formatBalance(999999999n, 0, "compact")).toBe("999.99M");
      expect(formatBalance(999999999999n, 0, "compact")).toBe("999.99B");
      expect(formatBalance(1000000001n, 0, "compact")).toBe("1.00B");
      expect(formatBalance(1000000000001n, 0, "compact")).toBe("1.00T");
    });

    it("should handle maximum safe integer", () => {
      const maxSafeInteger = BigInt(Number.MAX_SAFE_INTEGER);
      expect(formatBalance(maxSafeInteger, 0, "compact")).toBe("9,007T");
    });

    it("should handle numbers larger than maximum safe integer", () => {
      const largeNumber = BigInt("1234567890123456789012345678901234567890");
      expect(formatBalance(largeNumber, 0, "compact")).toBe("1,234,567,890,123,456,789,012,345,678T");
    });

    it("should handle different decimal places in compact format", () => {
      expect(formatBalance(1234567890n, 3, "compact")).toBe("1.23M");
      expect(formatBalance(1234567890n, 6, "compact")).toBe("1,234");
      expect(formatBalance(1234567890n, 9, "compact")).toBe("1.23");
    });

    it("should handle zero in compact format", () => {
      expect(formatBalance(0n, 0, "compact")).toBe("0.00");
    });

    it("should handle very small non-zero numbers in compact format", () => {
      expect(formatBalance(1n, 18, "compact")).toBe("0.000000000000000001");
      expect(formatBalance(10n, 18, "compact")).toBe("0.00000000000000001");
      expect(formatBalance(100n, 18, "compact")).toBe("0.0000000000000001");
    });
  });

});
