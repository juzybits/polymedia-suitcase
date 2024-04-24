import { SuiClient } from '@mysten/sui.js/client';
import { NetworkName } from './types.js';
import { sleep } from './utils-misc.js';
import { RPC_ENDPOINTS } from './rpcs.js';

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
        rateLimitDelay = 333,
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
        console.debug(`[SuiMultiClient] Executing ${inputs.length} operations in batches of ${batchSize}`);

        for (let start = 0, batchNum = 1; start < inputs.length; start += batchSize, batchNum++) {
            console.debug(`[SuiMultiClient] Processing batch ${batchNum} of ${totalBatches}`);

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
                    console.warn(`[SuiMultiClient] status: ${result.status}, reason:`, result.reason);
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
