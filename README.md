# Polymedia Suitcase

Sui utilities for TypeScript, Node, and React.

![Polymedia Suitcase](https://assets.polymedia.app/img/suitcase/open-graph.webp)

# Core

The `suitcase-core` package provides utilities for all TypeScript environments (browser, server, etc).

- Installation: `pnpm add @polymedia/suitcase-core`
- Source code: [src/core](./src/core)

### Constants

- `const ADDRESS_REGEX` - Regular expression to match a normalized Sui address.
- `const RPC_ENDPOINTS` - A list of public RPCs for Sui mainnet, testnet, and devnet.

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
- `function makeRanges` - Generate an array of ranges of a certain size between two numbers.
- `function sleep` - Wait for a number of milliseconds.

# Node

The `suitcase-node` package provides utilities for Node.js projects (command line tools, server side code, etc).

- Installation: `pnpm add @polymedia/suitcase-node`
- Source code: [src/node](./src/node)

### Sui functions

- `function getActiveAddressKeypair` - Build a `Ed25519Keypair` object for the current active address by loading the secret key from `~/.sui/sui_config/sui.keystore`.
- `function getActiveEnv` - Get the active Sui environment from `sui client active-env`.
- `function setupSuiTransaction` - Initialize objects to execute Sui transactions blocks using the current Sui active network and address.
- `function executeSuiTransaction` - Execute a transaction block with `showEffects` and `showObjectChanges` set to `true`.

### File functions

- `fileExists` - Check if a file exists in the filesystem.
- `getFileName` - Extract the file name from a module URL, without path or extension.
- `readCsvFile` - Read a CSV file and parse each line into an object.
- `readJsonFile` - Read a JSON file and parse its contents into an object.
- `writeCsvFile` - Write objects into a CSV file.
- `writeJsonFile` - Write an object's JSON representation into a file.
- `writeTextFile` - Write a string into a file.

### Misc functions

- `parseArguments` - Parse command line arguments and show usage instructions.
- `promptUser` - Display a query to the user and wait for their input. Return true if the user enters `y`.

# React

The `suitcase-react` package provides components for React web apps.

- Installation: `pnpm add @polymedia/suitcase-react`
- Source code: [src/react](./src/react)

### Components

- `LinkExternal` - An external link.
- `LinkToExplorerAddr` - An external link to an address the Sui Explorer.
- `LinkToExplorerObj` - An external link to an object the Sui Explorer.
- `LinkToExplorerPkg` - An external link to a package the Sui Explorer.
- `LinkToExplorerTxn` - An external link to a transaction block the Sui Explorer.
- `Modal` - A modal window.
- `NetworkSelector` - A dropdown selector to choose between mainnet/testnet/devnet/localnet.
