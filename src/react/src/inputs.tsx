import { type Keypair, SUI_PRIVATE_KEY_PREFIX } from "@mysten/sui/cryptography";
import {
	formatBalance,
	MAX_U64,
	pairFromSecretKey,
	REGEX_ADDRESS_NORMALIZED,
	stringToBalance,
	validateAndNormalizeAddress,
} from "@polymedia/suitcase-core";
import type React from "react";
import { useEffect, useRef, useState } from "react";

// === common ===

/**
 * The result of an input validation.
 */
export type ValidationResult<T> = {
	err: string | null;
	val: T | undefined;
};

/**
 * A function that validates a raw input string and returns an error message or the value.
 * Runs after the hook's internal validation.
 */
export type InputValidator<T> = (input: string) => ValidationResult<T>;

/**
 * A function that validates a processed value and returns an error message or the value.
 * Runs after the hook's internal validation and after the user-provided `validateInput`.
 */
export type ValueValidator<T> = (val: T) => ValidationResult<T>;

/**
 * Common props for all kinds of inputs.
 */
export type CommonInputProps<T> = {
	label?: React.ReactNode;
	msgRequired?: string;
	onChangeVal?: (val: T | undefined) => void;
	validateInput?: InputValidator<T>;
	validateValue?: ValueValidator<T>;
};

/**
 * The state and rendered element returned by input hooks.
 */
export type InputResult<T> = {
	str: string;
	val: T | undefined;
	err: string | null;
	input: React.ReactElement;
	clear: () => void;
};

// === input ===

/**
 * Props for `<input>` fields.
 */
export type InputProps<T> = CommonInputProps<T> & {
	html?: React.InputHTMLAttributes<HTMLInputElement>;
};

/**
 * A base hook for creating `<input>` fields.
 */
export const useInputBase = <T,>(
	props: InputProps<T> & {
		validate: InputValidator<T>;
		deps: React.DependencyList;
	},
): InputResult<T> => {
	const html = props.html ?? {};
	const [str, setStr] = useState<string>(`${html.value ?? ""}`);
	const [val, setVal] = useState<T | undefined>();
	const [err, setErr] = useState<string | null>(null);

	const handleInputEvent: React.ChangeEventHandler<HTMLInputElement> = (e) => {
		// prevent input of invalid characters
		const newStr = e.target.value;
		if (html.pattern && !new RegExp(html.pattern).test(newStr)) {
			return;
		}

		setStr(newStr);
		validateAndUpdateValue(newStr);

		if (html.onChange) {
			html.onChange(e);
		}
	};

	const validateAndUpdateValue = (newStr: string) => {
		const trimStr = newStr.trim();
		if (html.required && trimStr === "") {
			setErr(props.msgRequired ?? "Input is required");
			setVal(undefined);
		} else {
			try {
				const validation = props.validate(trimStr);
				setErr(validation.err);
				setVal(validation.val);
			} catch (err) {
				const errMsg = err instanceof Error ? err.message : "Validation failed";
				setErr(errMsg);
				setVal(undefined);
			}
		}
	};

	const clear = () => {
		setStr("");
		setVal(undefined);
		setErr(null);
	};

	useEffect(() => {
		validateAndUpdateValue(str);
	}, props.deps);

	// Notify parent of value changes
	useEffect(() => {
		if (props.onChangeVal) {
			props.onChangeVal(val);
		}
	}, [val, props.onChangeVal]);

	const input = (
		<div className="poly-input">
			{props.label && <div className="input-label">{props.label}</div>}

			<input
				className={`input ${err !== null ? "error" : ""}`}
				{...html}
				onChange={handleInputEvent}
				value={str}
				spellCheck={false}
				autoCorrect="off"
				autoCapitalize="off"
				autoComplete="off"
			/>

			{err && <div className="input-error">{err}</div>}
		</div>
	);

	return { str, val, err, input, clear };
};

/**
 * An input field for strings.
 */
export const useInputString = (
	props: InputProps<string> & {
		minLength?: number;
		maxLength?: number;
		minBytes?: number;
		maxBytes?: number;
		msgTooShort?: string;
		msgTooLong?: string;
	},
): InputResult<string> => {
	const html = props.html ?? {};
	html.type = "text";
	html.inputMode = "text";
	html.pattern = undefined;

	const textEncoder = new TextEncoder();
	const validate: InputValidator<string> = (input: string) => {
		if (props.minLength && input.length > 0 && input.length < props.minLength) {
			return { err: props.msgTooShort ?? "Too short", val: undefined };
		}
		if (props.maxLength && input.length > 0 && input.length > props.maxLength) {
			return { err: props.msgTooLong ?? "Too long", val: undefined };
		}

		if (
			props.minBytes &&
			input.length > 0 &&
			textEncoder.encode(input).length < props.minBytes
		) {
			return { err: props.msgTooShort ?? "Too short", val: undefined };
		}
		if (
			props.maxBytes &&
			input.length > 0 &&
			textEncoder.encode(input).length > props.maxBytes
		) {
			return { err: props.msgTooLong ?? "Too long", val: undefined };
		}

		const inputRes = props.validateInput?.(input);
		if (inputRes?.err) {
			return inputRes;
		}

		const valueRes = props.validateValue?.(inputRes?.val ?? input);
		if (valueRes?.err) {
			return valueRes;
		}

		return { err: null, val: valueRes?.val ?? inputRes?.val ?? input };
	};

	return useInputBase({
		html,
		validate,
		...props,
		deps: [props],
	});
};

