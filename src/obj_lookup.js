import * as THREE from 'three';

import { BufferedSet } from './utils/buffered_set';

class ObjLookup {
    constructor(camera, root) {
        this.raycast = new THREE.Raycaster();
        this.cam = camera;
        this.root = root;
        console.log(`children: ${this.root.children.length}`);
        console.log('ObjLookup: ', this.cam, this.root);

        this.onClickCBs = new Map();
        this.onMouseOverCBs = new Map();
        this.onMouseOutCBs = new Map();

        this.lookingAt = new BufferedSet();

        window.addEventListener('click', () => this.onClick())
    }

    onClick() {
        this.lookingAt.curr.forEach( obj => {
            if (this.onClickCBs.has(obj)) {
                this.onClickCBs.get(obj)(obj);
            }
        })
        
    }

    setOnClick(object, cb) {
        this.onClickCBs.set(object.uuid, cb);
    }

    setMouseOver(object, cb) {
        this.onMouseOverCBs.set(object.uuid, cb);
    }

    setMouseOut(object, cb) {
        this.onMouseOutCBs.set(object.uuid, cb);
    }

    update(scene) {
        this.raycast.setFromCamera(new THREE.Vector2(), this.cam);
        const hits = this.raycast.intersectObjects(this.root.children, true);
        const objIds = hits.map(hit => {
            return hit.object.uuid;
        });

        this.lookingAt.update(objIds);
        
        this.lookingAt.newlyAbsent.forEach(id => {
            if (this.onMouseOutCBs.has(id)) {
                this.onMouseOutCBs.get(id)(id);
            }
        });
        this.lookingAt.newlyPresent.forEach(id => {
            if (this.onMouseOverCBs.has(id)) {
                this.onMouseOverCBs.get(id)(id);
            }
        });

    }
}

export { ObjLookup }; 