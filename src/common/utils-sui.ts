/* Sui utils */

import { execSync } from 'child_process';
import crypto from 'crypto';
import { readFileSync } from 'fs';
import { homedir } from 'os';
import path from 'path';

import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { fromB64, isValidSuiAddress, normalizeSuiAddress } from '@mysten/sui.js/utils';
import { NetworkName, SuiExplorerItem } from './types.js';

/**
 * Generate a random Sui address
 */
export function generateRandomAddress(): string {
    const randomBytes = crypto.randomBytes(32);
    const address = '0x' + randomBytes.toString('hex');
    return address;
}

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

/**
 * Build a Sui Explorer URL, like 'https://suiexplorer.com/address/0x123...456?network=testnet'
 */
export function makeSuiExplorerUrl(network: NetworkName, kind: SuiExplorerItem, address: string): string {
    const baseUrl = network === 'localnet'
    ? 'http://localhost:3000'
    : 'https://suiexplorer.com';
    const networkLabel = network === 'localnet' ? 'local' : network;
    return `${baseUrl}/${kind}/${address}?network=${networkLabel}`;
}

/**
 * Shorten a Sui address. Default format is '1234..5678' (given an address
 * like '0x1234000000000000000000000000000000000000000000000000000000005678')
 */
export function shortenSuiAddress(address: string|null|undefined, start=4, end=4, prefix='', separator='..'): string {
    return !address ? '' : prefix + address.slice(2, 2+start) + separator + address.slice(-end);
}

/**
 * Validate a Sui address and return its normalized form, or `null` if invalid.
 */
export function validateAndNormalizeSuiAddress(address: string): string | null {
    const normalizedAddr = normalizeSuiAddress(address);
    if (!isValidSuiAddress(normalizedAddr)) {
        return null;
    }
    return normalizedAddr;
}
