import { RefObject, useEffect, useState } from "react";

import { PaginatedResponse } from "@polymedia/suitcase-core";

export type UseFetchResult<T> = ReturnType<typeof useFetch<T>>;
export type UseFetchAndLoadMoreResult<T, C> = ReturnType<typeof useFetchAndLoadMore<T, C>>;
export type UseFetchAndPaginateResult<T, C> = ReturnType<typeof useFetchAndPaginate<T, C>>;

/**
 * A hook that detects when a click or touch event occurs outside a DOM element.
 *
 * @param domElementRef A React ref object pointing to the target DOM element.
 * @param onClickOutside Function to call when a click or touch is detected outside the target element.
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

/**
 * A hook to handle data fetching.
 *
 * @template T The type of data returned by the fetch function
 * @param fetchFunction An async function that returns a `Promise<T>`
 * @param dependencies An array of dependencies that trigger a re-fetch when changed
 * @returns An object containing:
 *   - data: The fetched data
 *   - err: Any error that occurred
 *   - isLoading: Whether data is currently being fetched
 */
export function useFetch<T>(
    fetchFunction: () => Promise<T>,
    dependencies: unknown[] = [],
) {
    const [data, setData] = useState<T | undefined>(undefined);
    const [err, setErr] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, dependencies);

    const fetchData = async () =>
    {
        setData(undefined);
        setErr(null);
        setIsLoading(true);
        try {
            const result = await fetchFunction();
            setData(result);
        } catch (err) {
            setErr(err instanceof Error ? err.message : "An unknown error occurred");
            console.warn("[useFetch]", err);
        } finally {
            setIsLoading(false);
        }
    };

    return { data, err, isLoading, refetch: fetchData };
}

/**
/**
 * A hook to handle data fetching and loading more data.
 *
 * @template T The type of data returned by the fetch function
 * @template C The type of cursor used to paginate through the data
 * @param fetchFunction An async function that returns a `Promise<PaginatedResponse<T>>`
 * @param dependencies An array of dependencies that trigger a re-fetch when changed
 * @returns An object containing:
 *   - data: The fetched data
 *   - err: Any error that occurred
 *   - isLoading: Whether data is currently being fetched
 *   - hasNextPage: Whether there is a next page available to fetch
 *   - loadMore: A function to load more data
 */
export function useFetchAndLoadMore<T, C>(
    fetchFunction: (cursor: C | undefined) => Promise<PaginatedResponse<T, C>>,
    dependencies: unknown[] = [],
) {
    const [ data, setData ] = useState<T[]>([]);
    const [ err, setErr ] = useState<string | null>(null);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ hasNextPage, setHasNextPage ] = useState(true);
    const [ nextCursor, setNextCursor ] = useState<C | undefined>(undefined);

    useEffect(() => {
        // reset state
        setData([]);
        setErr(null);
        setIsLoading(true);
        setHasNextPage(true);
        setNextCursor(undefined);
        // fetch initial data
        loadMore();
    }, dependencies);

    const loadMore = async () =>
    {
        if (!hasNextPage) return;

        setErr(null);
        setIsLoading(true);
        try {
            const response = await fetchFunction(nextCursor);
            setData((prevData) => [...prevData, ...response.data]);
            setHasNextPage(response.hasNextPage);
            setNextCursor(response.nextCursor);
        } catch (err) {
            setErr(err instanceof Error ? err.message : "Failed to load more data");
            console.warn("[useFetchAndLoadMore]", err);
        } finally {
            setIsLoading(false);
        }
    };

    return { data, err, isLoading, hasNextPage, loadMore };
}

/**
 * A hook to handle data fetching and paginating through the results.
 *
 * @template T The type of data returned by the fetch function
 * @template C The type of cursor used to paginate through the data
 * @param fetchFunction An async function that returns a `Promise<PaginatedResponse<T>>`
 * @param dependencies An array of dependencies that trigger a re-fetch when changed
 * @returns An object containing the following properties:
 *   - page: The current page of data
 *   - err: Any error that occurred during fetching
 *   - isLoading: Whether data is currently being fetched
 *   - hasMultiplePages: Whether there are multiple pages of data
 *   - isFirstPage: Whether the current page is the first page
 *   - isLastPage: Whether the current page is the last fetched page
 *   - hasNextPage: Whether there is a next page available to fetch
 *   - goToNextPage: Function to navigate to the next page
 *   - goToPreviousPage: Function to navigate to the previous page
 */
export function useFetchAndPaginate<T, C>(
    fetchFunction: (cursor: C | undefined) => Promise<PaginatedResponse<T, C>>,
    dependencies: unknown[] = [],
) {
    const [ pages, setPages ] = useState<T[][]>([]);
    const [ err, setErr ] = useState<string | null>(null);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ pageIndex, setPageIndex ] = useState(-1);
    const [ hasNextPage, setHasNextPage ] = useState(true);
    const [ nextCursor, setNextCursor ] = useState<C | undefined>(undefined);

    useEffect(() => {
        // reset state
        setPages([]);
        setErr(null);
        setIsLoading(true);
        setPageIndex(-1);
        setHasNextPage(true);
        setNextCursor(undefined);
        // fetch initial data
        goToNextPage();
    }, dependencies);

    const goToNextPage = async () =>
    {
        const isLastPage = pageIndex === pages.length - 1;
        const nextPageIndex = pageIndex + 1;

        if (isLastPage && !hasNextPage) return; // no more pages available
        if (!isLastPage) { // next page already fetched
            setPageIndex(nextPageIndex);
            return;
        }
        // fetch the next page
        setErr(null);
        setIsLoading(true);
        try {
            const response = await fetchFunction(nextCursor);
            setPages((prevPages) => [...prevPages, response.data]);
            setHasNextPage(response.hasNextPage);
            setNextCursor(response.nextCursor);
            setPageIndex(nextPageIndex);
        } catch (err) {
            setErr(err instanceof Error ? err.message : "Failed to load more data");
            console.warn("[useFetchAndPaginate]", err);
        } finally {
            setIsLoading(false);
        }
    };

    const goToPreviousPage = () => {
        if (pageIndex > 0) {
            setPageIndex(pageIndex - 1);
        }
    };

    return {
        page: pages[pageIndex] ?? [],
        err,
        isLoading,
        hasMultiplePages: pages.length > 1 || (pages.length === 1 && hasNextPage),
        isFirstPage: pageIndex === 0,
        isLastPage: pageIndex === pages.length - 1,
        hasNextPage,
        goToNextPage,
        goToPreviousPage,
    };
}
