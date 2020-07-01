import { parseoutput } from "./afterwriting-parser"
import { secondsToString } from "./utils"
import { GeneratePdf } from "./pdf/pdf"
import { FountainConfig } from "./configloader"
import { pdfstats } from "./pdf/pdfmaker"

type dialoguePiece = {
    character: string
    speech: string
}

interface dialoguePerCharacter {
    [x: string]: string[]
}

type dialogueStatisticPerCharacter = {
    name: string
    speakingParts: number
    wordsSpoken: number
}

type singleSceneStatistic = {
    title: string
}

type lengthStatistics = {
    characters: number
    characterswithoutwhitespace:number;
    lines:number,
    lineswithoutwhitespace:number;
    words: number;
    pages: number;
    pagesreal:number;
    scenes: number;
}

type lengthchartitem = {
    line:number,
    scene:string,
    length:number
}

type durationStatistics = {
    dialogue: string
    action: string
    total: string,
    lengthchart_action: lengthchartitem[]
    lengthchart_dialogue: lengthchartitem[]
}

type screenPlayStatistics = {
    characterStats: dialogueStatisticPerCharacter[]
    sceneStats: singleSceneStatistic[]
    lengthStats: lengthStatistics
    durationStats: durationStatistics
}

const createCharacterStatistics = (parsed: parseoutput): dialogueStatisticPerCharacter[] => {
    const dialoguePieces: dialoguePiece[] = [];
    for (var i=0; i<parsed.tokens.length; i++)
    {
        while (i<parsed.tokens.length && parsed.tokens[i].type==="character")
        {
            const character = parsed.tokens[i].name()
            var speech = "";
            while (i++ && i<parsed.tokens.length)
            {
                if (parsed.tokens[i].type==="dialogue")        
                {
                    speech += parsed.tokens[i].text + " "
                }
                else if (parsed.tokens[i].type==="character")
                {
                    break;
                }
                // else skip extensions / parenthesis / dialogue-begin/-end
            }
            
            speech = speech.trim()
            dialoguePieces.push({
                character,
                speech
            })
        }
    }

    const dialoguePerCharacter: dialoguePerCharacter = {}

    dialoguePieces.forEach((dialoguePiece) => {
        if (dialoguePerCharacter.hasOwnProperty(dialoguePiece.character)) {
            dialoguePerCharacter[dialoguePiece.character].push(dialoguePiece.speech)
        } else {
            dialoguePerCharacter[dialoguePiece.character] = [dialoguePiece.speech]
        }
    })

    const characterStats: dialogueStatisticPerCharacter[] = []

    Object.keys(dialoguePerCharacter).forEach((singledialPerChar: string) => {
        const speakingParts = dialoguePerCharacter[singledialPerChar].length
        const allDialogueCombined = dialoguePerCharacter[singledialPerChar].reduce((prev, curr) => {
            return `${prev} ${curr} `
        }, "")
        const wordsSpoken = getWordCount(allDialogueCombined)
        characterStats.push({
            name: singledialPerChar,
            speakingParts,
            wordsSpoken,
        })
    })

    characterStats.sort((a, b) => {
        // by parts
        if (b.speakingParts > a.speakingParts) return +1;
        if (b.speakingParts < a.speakingParts) return -1;
        // then by words
        if (b.wordsSpoken > a.wordsSpoken) return +1;
        if (b.wordsSpoken < a.wordsSpoken) return -1;
        return 0;
    })

    return characterStats
}

const createSceneStatistics = (parsed: parseoutput): singleSceneStatistic[] => {
    const sceneStats: singleSceneStatistic[] = []
    parsed.tokens.forEach ((tok) => {
        if (tok.type==="scene_heading")
        {
            sceneStats.push({
                title: tok.text
            })
        }
    })
    return sceneStats
}



const getLengthChart = (parsed:parseoutput):{action:lengthchartitem[], dialogue:lengthchartitem[]} => {
    let action:lengthchartitem[] = [{line:undefined, length: 0, scene:undefined }]
    let dialogue:lengthchartitem[] = [{line:undefined, length: 0, scene:undefined }]
    let previousLengthAction = 0;
    let previousLengthDialogue = 0;
    let currentScene = "";
    parsed.tokens.forEach(element => {
        if(element.type=="scene_heading"){
            currentScene = element.text;
        }
        else if(element.type == "action" || element.type == "dialogue"){
            let time = Number(element.time);
            if(!isNaN(time)){
                if(element.type == "action"){
                    previousLengthAction += Number(element.time);
                }
                else if(element.type == "dialogue"){
                    previousLengthDialogue += Number(element.time);
                }
            }

            if(element.type == "action"){
                action.push({line:element.line, length: previousLengthAction, scene:currentScene });
                dialogue.push({line:undefined, length: previousLengthDialogue, scene:undefined });
            }
            else if(element.type == "dialogue"){
                action.push({line:undefined, length: previousLengthAction, scene:undefined });
                dialogue.push({line:element.line, length: previousLengthDialogue, scene:currentScene });
            }
        }
    });
    return {action:action, dialogue:dialogue};
};

const getWordCount = (script: string): number => {
    return ((script || '').match(/\S+/g) || []).length 
}
const getCharacterCount = (script: string): number => {
    return script.length 
}
const getCharacterCountWithoutWhitespace = (script: string): number => {
    return ((script || '').match(/\S+?/g) || []).length 
}
const getLineCount = (script:string): number =>{
    return ((script || '').match(/\n/g) || []).length 
}
const getLineCountWithoutWhitespace = (script:string): number =>{
    return ((script || '').match(/^.*\S.*$/gm) || []).length 
}

const createLengthStatistics = (script: string, pdf:pdfstats, parsed:parseoutput): lengthStatistics => {
    return {
        characters: getCharacterCount(script),
        characterswithoutwhitespace: getCharacterCountWithoutWhitespace(script),
        lines: getLineCount(script),
        lineswithoutwhitespace: getLineCountWithoutWhitespace(script),
        words: getWordCount(script),
        pagesreal: pdf.pagecountReal,
        pages: pdf.pagecount,
        scenes: parsed.properties.scenes.length
    }
}

const createDurationStatistics = (parsed: parseoutput): durationStatistics => {
    let lengthcharts =  getLengthChart(parsed);
    return {
        dialogue: secondsToString(parsed.lengthDialogue),
        action: secondsToString(parsed.lengthAction),
        total: secondsToString(parsed.lengthDialogue + parsed.lengthAction),
        lengthchart_action: lengthcharts.action,
        lengthchart_dialogue: lengthcharts.dialogue
    }
}

export const retrieveScreenPlayStatistics = async (script: string, parsed: parseoutput, config:FountainConfig): Promise<screenPlayStatistics> => {
    let pdfstats = await GeneratePdf("$STATS$", config, parsed, undefined);
    return {
        characterStats: createCharacterStatistics(parsed),
        sceneStats: createSceneStatistics(parsed),
        lengthStats: createLengthStatistics(script, pdfstats, parsed),
        durationStats: createDurationStatistics(parsed)
    }
}
