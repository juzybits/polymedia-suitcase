#!/usr/bin/env bash

set -o nounset      # Treat unset variables as an error when substituting
set -o errexit      # Exit immediately if any command returns a non-zero status
set -o pipefail     # Prevent errors in a pipeline from being masked
set -o xtrace       # Print each command to the terminal before execution

SCRIPT_DIR="$( dirname "$(readlink -f "${BASH_SOURCE[0]}")" )"
PATH_PROJECT="$( cd "$SCRIPT_DIR/../.." && pwd )"

REACT_VERSION="^18.0.0"

cd $PATH_PROJECT
pnpm up --latest --recursive
pnpm up --latest -w

cd $PATH_PROJECT/src/react
pnpm add -D @types/react@$REACT_VERSION

cd $PATH_PROJECT
pnpm up --recursive
pnpm up -w
