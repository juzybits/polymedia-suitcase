import { execSync } from "child_process";
import { homedir } from "os";
import path from "path";

import { getFullnodeUrl, SuiClient, SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Signer } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { fromB64 } from "@mysten/sui/utils";
import { NetworkName, validateAndNormalizeSuiAddress } from "@polymedia/suitcase-core";
import { readJsonFile } from "./utils-file.js";

/**
 * Get the current active address (sui client active-address).
 */
export function getActiveAddress(): string {
    const sender = execSync("sui client active-address", { encoding: "utf8" }).trim();
    const address = validateAndNormalizeSuiAddress(sender);
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
            const raw = fromB64(priv);
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
