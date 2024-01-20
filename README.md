# Polymedia SuiTS

Sui TypeScript utilities.

![Polymedia SuiTS](https://assets.polymedia.app/img/suits/open-graph.webp)

## Installation

Add SuiTS to your project:

```bash
pnpm add @polymedia/suits
```

## Usage

Import from `@polymedia/suits` for utilities that can be used in any JavaScript environment:

```javascript
import { validateAndNormalizeSuiAddress } from '@polymedia/suits';
```

Import from `@polymedia/suits/node` for utilities specific to Node.js:

```javascript
import { getActiveAddressKeypair } from '@polymedia/suits/node';
```

## Constants

- `const ADDRESS_REGEX` - Regular expression to match a normalized Sui address.

## Types

- `type NetworkName` - A Sui network name.

## API functions

- `function apiRequestIndexer` - Make a request to the Indexer.xyz API (NFTs).

## Sui functions

- `function generateRandomAddress` - Generate a random Sui address.
- `function makeSuiExplorerUrl` - Build a Sui Explorer URL.
- `function shortenSuiAddress` - Shorten a Sui address.
- `function validateAndNormalizeSuiAddress` - Validate a Sui address and return its normalized form, or `null` if invalid.

### `@polymedia/suits/node`

- `function getActiveAddressKeypair` - Build a `Ed25519Keypair` object for the current active address by loading the secret key from `~/.sui/sui_config/sui.keystore`.
- `function getActiveEnv` - Get the active Sui environment from `sui client active-env`.

## Classes

- `class MultiSuiClient` - A tool to make many RPC requests using multiple endpoints.
    - `function executeInBatches` - Execute `SuiClient` RPC operations in parallel using multiple endpoints.
    - `function testEndpoints` - Test the latency of various Sui RPC endpoints.

## Misc

- `function chunkArray` - Split an array into multiple chunks of a certain size.
- `function formatNumber` - Format a number into a readable string.
- `function log` - Log a message including the current date and time.
- `function sleep` - Wait for a number of milliseconds.
