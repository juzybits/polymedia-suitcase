import { NetworkName, RPC_ENDPOINTS } from "@polymedia/suitcase-core";

/**
 * A radio button menu to select an RPC endpoint and save the choice to local storage.
 */
export const RpcRadioSelector: React.FC<{
    network: NetworkName;
    selectedRpc: string;
    onSwitch: (newRpc: string) => void;
    className?: string;
}> = ({
    network,
    selectedRpc,
    onSwitch,
    className = "",
}) => {
    return <div className={`polymedia-radio-selector polymedia-rpc-radio-selector ${className}`}>
        {RPC_ENDPOINTS[network].map((rpc) => (
            <div key={rpc}>
                <label className="selector-label">
                    <input
                        className="selector-radio"
                        type="radio"
                        value={rpc}
                        checked={selectedRpc === rpc}
                        onChange={() => {
                            switchRpc(network, rpc, onSwitch);
                        }}
                    />
                    <span className="selector-text">
                        {rpc}
                    </span>
                </label>
            </div>
        ))}
    </div>;
}

/**
 * Load the RPC URL for the current network from local storage.
 */
export function loadRpc(
    network: NetworkName,
): string {
    return localStorage.getItem(`polymedia.rpc.${network}`) || RPC_ENDPOINTS[network][0];
}

/**
 * Change RPCs, update local storage, and optionally trigger a callback.
 */
export function switchRpc(
    network: NetworkName,
    newRpc: string,
    onSwitch?: (newRpc: string) => void,
): void {
    localStorage.setItem(`polymedia.rpc.${network}`, newRpc);
    if (onSwitch) {
        onSwitch(newRpc);
    }
}
