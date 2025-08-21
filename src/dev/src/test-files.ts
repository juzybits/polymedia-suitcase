import {
	type ParseLine,
	readCsvFile,
	readTsvFile,
	writeCsvFile,
	writeTsvFile,
} from "@polymedia/suitcase-node";

const inputData = [
	["r0c0", 'r0"c1', "r0\nc2"],
	["r1\tc0", "r1,c1", "r1c2"],
	["r2c0", "r2c1", "r2c2"],
];
type DataLine = [string, string, string];
const parseLine: ParseLine<DataLine> = (values) => [values[0], values[1], values[2]];

const csvFile = "test.csv";
writeCsvFile(csvFile, inputData);
const csvData = readCsvFile(csvFile, parseLine);
console.log(csvData);

const tsvFile = "test.tsv";
writeTsvFile(tsvFile, inputData);
const tsvData = readTsvFile(tsvFile, parseLine);
console.log(tsvData);
