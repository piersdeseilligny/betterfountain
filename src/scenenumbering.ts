import * as diff from 'diff';

export enum SceneNumberingSchemas {
    "Standard"
};

export function generateSceneNumbers(currentSceneNumbers: string[], schemaType?: SceneNumberingSchemas): string[] {

    const schema = makeSceneNumberingSchema(schemaType);
    const used = schema.deduceUsedNumbers(currentSceneNumbers.filter(v => v));
    const alignment = expandChanges(diff.diffArrays(used, currentSceneNumbers));

    const findNextKnownNumber = function (start: number, direction: number): string {
        var i = start;
        while (true) {
            i += direction;
            if (i < 0) return null;
            if (i >= alignment.length) return null;
            if (!alignment[i].added && !alignment[i].removed) return alignment[i].value[0];
        }
    }

    var previous: string;
    return alignment
        .map((alignmentPair, i) => {
            if (alignmentPair.removed) return null;
            if (!alignmentPair.added) {
                // keep existing scene number
                previous = alignmentPair.value[0];
                return previous;
            }
            // calculate unknown scene number
            const left = previous || findNextKnownNumber(i, -1);
            const right = findNextKnownNumber(i, 1);
            const inserted = right == null ? schema.getNext(used) /*
                        */ : left == null ? schema.getPrevious(used) /*
                        */ : schema.getInBetween(left, right, used);
            used.push(inserted);
            previous = inserted;
            return inserted;
        })
        .filter(v => v);
}

function makeSceneNumberingSchema(_schemaType: SceneNumberingSchemas) {
    // future Strategies could be selectable in the settings
    return new StandardSceneNumberingSchema();
}

// turns a Change like
// {count:2,values:['a','b']} into 
// [{values:['a']},{values:['b']}]
// because I want to iterate on them individually
function expandChanges(changes: diff.ArrayChange<string>[]): diff.ArrayChange<string>[] {
    const result: diff.ArrayChange<string>[] = [];
    while (changes.length > 0) {
        const change = changes.shift();
        while (change.count-- > 1) {
            const copy = { ...change };
            copy.value = [];
            copy.value.push(change.value.shift());
            result.push(copy);
        }
        result.push(change);
    }
    return result;
}

export interface SceneNumberingSchema {

    /** For sorting purposes */
    compare(a: string, b: string): number;

    /** To deduce which numbers have been used already
     *     in case the author has deleted some. 
     *     Numbers ideally shouldn't be reused even 
     *     if deleted.
     */
    deduceUsedNumbers(existing: string[]): string[];

    /** Calculate what an inserted scene should be numbered.
     */
    getInBetween(onLeft: string, onRight: string, except?: string[]): string;

    /** Get a number bigger than all those provided
     */
    getNext(used: string[]): string;

    /** Get a number smaller than all those provided
     */
    getPrevious(used: string[]): string;
}

/** Base class for anything that behaves like a series of non-negative number
 *      i.e. 2 < 3 < 3.1 < 3.2 < 3.2.1
 *   derived classes need only determine how this series is displayed
 */
abstract class NumericSeriesSceneNumberingSchema
    implements SceneNumberingSchema {

    compare(a: string, b: string): number {
        const nA = this.toNumeric(a);
        const nB = this.toNumeric(b);
        return NumericSeriesSceneNumberingSchema.compareNumeric(nA, nB);
    }

    // if a screenplay has "3", it must have used "1" and "2" at some point
    deduceUsedNumbers(existing: string[]): string[] {
        var result: string[] = [];
        existing.forEach(s => {
            result.push(s);
            const vals = this.toNumeric(s);

            while (vals.length > 0) {
                const index = vals.length - 1;
                while (vals[index] > 0) {
                    result.push(this.toDisplay(vals));
                    vals[index] = vals[index] - 1;
                }
                while (vals[index] < 0) {
                    result.push(this.toDisplay([0]));
                    result.push(this.toDisplay(vals));
                    vals[index] = vals[index] + 1;
                }
                vals.pop();
                result = result.filter(onlyUnique);
            }
        })
        return result.filter(onlyUnique).sort((a, b) => this.compare(a, b));

        function onlyUnique(value: string, index: number, self: string[]) {
            return self.indexOf(value) === index;
        }
    }

    // a scene inserted between [3] and [4] is [3,1] (think "3.1" or "A3")
    getInBetween(a: string, b: string, except?: string[]): string {
        try {
            const left = this.toNumeric(a);
            const right = this.toNumeric(b);
            // check a,b are already in order
            if (NumericSeriesSceneNumberingSchema.compareNumeric(left, right) >= 0) return "?";

            for (var index = 0; index < 100; index++) {
                const mid = left.slice();
                while (mid.length <= index) mid.push(0);
                while (mid.length - 1 > index) mid.pop();
                mid[index]++;
                const serial = this.toDisplay(mid)
                if (NumericSeriesSceneNumberingSchema.compareNumeric(mid, right) < 0) {
                    if (!except || !except.includes(serial)) return serial;
                    return this.getInBetween(a, serial, except);
                }
            }
        } catch { }
        return "?"
    }

    // return the next number bigger than what's in @used
    getNext = (used: string[]): string => {
        if (used.length == 0) return "1";
        const valids = used.filter(v => v).map(v => this.toNumeric(v));
        const last = valids.sort(NumericSeriesSceneNumberingSchema.compareNumeric)[valids.length - 1];
        return (last[0] + 1).toString();
    }

    // return the next number smaller than what's in @used
    getPrevious = (used: string[]): string => {
        if (used.length == 0) return "1";
        const valids = used.filter(v => v).map(v => this.toNumeric(v));
        const first = valids.sort(NumericSeriesSceneNumberingSchema.compareNumeric)[0];
        const newbie = first[0] - 1;
        if (newbie > 0) return this.toDisplay([newbie]);
        return this.getInBetween("0", this.toDisplay(first));
    }

    // numeric form is used because it's more intuitive to us coders.
    // [2,1,1] < [2,1,2] < [2,2] < [3] 
    static compareNumeric(a: number[], b: number[]): number {
        const min = Math.min(a.length, b.length);
        for (var i = 0; i < min; i++) {
            const fromA = a[i];
            const fromB = b[i];
            var comparison = fromA - fromB;
            if (comparison != 0) return comparison;
        }
        if (a.length > min) return 1;
        if (b.length > min) return -1;
        return 0;
    }

    /** How to interpret the Scene Number as a series of numbers */
    abstract toNumeric(s: string): number[];
    /** How to turn the numbers back into a scene number for the script */
    abstract toDisplay(n: number[]): string;
}

/** inspired by https://johnaugust.com/2007/renumbering
 */
export class StandardSceneNumberingSchema
    extends NumericSeriesSceneNumberingSchema {

    toNumeric = function (s: string): number[] {
        const format = s.match(/^([A-Z0]*)([1-9]\d*)?$/);
        const letters = format[1];
        const digits = format[2];
        const result: number[] = [];

        // letters and leading zeros
        result.push(...Array.from(letters).map(char => char == '0' ? 0 : char.charCodeAt(0) - 64))

        // positives
        if (digits) result.push(+digits)

        return result.reverse();
    }

    toDisplay = function (n: number[]): string {
        const m = n.slice();
        const first = m.shift();
        const letters = m.reverse().map(num => num == 0 ? '0' : String.fromCharCode(num + 64));
        return letters.join("") + (first >= 0 ? first.toString() : "0".repeat(1 - first));
    }

}
