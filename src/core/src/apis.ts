/**
 * Make a request to the Indexer.xyz API (NFTs).
 */
export async function apiRequestIndexer<T>(apiUser: string, apiKey: string, query: string): Promise<T> {
    const resp = await fetch("https://api.indexer.xyz/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-user": apiUser,
            "x-api-key": apiKey,
        },
        body: JSON.stringify({query}),
    });
    if (!resp.ok) {
        throw new Error(`HTTP error: ${resp.status}`);
    }
    return resp.json() as Promise<T>;
}
