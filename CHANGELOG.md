**If you like BetterFountain, please consider [sponsoring me on GitHub](https://github.com/sponsors/piersdeseilligny). I spend a lot of energy on this project, and any contribution would mean the world to me**

## **1.13.0** - *2024-02-18*
    + Add character and location outline panels (Thanks Christoph Daxerer, @DrChristophFH !)
    · Fix stuttery scrolling behaviour of the live preview when typing on the last line of a document
    · Fix custom "continued" text being ignored (Thanks @mig42!)
    · Fix bold+italic text in live preview, and improve styling (Thanks Bernd Busse, @tryone144 !)
    
## **1.12.0** - *2023-02-17*
    + Add PDF Preview
    + Add location statistics (Thanks Oliver Paraskos!)
    · Remove "jumpto" from command palette (as it's for internal use only)
    · Change default live preview texture from "paper" to "vscode" (Thanks @geueds!)
    · Change default location of scene numbers from "none" to "both" (Thanks @geueds!)


## **1.11.0** - *2022-07-23*
    + Add cheatsheet to extension sidebar (Thanks @prasy-loyola for the PR!)
    + Add setting to enable bold character names (Fix #165)
    · Fix #169 (broken number scenes overwrite command)
    · Fix #162 (scene autocomplete broken)

## **1.10.0** - *2022-03-06*
    + Add statistics for scenes (currently, barcode chart for int/ext and time of day - more to come!)
    + Add "Header:" and "Footer:" title page keys, which will apply to all pages (except the title page) (Issue #156)
    · Fix #158: notes in the document root (outside of sections or scenes) being included in overall duration stats
    · Fix notes with page breaks being syntax-highlighted even though they aren't parsed

## **1.9.2** - *2022-01-25*
    · Fix enabled "Each scene on new page" breaking PDF Export
    · Fix multiple inline notes parsing incorrectly

## **1.9.1** - *2022-01-09*
    + Add icons to commands in the Fountain panel
    · Reduce left margin on exported title page from 1.5" to 1" (equal to the right margin)
    · Fix page cropping on live preview
    · Fix title page on exported HTML

## **1.9.0** - *2022-01-02*
*Unfortunately, this should have been an even bigger update, but the PDF Rendering system needs to be completely redesigned: In it's current state, it is repeatedly a roadblock for new features. This is a lot of work, and may take some time...*

    + Title page revamp:
        + Add new title page keys: TL (Top-Left), TC (Top-Center), TR (Top-Right), CC (Center), BL (Bottom-Left) and BR (Bottom-Right)
        + Support markdown-style links on the title page [Formatted as such](https://github.com/)
        · Title page elements can no longer overlap on the PDF, and they are now consistent with the live preview.
        · Improve autocomplete for title pages keys (more detailed, and inclusion of where an element will be positioned on the page)
        
    · "SUPERIMPOSE:" is no longer parsed as a character
    · Fix tabs being a different width than 4 spaces
    · Prevent long dual-dialogue from breaking the PDF Layout.


## **1.8.11** - *2021-12-12*
    · Fix Failed PDF Exports when the first section is deeper than subsequent ones (eg if the first section is ###abc and subsequent ones are ##xyz)
        NOTE: In the above case, chapter navigation will still be inaccurate. Please make sure to nest sections correctly (# > ## > ### > etc).
    · Improvements to outline structure when sections are incorrectly nested.

## **1.8.10** - *2021-11-08*
    · Improve syntax highlighting and live preview of scene headers (now supports more special characters and underlined/bold text within headers)
    · Update extension icon

## **1.8.9** - *2021-09-22*
    · Register completion/folding/symbol providers on any file scheme (including virtual file systems)

## **1.8.7/8** - *2021-08-30*
    + Minor compatibility fixes for "Export to HTML" feature

## **1.8.6** - *2021-08-29*
    + Add "Export to HTML" feature

## **1.8.5** - *2021-06-20*
    · Support untrusted workspaces
    · Fixed all-cap notes (such as [[TEST]]) being interpreted as character names

## **1.8.4** - *2021-05-02*
    + Significant UX improvement to toggling the visibility of items in the outline
    + Scenes and sections can now be shown/hidden from the outline
    · Improved the printing of lines with only a note in them. An empty line above or below
      the note (or both) will be reduced to a single empty line, rather than three empty lines.
    · Fix the positionining in the outline of notes and synopses between a section and a scene
    · Support 'Contact info' and 'Revision' title page keys - Thanks @kortina for the PR!

## **1.8.3** - *2021-02-25*
    · Fix Issue #100 (Dual dialogue is no longer broken if it is disabled in the settings)
    + Support "CONTINUED" on scenes split by a page break (disabled setting by default) - Thanks @wallforfry for the PR!
    + Shift scenes up or down with Ctrl+↑ or Ctrl+↓ - Thanks @daryluren for the PR!

## **1.8.2** - *2021-02-07*
    · (Maybe?) Fix Issue #114
    · Prevent characters from starting with '#' or '!' - Thanks @daryluren for the PR!

## **1.8.1** - *2021-01-23*
    · Fix spacing around centred text displaying incorrectly in the live preview (Bug #108)

## **1.8.0** - *2021-01-15*
    + Entirely rewritten statistics panel
        + Now split into different sections (for the moment, 'Overview' and 'Characters' - more will come)
        + Advanced line charts which interact with the text editor. The editor's caret position and selection
          update in real-time, and can be changed by dragging a selection and clicking on 'Select in Editor',
          or by double-clicking in the chart.
        + New character table with more columns, which are all searchable, sortable, and toggleable.
        + Runtime summary, which specifies the proportion of action to dialogue.
        + New metrics:
            + Pages (of the screenplay, with remainder in eights of a page, and actual printed pages)
            + Scenes
            + Words/Lines/Characters
            + Monologues (any dialogue lines over 30sec long)
            + Complexity (average of various readability tests)
        + New charts
            + Cumulative Action and Dialogue runtime
            + Cumulative dialogue runtime (by character)
    · Refactor outline calculation, to fix Bug #96 - Thanks @daryluren for the PR!



## **1.7.2** - *2020-12-15*
    + Fix outline always showing scenes as open (Issue #96) and add "minimise all" and "reveal" buttons to the outline view - Thanks @daryluren for the PR!
    + Add 'Debug parsed output' command

## **1.7.1** - *2020-11-23*
Thanks @daryluren for the PR!

    · Fix scene headings being forced, even when starting with more than one period
    · Support multiple spaces between character names and character extensions
    · Fix various edge-case bugs related to character name detection (when forced/dual dialogue/spacing, etc)

## **1.7.0** - *2020-11-22*
    + Vastly improved character name detection: It should work absolutely flawlessly now
        + Support unforced character names from any bicameral alphabet (Greek, Cyrillic, Armenian, etc...)
        + Character names can now contain any symbol (in addition to at least one uppercase letter)
        + Syntax highlighting of '@' prefix and '^' suffix
    + Support for creating PDFs with highlighted characters (Thanks @rnwzd for the PR!)
    + New scene renumbering system (Thank you @daryluren!) which supports numbering missing scene numbers, without changing the existing ones
    + New 'Export screenplay PDF with default name and open it' command (Thanks @rnwzd for the PR!)
    · Fix forced scene headings for non-latin alphabets
    · Fix PDF alignment of dual-dialogue when the right side is longer than the left

## **1.6.11** - *2020-11-08*
    + Add "Parenthetical New Line Helper" setting - Disabling it will fix BetterFountain's compatibility with Vim emulators!
    · Fix forced action (!Lines which start like this) being interpreted as a transition if they end with 'TO:' (Issue #92)
    · Fix parsing, preview, and export of dialogue with forced line breaks (an 'empty' line with only two spaces)

## **1.6.10** - *2020-10-23*
    · Fixed inline notes replacing the entire action block
    · Notes for sections now also appear as a description in the outline

## **1.6.9** - *2020-10-22*
    + "(MORE)" and "(CONT'D)" text can now be changed in the settings (Thanks @rnwzd for the PR!)
    · Very minor adjustments to some descriptions in the PDF Settings

## **1.6.8** - *2020-10-05*
    + Add icons to outline
    + Notes now show in the outline (toggle-able)
    · Synopses now show in the correct order in the outline

## **1.6.7** - *2020-08-24*
    + Character extensions can now contain typesetters apostrophes (’) in addition to typewritters apostrophes (')

## **1.6.6** - *2020-08-16*
    + Any line (except action) can now start with spaces or tabs

## **1.6.5** - *2020-07-16*
    + Synopses are now included in the outline (can be toggled on/off)
    + Folding for sections! (Finally)
    + Infinite potential outline depth (Thanks @daryluren for the PR!)
    + Improved syntax highlighting (Thanks @daryluren for the PR!)
    + Anonymized telemetry (respects vscode's "Enable telemetry" toggle)




## **1.6.4** - *2020-06-22*
    + Add page count to statistics
    + Fix multiple sections in a row preventing PDF Creation when bookmarks are enabled
    + Fix synopses not being syntax highlighted

## **1.6.3** - *2020-06-21*
    + Fix scene numbers displaying as sourceline_nb in live preview (Fix #68, thanks Gabriel Guedes for reporting it!)
    + Base screenplay statistics on afterparser tokens, rather than even more regex (Thanks @daryluren for the PR!)

## **1.6.2** - *2020-06-19*
    + Add Bookmarks to the exported PDF for scene and section headers (enabled by default)

## **1.6.1** - *2020-06-18*
    + Improvement to Character autocomplete suggestions - the last taling character is no longer ommited, and all characters from the screenplay are also included. Writing quick dialogue between two characters is still blazing fast (as the smart character ordering is retained), but this change makes writing multiple sequential character lines faster too (Fixes Bug #63)

## **1.6.0**  - *2020-06-16*
    + New Icon
    + Complete overhaul of the previewing system
        + Scroll-sync is finally available! It is bidirectional and awesome (Thanks Felix Batusic for setting the groundwork!)
        + Indicator for the active line in the editor (in the preview)
        + Double-click in the preview to open the editor at that location
        + Previews can now be "dynamic" (of whichever fountain document is active) or "static" (locked to a specified fountain document)
        + Previews now persist through restarts of vscode
    + Notifications for PDF Export (showing any errors, and allowing to open the file upon completion, or reveal it in the file explorer)
    · Fixed bug #29 (Fountain panel outline not working in the preview)
    · Fixed bug #30 (Incorrect Spacing After Dual Dialogue When Exported to PDF)


## **1.5.0** - *2020-05-27*
    + Add symbol-based outline - the "path" of the current scene now shows above the editor, and the 
      integrated "outline" section of vscode now shows the screenplay's outline.
    + Add "Number all scenes" command and "Number scenes on save"  (Thanks Rick Schubert for the PR!)
    + Add "Show Dialogue Numbers" setting (Thanks Felix Batusic for the PR!)
    · Improved parenthetical formatting in exported PDF (to align with
      industry standard formatting of multi-line parentheticals)
    · Fix statistics incorrectly counting characters
    · More maintainable and clearer codebase

## **1.4.5** - *2020-04-14*
    · Align "(MORE)" with character, rather than parenthetical

## **1.4.4** - *2020-04-12*
    + Add keybinding to display preview (Ctrl+Shift+V, or Cmd+Shift+V)
    + Add statistics (contributed by @rickshubert)
    · Fix 'double space to render next line as part of dialogue' override (#53)
    · Fix all-caps action lines (#50)
    · Fix unicode apostrophe detection for macOS

## **1.4.3** - *2019-08-27*
    + Add option to disable noise texture in live preview

## **1.4.2** - *2019-07-31*
    · Improved parsing performance down to under 10ms for a 4000 line script
    · Fixed autosuggested recurring locations appearing multiple times
    - Removed webpack bundling, because it broke the PDF export feature (pdfkit really doesn't play nice with webpack + node)

## **1.4.1** - *2019-07-29*
    + Extension is now bundled with webpack, leading to a 10x smaller package size (0.5MB instead of 5.9MB!) and significantly faster startup times
    + Added instructions for "typewriter mode" in FAQ page (Thanks to @chainick!)
    - Removed syllable-based dialogue duration estimation, improving parsing speed by 8-10x
    - Removed useless console.log() calls (Thanks to @rickschubert!)

## **1.4.0** - *2019-07-27*
    + Smarter character autocomplete for dialogues, in the style of Final Draft (Thanks to @rickschubert!)
    + Improved duration estimate, which now only uses dialogue and action blocks to produce an estimate.
    · Fixed broken scene folding
    · Fixed forced scene headers being incorrectly highlighted (Thanks to @zoltair!)
    · Slightly reduced extension size

## **1.3.1** - *2019-04-30*
    · Fixed "draft date" missing from PDF
    · Fixed "double space between scenes" option
    · Fixed unwanted carrier return from synopsis lines in PDF

## **1.3.0** - *2019-04-14*
    + Live preview improvements
            + Option to change the theme from "vscode" (the same colors as vscode) to "paper" (white background) in the settings
            + Scale to fit (no more horizontal scrollbars)
    + Completely revamped autocomplete
            + More responsive title page key suggestions (shows when entering a new line)
            + Title page value suggestions (such as "written by" for 'credit:', your system username for 'author:', or the current date for 'date:')
            + Different scene header suggestions for int/ext, location, and time of day
            + Context-aware suggestions for character names (characters present in the current scene will be suggested in priority)
    + Replaced default font in preview and PDF with "Courier Prime" (prettier and supports more characters)
    + Custom fonts
            + Added "Font:" title page key to customize the font in the preview + pdf
            + Auto-complete for "font:" based on available fonts (any font installed on the OS)
    + Changing settings will update the live preview in real-time
    + Syntax highlighting fully consistent with tokenization for scene headers
    + Replaced language server with direct implementation
    · "bUg FiXeS and iMpROvEmeNTs"

## **1.2.2** - *2019-04-12*
    + Support for international character names (such as MAËLLE or АДРИАН)

## **1.2.1** - *2019-03-21*
    + Support for periods in character names
    · Fixed exporting PDF to usletter size
    + Support for "watermark" title page key

## **1.2.0** - *2019-01-30*
    + Integrated the PDF Export functionality straight into the extension (rather than using afterwriting CLI)
    + Replaced fountain-js parser with afterwriting-based parser
    · Fixed syntax highlighting for forced screen headers
    · Fixed boneyard showing up in the live preview
    · Reduced extension size from 14MB to 5MB
    - Removed the warning added in 1.1.4 (export is now based on the current document, saved or not)
    + Support for scene numbers and bold scene headers in live preview

## **1.1.4** - *2019-01-08*
    + Warning when trying to export PDF of unsaved file
    · Completely fixed pdf save dialog filter

## **1.1.3**
    + Notes now show in the live preview

## **1.1.2**
    · Fixed syntax highlighting on Linux (Thank you zoltair for reporting it!)
    · Fixed PDF save dialog on Mac OS (Thank you Mark Ainsworth!)

## **1.1.1**
    · Fixed bug where estimated runtime would be wrong in any non-GMT timezone (Thank you Henry Quinn!)

## **1.1.0**
    + Fountain section in the activity bar, with a clickable screenplay structure

## **1.0.2** - *2018-10-01*
    + Enter key auto skips-to-new-line at the end of character extensions ("O.S.", "CONT'D", etc...)
    + New icon
    + Approximate screenplay duration in the status bar
    + Disabled the integrated word based suggestions by default

## **1.0.1** - *2018-09-29*
    + Added settings for PDF Export
    + Brackets automatically close
    · Fixed syntax highlighting for centered text with special characters (> SOMETHING & SOMETHING <)
    · Fixed syntax highlighting for notes ([[notes]])
    + Editor text wraps by default
    + Added changelog

## **1.0.0** - *2018-09-28*
    Initial version