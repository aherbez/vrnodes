import * as THREE from 'three';

const HEIGHT = 0.4;
const WIDTH = 0.3;
const DEPTH = 0.1;

export class Node extends THREE.Object3D {
    
    static matNumber = new THREE.MeshBasicMaterial({color: 0xFF0000});
    static matVector = new THREE.MeshBasicMaterial({color: 0x00FF00});
    static matBool = new THREE.MeshBasicMaterial({color: 0xAAAAAA});
    static matSlot = new THREE.MeshBasicMaterial({color: 0x444444});

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
    
        this.addInputs();
        this.addOutputs();
    }

    get uuid() {
        return this.base.uuid;
    }
    set uuid(n) {}

    addInputs() {
        const totalH = HEIGHT * 0.6;
        const spacing = totalH / (this.data.inputs.length - 1);

        this.data.inputs.forEach((inputType, index) => {
            const slot = this.makeSlot(inputType);
            slot.rotateZ(Math.PI/2);
            slot.position.set(-(WIDTH/2), (index * spacing) - (totalH/2), -(DEPTH/2));     
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
        });
    }

    makeSlot(slotType) {
        const inputGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.15, 16, 1);
        const slot = new THREE.Mesh(inputGeo, Node.matSlot);
        
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
        return slot;
    }

}