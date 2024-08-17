import { requestSuiFromFaucetV1 } from "@mysten/sui/faucet";

/**
 * Get SUI from the faucet on localnet/devnet/testnet.
 */
export async function requestSuiFromFaucet(
    network: "localnet"|"devnet"|"testnet",
    recipient: string,
) {
    let host: string;
    if (network == "localnet") {
        host = "http://127.0.0.1:9123/gas";
    }
    else if (network == "devnet") {
        host = "https://faucet.devnet.sui.io/v1/gas";
    }
    else {
        host = "https://faucet.testnet.sui.io/v1/gas";
    }

    return requestSuiFromFaucetV1({ host, recipient });
}
