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
            testType: "getObject",
        });
        newResults.sort((a, b) => (a.latency ?? 99999) - (b.latency ?? 99999));
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

    <h1><span className="rainbow">Sui RPC test</span></h1>

    <h2><span className="rainbow">RPCs</span></h2>

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

    <button className="btn" onClick={runTest} disabled={isRunning}>TEST</button>

    {results.length > 0 &&
    <div id="results">
        <h2><span className="rainbow">RESULTS</span></h2>
        {results.map(result =>
            <TestResult result={result} key={result.endpoint} />
        )}
    </div>}

    </>;
};

export const TestResult: React.FC<{
    result: RpcTestResult;
}> = ({
    result,
}) => {
    const content = result.latency ? <>
        <span className="endpoint">{result.endpoint}</span>
        <span>{result.latency}ms</span>
    </> : <>
        <span className="endpoint">{result.endpoint}</span>
        <span className="text-red">Error</span>
    </>;
    return <div className="result">
        {content}
    </div>;
}


export type RpcUrl = {
    url: string;
    enabled: boolean;
};
