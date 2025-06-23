import { shortenAddress } from "../addresses";

describe("shortenAddress", () => {
    // === Input validation ===
    it("should return empty string for invalid inputs", () => {
        expect(shortenAddress(null)).toBe("");
        expect(shortenAddress(undefined)).toBe("");
        expect(shortenAddress("")).toBe("");
    });

    // === Basic functionality ===
    it("should shorten standard Sui addresses with default parameters", () => {
        const address = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
        expect(shortenAddress(address)).toBe("0x1234…cdef");
    });

    it("should shorten normalized addresses", () => {
        const address = "0x0000000000000000000000000000000000000000000000000000000000000002";
        expect(shortenAddress(address)).toBe("0x0000…0002");
    });

    it("should shorten short addresses with leading zeros removed", () => {
        const address = "0x2";
        expect(shortenAddress(address)).toBe("0x2"); // too short to abbreviate (1 char < 4+4)

        const address2 = "0x123456789";
        expect(shortenAddress(address2)).toBe("0x1234…6789");
    });

    it("should not shorten addresses that are too short", () => {
        expect(shortenAddress("0x1")).toBe("0x1");
        expect(shortenAddress("0x1234")).toBe("0x1234");
        expect(shortenAddress("0x12345678")).toBe("0x12345678"); // exactly 8 chars, still not shortened
        expect(shortenAddress("0x123456789")).toBe("0x1234…6789"); // 9 chars, gets shortened
    });

    // === Custom parameters ===
    it("should respect custom start and end parameters", () => {
        const address = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
        expect(shortenAddress(address, 6, 6)).toBe("0x123456…abcdef");
        expect(shortenAddress(address, 2, 2)).toBe("0x12…ef");
    });

    it("should use custom separator and prefix", () => {
        const address = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
        expect(shortenAddress(address, 4, 4, "...")).toBe("0x1234...cdef");
        expect(shortenAddress(address, 4, 4, "…", "0X")).toBe("0X1234…cdef");
        expect(shortenAddress(address, 4, 4, "…", "")).toBe("1234…cdef");
    });

    // === Case handling ===
    it("should handle different case hex addresses", () => {
        expect(shortenAddress("0X1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF")).toBe("0x1234…CDEF");
        expect(shortenAddress("0x1234567890AbCdEf1234567890aBcDeF1234567890AbCdEf1234567890aBcDeF")).toBe("0x1234…cDeF");
    });

    // === Multiple addresses in text ===
    it("should handle text with multiple addresses", () => {
        const text = "Transfer from 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef to 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
        const expected = "Transfer from 0x1234…cdef to 0xabcd…7890";
        expect(shortenAddress(text)).toBe(expected);
    });

    it("should handle mixed content with addresses", () => {
        const text = "Check address 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef and visit https://example.com";
        const expected = "Check address 0x1234…cdef and visit https://example.com";
        expect(shortenAddress(text)).toBe(expected);
    });

    // === Regex validation ===
    it("should respect the 64 character limit with word boundaries", () => {
        // Valid: exactly 64 hex chars
        const validLongAddress = "0x" + "1".repeat(64);
        expect(shortenAddress(validLongAddress)).toBe("0x1111…1111");

        // Invalid: 65 hex chars (exceeds limit)
        const invalidLongAddress = "0x" + "1".repeat(65);
        expect(shortenAddress(invalidLongAddress)).toBe(invalidLongAddress); // unchanged
    });

    it("should not match invalid hex characters", () => {
        const invalidAddress = "0x123g567890abcdef"; // 'g' is not valid hex
        expect(shortenAddress(invalidAddress)).toBe(invalidAddress);

        const textWithInvalid = "Valid: 0x123456789 Invalid: 0x123g567890abcdef";
        expect(shortenAddress(textWithInvalid)).toBe("Valid: 0x1234…6789 Invalid: 0x123g567890abcdef");
    });

    // === Edge cases ===
    it("should handle edge cases with custom parameters", () => {
        const address = "0x123456789";

        // When start + end > available chars, should not shorten
        expect(shortenAddress(address, 10, 10)).toBe(address);
        expect(shortenAddress(address, 3, 3)).toBe("0x123…789");
    });

    it("should handle minimum valid addresses", () => {
        expect(shortenAddress("0x1")).toBe("0x1");
        expect(shortenAddress("0xa")).toBe("0xa");
        expect(shortenAddress("0xF")).toBe("0xF");
    });

    it("should handle addresses with different case prefixes", () => {
        expect(shortenAddress("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef")).toBe("0x1234…cdef");
        expect(shortenAddress("0X1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF")).toBe("0x1234…CDEF");
    });

    it("should handle addresses at different positions in text", () => {
        const address = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
        expect(shortenAddress(`Start ${address}`)).toBe("Start 0x1234…cdef");
        expect(shortenAddress(`${address} end`)).toBe("0x1234…cdef end");
        expect(shortenAddress(`Start ${address} end`)).toBe("Start 0x1234…cdef end");
    });
});
