import React from "react";

/**
 * A function that updates the state of a `useState` or `useReducer` hook.
 */
export type ReactSetter<T> = React.Dispatch<React.SetStateAction<T>>;
