import * as THREE from 'three';
import { GLTFLoader } from '../../node_modules/three/examples/jsm/loaders/GLTFLoader';

import CityData from './city_data.json';

const BASE_SCALE = 9;

class City extends THREE.Object3D {
    constructor() {
        super();
        this.loader = new GLTFLoader();
        this.scene = new THREE.Object3D();
        
        this.modelLookup = new Map();

        this.loadModelData();
    }

    instanceScene(scene, position) {
        let newObj = new THREE.Object3D();
        scene.traverse( child => {
            if (child.isMesh) {
                const instance = new THREE.InstancedMesh(child.geometry, child.material, 1);
                instance.setMatrixAt(0, newObj.matrix);
                instance.scale.multiplyScalar(BASE_SCALE);
                instance.position.copy(position);
                newObj.add(instance);
            }
        });
        return newObj;
    }

    async loadModelData() {
        
        Promise.all(CityData.models.map( model => {
            return this.loader.loadAsync(`./models/${model.src}`).then(scene => {
                return {
                    "scene": scene,
                    "id": model.id
                }
            });
        })).then(results => {
            results.forEach(r => {
                this.modelLookup.set(r.id, r.scene.scene)
            })
            
            this.addCityGeo();
        });
    }


    addCityGeo() {
        CityData.positions.forEach(data => {
            let m = this.modelLookup.get(data[0]);
            if (m) {
                const pos = new THREE.Vector3(data[1], data[2], data[3]);
                this.scene.add(this.instanceScene(m, pos));
            }
        })
        
    }
}


export { City };