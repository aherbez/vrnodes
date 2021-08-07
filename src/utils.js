import * as THREE from 'three';

export function makeBox(size) {
    const s = size || 1;

    const bGeo = new THREE.BoxGeometry(s,s,s);
    const bMat = new THREE.MeshLambertMaterial({
        color: new THREE.Color(Math.random(), Math.random(), Math.random())
    });

    return (new THREE.Mesh(bGeo, bMat));
}
