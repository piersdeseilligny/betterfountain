#!/bin/sh

# ./version.sh path|minor|major

npm version $1 -m "Create new version: %s [skip ci]"
