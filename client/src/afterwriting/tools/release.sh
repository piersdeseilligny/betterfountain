#!/bin/bash

# Script performs tagging and releasing to gh-pages

# setup git
echo "configure git"
git config --global push.default simple
git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
git config credential.helper "store --file=.git/credentials"
echo "https://${GITHUB_API_KEY}:@github.com" > .git/credentials

message=$(git log -1 --pretty=%B)
echo "Last message: $message"

if [[ $message =~ "[major]" ]]; then
  version="major"
fi

if [[ $message =~ "[minor]" ]]; then
  version="minor"
fi

if [[ $message =~ "[patch]" ]]; then
  version="patch"
fi

if [[ $version ]]; then
  echo "Versioning $version"
  npm version $version -m "v%s"
  echo "Flagging for NPM deployment"
  mkdir -p tmp/flags
  touch tmp/flags/npm
else
  echo "Not flagged for NPM deployment"
fi

if [[ $message =~ "[gh-pages]" ]]; then
  echo "Flagging for GitHub Pages deployment"
  mkdir -p tmp/flags
  touch tmp/flags/gh-pages
else
  echo "Not flagged for GitHub Pages deployment"
fi