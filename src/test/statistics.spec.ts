import { retrieveScreenPlayStatistics } from "../statistics";
import * as fs from "fs"
import * as path from "path"

const bigFishAssertions = (bigFishScript: string) => {
    const stats = retrieveScreenPlayStatistics(bigFishScript)
    expect(stats.wordCountStats.total).toBe(24818)
    expect(stats.characterStats.length).toBe(42)
    stats.characterStats.forEach((charStat) => {
        expect(typeof charStat.name).toBe("string")
        expect(charStat.name.length).toBeGreaterThan(0)
        expect(charStat.speakingParts).toBeGreaterThan(0)
        expect(charStat.wordsSpoken).toBeGreaterThan(0)
    })
    expect(stats.sceneStats.length).toBe(190)
    expect(stats.lengthStats.total).toBe("01:59:36")
    expect(stats.lengthStats.dialogue).toBe("00:55:39")
    expect(stats.lengthStats.action).toBe("01:03:57")
}

describe("Statistics", () => {
    it("Big Fish CRLF", () => {
        const bigFish = fs.readFileSync(path.resolve(__dirname, "./big_fish_crlf.fountain"), "utf-8")
        bigFishAssertions(bigFish)
    })

    it("Big Fish LF", () => {
        const bigFish = fs.readFileSync(path.resolve(__dirname, "./big_fish_lf.fountain"), "utf-8")
        bigFishAssertions(bigFish)
    })

    it("Blank Canvas script", () => {
        const stats = retrieveScreenPlayStatistics("")
        expect(stats.characterStats.length).toBe(0)
        expect(stats.sceneStats.length).toBe(0)
        expect(stats.wordCountStats.total).toBe(0)
        expect(stats.lengthStats.total).toBe("00:00:00")
        expect(stats.lengthStats.dialogue).toBe("00:00:00")
        expect(stats.lengthStats.action).toBe("00:00:00")
    })

    it("Almost Blank Canvas script", () => {
        const stats = retrieveScreenPlayStatistics("2134wrdfhf sdhj;dfshl")
        expect(stats.characterStats.length).toBe(0)
        expect(stats.sceneStats.length).toBe(0)
        expect(stats.wordCountStats.total).toBe(2)
        expect(stats.lengthStats.total).toBe("00:00:01")
        expect(stats.lengthStats.dialogue).toBe("00:00:00")
        expect(stats.lengthStats.action).toBe("00:00:01")
    })
})
