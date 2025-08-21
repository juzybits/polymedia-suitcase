export type MoveAbort = {
	packageId: string;
	module: string;
	function: string;
	instruction: number;
	code: number;
	command: number;
};

export type ErrorInfo = {
	/** Error constant name. */
	symbol: string;
	/** Custom error message. */
	msg?: string;
};

export type ErrorsByPackage = Record<string, Record<number, ErrorInfo>>;

/**
 * Attempts to convert any kind of value into a readable string.
 */
export function anyToStr(val: unknown): string | null {
	if (val === null || val === undefined) {
		return null;
	}
	const str =
		val instanceof Error
			? val.message
			: typeof val === "string"
				? val
				: (() => {
						try {
							return JSON.stringify(val);
						} catch {
							return String(val);
						}
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
export function parseMoveAbort(error: string): MoveAbort | null {
	const match =
		/MoveAbort.*address:\s*(.*?),.* name:.*Identifier\((.*?)\).*instruction:\s+(\d+),.*function_name:.*Some\((.*?)\).*},\s*(\d+).*in command\s*(\d+)/.exec(
			error,
		);
	if (!match) {
		return null;
	}
	const cleanString = (s: string) => s.replace(/\\/g, "").replace(/"/g, "");
	return {
		packageId: `0x${match[1]!}`,
		module: cleanString(match[2]!),
		instruction: parseInt(match[3]!, 10),
		function: cleanString(match[4]!),
		code: parseInt(match[5]!, 10),
		command: parseInt(match[6]!, 10),
	};
}

/**
 * Parse transaction errors and convert them into user-friendly messages.
 */
export class TxErrorParser {
	public readonly errsByPkg: ErrorsByPackage;

	constructor(errorsByPackage: ErrorsByPackage) {
		this.errsByPkg = errorsByPackage;
	}

	/**
	 * Convert a transaction error into a user-friendly message.
	 * @param err The error object/string to parse
	 * @param defaultMsg Default message if error can't be parsed or is not a known error
	 * @param customMsgs Optional map of error symbols to custom messages
	 * @returns User-friendly error message or null if user rejected
	 */
	public errToStr(
		err: unknown,
		defaultMsg: string,
		customMsgs?: Record<string, string>,
	): string | null {
		const str = anyToStr(err);
		if (!str) {
			return defaultMsg;
		}

		// Handle common cases
		if (str.includes("User rejected")) {
			return null;
		}
		if (str.includes("InsufficientCoinBalance")) {
			return "You don't have enough balance";
		}

		const parsed = parseMoveAbort(str);
		if (!parsed) {
			return defaultMsg;
		}

		// Look up error info for the specific package
		const pkgErrs = this.errsByPkg[parsed.packageId];
		if (!pkgErrs || !(parsed.code in pkgErrs)) {
			return defaultMsg;
		}

		const info = pkgErrs[parsed.code]!;

		// Check custom error messages passed to this method
		if (customMsgs && info.symbol in customMsgs) {
			return customMsgs[info.symbol]!;
		}

		// Check custom error messages passed to constructor
		return info.msg || info.symbol;
	}
}

// === legacy ===

export type ErrorInfos = Record<number, ErrorInfo>;

/**
 * Parse transaction errors and convert them into user-friendly messages.
 *
 * @param packageId The package ID of the transaction.
 * @param errCodes A map of numeric error codes to string error symbols (constant names).
 * @deprecated Use `TxErrorParser` instead.
 */
export class TxErrorParserDeprecated {
	// TODO: remove
	constructor(
		public readonly packageId: string,
		public readonly errInfos: ErrorInfos,
	) {}

	/**
	 * Convert a transaction error into a user-friendly message.
	 * @param err The error object/string to parse
	 * @param defaultMsg Default message if error can't be parsed or is not a known error
	 * @param customMsgs Optional map of error symbols to custom messages
	 * @returns User-friendly error message or null if user rejected
	 */
	public errToStr(
		err: unknown,
		defaultMsg: string,
		customMsgs?: Record<string, string>,
	): string | null {
		const str = anyToStr(err);
		if (!str) {
			return defaultMsg;
		}

		// Handle common cases
		if (str.includes("User rejected")) {
			return null;
		}
		if (str.includes("InsufficientCoinBalance")) {
			return "You don't have enough balance";
		}

		const parsed = parseMoveAbort(str);
		if (
			!parsed ||
			parsed.packageId !== this.packageId ||
			!(parsed.code in this.errInfos)
		) {
			return str;
		}
		const info = this.errInfos[parsed.code];

		// Check custom error messages passed to this method
		if (customMsgs && info.symbol in customMsgs) {
			return customMsgs[info.symbol];
		}

		// Check custom error messages passed to constructor
		return info.msg || info.symbol;
	}
}
