# Polymedia Suitcase

Sui utilities for TypeScript, Node, and React.

![Polymedia Suitcase](https://assets.polymedia.app/img/suitcase/open-graph.webp)

# Core

The `suitcase-core` package provides utilities for all TypeScript environments (browser, server, etc).

- Installation: `pnpm add @polymedia/suitcase-core`
- Source code: [src/core](./src/core)

### Addresses

- `const NORMALIZED_ADDRESS_REGEX` - Regular expression to match a normalized Sui address.
- `const ZERO_ADDRESS` - The 0x0 address.
- `generateRandomAddress()` - Generate a random Sui address (for development only).
- `removeAddressLeadingZeros()` - Remove leading zeros from a Sui address (lossless).
- `shortenAddress()` - Abbreviate a Sui address for display purposes (lossy).
- `validateAndNormalizeAddress()` - Validate a Sui address and return its normalized form, or `null` if invalid.

### APIs

- `apiRequestIndexer()` - Make a request to the Indexer.xyz API (NFTs).

### Balances

- `balanceToString()` - Convert a bigint to a string, scaled down to the specified decimals.
- `stringToBalance()` - Convert a string to a bigint, scaled up to the specified decimals.
- `formatBigInt()` - Format a bigint into a readable string, scaled down to the specified decimals.
- `formatNumber()` - Format a number into a readable string.

### Classes

- `class SuiClientBase` - Abstract class to sign and execute Sui transactions.
    - `fetchAndParseObjects()` - Fetch and parse objects from the RPC and cache them.
    - `fetchAndParseTxs()` - Fetch and parse transactions from the RPC.
    - `parseErrorCode()` - Extract the numeric error code from a tx response and map it to an error message.
    - `signTransaction()` - Sign a transaction.
    - `executeTransaction()` - Execute a transaction.
    - `signAndExecuteTransaction()` - Sign and execute a transaction.

- `class SuiEventFetcher` - Fetch Sui events and parse them into custom objects.
    - `fetchEvents()` - Fetch the latest events. Every time the function is called it looks
        for events that took place since the last call.

- `class SuiMultiClient` - Make many RPC requests using multiple endpoints.
    - `executeInBatches()` - Execute `SuiClient` RPC operations in parallel using multiple endpoints.
    - `testEndpoints()` - Test the latency of various Sui RPC endpoints.

### Client

- `devInspectAndGetExecutionResults()` - Call `SuiClient.devInspectTransactionBlock()` and return the execution results.
- `devInspectAndGetReturnValues()` - Call `SuiClient.devInspectTransactionBlock()` and return the deserialized return values.
- `fetchAllDynamicFields()` - Get all dynamic object fields owned by an object.
- `getCoinOfValue()` - Get a `Coin<T>` of a given value from the owner. Handles coin merging and splitting.
- `getSuiObjectRef()` - Fetch the latest version of an object and return its `SuiObjectRef`.

### Faucet

- `requestSuiFromFaucet()` - Get SUI from the faucet on localnet/devnet/testnet.

### Misc

- `chunkArray()` - Split an array into multiple chunks of a certain size.
- `chunkString()` - Split a string into multiple chunks of a certain size.
- `makeRanges()` - Generate an array of ranges of a certain size between two numbers.
- `sleep()` - Wait for a number of milliseconds.

### Keypairs

- `pairFromSecretKey()` - Build a `Keypair` from a secret key string like `suiprivkey1...`.

### Objects

- `isSuiObjectRef()` - Type guard to check if an object is a `SuiObjectRef`.
- `isOwnerAddress()` - Type guard to check if an `ObjectOwner` is `Address` (a single address).
- `isOwnerObject()` - Type guard to check if an `ObjectOwner` is `Object` (a single object).
- `isOwnerShared()` - Type guard to check if an `ObjectOwner` is `Shared` (can be used by any address).
- `isOwnerImmutable()` - Type guard to check if an `ObjectOwner` is `Immutable`.
- `isParsedDataObject()` - Type guard to check if a `SuiParsedData` is a `moveObject`.
- `isParsedDataPackage()` - Type guard to check if a `SuiParsedData` is a `package`.
- `objResToContent()` - Validate a `SuiObjectResponse` and return its `.data.content`.
- `objResToDisplay()` - Validate a `SuiObjectResponse` and return its `.data.display.data` or `null`.
    - `newEmptyDisplay()` - Create an `ObjectDisplay` object with all fields set to `null`.
- `objResToFields()` - Validate a `SuiObjectResponse` and return its `.data.content.fields`.
- `objResToId()` - Validate a `SuiObjectResponse` and return its `.data.objectId`.
- `objResToRef()` - Validate a `SuiObjectResponse` and return its `{.data.objectId, .data.digest, .data.version}`.
- `objResToType()` - Validate a `SuiObjectResponse` and return its `.data.type`.

### RPCs

- `const RPC_ENDPOINTS` - A list of public RPCs for Sui mainnet, testnet, and devnet.
- `measureRpcLatency()` - Measure Sui RPC latency by making requests to various endpoints.
- `newLowLatencySuiClient()` - Instantiate SuiClient using the RPC endpoint with the lowest latency.

### Transactions

- `getArgVal<T>()` - Get the value of a `SuiCallArg` (transaction input). If the argument is a pure value, return it. If the argument is an object, return its ID.
- `type ObjectArg` - An object argument for `Transaction.moveCall()`.
- `type SuiObjectChangePublished` - A `SuiObjectChange` with `type: 'published'`.
- `type SuiObjectChangeTransferred` - A `SuiObjectChange` with `type: 'transferred'`.
- `type SuiObjectChangeMutated` - A `SuiObjectChange` with `type: "mutated"`.
- `type SuiObjectChangeDeleted` - A `SuiObjectChange` with `type: "deleted"`.
- `type SuiObjectChangeWrapped` - A `SuiObjectChange` with `type: "wrapped"`.
- `type SuiObjectChangeCreated` - A `SuiObjectChange` with `type: "created"`.
- `isArgGasCoin()` - Type guard to check if a `SuiArgument` is a `GasCoin`.
- `isArgInput()` - Type guard to check if a `SuiArgument` is an `Input`.
- `isArgResult()` - Type guard to check if a `SuiArgument` is a `Result`.
- `isArgNestedResult()` - Type guard to check if a `SuiArgument` is a `NestedResult`.
- `isTxMakeMoveVec()` - Type guard to check if a `SuiTransaction` is a `MakeMoveVec` tx.
- `isTxMergeCoins()` - Type guard to check if a `SuiTransaction` is a `MergeCoins` tx.
- `isTxMoveCall()` - Type guard to check if a `SuiTransaction` is a `MoveCallSuiTransaction`.
- `isTxPublish()` - Type guard to check if a `SuiTransaction` is a `Publish` tx.
- `isTxSplitCoins()` - Type guard to check if a `SuiTransaction` is a `SplitCoins` tx.
- `isTxTransferObjects()` - Type guard to check if a `SuiTransaction` is a `TransferObjects` tx.
- `isTxUpgrade()` - Type guard to check if a `SuiTransaction` is an `Upgrade` tx.
- `objectArg()` - Build an object argument for `Transaction.moveCall()`.
- `txResToData()` - Validate a `SuiTransactionBlockResponse` of the `ProgrammableTransaction` kind and return its `.transaction.data`.
- `TransferModule` - Build transactions for the `sui::transfer` module.
    - `public_freeze_object()`
    - `public_share_object()`
    - `public_transfer()`

### Types

- `type NetworkName` - A Sui network name (mainnet/testnet/devnet/localnet).
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
- `LinkToExplorer` - A link to a Sui explorer (Polymedia, Suiscan, or SuiVision).
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
