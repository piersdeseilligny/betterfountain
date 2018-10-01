# Better fountain

This is an extension for Visual Studio Code, written in a few hours, which allows you to write screenplays using the [fountain](https://fountain.io/) syntax quickly and efficiently. [(Confused?)](https://github.com/piersdeseilligny/betterfountain#why-visual-studio-code-i-thought-this-was-about-screenwriting)

![Screenshot of BetterFountain](https://i.imgur.com/mNDQMa7.png)

## Features

* Full syntax highlighting (even for stuff like lyrics!)
* Autocompletion for recurring characters and scenes, as well as title page keys.
* "Folding" scenes
* Live preview of the formatted screenplay
* Exporting the screenplay to a PDF File
* Approximation of a screenplay's duration (in the status bar)
* Other cool stuff
    * Go straight to writing dialog after a parenthetical by pressing enter, while the cursor is still inside it


## Why?

Writing with fountain lets you focus on the essential. With the addition of autocomplete and syntax highlighting, you have the ultimate clutter-free ultra-fast solution for writing screenplays. And because it's an extension for vscode, it's free and cross-platform.

## Usage

Just open a `.fountain` file in Visual Studio Code, and everything should work as expected. You can open the live preview and export to PDF by opening the command palette (`Ctrl+Shift+P` or `F1`) and searching for "Fountain".

You can modify various options related to PDF Export in the settings, under "Fountain PDF Export".

And to get an approximate duration of your screenplay, just look at your status bar, in the bottom right corner.

## TODO

Here are some features I would like to add, but don't really have time to right now, in an approximate order of difficulty/priority:

* An outline view and folding for [sections](https://fountain.io/syntax#section-sections)
    * This would be implemented with the following simple logic:
        * Find every act (#), sequence (##), and scene (###) in the document
        * The end of the folding range for each section is whatever comes first between the end of a hierarchly higher one, the next section of the same type, or the end of the document.
        * If ever an explicit scene (starting with INT./EXT.) is split by a section header, then it cannot be folded. The outline shows the second half of the scene as "...<name of scene>"

* A fountain view container in the sidebar, with the following views:
    * **Outline** as specified above
    * **Cheat sheet** for the more advanced features of the fountain syntax
    * **Stats** about the screenplay, such as the page count, the approximate duration in minutes, but also how fast the scenes switch throughout it, and how long has been spent thinking vs. writing, etc... Some of these could also go in the status bar.

* Built-in screenplay templates (such as Blake Snyder's beat sheet)

* Internally representing the character names and scenes as symbols, rather than using a naive regex approach (enabling stuff such as info on hover)

* More and smarter auto-complete, for stuff like the times of day in scene headers, transitions, etc...

* Buttons for zooming in and out of the screenplay preview (and also with [hammer.js](https://github.com/hammerjs/hammer.js
)?)

* Some sort of system that would allow the storage of character information alongside the script

* Synchronized scrolling of the live preview with the markup.

I will probably add these features when I have time, but if you're up for the challenge I'm more than happy to accept your pull requests.

## Thanks / Third-party licenses

* Syntax highlighting works thanks to a modified version of the .tmlanguage file by Jonathan Poritsky for [fountain-sublime-text](https://github.com/poritsky/fountain-sublime-text)

* The live preview uses the [Fountain.js](https://github.com/mattdaly/Fountain.js) library by Matt Daly, covered by the [MIT License](https://github.com/mattdaly/Fountain.js/blob/master/LICENSE.md)

* The Export to PDF feature is provided by Piotr Jamróz's [Afterwriting CLI tool](https://github.com/ifrost/afterwriting-labs), also covered by the [MIT License](https://github.com/ifrost/afterwriting-labs)

* The project was built using Microsoft's [language server example extension](https://github.com/Microsoft/vscode-extension-samples/tree/master/lsp-sample) as a boilerplate.

## Why visual studio code? I thought this was about screenwriting?

Screenwriting is just about writing text, and Visual Studio Code is a great text editor. You don't need to know anything about programming to use it. Here's what you need to do to get started using BetterFountain:

* [Download and install Visual Studio Code](https://code.visualstudio.com/)

* [Go here and press on install](https://marketplace.visualstudio.com/items?itemName=piersdeseilligny.betterfountain)

* Done. Now you can create a file which finishes with .fountain anywhere you want, open it in vscode, and start writing! It's very easy to write a screenplay with fountain, but [here's a good place to get you started](https://fountain.io/).
