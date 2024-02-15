/* API utils */

/**
 * Make a request to the Indexer.xyz API (NFTs).
 */
export async function apiRequestIndexer<T>(apiUser: string, apiKey: string, query: string): Promise<T> {
    const result = await fetch('https://api.indexer.xyz/graphql', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'x-api-user': apiUser,
          'x-api-key': apiKey,
      },
      body: JSON.stringify({query}),
    })
    .then((response: Response) => {
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json() as Promise<T>;
    });
    return result;
}
