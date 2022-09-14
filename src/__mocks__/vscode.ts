const languages = {
  createDiagnosticCollection: jest.fn(),
  registerCodeLensProvider: jest.fn(),
}

const StatusBarAlignment = { Left: 1, Right: 2 }

const window = {
  createStatusBarItem: jest.fn(() => ({
    show: jest.fn(),
    tooltip: jest.fn(),
  })),
  showErrorMessage: jest.fn(),
  showWarningMessage: jest.fn(),
  createTextEditorDecorationType: jest.fn(),
  createOutputChannel: jest.fn(),
  showWorkspaceFolderPick: jest.fn(),
  onDidChangeActiveTextEditor: jest.fn(),
  onDidChangeTextEditorVisibleRanges: jest.fn(),
  onDidChangeTextEditorSelection: jest.fn(),
  showInformationMessage: jest.fn(),
}

const workspace = {
  workspaceFolders: [] as string[],
  getConfiguration: jest.fn().mockReturnValue({
    generalConfig: {
      numberScenesOnSave: false,
      refreshStatisticsOnSave: false,
      synchronizedMarkupAndPreview: true,
      previewTheme: "paper",
      previewTexture: true,
      parentheticalNewLineHelper: true,
    },
    pdfConfig: {
      emboldenSceneHeaders: true,
      emboldenCharacterNames: false,
      showPageNumbers: true,
      splitDialog: true,
      printTitlePage: true,
      printProfile: "a4",
      doubleSpaceBetweenScenes: false,
      printSections: false,
      printSynopsis: false,
      printActions: true,
      printHeaders: true,
      printDialogues: true,
      numberSections: false,
      useDualDialogue: true,
      printNotes: false,
      pageHeader: "",
      pageFooter: "",
      watermark: "",
      sceneNumbers: "none",
      eachSceneOnNewPage: false,
      mergeEmptyLines: true,
      showDialogueNumbers: false,
      createBookmarks: true,
      invisibleSectionBookmarks: true,
      textMORE: "(MORE)",
      textCONTD: "(CONT'D)",
      textSceneContinued: "CONTINUED",
      sceneContinuationTop: false,
      sceneContinuationBottom: false,
    }
}),
  getWorkspaceFolder: jest.fn(),
  onDidChangeConfiguration: jest.fn(),
  onDidChangeTextDocument: jest.fn(),
  onDidChangeWorkspaceFolders: jest.fn(),
  onDidSaveTextDocument: jest.fn(),
  onDidCloseTextDocument: jest.fn(),
}

const OverviewRulerLane: {Left: any} = {
  Left: null,
}

const Uri = {
  file: (f: any) => f,
  parse: jest.fn(),
}
const Range = jest.fn()
const Diagnostic = jest.fn()
const DiagnosticSeverity = { Error: 0, Warning: 1, Information: 2, Hint: 3 }

const debug = {
  onDidTerminateDebugSession: jest.fn(),
  startDebugging: jest.fn(),
  registerDebugConfigurationProvider: jest.fn(),
}

const commands = {
  executeCommand: jest.fn(),
  registerCommand: jest.fn(),
}

const CodeLens = function CodeLens() {}
class Position {
  constructor (public readonly line: number, public readonly character: number) {}
}
const TreeItem = function TreeItem(){}
const EventEmitter = function EventEmitter(){
return {
  event: jest.fn()
};
}

export {
  CodeLens,
  Position,
  TreeItem,
  languages,
  StatusBarAlignment,
  window,
  workspace,
  OverviewRulerLane,
  Uri,
  Range,
  Diagnostic,
  DiagnosticSeverity,
  debug,
  commands,
  EventEmitter,
}
