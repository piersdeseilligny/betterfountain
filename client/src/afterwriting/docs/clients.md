Afterwriting Command Line Interface
===================================

Afterwriting CLI is a command line tool that lets you generate PDF from your fountain script using node.js.

Requirements
------------

Afterwriting CLI requires node.js. To install it, follow instructions on [node.js website](http://nodejs.org/).

Installation
------------

**Using npm:**

    > npm install afterwriting -g
    > afterwriting --help

**From sources:**

Download project sources - https://github.com/ifrost/afterwriting-labs/releases/latest. Extract all files and open a terminal window:

    > cd afterwriting-labs
    > npm install
    > node awc.js --help

Usage
-----

**Basics:**

    > node awc.js --source my_draft.fountain --pdf screenplay.pdf


This command will convert a script in *my_draft.fountain* file into a PDF and (and save it as *screenplay.pdf*).

If the only difference in file names is the extension, you can simply write:

    > node awc.js --source screenplay.fountain --pdf
    
**Force overwriting:**
    
The script will prompt you for confirmation if the PDF file already exists. If you want to always overwrite existing files, pass --overwrite option:

    > node awc.js --source screenplay.fountain --pdf --overwrite
    
**Configuration:**
    
If you need to customize your PDF you can pass a config file:

    > node awc.js --source screenplay.fountain --pdf --config config.json

Config file
-----------

The output can be customized using configuration file passed as --config parameter. Config should be a JSON with this structure:

	{
		"embolden_scene_headers": false,
		"show_page_numbers": true,
		"split_dialogue": true,
		"print_title_page": true,
		"print_profile": "a4",
		"double_space_between_scenes": false,
		"print_sections": false,
		"print_synopsis": false,
		"print_actions": true,
		"print_headers": true,
		"print_dialogues": true,
		"number_sections": false,
		"use_dual_dialogue": true,
		"print_notes": false,
		"print_header": "",
		"print_footer": "",
		"print_watermark": "",
		"scenes_numbers": "none",
		"each_scene_on_new_page": false
	}

Available options:

| Option        | Value           | Description |
| ------------- |:-------------:| -----|
| embolden_scene_headers     | true/false | - |
| show_page_numbers      | true/false      | - |
| split_dialogue | true/false      | whether to split dialogue between pages or not |
| print_title_page | true/false | - |
| print_profile | "a4"/"usletter" | paper size |
| double_space_between_scenes | true/false | - |
| print_sections | true/false | print sections (marked with #) |
| print_synopsis | true/false | print synopsis (market with =) |
| print_actions | true/false | print action blocks |
| print_headers | true/false | print scene headers |
| print_dialogues | true/false | print dialogues |
| number_sections | true/false | auto-numbering sections |
| use_dual_dialogue | true/false | print dual dialogue in two columns |
| print_notes | true/false | print notes |
| print_header | string | a text to put on the top of the page |
| print_footer | string | a text to put on the bottom of the page |
| print_watermark | string | watermark text |
| scenes_numbers | "none"/"left"/"right"/"both" | side of auto-numbering scenes |
| each_scene_on_new_page | true/false | break page after a scene |

Snippets
---------

In your config file you can add reusable snippets. Each time you use a snippet in your script it will be replaced with a specified text. It might be useful if you are not sure about names for your characters. Example:

The config file:

	{
		"embolden_scene_headers": false,
		...
		"each_scene_on_new_page": false,
		"snippets": {
			"protagonist": "$bond.last",
			"antagonist": "Dr. Julius No",
			"location": "room",
			"bond": {			
				"first": "James",
				"last": "Bond",
				"name": "$bond.first $bond.last"
			}
		}
	}

The script:

    INT. $LOCATION - DAY
    
    $PROTAGONIST enters the $location. $Antagonist attacks him.
    
    $ANTAGONIST
    Aaaaa!
    
    $Protagonists kills $Antagonist.
    
    $BOND.LAST
    My name is $bond.last, $bond.name.


The output:

    INT. ROOM - DAY

    BOND enters the room. Dr. Julius No attacks him.
    
    DR. JULIUS NO
    Aaaaa!
    
    James Bond kills Dr. Julius No.
    
    BOND
    My name is Bond, James Bond.
    
    
The simplest way of using snippets is by defining corresponding text:

    "snippets": {
        "protagonist": "Bond",
        "antagonist": "Dr. Julius No"
    }
    
To use your snippet in the script just simply put a $ sign before it. There are three ways of injecting a snippet:

* $snippet - snippet injected as defined in the conifg
* $SNIPPET - upper cased snippet
* $Snippet - capitalized snippet

You can nest snippets:

    "snippets": {
        "name": "$first $last",
        "first": "John",
        "last": "Doe"
    }

If you need to organize your snippets you can put them in a hierachy:

    "snippets": {
    "bond": {
        "first": "James",
        "last": "Bond",
        "name": "$bond.first $bond.last"
        }
    }
    
That hierachy will be converted to a flat list of snippets equivalent to:

    "snippets": {
        "bond.name": "James Bond",
        "bond.first": "James",
        "bond.last": "Bond"
    }


Custom fonts:
-------------
    
Custom fonts may be passed via a json file of the correct structure along with a matching value in the font_family property of your config map.

    > node awc.js --source screenplay.fountain --pdf --config config.json --fonts myFonts.json

**config.json**

    {
		font_family: "MyFont"
	}

**myFonts.json** (multiple font profiles may be specified)

    {
      "MyFont":
      {
        "normal":
        {
          "src": "<base64 encodeded ttf>"
          "family": "MyFont"
        },
        "bold":
        {
          "src": "<base64 encodeded ttf>"
          "family": "MyFont-Bold"
        },
        "bolditalic":
        {
          "src": "<base64 encodeded ttf>"
          "family": "MyFont-BoldOblique"
        },
        "italic":
        {
          "src": "<base64 encodeded ttf>"
          "family": "MyFont-Oblique"
        }
      }
    }

Note: Monospaced fonts are recommended.  It is not guaranteed that all fonts will render equally well due to differences is character height and width, so please test your configuration prior to distribution or printing.


Known issues
------------

* converting directly from the .fdx files doesn't work (use web based app to convert from FinalDraft)
