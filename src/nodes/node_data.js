export const nodeList = [
    {
        color: 0xff0000,
        name: "add",
        inputs: [ "number", "number " ],
        outputs: [{
            type: "number",
            function: (a,b) => { return a + b;}
        }]
    },
    {
        color: 0x00aa00,
        name: "split",
        inputs: ["vector"],
        outputs: [
            { 
                type: "number",
                function: (v) => { return v.x; }
            },
            {
                type: "number",
                function: (v) => { return v.y; }
            },
            {
                type: "number",
                function: (v) => { return v.z; }
            }
        ]
    },
    {
        color: 0x0000aa,
        name: "combine",
        inputs: ["number", "number", "number"],
        outputs: [
            { 
                type: "vector",
                function: (x, y, z) => { return new THREE.Vector3(x, y, z); }
            }
        ]
    },
    {
        color: 0x00ff00,
        name: "sub",
        inputs: [ "number", "number"],
        outputs: [{
            type: "number",
            function: (a,b) => { return a - b;}
        }]
    },
    {
        color: 0x0000ff,
        name: "mult",
        inputs: [ "number", "number"],
        outputs: [{
            type: "number",
            function: (a,b) => { return a * b;}
        }]
    },
    {
        color: 0xff00ff,
        name: "divide",
        inputs: [ "number", "number"],
        outputs: [{
            type: "number",
            function: (a,b) => { return a / b;}
        }]
    }    

];