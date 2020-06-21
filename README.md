![Screenshot of BetterFountain in dark mode](https://raw.githubusercontent.com/piersdeseilligny/betterfountain/master/screenshots/Dark_plus.PNG)
![Screenshot of BetterFountain with Github Dark theme](https://raw.githubusercontent.com/piersdeseilligny/betterfountain/master/screenshots/Github_dark.PNG)

# Better fountain

This is an extension for Visual Studio Code which allows you to write screenplays using the [fountain](https://fountain.io/) syntax quickly and efficiently. [(If you're already confused click here)](https://github.com/piersdeseilligny/betterfountain/blob/master/FAQ.md).

Unlike other screenwriting software (such as Final Draft) BetterFountain focuses on removing friction between you and the text - there's no page breaks, no large unintuitive menus and overlapping windows, no delays when you press "Enter" after having written some dialogue, no slow loading documents, none of that. Just text and a handfull of unintruding features which remove even more friction between the story in your head and a finished screenplay. 


[Install it here](https://marketplace.visualstudio.com/items?itemName=piersdeseilligny.betterfountain)

[Sponsor on GitHub](https://github.com/sponsors/piersdeseilligny)

## Features

* Full syntax highlighting (even for stuff like lyrics!)
* Smart autocomplete for recurring characters and scenes, as well as title page keys.
* Full screenplay outline, broken down by sections and scenes
* "Folding" scenes
* Live preview of the formatted screenplay
* Exporting the screenplay to a PDF File (including bookmarks for scene sections and headers)
* Custom font support (Add "Font:" at the top of your .fountain screenplay, with the other title page keys, followed by the name of a font installed on your system)
* Approximation of a screenplay's duration (in the status bar)
* Other cool stuff
    * Go straight to writing dialog after a parenthetical by pressing enter, while the cursor is still inside it
    * Jump to scenes/sections in the .fountain and live preview when clicking on the outline
    * Scroll-sync preview, with active line indication/selection 

## Why?

Writing with fountain lets you focus on the essential. With the addition of autocomplete and syntax highlighting, you have the ultimate clutter-free ultra-fast solution for writing screenplays. And because it's an extension for vscode, it's free and cross-platform, and you get lots of other cool features such as integrated source control and near-infinite extensibility.

## Usage

Just open a `.fountain` file in Visual Studio Code, and everything should work as expected. You can open the live preview and export to PDF by opening the command palette (`Ctrl+Shift+P` or `F1`) and searching for "Fountain".

You can modify various options related to PDF Export in the settings, under "Fountain PDF Export".

And to get an approximate duration of your screenplay, just look at your status bar, in the bottom right corner.

## TODO

Here are some features I would like to add, but don't really have time to right now, in an approximate order of difficulty/priority:

* Import screenplays from PDF files

* Built-in screenplay templates (such as Blake Snyder's beat sheet)

* Folding for sections

* Some sort of system that would allow the storage of character information alongside the script


I will probably add these features when I have time, but if you're up for the challenge I'm more than happy to accept your pull requests.

## Thanks / Third-party licenses

* Syntax highlighting works thanks to a modified version of the .tmlanguage file by Jonathan Poritsky for [fountain-sublime-text](https://github.com/poritsky/fountain-sublime-text)

* The live preview uses elements from the [Fountain.js](https://github.com/mattdaly/Fountain.js) library by Matt Daly, covered by the [MIT License](https://github.com/mattdaly/Fountain.js/blob/master/LICENSE.md)

* The fountain parsing and PDF generation feature is based on Piotr Jamróz's [Afterwriting](https://github.com/ifrost/afterwriting-labs), also covered by the [MIT License](https://github.com/ifrost/afterwriting-labs)

* The project was built using Microsoft's [language server example extension](https://github.com/Microsoft/vscode-extension-samples/tree/master/lsp-sample) as a boilerplate.

* The default font used in the preview and in the exported PDF is ["Courier Prime"](https://quoteunquoteapps.com/courierprime/), more specifically [a version](http://dimkanovikov.pro/courierprime/) which adds support for Azerbaijani, Belorussian, Kazakh, Russian, and Ukrainian

## Why visual studio code? I thought this was about screenwriting?

Screenwriting is just about writing text, and Visual Studio Code is a great text editor. You don't need to know anything about programming to use it. Here's what you need to do to get started using BetterFountain:

* [Download and install Visual Studio Code](https://code.visualstudio.com/)

* [Go here and press on install](https://marketplace.visualstudio.com/items?itemName=piersdeseilligny.betterfountain)

* Done. Now you can create a file which finishes with .fountain anywhere you want, open it in vscode, and start writing! It's very easy to write a screenplay with fountain, but [here's a good place to get you started](https://fountain.io/).
