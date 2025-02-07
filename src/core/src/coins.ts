import { SuiClient } from "@mysten/sui/client";
import { normalizeStructTag } from "@mysten/sui/utils";

export type CoinMeta = {
    id: string | null;
    type: string;
    symbol: string;
    decimals: number;
    name: string;
    description: string;
    iconUrl: string | null;
};

const cache = new Map<string, CoinMeta | null>();

export async function getCoinMeta(
    client: SuiClient,
    coinType: string,
): Promise<CoinMeta | null>
{
    const normalizedType = normalizeStructTag(coinType);
    const cachedMeta = cache.get(normalizedType);
    if (cachedMeta !== undefined) {
        return cachedMeta;
    }

    const rawMeta = await client.getCoinMetadata({ coinType: normalizedType });
    const coinMeta = !rawMeta ? null : {
        id: rawMeta.id ?? null,
        type: normalizedType,
        symbol: rawMeta.symbol,
        decimals: rawMeta.decimals,
        name: rawMeta.name,
        description: rawMeta.description,
        iconUrl: rawMeta.iconUrl ?? null,
    };
    cache.set(normalizedType, coinMeta);

    return coinMeta;
}

export async function getCoinMetas(
    client: SuiClient,
    coinTypes: string[],
): Promise<Map<string, CoinMeta | null>>
{
    const uniqueTypes = Array.from(new Set(
        coinTypes.map(coinType => normalizeStructTag(coinType))
    ));

    const results = await Promise.allSettled(
        uniqueTypes.map(coinType => getCoinMeta(client, coinType))
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
