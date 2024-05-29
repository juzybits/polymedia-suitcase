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
    const [ results, setResults ] = useState<RpcLatencyResult[]>([]);
    const [ isRunning, setIsRunning ] = useState<boolean>(false);

    /* Functions */

    const runTest = async () => {
        setIsRunning(true);
        const newResults = await measureRpcLatency({
            endpoints: rpcs.filter(rpc => rpc.enabled).map(rpc => rpc.url),
            rpcRequest: async (client: SuiClient) => {
                await client.getObject({ id: generateRandomAddress() });
            },
        });
        setResults(newResults);
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
            {results.map(result =>
                <TestResult result={result} key={result.endpoint} />
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

export const TestResult: React.FC<{
    result: RpcLatencyResult;
}> = ({
    result,
}) => {
    const content = result.latency ? <>
        <span className="endpoint">{result.endpoint}</span>
        <span className="latency">{result.latency}ms</span>
    </> : <>
        <span className="endpoint">{result.endpoint}</span>
        <span className="text-red">Error</span>
    </>;
    return <div className="result">
        {content}
    </div>;
};


export type RpcUrl = {
    url: string;
    enabled: boolean;
};
