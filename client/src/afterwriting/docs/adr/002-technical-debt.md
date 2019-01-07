# ADR002: Dealing with Technical Debt

## Status

Approved on 17/02/2017

## Context

Technical Debt is something that emerges as trade-off between short-term benefits and long-term value. It's OK to have
Technical Debt as long as it measurable and manageable. At any point of time it should be possible to say how big the
debt is, what parts of code are affected and how critical the debt is. It's required to help to plan and to estimate
new features.

## Decision

A little twist will be added to old good TODOs that all developers hate. Here it goes:
    * When debt is identified a TODO note is added to file/function/code fragment depending on the scope;
    * Debt Markers are added to the description (a debt marker is "+");
    * Each time code is modified, the related debt should be:
        * paid by fixing TODO,
        * or increased by adding another Debt Marker;
    * Debt cannot be greater than 5 ("+++++"). When debt reaches 5, no code can be modified before fixing the TODO;
    * If debt for a code fragment is increased, the debt for the function and file also increases;

It should assure that Technical Debt is tracked. In places of code that is not used frequently, debt will not increase too
often. There's no need to pay the debt for unused code.

If code, file, function is used frequently, any related debt should be dealt with quickly. Debt markers will make sure
each time code in debt is used, the debt increases, forcing to pay it sooner.

In cases of critical debt, a TODO note can be created with more than one initial Debt Marker.

Every TODO must have at least one Debt Marker.

Example todo note:

        /**
         * TODO: Improve performance from O(n^2) to O(n). (+++)
         */
        function foo() {
           // ...
        }

If a TODO has multiple lines, Debt Markets must be added at the same line to make it easier to parse. Markers can be placed
at the beginning, e.g.:

        // TODO: (++) Move method to presentation controller
        // and add unit tests.
        foo: function() {
            ...
        }

## Consequences

It should be possible to measure how big the debt is and how critical is to solve it by adding up Debt Markers. The problem
might be to make sure the rule is followed (a git hook can be useful, but cannot be forced).

