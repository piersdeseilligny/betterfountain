export class FountainConfig{
    embolden_scene_headers:boolean;
    show_page_numbers:boolean;
    split_dialogue:boolean;
    print_title_page:boolean;
    print_profile:string;
    double_space_between_scenes:boolean;
    print_sections:boolean;
    print_synopsis:boolean;
    print_actions:boolean;
    print_headers:boolean;
    print_dialogues:boolean;
    number_sections:boolean;
    use_dual_dialogue:boolean;
    print_notes:boolean;
    print_header:string;
    print_footer:string;
    print_watermark:string;
    scenes_numbers:string;
    each_scene_on_new_page:boolean;
    merge_empty_lines:boolean;
}
import * as vscode from 'vscode';

export var getFountainConfig = function(docuri:vscode.Uri):FountainConfig{
    if(!docuri && vscode.window.activeTextEditor == undefined) 
        docuri = vscode.window.activeTextEditor.document.uri;
    var config = vscode.workspace.getConfiguration("fountain.pdf", docuri);
    return {
        embolden_scene_headers: config.emboldenSceneHeaders,
        show_page_numbers: config.showPageNumbers,
        split_dialogue: config.splitDialog,
        print_title_page: config.printTitlePage,
        print_profile: config.printProfile,
        double_space_between_scenes: config.doubleSpaceBetweenScenes,
        print_sections: config.printSections,
        print_synopsis: config.printSynopsis,
        print_actions: config.printActions,
        print_headers: config.printHeaders,
        print_dialogues: config.printDialogues,
        number_sections: config.numberSections,
        use_dual_dialogue: config.useDualDialogue,
        print_notes: config.printNotes,
        print_header: config.pageHeader,
        print_footer: config.pageFooter,
        print_watermark: config.watermark,
        scenes_numbers: config.sceneNumbers,
        each_scene_on_new_page: config.eachSceneOnNewPage,
        merge_empty_lines: config.mergeEmptyLines
    }
}