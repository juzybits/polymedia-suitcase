/* Sui utils */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { homedir } from 'os';
import path from 'path';

import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { fromB64, } from '@mysten/sui.js/utils';
import { NetworkName } from '../common/types.js';

/**
 * Build a `Ed25519Keypair` object for the current active address
 * by loading the secret key from ~/.sui/sui_config/sui.keystore
 */
export function getActiveAddressKeypair(): Ed25519Keypair {
    const sender = execSync('sui client active-address', { encoding: 'utf8' }).trim();

    const signer = (() => {
        const fileContent = readFileSync(
            path.join(homedir(), '.sui', 'sui_config', 'sui.keystore'),
            'utf8'
        );
        const keystore = JSON.parse(fileContent);

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
    const activeEnv = execSync('sui client active-env', { encoding: 'utf8' }).trim();
    return activeEnv as NetworkName;
}
