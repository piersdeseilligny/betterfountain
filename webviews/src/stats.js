import "./lib/contextmenu.css"
const vscode = acquireVsCodeApi();
const $ = require("jquery");
window.$ = $;
require("./lib/contextmenu.js");
require("./lib/jquery.ui.position.min.js");

require('datatables.net');
require('datatables.net-dt');
//require('datatables.net-buttons');

$.contextMenu.defaults.animation = {
    duration: 83,
    show: 'fadeIn',
    hide: 'fadeOut'
}
$.contextMenu.defaults.autoHide=false;
$.contextMenu.types.check = function(item, opt, root) {
    let selected_i = (typeof item.selected === "function" && item.selected.call()) || item.selected === true;
    $(`<span><span class="codicon codicon-check ${selected_i ? 'checked':''}"></span>` + item.name + '</span>').appendTo(this);
    function toggleState(){
        if(item.settingskey){
            let newstate = !state.uipersistence[item.settingskey];
            item.selected = newstate;
            state.uipersistence[item.settingskey] = newstate;
            if(newstate){
                $(item.$node[0]).find(".codicon-check").addClass('checked');
            }
            else{
                $(item.$node[0]).find(".codicon-check").removeClass('checked');
            }
            vscode.setState(state);
            vscode.postMessage({
                command: 'saveUiPersistence',
                content:  { key: item.settingskey, value:newstate },
                uri:state.docuri
            });
        }
    }
    this.on('mouseup', function(e){
        if(e.keyCode ? (e.keyCode==13) : true && (typeof item.disabled === "function") ? (item.disabled()==false) : true){ //if e.keyCode is defined, it must be 13. If it isn't defined, that's ok too. if "disabled" is a function, make sure it's false
            toggleState();
            if(item.updateOnClick){
                if(item.callbackBefore){
                    item.callbackBefore();
                }
                opt.$menu.children().each(function () {
                    var $item = $(this),
                        key = $item.data('contextMenuKey'),
                        item = opt.items[key],
                        disabled = (typeof item.disabled === "function" && item.disabled.call(key, root)) || item.disabled === true,
                        selected = (typeof item.selected === "function" && item.selected.call(key, root)) || item.selected === true;

                    // dis- / enable item
                    $item[disabled ? 'addClass' : 'removeClass'](root.classNames.disabled);
                    // de- / select item
                    if(selected){
                        $(item.$node[0]).find(".codicon-check").addClass('checked');
                    }
                    else{
                        $(item.$node[0]).find(".codicon-check").removeClass('checked');
                    }
                });
            }
            if(item.callback)
                item.callback();
            return item.hideonclick;
        }
    });
};

var charts = [];
const LineChart = require("./charts/line");
const BarcodeChart = require("./charts/barcode");
const TableChart = require("./charts/table");

var state = {
    stats: {},
    uipersistence:{
        chartFreeSelection:false,
        chartSnapToSection1:true,
        chartSnapToSection2:true,
        chartSnapToSection3:true,
        chartSnapToScene:true
    },
    latestversion: undefined,
    activeversion:undefined,
    docuri: "",
    selectedCategory:"overview"
}

let loading = false;
const previousState = vscode.getState();
if(previousState != undefined){
    state = previousState;
    updateStats();
    versionIndicator();
}
changeStatCategory($("#sidenav [data-group='"+state.selectedCategory+"']"));





