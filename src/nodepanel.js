import * as THREE from 'three';
import { Cursor } from './cursor';
import { Inventory } from './inventory';
import { makeBox } from './utils';
import { Node } from './nodes/node';
import { nodeList } from './nodes/node_data';

export class NodePanel extends THREE.Object3D {
    constructor(camera) {
        super();
        this.cam = camera;
        this.raycast = new THREE.Raycaster();

        this.radius = 1;

        const gCanvas = new THREE.SphereGeometry(this.radius, 32, 32);
        const mCanvas = new THREE.MeshBasicMaterial({
            color: new THREE.Color("slateblue"),
            wireframe: true,
            side: THREE.BackSide
        });
        const nodeCanvas = new THREE.Mesh(gCanvas, mCanvas);
        // box.layers.enable(1);
        super.add(nodeCanvas);
        this.base = nodeCanvas;

        this.crosshair = new Cursor();
        this.cam.add(this.crosshair);

        this.selected = null;
        this.draggingNode = null;

        this.nodes = [];

        this.invGroup = new THREE.Group();
        this.invGroup.position.y = -0.2;
        super.add(this.invGroup);
        this.options = [];
        this.objLookup = {}; // UUID to inv slot

        nodeList.forEach((n, i) => {
            const b = makeBox(0.06, n.color);
            this.addOption(b);
        })

        window.addEventListener('mousedown', (evt) => {
            this.mouseDown(evt);
        });

        window.addEventListener('mouseup', (evt) => {
            this.mouseUp(evt);
        });

        this.intersectedObjects = [];
        this.nodeLookup = {};

        this.initCursor();

        this.hide();
    }

    mouseDown(evt) {
        this.crosshair.visible = false;
        this.cursor.visible = true;

        this.intersectedObjects.forEach(hit => {
            console.log(hit);
            if (this.nodeLookup[hit.object.uuid]) {
                this.draggingNode = this.nodeLookup[hit.object.uuid];
            }
        });


        // spawn a new node and have it follow the mouse
        if (this.selected !== null) {
            const n = new Node(nodeList[this.selected]);
            super.add(n);
            this.draggingNode = n;
            this.nodeLookup[n.uuid] = n;
        }
    }

    mouseUp(evt) {
        this.crosshair.visible = true;
        this.cursor.visible = false;
    
        // leave the new node as a child of the scene
        this.draggingNode = null;
        this.selected = null;
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

        this.selected = null;

        this.raycast.setFromCamera(new THREE.Vector2(), this.cam);
        this.intersectedObjects = this.raycast.intersectObjects(this.children, true);


        if (this.intersectedObjects.length > 0) {
            // console.log(this.intersectedObjects);
            this.intersectedObjects.forEach(hit => {
                
                if (hit.object.uuid === this.base.uuid) {
                    this.cursor.position.copy(hit.point);
                    this.cursor.position.sub(this.cam.position);

                    if (this.draggingNode) {
                        this.draggingNode.position.copy(hit.point);
                        this.draggingNode.position.sub(this.cam.position);

                        this.draggingNode.lookAt(this.cam.position);
                    }
                }

                const index = this.objLookup[hit.object.uuid];
                if (index !== undefined) {
                    this.options[index].hover = true;
                    this.selected = index;
                }
            })            
        }
    }

}