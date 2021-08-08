import * as THREE from 'three';

export function makeBox(size, color) {
    const s = size || 1;
    const c = color || new THREE.Color(Math.random(), Math.random(), Math.random());

    const bGeo = new THREE.BoxGeometry(s,s,s);
    const bMat = new THREE.MeshLambertMaterial({
        color: c
    });

    return (new THREE.Mesh(bGeo, bMat));
}
