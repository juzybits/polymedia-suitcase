import { getFileName, parseArguments, setupSuiTransaction } from '@polymedia/commando';
import { devInspectAndGetReturnValues } from '@polymedia/suits';

const usage = `Test @polymedia/suits devInspectAndGetReturnValues()

Usage:
  pnpm ${getFileName(import.meta.url)} PACKAGE_ID

  PACKAGE_ID    The PolymediaSuitsDev package ID
`;

async function main()
{
    /* Read command arguments */

    const args = parseArguments(1, usage);
    if (!args) return;
    const [ PACKAGE_ID ] = args;

    const { suiClient, txb } = setupSuiTransaction();
    txb.moveCall({ target: `${PACKAGE_ID}::dev::get_vector_u64` });
    txb.moveCall({ target: `${PACKAGE_ID}::dev::get_string` });
    txb.moveCall({ target: `${PACKAGE_ID}::dev::get_vector_string` });
    const returnValues = await devInspectAndGetReturnValues(suiClient, txb);
    console.log(returnValues);
}

void main();
