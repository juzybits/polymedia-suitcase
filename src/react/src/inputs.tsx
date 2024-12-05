import { formatBalance, MAX_U64, NORMALIZED_ADDRESS_REGEX, stringToBalance, validateAndNormalizeAddress } from "@polymedia/suitcase-core";
import React, { useEffect, useState } from "react";

// === common ===

/**
 * Common props for all kinds of inputs.
 */
export type CommonInputProps<T> = {
    label?: React.ReactNode;
    msgRequired?: string;
    onChangeVal?: (val: T | undefined) => void;
};

/**
 * The state and rendered element returned by input hooks.
 */
export type InputResult<T> = {
    str: string;
    val: T | undefined;
    err: string | null;
    input: JSX.Element;
    clear: () => void;
};

/**
 * A function that validates an input string and returns an error message or the value.
 */
export type InputValidator<T> = (input: string) => {
    err: string | null;
    val: T | undefined;
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
): InputResult<T> =>
{
    const html = props.html ?? {};
    const [str, setStr] = useState<string>(`${html.value ?? ""}`);
    const [val, setVal] = useState<T | undefined>();
    const [err, setErr] = useState<string | null>(null);

    const onChangeInput: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    {
        // prevent input of invalid characters
        const newStr = e.target.value;
        if (html.pattern && !new RegExp(html.pattern).test(newStr)) {
            return;
        }

        setStr(newStr);
        onChangeStr(newStr);

        if (html.onChange) {
            html.onChange(e);
        }
    };

    const onChangeStr = (newStr: string): void =>
    {
        const trimStr = newStr.trim();
        if (html.required && trimStr === "") {
            setErr(props.msgRequired ?? "Input is required");
            setVal(undefined);
        } else {
            const validation = props.validate(trimStr);
            setErr(validation.err);
            setVal(validation.val);
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
            {props.label &&
            <div className="input-label">{props.label}</div>}

            <input className="input"
                {...html}
                onChange={onChangeInput}
                value={str}
            />

            {err &&
            <div className="input-error">{err}</div>}
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
): InputResult<string> =>
{
    const html = props.html ?? {};
    html.type = "text";
    html.inputMode = "text";
    html.pattern = undefined;

    const textEncoder = new TextEncoder();
    const validate: InputValidator<string> = (input: string) =>
    {
        if (props.minLength && input.length > 0 && input.length < props.minLength) {
            return { err: props.msgTooShort ?? "Too short", val: undefined };
        }
        if (props.maxLength && input.length > 0 && input.length > props.maxLength) {
            return { err: props.msgTooLong ?? "Too long", val: undefined };
        }

        if (props.minBytes && input.length > 0 && textEncoder.encode(input).length < props.minBytes) {
            return { err: props.msgTooShort ?? "Too short", val: undefined };
        }
        if (props.maxBytes && input.length > 0 && textEncoder.encode(input).length > props.maxBytes) {
            return { err: props.msgTooLong ?? "Too long", val: undefined };
        }

        return { err: null, val: input };
    };

    return useInputBase<string>({
        html,
        validate,
        ...props,
        deps: [props],
    });
};

/**
 * An input field for Sui addresses (or object IDs).
 */
export const useInputAddress = (
    props: InputProps<string>,
): InputResult<string> =>
{
    const html = props.html ?? {};
    html.type = "text";
    html.inputMode = "text";
    html.pattern = `^${NORMALIZED_ADDRESS_REGEX}$`;

    const validate: InputValidator<string> = (input: string) =>
    {
        const addr = validateAndNormalizeAddress(input);
        return addr
            ? { err: null, val: addr }
            : { err: "Invalid Sui address", val: undefined };
    };

    return useInputBase<string>({
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
): InputResult<number> =>
{
    const html = props.html ?? {};
    html.type = "text";
    html.inputMode = "numeric";
    html.pattern = "^[0-9]*$";

    const validate: InputValidator<number> = (input: string) =>
    {
        if (input === "") {
            return { err: null, val: undefined };
        }

        const numValue = Number(input);

        if (isNaN(numValue) || numValue < 0) {
            return { err: "Invalid number", val: undefined };
        }
        if (props.min !== undefined && numValue < props.min) {
            return { err: props.msgTooSmall ?? `Minimum value is ${props.min}`, val: undefined };
        }
        if (props.max !== undefined && numValue > props.max) {
            return { err: props.msgTooLarge ?? `Maximum value is ${props.max}`, val: undefined };
        }
        if (numValue > Number.MAX_SAFE_INTEGER) {
            return { err: "Number is too large", val: undefined };
        }
        return { err: null, val: numValue };
    };

    return useInputBase<number>({
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
): InputResult<bigint> =>
{
    const html = props.html ?? {};
    html.type = "text";
    html.inputMode = "decimal";
    html.pattern = `^[0-9]*\\.?[0-9]{0,${props.decimals}}$`;

    const max = props.max ?? MAX_U64;
    const validate: InputValidator<bigint> = (input: string) =>
    {
        if (input === "" || input === ".") {
            return { err: null, val: undefined };
        }

        const bigInput = stringToBalance(input, props.decimals);

        if (props.min !== undefined && bigInput < props.min) {
            return { err: props.msgTooSmall ?? `Minimum value is ${formatBalance(props.min, props.decimals)}`, val: undefined };
        }
        if (max !== undefined && bigInput > max) {
            return { err: props.msgTooLarge ?? `Maximum value is ${formatBalance(max, props.decimals)}`, val: undefined };
        }
        return { err: null, val: bigInput };
    };

    return useInputBase<bigint>({
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
export type TextAreaProps<T> = CommonInputProps<T> & {
    html?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
    validate: InputValidator<T>;
    deps: React.DependencyList;
};

/**
 * A <textarea> field with custom validation.
 */
export const useTextArea = <T,>(
    props: TextAreaProps<T>,
): InputResult<T> =>
{
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
    const onChangeStr = (newStr: string): void => {
        const trimStr = newStr.trim();
        if (html.required && trimStr === "") {
            setErr(props.msgRequired ?? "Input is required");
            setVal(undefined);
        } else {
            const validation = props.validate(trimStr);
            setErr(validation.err);
            setVal(validation.val);
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
            {props.label &&
            <div className="input-label">{props.label}</div>}

            <textarea
                className="input"
                {...html}
                onChange={onChangeTextArea}
                value={str}
            />

            {err &&
            <div className="input-error">{err}</div>}
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
export type DropdownProps<T extends string> = CommonInputProps<T> & {
    options: DropdownOption<T>[];
    html?: React.SelectHTMLAttributes<HTMLSelectElement> & { value?: T };
};

export type DropdownResult<T extends string> = Omit<InputResult<T>, "str">;

/**
 * A <select> dropdown.
 */
export const useDropdown = <T extends string>(
    props: DropdownProps<T>
): DropdownResult<T> =>
{
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
        const newVal = e.target.value === "" ? undefined : e.target.value as T;
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
            {props.label &&
            <div className="input-label">{props.label}</div>}

            <select
                className="input"
                {...html}
                onChange={onChange}
                value={val ?? ""}
            >
                <option value="">{props.msgRequired ?? "Select..."}</option>
                {props.options.map(option => (
                    <option key={String(option.value)} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {err &&
            <div className="input-error">{err}</div>}
        </div>
    );

    return {
        val,
        err,
        input,
        clear: () => {
            setVal(undefined);
            validate(undefined);
        }
    };
};
