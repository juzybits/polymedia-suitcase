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
    children: React.ReactNode;
    follow?: boolean;
    className?: string;
    id?: string;
}> = ({
    href,
    children,
    follow = true,
    className,
    id,
}) => {
    return <a
        target="_blank"
        rel={`noopener noreferrer ${follow ? "" : "nofollow"}`}
        href={href}
        className={className}
        id={id}
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
    className?: string;
    id?: string;
}> = ({
    network,
    kind,
    addr,
    className,
    id,
}) => {
    return <LinkExternal href={makePolymediaUrl(network, kind, addr)} className={className} id={id}>
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
    className?: string;
    id?: string;
}> = ({
    network,
    kind,
    addr,
    className,
    id,
}) => {
    return <LinkExternal href={makeSuiscanUrl(network, kind, addr)} className={className} id={id}>
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
    className?: string;
    id?: string;
}> = ({
    network,
    kind,
    addr,
    className,
    id,
}) => {
    return <LinkExternal href={makeSuivisionUrl(network, kind, addr)} className={className} id={id}>
        {shortenSuiAddress(addr)}
    </LinkExternal>;
};
