# Polymedia Suitcase

Sui utilities for TypeScript, Node, and React.

![Polymedia Suitcase](https://assets.polymedia.app/img/suitcase/open-graph.webp)

# Core

The `suitcase-core` package provides utilities for all TypeScript environments (browser, server, etc).

- Installation: `pnpm add @polymedia/suitcase-core`
- Source code: [src/core](./src/core)

## Addresses

- `const ZERO_ADDRESS` - The 0x0 address.
- `generateRandomAddress()` - Generate a random Sui address (for development only).
- `removeAddressLeadingZeros()` - Remove leading zeros from a Sui address (lossless).
- `shortenAddress()` - Abbreviate a Sui address for display purposes (lossy).
- `validateAndNormalizeAddress()` - Validate a Sui address and return its normalized form, or `null` if invalid.

## APIs

- `apiRequestIndexer()` - Make a request to the Indexer.xyz API (NFTs).

## Balances

- `balanceToString()` - Convert a bigint to a string, scaled down to the specified decimals.
- `stringToBalance()` - Convert a string to a bigint, scaled up to the specified decimals.
- `formatBalance()` - Format a bigint into a readable string, scaled down to the specified decimals.
- `formatNumber()` - Format a number into a readable string.

## Classes

- `class SuiClientBase` - Abstract class for building Sui SDK clients.
    - `fetchAndParseObjs()` - Fetch and parse objects from the RPC and cache them.
    - `fetchAndParseTxs()` - Fetch and parse transactions from the RPC.
    - `signTx()` - Sign a transaction.
    - `executeTx()` - Execute a transaction.
    - `signAndExecuteTx()` - Sign and execute a transaction.

- `class SuiEventFetcher` - Fetch Sui events and parse them into custom objects.
    - `fetchEvents()` - Fetch the latest events. Every time the function is called it looks
        for events that took place since the last call.

- `class SuiMultiClient` - Make many RPC requests using multiple endpoints.
    - `executeInBatches()` - Execute `SuiClient` RPC operations in parallel using multiple endpoints.
    - `testEndpoints()` - Test the latency of various Sui RPC endpoints.

## Client

- `devInspectAndGetExecutionResults()` - Call `SuiClient.devInspectTransactionBlock()` and return the execution results.
- `devInspectAndGetReturnValues()` - Call `SuiClient.devInspectTransactionBlock()` and return the deserialized return values.
- `fetchAllDynamicFields()` - Get all dynamic object fields owned by an object.
- `getCoinOfValue()` - Get a `Coin<T>` of a given value from the owner. Handles coin merging and splitting.
- `getSuiObjectRef()` - Fetch the latest version of an object and return its `SuiObjectRef`.

## Faucet

- `requestSuiFromFaucet()` - Get SUI from the faucet on localnet/devnet/testnet.

## Format

- `formatBps()` - Return a human-readable string from a number of basis points.
- `formatDate()` - Return a human-readable date string from a timestamp in milliseconds.
- `formatDuration()` - Return a human-readable string from a number of milliseconds.
- `formatTimeDiff()` - Return a human-readable string with the time difference between two timestamps.
- `urlToDomain()` - Return the domain from a URL.
- `shortenDigest()` - Return a shortened version of a transaction digest.

## Misc

- `const MAX_U64` - The maximum value for a 64-bit unsigned integer.
- `chunkArray()` - Split an array into multiple chunks of a certain size.
- `chunkString()` - Split a string into multiple chunks of a certain size.
- `makeRanges()` - Generate an array of ranges of a certain size between two numbers.
- `sleep()` - Wait for a number of milliseconds.

## Keypairs

- `pairFromSecretKey()` - Build a `Keypair` from a secret key string like `suiprivkey1...`.

## Objects

- `objResToContent()` - Validate a `SuiObjectResponse` and return its `.data.content`.
- `objResToDisplay()` - Validate a `SuiObjectResponse` and return its `.data.display.data` or `null`.
    - `newEmptyDisplay()` - Create an `ObjectDisplay` object with all fields set to `null`.
- `objResToFields()` - Validate a `SuiObjectResponse` and return its `.data.content.fields`.
- `objResToId()` - Validate a `SuiObjectResponse` and return its `.data.objectId`.
- `objResToOwner()` - Validate a `SuiObjectResponse` and return its owner: an address, object ID, "shared" or "immutable".
- `objResToRef()` - Validate a `SuiObjectResponse` and return its `{.data.objectId, .data.digest, .data.version}`.
- `objResToType()` - Validate a `SuiObjectResponse` and return its `.data.type`.

## Regular expressions

- `const REGEX_ADDRESS` - Match a Sui address.
- `const REGEX_ADDRESS_NORMALIZED` - Match a normalized Sui address.
- `const REGEX_MODULE_NAME` - Match a Sui module name.
- `const REGEX_STRUCT_NAME` - Match a Sui struct name.
- `const REGEX_TYPE_BASIC` - Match a Sui type without generic parameters (e.g. `0x123::module::Struct`).
## RPCs

- `const RPC_ENDPOINTS` - A list of public RPCs for Sui mainnet, testnet, and devnet.
- `measureRpcLatency()` - Measure Sui RPC latency by making requests to various endpoints.
- `newLowLatencySuiClient()` - Instantiate SuiClient using the RPC endpoint with the lowest latency.

## Transactions

- `type NestedResult` - An item in the array returned by a `Transaction.moveCall()` call.
- `type ObjectInput` - Either a `TransactionObjectInput` or a `SuiObjectRef`.
- `objectArg()` - Transform an `ObjectInput` into an argument for `Transaction.moveCall()`.
- `getArgVal<T>()` - Get the value of a `SuiCallArg` (transaction input). If the argument is a pure value, return it. If the argument is an object, return its ID.
- `parseTxError()` - Parse a Move abort string (from `tx.effects.status.error`) into its different parts.
- `txResToData()` - Validate a `SuiTransactionBlockResponse` of the `ProgrammableTransaction` kind and return its `.transaction.data`.
- `TransferModule` - Build transactions for the `sui::transfer` module.
    - `public_freeze_object()`
    - `public_share_object()`
    - `public_transfer()`

## Type guards

###  ObjectOwner
- `type OwnerKind<K>` - An `ObjectOwner` of a specific kind.
- `isOwnerKind()` - Type guard to check if an `ObjectOwner` is of a specific kind.

###  SuiArgument
- `type ArgKind<K>` - A `SuiArgument` of a specific kind.
- `isArgKind()` - Type guard to check if a `SuiArgument` is of a specific kind.

###  SuiObjectChange
- `type ObjChangeKind<K>` - A `SuiObjectChange` of a specific kind.
- `isObjChangeKind()` - Type guard to check if a `SuiObjectChange` is of a specific kind.

###  SuiObjectRef
- `isSuiObjectRef()` - Type guard to check if an object is a `SuiObjectRef`.

###  SuiParsedData
- `type ParsedDataKind<K>` - A `SuiParsedData` of a specific kind.
- `isParsedDataKind()` - Type guard to check if a `SuiParsedData` is of a specific kind.

###  SuiTransaction
- `type TxKind<K>` - A `SuiTransaction` of a specific kind.
- `isTxKind()` - Type guard to check if a `SuiTransaction` is of a specific kind.

## Types

- `const NETWORK_NAMES` - `["mainnet", "testnet", "devnet", "localnet"]`.
- `type NetworkName` - `"mainnet" | "testnet" | "devnet" | "localnet"`.
- `type ObjectDisplay` - A Sui object display with common properties and arbitrary ones.
- `type PaginatedResponse<T>` - A paginated response from a Sui RPC call.
- `type ReceivingRef` - The return type of `Transaction.receivingRef()`.
- `type SignTransaction` - A function that can sign a `Transaction`.

## URLs

- `type SuiExplorerItem` - A Sui explorer item type (address/object/package/txblock).
- `makePolymediaUrl()` - Build an explorer.polymedia.app URL.
- `makeSuiscanUrl()` - Build a suiscan.xyz URL.
- `makeSuivisionUrl()` - Build a suivision.xyz URL.

# Node

The `suitcase-node` package provides utilities for Node.js projects (command line tools, server side code, etc).

- Installation: `pnpm add @polymedia/suitcase-node`
- Source code: [src/node](./src/node)

## Sui

- `getActiveAddress()` - Get the current active address (sui client active-address).
- `getActiveKeypair()` - Build a `Ed25519Keypair` object for the current active address by loading the secret key from `~/.sui/sui_config/sui.keystore`.
- `getActiveEnv()` - Get the active Sui environment from `sui client active-env`.
- `setupSuiTransaction()` - Initialize objects to execute Sui transactions blocks using the current Sui active network and address.
- `executeSuiTransaction()` - Execute a transaction block with `showEffects` and `showObjectChanges` set to `true`.

## Files

- `fileExists()` - Check if a file exists in the filesystem.
- `getFileName()` - Extract the file name from a module URL, without path or extension.
- `writeJsonFile()` - Write an object's JSON representation into a file.
- `readJsonFile()` - Read a JSON file and parse its contents into an object.
- `writeTsvFile()` - Write objects into a TSV file.
- `readTsvFile()` - Read a TSV file and parse each line into an object.
- `writeCsvFile()` - Write objects into a CSV file.
- `readCsvFile()` - Read a CSV file and parse each line into an object.
- `writeTextFile()` - Write a string into a file.

## CLI

- `parseArguments()` - Parse command line arguments and show usage instructions.
- `promptUser()` - Display a query to the user and wait for their input. Return true if the user enters `y`.

# React

The `suitcase-react` package provides components for React web apps.

- Installation: `pnpm add @polymedia/suitcase-react`
- Source code: [src/react](./src/react)

## Explorers

- `const EXPLORER_NAMES` - `["Polymedia", "Suiscan", "SuiVision"]`.
- `type ExplorerName` - `"Polymedia" | "Suiscan" | "SuiVision"`.
- `ExplorerRadioSelector` - A radio button menu to select a Sui explorer and save the choice to local storage.
- `loadExplorer()` - Load the chosen Sui explorer name from local storage.
- `switchExplorer()` - Change the chosen Sui explorer, update local storage, and optionally trigger a callback.

## Hooks

- `useClickOutside()` - A hook that detects when a click or touch event occurs outside a DOM element.
- `useFetch()` - A hook to handle data fetching.
- `useFetchAndLoadMore()` - A hook to handle data fetching and load more results.
- `useFetchAndPaginate()` - A hook to handle data fetching and paginating through the results.

## Inputs

- `useInputBase()` - A base hook for creating input fields.
- `useInputString()` - An input field for strings.
- `useInputAddress()` - An input field for Sui addresses (or object IDs).
- `useInputUnsignedInt()` - An input field for positive integers.
- `useInputUnsignedBalance()` - Input field for positive Coin balances. Handles decimals (e.g. `"1 SUI"` → `1_000_000_000`).

## Links

- `LinkExternal` - An external link.
- `LinkToExplorer` - A link to a Sui explorer (Polymedia, Suiscan, or SuiVision).
- `LinkToPolymedia` - A link to explorer.polymedia.app.
- `LinkToSuiscan` - A link to suiscan.xyz.
- `LinkToSuivision` - A link to suivision.xyz.

## Misc

- `makeCssUrl()` - Encode a URL for use in CSS `url()` syntax.

## Modals

- `Modal` - A modal window.

## Networks

- `NetworkRadioSelector` - A radio button menu to select a Sui network and save the choice to local storage.
- `NetworkDropdownSelector` - A dropdown menu to choose between mainnet/testnet/devnet/localnet.
- `isLocalhost()` - Check if the current hostname is a localhost environment.
- `loadNetwork()` - Load the network name based on URL parameters and local storage.
- `switchNetwork()` - Change networks, update local storage, and optionally trigger a callback.

## RPCs

- `RpcRadioSelector` - A radio button menu to select an RPC endpoint and save the choice to local storage.
- `loadRpc()` - Load the RPC URL for the current network from local storage.
- `switchRpc()` - Change RPCs, update local storage, and optionally trigger a callback.

## Selectors

- `RadioSelector` - A generic radio button menu.

## Types

- `type ReactSetter` - A function that updates the state of a `useState` or `useReducer` hook.
