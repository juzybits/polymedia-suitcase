import type { Transaction } from "@mysten/sui/transactions";

export const NETWORK_NAMES = ["mainnet", "testnet", "devnet", "localnet"] as const;

export type NetworkName = (typeof NETWORK_NAMES)[number];

/**
 * A paginated response from a Sui RPC call.
 *
 * @template T The type of data returned by the fetch function
 * @template C The type of cursor used to paginate through the data
 */
export type PaginatedResponse<T, C> = {
	data: T[];
	hasNextPage: boolean;
	nextCursor: C;
};

export const EmptyPaginatedResponse: PaginatedResponse<never, undefined> = {
	data: [],
	hasNextPage: false,
	nextCursor: undefined,
};

/**
 * The return type of `Transaction.receivingRef()`.
 */
export type ReceivingRef = ReturnType<InstanceType<typeof Transaction>["receivingRef"]>;
