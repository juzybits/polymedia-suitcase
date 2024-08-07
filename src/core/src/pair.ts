import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

/**
 * Build a `Ed25519Keypair` from a secret key string like `suiprivkey1...`.
 */
export function pairFromSecretKey(secretKey: string): Ed25519Keypair {
    const parsedPair = decodeSuiPrivateKey(secretKey);
    return Ed25519Keypair.fromSecretKey(parsedPair.secretKey);
}
