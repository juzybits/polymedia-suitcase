import type React from "react";

/**
 * A function that updates the state of a `useState` or `useReducer` hook.
 */
export type ReactSetter<T> = React.Dispatch<React.SetStateAction<T>>;

/**
 * A function that updates some state.
 */
export type Setter<T> = (value: T) => unknown;
