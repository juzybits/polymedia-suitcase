/**
 * A Sui network name
 */
export type NetworkName =  'mainnet' | 'testnet' | 'devnet' | 'localnet';

/**
 * A Sui Explorer item type, as in:
 * https://suiexplorer.com/address/...
 * https://suiexplorer.com/object/...
 * https://suiexplorer.com/package/...
 */
export type SuiExplorerItem = 'address' | 'object' | 'package';
