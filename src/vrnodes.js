import * as THREE from 'three';

export class NodesVR {
    constructor(elName) {
        this.scene = null;
        this.camera = null;
        this.size = null;
        
        this.init(elName);
    }

    init(elName) {
        this.size = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById(elName)
        });
        this.camera = new THREE.PerspectiveCamera(75, this.size.width / this.size.height);
        this.camera.position.z = 3;
        this.camera.position.y = 2;

        this.scene.add(this.camera);

        this.light = new THREE.HemisphereLight(0xffffbb, 0x080820);
        this.scene.add(this.light);

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

        requestAnimationFrame(this.update.bind(this));
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
        this.render();
        
        
        requestAnimationFrame(this.update.bind(this));
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}