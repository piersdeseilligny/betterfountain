import * as sn from "../scenenumbering";

describe("Scene Number Strategy: Standard", () => {

    const standard = new sn.StandardSceneNumberingSchema();

    it("compare 3<4", () => {
        expect(standard.compare("3", "4")).toBe(-1);
        expect(standard.compare("4", "3")).toBe(1);
    }, 10)
    it("compare 3<A3", () => {
        expect(standard.compare("3", "A3")).toBe(-1);
        expect(standard.compare("A3", "3")).toBe(1);
    }, 10)
    it("compare A3<B3", () => {
        expect(standard.compare("A3", "B3")).toBe(-1);
        expect(standard.compare("B3", "A3")).toBe(1);
    }, 10)
    it("compare A3<AA3", () => {
        expect(standard.compare("A3", "AA3")).toBe(-1);
        expect(standard.compare("AA3", "A3")).toBe(1);
    }, 10)
    it("compare 0<A0", () => {
        expect(standard.compare("0", "A0")).toBe(-1);
        expect(standard.compare("A0", "0")).toBe(1);
    }, 10)
    it("compare 00<A00", () => {
        expect(standard.compare("00", "A00")).toBe(-1);
        expect(standard.compare("A00", "00")).toBe(1);
    }, 10)

    it("deduceUsedNumbers", () => {
        expect(standard.deduceUsedNumbers(["3"]))
            .toEqual(["1", "2", "3"]);
    }, 10)
    it("deduceUsedNumbers", () => {
        expect(standard.deduceUsedNumbers(["1", "A2", "3", "B5"]))
            .toEqual(["1", "2", "A2", "3", "4", "5", "A5", "B5"]);
    }, 10)
    it("deduceUsedNumbers", () => {
        expect(standard.deduceUsedNumbers(["BC3"]))
            .toEqual(["1", "2", "3", "A3", "B3", "C3", "AC3", "BC3"]);
    }, 10)

    it("getInBetween", () => {
        expect(standard.getInBetween("1", "2")).toBe("A1");
        expect(standard.getInBetween("2", "4")).toBe("3");
    }, 10)

    it("Generate", () => {
        expect(sn.generateSceneNumbers(["1", null, "2"]))
            .toEqual(["1", "A1", "2"]);
    }, 10)
    it("Generate [ 1 2 5 3 4 ]", () => {
        expect(sn.generateSceneNumbers(["1", "2", "5", "3", "4"]))
            .toEqual(["1", "2", "A2", "3", "4"]);
    }, 10)
    it("Generate [ _ _ ]", () => {
        expect(sn.generateSceneNumbers([null, null]))
            .toEqual(["1", "2"]);
    }, 10)
    it("Generate [ 1 _ ]", () => {
        expect(sn.generateSceneNumbers(["1", null]))
            .toEqual(["1", "2"]);
    }, 10)
    it("Generate [ 2 _ ]", () => {
        expect(sn.generateSceneNumbers(["2", null]))
            .toEqual(["2", "3"]);
    }, 10)
    it("Generate [ 2 _ 4 ]", () => {
        expect(sn.generateSceneNumbers(["2", null, "4"]))
            .toEqual(["2", "A2", "4"]); // because "3" must have been used.
    }, 10)
    it("Generate [ _ 1 ]", () => {
        expect(sn.generateSceneNumbers([null, "1"]))
            .toEqual(["0", "1"]);
    }, 10)
    it("Generate [ _ _ 2 ]", () => {
        expect(sn.generateSceneNumbers([null, null, "2"]))
            .toEqual(["0", "A0", "2"]); // because "1" must have been used.
    }, 10)
    it("Generate [ _ 2 ]", () => {
        expect(sn.generateSceneNumbers([null, "2"]))
            .toEqual(["0", "2"]); // because "1" must have been used.
    }, 10)
    it("Generate [ _ 0 2 ]", () => {
        expect(sn.generateSceneNumbers([null, "0", "2"]))
            .toEqual(["00", "0", "2"]); // because "00" is like -1
    }, 10)
    it("Generate [ 00 _ 0 ]", () => {
        expect(sn.generateSceneNumbers(["00", null, "0"]))
            .toEqual(["00", "A00", "0"]);
    }, 10)
    it("Generate [ 00 A00 _ 0 ]", () => {
        expect(sn.generateSceneNumbers(["00", "A00", null, "0"]))
            .toEqual(["00", "A00", "B00", "0"]);
    }, 10)
})
