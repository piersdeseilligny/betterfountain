import { ISignal, Signal } from "@lumino/signaling";
import { ScreenplayContent } from "../main/file/file";

export class AppSignals{
  private _documentChanged = new Signal<this, ScreenplayContent>(this);

  /**
   * A signal emitted when the active document is changed
   */
  get documentChanged(): ISignal<this, ScreenplayContent> {
    return this._documentChanged;
  }

  public changeDocument(content:ScreenplayContent){
    this._documentChanged.emit(content);
  }
}