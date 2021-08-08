import * as THREE from 'three';

export class Node extends THREE.Object3D {
    constructor(data) {
        super();
        
        const color = data.color || 0xffffff;

        const nGeo = new THREE.BoxGeometry(0.3, 0.4, 0.1);
        const nMat = new THREE.MeshBasicMaterial({
            color: color
        });

        const node = new THREE.Mesh(nGeo, nMat);
        super.add(node);
    }
}