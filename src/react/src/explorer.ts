export const EXPLORER_NAMES = ["Polymedia", "Suiscan", "SuiVision"] as const;

export type ExplorerName = (typeof EXPLORER_NAMES)[number];

/**
 * Load the chosen Sui explorer name from local storage.
 */
export function loadExplorer(
    defaultExplorer: ExplorerName,
): ExplorerName
{
    if (!isExplorerName(defaultExplorer)) {
        throw new Error(`Explorer not supported: ${defaultExplorer}`);
    }

    const explorer = localStorage.getItem("polymedia.explorer");
    if (isExplorerName(explorer)) {
        return explorer;
    }

    localStorage.setItem("polymedia.explorer", defaultExplorer);
    return defaultExplorer;
}

/**
 * Change the chosen Sui explorer, update local storage, and optionally trigger a callback.
 */
export function switchExplorer(
    newExplorer: ExplorerName,
    onSwitch?: (newExplorer: ExplorerName) => void
): void {
    if (!isExplorerName(newExplorer)) {
        throw new Error(`Explorer not supported: ${newExplorer}`);
    }
    localStorage.setItem("polymedia.explorer", newExplorer);
    if (onSwitch) {
        onSwitch(newExplorer);
    } else {
        window.location.reload();
    }
}

function isExplorerName(
    value: string | null,
): value is ExplorerName {
    return value !== null && EXPLORER_NAMES.includes(value as ExplorerName);
}
