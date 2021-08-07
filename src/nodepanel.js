import * as THREE from 'three';

export class NodePanel extends THREE.Object3D {
    constructor() {
        super();
        
        const gBox = new THREE.SphereGeometry(1, 32, 32);
        const mBox = new THREE.MeshBasicMaterial({
            color: new THREE.Color("slateblue"),
            wireframe: true
        });
        const box = new THREE.Mesh(gBox, mBox);

        super.add(box);
        this.hide();
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }

}