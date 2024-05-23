// DEPRECATED: This entire file is deprecated and may be removed in future releases.

import { NetworkName } from "@polymedia/suitcase-core";
import defaultEndpoints from "./rpcConfig.json";

const rpcConfigUrl = "https://raw.githubusercontent.com/juzybits/polymedia-webutils/main/src/rpcConfig.json";

type ConnectionOptions = { // mirrors sui/sdk/typescript/src/rpc/connection.ts
    fullnode: string;
    websocket: string;
    faucet: string;
};

type RpcEndpoints = {
    localnet_fullnode: string;
    localnet_websocket: string;
    localnet_faucet: string;

    devnet_fullnode: string;
    devnet_websocket: string;
    devnet_faucet: string;

    testnet_fullnode: string;
    testnet_websocket: string;
    testnet_faucet: string;

    mainnet_fullnode: string;
    mainnet_websocket: string;
    mainnet_faucet: string;
};

/**
 * Get the RPC configuration for a given network.
 *
 * It either reads the RPC config directly from the local rpcConfig.json, or it fetches it
 * from `raw.githubusercontent.com`. If fetching fails, it defaults to the local config.
 *
 * @param {object} options - The configuration options.
 * @property {NetworkName} options.network - The name of the network for which the RPC config is needed.
 * @property {Partial<RpcEndpoints>} [options.customEndpoints] - Endpoints to override the local/fetched config.
 * @property {boolean} [options.fetch=false] - If true, fetches config from GitHub. If false, reads it from local file.
 *
 * @returns {Promise<ConnectionOptions>} The RPC connection options for the given network.
 *
 * @deprecated this was handy during devnet days, but is no longer needed.
 *
 * @example
 * const options = {
 *     network: 'mainnet',
 *     customEndpoints: {
 *         mainnet_fullnode: 'https://custom.fullnode.url'
 *     }
 * };
 * const config = await getRpcConfig(options);
 */
export async function getRpcConfig({
    network,
    fetch = false,
    customEndpoints = {},
}: {
    network: NetworkName;
    customEndpoints?: Partial<RpcEndpoints>;
    fetch?: boolean;
}): Promise<ConnectionOptions>
{
    let baseEndpoints = defaultEndpoints;

    if (fetch) {
        await fetchRpcEndpoints()
        .then(rpcEndpoints => {
            baseEndpoints = rpcEndpoints;
        })
        .catch((error: unknown) => {
            console.warn(`[getRpcConfig] Error fetching RPC config. Will use local defaults. Error: ${String(error)}`);
        });
    }

    const endpoints = {...baseEndpoints, ...customEndpoints};
    return {
        fullnode: endpoints[`${network}_fullnode`],
        websocket: endpoints[`${network}_websocket`],
        faucet: endpoints[`${network}_faucet`],
    };
}

async function fetchRpcEndpoints(url: string = rpcConfigUrl): Promise<RpcEndpoints> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error fetching RPC config: ${response.statusText}`);
    }
    const data = await response.json() as RpcEndpoints;
    return data;
}
