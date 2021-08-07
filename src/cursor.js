import * as THREE from 'three';

import { makeBox } from './utils';

export class Cursor extends THREE.Object3D {
    constructor() {
        super();

        const ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = 32;
        ctx.canvas.height = 32;

        ctx.fillStyle = "rbga(0, 0, 1, 0.3)";
        ctx.clearRect(0, 0, 32, 32);
        ctx.fillRect(0, 0, 32, 32);

        ctx.lineWidth = 3;
        ctx.strokeStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(5, 16);
        ctx.lineTo(27, 16);
        ctx.moveTo(16, 5);
        ctx.lineTo(16, 27);
        ctx.stroke();

        const tex = new THREE.CanvasTexture(ctx.canvas);


        const cGeo = new THREE.PlaneGeometry(0.005,0.005);
        const cMat = new THREE.MeshBasicMaterial({
            map: tex,
            transparent: true
        });

        const c = new THREE.Mesh(cGeo, cMat);
        c.position.z = -0.1;

        super.add(c);
    }
}