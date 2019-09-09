import {regex as fountainRegexes, parse as fountainParse} from "./afterwriting-parser"
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

const createCharacterStatistics = (script: string): dialogueStatisticPerCharacter[] => {
    const regexToGetCharacterAndDialogue = new RegExp(`^(${fountainRegexes.character.source.replace("^", "")})\n.*$\n\n`, "gm")
    const regexToGetCharactersOnly = new RegExp(fountainRegexes.character.source, fountainRegexes.character.flags + "gm")

    const charactersWithDialogue = script.match(regexToGetCharacterAndDialogue)

    const dialoguePieces: dialoguePiece[] = []
    charactersWithDialogue && charactersWithDialogue.forEach((charAndDialogue) => {
        const character = charAndDialogue.match(regexToGetCharactersOnly)[0]
        // Remove all parentheticals
        .replace(/(?: )\(.+\)$/, "")
        // Remove all dual dialogue markers
        .replace(/(?: )\^/, "")
        .trim()
        const speech = charAndDialogue.replace(regexToGetCharactersOnly, "").replace(/\n/gm, "")
        dialoguePieces.push({
            character,
            speech
        })
    })

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
        const wordsSpoken = allDialogueCombined.split(" ").length
        characterStats.push({
            name: singledialPerChar,
            speakingParts,
            wordsSpoken,
        })
    })

    characterStats.sort((a, b) => {
        return b.speakingParts - a.speakingParts
    })

    return characterStats
}

const createSceneStatistics = (script: string): singleSceneStatistic[] => {
    const regexAllSceneHeadings = new RegExp(fountainRegexes.scene_heading.source, fountainRegexes.scene_heading.flags + "gm")
    const sceneHeadings = script.match(regexAllSceneHeadings)
    const sceneStats: singleSceneStatistic[] = []
    sceneHeadings && sceneHeadings.forEach((scene) => {
        sceneStats.push({
            title: scene
        })
    })
    return sceneStats
}

const getTotalWordCount = (script: string): number => {
    const totalWordCount = script.trimLeft().trimRight().split(" ")
    if (totalWordCount.length === 1 && totalWordCount[0] === "") {
        return 0
    } else {
        return totalWordCount.length
    }
}

const createWordCountStatistics = (scriptNormalised: string): wordCountStatistics => {
    return {
        total: getTotalWordCount(scriptNormalised)
    }
}

const createLengthStatistics = (scriptNormalised: string): lengthStatistics => {
    const documentFountainParsed = fountainParse(scriptNormalised, {}, false)
    const actionDuration = documentFountainParsed.lengthAction / 20
    return {
        dialogue: secondsToString(documentFountainParsed.lengthDialogue),
        action: secondsToString(actionDuration),
        total: secondsToString(documentFountainParsed.lengthDialogue + actionDuration)
    }
}

export const retrieveScreenPlayStatistics = (script: string): screenPlayStatistics => {
    // These adjustments are necessary for Windows style CRLF carriage returns
    const scriptNormalised = script.replace(/\r\n/gm,   "\n")
    return {
        characterStats: createCharacterStatistics(scriptNormalised),
        sceneStats: createSceneStatistics(scriptNormalised),
        wordCountStats: createWordCountStatistics(scriptNormalised),
        lengthStats: createLengthStatistics(scriptNormalised)
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
    <p>Length (approx.): ${stats.lengthStats.total}</p>
    <p>Dialogue (approx.): ${stats.lengthStats.dialogue}</p>
    <p>Action (approx.): ${stats.lengthStats.action}</p>
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
