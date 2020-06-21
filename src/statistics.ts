import { parseoutput } from "./afterwriting-parser"
import { secondsToString } from "./utils"

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

type wordCountStatistics = {
    total: number
}

type lengthStatistics = {
    dialogue: string
    action: string
    total: string
}

type screenPlayStatistics = {
    characterStats: dialogueStatisticPerCharacter[]
    sceneStats: singleSceneStatistic[]
    wordCountStats: wordCountStatistics
    lengthStats: lengthStatistics
}

const createCharacterStatistics = (parsed: parseoutput): dialogueStatisticPerCharacter[] => {
    const dialoguePieces: dialoguePiece[] = [];
    for (var i=0; i<parsed.tokens.length;)
    {
        if (parsed.tokens[i++].type==="dialogue_begin")
        {
            const character = parsed.tokens[i].name()
            var speech = "";
            while (parsed.tokens[i++].type!=="dialogue_end")
            {
                while (parsed.tokens[i].type==="dialogue")        
                {
                    speech += parsed.tokens[i].text + " "
                    i++;
                }
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

const getWordCount = (script: string): number => {
    return ((script || '').match(/\S+/g) || []).length 
}

const createWordCountStatistics = (script: string): wordCountStatistics => {
    return {
        total: getWordCount(script)
    }
}

const createLengthStatistics = (parsed: parseoutput): lengthStatistics => {
    return {
        dialogue: secondsToString(parsed.lengthDialogue),
        action: secondsToString(parsed.lengthAction),
        total: secondsToString(parsed.lengthDialogue + parsed.lengthAction)
    }
}

export const retrieveScreenPlayStatistics = (script: string, parsed: parseoutput): screenPlayStatistics => {
    return {
        characterStats: createCharacterStatistics(parsed),
        sceneStats: createSceneStatistics(parsed),
        wordCountStats: createWordCountStatistics(script),
        lengthStats: createLengthStatistics(parsed)
    }
}

const pageStyle = `
<style>
    body {
        animation: fadein 0.5s;
    }

    @keyframes fadein {
        from {
            opacity:0;
        }
        to {
            opacity:1;
        }
    }

    table {
        border-collapse: collapse;
        width: 100%;
        color: black;
    }

    th, td {
        text-align: left;
        padding: 8px;
    }

    tr:nth-child(even){background-color: #f2f2f2}
    tr:nth-child(odd){background-color: #e3e3e3}

    th {
        background-color: #4c90af;
        color: white;
    }
</style>
`

export const statsAsHtml = (stats: screenPlayStatistics): string => {
    return `
<body>
${pageStyle}
    <h1>General</h1>
    <p>Total word count: ${stats.wordCountStats.total}</p>
    <p>Length (approx.): ${stats.lengthStats.total}
        <ul>
            <li>Dialogue (approx.): ${stats.lengthStats.dialogue}</li>
            <li>Action (approx.): ${stats.lengthStats.action}</li>
            </ul></p>
    <h1>Character statistics</h1>
    <table style="width:100%">
        <tr>
            <th>Character name</th>
            <th>Speaking parts</th>
            <th>Total words spoken</th>
        </tr>
        ${stats.characterStats.reduce((prev, curr) => {
            return `${prev}
            <tr>
                <td>${curr.name}</td>
                <td>${curr.speakingParts}</td>
                <td>${curr.wordsSpoken}</td>
            </tr>
            `
        }, '')}
    </table>

    <h1>Scene statistics</h1>
    <p>Total amount of scenes: ${stats.sceneStats.length}</p>
</body>
    `
}
