import {
	type ButtonHTMLAttributes,
	type ComponentProps,
	forwardRef,
	type ReactNode,
	type RefObject,
} from "react";
import { Link } from "react-router-dom";
import type { useFetchAndPaginate } from "./hooks";
import { LinkExternal } from "./links";

export const Btn = ({
	children,
	wrapped = true,
	isSubmitting = false,
	type = "button",
	className = undefined,
	...props
}: {
	children: ReactNode;
	wrapped?: boolean;
	isSubmitting?: boolean;
	type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
	className?: ButtonHTMLAttributes<HTMLButtonElement>["className"];
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "className">) => {
	const button = (
		<button
			type={type}
			className={`btn${isSubmitting ? " working" : ""}${className ? ` ${className}` : ""}`}
			{...props}
		>
			{children}
		</button>
	);

	return wrapped ? <div className="btn-wrap">{button}</div> : button;
};

export const BtnLinkExternal = (
	props: ComponentProps<typeof LinkExternal> & { disabled?: boolean },
) => {
	let className = "btn";
	if (props.className) {
		className += ` ${props.className}`;
	}
	if (props.disabled) {
		className += " disabled";
	}
	return (
		<div className="btn-wrap">
			<LinkExternal {...props} className={className} />
		</div>
	);
};

export const BtnLinkInternal = forwardRef<
	HTMLAnchorElement,
	ComponentProps<typeof Link> & { disabled?: boolean }
>((props, ref) => {
	let className = "btn";
	if (props.className) {
		className += ` ${props.className}`;
	}
	if (props.disabled) {
		className += " disabled";
	}
	return (
		<div className="btn-wrap">
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
	scrollToRefOnPageChange?: RefObject<HTMLElement | null>;
}) => {
	if (!data.hasMultiplePages) {
		return null;
	}

	const handlePageChange = () => {
		if (scrollToRefOnPageChange?.current) {
			const navBarHeight = parseInt(
				getComputedStyle(document.documentElement).getPropertyValue("--nav-bar-height"),
				10,
			);
			const extraOffset = 9;
			const totalOffset = navBarHeight + extraOffset;
			const yOffset =
				scrollToRefOnPageChange.current.getBoundingClientRect().top +
				window.scrollY -
				totalOffset;
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
			<Btn disabled={data.isLoading || data.isFirstPage} onClick={handlePrevClick}>
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
