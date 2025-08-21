import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

import type { NetworkName } from "./types.js";

/**
 * Default RPC endpoint URLs for SuiMultiClient.
 * Manually tested for the last time on September 2024.
 */
export const RPC_ENDPOINTS: Record<NetworkName, string[]> = {
	mainnet: [
		getFullnodeUrl("mainnet"),
		"https://mainnet.suiet.app",
		"https://rpc-mainnet.suiscan.xyz",
		"https://mainnet.sui.rpcpool.com",
		"https://sui-mainnet.nodeinfra.com",
		"https://mainnet-rpc.sui.chainbase.online",
		"https://sui-mainnet-ca-1.cosmostation.io",
		"https://sui-mainnet-ca-2.cosmostation.io",
		"https://sui-mainnet-us-1.cosmostation.io",
		"https://sui-mainnet-us-2.cosmostation.io",

		// "https://sui-mainnet.public.blastapi.io",            // 500
		// "https://sui-mainnet-endpoint.blockvision.org",      // 429 too many requests

		// "https://sui-rpc.publicnode.com",                    // 504 Gateway Timeout on queryTransactionBlocks() with showEffects/show*
		// "https://sui1mainnet-rpc.chainode.tech",             // CORS error
		// "https://sui-mainnet-rpc.allthatnode.com",           // 000
		// "https://sui-mainnet-rpc-korea.allthatnode.com",     // 000
		// "https://sui-mainnet-rpc-germany.allthatnode.com",   // 000
		// "https://sui-mainnet-rpc.bartestnet.com",            // 403
		// "https://sui-rpc-mainnet.testnet-pride.com",         // 502
		// "https://sui-mainnet-eu-1.cosmostation.io",          // 000
		// "https://sui-mainnet-eu-2.cosmostation.io",          // 000
		// "https://sui-mainnet-eu-3.cosmostation.io",          // CORS error
		// "https://sui-mainnet-eu-4.cosmostation.io",          // CORS error
	],
	testnet: [
		getFullnodeUrl("testnet"),
		"https://rpc-testnet.suiscan.xyz",
		"https://sui-testnet-endpoint.blockvision.org",
		"https://sui-testnet.public.blastapi.io",
		"https://testnet.suiet.app",
		"https://sui-testnet.nodeinfra.com",
		"https://testnet.sui.rpcpool.com",
		"https://sui-testnet-rpc.publicnode.com",
	],
	devnet: [
		getFullnodeUrl("devnet"),
		// "https://devnet.suiet.app",                          // no data
	],
	localnet: [
		// to simulate multiple RPC endpoints locally
		getFullnodeUrl("localnet") + "?localnet-1",
		getFullnodeUrl("localnet") + "?localnet-2",
		getFullnodeUrl("localnet") + "?localnet-3",
		getFullnodeUrl("localnet") + "?localnet-4",
		getFullnodeUrl("localnet") + "?localnet-5",
	],
};

/**
 * A result returned by `measureRpcLatency`.
 */
export type RpcLatencyResult = {
	endpoint: string;
	latency?: number;
	error?: string;
};

/**
 * Measure Sui RPC latency by making requests to various endpoints.
 */
export async function measureRpcLatency({
	// TODO: average, p-50, p-90
	endpoints,
	rpcRequest = async (client: SuiClient) => {
		await client.getObject({ id: "0x123" });
	},
}: {
	endpoints: string[];
	rpcRequest?: ((client: SuiClient) => Promise<void>) | undefined;
}): Promise<RpcLatencyResult[]> {
	const promises = endpoints.map(async (url) => {
		try {
			const suiClient = new SuiClient({ url });
			const startTime = performance.now();
			await rpcRequest(suiClient);
			const latency = performance.now() - startTime;
			return { endpoint: url, latency };
		} catch (err) {
			return { endpoint: url, error: String(err) };
		}
	});

	const results = await Promise.allSettled(promises);
	return results.map((result) => {
		if (result.status === "fulfilled") {
			return result.value;
		} else {
			// should never happen
			return {
				endpoint: "Unknown endpoint",
				error: String(result.reason.message) || "Unknown error", // eslint-disable-line
			};
		}
	});
}

/**
 * Instantiate SuiClient using the RPC endpoint with the lowest latency.
 */
export async function newLowLatencySuiClient({
	endpoints,
	rpcRequest,
}: {
	endpoints: string[];
	rpcRequest?: (client: SuiClient) => Promise<void>;
}): Promise<SuiClient> {
	const results = await measureRpcLatency({ endpoints, rpcRequest });
	const suiClient = new SuiClient({ url: results[0].endpoint });
	return suiClient;
}
