import * as THREE from 'three'

import { makeBox } from './utils'

export class Inventory extends THREE.Object3D {
    constructor() {
        super();
        this.options = [];

        for (let i=0; i<7; i++) {
            this.addTestObj();
        }
    }

    addTestObj() {
        this.addOption(makeBox(0.08));
    }

    setBasePosition(parent) {
        this.position.set(
            parent.position.x,
            parent.position.y - 0.2,
            parent.position.z
        );
    }

    updateOptions() {
        const spread = 160.0 * (Math.PI/180);
        const theta = spread / (this.options.length - 1)
        // run through the options and reset positions
        this.options.forEach((o,i) => {
            o.rotation.y = ( (i * theta) - (spread/2) );
        });
    }

    addOption(obj) {
        const g = new THREE.Group();
        obj.position.set(0, 0, -0.18);
        
        g.add(obj);
        super.add(g);

        this.options.push(g);
        this.updateOptions();
    }

    clearOptions() {

    }
}