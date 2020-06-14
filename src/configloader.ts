export class FountainConfig{
    number_scenes_on_save: boolean;
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
    print_dialogue_numbers:boolean;
    synchronized_markup_and_preview:boolean;
    preview_theme:string;
    preview_texture:boolean;
}
import * as vscode from 'vscode';

export var getFountainConfig = function(docuri:vscode.Uri):FountainConfig{
    if(!docuri && vscode.window.activeTextEditor != undefined) 
        docuri = vscode.window.activeTextEditor.document.uri;
    var pdfConfig = vscode.workspace.getConfiguration("fountain.pdf", docuri);
    var generalConfig = vscode.workspace.getConfiguration("fountain.general", docuri);
    return {
        number_scenes_on_save: generalConfig.numberScenesOnSave,
        embolden_scene_headers: pdfConfig.emboldenSceneHeaders,
        show_page_numbers: pdfConfig.showPageNumbers,
        split_dialogue: pdfConfig.splitDialog,
        print_title_page: pdfConfig.printTitlePage,
        print_profile: pdfConfig.printProfile,
        double_space_between_scenes: pdfConfig.doubleSpaceBetweenScenes,
        print_sections: pdfConfig.printSections,
        print_synopsis: pdfConfig.printSynopsis,
        print_actions: pdfConfig.printActions,
        print_headers: pdfConfig.printHeaders,
        print_dialogues: pdfConfig.printDialogues,
        number_sections: pdfConfig.numberSections,
        use_dual_dialogue: pdfConfig.useDualDialogue,
        print_notes: pdfConfig.printNotes,
        print_header: pdfConfig.pageHeader,
        print_footer: pdfConfig.pageFooter,
        print_watermark: pdfConfig.watermark,
        scenes_numbers: pdfConfig.sceneNumbers,
        each_scene_on_new_page: pdfConfig.eachSceneOnNewPage,
        merge_empty_lines: pdfConfig.mergeEmptyLines,
        print_dialogue_numbers: pdfConfig.showDialogueNumbers,
        synchronized_markup_and_preview: generalConfig.synchronizedMarkupAndPreview,
        preview_theme: generalConfig.previewTheme,
        preview_texture: generalConfig.previewTexture
    }
}