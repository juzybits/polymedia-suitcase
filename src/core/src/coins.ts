import { CoinMetadata, SuiClient } from "@mysten/sui/client";
import { normalizeStructTag } from "@mysten/sui/utils";

const cache = new Map<string, CoinMetadata | null>();

export async function getCoinMeta(
    client: SuiClient,
    coinType: string,
): Promise<CoinMetadata | null>
{
    const normalizedType = normalizeStructTag(coinType);
    const cachedMeta = cache.get(normalizedType);
    if (cachedMeta !== undefined) {
        return cachedMeta;
    }

    const coinMeta = await client.getCoinMetadata({ coinType: normalizedType });
    cache.set(normalizedType, coinMeta);

    return coinMeta;
}

export async function getCoinMetas(
    client: SuiClient,
    coinTypes: string[],
): Promise<Map<string, CoinMetadata | null>>
{
    const uniqueTypes = Array.from(new Set(
        coinTypes.map(coinType => normalizeStructTag(coinType))
    ));

    const results = await Promise.allSettled(
        uniqueTypes.map(coinType => getCoinMeta(client, coinType))
    );

    const metas = new Map<string, CoinMetadata | null>();
    results.forEach((result, index) => {
        metas.set(
            uniqueTypes[index],
            result.status === "fulfilled" ? result.value : null
        );
    });

    return metas;
}
