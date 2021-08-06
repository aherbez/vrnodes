import * as THREE from 'three';
import { ZeroSlopeEnding } from 'three';
import { PointerLockControls } from '../node_modules/three/examples/jsm/controls/PointerLockControls';

const DIR_FORWARD = 0;
const DIR_RIGHT = 1;
const DIR_BACK = 2;
const DIR_LEFT = 3;

export class NodesVR {
    constructor(elName) {
        this.scene = null;
        this.camera = null;
        this.size = null;

        this.move = [0,0,0,0];
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        this.prevTime = performance.now();
        this.init(elName);
    }

    init(elName) {
        this.size = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color("#9bb9eb");
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById(elName)
        });
        this.camera = new THREE.PerspectiveCamera(75, this.size.width / this.size.height);
        this.camera.position.z = 3;
        this.camera.position.y = 2;

        this.scene.add(this.camera);


        this.resize();
        window.addEventListener('resize', () => {
            this.size = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            this.camera.aspect = this.size.width / this.size.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.size.width, this.size.height);
    
        });

        this.addTestGeo();
        this.addFloor();

        this.controls = new PointerLockControls(this.camera, document.body);
        window.addEventListener('click', () => {
            this.controls.lock();
        });

        window.addEventListener('keydown', (e) => this.keydown(e));
        window.addEventListener('keyup', (e) => this.keyup(e));

        requestAnimationFrame(this.update.bind(this));
    }

    keydown(event) {
        console.log(event.code);
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.move[DIR_FORWARD] = 1;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.move[DIR_LEFT] = 1;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.move[DIR_BACK] = 1;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.move[DIR_RIGHT] = 1;
                break;
        }
    }

    keyup(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.move[DIR_FORWARD] = 0;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.move[DIR_LEFT] = 0;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.move[DIR_BACK] = 0;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.move[DIR_RIGHT] = 0;
                break;
        }
    }

    addTestGeo() {
        console.log("adding test geo");
        const geometry = new THREE.BoxGeometry(1,2,1);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00FFFF
        });
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        
    }

    addLight() {
        const light = new THREE.HemisphereLight(0xbbbbff, 0x080820);
        const helper = new THREE.HemisphereLightHelper(light);
        
        
        this.scene.add(light);
        this.scene.add(helper);

    }

    addFloor() {

        const floorSize = 100;
        const texSize = 256;

        const ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = texSize;
        ctx.canvas.height = texSize;
        ctx.fillStyle = "#ABABAB";

        ctx.fillRect(0, 0, texSize, texSize);

        const numLines = 5;

        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.strokeRect(0, 0, texSize, texSize);

        ctx.strokeStyle = "#EEE"
        ctx.lineWidth = 1;
        for (let i=0; i < numLines; i++) {
            const temp = (i * (texSize/numLines));

            ctx.beginPath();
            ctx.moveTo(0, temp);
            ctx.lineTo(texSize, temp);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(temp, 0);
            ctx.lineTo(temp, texSize);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(ctx.canvas);
        //texture.minFilter = THREE.NearestFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.x = floorSize;
        texture.repeat.y = floorSize;
        
        const floorGeo = new THREE.BoxGeometry(floorSize, 1, floorSize);
        const floorMat = new THREE.MeshBasicMaterial({
            color: 0xABABAB,
            map: texture
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.position.y = -0.5;
        this.scene.add(floor);
    }

    resize() {
        this.size = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        this.camera.aspect = this.size.width / this.size.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.size.width, this.size.height);
    }

    update() {
        const now = performance.now();
        const delta = now - this.prevTime;
        this.prevTime = now;

        this.direction.z = this.move[DIR_FORWARD] - this.move[DIR_BACK];
        this.direction.x = this.move[DIR_RIGHT] - this.move[DIR_LEFT];
        this.direction.normalize();

        // console.log(this.move);

        const speed = .01;

        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;

        this.controls.moveRight(this.direction.x * speed * delta);
        this.controls.moveForward(this.direction.z * speed * delta);
        
        // console.log(this.direction);
        this.render();

        
        requestAnimationFrame(this.update.bind(this));
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}