# Polymedia Commando

Sui command line tools to help with Sui airdrops (send coins to many addresses), gather data from different sources (Sui RPCs, Indexer.xyz, Suiscan), and more.

![Polymedia Commando](https://assets.polymedia.app/img/commando/open-graph.webp)

## Installation

Clone and install the repo:

```
git clone https://github.com/juzybits/polymedia-commando.git
cd polymedia-commando
pnpm install
```

Create `.env` and add your Indexer.xyz credentials if you'll fetch NFT data:

```
cp .env.example .env
```

## Usage

Tools can be used as follows:

```
pnpm commando COMMAND [OPTIONS]
```

See all available tools with `pnpm commando -h`:

```
POLYMEDIA COMMANDO

Usage:
  pnpm commando COMMAND [OPTIONS]

Available Commands:
  - bulksender: Send Coin<T> to a list of addresses
  - find-coin-balances: Find how much Coin<T> is owned by each address
  - find-coin-holders: Find Coin<T> holders using the Suiscan API
  - find-last-txn: Find the last transaction for each Sui address
  - find-nft-holders: Find NFT holders for a set of collections via Indexer.xyz
  - find-nfts: Find all NFTs and their owners for a set of collections via Indexer.xyz
  - get-balance: Get the total Coin<T> balance owned by one or more addresses.
  - send-coin-amount: Send an amount of Coin<T> to a recipient
  - test-rpc-endpoints: Test the latency of various Sui RPC endpoints
  ...

For more information about a command:
  pnpm commando COMMAND -h
```

## Node.js utilities

The `@polymedia/commando` NPM package provides some utility functions for Node.js projects.

### Usage

Add the package to your project:
```bash
pnpm add @polymedia/commando
```

Use it in your code, for example:
```typescript
import { getActiveEnv } from '@polymedia/commando';
```

## Sui functions

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

## Misc functions

- `parseArguments` - Parse command line arguments and show usage instructions.
- `promptUser` - Display a query to the user and wait for their input. Return true if the user enters `y`.
