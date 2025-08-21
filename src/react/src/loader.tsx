import type { UseFetchResult } from ".";
import { CardMsg, CardSpinner } from "./cards";
import type { UseFetchAndPaginateResult } from "./hooks";

export const Loader = <T,>({
	name,
	fetch,
	children,
}: {
	name: string;
	fetch: UseFetchResult<T>;
	children: (data: NonNullable<T>) => React.ReactNode;
}) => {
	if (fetch.err !== null) return <CardMsg>{fetch.err}</CardMsg>;
	if (fetch.isLoading || fetch.data === undefined) return <CardSpinner />;
	if (fetch.data === null) return <CardMsg>{name} not found</CardMsg>;
	return <>{children(fetch.data)}</>;
};

export const LoaderPaginated = <T, C>({
	fetch,
	children,
	msgErr,
	msgEmpty,
}: {
	fetch: UseFetchAndPaginateResult<T, C>;
	children: (fetch: UseFetchAndPaginateResult<T, C>) => React.ReactNode;
	msgErr?: React.ReactNode;
	msgEmpty?: React.ReactNode;
}) => {
	if (fetch.err !== null) return <CardMsg>{msgErr ?? fetch.err}</CardMsg>;

	if (fetch.page.length === 0) {
		return fetch.isLoading ? (
			<CardSpinner />
		) : (
			<CardMsg>{msgEmpty ?? "None found"}</CardMsg>
		);
	}

	return <>{children(fetch)}</>;
};
