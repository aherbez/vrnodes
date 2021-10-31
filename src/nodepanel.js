import * as THREE from 'three';
import { Cursor } from './cursor';
import { Inventory } from './inventory';
import { makeBox } from './utils';
import { Node } from './nodes/node';
import { nodeList } from './nodes/node_data';

const vertexShaderSource = `
    varying vec2 v_uv;
    void main() {
        v_uv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;

const fragmentShaderSource = `
    varying vec2 v_uv;
    
    float smoothStrip(float min, float max, float smoothVal, float u) {
        return (smoothstep(min-smoothVal, min, u) * smoothstep(max+smoothVal, max, u));
    }

    float grid(vec2 uv) {
        return max(sin(uv.x*200.0),cos(uv.y*100.0));
    }
    
    void main() {
        // float alphaX = smoothstep(0.2,0.25,v_uv.x) * smoothstep(0.65, 0.6, v_uv.x);
        // float alphaY = smoothstep(0.2,0.25,v_uv.y) * smoothstep(0.65, 0.6, v_uv.y);
        float alpha = smoothStrip(0.25, 0.75, 0.02, v_uv.x) * 
            smoothStrip(0.3, 0.7, 0.02, v_uv.y);

        vec3 color1 = vec3(0.0, 1.0, 0.0);
        vec3 color2 = vec3(0.0);

        float g = grid(v_uv);
        vec3 color = (g > 0.98) ? color1 : color2;

        gl_FragColor = vec4(color, alpha * 0.7);
    }
`;

export class NodePanel extends THREE.Object3D {
    constructor(camera) {
        super();
        this.cam = camera;
        this.raycast = new THREE.Raycaster();

        this.radius = 1.5;

        const gCanvas = new THREE.SphereGeometry(this.radius, 32, 32);
        const mCanvas = new THREE.MeshBasicMaterial({
            side: THREE.BackSide
        });

        this.uniforms = {};

        const mShader = new THREE.ShaderMaterial({
            vertexShader: vertexShaderSource,
            fragmentShader: fragmentShaderSource,
            uniforms: this.uniforms,
            side: THREE.BackSide,
            transparent: true
        });

        const nodeCanvas = new THREE.Mesh(gCanvas, mCanvas);
        nodeCanvas.visible = false;
        const renderCanvas = new THREE.Mesh(gCanvas, mShader);
        renderCanvas.rotateY(Math.PI/2);
        super.add(renderCanvas);
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
            // console.log(`clicked on ${hit.object.uuid}`);
            
            if (this.nodeLookup[hit.object.uuid]) {
                this.draggingNode = this.nodeLookup[hit.object.uuid];
            }

        });
        if (this.draggingNode) return;

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

        // console.log('nodepanel intersects: ', this.intersectedObjects.length);

        if (this.intersectedObjects.length > 0) {
            this.intersectedObjects.forEach(hit => {
                if (hit.object.uuid === this.base.uuid) {
                    this.cursor.position.copy(hit.point);
                    this.cursor.position.sub(this.cam.position);

                    if (this.draggingNode) {
                        this.draggingNode.position.copy(hit.point);
                        this.draggingNode.position.sub(this.cam.position);
                        this.draggingNode.position.multiplyScalar(0.8);

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