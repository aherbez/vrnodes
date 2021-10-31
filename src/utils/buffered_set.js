/**
 * BufferedSet
 * maintains two sets and swaps between them in a double-buffered manner
 * This might not be necessary, but seems safer than just trusting the gc
 * and making a new Set every frame
 */

class BufferedSet {
    constructor() {
        this.current = 0;
        this.sets = [
            new Map(),
            new Map()
        ];

        this.newlyPresent = new Map();
        this.newlyAbsent = new Map();
    }

    get curr() {
        return this.sets[this.current];
    }

    get prev() {
        let prev = (this.current + 1) % 2;
        return this.sets[prev];
    }

    update(items, keyFn) {
        this.current = (this.current + 1) % 2;
        this.curr.clear();
        
        items.forEach( i => {
            // this.curr.add(i);
            this.curr.set(keyFn(i), i);
        })
        
        this.newlyAbsent = new Map(this.prev);
        this.curr.forEach((v, k) => {
            this.newlyAbsent.delete(k);
        })
        /*
        for (let i of this.curr) {
            this.newlyAbsent.delete(i);
        }
        */

        this.newlyPresent = new Map(this.curr);
        // for (let i of this.prev) {
        //     this.newlyPresent.delete(i);
        // }
        this.prev.forEach((v,k) => {
            this.newlyPresent.delete(k);
        })


    }

}

export { BufferedSet };