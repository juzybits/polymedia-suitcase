import { getFullnodeUrl } from '@mysten/sui.js/client';
import { NetworkName } from "./types";

/**
 * Default RPC endpoint URLs for SuiMultiClient.
 * Manually tested for the last time on January 2023.
 */
export const RPC_ENDPOINTS: Record<NetworkName, string[]> = {
    'mainnet': [
        getFullnodeUrl('mainnet'),
        'https://mainnet.suiet.app',
        'https://rpc-mainnet.suiscan.xyz',
        'https://sui-mainnet-ca-2.cosmostation.io',
        'https://sui-mainnet-endpoint.blockvision.org',
        'https://sui-mainnet-eu-3.cosmostation.io',
        'https://sui-mainnet-eu-4.cosmostation.io',
        'https://sui-mainnet-rpc.bartestnet.com',
        'https://sui-mainnet-us-1.cosmostation.io',
        'https://sui-mainnet-us-2.cosmostation.io',
        'https://sui-mainnet.public.blastapi.io',
        'https://sui.publicnode.com',

        'https://sui-mainnet-rpc-germany.allthatnode.com',
        'https://sui-mainnet-rpc.allthatnode.com',
        'https://sui-mainnet.nodeinfra.com',                    // 429 too many requests (occasionally)
        'https://sui1mainnet-rpc.chainode.tech',                // 502 bad gateway (works now)
        // 'https://mainnet.sui.rpcpool.com',                   // 403 forbidden when using VPN
        // 'https://sui-mainnet-rpc-korea.allthatnode.com',     // too slow/far

        // 'https://mainnet-rpc.sui.chainbase.online',          // 567 response
        // 'https://sui-mainnet-ca-1.cosmostation.io',          // 404
        // 'https://sui-rpc-mainnet.testnet-pride.com',         // 502 bad gateway
        // 'https://sui-mainnet-eu-1.cosmostation.io',          // 000
        // 'https://sui-mainnet-eu-2.cosmostation.io',          // 000
    ],
    'testnet': [
        getFullnodeUrl('testnet'),
        'https://rpc-testnet.suiscan.xyz',
        'https://sui-testnet-endpoint.blockvision.org',
        'https://sui-testnet.public.blastapi.io',
        'https://testnet.suiet.app',
        'https://sui-testnet.nodeinfra.com',                    // 429 too many requests (occasionally)
        // 'https://testnet.sui.rpcpool.com',                   // 403 forbidden when using VPN
    ],
    'devnet': [
        getFullnodeUrl('devnet'),
        'https://devnet.suiet.app',
    ],
    'localnet': [
        // to simulate multiple RPC endpoints locally
        getFullnodeUrl('localnet') + "?localnet-1",
        getFullnodeUrl('localnet') + "?localnet-2",
        getFullnodeUrl('localnet') + "?localnet-3",
        getFullnodeUrl('localnet') + "?localnet-4",
        getFullnodeUrl('localnet') + "?localnet-5",
    ],
};