window.addEventListener('message', event => {
    let updateState = false;
    if(event.data.command == 'updateversion'){
        state.latestversion = event.data.version;
        loading = event.data.loading;
        versionIndicator();
        updateState = true;
    }
    if (event.data.command == 'updateStats') {
        state.stats = event.data.content;
        state.activeversion = event.data.version;
        loading = false;
        updateState = true;
        versionIndicator();
        updateStats();
    } else if(event.data.command == 'setstate'){
        if(event.data.uri !== undefined){
            state.docuri = event.data.uri;
            updateState = true;
        }   
    } else if(event.data.command == 'updatecaret'){
        for (let i = 0; i < charts.length; i++) {
            if(charts[i].chart.updatecaret)
                charts[i].chart.updatecaret(event.data.content);
        }
    } else if(event.data.command == 'updateselection'){
        for (let i = 0; i < charts.length; i++) {
            if(charts[i].chart.updateselection)
                charts[i].chart.updateselection(event.data.content.start, event.data.content.end);
        }
    } else if(event.data.command == 'updateUiPersistence'){
        state.uipersistence[event.data.content.key] = event.data.content.value;
        updateState = true;
    }
    if(updateState)
        vscode.setState(state);
});
window.addEventListener('blur', event =>{
    document.getElementById("maincontent").classList.remove('isactive');
});
window.addEventListener('focus', event =>{
    document.getElementById("maincontent").classList.add('isactive');
});
window.addEventListener('resize', event=>{
    for (let i = 0; i < charts.length; i++) {
        if(charts[i].group == state.selectedCategory){
            charts[i].chart.resize(event);
        }
    }
});

function versionIndicator(){
    $("#versionIndicator").removeClass('loading');
    $("#versionIndicator").removeClass('stale');
    if(loading){
        $("#versionIndicator").addClass('loading');
        $("#versionIndicator .btntitle").text("Loading");
        $("#versionIndicator .details").text('Please wait...');
    }
    else if(state.latestversion == state.activeversion){
        
        $("#versionIndicator .btntitle").text("Refresh");
        $("#versionIndicator .details").text('Up to date');
    }
    else{
        $("#versionIndicator").addClass('stale');
        $("#versionIndicator .btntitle").text("Refresh");
        $("#versionIndicator .details").text('The screenplay has been edited');
    }
}

