import {
    ExplorerUrlMaker,
    NetworkName,
    SuiExplorerItem,
    makePolymediaUrl,
    makeSuiscanUrl,
    makeSuivisionUrl,
    shortenAddress,
} from "@polymedia/suitcase-core";

// === types ===

export type ExplorerName = "polymedia" | "suiscan" | "suivision";

export type ExplorerLinkProps = {
    network: NetworkName;
    kind: SuiExplorerItem;
    addr: string;
    html?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
    children?: React.ReactNode;
};

// === components ===

/**
 * An external link like:
 * `<a target='_blank' rel='noopener noreferrer nofollow' href={href}>{text}</a>`
 */
export const LinkExternal: React.FC<{
    follow?: boolean;
    html?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
    children: React.ReactNode;
}> = ({
    follow = true,
    html = {},
    children,
}) => {
    html.target = html.target ?? "_blank";
    html.rel = html.rel ?? `noopener noreferrer ${follow ? "" : "nofollow"}`;
    return <a {...html} >
        {children}
    </a>;
};

/**
 * A link to a Sui explorer (Polymedia, Suiscan, or SuiVision).
 */
export const LinkToExplorer: React.FC<ExplorerLinkProps & {
    explorer: ExplorerName;
}> = ({
    explorer,
    network,
    kind,
    addr,
    html = {},
    children = null,
}) => {
    let makeUrl: ExplorerUrlMaker;
    if (explorer === "polymedia") {
        makeUrl = makePolymediaUrl;
    } else if (explorer === "suiscan") {
        makeUrl = makeSuiscanUrl;
    } else if (explorer === "suivision") {
        makeUrl = makeSuivisionUrl;
    } else {
        throw new Error(`Unknown explorer: ${explorer}`);
    }
    html.href = makeUrl(network, kind, addr);
    return <LinkExternal html={html}>
        {children || shortenAddress(addr)}
    </LinkExternal>;
};

/**
 * Higher-Order Component to create external links for explorers.
 */
const createExplorerLinkComponent = (
    makeUrl: ExplorerUrlMaker,
): React.FC<ExplorerLinkProps> =>
{
    return ({
        network,
        kind,
        addr,
        html = {},
        children = null,
    }: ExplorerLinkProps) =>
    {
        html.href = makeUrl(network, kind, addr);
        return <LinkExternal html={html}>
            {children || shortenAddress(addr)}
        </LinkExternal>;
    };
};

/**
 * A link to explorer.polymedia.app.
 */
export const LinkToPolymedia = createExplorerLinkComponent(makePolymediaUrl);

/**
 * A link to suiscan.xyz.
 */
export const LinkToSuiscan = createExplorerLinkComponent(makeSuiscanUrl);

/**
 * A link to suivision.xyz.
 */
export const LinkToSuivision = createExplorerLinkComponent(makeSuivisionUrl);
