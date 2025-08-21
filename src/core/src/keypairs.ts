import { decodeSuiPrivateKey, type Keypair } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Secp256k1Keypair } from "@mysten/sui/keypairs/secp256k1";
import { Secp256r1Keypair } from "@mysten/sui/keypairs/secp256r1";

/**
 * Build a `Keypair` from a secret key string like `suiprivkey1...`.
 */
export function pairFromSecretKey(secretKey: string): Keypair {
	const pair = decodeSuiPrivateKey(secretKey);

	if (pair.scheme === "ED25519") {
		return Ed25519Keypair.fromSecretKey(pair.secretKey);
	}
	if (pair.scheme === "Secp256k1") {
		return Secp256k1Keypair.fromSecretKey(pair.secretKey);
	}
	if (pair.scheme === "Secp256r1") {
		return Secp256r1Keypair.fromSecretKey(pair.secretKey);
	}

	throw new Error(`Unrecognized keypair schema: ${pair.scheme}`);
}