/**
 * An input field for Sui addresses (or object IDs).
 */
export const useInputAddress = (props: InputProps<string>): InputResult<string> => {
	const html = props.html ?? {};
	html.type = "text";
	html.inputMode = "text";
	html.pattern = `^${REGEX_ADDRESS_NORMALIZED.source}$`;

	const validate: InputValidator<string> = (input: string) => {
		const addr = validateAndNormalizeAddress(input);
		if (!addr) {
			return { err: "Invalid Sui address", val: undefined };
		}

		const inputRes = props.validateInput?.(input);
		if (inputRes?.err) {
			return inputRes;
		}

		const valueRes = props.validateValue?.(inputRes?.val ?? addr);
		if (valueRes?.err) {
			return valueRes;
		}

		return { err: null, val: valueRes?.val ?? inputRes?.val ?? addr };
	};

	return useInputBase({
		html,
		validate,
		...props,
		deps: [props],
	});
};

/**
 * An input field for Sui private keys that produces a Sui Keypair.
 */
export const useInputPrivateKey = (props: InputProps<Keypair>): InputResult<Keypair> => {
	const html = props.html ?? {};
	html.type = "password";
	html.inputMode = "text";
	html.pattern = `^(${SUI_PRIVATE_KEY_PREFIX}.+)?$`;

	const lastValidate = useRef<
		{ input: string; result: ValidationResult<Keypair> } | undefined
	>(undefined);
	const validate = (input: string): ValidationResult<Keypair> => {
		if (input === "") {
			return { err: null, val: undefined };
		}

		// Avoid creating a new object which will trigger a rerender
		if (lastValidate.current?.input === input) {
			return lastValidate.current.result;
		}

		let result: ValidationResult<Keypair>;
		try {
			const pair = pairFromSecretKey(input);

			const inputRes = props.validateInput?.(input);
			if (inputRes?.err) {
				return inputRes;
			}

			const valueRes = props.validateValue?.(inputRes?.val ?? pair);
			if (valueRes?.err) {
				return valueRes;
			}

			result = { err: null, val: valueRes?.val ?? inputRes?.val ?? pair };
		} catch (_err) {
			result = { err: "Invalid private key", val: undefined };
		}
		lastValidate.current = { input, result };
		return result;
	};

	return useInputBase({
		html,
		validate,
		...props,
		deps: [props],
	});
};

/**
 * An input field for positive integers.
 */
export const useInputUnsignedInt = (
	props: InputProps<number> & {
		min?: number;
		max?: number;
		msgTooSmall?: string;
		msgTooLarge?: string;
	},
): InputResult<number> => {
	const html = props.html ?? {};
	html.type = "text";
	html.inputMode = "numeric";
	html.pattern = "^[0-9]*$";

	const validate: InputValidator<number> = (input: string) => {
		if (input === "") {
			return { err: null, val: undefined };
		}

		const numValue = Number(input);

		if (Number.isNaN(numValue) || numValue < 0) {
			return { err: "Invalid number", val: undefined };
		}
		if (props.min !== undefined && numValue < props.min) {
			return {
				err: props.msgTooSmall ?? `Minimum value is ${props.min}`,
				val: undefined,
			};
		}
		if (props.max !== undefined && numValue > props.max) {
			return {
				err: props.msgTooLarge ?? `Maximum value is ${props.max}`,
				val: undefined,
			};
		}
		if (numValue > Number.MAX_SAFE_INTEGER) {
			return { err: "Number is too large", val: undefined };
		}

		const inputRes = props.validateInput?.(input);
		if (inputRes?.err) {
			return inputRes;
		}

		const valueRes = props.validateValue?.(inputRes?.val ?? numValue);
		if (valueRes?.err) {
			return valueRes;
		}

		return { err: null, val: valueRes?.val ?? inputRes?.val ?? numValue };
	};

	return useInputBase({
		html,
		validate,
		...props,
		deps: [props],
	});
};

/**
 * Input field for positive Coin balances. Handles decimals (e.g. `"1 SUI"` → `1_000_000_000`).
 */
