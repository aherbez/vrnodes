import { test1 } from './test_inputs';

const MODE_NONE = 0;
const MODE_INPUT = 1;
const MODE_OUTPUT = 2;
const MODE_FUNCTION = 3;

const TYPE_UNKNOWN = 0;
const TYPE_NUMBER = 1;
const TYPE_VECTOR = 2;
const TYPE_BOOL = 3;

const operators = new Map();
operators.set('+', (a, b) => (a + b));
operators.set('-', (a,b) => (a - b));
operators.set('*', (a,b) => (a * b));
operators.set('/', (a,b) => (a / b));
operators.set('sin', (a) => (Math.sin(a)));
operators.set('cos', (a) => (Math.cos(a)));
operators.set('tan', (a) => (Math.tan(a)));
operators.set('^', (a,b) => (Math.pow(a,b)));

function parseInputs(parts) {
    let inputs = new Map();
    
    let currInput = null;
    
    parts.forEach((token, index) => {
        if (index % 2 == 0) {
            if (currInput) {
                inputs.set(currInput.name, currInput);
            }
            currInput = {
                name: token,
                type: null
            }
        } else {
            switch (token) {
                case 'number': {
                    currInput.type = TYPE_NUMBER;
                    break;
                }
                case 'vector': {
                    currInput.type = TYPE_VECTOR;
                    break;
                }
                case 'bool': {
                    currInput.type = TYPE_BOOL;
                    break;
                }
                default: {
                    console.log(`unknown type ${token} for variable ${currInput.name}`);
                    break;
                }
            }
        }
    });
    if (currInput) {
        inputs.set(currInput.name, currInput);
    }
    return inputs;
}

/*
    Node = {
        type: type,
        op: operation,
        children: []
        parent: null
    }

*/

const NODE_ROOT = 0;
const NODE_OPERATION = 1;
const NODE_VARIABLE = 2;
const NODE_CONSTANT = 3;
const NODE_PAREN = 4;
const NODE_VARIABLE_ACCESSOR = 5;

function toValue(token) {
    if (token === 'PI' || token === 'pi') {
        return Math.PI;
    }
    let value = parseFloat(token);
    if (isNaN(value)) return null;
    return value;
}

function isParen(token) {
    return (token === '(' || token === ')')
}

function argLength(op) {
    switch (op) {
        case 'sin':
            return 1;
        default: 
            return 2;
    }
}

function isAccessor(token) {
    const parts = token.split('.');
    return (parts.length == 2) 
}

