/**
 * Load the chosen Sui explorer name from local storage.
 */
export function loadExplorer(
    supportedExplorers: readonly string[],
    defaultExplorer: string,
): string
{
    if (!supportedExplorers.includes(defaultExplorer)) {
        throw new Error(`Explorer not supported: ${defaultExplorer}`);
    }

    const explorer = localStorage.getItem("polymedia.explorer");
    if (explorer && supportedExplorers.includes(explorer)) {
        return explorer;
    }

    localStorage.setItem("polymedia.explorer", defaultExplorer);
    return defaultExplorer;
}

/**
 * Change the chosen Sui explorer, update local storage and optionally trigger a callback.
 */
export function switchExplorer(
    newExplorer: string,
    supportedExplorers: readonly string[],
    onSwitch?: (newExplorer: string) => void
): void {
    if (!supportedExplorers.includes(newExplorer)) {
        throw new Error(`Explorer not supported: ${newExplorer}`);
    }
    localStorage.setItem("polymedia.explorer", newExplorer);
    if (onSwitch) {
        onSwitch(newExplorer);
    } else {
        window.location.reload();
    }
}
