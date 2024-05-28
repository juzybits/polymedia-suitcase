import React, { useState } from "react";
import { RPC_ENDPOINTS, RpcTestResult, testRpcLatency } from "@polymedia/suitcase-core";

export const PageHome: React.FC = () =>
{
    /* State */

    const network = "mainnet";
    const [ rpcs, setRpcs ] = useState<RpcUrl[]>(
        RPC_ENDPOINTS[network].map(url => ( { url, enabled: true } ))
    );
    const [ results, setResults ] = useState<RpcTestResult[]>([]);
    const [ isRunning, setIsRunning ] = useState<boolean>(false);

    /* Functions */

    const runTest = async () => {
        setIsRunning(true);
        const newResults = await testRpcLatency({
            endpoints: rpcs.filter(rpc => rpc.enabled).map(rpc => rpc.url),
        });
        setResults(newResults);
        setIsRunning(false);
    }

    const onRpcCheckboxChange = (url: string) => {
        setRpcs(prevRpcs =>
            prevRpcs.map(rpc =>
                rpc.url !== url ? rpc : { ...rpc, enabled: !rpc.enabled }
            )
        );
    };

    /* HTML */

    return <>

    <h1><span className="rainbow">Sui RPC test</span></h1>

    <h2>RPCs</h2>

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

    <button className="btn" onClick={runTest} disabled={isRunning}>TEST</button>

    {results.length > 0 && <>

        <h2>Results</h2>

        {results.map(result =>
        <div key={result.endpoint}>
            <div>Endpoint: {result.endpoint}</div>
            <div>Result: {result.latency ?? result.error}</div>
        </div>)}

    </>}


    </>;
};

export type RpcUrl = {
    url: string;
    enabled: boolean;
};
