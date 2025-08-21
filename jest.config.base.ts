import type { Config } from "@jest/types";

const baseConfig: Config.InitialOptions = {
	preset: "ts-jest",
	testEnvironment: "node",
	moduleFileExtensions: ["ts", "js", "json", "node"],
	testMatch: ["**/__tests__/**/*.test.ts"],
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.js$": "$1",
	},
	// verbose: true, // 'Validation Warning: Unknown option "verbose" with value true was found.'
};

export default baseConfig;
