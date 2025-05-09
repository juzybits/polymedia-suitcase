import { useRef, useState } from "react";

import { useClickOutside } from "./hooks";
import { RadioOption, RadioSelector } from "./selectors";

export type BaseNetworkName = string;

/**
 * A radio button menu to select a Sui network and save the choice to local storage.
 */
export function NetworkRadioSelector<NetworkName extends BaseNetworkName>(props: {
    selectedNetwork: NetworkName;
    supportedNetworks: readonly NetworkName[];
    onSwitch: (newNetwork: NetworkName) => void;
    className?: string;
}) {
    const options: RadioOption<NetworkName>[] = props.supportedNetworks.map(network => ({
        value: network,
        label: network
    }));

    const onSelect = (newNetwork: NetworkName) => {
        switchNetwork(newNetwork, props.supportedNetworks, props.onSwitch);
    };

    return (
        <RadioSelector
            options={options}
            selectedValue={props.selectedNetwork}
            onSelect={onSelect}
            className={`poly-network-radio-selector ${props.className ?? ""}`}
        />
    );
}

/**
 * A dropdown menu to choose between mainnet/testnet/devnet/localnet.
 */
export function NetworkDropdownSelector<NetworkName extends BaseNetworkName>(props: {
    currentNetwork: NetworkName;
    supportedNetworks: readonly NetworkName[];
    onSwitch?: (newNetwork: NetworkName) => void;
    disabled?: boolean;
    className?: string;
    id?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);

    const selectorRef = useRef(null);
    useClickOutside(selectorRef, () => { setIsOpen(false); });

    const SelectedOption: React.FC = () => {
        return <div className="network-option selected" /* onMouseEnter={() => setIsOpen(true)} */ >
            <span className="text" onClick={() => { !props.disabled && setIsOpen(true); }}>
                {props.currentNetwork}
            </span>
        </div>;
    };

    const NetworkOptions: React.FC = () => {
        const otherNetworks = props.supportedNetworks.filter(net => net !== props.currentNetwork);
        return <div className="network-options">
            {otherNetworks.map(net => (
                <NetworkOption key={net} network={net} />
            ))}
        </div>;
    };

    const NetworkOption: React.FC<{ network: NetworkName }> = ({ network }) => {
        return <div className="network-option">
            <span className="text" onClick={() => {
                if (!props.disabled) {
                    switchNetwork(network, props.supportedNetworks, props.onSwitch);
                    setIsOpen(false);
                }
            }}>
                {network}
            </span>
        </div>;
    };

    return <div
        id={props.id}
        className={"network-selector " + (props.disabled ? "disabled " : "") + (props.className ?? "")}
        ref={selectorRef}
        onMouseLeave={() => {setIsOpen(false);}}
    >
        <SelectedOption />
        {isOpen && <NetworkOptions />}
    </div>;
}

/**
 * Check if the current hostname is a localhost environment.
 */
export function isLocalhost(): boolean {
    const hostname = window.location.hostname;
    const localNetworkPattern = /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/;
    return hostname === "localhost" || localNetworkPattern.test(hostname);
}

/**
 * Load the network name based on URL parameters and local storage.
 */
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

/**
 * Change networks, update local storage, and optionally trigger a callback.
 */
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
