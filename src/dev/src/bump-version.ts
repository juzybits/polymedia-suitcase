/**
 * Increments the patch version in each package.json: from 0.0.[N] to 0.0.[N+1]
 *
 * Usage:
 *   node src/dev/bump-version.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current file
const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

// Paths to the package.json files relative to the script
const packagePaths = [
    path.resolve(currentDir, "../../core/package.json"),
    path.resolve(currentDir, "../../node/package.json"),
    path.resolve(currentDir, "../../react/package.json")
];

// Increment the version number from 0.0.[N] to 0.0.[N+1]
function incrementVersion(version: string) {
    const versionParts = version.split(".");
    const patchNumber = parseInt(versionParts[2]);
    versionParts[2] = (patchNumber + 1).toString();
    return versionParts.join(".");
}

// Function to increment the version number in a given package.json file
function bumpVersion(packageJsonPath: string) {
    try {
        // Read and parse the package.json file
        const packageJson = fs.readFileSync(packageJsonPath, "utf8");
        const packageData = JSON.parse(packageJson) as { version: string };

        // Increment and replace the version
        const newVersion = incrementVersion(packageData.version);
        packageData.version = newVersion;

        // Write the updated package.json
        const newFileContent = JSON.stringify(packageData, null, 4) + "\n";
        fs.writeFileSync(packageJsonPath, newFileContent, "utf8");

        console.log(`Version bumped to ${newVersion} for ${path.basename(path.dirname(packageJsonPath))}`);
    } catch (err) {
        console.error(`Error reading or writing file at ${packageJsonPath}:`, err);
    }
}

// Increment version for all package.json files
packagePaths.forEach(bumpVersion);
