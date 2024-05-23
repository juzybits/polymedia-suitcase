export type BaseNetworkName = string;

export function isLocalhost(): boolean {
    const hostname = window.location.hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
}

export function loadNetwork<NetworkName extends BaseNetworkName>(
    supportedNetworks: readonly NetworkName[],
    defaultNetwork: NetworkName,
): NetworkName {
    if (!isNetworkName(defaultNetwork, supportedNetworks)) {
        throw new Error(`Network not supported: ${defaultNetwork}`);
    }

    // Use 'network' URL parameter, if valid
    const params = new URLSearchParams(window.location.search);
    const networkFromUrl = params.get("network");
    if (isNetworkName(networkFromUrl, supportedNetworks)) {
        params.delete("network");
        const newQuery = params.toString();
        const newUrl = window.location.pathname + (newQuery ? "?" + newQuery : "") + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);

        localStorage.setItem("polymedia.network", networkFromUrl);
        return networkFromUrl;
    }

    // Use network from local storage, if valid
    const networkFromLocal = localStorage.getItem("polymedia.network");
    if (isNetworkName(networkFromLocal, supportedNetworks)) {
        return networkFromLocal;
    }

    // Use default network
    localStorage.setItem("polymedia.network", defaultNetwork);
    return defaultNetwork;
}

export function switchNetwork<NetworkName extends BaseNetworkName>(
    newNetwork: NetworkName,
    supportedNetworks: readonly NetworkName[],
    onSwitch?: (newNetwork: NetworkName) => void
): void {
    if (!isNetworkName(newNetwork, supportedNetworks)) {
        throw new Error(`Network not supported: ${newNetwork}`);
    }
    localStorage.setItem("polymedia.network", newNetwork);
    if (onSwitch) {
        onSwitch(newNetwork);
    } else {
        window.location.reload();
    }
}

function isNetworkName<NetworkName extends BaseNetworkName>(
    value: string | null,
    supportedNetworks: readonly NetworkName[],
): value is NetworkName {
    return value !== null && supportedNetworks.includes(value as NetworkName);
}
