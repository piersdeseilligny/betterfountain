# Code Conventions - Work in Progress

## Naming conventions

* Folder names and files as singular, use dash to separate words in file name:

        js/plugin/editor/controller/editor-controller.js

* Use .test suffix for test files:

        test/unit/plugin/editor/controller/editor-controller.test.js

* camelCase for naming objects, functions, properties, Prototypes with capital letter, instances with lowercase letter:

        function myFunction() {};
         
        var FooBar = Protoplast.extend({
            myProperty: 1
        });
        
        var fooBar = FooBar.create();
        
* Use 4 spaces for indentation.

## Tests

* Acceptance/Integration/Unit tests names: `GIVEN something AND something WHEN something happens AND something else happens THEN something happens AND something else happens`
    * It prevents from writing sloppy descriptions and help to make clear what and how is tested. 
    * What is more, if one sees the description that is too complex it may be a sign that too many things are tested and test should be split.
    * It's not important to list all GIVEN, WHEN, THEN - only these that are crucial. Especially GIVEN section may be omitted if WHEN section clearly identifies GIVEN section (e.g. GIVEN the button WHEN the button is clicked...)
    * For multi WHEN-THEN tests: GIVEN aaa WHEN bbb THEN ccc AND WHEN ddd THEN eee

* Assertions should be as generic as possible

* Each bug needs to have a regression acceptance test

