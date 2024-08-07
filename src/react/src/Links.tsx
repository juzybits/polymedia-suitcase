import {
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

type ExplorerLinkProps = {
    network: NetworkName;
    kind: SuiExplorerItem;
    addr: string;
    className?: string;
    id?: string;
    children?: React.ReactNode;
};

type ExplorerUrlMaker = (
    network: NetworkName,
    kind: SuiExplorerItem,
    addr: string,
) => string;

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
