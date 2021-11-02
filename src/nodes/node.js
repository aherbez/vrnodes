import * as THREE from 'three';

const HEIGHT = 0.3;
const WIDTH = 0.4;
const DEPTH = 0.1;

export class Node extends THREE.Object3D {
    
    static matNumber = new THREE.MeshBasicMaterial({color: 0xFF0000});
    static matVector = new THREE.MeshBasicMaterial({color: 0x00FF00});
    static matBool = new THREE.MeshBasicMaterial({color: 0xAAAAAA});
    static matSlot = new THREE.MeshBasicMaterial({color: 0x444444});

    static matIntersect = new THREE.MeshBasicMaterial({color: 0xFF00FF});

    constructor(data) {
        super();
        
        this.data = data;

        const color = data.color || 0xffffff;

        const nGeo = new THREE.BoxGeometry(WIDTH, HEIGHT, DEPTH);
        const nMat = new THREE.MeshBasicMaterial({
            color: color
        });
        const node = new THREE.Mesh(nGeo, nMat);
        this.base = node;
        super.add(node);

        this.ioLookup = {};    
        this.addInputs();
        this.addOutputs();

        this.addLabel();

        this.objLookup = new Map();

    }

    get uuid() {
        return this.base.uuid;
    }
    set uuid(n) {}

    addLabel() {
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = 256;
        ctx.canvas.height = 256;
        ctx.fillStyle = "#000000";
        ctx.fillRect(0,0, 256, 256);

        const metrics = ctx.measureText(this.data.name);
        const s = (220 / metrics.width);
        ctx.scale(s,s);
        ctx.fillStyle = "#fff";
        ctx.fillText(this.data.name, 0, 10);

        const cTex = new THREE.CanvasTexture(ctx.canvas);

        const lGeo = new THREE.PlaneGeometry(WIDTH*0.9, WIDTH*0.9, 1, 1);
        const lMat = new THREE.MeshBasicMaterial({
            alphaMap: cTex,
            transparent: true
        });

        const label = new THREE.Mesh(lGeo, lMat);
        label.position.set(0, 0, DEPTH * 0.51);
        super.add(label);
    }

    addInputs() {
        const totalH = HEIGHT * 0.6;
        const spacing = (this.data.inputs.length > 1) ? 
            totalH / (this.data.inputs.length - 1) :
            0;

        this.data.inputs.forEach((inputType, index) => {
            const slot = this.makeSlot(inputType);
            slot.rotateZ(Math.PI/2);
            slot.position.set(-(WIDTH/2), (index * spacing) - (totalH/2), -(DEPTH/2));     
            
            this.ioLookup[slot.uuid] = {
                isOutput: false,
                num: index,
                type: inputType
            };
            
            super.add(slot);
        });
    }

    addOutputs() {
        const totalH = HEIGHT * 0.6;
        const spacing = (this.data.outputs.length > 1) ? totalH / (this.data.outputs.length - 1) : 0;

        this.data.outputs.forEach((output, index) => {
            const slot = this.makeSlot(output.type);
            slot.rotateZ(-Math.PI/2);
            slot.position.set((WIDTH/2), (index * spacing) - (totalH/2), -(DEPTH/2));     
            super.add(slot);

            this.ioLookup[slot.uuid] = {
                isOutput: true,
                num: index,
                type: output.type
            };

        });
    }



    makeSlot(slotType) {
        const inputGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.15, 16, 1);
        const slot = new THREE.Mesh(inputGeo, Node.matSlot);
        const intersectionGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.15, 5, 1);
        const hitTarget = new THREE.Mesh(intersectionGeo, Node.matIntersect);
        // console.log(hitTarget.uuid);
        let mat = null;
        switch (slotType) {
            case "number":
                mat = Node.matNumber;
                break;
            case "vector":
                mat = Node.matVector;
                break;
            case "bool":
                mat = Node.matBool;
                break;
            default:
                mat = Node.matSlot;
                break;
        }

        const ringGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.03, 16, 1);
        const ring = new THREE.Mesh(ringGeo, mat);
        ring.position.set(0, 0.05, 0);
        slot.add(ring); 
        // slot.add(hitTarget);
        return slot;
    }

}