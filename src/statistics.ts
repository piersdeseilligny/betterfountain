import {regex as fountainRegexes} from "./afterwriting-parser"

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
    // dialogueDuration: number
}

type singleSceneStatistic = {
    title: string
}

type screenPlayStatistics = {
    characterStats: dialogueStatisticPerCharacter[]
    sceneStats: singleSceneStatistic[]
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
        const wordsSpoken = allDialogueCombined.split(/ +/i).length
        // const dialogueDuration = calculateDialogueDuration(allDialogueCombined)
        characterStats.push({
            name: singledialPerChar,
            speakingParts,
            wordsSpoken,
            // dialogueDuration
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

export const retrieveScreenPlayStatistics = (script: string): screenPlayStatistics => {
    return {
        characterStats: createCharacterStatistics(script),
        sceneStats: createSceneStatistics(script)
    }
}

const tableStyle = `
<style>
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
${tableStyle}
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
