import { createInterface } from "readline";

/**
 * Parse command line arguments and show usage instructions.
 */
export function parseArguments(
    expectedArgs: number,
    usageMessage: string
): string[] | null {
    const args = process.argv.slice(2); // skip `node` and the script name
    if (args.length !== expectedArgs || args.includes("-h") || args.includes("--help")) {
        console.log(usageMessage);
        return null;
    }
    return args;
}

/**
 * Display a query to the user and wait for their input. Return true if the user enters `y`.
 */
export async function promptUser(question: string): Promise<boolean> {
    return new Promise((resolve) => {
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === "y");
        });
    });
}
