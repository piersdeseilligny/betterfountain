# ADR003: Simplify Release Process

## Status

Approved on 29/10/2017

## Context

TravisCI is currently used for building feature branches, pull requests and releases.

The way releases, however, are performed is a bit convoluted and not flexible. By default minor version is updated
and it's not clear how to do a major or patch release. Due to the way TravisCI builds feature branches vs pull requests
it requires hacks in travis config.

## Decision

Solution implemented in https://github.com/ifrost/starterkit have worked quite well so far. It's based on adding
labels to commit messages when merging a pull request to master.

It's way easier to do major/minor/patch or hotfix release and publish to npm separately.

## Consequences

Extra commit labels obscure commit messages and couples releasing with VCS. Anyway it's a little step forward to clean
up the current process and make it more flexible.

