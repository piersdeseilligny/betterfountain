import * as sn from "../scenenumbering";

describe("Scene Number Schema: Standard", () => {

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
    it("getInBetween (bad input)", () => {
        expect(standard.getInBetween("1", "1")).toBe("?");
        expect(standard.getInBetween("2", "1")).toBe("?");
    }, 10)

    it("generate [ 1 _ 2 ]", () => {
        expect(sn.generateSceneNumbers(["1", null, "2"]))
            .toEqual(["1", "A1", "2"]);
    }, 10)
    it("generate [ 1 2 5 3 4 ]", () => {
        expect(sn.generateSceneNumbers(["1", "2", "5", "3", "4"]))
            .toEqual(["1", "2", "A2", "3", "4"]);
    }, 10)
    it("generate [ _ _ ]", () => {
        expect(sn.generateSceneNumbers([null, null]))
            .toEqual(["1", "2"]);
    }, 10)
    it("generate [ 1 _ ]", () => {
        expect(sn.generateSceneNumbers(["1", null]))
            .toEqual(["1", "2"]);
    }, 10)
    it("generate [ 2 _ ]", () => {
        expect(sn.generateSceneNumbers(["2", null]))
            .toEqual(["2", "3"]);
    }, 10)
    it("generate [ 2 _ 4 ]", () => {
        expect(sn.generateSceneNumbers(["2", null, "4"]))
            .toEqual(["2", "A2", "4"]); // because "3" must have been used.
    }, 10)
    it("generate [ _ 1 ]", () => {
        expect(sn.generateSceneNumbers([null, "1"]))
            .toEqual(["A0", "1"]);
    }, 10)
    it("generate [ _ _ 2 ]", () => {
        expect(sn.generateSceneNumbers([null, null, "2"]))
            .toEqual(["A0", "B0", "2"]); // because "1" must have been used.
    }, 10)
    it("generate [ _ A0 2 ]", () => {
        expect(sn.generateSceneNumbers([null, "A0", "2"]))
            .toEqual(["A00", "A0", "2"]); // like 0.0.1 < 0.1 < 2
    }, 10)
    it("generate [ A00 _ A0 ]", () => {
        expect(sn.generateSceneNumbers(["A00", null, "A0"]))
            .toEqual(["A00", "B00", "A0"]); // like 0.0.1 < 0.0.2 < 0.1
    }, 10)
    it("generate [ A00 B00 _ A0 ]", () => {
        expect(sn.generateSceneNumbers(["A00", "B00", null, "A0"]))
            .toEqual(["A00", "B00", "C00", "A0"]);
    }, 10)
    it("generate [ 5 _ A5 ]", () => {
        expect(sn.generateSceneNumbers(["5", null, "A5"]))
            .toEqual(["5", "A05", "A5"]);
    }, 10)
})
