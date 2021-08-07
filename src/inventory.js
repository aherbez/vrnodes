import * as THREE from 'three'

import { makeBox } from './utils'

export class Inventory extends THREE.Object3D {
    constructor(root) {
        super();

        this.active = true;
        this.root = root;
        this.options = [];

        this.objLookup = {}; // UUID to inv slot

        this.raycast = new THREE.Raycaster();

        for (let i=0; i<7; i++) {
            this.addTestObj();
        }
    }

    show() {
        this.position.set(
            this.root.position.x,
            this.root.position.y - 0.2,
            this.root.position.z
        );
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }

    addTestObj() {
        const b = makeBox(0.08);
        this.addOption(b);
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
        const theta = spread / (this.options.length - 1);

        this.options.forEach((o,i) => {
            o.object.rotation.y = ( (i * theta) - (spread/2) );
        });

    }

    addOption(obj) {
        const g = new THREE.Group();
        obj.position.set(0, 0, -0.18);
        
        this.objLookup[obj.uuid] = this.options.length;

        g.add(obj);
        super.add(g);

        this.options.push({
            object: g,
            hover: false
        });
        this.updateOptions();
    }

    clearOptions() {

    }

    update(dt) {
        if (!this.visible) return;
 
        this.options.forEach((opt, i) => {
            if (opt.hover) {
                opt.object.scale.set(1.2,1.2,1.2);
            } else {
                opt.object.scale.set(1,1,1);
            }
        });
    }

    checkRays() {
        if (!this.visible) return;

        this.options.forEach(obj => {
            obj.hover = false;
        })

        this.raycast.setFromCamera(new THREE.Vector2(), this.root);
        const intersects = this.raycast.intersectObjects(this.children, true);
        
        if (intersects.length > 0) {
            // console.log(intersects);
        
            intersects.forEach(hit => {
                const index = this.objLookup[hit.object.uuid];
                if (index !== undefined) {
                    this.options[index].hover = true;
                }
            })
        }
    }
}