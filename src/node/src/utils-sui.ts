import { execSync } from "child_process";
import { homedir } from "os";
import path from "path";

import { getFullnodeUrl, SuiClient, SuiTransactionBlockResponse } from "@mysten/sui.js/client";
import { Signer } from "@mysten/sui.js/cryptography";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { fromB64 } from "@mysten/sui.js/utils";
import { NetworkName } from "@polymedia/suitcase-core";
import { readJsonFile } from "./utils-file.js";

/**
 * Build a `Ed25519Keypair` object for the current active address
 * by loading the secret key from ~/.sui/sui_config/sui.keystore
 */
export function getActiveAddressKeypair(): Ed25519Keypair {
    const sender = execSync("sui client active-address", { encoding: "utf8" }).trim();

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
    const txb = new TransactionBlock();
    const signer = getActiveAddressKeypair();
    return { network, suiClient, txb, signer };
}

/**
 * Execute a transaction block with `showEffects` and `showObjectChanges` set to `true`.
 */
export async function executeSuiTransaction(
    suiClient: SuiClient,
    txb: TransactionBlock,
    signer: Signer,

): Promise<SuiTransactionBlockResponse> {
    return await suiClient.signAndExecuteTransactionBlock({
        signer,
        transactionBlock: txb,
        options: {
            showEffects: true,
            showObjectChanges: true,
        }
    });
}
