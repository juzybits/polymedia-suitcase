import type {
	SuiCallArg,
	SuiClient,
	SuiObjectRef,
	SuiTransactionBlockResponse,
	SuiTransactionBlockResponseOptions,
} from "@mysten/sui/client";
import type { SignatureWithBytes, Signer } from "@mysten/sui/cryptography";
import type {
	Transaction,
	TransactionObjectInput,
	TransactionResult,
} from "@mysten/sui/transactions";

import { isSuiObjectRef } from "./guards.js";
import { sleep } from "./misc.js";

// === misc ===

/**
 * An item in the array returned by a `Transaction.moveCall()` call.
 */
export type NestedResult = ReturnType<Transaction["moveCall"]> extends (infer Item)[]
	? Item
	: never;

/**
 * Either a `TransactionObjectInput` or a `SuiObjectRef`.
 */
export type ObjectInput = TransactionObjectInput | SuiObjectRef;

/**
 * Get the value of a `SuiCallArg` (transaction input).
 * If the argument is a pure value, return it.
 * If the argument is an object, return its ID.
 */
export function getArgVal<T>(arg: SuiCallArg): T {
	if (arg.type === "pure") {
		return arg.value as T;
	}
	return arg.objectId as T;
}

/**
 * Transform an `ObjectInput` into an argument for `Transaction.moveCall()`.
 */
export function objectArg(tx: Transaction, obj: ObjectInput) {
	return isSuiObjectRef(obj) ? tx.objectRef(obj) : tx.object(obj);
}

/**
 * Validate a `SuiTransactionBlockResponse` of the `ProgrammableTransaction` kind
 * and return its `.transaction.data`.
 */
export function txResToData(resp: SuiTransactionBlockResponse) {
	if (resp.errors && resp.errors.length > 0) {
		throw Error(`response error: ${JSON.stringify(resp, null, 2)}`);
	}
	if (resp.transaction?.data.transaction.kind !== "ProgrammableTransaction") {
		throw Error(
			`response has no data or is not a ProgrammableTransaction: ${JSON.stringify(resp, null, 2)}`,
		);
	}
	return {
		sender: resp.transaction.data.sender,
		gasData: resp.transaction.data.gasData,
		inputs: resp.transaction.data.transaction.inputs,
		txs: resp.transaction.data.transaction.transactions,
	};
}

// === tx signing and submitting ===

/**
 * A function that can sign a `Transaction`.
 *
 * For apps that use `@mysten/dapp-kit` to sign with a Sui wallet:
    ```
    const { mutateAsync: walletSignTx } = useSignTransaction();
    const signTx: SignTx = async (tx) => {
        return walletSignTx({ transaction: tx });
    };
    ```
 * For code that has direct access to the private key:
    ```
    const secretKey = "suiprivkey1...";
    const signer = pairFromSecretKey(secretKey)
    const signTx: SignTx = async (tx) => {
        tx.setSenderIfNotSet(signer.toSuiAddress());
        const txBytes = await tx.build({ client: suiClient });
        return signer.signTransaction(txBytes);
    };
    ```
 */
export type SignTx = (tx: Transaction) => Promise<SignatureWithBytes>;

/**
 * Create a `SignTx` function that uses a `Signer` to sign a `Transaction`.
 */
export function newSignTx(suiClient: SuiClient, signer: Signer): SignTx {
	return async (tx: Transaction) => {
		tx.setSenderIfNotSet(signer.toSuiAddress());
		const txBytes = await tx.build({ client: suiClient });
		return signer.signTransaction(txBytes);
	};
}

/**
 * Options for `SuiClient.waitForTransaction()`.
 */
export type WaitForTxOptions = {
	pollInterval: number;
	timeout?: number;
};

const DEFAULT_RESPONSE_OPTIONS: SuiTransactionBlockResponseOptions = {
	showEffects: true,
	showObjectChanges: true,
};

const DEFAULT_WAIT_FOR_TX_OPTIONS: WaitForTxOptions = {
	pollInterval: 250,
};

