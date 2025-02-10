import { ComponentProps, forwardRef, ReactNode, RefObject, useState } from "react";
import { Link } from "react-router-dom";

import { useFetchAndPaginate } from "./hooks";
import { LinkExternal } from "./links";

/**
 * A button component.
 */
export const Btn = ({
    onClick,
    children,
    disabled = undefined,
    className = undefined,
}: {
    onClick: () => Promise<unknown>;
    children: ReactNode;
    disabled?: boolean;
    className?: string;
}) =>
{
    const [working, setIsWorking] = useState(false);

    disabled = disabled || working;

    const handleClick = async () => {
        try {
            setIsWorking(true);
            await onClick();
        } finally {
            setIsWorking(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`btn ${working ? "working" : ""} ${className ?? ""}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export const BtnSubmit: typeof Btn = (
    props
) => {
    return (
        <div className="btn-submit">
            <Btn {...props} />
        </div>
    );
};

export const BtnLinkExternal = (
    props: ComponentProps<typeof LinkExternal> & { disabled?: boolean }
) => {
    let className = "btn";
    if (props.className) { className += ` ${props.className}`; }
    if (props.disabled)  { className += " disabled"; }
    return (
        <div className="btn-submit">
            <LinkExternal {...props} className={className} />
        </div>
    );
};

export const BtnLinkInternal = forwardRef<
    HTMLAnchorElement,
    ComponentProps<typeof Link> & { disabled?: boolean }
>((props, ref) =>
{
    let className = "btn";
    if (props.className) { className += ` ${props.className}`; }
    if (props.disabled)  { className += " disabled"; }
    return (
        <div className="btn-submit">
            <Link {...props} className={className} ref={ref} />
        </div>
    );
});

/**
 * A button component to navigate through paginated data (see `useFetchAndPaginate()`).
 */
export const BtnPrevNext = ({
    data,
    onPageChange,
    scrollToRefOnPageChange,
}: {
    data: ReturnType<typeof useFetchAndPaginate>;
    onPageChange?: () => void;
    scrollToRefOnPageChange?: RefObject<HTMLElement>;
}) =>
{
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
        return Promise.resolve();
    };

    const handleNextClick = async () => {
        await data.goToNextPage();
        handlePageChange();
        return Promise.resolve();
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
                onClick={handleNextClick}
            >
                NEXT
            </Btn>
        </div>
    );
};
