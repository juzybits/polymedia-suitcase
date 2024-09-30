import {
    ExplorerUrlMaker,
    NetworkName,
    SuiExplorerItem,
    makePolymediaUrl,
    makeSuiscanUrl,
    makeSuivisionUrl,
    shortenAddress,
} from "@polymedia/suitcase-core";
import { ExplorerName } from "./explorers";

// === types ===

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
export const LinkExternal: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    follow?: boolean;
    children: React.ReactNode;
}> = ({
    follow = true,
    children,
    ...props
}) => {
    const target = props.target ?? "_blank";
    const rel = props.rel ?? `noopener noreferrer ${follow ? "" : "nofollow"}`;
    return <a {...props} target={target} rel={rel}>
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
    if (explorer === "Polymedia") {
        makeUrl = makePolymediaUrl;
    } else if (explorer === "Suiscan") {
        makeUrl = makeSuiscanUrl;
    } else if (explorer === "SuiVision") {
        makeUrl = makeSuivisionUrl;
    } else {
        throw new Error(`Unknown explorer: ${explorer}`);
    }
    html.href = makeUrl(network, kind, addr);
    return <LinkExternal {...html}>
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
        return <LinkExternal {...html}>
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