function buildTree(parts, inputs) {

    let root = {
        type: NODE_ROOT,
        children: [],
        parent: null
    };
    let curr = root;

    // TODO: vary "complete" based on operation
    const isComplete = function(node) {
        if (node.type === NODE_OPERATION) {
            return (node.children.length === argLength(node.value));
        } else if (node.type === NODE_PAREN) {
            return false;
        }
        return true;
    }

    let currInOp = false;
    let subExpStack = [];
    let tempNodeStack = [];

    function getTempNode() {
        if (tempNodeStack.length > 0) {
            return tempNodeStack.pop();
        }
        return null;
    }

    parts.forEach(token => {
        if (operators.has(token)) {
            let newNode = {
                type: NODE_OPERATION,
                parent: curr,
                children: [],
                value: token,
            }

            let tNode = getTempNode();
            
            if (tNode) {
                tNode.parent = newNode;
                newNode.children.push(tNode);
                tNode = null; 
            }
            currInOp = true;
            curr.children.push(newNode);
            curr = newNode;

        } else if (isAccessor(token)) {
            const parts = token.split('.');
            const v = parts[0];
            const att = parts[1];

            if (!inputs.has(v)) {
                console.log(`Unknown vector ${v}`);
                return null;
            }

            let newNode = {
                type: NODE_VARIABLE_ACCESSOR,
                parent: null,
                children: [],
                value: parts
            }
            if (currInOp) {
                newNode.parent = curr;
                curr.children.push(newNode);
                while (curr.parent !== null && isComplete(curr)) {
                    curr = curr.parent;
                    currInOp = curr.type === NODE_OPERATION;
                }
            } else {
                tempNodeStack.push(newNode);
            }
        
        } else if (inputs.has(token)) {
            // variable
            let newNode = {
                type: NODE_VARIABLE,
                parent: null,
                children: [],
                value: token
            }
            if (currInOp) {
                newNode.parent = curr;
                curr.children.push(newNode);
                while (curr.parent !== null && isComplete(curr)) {
                    curr = curr.parent;
                    currInOp = curr.type === NODE_OPERATION;
                }
            } else {
                tempNodeStack.push(newNode);
            }


        } else if (toValue(token) !== null) {
            let newNode = {
                type: NODE_CONSTANT,
                parent: null,
                children: [],
                value: toValue(token)
            }

            if (currInOp) {
                newNode.parent = curr;
                curr.children.push(newNode);
                currInOp = false;
                while (curr.parent !== null && isComplete(curr)) {
                    curr = curr.parent;
                }
            } else {
                tempNodeStack.push(newNode);
            }

        } else if (isParen(token)) {
            if (token === '(') {
                let newNode = {
                    type: NODE_PAREN,
                    parent: curr,
                    children: [],
                    value: token
                }

                subExpStack.push(newNode);
                curr = newNode;
                currInOp = false;

            } else {
                // closing parens
                let closing = subExpStack.pop();
                if (!closing) {
                    console.error(`Mismatched parens`);
                } else {
                    let tNode = getTempNode();

                    if (tNode) {
                        closing.children.push(tNode);
                    }
 
                    curr = closing.parent;
                    currInOp = curr.type === NODE_OPERATION;

                    if (currInOp) {
                        closing.children[0].parent = curr;
                        curr.children.push(closing.children[0]);
                        currInOp = curr.type == NODE_OPERATION;
                        while (curr.parent !== null && isComplete(curr)) {
                            curr = curr.parent;
                            currInOp = curr.type == NODE_OPERATION;
                        }
                    } else {
                        tempNodeStack.push(closing.children[0]);
                    }

                }
            }
        } else {
            console.log(`Unknown variable ${token}`);
        }
    });

    let tNode = getTempNode();
    if (tNode) {
        root.children.push(tNode);
    }

    if (root.children.length === 1) {
        return root.children[0];    
    }
    console.error("Could not parse expression");
    return null;
}

function accessorIndexFor(att) {
    switch (att) {
        case 'x':
        case 'r':
        case 'u':
            return 0;
        case 'y':
        case 'g':
        case 'v':
            return 1;
        case 'z':
        case 'b':
        case 't':
            return 2;
        default:
            return -1;
    }
}