export const useInputUnsignedBalance = (
	props: InputProps<bigint> & {
		decimals: number;
		min?: bigint;
		max?: bigint;
		msgTooSmall?: string;
		msgTooLarge?: string;
	},
): InputResult<bigint> => {
	const html = props.html ?? {};
	html.type = "text";
	html.inputMode = "decimal";
	html.pattern = `^[0-9]*\\.?[0-9]{0,${props.decimals}}$`;

	const max = props.max ?? MAX_U64;
	const validate: InputValidator<bigint> = (input: string) => {
		if (input === "" || input === ".") {
			return { err: null, val: undefined };
		}

		const bigInput = stringToBalance(input, props.decimals);

		if (props.min !== undefined && bigInput < props.min) {
			return {
				err:
					props.msgTooSmall ??
					`Minimum value is ${formatBalance(props.min, props.decimals)}`,
				val: undefined,
			};
		}
		if (max !== undefined && bigInput > max) {
			return {
				err:
					props.msgTooLarge ?? `Maximum value is ${formatBalance(max, props.decimals)}`,
				val: undefined,
			};
		}

		const inputRes = props.validateInput?.(input);
		if (inputRes?.err) {
			return inputRes;
		}

		const valueRes = props.validateValue?.(inputRes?.val ?? bigInput);
		if (valueRes?.err) {
			return valueRes;
		}

		return { err: null, val: valueRes?.val ?? inputRes?.val ?? bigInput };
	};

	return useInputBase({
		html,
		validate,
		...props,
		deps: [props],
	});
};

// === textarea ===

/**
 * Props for `<textarea>` fields.
 */
export type TextAreaProps<T> = Omit<CommonInputProps<T>, "validateValue"> & {
	html?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
	validateInput: InputValidator<T>;
	deps: React.DependencyList;
};

/**
 * A <textarea> field with custom validation.
 */
export const useTextArea = <T,>(props: TextAreaProps<T>): InputResult<T> => {
	const html = props.html ?? {};
	const [str, setStr] = useState<string>(`${html.value ?? ""}`);
	const [val, setVal] = useState<T | undefined>();
	const [err, setErr] = useState<string | null>(null);

	// Handle user input
	const onChangeTextArea: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
		const newStr = e.target.value;
		setStr(newStr);
		onChangeStr(newStr);

		if (html.onChange) {
			html.onChange(e);
		}
	};

	// Validate and update state
	const onChangeStr = (newStr: string) => {
		const trimStr = newStr.trim();
		if (html.required && trimStr === "") {
			setErr(props.msgRequired ?? "Input is required");
			setVal(undefined);
		} else {
			try {
				const validation = props.validateInput(trimStr);
				setErr(validation.err);
				setVal(validation.val);
			} catch (err) {
				const errMsg = err instanceof Error ? err.message : "Validation failed";
				setErr(errMsg);
				setVal(undefined);
			}
		}
	};

	const clear = () => {
		setStr("");
		setVal(undefined);
		setErr(null);
	};

	useEffect(() => {
		onChangeStr(str);
	}, props.deps);

	// Notify parent of value changes
	useEffect(() => {
		if (props.onChangeVal) {
			props.onChangeVal(val);
		}
	}, [val, props.onChangeVal]);

	const input = (
		<div className="poly-input">
			{props.label && <div className="input-label">{props.label}</div>}

			<textarea
				className={`input ${err !== null ? "error" : ""}`}
				{...html}
				onChange={onChangeTextArea}
				value={str}
				spellCheck={false}
				autoCorrect="off"
				autoCapitalize="off"
				autoComplete="off"
			/>

			{err && <div className="input-error">{err}</div>}
		</div>
	);

	return { str, val, err, input, clear };
};

// === dropdown ===

export type DropdownOption<T extends string> = {
	value: T;
	label: string;
};

/**
 * Props for `<select>` fields.
 */
export type DropdownProps<T extends string> = Omit<
	CommonInputProps<T>,
	"validateInput" | "validateValue"
> & {
	options: DropdownOption<T>[];
	html?: React.SelectHTMLAttributes<HTMLSelectElement> & { value?: T };
};

export type DropdownResult<T extends string> = Omit<InputResult<T>, "str">;

/**
 * A <select> dropdown.
 */
export const useDropdown = <T extends string>(
	props: DropdownProps<T>,
): DropdownResult<T> => {
	const html = props.html ?? {};
	const [val, setVal] = useState<T | undefined>(html.value);
	const [err, setErr] = useState<string | null>(null);

	const validate = (newVal: T | undefined) => {
		if (html.required && !newVal) {
			setErr(props.msgRequired ?? "Selection required");
		} else {
			setErr(null);
		}
	};

	const onChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
		const newVal = e.target.value === "" ? undefined : (e.target.value as T);
		setVal(newVal);
		validate(newVal);
		if (props.onChangeVal) {
			props.onChangeVal(newVal);
		}
	};

	useEffect(() => {
		validate(val);
	}, [props]);

	const input = (
		<div className="poly-input">
			{props.label && <div className="input-label">{props.label}</div>}

			<select
				className={`input ${err !== null ? "error" : ""}`}
				{...html}
				onChange={onChange}
				value={val ?? ""}
			>
				<option value="">{"Select..."}</option>
				{props.options.map((option) => (
					<option key={String(option.value)} value={option.value}>
						{option.label}
					</option>
				))}
			</select>

			{err && <div className="input-error">{err}</div>}
		</div>
	);

	return {
		val,
		err,
		input,
		clear: () => {
			setVal(undefined);
			validate(undefined);
		},
	};
};
