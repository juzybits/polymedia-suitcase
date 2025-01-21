export type MoveAbort = {
    packageId: string;
    module: string;
    function: string;
    instruction: number;
    code: number;
    command: number;
};

export type ErrorInfo = {
    symbol: string;
    msg: string;
};

export type ErrorInfos = Record<number, ErrorInfo>;

/**
 * Attempts to convert any kind of value into a readable string.
 */
export function anyToStr(val: unknown): string | null
{
    if (val === null || val === undefined) {
        return null;
    }
    let str = val instanceof Error ? val.message
        : typeof val === "string" ? val
        : (() => {
            try { return JSON.stringify(val); }
            catch { return String(val); }
        })();
    return str.trim() || null;
}

/**
 * Parse a Move abort string into its different parts.
 *
 * Based on `sui/crates/sui/src/clever_error_rendering.rs`.
 *
 * Example error string:
 * `MoveAbort(MoveLocation { module: ModuleId { address: 0x123, name: Identifier("the_module") }, function: 1, instruction: 29, function_name: Some("the_function") }, 5008) in command 2`
 */
export function parseMoveAbort(
    error: string,
): MoveAbort | null
{
    const match = /MoveAbort.*address:\s*(.*?),.* name:.*Identifier\((.*?)\).*instruction:\s+(\d+),.*function_name:.*Some\((.*?)\).*},\s*(\d+).*in command\s*(\d+)/.exec(error);
    if (!match) {
        return null;
    }
    const cleanString = (s: string) => s.replace(/\\/g, "").replace(/"/g, "");
    return {
        packageId: "0x" + match[1],
        module: cleanString(match[2]),
        instruction: parseInt(match[3]),
        function: cleanString(match[4]),
        code: parseInt(match[5]),
        command: parseInt(match[6]),
    };
}

/**
 * Parse transaction errors and convert them into user-friendly messages.
 *
 * @param packageId The package ID of the transaction.
 * @param errCodes A map of numeric errors to string error codes.
 * @param errMessages A map of string error codes to user-friendly messages.
 */
export class TxErrorParser
{
    constructor(
        public readonly packageId: string,
        public readonly errCodes: Record<number, string>,
        public readonly errMessages?: Record<string, string>
    ) {}

    /**
     * Extract the error code from a Move abort string.
     */
    public parseErrCode(str: string): string | null {
        const parsed = parseMoveAbort(str);
        if (!parsed || parsed.packageId !== this.packageId || !(parsed.code in this.errCodes)) {
            return null;
        }
        return this.errCodes[parsed.code];
    }

    /**
     * Convert a transaction error into a user-friendly message.
     * @param err The error object/string to parse
     * @param defaultMsg Default message if error can't be parsed or is not a known error
     * @param customMsgs Optional map of error codes to custom messages
     * @returns User-friendly error message or null if user rejected
     */
    public errToStr(
        err: unknown,
        defaultMsg: string,
        customMsgs?: Record<string, string>
    ): string | null
    {
        if (!err) { return defaultMsg; }

        let str = err instanceof Error ? err.message
            : typeof err === "string" ? err
            : (() => {
                try { return JSON.stringify(err); }
                catch { return String(err); }
            })();
        str = str.trim();
        if (!str) { return defaultMsg; }

        // Handle common cases
        if (str.includes("Rejected from user")) { return null; }
        if (str.includes("InsufficientCoinBalance")) { return "You don't have enough balance"; }

        const code = this.parseErrCode(str);
        if (code) {
            // Check custom error messages passed to this method
            if (customMsgs && code in customMsgs) {
                return customMsgs[code];
            }

            // Check custom error messages passed to constructor
            if (this.errMessages && code in this.errMessages) {
                return this.errMessages[code];
            }
        }
        return defaultMsg;
    }
}
