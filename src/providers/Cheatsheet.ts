import * as vscode from 'vscode';
export class FountainCheatSheetTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    public readonly onDidChangeTreeDataEmitter: vscode.EventEmitter<vscode.TreeItem | null> =
        new vscode.EventEmitter<vscode.TreeItem | null>();

    rootTree : CheatsheetTreeItem;
    public readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | null> = this.onDidChangeTreeDataEmitter.event;
    getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: CheatsheetTreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
        if (element)
            return element.children;
        else
            return this.buildTree();
    }
    getParent?(element: CheatsheetTreeItem): vscode.ProviderResult<vscode.TreeItem> {
        return element.parent;
    }

    buildTree(): CheatsheetTreeItem[] {
        let categoriesTree : CheatsheetTreeItem[] = [];
        getCheatSheet().forEach((cheatsheetItems,categoryName)=>{
            let category:CheatsheetTreeItem = new CheatsheetTreeItem(categoryName,null,null);
            cheatsheetItems.map((item) => new CheatsheetTreeItem(item,category, item.example))
                .forEach((item) => category.children.push(item));
            category.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            categoriesTree.push(category);
        })
        return categoriesTree;
    }
}

class CheatsheetTreeItem extends vscode.TreeItem {
    children: CheatsheetTreeItem[] = [];
    constructor(label: string | CheatsheetItemLabel, public parent: CheatsheetTreeItem, public tooltip: string) {
        super(label);
        this.tooltip = tooltip;
    }
}

class CheatsheetItemLabel implements vscode.TreeItemLabel {
    label: string;
    highlights?: [number, number][];

    constructor(keyword: string, description: string, public example: string) {
        this.label = `${keyword} ${description}`.trim()
        this.highlights = [[0, keyword.length]]
    }
}

function getCheatSheet(): Map<string,CheatsheetItemLabel[]>{
    let cheatSheet: Map<string,CheatsheetItemLabel[]> = new Map<string,CheatsheetItemLabel[]>();
    cheatSheet.set('Scenes', [
        new CheatsheetItemLabel("INT.","Indoor scene","INT. BRICK'S ROOM - DAY"),
        new CheatsheetItemLabel("EXT.","Outdoor scene","EXT. BRICK'S POOL - DAY"),
        new CheatsheetItemLabel("EST.","Establishing scene",null),
        new CheatsheetItemLabel("INT./EXT.","Indoor and Outdoor scene","INT./EXT. RONNA'S CAR - NIGHT [DRIVING]"),
        new CheatsheetItemLabel("I/E.","Indoor and Outdoor scene","I/E. RONNA'S CAR - NIGHT [DRIVING]"),
        new CheatsheetItemLabel("TO:","Transitions should be upper case, ending in ' TO:'"
                                ,"Jack begins to argue vociferously in Vietnamese (?), But mercifully we...\n\nCUT TO:\n\nEXT. BRICK'S POOL - DAY"),
        new CheatsheetItemLabel("","Action, or scene description, is any paragraph that doesn't meet criteria for another element"
                                ,`They drink long and well from the beers.\n\nAnd then there's a long beat.\nLonger than is funny.\nLong enough to be depressing.\n\nThe men look at each other.`),   ])

    cheatSheet.set('Dialogues', [
        new CheatsheetItemLabel("","Character names should be in upper case","STEEL\nThe man's a myth!"),
        new CheatsheetItemLabel("","Dialogue is any text following a Character or Parenthetical element"
                                ,"SANBORN\nA good 'ole boy."),
        new CheatsheetItemLabel("(parantheticals)","Parentheticals follow a Character or Dialogue element, and are wrapped in parentheses ()"
                                ,"STEEL\n(starting the engine)\nSo much for retirement!"),
        new CheatsheetItemLabel("^","Dual, or simultaneous, dialogue is expressed by adding a caret ^ after the second Character element"
                                ,"BRICK\nScrew retirement.\n\nSTEEL ^\nScrew retirement."),
        new CheatsheetItemLabel("~","Lyric lines start with a tilde ~"
                                ,"~Willy Wonka! Willy Wonka! The amazing chocolatier!"),
    ])
    
    cheatSheet.set('Emphasis', [
        new CheatsheetItemLabel("","The optional Title Page is always the first thing in a Fountain document"
        ,`Title:
    _**BRICK & STEEL**_
    _**FULL RETIRED**_
Credit: Written by
Author: Stu Maschwitz
Source: Story by KTM
Draft date: 1/20/2012
Contact:
    Next Level Productions
    1588 Mission Dr.
    Solvang, CA 93463`),
        new CheatsheetItemLabel(">CENTERED TEXT<","Centered text is bracketed with greater/less-than",">THE END<"),
        new CheatsheetItemLabel("*italics*","italics","*italics*"),
        new CheatsheetItemLabel("**bold**","Bold text","**bold**"),
        new CheatsheetItemLabel("***bold italics***","Bold and italics text","***bold italics***"),
        new CheatsheetItemLabel("_underline_","Underline text","_underline_"),
        new CheatsheetItemLabel("===","Page Breaks are indicated by a line containing three or more consecutive = signs"
                                ,">**End of Act One**<\n\n===\n\n>**Act Two**<"),
    ])

    cheatSheet.set('Misc.', [
        new CheatsheetItemLabel("[[ notes ]]","A Note is created by enclosing some text with double brackets"
        ,`INT. TRAILER HOME - DAY

This is the home of THE BOY BAND, AKA DAN and JACK[[Or did we think of actual names for these guys?]].  They too are drinking beer, and counting the take from their last smash-and-grab.  Money, drugs, and ridiculous props are strewn about the table.

[[It was supposed to be Vietnamese, right?]]

JACK
(in Vietnamese, subtitled)
*Did you know Brick and Steel are retired?*`),
        new CheatsheetItemLabel("/* ignore text */","If you want Fountain to ignore some text, wrap it with /* some text */"
                                ,"/*\nINT. GARAGE - DAY\n\nBRICK and STEEL get into Mom's PORSCHE, Steel at the wheel.*/"),
        new CheatsheetItemLabel("#","Create a Section by preceding a line with one or more pound-sign # characters"
                                ,"# Act\n\n## Sequence\n\n### Scene\n\n## Another Sequence\n\n# Another Act"),
        new CheatsheetItemLabel("=","Synopses are single lines prefixed by an equals sign =","# ACT I\n\n= Set up the characters and the story."),
    ])

    return cheatSheet;
}
