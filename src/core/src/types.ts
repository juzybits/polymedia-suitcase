import { SignatureWithBytes } from "@mysten/sui/cryptography";
import { Transaction } from "@mysten/sui/transactions";

export const NETWORK_NAMES = ["mainnet", "testnet", "devnet", "localnet"] as const;

export type NetworkName = (typeof NETWORK_NAMES)[number];

/**
 * A Sui object display with common properties and arbitrary ones.
 */
export type ObjectDisplay = {
    [key: string]: string | null;
    name: string | null;
    description: string | null;
    link: string | null;
    image_url: string | null;
    thumbnail_url: string | null;
    project_name: string | null;
    project_url: string | null;
    project_image_url: string | null;
    creator: string | null;
};

/**
 * A paginated response from a Sui RPC call.
 */
export type PaginatedResponse<T> = {
    data: T[];
    hasNextPage: boolean;
    nextCursor: string | null | undefined;
};

/**
 * The return type of `Transaction.receivingRef()`.
 */
export type ReceivingRef = ReturnType<InstanceType<typeof Transaction>["receivingRef"]>;

/**
 * A function that can sign a `Transaction`.
 *
 * For a webapp that uses `@mysten/dapp-kit` to sign with a Sui wallet:
    ```
    const { mutateAsync: walletSignTx } = useSignTransaction();
    const signTx: SignTransaction = async (tx) => {
        return walletSignTx({ transaction: tx });
    };
    ```
 * For a script that uses a local secret key to sign programmatically:
    ```
    const secretKey = "suiprivkey1...";
    const signer = pairFromSecretKey(secretKey)
    const signTx: SignTransaction = async (tx) => {
        tx.setSenderIfNotSet(signer.toSuiAddress());
        const txBytes = await tx.build({ client: suiClient });
        return signer.signTransaction(txBytes);
    };
    ```
 */
export type SignTransaction = (tx: Transaction) => Promise<SignatureWithBytes>;
