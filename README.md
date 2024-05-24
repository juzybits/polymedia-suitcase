# Polymedia Suitcase

Sui utilities for TypeScript, Node, and React.

![Polymedia Suitcase](https://assets.polymedia.app/img/suitcase/open-graph.webp)

# Core

The `suitcase-core` package provides utilities for all TypeScript environments (browser, server, etc).

- Installation: `pnpm add @polymedia/suitcase-core`
- Source code: [src/core](./src/core)

### Classes

- `SuiEventFetcher` - Fetch Sui events and parse them into custom objects.
    - `fetchEvents` - Fetch the latest events. Every time the function is called it looks
        for events that took place since the last call.

- `SuiMultiClient` - Make many RPC requests using multiple endpoints.
    - `executeInBatches` - Execute `SuiClient` RPC operations in parallel using multiple endpoints.
    - `testEndpoints` - Test the latency of various Sui RPC endpoints.

### Sui functions

- `devInspectAndGetResults` - Call `SuiClient.devInspectTransactionBlock()` and return the results.
- `devInspectAndGetReturnValues` - Call `SuiClient.devInspectTransactionBlock()` and return the deserialized return values.
- `fetchAllDynamicFields` - Get all dynamic object fields owned by an object.
- `generateRandomAddress` - Generate a random Sui address (for development only).
- `getCoinOfValue` - Get a `Coin<T>` of a given value from the owner. Handles coin merging and splitting.
- `getSuiObjectResponseFields` - Validate a SuiObjectResponse and return its content.
- `makeExplorerUrl` - Build a Polymedia Explorer URL.
- `removeLeadingZeros` - Remove leading zeros from a Sui address (lossless).
- `requestSuiFromFaucet` - Get SUI from the faucet on localnet/devnet/testnet.
- `shortenSuiAddress` - Abbreviate a Sui address for display purposes (lossy).
- `validateAndNormalizeSuiAddress` - Validate a Sui address and return its normalized form, or `null` if invalid.

### API functions

- `apiRequestIndexer` - Make a request to the Indexer.xyz API (NFTs).

### Misc functions

- `chunkArray` - Split an array into multiple chunks of a certain size.
- `convertNumberToBigInt` - Convert a number to a bigint, scaled to the specified decimals.
- `convertBigIntToNumber` - Convert a bigint to a number, scaled down to the specified decimals.
- `formatBigInt` - Format a bigint into a readable string, scaled down to the specified decimals.
- `formatNumber` - Format a number into a readable string.
- `makeRanges` - Generate an array of ranges of a certain size between two numbers.
- `sleep` - Wait for a number of milliseconds.

### Constants

- `ADDRESS_REGEX` - Regular expression to match a normalized Sui address.
- `RPC_ENDPOINTS` - A list of public RPCs for Sui mainnet, testnet, and devnet.

### Types

- `NetworkName` - A Sui network name (mainnet/testnet/devnet/localnet).
- `SuiExplorerItem` - A Polymedia Explorer item type (address/object/package/txblock).

# Node

The `suitcase-node` package provides utilities for Node.js projects (command line tools, server side code, etc).

- Installation: `pnpm add @polymedia/suitcase-node`
- Source code: [src/node](./src/node)

### Sui functions

- `getActiveAddress` - Get the current active address (sui client active-address).
- `getActiveKeypair` - Build a `Ed25519Keypair` object for the current active address by loading the secret key from `~/.sui/sui_config/sui.keystore`.
- `getActiveEnv` - Get the active Sui environment from `sui client active-env`.
- `setupSuiTransaction` - Initialize objects to execute Sui transactions blocks using the current Sui active network and address.
- `executeSuiTransaction` - Execute a transaction block with `showEffects` and `showObjectChanges` set to `true`.

### File functions

- `fileExists` - Check if a file exists in the filesystem.
- `getFileName` - Extract the file name from a module URL, without path or extension.
- `writeJsonFile` - Write an object's JSON representation into a file.
- `readJsonFile` - Read a JSON file and parse its contents into an object.
- `writeTsvFile` - Write objects into a TSV file.
- `readTsvFile` - Read a TSV file and parse each line into an object.
- `writeCsvFile` - Write objects into a CSV file.
- `readCsvFile` - Read a CSV file and parse each line into an object.

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
- `NetworkSelector` - A dropdown menu to choose between mainnet/testnet/devnet/localnet.
