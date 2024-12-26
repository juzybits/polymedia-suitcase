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
): {
    packageId: string;
    module: string;
    function: string;
    instruction: number;
    code: number;
    command: number;
} | null
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
        private packageId: string,
        private errCodes: Record<number, string>,
        private errMessages?: Record<string, string>
    ) {}

    /**
     * Extract the error code from a Move abort string.
     */
    public parseErrCode(err: string): string {
        const error = parseMoveAbort(err);
        if (!error || error.packageId !== this.packageId || !(error.code in this.errCodes)) {
            return err;
        }
        return this.errCodes[error.code];
    }

    /**
     * Convert a transaction error into a user-friendly message.
     * @param err The error object/string to parse
     * @param defaultMessage Default message if error can't be parsed or is not a known error
     * @param errMessages Optional map of error codes to custom messages
     * @returns User-friendly error message or null if user rejected
     */
    public errToStr(
        err: unknown,
        defaultMessage: string,
        errMessages?: Record<string, string>
    ): string | null
    {
        if (!err) { return defaultMessage; }

        const str = err instanceof Error ? err.message
            : typeof err === "string" ? err
            : JSON.stringify(err);

        // Handle common cases
        if (str.includes("Rejected from user")) { return null; }
        if (str.includes("InsufficientCoinBalance")) { return "You don't have enough balance"; }

        const code = this.parseErrCode(str);

        // Check custom error messages passed to this method
        if (errMessages && code in errMessages) {
            return errMessages[code];
        }

        // Check custom error messages passed to constructor
        if (this.errMessages && code in this.errMessages) {
            return this.errMessages[code];
        }

        return code || defaultMessage;
    }
}
