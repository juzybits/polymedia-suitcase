import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { NetworkName } from './types.js';
import { sleep } from './utils-misc.js';

/**
 * A tool to make many RPC requests using multiple endpoints.
 * @see SuiMultiClient.executeInBatches()
 */
export class SuiMultiClient {
    private readonly clients: SuiClientWithEndpoint[];
    private readonly rateLimitDelay: number;
    private clientIdx: number; // the index of the next client to be returned by getNextClient()

    /**
     * @param endpointUrls A list of Sui RPC endpoint URLs.
     * @param rateLimitDelay (optional) Minimum time between batches, in milliseconds.
     */
    constructor(
        endpointUrls: string[],
        rateLimitDelay = 334
    ) {
        this.clients = [];
        this.clientIdx = 0;
        this.rateLimitDelay = rateLimitDelay;
        const endpoints = endpointUrls;
        for (const endpoint of endpoints) {
            const client = new SuiClient({ url: endpoint });
            const clientWithEndpoint = Object.assign(client, { endpoint });
            this.clients.push(clientWithEndpoint);
        }
    }

    /**
     * Create a SuiMultiClient instance with the default endpoints for a given network.
     * @param network The network name to select default RPC endpoints.
     * @param rateLimitDelay (optional) Minimum time between batches, in milliseconds.
     */
    public static newWithDefaultEndpoints(
        network: NetworkName,
        rateLimitDelay?: number,
    ): SuiMultiClient {
        const endpoints = RPC_ENDPOINTS[network];
        if (typeof rateLimitDelay === 'undefined') {
            rateLimitDelay = network === 'localnet' ? 0 : 334;
        }
        return new SuiMultiClient(endpoints, rateLimitDelay);
    }

    /**
     * Returns a different SuiClient in a round-robin fashion
     */
    private getNextClient(): SuiClientWithEndpoint {
        const client = this.clients[this.clientIdx];
        this.clientIdx = (this.clientIdx + 1) % this.clients.length;
        return client;
    }

    /**
     * Execute `SuiClient` RPC operations in parallel using multiple endpoints.
     * If any operation fails, it's retried by calling this function recursively.
     * @param inputs The inputs for each RPC call.
     * @param operation A function that performs the RPC operation.
     * @returns The results of the RPC operations in the same order as the inputs.
     */
    public async executeInBatches<InputType, OutputType>(
        inputs: InputType[],
        operation: (client: SuiClientWithEndpoint, input: InputType) => Promise<OutputType>
    ): Promise<OutputType[]> {
        const results = new Array<OutputType|null>(inputs.length).fill(null);
        const retries = new Array<InputType>();
        const batchSize = this.clients.length;
        const totalBatches = Math.ceil(inputs.length / batchSize);
        console.log(`Executing ${inputs.length} operations in batches of ${batchSize}`);

        for (let start = 0, batchNum = 1; start < inputs.length; start += batchSize, batchNum++) {
            console.log(`Processing batch ${batchNum} of ${totalBatches}`);

            // Execute all operations in the current batch
            const batch = inputs.slice(start, start + batchSize);
            const timeStart = Date.now();
            const batchResults = await Promise.allSettled(
                batch.map(input => {
                    const client = this.getNextClient();
                    return operation(client, input);
                })
            );
            const timeTaken = Date.now() - timeStart;

            // Process results and keep track of failed operations for retries
            batchResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    results[start + index] = result.value;
                } else {
                    retries.push(batch[index]); // TODO: ignore failing RPC endpoints moving forward
                }
            });

            // Respect rate limit delay
            if (timeTaken < this.rateLimitDelay) {
                await sleep(this.rateLimitDelay - timeTaken);
            }
        }

        // Retry failed operations by calling executeInBatches recursively
        if (retries.length > 0) {
            const retryResults = await this.executeInBatches(retries, operation);
            for (let i = 0, retryIndex = 0; i < results.length; i++) {
                if (results[i] === null) {
                    results[i] = retryResults[retryIndex++];
                }
            }
        }

        // Safe to cast as all nulls have been replaced with OutputType
        return results as OutputType[];
    }

    /**
     * Test the latency of various Sui RPC endpoints.
     */
    public async testEndpoints(
        operation: (client: SuiClientWithEndpoint) => Promise<void>
    ): Promise<void> {
        console.log(`testing ${this.clients.length} endpoints`);
        console.time('total time');
        for (const client of this.clients) {
            console.time(`time: ${client.endpoint}`);
            await operation(client);
            console.timeEnd(`time: ${client.endpoint}`);
        }
        console.log('');
        console.timeEnd('total time');
    }
}

/**
 * A `SuiClient` object that exposes the URL of its RPC endpoint.
 */
export type SuiClientWithEndpoint = SuiClient & {
    endpoint: string;
};

/**
 * Default RPC endpoint URLs for SuiMultiClient.
 * Manually tested for the last time on January 2023.
 */
export const RPC_ENDPOINTS: Record<NetworkName, string[]> = {
    'mainnet': [
        getFullnodeUrl('mainnet'),
        'https://mainnet.suiet.app',
        'https://rpc-mainnet.suiscan.xyz',
        'https://sui-mainnet-ca-2.cosmostation.io',
        'https://sui-mainnet-endpoint.blockvision.org',
        'https://sui-mainnet-eu-3.cosmostation.io',
        'https://sui-mainnet-eu-4.cosmostation.io',
        'https://sui-mainnet-rpc.bartestnet.com',
        'https://sui-mainnet-us-1.cosmostation.io',
        'https://sui-mainnet-us-2.cosmostation.io',
        'https://sui-mainnet.public.blastapi.io',
        'https://sui.publicnode.com',

        'https://sui-mainnet-rpc-germany.allthatnode.com',
        'https://sui-mainnet-rpc.allthatnode.com',
        'https://sui-mainnet.nodeinfra.com',                    // 429 too many requests (occasionally)
        'https://sui1mainnet-rpc.chainode.tech',                // 502 bad gateway (works now)
        // 'https://mainnet.sui.rpcpool.com',                   // 403 forbidden when using VPN
        // 'https://sui-mainnet-rpc-korea.allthatnode.com',     // too slow/far

        // 'https://mainnet-rpc.sui.chainbase.online',          // 567 response
        // 'https://sui-mainnet-ca-1.cosmostation.io',          // 404
        // 'https://sui-rpc-mainnet.testnet-pride.com',         // 502 bad gateway
        // 'https://sui-mainnet-eu-1.cosmostation.io',          // 000
        // 'https://sui-mainnet-eu-2.cosmostation.io',          // 000
    ],
    'testnet': [
        getFullnodeUrl('testnet'),
        'https://rpc-testnet.suiscan.xyz',
        'https://sui-testnet-endpoint.blockvision.org',
        'https://sui-testnet.public.blastapi.io',
        'https://testnet.suiet.app',
        'https://sui-testnet.nodeinfra.com',                    // 429 too many requests (occasionally)
        // 'https://testnet.sui.rpcpool.com',                   // 403 forbidden when using VPN
    ],
    'devnet': [
        getFullnodeUrl('devnet'),
        'https://devnet.suiet.app',
    ],
    'localnet': [
        // to simulate multiple RPC endpoints locally
        getFullnodeUrl('localnet'),
        getFullnodeUrl('localnet'),
        getFullnodeUrl('localnet'),
        getFullnodeUrl('localnet'),
        getFullnodeUrl('localnet'),
        getFullnodeUrl('localnet'),
        getFullnodeUrl('localnet'),
        getFullnodeUrl('localnet'),
        getFullnodeUrl('localnet'),
        getFullnodeUrl('localnet'),
    ],
};
