import * as THREE from 'three';
import { Cursor } from './cursor';
import { Inventory } from './inventory';
import { makeBox } from './utils';

export class NodePanel extends THREE.Object3D {
    constructor(camera) {
        super();
        this.cam = camera;
        this.raycast = new THREE.Raycaster();
        // this.raycast.layers.set(1);

        this.radius = 1;

        const gBox = new THREE.SphereGeometry(this.radius, 32, 32);
        const mBox = new THREE.MeshBasicMaterial({
            color: new THREE.Color("slateblue"),
            wireframe: true,
            side: THREE.BackSide
        });
        const box = new THREE.Mesh(gBox, mBox);
        box.layers.enable(1);
        this.base = box;

        this.crosshair = new Cursor();
        this.cam.add(this.crosshair);

        this.nodes = [];


        this.invGroup = new THREE.Group();
        this.invGroup.position.y = -0.2;
        super.add(this.invGroup);
        this.options = [];
        this.objLookup = {}; // UUID to inv slot

        for (let i=0; i<7; i++) {
            const b = makeBox(0.08);
            this.addOption(b);    
        }


        this.initCursor();

        super.add(box);
        this.hide();
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
        this.invGroup.add(g);

        this.options.push({
            object: g,
            hover: false
        });
        this.updateOptions();
    }

    initCursor() {
        const cGeo = new THREE.SphereGeometry(0.01, 8, 8);
        const cMat = new THREE.MeshBasicMaterial({
            color: 0xff0000
        });
        const c = new THREE.Mesh(cGeo, cMat);
        c.layers.enable(2);
        this.cursor = c;
        
        super.add(this.cursor);
    }

    updateCursor(dt) {
    }

    show() {
        this.position.copy(this.cam.position);
        this.visible = true;
    }

    hide() {
        this.visible = false;
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

        this.updateCursor(dt);
    }

    checkRays() {
        if (!this.visible) return;

        this.options.forEach(obj => {
            obj.hover = false;
        })

        this.raycast.setFromCamera(new THREE.Vector2(), this.cam);
        const intersects = this.raycast.intersectObjects(this.children, true);

        if (intersects.length > 0) {

            intersects.forEach(hit => {
                if (hit.object.uuid === this.base.uuid) {
                    this.cursor.position.copy(hit.point);
                    this.cursor.position.sub(this.cam.position);
                }

                const index = this.objLookup[hit.object.uuid];
                if (index !== undefined) {
                    this.options[index].hover = true;
                }
            })            
        }
    }

}