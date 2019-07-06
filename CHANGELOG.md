## **1.3.2**
    + Smarter character autocomplete for dialogues, in the style of Final Draft (Thanks to @rickschubert!)
    · Fixed forced scene headers being incorrectly highlighted (Thanks to @zoltair!)

## **1.3.1**
    · Fixed "draft date" missing from PDF
    · Fixed "double space between scenes" option
    · Fixed unwanted carrier return from synopsis lines in PDF

## **1.3.0**
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

## **1.2.2**
    + Support for international character names (such as MAËLLE or АДРИАН)

## **1.2.1**
    + Support for periods in character names
    · Fixed exporting PDF to usletter size
    + Support for "watermark" title page key

## **1.2.0**
    + Integrated the PDF Export functionality straight into the extension (rather than using afterwriting CLI)
    + Replaced fountain-js parser with afterwriting-based parser
    · Fixed syntax highlighting for forced screen headers
    · Fixed boneyard showing up in the live preview
    · Reduced extension size from 14MB to 5MB
    - Removed the warning added in 1.1.4 (export is now based on the current document, saved or not)
    + Support for scene numbers and bold scene headers in live preview

## **1.1.4**
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