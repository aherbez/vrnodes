import * as THREE from 'three';
import { ZeroSlopeEnding } from 'three';
import { PointerLockControls } from '../node_modules/three/examples/jsm/controls/PointerLockControls';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader';

import { NodePanel } from './nodepanel';
import { Inventory } from './inventory';
import { Cursor } from './cursor';

import { Node } from './nodes/node';
import { nodeList } from './nodes/node_data';

import { Cord } from './cord';
import { testParse } from './parser/parser';
import { City } from './env/city';

import { ObjLookup } from './obj_lookup';


const DIR_FORWARD = 0;
const DIR_RIGHT = 1;
const DIR_BACK = 2;
const DIR_LEFT = 3;

export class NodesVR {
    constructor(elName) {
        this.scene = null;
        this.camera = null;
        this.size = null;

        this.root = new THREE.Object3D();

        this.move = [0,0,0,0];
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        this.raycast = new THREE.Raycaster();

        this.editing = false;

        this.prevTime = performance.now();
        this.init(elName);
        
        testParse();
       
    }

    async runInit() {
        this.city.init();
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
        this.registry = new ObjLookup(this.camera, this.root);

        this.scene.add(this.root);

        this.panel = new NodePanel(this.camera, this.registry);
        this.root.add(this.panel);

        this.camera.position.z = 3;
        this.camera.position.y = 1.68;

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

        this.mouse = {
            x: 0,
            y: 0
        }
        window.addEventListener('mousemove', (evt) => {
            this.mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = (evt.clientY / window.innerHeight) * 2 + 1;
        });


        this.addTestGeo();
        
        this.addFloor();
        this.addLight();

        this.city = new City();
        this.root.add(this.city.scene);

        this.controls = new PointerLockControls(this.camera, document.body);
        window.addEventListener('click', () => {
            this.controls.lock();
        });

        window.addEventListener('keydown', (e) => this.keydown(e));
        window.addEventListener('keyup', (e) => this.keyup(e));

        // this.testCord = new Cord(
        //     new THREE.Vector3(-1, 2, 0),
        //     new THREE.Vector3(1, 2, 0)
        // );
        // this.scene.add(this.testCord);

        requestAnimationFrame(this.update.bind(this));
    }

    keydown(event) {
        // console.log(event.code);
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
            case 'Space':
                this.toggleEditing();
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

    toggleEditing() {
        if (this.editing) {
            this.panel.hide();
        } else {
            this.panel.show();
        }
        this.editing = !this.editing;
    }

    addTestGeo() {
        const geometry = new THREE.BoxGeometry(1,1,1);
        const material = new THREE.MeshLambertMaterial({
            color: 0x00FFFF
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.setY(0.5);
        this.root.add(mesh);

        this.registry.setOnClick(mesh, (hit) => {
            console.log(`clicked box (id ${hit})`, hit);
        });

        this.registry.setMouseOver(mesh, (hit) => {
            console.log(hit.distance);
            mesh.scale.setScalar(2);
        });

        this.registry.setMouseOut(mesh, (hit) => {
            console.log(hit);
            mesh.scale.setScalar(1);
        });

        return;
        
        nodeList.forEach((data, index) => {
            const n = new Node(data);
            n.position.set(index + 1, 1, 0);
            this.scene.add(n);
        });

    }


    addLight() {
        const light = new THREE.HemisphereLight(0xbbbbff, 0x080820, 2);
        const helper = new THREE.HemisphereLightHelper(light);
        
        const sun = new THREE.DirectionalLight(0xffffff, 2);
        const sunHelper = new THREE.DirectionalLightHelper(sun);

        // this.scene.add(sunHelper);
        this.scene.add(sun.target);

        this.scene.add(sun);
        sun.position.set(3, 3, 3);
        sun.target.position.set(0,0,0);
        sun.rotateX(0.2);
        sun.rotateY(0.8);
        
        this.scene.add(light);
        //this.scene.add(helper);

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
        this.root.add(floor);
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

        // this.testCord.update(delta);

        this.registry?.update(this.scene);        
        this.panel.checkRays();

        this.direction.z = this.move[DIR_FORWARD] - this.move[DIR_BACK];
        this.direction.x = this.move[DIR_RIGHT] - this.move[DIR_LEFT];
        this.direction.normalize();

        const speed = .01;

        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;

        if (!this.editing) {
            this.controls.moveRight(this.direction.x * speed * delta);
            this.controls.moveForward(this.direction.z * speed * delta);
        }

        this.panel.update(delta);

        this.render();        
        requestAnimationFrame(this.update.bind(this));
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}