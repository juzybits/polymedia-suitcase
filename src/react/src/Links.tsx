import {
    ExplorerUrlMaker,
    NetworkName,
    SuiExplorerItem,
    makePolymediaUrl,
    makeSuiscanUrl,
    makeSuivisionUrl,
    shortenAddress,
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

export type ExplorerLinkProps = {
    network: NetworkName;
    kind: SuiExplorerItem;
    addr: string;
    className?: string;
    id?: string;
    children?: React.ReactNode;
};

/**
 * Higher-Order Component to create external links for explorers.
 */
const createExplorerLinkComponent = (
    makeUrl: ExplorerUrlMaker,
): React.FC<ExplorerLinkProps> =>
    ({ network, kind, addr, className, id, children }) => (
        <LinkExternal href={makeUrl(network, kind, addr)} className={className} id={id}>
            {children || shortenAddress(addr)}
        </LinkExternal>
    );

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

/**
 * A link to a Sui explorer (Polymedia, Suiscan, or SuiVision).
 */
export const LinkToExplorer: React.FC<ExplorerLinkProps & {
    explorer: "polymedia" | "suiscan" | "suivision";
}> = ({ explorer, network, kind, addr, className, id, children }) =>
{
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
    return <LinkExternal href={makeUrl(network, kind, addr)} className={className} id={id}>
        {children || shortenAddress(addr)}
    </LinkExternal>;
};
