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
