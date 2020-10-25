import * as sn from "../scenenumbering";

describe("Scene Number Strategy: Standard", () => {

    const standard = new sn.StandardSceneNumberingStrategy();

    it("compare", () => {
        expect(standard.compare("3", "4")).toBe(-1);
        expect(standard.compare("4", "3")).toBe(1);
    })
    it("compare", () => {
        expect(standard.compare("3", "A3")).toBe(-1);
        expect(standard.compare("A3", "3")).toBe(1);
    })
    it("compare", () => {
        expect(standard.compare("B3", "A3")).toBe(1);
        expect(standard.compare("A3", "B3")).toBe(-1);
    })
    it("compare", () => {
        expect(standard.compare("A3", "AA3")).toBe(-1);
        expect(standard.compare("AA3", "A3")).toBe(1);
    })

    it("deduceUsedNumbers", () => {
        expect(standard.deduceUsedNumbers(["3"]))
            .toEqual(["1", "2", "3"]);
    })
    it("deduceUsedNumbers", () => {
        expect(standard.deduceUsedNumbers(["1", "A2", "3", "B5"]))
            .toEqual(["1", "2", "A2", "3", "4", "5", "A5", "B5"]);
    })
    it("deduceUsedNumbers", () => {
        expect(standard.deduceUsedNumbers(["BC3"]))
            .toEqual(["1", "2", "3", "A3", "B3", "C3", "AC3", "BC3"]);
    })

    it("getInBetween", () => {
        expect(standard.getInBetween("1", "2")).toBe("A1");
        expect(standard.getInBetween("2", "4")).toBe("3");
    })

    it("Generate", () => {
        expect(sn.GenerateSceneNumbers(["1", null, "2"]))
            .toEqual(["1", "A1", "2"]);
    })
    it("Generate [ 1 2 5 3 4 ]", () => {
        expect(sn.GenerateSceneNumbers(["1", "2", "5", "3", "4"]))
            .toEqual(["1", "2", "A2", "3", "4"]);
    })
    it("Generate [ _ _ ]", () => {
        expect(sn.GenerateSceneNumbers([null, null]))
            .toEqual(["1", "2"]);
    })
    it("Generate [ 1 _ ]", () => {
        expect(sn.GenerateSceneNumbers(["1", null]))
            .toEqual(["1", "2"]);
    })
    it("Generate [ 2 _ ]", () => {
        expect(sn.GenerateSceneNumbers(["2", null]))
            .toEqual(["2", "3"]);
    })
    it("Generate [ 2 _ 4 ]", () => {
        expect(sn.GenerateSceneNumbers(["2", null, "4"]))
            .toEqual(["2", "A2", "4"]); // because "3" must have been used.
    })
    it("Generate [ _ _ 2 ]", () => {
        expect(sn.GenerateSceneNumbers([null, null, "2"]))
            .toEqual(["A0", "B0", "2"]); // because "1" must have been used.
    })

})
