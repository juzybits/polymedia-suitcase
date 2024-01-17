# Polymedia SuiTS

Sui TypeScript utilities.

![Polymedia SuiTS](https://assets.polymedia.app/img/suits/open-graph.webp)

## How to use

Add SuiTS to your project:

```
pnpm add @polymedia/suits
```

Use it in your code, for example:

```
import { validateAndNormalizeSuiAddress } from '@polymedia/suits';
```

## Constants

- `const ADDRESS_REGEX` - Match a normalized Sui address.

## Types

- `type NetworkName` - A Sui network name.

## API functions

- `function apiRequestIndexer` - Make a request to the Indexer.xyz API (NFTs).

## Sui functions

- `function generateRandomAddress` - Generate a random Sui address.
- `function getActiveAddressKeypair` - Build a `Ed25519Keypair` object for the current active address by loading the secret key from `~/.sui/sui_config/sui.keystore`.
- `function getActiveEnv` - Get the active Sui environment from `sui client active-env`.
- `function makeSuiExplorerUrl` - Build a Sui Explorer URL.
- `function shortenSuiAddress` - Shorten a Sui address.
- `function validateAndNormalizeSuiAddress` - Validate a Sui address and return its normalized form, or `null` if invalid.

## Classes

- `class MultiSuiClient` - A tool to make many RPC requests using multiple endpoints.
    - `function MultiSuiClient.executeInBatches` - Execute `SuiClient` RPC operations in parallel using multiple endpoints.
    - `function MultiSuiClient.testEndpoints` - Test the latency of various Sui RPC endpoints.

## Misc

- `function chunkArray` - Split an array into multiple chunks of a certain size.
- `function formatNumber` - Format a number into a readable string.
- `function sleep` - Wait for a number of milliseconds.
