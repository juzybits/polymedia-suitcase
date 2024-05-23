import { RefObject, useEffect } from "react";

export function useClickOutside(ref: RefObject<HTMLElement>, callback: () => void): void
{
    const handleClickOutside = (event: MouseEvent|TouchEvent) => {
        if (ref.current && event.target instanceof Node && !ref.current.contains(event.target)) {
            callback();
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
