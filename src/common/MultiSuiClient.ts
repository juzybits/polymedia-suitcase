import { SuiClient } from '@mysten/sui.js/client';
import { sleep } from './misc.js';

/**
 * A `SuiClient` object that exposes the URL of its RPC endpoint.
 */
export type SuiClientWithEndpoint = SuiClient & {
    endpoint: string;
};
/**
 * A tool to make many requests to multiple Sui RPC endpoints in parallel.
 * @see MultiSuiClient.executeInBatches()
 */
export class MultiSuiClient {
    private readonly clients: SuiClientWithEndpoint[];
    private clientIdx = 0; // the index of the next client to be returned by getNextClient()

    private readonly rateLimitDelay = 334; // minimum time between batches (in milliseconds)
    private readonly endpoints = [
        // 'https://mainnet-rpc.sui.chainbase.online',          // 567 response
        // 'https://mainnet.sui.rpcpool.com',                   // 403 forbidden when using VPN
        'https://mainnet.suiet.app',
        'https://rpc-mainnet.suiscan.xyz',
        'https://sui-mainnet-endpoint.blockvision.org',
        'https://sui-mainnet.public.blastapi.io',
        // 'https://sui-rpc-mainnet.testnet-pride.com',         // 502 bad gateway
        // 'https://sui1mainnet-rpc.chainode.tech',             // 502 bad gateway
        // 'https://sui-mainnet-ca-1.cosmostation.io',
        'https://sui-mainnet-ca-2.cosmostation.io',
        // 'https://sui-mainnet-eu-1.cosmostation.io',          // 000
        // 'https://sui-mainnet-eu-2.cosmostation.io',          // 000
        'https://sui-mainnet-eu-3.cosmostation.io',
        'https://sui-mainnet-eu-4.cosmostation.io',
        'https://sui-mainnet-us-1.cosmostation.io',
        'https://sui-mainnet-us-2.cosmostation.io',
        'https://fullnode.mainnet.sui.io',
        // 'https://sui-mainnet-rpc.allthatnode.com',           // 429 too many requests
        // 'https://sui-mainnet-rpc-germany.allthatnode.com',   // 429 too many requests
        // 'https://sui-mainnet-rpc-korea.allthatnode.com',     // too slow/far
        // 'https://sui-mainnet.nodeinfra.com',                 // 429 too many requests
        'https://sui.publicnode.com',
        'https://sui-mainnet-rpc.bartestnet.com',
    ];

    constructor() {
        this.clients = [];
        for (const endpoint of this.endpoints) {
            let client = new SuiClient({ url: endpoint });
            const clientWithEndpoint = Object.assign(client, { endpoint });
            this.clients.push(clientWithEndpoint);
        }
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
     * Execute many `SuiClient` RPC operations in parallel using multiple endpoints.
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
            const client = this.getNextClient();
            const timeStart = Date.now();
            const batchResults = await Promise.allSettled(
                batch.map(input => operation(client, input))
            );
            const timeTaken = Date.now() - timeStart;

            // Process results and keep track of failed operations for retries
            batchResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    results[start + index] = result.value;
                } else {
                    retries.push(batch[index]);
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
    public async testEndpoints(): Promise<void> {
        console.log(`testing ${this.clients.length} endpoints`);
        console.time('total time');
        for (const client of this.clients) {
            console.time(`time: ${client.endpoint}`);
            const balance = await client.getBalance({
                owner: '0x8ec0945def230349b2cbd72abd0a91ceb1ca8a4604474d03ef16379414f05a10',
                coinType: '0x2::sui::SUI',
            });
            console.timeEnd(`time: ${client.endpoint}`);
            console.log(`balance: ${balance.totalBalance}`);
        }
        console.timeEnd('total time');
    }
}
