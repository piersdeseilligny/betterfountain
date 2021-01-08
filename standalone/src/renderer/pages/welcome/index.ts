import { Page } from "../page";
import html from "./index.html";

class WelcomePage extends Page{
    closeable = ()=>{ return false }
    title = () =>{ return "Welcome" }
    html = () =>{
        return html;
    }
}