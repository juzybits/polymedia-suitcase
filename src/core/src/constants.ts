/**
 * The maximum value for a 64-bit unsigned integer.
 */
export const MAX_U64 = 18446744073709551615n;

/**
 * The normalized 0x0 address (0x000…000)
 */
export const NORMALIZED_0x0_ADDRESS = "0x0000000000000000000000000000000000000000000000000000000000000000";

/**
 * The normalized SUI type (0x000…002::sui::SUI)
 */
export const NORMALIZED_SUI_TYPE = "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI";

/**
 * Match a Sui address.
 */
export const REGEX_ADDRESS = "0[xX][0-9a-fA-F]{1,64}";

/**
 * Match a normalized Sui address.
 */
export const REGEX_ADDRESS_NORMALIZED = "0[xX][a-fA-F0-9]{64}";

/**
 * Match a Sui module name.
 */
export const REGEX_MODULE_NAME = "[A-Za-z][A-Za-z0-9_]*";

/**
 * Match a Sui struct name.
 */
export const REGEX_STRUCT_NAME = "[A-Z][a-zA-Z0-9_]*";

/**
 * Match a Sui type without generic parameters (e.g. `0x123::module::Struct`).
 */
export const REGEX_TYPE_BASIC = `${REGEX_ADDRESS}::${REGEX_MODULE_NAME}::${REGEX_STRUCT_NAME}`;

/**
 * Maximum number of results returned by a single Sui RPC request.
 * (see sui/crates/sui-json-rpc-api/src/lib.rs)
 */
export const RPC_QUERY_MAX_RESULTS = 50;
