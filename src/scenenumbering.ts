import * as diff from 'diff';

export function GenerateSceneNumbers(currentSceneNumbers: string[], strategy?: SceneNumberingStrategy): string[] {
    strategy = strategy || new StandardSceneNumberingStrategy();

    const used = strategy.deduceUsedNumbers(currentSceneNumbers.filter(v => v));
    const alignment = expandChanges(diff.diffArrays(used, currentSceneNumbers));

    const findNextStatic = function (start: number, direction: number): string {
        var i = start;
        while (true) {
            i += direction;
            if (i < 0) return strategy.zeroth();
            if (i >= alignment.length) return null;
            if (!alignment[i].added && !alignment[i].removed) return alignment[i].value[0];
        }
    }

    var previous: string;
    return alignment
        .map((change, i) => {
            if (change.removed) return null;
            if (!change.added) {
                previous = change.value[0];
                return previous;
            }
            const left = previous || findNextStatic(i, -1);
            const right = findNextStatic(i, 1);
            const inserted =
                right == null ? strategy.getNext(used)
                    : strategy.getInBetween(left, right, used);
            used.push(inserted);
            previous = inserted;
            return inserted;
        })
        .filter(v => v);
}

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

interface SceneNumberingStrategy {

    /* For sorting purposes */
    compare(a: string, b: string): number;

    /* To deduce which numbers have been used already
        in case the author has deleted some. 
        Numbers ideally shouldn't be reused even 
        if deleted. */
    deduceUsedNumbers(existing: string[]): string[];

    /* Calculate what an inserted scene should be numbered. */
    getInBetween(a: string, b: string, illegal?: string[]): string;

    /* Get a number bigger than all those provided */
    getNext(smalls: string[]): string;

    /* what if you insert before the first scene? */
    zeroth(): string;
}


export class StandardSceneNumberingStrategy
    implements SceneNumberingStrategy {

    // "3" comes before "A3"
    compare(a: string, b: string): number {
        const splitA = StandardSceneNumberingStrategy.toNumeric(a);
        const splitB = StandardSceneNumberingStrategy.toNumeric(b);
        return StandardSceneNumberingStrategy.compareNumeric(splitA, splitB);
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

    // if a play has "3", it must have used "1" and "2" at some point
    deduceUsedNumbers(existing: string[]): string[] {
        const result: string[] = [];
        existing.forEach(s => {
            result.push(s);
            const vals = StandardSceneNumberingStrategy.toNumeric(s);

            while (vals.length > 0) {
                const index = vals.length - 1;
                while (vals[index] > 0) {
                    result.push(StandardSceneNumberingStrategy.toSerial(vals));
                    vals[index] = vals[index] - 1;
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
    getInBetween(a: string, b: string, illegal?: string[]): string {
        // assume a,b are already in order
        const left = StandardSceneNumberingStrategy.toNumeric(a);
        const right = StandardSceneNumberingStrategy.toNumeric(b);
        for (var index = 0; ; index++) {
            const mid = left.slice();
            if (mid.length <= index) mid.push(0);
            mid[index]++;
            while (mid.length - 1 > index) mid.pop();
            const serial = StandardSceneNumberingStrategy.toSerial(mid)
            if (StandardSceneNumberingStrategy.compareNumeric(mid, right) < 0) {
                if (!(illegal && illegal.includes(serial)))
                    return serial;
                return this.getInBetween(a, serial, illegal);
            }
        }
    }

    getNext(smalls: string[]): string {
        if (smalls.length == 0) return "1";
        const valids = smalls.filter(v => v);
        const last = valids.sort(this.compare)[valids.length - 1];
        const biggest = StandardSceneNumberingStrategy.toNumeric(last);
        return (biggest[0] + 1).toString();
    }

    // hmmm
    zeroth(): string { return "0" }

    // helpers
    static toNumeric = function (s: string): number[] {
        const result: number[] = [];
        const re = /[A-Z]/g;
        var m;
        while (m = re.exec(s))
            result.push(m[0].charCodeAt(0) - 64)
        result.push(+s.match(/\d+$/)[0]);
        return result.reverse();
    }

    static toSerial = function (n: number[]): string {
        const m = n.slice();
        const first = m.shift();
        const letters = m.reverse().map(num => String.fromCharCode(num + 64));
        return letters.join("") + first;
    }

}
