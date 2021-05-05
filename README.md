

<img align="left" width="200" src="https://piersdeseilligny.com/assets/small_Logo5_c9ca125c1a.png">

This is an extension for Visual Studio Code which allows you to write screenplays using the [fountain](https://fountain.io/) syntax quickly and efficiently. [(If you're already confused click here)](https://github.com/piersdeseilligny/betterfountain/blob/master/FAQ.md).

Unlike other screenwriting software (such as Final Draft) BetterFountain focuses on removing friction between you and the text - there's no page breaks, no large unintuitive menus and overlapping windows, no delays when you press "Enter" after having written some dialogue, no slow loading documents, none of that. Just text and a handfull of unintruding features which remove even more friction between the story in your head and a finished screenplay.

And because it's an extension for vscode, you get access to some incredibly advanced features, such as [Real-time collaboration with other screenwriters](https://marketplace.visualstudio.com/items?itemName=MS-vsliveshare.vsliveshare) - Better Fountain is the only free and open-source screenwriting tool which allows you to use such features.


**[Install it here](https://marketplace.visualstudio.com/items?itemName=piersdeseilligny.betterfountain)**

[Sponsor on GitHub ❤](https://github.com/sponsors/piersdeseilligny)

[Discuss on Discord](https://discord.gg/QBm7tKQ)

![Screenshot of BetterFountain in dark mode](https://raw.githubusercontent.com/piersdeseilligny/betterfountain/master/screenshots/Dark_plus.PNG)
https://piersdeseilligny.com/work/software/betterfountain/

## Features

* Full syntax highlighting (even for stuff like lyrics!)
* Smart autocomplete for recurring characters and scenes, as well as title page keys.
* Industry-standard PDF generation
    * Includes scenes and sections as PDF bookmarks, for easy navigation in your reader of choice
    * Possible to highlight any specified characters in the PDF
* Full screenplay outline
    * Includes sections, scenes, notes, and synopses (the visiblity of each type of item being easily and quickly toggleable)
* "Folding" scenes and sections
* Live preview of the formatted screenplay
* Advanced interactive statistics about your screenplay
* Custom font support (Add "Font:" at the top of your .fountain screenplay, with the other title page keys, followed by the name of a font installed on your system)
* Approximation of a screenplay's duration (in the status bar)
* Other cool stuff
    * Go straight to writing dialog after a parenthetical by pressing enter, while the cursor is still inside it
    * Jump to scenes/sections in the .fountain and live preview when clicking on the outline
    * Scroll-sync preview, with active line indication/selection 

![Screenshot of Statistics pages](https://piersdeseilligny.com/assets/Dark_plusstats_ns_2d4ab6dc54.PNG)

## Why?

Writing with fountain lets you focus on the essential. With the addition of autocomplete and syntax highlighting, you have the ultimate clutter-free ultra-fast solution for writing screenplays. And because it's an extension for vscode, it's free and cross-platform, and you get lots of other cool features such as integrated source control and near-infinite extensibility.

## Usage

Just open a `.fountain` file in Visual Studio Code, and everything should work as expected. You can open the live preview and export to PDF by opening the command palette (`Ctrl+Shift+P` or `F1`) and searching for "Fountain".

You can modify various options related to PDF Export in the settings, under "Fountain PDF Export".

And to get an approximate duration of your screenplay, just look at your status bar, in the bottom right corner.

## TODO

Here are some features I would like to add, but don't really have time to right now, in an approximate order of difficulty/priority:

* Fountain cheat sheet panel

* More statistics (a 'Scenes' section, and per-character reports)

* PDF Export panel, with more advanced features presented in a more user-friendly way

* Optionally leaving synopses visible when folding

* Built-in screenplay templates (such as Blake Snyder's beat sheet)

* Import screenplays from PDF files

* Some sort of system that would allow the storage of character information alongside the script


I will probably add these features when I have time, but if you're up for the challenge I'm more than happy to accept your pull requests.

## Thanks / Third-party licenses

* Syntax highlighting works thanks to a modified version of the .tmlanguage file by Jonathan Poritsky for [fountain-sublime-text](https://github.com/poritsky/fountain-sublime-text)

* The live preview uses elements from the [Fountain.js](https://github.com/mattdaly/Fountain.js) library by Matt Daly, covered by the [MIT License](https://github.com/mattdaly/Fountain.js/blob/master/LICENSE.md)

* The fountain parsing and PDF generation feature is based on Piotr Jamróz's [Afterwriting](https://github.com/ifrost/afterwriting-labs), also covered by the [MIT License](https://github.com/ifrost/afterwriting-labs)

* The project includes Kevin Decker's [`jsdiff`](https://github.com/kpdecker/jsdiff) library, covered by the [BSD License](https://raw.githubusercontent.com/kpdecker/jsdiff/master/LICENSE)

* The statistics panel uses [`d3`](https://d3js.org), covered by the [BSD-3-Clause License](https://github.com/d3/d3/blob/master/LICENSE), and [`DataTables`](https://www.datatables.net/), covered by the [MIT License](https://www.datatables.net/license/mit).

* The project was built using Microsoft's [language server example extension](https://github.com/Microsoft/vscode-extension-samples/tree/master/lsp-sample) as a boilerplate.

* The default font used in the preview and in the exported PDF is ["Courier Prime"](https://quoteunquoteapps.com/courierprime/), more specifically [a version](http://dimkanovikov.pro/courierprime/) which adds support for Azerbaijani, Belorussian, Kazakh, Russian, and Ukrainian

## Why visual studio code? I thought this was about screenwriting?

Screenwriting is just about writing text, and Visual Studio Code is a great text editor. You don't need to know anything about programming to use it. Here's what you need to do to get started using BetterFountain:

* [Download and install Visual Studio Code](https://code.visualstudio.com/)

* [Go here and press on install](https://marketplace.visualstudio.com/items?itemName=piersdeseilligny.betterfountain)

* Done. Now you can create a file which finishes with .fountain anywhere you want, open it in vscode, and start writing! It's very easy to write a screenplay with fountain, but [here's a good place to get you started](https://fountain.io/).
