import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Check if a file exists in the filesystem.
 */
export function fileExists(filename: string): boolean {
    try {
        fs.accessSync(filename);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Extract the file name from a module URL, without path or extension.
 */
export function getFileName(importMetaUrl: string): string {
    const __filename = fileURLToPath(importMetaUrl);
    return path.basename(__filename, path.extname(__filename));
}

/**
 * A generic function to transform a CSV line into an object.
 */
export type ParseCsvLine<T> = (values: string[]) => T | null;

/**
 * Read a CSV file and parse each line into an object.
 */
export function readCsvFile<T>(filename: string, parseLine: ParseCsvLine<T>, reverse = false): T[] {
    const results: T[] = [];
    const fileContent = fs.readFileSync(filename, "utf8");

    // Split the content into lines and optionally reverse the array
    let lines = fileContent.split("\n");
    if (reverse) {
        lines = lines.reverse();
    }

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
            // console.log('[readCsvFile] Skipping empty line');
            continue;
        }

        // Split the line by commas and remove quotes from each value
        const values = trimmedLine.split(",").map(value =>
            value.replace(/^"|"$/g, "").replace(/\\"/g, '"').trim()
        );
        const parsedLine = parseLine(values);
        if (parsedLine !== null) {
            results.push(parsedLine);
        }
    }

    return results;
}

/**
 * Read a JSON file and parse its contents into an object.
 */
export function readJsonFile<T>(filename: string): T {
    const fileContent = fs.readFileSync(filename, "utf8");
    const jsonData: T = JSON.parse(fileContent);
    return jsonData;
}

/**
 * Write objects into a CSV file.
 *
 * Note that this is not a generic CSV writing solution and it will break if the input
 * CSV data contains commas or newlines.
 */
export function writeCsvFile(filename: string, data: any[][]): void {
    const csvRows = data.map(row => {
        return row.map(value => {
            const escapedValue = ("" + String(value)).replace(/"/g, '\\"');
            return `"${escapedValue}"`;
        }).join(",");
    });

    writeTextFile(
        filename,
        csvRows.join("\n")
    );
}

/**
 * Write an object's JSON representation into a file.
 */
export function writeJsonFile(filename: string, contents: any): void {
    writeTextFile(
        filename,
        JSON.stringify(contents, null, 4)
    );
}

/**
 * Write a string into a file.
 */
export function writeTextFile(filename: string, contents: string): void {
    fs.writeFileSync(
        filename,
        contents + "\n"
    );
}
