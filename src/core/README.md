# Polymedia SuiTS

Sui TypeScript utilities.

![Polymedia SuiTS](https://assets.polymedia.app/img/suits/open-graph.webp)

## Usage

Add SuiTS to your project:
```bash
pnpm add @polymedia/suits
```

Use it in your code, for example:
```typescript
import { validateAndNormalizeSuiAddress } from '@polymedia/suits';
```

## Exports

### Constants

- `const ADDRESS_REGEX` - Regular expression to match a normalized Sui address.

### Types

- `type NetworkName` - A Sui network name (mainnet/testnet/devnet/localnet).
- `type SuiExplorerItem` - A Polymedia Explorer item type (address/object/package/txblock).

### API functions

- `function apiRequestIndexer` - Make a request to the Indexer.xyz API (NFTs).

### Sui functions

- `function devInspectAndGetResults` - Call `SuiClient.devInspectTransactionBlock()` and return the results.
- `function devInspectAndGetReturnValues` - Call `SuiClient.devInspectTransactionBlock()` and return the deserialized return values.
- `function fetchAllDynamicFields` - Get all dynamic object fields owned by an object.
- `function generateRandomAddress` - Generate a random Sui address (for development only).
- `function getCoinOfValue` - Get a `Coin<T>` of a given value from the owner. Handles coin merging and splitting.
- `function getSuiObjectResponseFields` - Validate a SuiObjectResponse and return its content.
- `function makeExplorerUrl` - Build a Polymedia Explorer URL.
- `function removeLeadingZeros` - Remove leading zeros from a Sui address (lossless).
- `function requestSuiFromFaucet` - Get SUI from the faucet on localnet/devnet/testnet.
- `function shortenSuiAddress` - Abbreviate a Sui address for display purposes (lossy).
- `function validateAndNormalizeSuiAddress` - Validate a Sui address and return its normalized form, or `null` if invalid.

### Classes

- `class SuiEventFetcher` - A tool to fetch the latest Sui events and parse them into custom objects.
    - `function fetchEvents` - Fetch the latest events. Every time the function is called it looks
        for events that took place since the last call.

- `class SuiMultiClient` - A tool to make many RPC requests using multiple endpoints.
    - `function executeInBatches` - Execute `SuiClient` RPC operations in parallel using multiple endpoints.
    - `function testEndpoints` - Test the latency of various Sui RPC endpoints.

### Misc functions

- `function chunkArray` - Split an array into multiple chunks of a certain size.
- `function convertNumberToBigInt` - Convert a number to a bigint, scaled to the specified decimals.
- `function convertBigIntToNumber` - Convert a bigint to a number, scaled down to the specified decimals.
- `function formatBigInt` - Format a bigint into a readable string, scaled down to the specified decimals.
- `function formatNumber` - Format a number into a readable string.
- `function log` - Log a message including the current date and time.
- `function makeRanges` - Generate an array of ranges of a certain size between two numbers.
- `function sleep` - Wait for a number of milliseconds.
