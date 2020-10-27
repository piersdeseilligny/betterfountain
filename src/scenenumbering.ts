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

interface SceneNumberingSchema {

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
    getNext(onLeft: string[]): string;

    /** Get a number smaller than all those provided
     */
    getPrevious(onRight: string[]): string;
}

// inspired by https://johnaugust.com/2007/renumbering
export class StandardSceneNumberingSchema
    implements SceneNumberingSchema {

    // "3" comes before "A3"
    compare(a: string, b: string): number {
        const splitA = StandardSceneNumberingSchema.toNumeric(a);
        const splitB = StandardSceneNumberingSchema.toNumeric(b);
        return StandardSceneNumberingSchema.compareNumeric(splitA, splitB);
    }

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

    // if a screenplay has "3", it must have used "1" and "2" at some point
    deduceUsedNumbers(existing: string[]): string[] {
        const result: string[] = [];
        existing.forEach(s => {
            result.push(s);
            const vals = StandardSceneNumberingSchema.toNumeric(s);

            while (vals.length > 0) {
                const index = vals.length - 1;
                while (vals[index] > 0) {
                    result.push(StandardSceneNumberingSchema.toSerial(vals));
                    vals[index] = vals[index] - 1;
                }
                while (vals[index] < 0) {
                    result.push(StandardSceneNumberingSchema.toSerial([0]));
                    result.push(StandardSceneNumberingSchema.toSerial(vals));
                    vals[index] = vals[index] + 1;
                }
                vals.pop();
            }
        })
        return result.filter(onlyUnique).sort(this.compare);

        function onlyUnique(value: string, index: number, self: string[]) {
            return self.indexOf(value) === index;
        }
    }

    // a scene inserted between "3" and "4" is "A3"
    getInBetween(a: string, b: string, except?: string[]): string {
        // assume a,b are already in order
        try {
            const left = StandardSceneNumberingSchema.toNumeric(a);
            const right = StandardSceneNumberingSchema.toNumeric(b);
            for (var index = 0; ; index++) {
                const mid = left.slice();
                while (mid.length <= index) mid.push(0);
                while (mid.length - 1 > index) mid.pop();
                mid[index]++;
                const serial = StandardSceneNumberingSchema.toSerial(mid)
                if (StandardSceneNumberingSchema.compareNumeric(mid, right) < 0) {
                    if (!(except && except.includes(serial)))
                        return serial;
                    return this.getInBetween(a, serial, except);
                }
            }
        } catch {
            return "?"
        }
    }

    // 'smalls' have all been used. return a scene number bigger
    getNext(smalls: string[]): string {
        if (smalls.length == 0) return "1";
        const valids = smalls.filter(v => v);
        const last = valids.sort(this.compare)[valids.length - 1];
        const biggest = StandardSceneNumberingSchema.toNumeric(last);
        return (biggest[0] + 1).toString();
    }

    // 'bigs' have all been used. return a scene number smaller
    getPrevious(bigs: string[]): string {
        if (bigs.length == 0) return "1";
        const valids = bigs.filter(v => v);
        const first = valids.sort(this.compare)[0];
        const smallest = StandardSceneNumberingSchema.toNumeric(first)[0];
        return StandardSceneNumberingSchema.toSerial([smallest - 1]);
    }

    // helpers

    static toNumeric = function (s: string): number[] {
        var zeros;
        var digits: number = null;
        if (zeros = s.match(/^[A-Z]*0(0+)$/)) {
            digits = -zeros[1].length;
        }
        else {
            digits = +s.match(/\d+$/)[0]
        }

        const result: number[] = [];
        const re = /[A-Z]/g;
        var m;
        while (m = re.exec(s))
            result.push(m[0].charCodeAt(0) - 64)
        result.push(digits);
        return result.reverse();
    }

    static toSerial = function (n: number[]): string {
        const m = n.slice();
        const first = m.shift();
        const letters = m.reverse().map(num => String.fromCharCode(num + 64));
        return letters.join("") + (first >= 0 ? first.toString() : "0".repeat(1 - first));
    }

}
