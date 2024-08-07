import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ===== Generic file functions =====

/**
 * Check if a file exists in the filesystem.
 */
export function fileExists(filename: string): boolean {
    try {
        fs.accessSync(filename);
        return true;
    } catch (_err) {
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
 * Write a string into a file.
 */
function writeTextFile(filename: string, contents: string): void {
    fs.writeFileSync(
        filename,
        contents + "\n"
    );
}

// ===== JSON files =====

/**
 * Write an object's JSON representation into a file.
 */
export function writeJsonFile(filename: string, contents: unknown): void {
    writeTextFile(
        filename,
        JSON.stringify(contents, null, 4)
    );
}

/**
 * Read a JSON file and parse its contents into an object.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function readJsonFile<T>(filename: string): T {
    const fileContent = fs.readFileSync(filename, "utf8");
    const jsonData = JSON.parse(fileContent) as T;
    return jsonData;
}

// ===== TSV files =====

/**
 * Write objects into a TSV file.
 */
export function writeTsvFile(
    filename: string,
    data: unknown[][],
): void {
    writeDsvFile(filename, data, "\t");
}

/**
 * Read a TSV file and parse each line into an object.
 */
export function readTsvFile<T>(
    filename: string,
    parseLine: ParseLine<T>,
    reverse = false,
): T[] {
    return readDsvFile(filename, parseLine, "\t", reverse);
}

// ===== CSV files =====

/**
 * Write objects into a CSV file.
 * It won't work correctly if the input data contains commas.
 * Better use `writeTsvFile()`.
 */
export function writeCsvFile(
    filename: string,
    data: unknown[][],
): void {
    writeDsvFile(filename, data, ",");
}

/**
 * Read a CSV file and parse each line into an object.
 */
export function readCsvFile<T>(
    filename: string,
    parseLine: ParseLine<T>,
    reverse = false,
): T[] {
    return readDsvFile(filename, parseLine, ",", reverse);
}

// ===== DSV files (https://en.wikipedia.org/wiki/Delimiter-separated_values) =====

/**
 * A generic function to transform a CSV/TSV line into an object.
 */
export type ParseLine<T> = (values: string[]) => T | null;

/**
 * Write objects into a DSV file.
 */
function writeDsvFile(
    filename: string,
    data: unknown[][],
    delimiter: string,
): void {
    const rows = data.map(line =>
        makeDsvLine(Object.values(line), delimiter)
    );
    writeTextFile(
        filename,
        rows.join("\n"),
    );
}

/**
 * Read a DSV file and parse each line into an object.
 */
function readDsvFile<T>(
    filename: string,
    parseLine: ParseLine<T>,
    delimiter: string,
    reverse = false,
): T[] {
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
            continue;
        }

        // Split the line by the delimiter and remove quotes from each value
        const values = splitDsvLine(trimmedLine, delimiter);
        const parsedLine = parseLine(values);
        if (parsedLine !== null) {
            results.push(parsedLine);
        }
    }

    return results;
}

function makeDsvLine(values: unknown[], delimiter: string): string {
    return values.map(escapeDsvString).join(delimiter);
}

function splitDsvLine(line: string, delimiter: string): string[] {
    const values = line.split(delimiter);
    return values.map(value => unescapeDsvString(value));
}

function escapeDsvString(value: unknown): string {
    return `"${String(value)
        .replace(/"/g, '""')      // escape double quotes by doubling them
        .replace(/\t/g, " ")      // replace tabs with a space
        .replace(/(\r\n|\n|\r)/g, " ")}"`;  // replace newlines with a space
}

function unescapeDsvString(value: string): string {
    // Remove surrounding quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
    }
    // Unescape double quotes
    value = value.replace(/""/g, '"');

    // Return the processed string
    return value;
}
