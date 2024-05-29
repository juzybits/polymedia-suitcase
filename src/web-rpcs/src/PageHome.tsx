import { SuiClient } from "@mysten/sui.js/client";
import { RPC_ENDPOINTS, RpcLatencyResult, generateRandomAddress, measureRpcLatency } from "@polymedia/suitcase-core";
import { LinkExternal } from "@polymedia/suitcase-react";
import React, { useState } from "react";

export const PageHome: React.FC = () =>
{
    /* State */

    const network = "mainnet";
    const [ rpcs, setRpcs ] = useState<RpcUrl[]>(
        RPC_ENDPOINTS[network].map(url => ( { url, enabled: true } ))
    );
    const [ results, setResults ] = useState<AggregateResult[]>([]);
    const [ isRunning, setIsRunning ] = useState<boolean>(false);

    /* Functions */

    const runTest = async () =>
    {
        setIsRunning(true);

        const numRounds = 11;
        const allResults: RpcLatencyResult[][] = [];
        const endpoints = rpcs.filter(rpc => rpc.enabled).map(rpc => rpc.url);
        const rpcRequest = async (client: SuiClient) => {
            await client.getObject({ id: generateRandomAddress() });
        };

        // Measure latency multiple times for each endpoint
        for (let i = 0; i < numRounds; i++) {
            const newResults = await measureRpcLatency({ endpoints, rpcRequest });
            allResults.push(newResults);
        }

        // Calculate average/P50/P90 latency for each endpoint
        const aggregateResults: AggregateResult[] = endpoints.map((endpoint, i) =>
        {
            const latencies: number[] = [];
            let hasError = false;

            // Collect all latency measurements for the current endpoint.
            // Ignore the first round due to DNS and TLS overhead.
            for (let round = 1; round < numRounds; round++) {
                const result = allResults[round][i];
                if (result.latency !== undefined) {
                    latencies.push(result.latency);
                } else {
                    hasError = true;
                    break;
                }
            }

            if (!hasError && latencies.length > 0) {
                return {
                    endpoint,
                    average: calculateAverage(latencies),
                    p50: calculatePercentile(latencies, 0.5),
                    p90: calculatePercentile(latencies, 0.9),
                    error: false,
                };
            } else {
                return {
                    endpoint,
                    average: NaN,
                    p50: NaN,
                    p90: NaN,
                    error: true,
                };
            }
        })

        // Sort the results from fastest to slowest
        aggregateResults.sort((a, b) => {
            if (a.error && !b.error) return 1;
            if (!a.error && b.error) return -1;
            return a.average - b.average;
        })

        setResults(aggregateResults);
        setIsRunning(false);
    };

    const onRpcCheckboxChange = (url: string) => {
        setRpcs(prevRpcs =>
            prevRpcs.map(rpc =>
                rpc.url !== url ? rpc : { ...rpc, enabled: !rpc.enabled }
            )
        );
    };

    /* HTML */

    return <>
    <h1><span className="rainbow">Sui RPC tools</span></h1>

    <div className="section">
        <h2><span className="rainbow">RPC TEST</span></h2>

        <div id="rpc-selector">
        {rpcs.map(rpc => (
            <div key={rpc.url} className="rpc">
            <label>
                <input
                    type="checkbox"
                    checked={rpc.enabled}
                    onChange={() => onRpcCheckboxChange(rpc.url)}
                />
                {rpc.url}
            </label>
            </div>
        ))}
        </div>

        <button className="btn" onClick={runTest} disabled={isRunning}>
            {isRunning ? "RUNNING" : "TEST"}
        </button>
    </div>

    {results.length > 0 &&
    <div className="section">
        <h2><span className={`rainbow ${isRunning ? "running" : ""}`}>RESULTS</span></h2>

        <div id="results" className={isRunning ? "running" : ""}>
        <div className="result header">
            <div className="endpoint">ENDPOINT</div>
            <div className="latency">AVG</div>
            <div className="latency">P50</div>
            <div className="latency">P90</div>
        </div>
            {results.map(result =>
                <ResultRow result={result} key={result.endpoint} />
            )}
        </div>
    </div>}

    <div className="section">
        <h2><span className="rainbow">DEV TOOLS</span></h2>

        <p>
            The NPM package <b><i>@polymedia/suitcase-core</i></b> provides functions to measure RPC latency and instantiate <i>SuiClient</i> using the lowest latency endpoint for each user: <b><i>measureRpcLatency()</i></b> and <b><i>newLowLatencySuiClient()</i></b>.
        </p>
        <p>
            <LinkExternal href="https://github.com/juzybits/polymedia-suitcase/blob/main/src/core/src/utils-sui.ts" follow={true}>
                Read the code
            </LinkExternal>
        </p>
    </div>
    </>;
};

export const ResultRow: React.FC<{
    result: AggregateResult;
}> = ({
    result,
}) => {
    return <div className="result">
        <div className="endpoint">{result.endpoint}</div>
        {!result.error ? <>
            <div className="latency">{result.average.toFixed(0)}</div>
            <div className="latency">{result.p50.toFixed(0)}</div>
            <div className="latency">{result.p90.toFixed(0)}</div>
        </> : <>
            <div className="latency"></div>
            <div className="latency"></div>
            <div className="latency text-red">Error</div>
        </>}
    </div>;
};

/* Types */

export type RpcUrl = {
    url: string;
    enabled: boolean;
};

export type AggregateResult = {
    endpoint: string;
    average: number;
    p50: number;
    p90: number;
    error: boolean;
};

/* Utility Functions */

function calculateAverage(latencies: number[]): number {
    const sum = latencies.reduce((acc, curr) => acc + curr, 0);
    return sum / latencies.length;
}

function calculatePercentile(data: number[], percentile: number): number {
    if (data.length === 0) return NaN;

    // Sort the data
    data.sort((a, b) => a - b);

    // Calculate rank
    const rank = percentile * (data.length - 1);
    const lowerIndex = Math.floor(rank);
    const upperIndex = Math.ceil(rank);

    // If rank is an integer, return the value at that rank
    if (lowerIndex === upperIndex) {
        return data[lowerIndex];
    }

    // Interpolate between the closest ranks
    const lowerValue = data[lowerIndex];
    const upperValue = data[upperIndex];
    const weight = rank - lowerIndex;

    return lowerValue + (upperValue - lowerValue) * weight;
}
