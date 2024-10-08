import { formatBalance, MAX_U64, NORMALIZED_ADDRESS_REGEX, stringToBalance, validateAndNormalizeAddress } from "@polymedia/suitcase-core";
import React, { useEffect, useState } from "react";

/**
 * Common props for all input fields.
 */
export type CommonInputProps<T> = {
    html?: React.InputHTMLAttributes<HTMLInputElement>;
    label?: React.ReactNode;
    msgRequired?: string;
    onChangeVal?: (val: T | undefined) => void;
    deps?: React.DependencyList;
};

/**
 * The return type for all input fields.
 */
export type InputReturn<T> = {
    str: string;
    val: T | undefined;
    err: string | undefined;
    input: JSX.Element;
    clear: () => void;
};

/**
 * A function that validates an input string and returns an error message or the value.
 */
export type InputValidator<T> = (input: string) => {
    err: string | undefined;
    val: T | undefined;
};

/**
 * A base hook for creating input fields.
 */
export const useInputBase = <T,>(
    props: CommonInputProps<T> & {
        validate: InputValidator<T>;
    },
): InputReturn<T> =>
{
    const html = props.html ?? {};
    const [str, setStr] = useState<string>(`${html.value ?? ""}`);
    const [val, setVal] = useState<T | undefined>();
    const [err, setErr] = useState<string | undefined>();

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
        setErr(undefined);
    };

    useEffect(() => {
        onChangeStr(str); // revalidate
    }, props.deps);

    useEffect(() => {
        if (props.onChangeVal) {
            props.onChangeVal(val);
        }
    }, [val]);

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
    props: CommonInputProps<string> & {
        minLength?: number;
        maxLength?: number;
        minBytes?: number;
        maxBytes?: number;
        msgTooShort?: string;
        msgTooLong?: string;
    },
): InputReturn<string> =>
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

        return { err: undefined, val: input };
    };

    return useInputBase<string>({
        html,
        validate,
        ...props,
    });
};

/**
 * An input field for Sui addresses (or object IDs).
 */
export const useInputAddress = (
    props: CommonInputProps<string>,
): InputReturn<string> =>
{
    const html = props.html ?? {};
    html.type = "text";
    html.inputMode = "text";
    html.pattern = `^${NORMALIZED_ADDRESS_REGEX}$`;

    const validate: InputValidator<string> = (input: string) =>
    {
        const addr = validateAndNormalizeAddress(input);
        return addr
            ? { err: undefined, val: addr }
            : { err: "Invalid Sui address", val: undefined };
    };

    return useInputBase<string>({
        html,
        validate,
        ...props,
    });
};

/**
 * An input field for positive integers.
 */
export const useInputUnsignedInt = (
    props: CommonInputProps<number> & {
        min?: number;
        max?: number;
        msgTooSmall?: string;
        msgTooLarge?: string;
    },
): InputReturn<number> =>
{
    const html = props.html ?? {};
    html.type = "text";
    html.inputMode = "numeric";
    html.pattern = "^[0-9]*$";

    const validate: InputValidator<number> = (input: string) =>
    {
        if (input === "") {
            return { err: undefined, val: undefined };
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
        return { err: undefined, val: numValue };
    };

    return useInputBase<number>({
        html,
        validate,
        ...props,
    });
};

/**
 * Input field for positive Coin balances. Handles decimals (e.g. `"1 SUI"` → `1_000_000_000`).
 */
export const useInputUnsignedBalance = (
    props: CommonInputProps<bigint> & {
        decimals: number;
        min?: bigint;
        max?: bigint;
        msgTooSmall?: string;
        msgTooLarge?: string;
    },
): InputReturn<bigint> =>
{
    const html = props.html ?? {};
    html.type = "text";
    html.inputMode = "decimal";
    html.pattern = `^[0-9]*\\.?[0-9]{0,${props.decimals}}$`;

    const max = props.max ?? MAX_U64;
    const validate: InputValidator<bigint> = (input: string) =>
    {
        if (input === "" || input === ".") {
            return { err: undefined, val: undefined };
        }

        const bigInput = stringToBalance(input, props.decimals);

        if (props.min !== undefined && bigInput < props.min) {
            return { err: props.msgTooSmall ?? `Minimum value is ${formatBalance(props.min, props.decimals)}`, val: undefined };
        }
        if (max !== undefined && bigInput > max) {
            return { err: props.msgTooLarge ?? `Maximum value is ${formatBalance(max, props.decimals)}`, val: undefined };
        }
        return { err: undefined, val: bigInput };
    };

    return useInputBase<bigint>({
        html,
        validate,
        ...props,
    });
};
