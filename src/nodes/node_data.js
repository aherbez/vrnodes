export const nodeList = [
    {
        color: 0xff0000,
        name: "add",
        inputs: [ "number", "number"],
        outputs: [{
            type: "number",
            function: (a,b) => { return a + b;}
        }]
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