import * as THREE from 'three'

import { makeBox } from './utils'

export class Inventory extends THREE.Object3D {
    constructor() {
        super();
        this.options = [];

        for (let i=0; i<5; i++) {
            this.addTestObj();
        }
    }

    addTestObj() {
        this.addOption(makeBox(0.1));
    }


    updateOptions() {
        const spread = 160.0 * Math.PI/180;

        // run through the options and reset positions
        this.options.forEach(o => {
            
        });
    }

    addOption(obj) {
        const g = new THREE.Group();
        g.position.set(0, 0, -1);
        
        g.add(obj);
        super.add(g);


        this.options.push(g);

        this.updateOptions();
    }

    clearOptions() {

    }
}