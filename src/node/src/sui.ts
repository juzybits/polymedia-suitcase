import { exec } from "child_process";
import fs from "fs";
import { homedir } from "os";
import path from "path";
import { promisify } from "util";

import { getFullnodeUrl, SuiClient, SuiTransactionBlockResponse, SuiTransactionBlockResponseOptions } from "@mysten/sui/client";
import { Signer } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { fromBase64 } from "@mysten/sui/utils";

import { NetworkName, validateAndNormalizeAddress, WaitForTxOptions } from "@polymedia/suitcase-core";

const execAsync = promisify(exec);

/**
 * Get the current active address (sui client active-address).
 */
export async function getActiveAddress(): Promise<string> {
    const { stdout } = await execAsync("sui client active-address");
    const address = validateAndNormalizeAddress(stdout.trim());
    if (!address) throw new Error("No active address was found");
    return address;
}

/**
 * Build a `Ed25519Keypair` object for the current active address
 * by loading the secret key from ~/.sui/sui_config/sui.keystore
 */
export async function getActiveKeypair(): Promise<Ed25519Keypair> {
    const sender = await getActiveAddress();
    const keystorePath = path.join(homedir(), ".sui", "sui_config", "sui.keystore");
    const keystore = await fs.promises.readFile(keystorePath, "utf8");
    const keys = JSON.parse(keystore) as string[];

    for (const priv of keys) {
        const raw = fromBase64(priv);
        if (raw[0] !== 0) continue;
        const pair = Ed25519Keypair.fromSecretKey(raw.slice(1));
        if (pair.getPublicKey().toSuiAddress() === sender) {
            return pair;
        }
    }
    throw new Error(`keypair not found for sender: ${sender}`);
}

/**
 * Get the active Sui environment from `sui client active-env`.
 */
export async function getActiveEnv(): Promise<NetworkName> {
    const { stdout } = await execAsync("sui client active-env");
    return stdout.trim() as NetworkName;
}

/**
 * Initialize objects to execute Sui transactions blocks
 * using the current Sui active network and address.
 */
export async function setupSuiTransaction() {
    const [network, signer] = await Promise.all([
        getActiveEnv(),
        getActiveKeypair(),
    ]);
    const client = new SuiClient({ url: getFullnodeUrl(network) });
    const tx = new Transaction();
    return { network, client, tx, signer };
}

/**
 * Suppress "Client/Server api version mismatch" warnings.
 */
export function suppressSuiVersionMismatchWarnings() {
    // Skip if already wrapped
    if ((process.stderr.write as any).__isSuppressingVersionMismatch) // eslint-disable-line
        return;
    // Store the original stderr.write function, properly bound to stderr
    const originalStderr = process.stderr.write.bind(process.stderr);
    // Override stderr.write with our custom function
    process.stderr.write = function(
        str: string | Uint8Array,
        encoding?: BufferEncoding | ((err?: Error) => void),
        cb?: (err?: Error) => void
    ): boolean {
        // If it's a version mismatch warning, return true (indicating success) without writing
        if (str.toString().includes("Client/Server api version mismatch")) {
            return true;
        }
        // For all other messages, pass through to the original stderr.write
        return originalStderr(str, encoding as any, cb); // eslint-disable-line
    };
    // Mark as wrapped in case this function is called multiple times
    (process.stderr.write as any).__isSuppressingVersionMismatch = true; // eslint-disable-line
}

/**
 * Execute a transaction block with `showEffects` and `showObjectChanges` set to `true`.
 */
export async function signAndExecuteTx({
    client,
    tx,
    signer,
    txRespOptions = { showEffects: true, showObjectChanges: true },
    waitForTxOptions = { timeout: 60_000, pollInterval: 300 },
}: {
    client: SuiClient;
    tx: Transaction;
    signer: Signer;
    txRespOptions?: SuiTransactionBlockResponseOptions;
    waitForTxOptions?: WaitForTxOptions | false;
}): Promise<SuiTransactionBlockResponse>
{
    const resp = await client.signAndExecuteTransaction({
        signer,
        transaction: tx,
        options: txRespOptions,
    });

    if (!waitForTxOptions) {
        return resp;
    }

    return await client.waitForTransaction({
        digest: resp.digest,
        options: txRespOptions,
        timeout: waitForTxOptions.timeout,
        pollInterval: waitForTxOptions.pollInterval,
    });
}
