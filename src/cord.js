import * as THREE from 'three';

class Cord extends THREE.Object3D {
    static matRubber = new THREE.MeshBasicMaterial({
        color: 0x444444
    });
    static radius = 0.04;
    
    constructor(start, end) {
        super();
    
        this.time = 0;

        this._start = start || new THREE.Vector3();
        this._end = end || new THREE.Vector3();
    
        const crossSection = new THREE.Shape();
        crossSection.moveTo(Cord.radius, 0);
        const theta = Math.PI * 2 / 8;
        for (let i=1; i < 8; i++) {
            crossSection.lineTo(
                Math.cos(theta*i) * Cord.radius,
                Math.sin(theta*i) * Cord.radius);
        }
        crossSection.closePath();
        this.crossSection = crossSection;

        this.splinePath = new THREE.CatmullRomCurve3([
            this._start,
            new THREE.Vector3(0, 3, 0),
            this._end
        ]);
        this.extrudeSettings = {
            steps: 32,
            extrudePath: this.splinePath
        }

        const geo = new THREE.ExtrudeGeometry(crossSection,
            this.extrudeSettings);
        this.mesh = new THREE.Mesh(geo, Cord.matRubber);
        
        super.add(this.mesh);

        this.debug = new THREE.AxesHelper(0.5);
        super.add(this.debug);

    }

    set start(v) {
        this._start.copy(v);
        this.updateGeometry();
    }

    set end(e) {
        this._end.copy(e);
        this.updateGeometry();
    }

    updateGeometry() {
        super.remove(this.mesh);
        this.splinePath = new THREE.CatmullRomCurve3([
            this._start,
            new THREE.Vector3(0, 3, 0),
            this._end
        ]);
        const geo = new THREE.ExtrudeGeometry(this.crossSection,
            this.extrudeSettings);
        this.mesh = new THREE.Mesh(geo, Cord.matRubber);
        super.add(this.mesh);
        this.mesh.geometry.verticesNeedUpdate = true;
        this.mesh.geometry.attributes.position.needsUpdate = true;
    }


    update(dt) {
        this.time += dt;
    
        this._end.set(
            Math.cos(this.time/1000)*0.3 + 1,
            Math.sin(this.time/1000)*0.3 + 2,
            0
        );
            
        this.updateGeometry();
        this.debug.position.copy(this._end);
    }

}

export { Cord }