import { useRef, useState } from "react";
import { BaseNetworkName, switchNetwork } from "./network.js";
import { useClickOutside } from "./useClickOutside";

/**
 * A dropdown menu to choose between mainnet/testnet/devnet/localnet.
 */
export function NetworkSelector<NetworkName extends BaseNetworkName>({
    currentNetwork,
    supportedNetworks,
    onSwitch,
    disabled = false,
    className = "",
    id,
}: {
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
            <span className="text" onClick={() => { !disabled && setIsOpen(true); }}>
                {currentNetwork}
            </span>
        </div>;
    };

    const NetworkOptions: React.FC = () => {
        const otherNetworks = supportedNetworks.filter(net => net !== currentNetwork);
        return <div className="network-options">
            {otherNetworks.map(net => (
                <NetworkOption key={net} network={net} />
            ))}
        </div>;
    };

    const NetworkOption: React.FC<{ network: NetworkName }> = ({ network }) => {
        return <div className="network-option">
            <span className="text" onClick={() => {
                if (!disabled) {
                    switchNetwork(network, supportedNetworks, onSwitch);
                    setIsOpen(false);
                }
            }}>
                {network}
            </span>
        </div>;
    };

    return <div
        id={id}
        className={"network-selector " + (disabled ? "disabled " : "") + className}
        ref={selectorRef}
        onMouseLeave={() => {setIsOpen(false);}}
    >
        <SelectedOption />
        {isOpen && <NetworkOptions />}
    </div>;
}
