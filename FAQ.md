# What is "Fountain"?

I'm not going to do a good job at explaining it, so just [look at this page](https://fountain.io/faq).

# So what is "Better fountain"?

"Better fountain" is an extension for a really popular text editor (visual studio code) which makes it even easier and faster to write screenplays with the fountain syntax.

# Getting started

Here are a few super simple steps to get started:

1. [Download and install Visual Studio Code](https://code.visualstudio.com/).

2. [Go here and click on install.](https://marketplace.visualstudio.com/items?itemName=piersdeseilligny.betterfountain)

3. That's it! Now you can create a new file which finishes with the ".fountain" file extension (to do this in visual studio code, go to `File`>`New File` and then `File`>`Save as`).


# Tips

* Everything in visual studio code is done through the "command palette" which you can bring up by clicking on `View`>`Command Palette` or by pressing on the F1 key.

* Here are some useful commands:
  * "Fountain: Show Screenplay Live Preview": Show a preview of what the printed script would look like, in real-time.
  * "Fountain: Export Screenplay PDF": Export your screenplay to a pdf file.
  * "Fold all" > Folds all the scenes so that you can only see the header. "Unfold all" does the contrary.

* If you want to know how long your screenplay is (very approximately) just look in the bottom right corner. See the "00:00:00" next to the Line and Column positions? That's more or less the length of your screenplay (in hours:minutes:seconds).

* For imitation of a Typewriter mode you can add below code to `settings.json` file (`File`>`Preferences`>`Settings`):
```json
"[fountain]": {
    "editor.wordWrapColumn": 57,   
    "editor.wordWrap": "wordWrapColumn",
    "editor.quickSuggestions": false,
    "editor.lineNumbers": "off",
    "editor.folding": true,
    "editor.glyphMargin": true,
}
```
and run `View`>`Appearance`>`Centered Layout`

* By default, Visual Studio Code's suggestion system pre-selects the most recently suggested selection instead of the first suggestion. In order to make the most out of betterfountain's character suggestion feature, add the following line to the `settings.json` file (`Ctrl/Cmd+Shift+P` or `F1`, *Open Settings (JSON)*):
```json
    "[fountain]": {
        "editor.suggestSelection": "first"
    }
```
