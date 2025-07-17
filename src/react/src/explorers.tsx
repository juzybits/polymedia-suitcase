import { RadioOption, RadioSelector } from "./selectors";

export const EXPLORER_NAMES = ["Polymedia", "Suiscan", "SuiVision"] as const;

export type ExplorerName = (typeof EXPLORER_NAMES)[number];

/**
 * A radio button menu to select a Sui explorer and save the choice to local storage.
 */
export const ExplorerRadioSelector: React.FC<{
    selectedExplorer: ExplorerName;
    onSwitch: (newExplorer: ExplorerName) => void;
    className?: string;
}> = ({
    selectedExplorer,
    onSwitch,
    className = "",
}) =>
{
    const options: RadioOption<ExplorerName>[] = EXPLORER_NAMES.map(explorer => ({
        value: explorer,
        label: explorer
    }));

    const onSelect = (newExplorer: ExplorerName) => {
        switchExplorer(newExplorer, onSwitch);
    };

    return (
        <RadioSelector
            options={options}
            selectedValue={selectedExplorer}
            onSelect={onSelect}
            className={`poly-explorer-radio-selector ${className}`}
        />
    );
};

/**
 * Load the chosen Sui explorer name from local storage.
 */
export function loadExplorer(
    defaultExplorer: ExplorerName,
): ExplorerName
{
    const explorer = localStorage.getItem("polymedia.explorer");
    if (isExplorerName(explorer)) {
        return explorer;
    }
    return defaultExplorer;
}

/**
 * Change the chosen Sui explorer, update local storage, and optionally trigger a callback.
 */
export function switchExplorer(
    newExplorer: ExplorerName,
    onSwitch?: (newExplorer: ExplorerName) => void
): void {
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
