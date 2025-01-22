import { execSync } from "child_process";
import { homedir } from "os";
import path from "path";

import { getFullnodeUrl, SuiClient, SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Signer } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { fromBase64 } from "@mysten/sui/utils";
import { NetworkName, validateAndNormalizeAddress } from "@polymedia/suitcase-core";

import { readJsonFile } from "./file.js";

/**
 * Get the current active address (sui client active-address).
 */
export function getActiveAddress(): string {
    const sender = execSync("sui client active-address", { encoding: "utf8" }).trim();
    const address = validateAndNormalizeAddress(sender);
    if (!address) {
        throw new Error("No active address was found");
    }
    return address;
}

/**
 * Build a `Ed25519Keypair` object for the current active address
 * by loading the secret key from ~/.sui/sui_config/sui.keystore
 */
export function getActiveKeypair(): Ed25519Keypair {
    const sender = getActiveAddress();

    const signer = (() => {
        const keystorePath = path.join(homedir(), ".sui", "sui_config", "sui.keystore");
        const keystore = readJsonFile<string[]>(keystorePath);

        for (const priv of keystore) {
            const raw = fromBase64(priv);
            if (raw[0] !== 0) {
                continue;
            }

            const pair = Ed25519Keypair.fromSecretKey(raw.slice(1));
            if (pair.getPublicKey().toSuiAddress() === sender) {
                return pair;
            }
        }

        throw new Error(`keypair not found for sender: ${sender}`);
    })();

    return signer;
}

/**
 * Get the active Sui environment from `sui client active-env`.
 */
export function getActiveEnv(): NetworkName {
    const activeEnv = execSync("sui client active-env", { encoding: "utf8" }).trim();
    return activeEnv as NetworkName;
}

/**
 * Initialize objects to execute Sui transactions blocks
 * using the current Sui active network and address.
 */
export function setupSuiTransaction() {
    const network = getActiveEnv();
    const suiClient = new SuiClient({ url: getFullnodeUrl(network) });
    const tx = new Transaction();
    const signer = getActiveKeypair();
    return { network, suiClient, tx, signer };
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
    // Wrap the original stderr.write in our custom function
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
export async function executeSuiTransaction(
    suiClient: SuiClient,
    tx: Transaction,
    signer: Signer,
): Promise<SuiTransactionBlockResponse> {
    return await suiClient.signAndExecuteTransaction({
        signer,
        transaction: tx,
        options: {
            showEffects: true,
            showObjectChanges: true,
        }
    });
}
