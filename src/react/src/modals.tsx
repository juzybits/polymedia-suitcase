import React, { useEffect, useRef } from "react";

import { useClickOutside } from "./hooks";
import { IconClose } from "./icons";

export const Modal: React.FC<{
	onClose: () => void;
	children: React.ReactNode;
}> = ({ onClose, children }) => {
	const modalContentRef = useRef<HTMLDivElement>(null);

	useClickOutside(modalContentRef, onClose);

	useEffect(() => {
		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscapeKey);

		return () => {
			document.removeEventListener("keydown", handleEscapeKey);
		};
	}, [onClose]);

	if (!React.Children.count(children)) {
		return null;
	}

	return (
		<div className="poly-modal-background">
			<div className="card poly-modal-content" ref={modalContentRef}>
				<div className="poly-modal-scrollable-content">{children}</div>
				<IconClose className="poly-modal-close icon" onClick={onClose} />
			</div>
		</div>
	);
};
