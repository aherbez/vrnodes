import * as THREE from 'three';

import { BufferedSet } from './utils/buffered_set';

class ObjLookup {
    constructor(camera, root) {
        this.raycast = new THREE.Raycaster();
        this.cam = camera;
        this.root = root;

        this.onClickCBs = new Map();
        this.onMouseOverCBs = new Map();
        this.onMouseOutCBs = new Map();

        this.lookingAt = new BufferedSet();

        window.addEventListener('click', () => this.onClick());
        window.addEventListener('mousedown', () => this.onMouseDown());
        window.addEventListener('mouseup', () => this.onMouseUp());
    }

    onClick() {
        this.lookingAt.curr.forEach( (hit, id) => {
            if (this.onClickCBs.has(id)) {
                this.onClickCBs.get(id)(hit);
            }
        })
    }

    onMouseDown() {}

    onMouseUp() {}

    setOnClick(object, cb) {
        this.onClickCBs.set(object.uuid, cb);
    }

    setMouseOver(object, cb) {
        this.onMouseOverCBs.set(object.uuid, cb);
    }

    setMouseOut(object, cb) {
        this.onMouseOutCBs.set(object.uuid, cb);
    }

    currentIntersection(object) {
        const curr = this.lookingAt.curr.get(object.uuid);
        if (curr) {
            return curr.point;
        }
        return null;
    }

    distanceTo(object) {
        const curr = this.lookingAt.curr.get(object.uuid);
        if (curr) {
            return curr.distance;
        }
        // TODO: maybe return null instead?
        return Infinity;
    }

    update(scene) {
        this.raycast.setFromCamera(new THREE.Vector2(), this.cam);

        const inputs = this.root.children.filter(c => c.raycast && typeof c.raycast === "function");
        const hits = this.raycast.intersectObjects(inputs, true);
        
        this.lookingAt.update(hits, (hit) => hit.object.uuid);
        
        this.lookingAt.newlyAbsent.forEach((hit, id) => {
            if (this.onMouseOutCBs.has(id)) {
                this.onMouseOutCBs.get(id)(hit);
            }
        });
        this.lookingAt.newlyPresent.forEach((hit, id) => {
            if (this.onMouseOverCBs.has(id)) {
                this.onMouseOverCBs.get(id)(hit);
            }
        });

        // console.log(Array.from(this.lookingAt.curr.keys()));
    }
}

export { ObjLookup }; 