#!/bin/sh

set -e

CWD="$(pwd)"
cd "$(dirname $0)"

npm version ${1:-patch} -m "release version %s"
npm publish --access=public

cd "$CWD"