function treeToFunction(root, vars) {
    
    const noOp = (args) => args;
    
    switch (root.type) {
        case NODE_CONSTANT:
            return (args) => root.value;
        case NODE_VARIABLE:
            let varIndex = vars.indexOf(root.value);
            if (varIndex !== -1) {
                return (args) => (args[varIndex]);
            }
            return noOp;
        case NODE_VARIABLE_ACCESSOR:
            if (Array.isArray(root.value)) {
                let varIndex = vars.indexOf(root.value[0]);
                let accessorIndex = accessorIndexFor(root.value[1]);
                if (varIndex !== -1 && accessorIndex !== -1) {
                    return (args) => {
                        if (Array.isArray(args[varIndex])) {
                            return args[varIndex][accessorIndex];
                        } else {
                            return 0;
                        }
                    };
                
                } else {
                    return noOp;
                }
            }
            return noOp;
        case NODE_OPERATION:
            switch (root.value) {
                case '+':
                    if (root.children.length == 2) {                    
                        return (args) => (
                            treeToFunction(root.children[0], vars)(args) +
                            treeToFunction(root.children[1], vars)(args)
                        );
                    }
                    return noOp;
                case '*':
                    if (root.children.length == 2) {                    
                        return (args) => (
                            treeToFunction(root.children[0], vars)(args) *
                            treeToFunction(root.children[1], vars)(args)
                        );
                    }
                    return noOp;
                case '-':
                    if (root.children.length == 2) {                    
                        return (args) => (
                            treeToFunction(root.children[0], vars)(args) -
                            treeToFunction(root.children[1], vars)(args)
                        );
                    }
                    return noOp;
                case '/':
                    if (root.children.length == 2) {                    
                        return (args) => (
                            treeToFunction(root.children[0], vars)(args) /
                            treeToFunction(root.children[1], vars)(args)
                        );
                    }
                    return noOp;
                case '^':
                    if (root.children.length == 2) {                    
                        return (args) => (
                            Math.pow(treeToFunction(root.children[0], vars)(args),
                            treeToFunction(root.children[1], vars)(args))
                        );
                    }
                    return noOp;
                case 'sin':
                    if (root.children.length == 1) {
                        return (args) => (
                            Math.sin(treeToFunction(root.children[0], vars)(args))
                        );
                    }
                case 'cos':
                    if (root.children.length == 1) {
                        return (args) => (
                            Math.cos(treeToFunction(root.children[0], vars)(args))
                        );
                    }
                    return noOp;
                case 'tan':
                    if (root.children.length == 1) {
                        return (args) => (
                            Math.tan(treeToFunction(root.children[0], vars)(args))
                        );
                    }
                    return noOp;
            }
    }
}

function parseOutputs(parts, inputs) {
    const toType = function(str) {
        switch (str) {
            case 'number:': {
                return TYPE_NUMBER;
            }
            case 'bool:': {
                return TYPE_BOOL;
            }
            case 'vector:': {
                return TYPE_VECTOR;
            }
            default: {
                return TYPE_UNKNOWN
            }
        }
    }

    let outputs = [];
    let out = null;
    let functionDef = [];
    parts.forEach(t => {
        if (toType(t) !== TYPE_UNKNOWN) {
            if (out !== null) {
                out.function = buildTree(functionDef, inputs);
                outputs.push(out);
                functionDef = [];
            }
            out = {
                type: t,
                function: null
            }
        } else {
            functionDef.push(t);
        }
    });
    out.function = buildTree(functionDef, inputs);
    outputs.push(out);

    return outputs;
}

function padOperators(str) {
    const ops = ['(',')','+','-','*','/', '^'];
    ops.forEach(o => {
        str = str.replaceAll(o, ` ${o} `);
    });
    return str;
}

function parse(str) {

    const tokens = padOperators(str).split(' ').filter(w => w !== '');

    let mode = MODE_NONE;
    let parts = [];

    let inputTokens = [];
    let outputTokens = [];

    const handleParts = function() {
        if (parts.length < 1) return;
        switch (mode) {
            case MODE_INPUT: {
                inputTokens = parts;
                break;
            }
            case MODE_OUTPUT: {
                outputTokens = parts;
                break;
            }
        }
    
    }

    tokens.forEach(token => {
        switch (token) {
            case 'input:': {
                handleParts();
                mode = MODE_INPUT;
                parts = [];
                break;
            }
            case 'output:': {
                handleParts();
                mode = MODE_OUTPUT;
                parts = [];
                break;
            }
            default: {
                parts.push(token);
                break;
            }
        }
    });
    handleParts();

    let inputs = parseInputs(inputTokens);
    let outputs = parseOutputs(outputTokens, inputs);

    let vars = new Map();
    vars.set('a', 2);
    vars.set('b', 3);
    vars.set('c', 1);
    vars.set('d', [1,2,3]);
    
    let varVals = [2,3];
    outputs.forEach(out => {
        let f = treeToFunction(out.function, Array.from(vars.keys()));
        let res = f([1,2,5,[10,20,30]]);
        console.log(`result: ${res}`);
    });
}

function testParse() {
    parse(test1);
}

export { parse, testParse }