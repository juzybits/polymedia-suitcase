/**
 * A Sui explorer item type, as in:
 * https://explorer.polymedia.app/address/0x...
 * https://explorer.polymedia.app/object/0x...
 * etc
 */
export type SuiExplorerItem = "address" | "object" | "package" | "tx" | "coin";

export type ExplorerUrlMaker = (
    network: string,
    kind: SuiExplorerItem,
    addr: string,
) => string;

/**
 * Build an explorer.polymedia.app URL.
 */
export const makePolymediaUrl: ExplorerUrlMaker = (
    network: string,
    kind: SuiExplorerItem,
    address: string,
): string =>
{
    const baseUrl = isLocalnet(network)
        ? "http://localhost:3000"
        : "https://explorer.polymedia.app";

    let path: string;
    if (kind === "tx") {
        path = "txblock";
    } else if (kind === "package") {
        path = "object";
    } else if (kind === "coin") {
        path = "object";
        address = address.split("::")[0];
    } else {
        path = kind;
    }

    let url = `${baseUrl}/${path}/${address}`;
    if (network !== "mainnet") {
        const networkLabel = network === "localnet" ? "local" : network;
        url += `?network=${networkLabel}`;
    }
    return url;
};

/**
 * Build a suiscan.xyz URL.
 */
export const makeSuiscanUrl: ExplorerUrlMaker = (
    network: string,
    kind: SuiExplorerItem,
    address: string,
): string =>
{
    if (isLocalnet(network)) {
        return makePolymediaUrl(network, kind, address);
    }
    const baseUrl = `https://suiscan.xyz/${network}`;

    let path: string;
    if (kind === "address") {
        path = "account";
    } else if (kind === "package") {
        path = "object";
    } else {
        path = kind;
    }

    const url = `${baseUrl}/${path}/${address}`;
    return url;
};

/**
 * Build a suivision.xyz URL.
 */
export const makeSuivisionUrl: ExplorerUrlMaker = (
    network: string,
    kind: SuiExplorerItem,
    address: string,
): string =>
{
    if (isLocalnet(network)) {
        return makePolymediaUrl(network, kind, address);
    }
    const baseUrl = network === "mainnet"
        ? "https://suivision.xyz"
        : `https://${network}.suivision.xyz`;

    let path: string;
    if (kind === "tx") {
        path = "txblock";
    } else if (kind === "address") {
        path = "account";
    } else {
        path = kind;
    }

    const url = `${baseUrl}/${path}/${address}`;
    return url;
};

function isLocalnet(network: string): boolean {
    return network === "localnet" || network == "http://127.0.0.1:9000";
}
