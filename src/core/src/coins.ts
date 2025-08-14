import { SuiClient } from "@mysten/sui/client";
import { normalizeStructTag } from "@mysten/sui/utils";

/**
 * Like `CoinMetadata` from `@mysten/sui`, but includes the coin `type`.
 */
export type CoinMeta = {
    type: string;
    symbol: string;
    decimals: number;
    name: string;
    description: string;
    id: string | null;
    iconUrl: string | null;
};

/**
 * Fetch coin metadata from the RPC and cache it.
 */
export class CoinMetaFetcher
{
    protected readonly suiClient: SuiClient;
    protected readonly cache = new Map<string, CoinMeta | null>();

    constructor({
        suiClient,
        preloadUrl = "https://coinmeta.polymedia.app/api/data.json",
        preloadData,
    }: {
        suiClient: SuiClient;
        preloadUrl?: string;
        preloadData?: CoinMeta[];
    })
    {
        this.suiClient = suiClient;

        if (preloadData) {
            preloadData.forEach(coinMeta => {
                this.cache.set(coinMeta.type, coinMeta);
            });
        }

        if (preloadUrl) {
            (async () => {
                try {
                    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
                    const resp = await fetch(preloadUrl);
                    const data = await resp.json();
                    if (!Array.isArray(data)) {
                        throw new Error("Invalid preload data");
                    }
                    for (const m of data) {
                        if (typeof m !== "object" || m === null) {
                            throw new Error("Invalid preload data");
                        }
                        if (
                            typeof m.type !== "string" ||
                            typeof m.symbol !== "string" ||
                            typeof m.decimals !== "number" ||
                            typeof m.name !== "string" ||
                            typeof m.description !== "string" ||
                            (m.id !== undefined && typeof m.id !== "string" && m.id !== null) ||
                            (m.iconUrl !== undefined && typeof m.iconUrl !== "string" && m.iconUrl !== null)
                        ) {
                            continue;
                        }
                        this.cache.set(m.type, m);
                    }
                    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
                } catch (err) {
                    console.warn(`Failed to preload coin metadata from "${preloadUrl}":`, err);
                }
            })();
        }
    }

    public async getCoinMeta(
        coinType: string,
    ): Promise<CoinMeta | null>
    {
        const normalizedType = normalizeStructTag(coinType);
        const cachedMeta = this.cache.get(normalizedType);
        if (cachedMeta !== undefined) {
            return cachedMeta;
        }

        const rawMeta = await this.suiClient.getCoinMetadata({ coinType: normalizedType });
        const coinMeta = !rawMeta ? null : {
            id: rawMeta.id ?? null,
            type: normalizedType,
            symbol: rawMeta.symbol,
            decimals: rawMeta.decimals,
            name: rawMeta.name,
            description: rawMeta.description,
            iconUrl: rawMeta.iconUrl ?? null,
        };
        this.cache.set(normalizedType, coinMeta);

        return coinMeta;
    }

    public async getCoinMetas(
        coinTypes: string[],
    ): Promise<Map<string, CoinMeta | null>>
    {
        const uniqueTypes = Array.from(new Set(
            coinTypes.map(coinType => normalizeStructTag(coinType))
        ));

        const results = await Promise.allSettled(
            uniqueTypes.map(coinType => this.getCoinMeta(coinType))
        );

        const metas = new Map<string, CoinMeta | null>();
        results.forEach((result, index) => {
            metas.set(
                uniqueTypes[index],
                result.status === "fulfilled" ? result.value : null
            );
        });

        return metas;
    }
}
