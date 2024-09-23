import { RefObject, useEffect } from "react";

/**
 * A hook that detects when a click or touch event occurs outside a DOM element.
 *
 * @param domElementRef - A React ref object pointing to the target DOM element.
 * @param onClickOutside - Function to call when a click or touch is detected outside the target element.
 */
export function useClickOutside(
    domElementRef: RefObject<HTMLElement>,
    onClickOutside: () => void,
): void
{
    const handleClickOutside = (event: MouseEvent|TouchEvent) =>
    {
        if (domElementRef.current
            && event.target instanceof Node
            && !domElementRef.current.contains(event.target)
        ) {
            onClickOutside();
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    });
}
