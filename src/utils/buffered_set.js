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
            new Set(),
            new Set()
        ];

        this.newlyPresent = new Set();
        this.newlyAbsent = new Set();
    }

    get curr() {
        return this.sets[this.current];
    }

    get prev() {
        let prev = (this.current + 1) % 2;
        return this.sets[prev];
    }

    update(items) {
        this.current = (this.current + 1) % 2;
        this.curr.clear();
        
        items.forEach( i => {
            this.curr.add(i);
        })
        
        this.newlyAbsent = new Set(this.prev);
        for (let i of this.curr) {
            this.newlyAbsent.delete(i);
        }

        this.newlyPresent = new Set(this.curr);
        for (let i of this.prev) {
            this.newlyPresent.delete(i);
        }



    }

}

export { BufferedSet };