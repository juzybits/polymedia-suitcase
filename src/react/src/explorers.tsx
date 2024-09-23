export const EXPLORER_NAMES = ["Polymedia", "Suiscan", "SuiVision"] as const;

export type ExplorerName = (typeof EXPLORER_NAMES)[number];

/**
 * A radio button menu to select a Sui explorer and save the choice to local storage.
 */
export const ExplorerRadioSelector: React.FC<{
    selectedExplorer: ExplorerName,
    onSwitch: (newExplorer: ExplorerName) => void,
    className?: string,
}> = ({
    selectedExplorer,
    onSwitch,
    className = "",
}) => {
    return <div className={`polymedia-explorer-radio-selector ${className}`}>
        {EXPLORER_NAMES.map((explorer) => (
            <div key={explorer}>
                <label className="selector-label">
                    <input
                        className="selector-radio"
                        type="radio"
                        value={explorer}
                        checked={selectedExplorer === explorer}
                        onChange={() => {
                            switchExplorer(explorer, onSwitch);
                        }}
                    />
                    <span className="selector-text">
                        {explorer}
                    </span>
                </label>
            </div>
        ))}
    </div>;
};

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