$("#versionIndicator").on('click', function(){
    loading = true;
    versionIndicator();
    vscode.postMessage({command: 'refresh', uri:state.docuri });
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


function objectToMap(jsonObject){
    let map = new Map()
    for (var value in jsonObject) {  
        map.set(value,jsonObject[value]);
    }
    return map;
}

function revealLine(line){
    vscode.postMessage({command: 'revealLine', content: line, uri:state.docuri });
}
function revealSelection(linestart,lineend){
    vscode.postMessage({command: 'selectLines', content: {start:linestart, end:lineend}, uri:state.docuri });
}

var durationchart;
var datatable;

function updateStats(){
    let pdfmap = objectToMap(JSON.parse(state.stats.pdfmap));
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
    document.getElementById("durationStats-total").innerText = secondsToString(state.stats.durationStats.total);
    document.getElementById("durationStats-action").innerText = secondsToString(state.stats.durationStats.action);
    document.getElementById("durationStats-dialogue").innerText = secondsToString(state.stats.durationStats.dialogue);

    let runtime = state.stats.durationStats.total/60;

    //0-3min:     very short film
    //3-15min:    short film
    //15-25min:   medium-length short film
    //25-40min:   long short film
    //40-50min:   somewhere between short and feature film
    //50min-1h25: short feature film
    //1h25>2h20:  feature film
    //2h20>3h:    long feature film
    //3h+:        very long feature film

    let summary = "The screenplay is "
    if(runtime>260) summary += "the length of an extraordinarily long feature film. "
    else if(runtime>240) summary += "the length of an extremely long feature film. "
    else if(runtime>180) summary += "the length of a very long feature film. ";
    else if(runtime>140) summary += "the length of a long feature film. ";
    else if(runtime>85) summary += "the length of a feature film. ";
    else if(runtime>50) summary += "the length of a short feature film. ";
    else if(runtime>40) summary += "between the length of a short and a feature film. ";
    else if(runtime>25) summary += "the length of a featurette. ";
    else if(runtime>15) summary += "the length of a medium-length short film. ";
    else if(runtime>3) summary += "the length of a short film. ";
    else if (runtime>0.5) summary += "the length of a small short film. "
    else summary += "the length of an extremely small short film. ";

    const actionPercent = Math.round((100*state.stats.durationStats.action)/state.stats.durationStats.total);
    const dialoguePercent = 100-actionPercent;

    if(actionPercent>90) summary += "It is extremely action-heavy ("+actionPercent+"% of the runtime).";
    else if(actionPercent>75) summary += "It is very action-heavy ("+actionPercent+"% of the runtime).";
    else if(actionPercent>60) summary += "It is action-heavy ("+actionPercent+"% of the runtime).";
    else if(actionPercent>55) summary += "It is fairly balanced between action ("+actionPercent+"%) and dialogue ("+dialoguePercent+"%).";
    else if(actionPercent>50) summary += "It is balanced between action ("+actionPercent+"%) and dialogue ("+dialoguePercent+"%).";

    else if(dialoguePercent>90) summary += "It is extremely dialogue-heavy ("+dialoguePercent+"% of the runtime).";
    else if(dialoguePercent>75) summary += "It is very dialogue-heavy ("+dialoguePercent+"% of the runtime).";
    else if(dialoguePercent>60) summary += "It is dialogue-heavy ("+dialoguePercent+"% of the runtime).";
    else if(dialoguePercent>55) summary += "It is fairly balanced between dialogue ("+dialoguePercent+"%) and action ("+actionPercent+"%).";
    else if(dialoguePercent>50) summary += "It is balanced between dialogue ("+dialoguePercent+"%) and action ("+actionPercent+"%).";

    else if(dialoguePercent == 50) summary += "It is precisely balanced between dialogue and action (50% each)."


    document.getElementById("durationStats-summary").innerText = summary;


    //characters
    document.getElementById("characterStats-count").innerText = state.stats.characterStats.characterCount ? state.stats.characterStats.characterCount : 0;
    document.getElementById("characterStats-monologues").innerText = state.stats.characterStats.monologues ? state.stats.characterStats.monologues : 0;
    document.getElementById("characterStats-complexity").innerText = state.stats.characterStats.complexity ? state.stats.characterStats.complexity.toFixed(1) : 0;



    let renderIntExt = function(data,type,row){
        switch (type) {
            case "display": return `${data}.`.toUpperCase();
            case "sort":    return data;
            default:        return data
        }
    };
    let renderTimesOfDay = function(data,type,row){
        switch (type) {
            case "display": return data.map(it=>it.toUpperCase()).join(", ");
            case "sort":    return data;
            default:        return data
        }
    };
    let renderDuration = function(data,type,row){
        switch (type) {
            case "display": return secondsToString(data);
            case "sort":    return -data;
            default:        return data
        }
    };
    let renderInteger = function(data,type,row){
        switch (type) {
            case "display": return data ? data.toFixed(0) : 0;
            case "sort":    return data;
            default:        return data
        }
    };
    let renderComplexity = function(data,type,row){
        switch (type) {
            case "display": return data ? data.toFixed(1) : 0;
            case "sort":    return -data;
            default:        return data
        }
    };
    let renderInvert = function(data,type,row){
        switch (type) {
            case "sort":    return -data;
            default:        return data
        }
    };
    let characterTable = TableChart.render("#characterStats-table", {
        data: state.stats.characterStats.characters,
        unit:"characters",
        columns: [
            { data:'name', name:"name", title:"Name", alwaysvisible:true },
            { data:'secondsSpoken', name:"duration", title:"Duration", render:renderDuration },
            { data:'speakingParts', name:"lines", title:"Lines", render:renderInvert },
            { data:'wordsSpoken', name:"words", title:"Words", render:renderInvert },
            { data:'averageComplexity', name:"complexity", title:"Complexity", render:renderComplexity},
            { data:'monologues', name:"monologues", title:"Monologues", render:renderInvert }
        ],
        createdRow:function(row,data,dataIndex){
            if(data.color){
                $(row).find("td").first().css("color", data.color);
            }
        }
    });
    characterTable.on('mouseenter', 'tbody tr', function () {
        var rowData = characterTable.row(this).data();
        $(`#characterStats-lengthchart [data-label="${encodeURIComponent(rowData.name)}"]`).addClass("hover");
      });
    characterTable.on('mouseleave', 'tbody tr', function () {
        var rowData = characterTable.row(this).data();
        $(`#characterStats-lengthchart [data-label="${encodeURIComponent(rowData.name)}"]`).removeClass("hover");
      });

    function syncVisibility(){
        $(`#characterStats-lengthchart [data-label]`).addClass("hidden");
        let data = characterTable.rows( { search: 'applied', page:'current' } ).data().each((v,i)=>{
            $(`#characterStats-lengthchart [data-label="${encodeURIComponent(v.name)}"]`).removeClass("hidden");
        });
    }
    characterTable.on("draw", function(){
        syncVisibility();
    });
    syncVisibility();

    
    let locationsTable = TableChart.render("#locationStats-table", {
        data: state.stats.locationStats.locations,
        unit:"locations",
        columns: [
            { data:'name', name:"name", title:"Name" },
            { data:'number_of_scenes', name:"number_of_scenes", title:"Number of Scenes", render: renderInteger},
            { data:'times_of_day', name:"times_of_day", title:"Time", render: renderTimesOfDay, className: 'location-time'},
            { data:'interior_exterior', name:"interior_exterior", title:"INT./EXT.", render: renderIntExt, className: 'location-type'},
        ],
        createdRow:function(row,data,dataIndex){
            if(data.color){
                $(row).find("td").first().css("color", data.color);
                $(row).find("td.location-time").html(data.times_of_day.map((it, index) => {
                    let output = `<span>${it.toUpperCase()}`;
                    index < data.times_of_day.length-1 ? output += ", </span>" : output += "</span>";
                    return $(output).css('color', `var(--scenecolor-${it}`);
                }));
                $(row).find("td.location-type").first().css("color", `var(--scenecolor-${data.interior_exterior})`);
            }
        }
    });
    locationsTable.on('mouseenter', 'tbody tr', function () {
        var rowData = locationsTable.row(this).data();
        for (let i = 0; i < rowData.scene_lines.length; i++) {
            $(`#sceneStats-timechart [data-x="${encodeURIComponent(rowData.scene_lines[i])}"]`).addClass("hover");
        }
      });
      locationsTable.on('mouseleave', 'tbody tr', function () {
        var rowData = locationsTable.row(this).data();
        for (let i = 0; i < rowData.scene_lines.length; i++) {
            $(`#sceneStats-timechart [data-x="${encodeURIComponent(rowData.scene_lines[i])}"]`).removeClass("hover");
        }
      });
    document.getElementById("locationStats-count").innerText = state.stats.locationStats.locationsCount;



    charts.push({
        group:'overview',
        chart: LineChart.render('#durationStats-lengthchart', [state.stats.durationStats.lengthchart_action, state.stats.durationStats.lengthchart_dialogue], state.uipersistence, {
            yvalue: 'length',
            xvalue: 'line',
            rulerheight:6,
            display:'line',
            small: getWidth(),
            map:pdfmap,
            structure: state.stats.structure,
            hover:function(show,x,values, isrange){
                let actionLength = values[0].length;
                let dialogueLength = values[1].length;
                return values[0].length+values[1].length;
            },
            selectionSvg:function(values){
                let actionLength = Math.max(values[0][0].length,values[0][1].length) - Math.min(values[0][0].length,values[0][1].length);
                let dialogueLength = Math.max(values[1][0].length,values[1][1].length) - Math.min(values[1][0].length,values[1][1].length);
                return{
                    svg:`<text class='durationstats-selection'>${secondsToString(actionLength+dialogueLength)}</text>
                         <text class='durationstats-selection durationstats-selection-action' y='12'>${secondsToString(actionLength)}</text>
                         <text class='durationstats-selection durationstats-selection-dialogue' y='24'>${secondsToString(dialogueLength)}</text>`,
                    width:64
                }
            },
            revealLine:revealLine,
            revealSelection:revealSelection
        })
    });

    document.getElementById("characterStats-monologues").innerText = state.stats.durationStats.monologues;
    let colors = [];
    state.stats.durationStats.characternames.forEach(e=>{
        let charstat = state.stats.characterStats.characters.find(x => x.name == e);
        if(charstat) colors.push(charstat.color);
    });
    charts.push({
        group:'characters',
        chart:LineChart.render('#characterStats-lengthchart', state.stats.durationStats.characters, state.uipersistence, {
            yvalue: 'lengthTimeGlobal',
            xvalue: 'line',
            rulerheight:6,
            display:'line',
            pointvalue: 'monologue',
            small: getWidth(),
            labels: state.stats.durationStats.characternames,
            colors:colors,
            map:pdfmap,
            structure: state.stats.structure,
            revealLine:revealLine,
            revealSelection:revealSelection
        })
    });


    //scenes
    document.getElementById("sceneStats-count").innerText = state.stats.lengthStats.scenes;
    charts.push({
        group:'scenes',
        chart:LineChart.render('#sceneStats-timechart', [state.stats.durationStats.scenes, state.stats.durationStats.scenes], state.uipersistence, {
            yvalue: ['time','type'],
            xvalue: 'line',
            xvalueend: 'endline',
            display: 'barcode',
            rulerheight:0,
            longestData: state.stats.lengthStats.lines,
            small: getWidth(),
            labels: state.stats.durationStats.characternames,
            map:pdfmap,
            structure: state.stats.structure,
            revealLine:revealLine,
            revealSelection:revealSelection
        })
    });
    let arrayLocations = [];
    let arrayTimes = [];
    function humanizeSceneType(t){
        switch (t) {
            case 'type_int':
                return 'inside'
                break;
            case 'type_ext':
                return 'outside'
                break;
            case 'type_mixed':
                return 'both inside and outside'
                break;
            default:
                return 'neither inside or outside'
                break;
        }
    }
    function humanizeSceneType2(t){
        switch (t) {
            case 'type_int':
                return 'interior'
                break;
            case 'type_ext':
                return 'exterior'
                break;
            case 'type_mixed':
                return 'both interior and exterior'
                break;
            default:
                return 'neither interior or exterior'
                break;
        }
    }
    function humanizeSceneTime(t){
        console.log("Humanizing " + t);
        switch(t){
            case 'time_dawn':
                return 'during dawn';
                break;
            case 'time_morning':
                return 'in the morning';
                break;
            case 'time_day':
                return 'during the day';
                break;
            case 'time_dusk':
                return 'at dusk';
                break;
            case 'time_evening':
                return 'in the evening';
                break;
            case 'time_night':
                return 'at night';
                break;
            default:
                return `at an unspecified time`;
        }
    }
    for(var prop of Object.keys(state.stats.durationStats.durationBySceneProp)){
        console.log("Property is " + prop);
        var val = state.stats.durationStats.durationBySceneProp[prop]
        if(val>0){
            var sceneprop = document.querySelector(`[data-sceneprop="${prop}"]`);
            if(sceneprop){
                sceneprop.innerText = secondsToString(val);
                sceneprop.parentElement.classList.remove('hidden');
            }
            if(prop.startsWith('type_')){
                arrayLocations.push({type:prop, length:val, percent:Math.round((val*100)/state.stats.durationStats.total)});
            }
            else if(prop.startsWith('time_')){
                arrayTimes.push({time:prop, length:val, percent:Math.round((val*100)/state.stats.durationStats.total)})
            }
        }
    }
    let sceneSummary = "The screenplay has no scenes.";
    if(arrayLocations.length>0){
        arrayLocations.sort((a, b) => b.length - a.length);
        if(arrayLocations.length == 1){
            sceneSummary = `The entire screenplay takes place ${humanizeSceneType(arrayLocations[0].type)}.`
        }
        else if(arrayLocations.length >= 2){
            let firstTwoDiff = arrayLocations[0].percent - arrayLocations[1].percent;
            if(firstTwoDiff>50){
                sceneSummary = `The vast majority of the screenplay takes place ${humanizeSceneType(arrayLocations[0].type)} (${arrayLocations[0].percent}% of the runtime). Only ${arrayLocations[1].percent}% of the runtime is spent ${humanizeSceneType(arrayLocations[1].type)}.`
            }
            else if(firstTwoDiff>25){
                sceneSummary = `The majority of the screenplay takes place ${humanizeSceneType(arrayLocations[0].type)} (${arrayLocations[0].percent}% of the runtime). The rest of the runtime (${arrayLocations[1].percent}%) is spent ${humanizeSceneType(arrayLocations[1].type)}.`
            }
            else if(firstTwoDiff>25){
                sceneSummary = `Slightly more time in the screenplay is spent ${humanizeSceneType(arrayLocations[0].type)} (${arrayLocations[0].percent}% of the runtime). The rest of the runtime (${arrayLocations[1].percent}%) is spent ${humanizeSceneType(arrayLocations[1].type)}.`
            
            }
            else{
                sceneSummary = `The screenplay is fairly balanced between ${humanizeSceneType2(arrayLocations[0].type)} scenes (${arrayLocations[0].percent}% of the runtime) and ${humanizeSceneType2(arrayLocations[1].type)} ones (${arrayLocations[1].percent}%).`
            }
            if(arrayLocations.length>=3){
                if(arrayLocations[2].percent>10){
                    sceneSummary += ` The rest (${arrayLocations[2].percent}%) takes place ${humanizeSceneType(arrayLocations[2].type)}.`
                }
            }
        }
    }
    /*
    if(arrayTimes.length>0){
        arrayTimes.sort((a,b,)=> b.length - a.length);
        if(arrayTimes.length == 1){
            sceneSummary += ` They all take place ${humanizeSceneTime(arrayTimes[0].time)}`
        }
        else if(arrayTimes.length >= 2){
            let firstTwoDiff = arrayTimes[0].percent - arrayTimes[1].percent;
            if(firstTwoDiff > 80){
                sceneSummary+= ` Almost all of them take place ${humanizeSceneTime(arrayTimes[0].time)} (${arrayTimes[0].percent}% of the runtime).`
            }
            else if(firstTwoDiff>60){
                sceneSummary+=` A majority take place ${humanizeSceneTime(arrayTimes[0].time)} (${arrayTimes[0].percent}% of the runtime), followed by ${arrayTimes[1].percent}% ${humanizeSceneTime(arrayTimes[1].time)}.`
            }
            else{
                sceneSummary+=` About half take place ${humanizeSceneTime(arrayTimes[0].time)} (${arrayTimes[0].percent}% of the runtime), followed by ${arrayTimes[1].percent}% ${humanizeSceneTime(arrayTimes[1].time)}.`
            }
        }
    }*/
    document.getElementById('durationStats-scenesummary').innerText = sceneSummary;
}

function secondsToString(seconds){
	var time = new Date(null);
	time.setHours(0);
	time.setMinutes(0);
	time.setSeconds(seconds);
	return padZero(time.getHours()) + ":" + padZero(time.getMinutes()) + ":" + padZero(time.getSeconds());
}
function padZero(i) {
	if (i < 10) {
		i = "0" + i;
	}
	return i;
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

    
    if(activegroup != state.selectedCategory)
        state.selectedCategory = activegroup;

    for (let i = 0; i < charts.length; i++) {
        if(charts[i].group == state.selectedCategory && charts[i].chart.resize){
            charts[i].chart.resize();
        }
    }
}