import { RefObject } from "react";
import { useFetchAndPaginate } from "./hooks";

/**
 * A button component.
 */
export const Btn: React.FC<{
    onClick: () => void;
    children: React.ReactNode;
    disabled?: boolean;
    working?: boolean;
    className?: string;
}> = ({
    onClick,
    children,
    disabled = undefined,
    working = undefined,
    className = undefined,
}) =>
{
    disabled = disabled || working;

    return (
        <button
            onClick={onClick}
            className={`btn ${working ? "working" : ""} ${className ?? ""}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

/**
 * A button component to navigate through paginated data (see `useFetchAndPaginate()`).
 */
export const BtnPrevNext: React.FC<{
    data: ReturnType<typeof useFetchAndPaginate>;
    onPageChange?: () => void;
    scrollToRefOnPageChange?: RefObject<HTMLElement>;
}> = ({
    data,
    onPageChange,
    scrollToRefOnPageChange,
}) => {
    if (!data.hasMultiplePages) {
        return null;
    }

    const handlePageChange = () => {
        if (scrollToRefOnPageChange?.current) {
            const navBarHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-bar-height"));
            const extraOffset = 9;
            const totalOffset = navBarHeight + extraOffset;
            const yOffset = scrollToRefOnPageChange.current.getBoundingClientRect().top + window.scrollY - totalOffset;
            window.scrollTo({ top: yOffset });
        }

        onPageChange?.();
    };

    const handlePrevClick = () => {
        data.goToPreviousPage();
        handlePageChange();
    };

    const handleNextClick = () => {
        data.goToNextPage();
        handlePageChange();
    };

    return (
        <div className="btn-prev-next">
            <Btn
                disabled={data.isLoading || data.isFirstPage}
                onClick={handlePrevClick}
            >
                PREV
            </Btn>
            <Btn
                disabled={data.isLoading || (data.isLastPage && !data.hasNextPage)}
                working={data.isLoading}
                onClick={handleNextClick}
            >
                NEXT
            </Btn>
        </div>
    );
};
