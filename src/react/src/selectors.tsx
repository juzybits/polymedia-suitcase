export type RadioOption<T extends string> = {
	value: T;
	label: React.ReactNode;
};

export type RadioSelectorProps<T extends string> = {
	options: RadioOption<T>[];
	selectedValue: T;
	onSelect: (value: T) => void;
	className?: string;
};

/**
 * A generic radio button menu.
 */
export function RadioSelector<T extends string>({
	options,
	selectedValue,
	onSelect,
	className = "",
}: RadioSelectorProps<T>) {
	return (
		<div className={`poly-radio-selector ${className}`}>
			{options.map((option) => (
				<div key={option.value}>
					<label className="selector-label">
						<input
							className="selector-radio"
							type="radio"
							value={option.value}
							checked={selectedValue === option.value}
							onChange={() => onSelect(option.value)}
						/>
						<span className="selector-text">{option.label}</span>
					</label>
				</div>
			))}
		</div>
	);
}
