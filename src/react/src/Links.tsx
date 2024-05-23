import { NetworkName, makeExplorerUrl, shortenSuiAddress } from "@polymedia/suitcase-core";

/**
 * An external link like:
 * `<a target='_blank' rel='noopener noreferrer nofollow' href={href}>{text}</a>`
 */
export const LinkExternal: React.FC<{
    href: string;
    follow?: boolean;
    children: React.ReactNode;
}> = ({
    href,
    follow = false,
    children,
}) => {
    return <a
        target="_blank"
        rel={`noopener noreferrer ${follow ? "" : "nofollow"}`}
        href={href}
    >
        {children}
    </a>;
};

/**
 * An external link to an address the Sui Explorer
 */
export const LinkToExplorerAddr: React.FC<{
    network: NetworkName;
    addr: string;
}> = ({
    network,
    addr,
}) => {
    return <LinkExternal href={makeExplorerUrl(network, "address", addr)}>
        {shortenSuiAddress(addr)}
    </LinkExternal>;
};

/**
 * An external link to an object the Sui Explorer
 */
export const LinkToExplorerObj: React.FC<{
    network: NetworkName;
    objId: string;
}> = ({
    network,
    objId,
}) => {
    return <LinkExternal href={makeExplorerUrl(network, "object", objId)}>
        {shortenSuiAddress(objId)}
    </LinkExternal>;
};

/**
 * An external link to a package the Sui Explorer
 */
export const LinkToExplorerPkg: React.FC<{
    network: NetworkName;
    pkgId: string;
}> = ({
    network,
    pkgId,
}) => {
    return <LinkExternal href={makeExplorerUrl(network, "package", pkgId)}>
        {shortenSuiAddress(pkgId)}
    </LinkExternal>;
};


/**
 * An external link to a transaction block the Sui Explorer
 */
export const LinkToExplorerTxn: React.FC<{
    network: NetworkName;
    txnId: string;
}> = ({
    network,
    txnId,
}) => {
    return <LinkExternal href={makeExplorerUrl(network, "txblock", txnId)}>
        {shortenSuiAddress(txnId)}
    </LinkExternal>;
};
