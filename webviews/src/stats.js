const vscode = acquireVsCodeApi();
const $ = require("jquery");
const LineChart = require("./charts/line");

var state = {
    stats: {}
}
const previousState = vscode.getState();
if(previousState != undefined){
    state = previousState;
    updateStats();
}


window.addEventListener('message', event => {
    if (event.data.command == 'updateStats') {
        state.stats = event.data.content;
        vscode.setState(state);
        updateStats();
    }
});
window.addEventListener('blur', event =>{
    document.getElementById("maincontent").classList.remove('isactive');
});
window.addEventListener('focus', event =>{
    document.getElementById("maincontent").classList.add('isactive');
});

function getEights(input){
    let output = "";
    switch(input){
        case 0: return "";
        case 1: output+="\u00B9"; break;
        case 2: output+="\u00B2"; break;
        case 3: output+="\u00B3"; break;
        case 4: output+="\u2074"; break;
        case 5: output+="\u2075"; break;
        case 6: output+="\u2076"; break;
        case 7: output+="\u2077"; break;
        case 8: output+="\u2078"; break;
    }
    return output + "\u2044\u2088";
}
function formatNumber(input){
    return new Intl.NumberFormat().format(input)
}

function getWidth() {
    var deviceWidth = !window.orientation ? window.screen.width : window.screen.height;
    if (navigator.userAgent.indexOf('Android') >= 0 && window.devicePixelRatio) {
        deviceWidth = deviceWidth / window.devicePixelRatio;
    }
    return deviceWidth;
}

function updateStats(){
    //overview
    document.getElementById("lengthStats-words").innerText = formatNumber(state.stats.lengthStats.words);
    document.getElementById("lengthStats-characters").innerText = formatNumber(state.stats.lengthStats.characters);
    document.getElementById("lengthStats-characterswithoutwhitespace").innerText = formatNumber(state.stats.lengthStats.characterswithoutwhitespace);
    document.getElementById("lengthStats-lines").innerText = formatNumber(state.stats.lengthStats.lines);
    document.getElementById("lengthStats-scenes").innerText = formatNumber(state.stats.lengthStats.scenes);
    document.getElementById("lengthStats-lineswithoutwhitespace").innerText = formatNumber(state.stats.lengthStats.lineswithoutwhitespace);
    document.getElementById("lengthStats-pagesReal").innerText = formatNumber(state.stats.lengthStats.pagesreal);
    let wholePage = Math.floor(state.stats.lengthStats.pages);
    let fractionalPage = getEights(Math.round((state.stats.lengthStats.pages - wholePage) * 8));
    if(fractionalPage == "\u2078\u2044\u2088") //page eigth is 8/8
    {
        fractionalPage = "";
        wholePage++;
    }
    if(wholePage == "0" && fractionalPage != ""){
        wholePage = "";
        document.getElementById("lengthStats-pagesFractional").style.opacity="1";

    }
    document.getElementById("lengthStats-pagesWhole").innerText = wholePage;
    document.getElementById("lengthStats-pagesFractional").innerText = fractionalPage;
    document.getElementById("durationStats-total").innerText = state.stats.durationStats.total;
    document.getElementById("durationStats-action").innerText = state.stats.durationStats.action;
    document.getElementById("durationStats-dialogue").innerText = state.stats.durationStats.dialogue;
    //characters
    document.getElementById("characterTable").innerHTML =
    `<tr>
        <th>Character name</th>
        <th>Speaking parts</th>
        <th>Total words spoken</th>
    </tr>
    ${state.stats.characterStats.reduce((prev, curr) => {
        return `${prev}
        <tr>
            <td>${curr.name}</td>
            <td>${curr.speakingParts}</td>
            <td>${curr.wordsSpoken}</td>
        </tr>
        `
    }, '')}`
    LineChart.render('#durationStats-lengthchart', [state.stats.durationStats.lengthchart_action, state.stats.durationStats.lengthchart_dialogue], {
        value: 'length',
        small: getWidth()
    });
}

$(".sidenav [data-group]").on("click", function () {
    changeStatCategory(this);
});

function changeStatCategory(e){
    //Change the active element in the sidenav
    let sidebarGroups = document.getElementById("sidenav").querySelectorAll("[data-group]");
    for (let i = 0; i < sidebarGroups.length; i++) {
        sidebarGroups[i].classList.remove("active");   
    }
    $(e).addClass("active");

    //Change the visible element in the content
    let groups = document.getElementById("content").children;
    let activegroup = $(e).attr("data-group");
    for (let i = 0; i < groups.length; i++) {
        if(groups[i].getAttribute("data-group") == activegroup){
            groups[i].style.display = "block";
        }
        else{
            groups[i].style.display = "none";
        }
    }
}