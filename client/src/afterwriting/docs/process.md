# Development Process

* Semver is used for versionon
* `master` represents the latest state of the app
* features should be implemented on feature branches `feature/*`
* releases are managed by adding flags to commit messages
* hotfixes to previous version are implemented on `hotfix/X.Y` branches (X.Y is major+minor version)

## Development

* Develop features on `feature/*` branches
* Each feature branch is built by Travis (tests + coverage)
* Create a Pull Request
* Merge the Pull Request adding CI flags (see below)

## Release (npm, gh-pages)

* When merging a Pull Request add following flags to message commit:
  * `[patch]` - to increment patch version (e.g. 1.1.1 -> 1.1.2) and publish to NPM
  * `[minor]` - to increment minor version (e.g. 1.1.1 -> 1.2.0) and publish to NPM
  * `[major]` - to increment major version (e.eg 1.1.1 -> 2.0.0) and publish to NPM
  * `[gh-pages]` - to deploy to gh-pages
* To release current master version add an empty commit with tags, e.g.
  * `git commit --allow-empty -m "Release [patch] [gh-pages]"`
* Add release notes to https://github.com/ifrost/afterwriting-labs/tags:
  * Title: vX.X.X (DD/MM/YYYY)
  * Add short description and list of changes from Travis logs

## Hotfixes

Master represents the latest version of the app. If you need to apply a hotfix for older version, e.g. latest version is 2.0.0 and you need a hotfix for 1.4.0:

  * Change .travis.yml config to allow running deployment scripts on all branches (on: all_branches: true)
  * Create a hotfix branch, e.g. `hotfix/1.4`
  * Create a feature branch for the fix
  * Create a Pull Request to merge `feature/*` to `hotfix/1.4`
  * Merge the Pull Request adding `[patch]` tag in the commit message
  * Alternatively you can commit your changes straight to hotfix/* and add `[patch]` tag