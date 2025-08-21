import type { Config } from "@jest/types";
import baseConfig from "./jest.config.base";

const config: Config.InitialOptions = {
	...baseConfig,
	projects: ["<rootDir>/src/*"],
	verbose: true,
};

export default config;