const SLEEP_MS_AFTER_FINALITY_ERROR = 1000;

export type SignAndExecuteTx = ReturnType<typeof newSignAndExecuteTx>;

/**
 * Create a function that signs and executes a `Transaction`.
 * TODO: add to README
 */
export function newSignAndExecuteTx({
	suiClient,
	signTx,
	sender: _sender = undefined,
	txRespOptions: _txRespOptions = DEFAULT_RESPONSE_OPTIONS,
	waitForTxOptions: _waitForTxOptions = DEFAULT_WAIT_FOR_TX_OPTIONS,
}: {
	suiClient: SuiClient;
	signTx: SignTx;
	sender?: string | undefined;
	txRespOptions?: SuiTransactionBlockResponseOptions;
	waitForTxOptions?: WaitForTxOptions | false;
}) {
	return async ({
		tx,
		sender = _sender,
		txRespOptions = _txRespOptions,
		waitForTxOptions = _waitForTxOptions,
		dryRun = false,
	}: {
		tx: Transaction;
		sender?: string;
		txRespOptions?: SuiTransactionBlockResponseOptions;
		waitForTxOptions?: WaitForTxOptions | false;
		dryRun?: boolean;
	}): Promise<SuiTransactionBlockResponse> => {
		if (sender) {
			tx.setSenderIfNotSet(sender);
		}

		if (dryRun) {
			const dryRunRes = await suiClient.devInspectTransactionBlock({
				sender:
					sender ?? "0x7777777777777777777777777777777777777777777777777777777777777777",
				transactionBlock: tx,
			});
			if (dryRunRes.effects.status.status !== "success") {
				throw new Error(`devInspect failed: ${dryRunRes.effects.status.error}`);
			}
			return { digest: "", ...dryRunRes };
		}

		const signedTx = await signTx(tx);

		let resp: SuiTransactionBlockResponse | null = null;
		while (!resp) {
			try {
				resp = await suiClient.executeTransactionBlock({
					transactionBlock: signedTx.bytes,
					signature: signedTx.signature,
					options: txRespOptions,
				});
			} catch (err) {
				// Prevent equivocation by retrying the same tx until it fails definitely.
				// If we were to submit a new tx, we risk locking objects until epoch end.
				const errStr = String(err);
				const errStrLower = errStr.toLowerCase();
				if (
					errStrLower.includes("finality") ||
					errStrLower.includes("timeout") ||
					errStrLower.includes("timed out")
				) {
					await sleep(SLEEP_MS_AFTER_FINALITY_ERROR);
				} else {
					throw err;
				}
			}
		}

		if (resp.effects && resp.effects.status.status !== "success") {
			throw new Error(`transaction failed: ${resp.effects.status.error}`);
		}

		if (!waitForTxOptions) {
			return resp;
		}

		return suiClient.waitForTransaction({
			digest: resp.digest,
			options: txRespOptions,
			...waitForTxOptions,
		});
	};
}

// === sui::transfer module ===

/**
 * Build transactions for the `sui::transfer` module.
 */
export const TransferModule = {
	public_freeze_object(
		tx: Transaction,
		obj_type: string,
		obj: ObjectInput,
	): TransactionResult {
		return tx.moveCall({
			target: "0x2::transfer::public_freeze_object",
			typeArguments: [obj_type],
			arguments: [objectArg(tx, obj)],
		});
	},

	public_share_object(
		tx: Transaction,
		obj_type: string,
		obj: ObjectInput,
	): TransactionResult {
		return tx.moveCall({
			target: "0x2::transfer::public_share_object",
			typeArguments: [obj_type],
			arguments: [objectArg(tx, obj)],
		});
	},

	public_transfer(
		tx: Transaction,
		obj_type: string,
		obj: ObjectInput,
		recipient: string,
	): TransactionResult {
		return tx.moveCall({
			target: "0x2::transfer::public_transfer",
			typeArguments: [obj_type],
			arguments: [objectArg(tx, obj), tx.pure.address(recipient)],
		});
	},
};
