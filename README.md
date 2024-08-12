# Polymedia Suitcase

Sui utilities for TypeScript, Node, and React.

![Polymedia Suitcase](https://assets.polymedia.app/img/suitcase/open-graph.webp)

# Core

The `suitcase-core` package provides utilities for all TypeScript environments (browser, server, etc).

- Installation: `pnpm add @polymedia/suitcase-core`
- Source code: [src/core](./src/core)

### Addresses

- `const NORMALIZED_ADDRESS_REGEX` - Regular expression to match a normalized Sui address.
- `generateRandomAddress()` - Generate a random Sui address (for development only).
- `removeAddressLeadingZeros()` - Remove leading zeros from a Sui address (lossless).
- `shortenAddress()` - Abbreviate a Sui address for display purposes (lossy).
- `validateAndNormalizeSuiAddress()` - Validate a Sui address and return its normalized form, or `null` if invalid.

### APIs

- `apiRequestIndexer()` - Make a request to the Indexer.xyz API (NFTs).

### Balances

- `balanceToString()` - Convert a bigint to a string, scaled down to the specified decimals.
- `stringToBalance()` - Convert a string to a bigint, scaled up to the specified decimals.
- `formatBigInt()` - Format a bigint into a readable string, scaled down to the specified decimals.
- `formatNumber()` - Format a number into a readable string.

### Classes

- `class SuiEventFetcher` - Fetch Sui events and parse them into custom objects.
    - `fetchEvents()` - Fetch the latest events. Every time the function is called it looks
        for events that took place since the last call.

- `class SuiMultiClient` - Make many RPC requests using multiple endpoints.
    - `executeInBatches()` - Execute `SuiClient` RPC operations in parallel using multiple endpoints.
    - `testEndpoints()` - Test the latency of various Sui RPC endpoints.

### Client

- `devInspectAndGetResults()` - Call `SuiClient.devInspectTransactionBlock()` and return the results.
- `fetchAllDynamicFields()` - Get all dynamic object fields owned by an object.
- `getCoinOfValue()` - Get a `Coin<T>` of a given value from the owner. Handles coin merging and splitting.
- `getSuiObjectRef()` - Fetch the latest version of an object and return its `SuiObjectRef`.
- `isSuiObjectRef()` - Check if a given object conforms to the `SuiObjectRef` interface.
- `objectArg()` - Build an object argument for `Transaction.moveCall()`.
- `objResToFields()` - Validate a `SuiObjectResponse` and return its `.data.content.fields`.
- `objResToDisplay()` - Validate a `SuiObjectResponse` and return its `.data.display.data` or `null`.
- `objResToId()` - Validate a `SuiObjectResponse` and return its `.data.objectId`.
- `objResToRef()` - Validate a `SuiObjectResponse` and return its `{.data.objectId, .data.digest, .data.version}`.
- `objResToType()` - Validate a `SuiObjectResponse` and return its `.data.type`.

### Faucet

- `requestSuiFromFaucet()` - Get SUI from the faucet on localnet/devnet/testnet.

### Misc

- `chunkArray()` - Split an array into multiple chunks of a certain size.
- `chunkString()` - Split a string into multiple chunks of a certain size.
- `makeRanges()` - Generate an array of ranges of a certain size between two numbers.
- `sleep()` - Wait for a number of milliseconds.

### Keypairs

- `pairFromSecretKey` - Build a `Ed25519Keypair` from a secret key string like `suiprivkey1...`.

### RPCs

- `const RPC_ENDPOINTS` - A list of public RPCs for Sui mainnet, testnet, and devnet.
- `measureRpcLatency()` - Measure Sui RPC latency by making requests to various endpoints.
- `newLowLatencySuiClient()` - Instantiate SuiClient using the RPC endpoint with the lowest latency.

### Types

- `type NetworkName` - A Sui network name (mainnet/testnet/devnet/localnet).
- `type ObjectArg` - An object argument for `Transaction.moveCall()`.
- `type ObjectDisplay` - A Sui object display with common properties and arbitrary ones.
- `type ReceivingRef` - The return type of `Transaction.receivingRef()`.
- `type SignTransaction` - A function that can sign a `Transaction`.

### URLs

- `type SuiExplorerItem` - A Sui explorer item type (address/object/package/txblock).
- `makePolymediaUrl()` - Build an explorer.polymedia.app URL.
- `makeSuiscanUrl()` - Build a suiscan.xyz URL.
- `makeSuivisionUrl()` - Build a suivision.xyz URL.

# Node

The `suitcase-node` package provides utilities for Node.js projects (command line tools, server side code, etc).

- Installation: `pnpm add @polymedia/suitcase-node`
- Source code: [src/node](./src/node)

### Sui

- `getActiveAddress()` - Get the current active address (sui client active-address).
- `getActiveKeypair()` - Build a `Ed25519Keypair` object for the current active address by loading the secret key from `~/.sui/sui_config/sui.keystore`.
- `getActiveEnv()` - Get the active Sui environment from `sui client active-env`.
- `setupSuiTransaction()` - Initialize objects to execute Sui transactions blocks using the current Sui active network and address.
- `executeSuiTransaction()` - Execute a transaction block with `showEffects` and `showObjectChanges` set to `true`.

### Files

- `fileExists()` - Check if a file exists in the filesystem.
- `getFileName()` - Extract the file name from a module URL, without path or extension.
- `writeJsonFile()` - Write an object's JSON representation into a file.
- `readJsonFile()` - Read a JSON file and parse its contents into an object.
- `writeTsvFile()` - Write objects into a TSV file.
- `readTsvFile()` - Read a TSV file and parse each line into an object.
- `writeCsvFile()` - Write objects into a CSV file.
- `readCsvFile()` - Read a CSV file and parse each line into an object.

### CLI

- `parseArguments()` - Parse command line arguments and show usage instructions.
- `promptUser()` - Display a query to the user and wait for their input. Return true if the user enters `y`.

# React

The `suitcase-react` package provides components for React web apps.

- Installation: `pnpm add @polymedia/suitcase-react`
- Source code: [src/react](./src/react)

### Components

- `LinkExternal` - An external link.
- `LinkToPolymedia` - A link to explorer.polymedia.app.
- `LinkToSuiscan` - A link to suiscan.xyz.
- `LinkToSuivision` - A link to suivision.xyz.
- `Modal` - A modal window.
- `NetworkSelector` - A dropdown menu to choose between mainnet/testnet/devnet/localnet.

### Functions

- `isLocalhost()` - Check if the current hostname is a localhost environment.
- `loadNetwork()` - Load the network name based on URL parameters and local storage.
- `switchNetwork()` - Change networks, updating the local storage and optionally triggering a callback.
- `makeCssUrl()` - Encode a URL for use in CSS `url()` syntax.

### Hooks

- `useClickOutside()` - A React hook that detects when a click or touch event occurs outside a DOM element.

### Types

- `type ReactSetter` - A function that updates the state of a `useState` or `useReducer` hook.
