# ADR001: Code Conventions

## Status

Work In Progress

Todo: Use linting tool for checking code conventions.

## Context

The whole codebase should be easy to read. 

## Decision

Each file should look like it was created by one person to make it easier to follow. Defined standards should help
making decision of where code should be added and how it should we written.

Code conventions will be added in separate files, modified accordingly to need. A rule should become a convention if:
* It helps to find the right place to put code

        example: Controllers should be responsible for business logic, hence they should never manipulate DOM
        
* or it makes code more readable

        example: All variables should have meaningful names

* or it helps prevent from bugs

        example: Always add "use strict" to each file

If a rule does not support neither, should not be a convention (e.g. "Always use.forEach instead of for" does not support
any of above)

## Consequences

To make sure rules are follow, as many rules as possible should be linted by a linting tool. Tool should be used in the build
process, i.e. build should fail if conventions are not followed.