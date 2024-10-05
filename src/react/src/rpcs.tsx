import { NetworkName, RPC_ENDPOINTS } from "@polymedia/suitcase-core";

/**
 * A radio button menu to select an RPC endpoint and save the choice to local storage.
 */
export const RpcRadioSelector: React.FC<{
    network: NetworkName;
    selectedRpc: string;
    supportedRpcs?: string[];
    onSwitch: (newRpc: string) => void;
    className?: string;
}> = ({
    network,
    selectedRpc,
    supportedRpcs = RPC_ENDPOINTS[network],
    onSwitch,
    className = "",
}) => {
    return <div className={`poly-radio-selector poly-rpc-radio-selector ${className}`}>
        {supportedRpcs.map((rpc) => (
            <div key={rpc}>
                <label className="selector-label">
                    <input
                        className="selector-radio"
                        type="radio"
                        value={rpc}
                        checked={selectedRpc === rpc}
                        onChange={() => {
                            switchRpc({
                                network,
                                newRpc: rpc,
                                supportedRpcs,
                                defaultRpc: supportedRpcs[0],
                                onSwitch
                            });
                        }}
                    />
                    <span className="selector-text">
                        {rpc}
                    </span>
                </label>
            </div>
        ))}
    </div>;
};

/**
 * Load the RPC URL for the current network from local storage.
 */
export type LoadRpcParams = {
    network: NetworkName;
    supportedRpcs?: string[];
    defaultRpc?: string;
};

export function loadRpc({
    network,
    supportedRpcs = RPC_ENDPOINTS[network],
    defaultRpc = supportedRpcs[0],
}: LoadRpcParams): string
{
    const storedRpc = localStorage.getItem(`polymedia.rpc.${network}`);
    if (storedRpc && supportedRpcs.includes(storedRpc)) {
        return storedRpc;
    }
    return defaultRpc;
}

export type SwitchRpcParams = {
    network: NetworkName;
    newRpc: string;
    supportedRpcs?: string[];
    defaultRpc?: string;
    onSwitch?: (newRpc: string) => void;
};

/**
 * Change RPCs, update local storage, and optionally trigger a callback.
 */
export function switchRpc({
    network,
    newRpc,
    supportedRpcs = RPC_ENDPOINTS[network],
    defaultRpc = supportedRpcs[0],
    onSwitch,
}: SwitchRpcParams): void
{
    newRpc = supportedRpcs.includes(newRpc) ? newRpc : defaultRpc;
    localStorage.setItem(`polymedia.rpc.${network}`, newRpc);
    if (onSwitch) {
        onSwitch(newRpc);
    }
}
