import {
    NetworkName,
    SuiExplorerItem,
    makePolymediaUrl,
    makeSuiscanUrl,
    makeSuivisionUrl,
    shortenSuiAddress,
} from "@polymedia/suitcase-core";

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
 * A link to explorer.polymedia.app.
 */
export const LinkToPolymedia: React.FC<{
    network: NetworkName;
    kind: SuiExplorerItem;
    addr: string;
}> = ({
    network,
    kind,
    addr,
}) => {
    return <LinkExternal href={makePolymediaUrl(network, kind, addr)}>
        {shortenSuiAddress(addr)}
    </LinkExternal>;
};

/**
 * A link to suiscan.xyz.
 */
export const LinkToSuiscan: React.FC<{
    network: NetworkName;
    kind: SuiExplorerItem;
    addr: string;
}> = ({
    network,
    kind,
    addr,
}) => {
    return <LinkExternal href={makeSuiscanUrl(network, kind, addr)}>
        {shortenSuiAddress(addr)}
    </LinkExternal>;
};


/**
 * A link to suivision.xyz.
 */
export const LinkToSuivision: React.FC<{
    network: NetworkName;
    kind: SuiExplorerItem;
    addr: string;
}> = ({
    network,
    kind,
    addr,
}) => {
    return <LinkExternal href={makeSuivisionUrl(network, kind, addr)}>
        {shortenSuiAddress(addr)}
    </LinkExternal>;
};
