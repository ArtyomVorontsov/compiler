const fs = require('fs');
const util = require('util');

const tokens = [ { TYPE: 'KEY_WORD_CLASS', position: 0, lexem: 'class' },
{ TYPE: 'ID', position: 6, lexem: 'main' },
{ TYPE: 'OPEN_BRACE', position: 11, lexem: '{' },
{ TYPE: 'KEY_WORD_VAR', position: 17, lexem: 'var' },
{ TYPE: 'ID', position: 21, lexem: 'j' },
{ TYPE: 'OPERATOR_ASSIGN', position: 23, lexem: '=' },
{ TYPE: 'INT', position: 25, lexem: '30' },
{ TYPE: 'SEMI_COLON', position: 27, lexem: ';' },
{ TYPE: 'KEY_WORD_RETURN', position: 33, lexem: 'return' },
{ TYPE: 'ID', position: 40, lexem: 'j' },
{ TYPE: 'SEMI_COLON', position: 41, lexem: ';' },
{ TYPE: 'CLOSE_BRACE', position: 43, lexem: '}' } ]

const syntaxTree = [];
let next = -1;
let state = false;
let currentTerminals = []


const term = (token, termstate) => {
    next++
    if (!tokens[next]) {
        return false
    }

    console.log({ "NEXT": next }, { "CHECKING:": token }, { "CURRENT": tokens[next].TYPE }, token === tokens[next].TYPE);
    state = token === tokens[next].TYPE;
    termstate.push(tokens[next]);
    return state;
}

const program = () => {
    let save = next;

    const saveNext = (callback) => {
        const result = callback();
        if (!result) next = save;
        return result;
    }


    if (saveNext(CLASS_DECLARATION)) {
        syntaxTree.push("CLASS_DECLARATION")
        return true
    }

    return false
}


const CLASS_DECLARATION = () => {
    const node = {
        type: "CLASS_DECLARATION",
        state: [

        ]
    }
    const res = term("KEY_WORD_CLASS", node.state) && term("ID", node.state) && BODY()
    res && currentTerminals.push(node)
    return res
}

const BODY = () => {
    const node = {
        type: "BODY",
        state: [

        ]
    }
    const res = term("OPEN_BRACE", node.state) && EXPRESSION(node) && term("CLOSE_BRACE", node.state);
    res && currentTerminals.push(node)
    return res
}

const EXPRESSION = (node) => {
    let save = next;

    const saveNext = (callback) => {
        const result = callback();
        if (!result) next = save;
        return result;
    }

    if (saveNext(VARIABLE_DECLARATION)) {
        syntaxTree.push("VARIABLE_DECLARATION")
        node.state.push("VARIABLE_DECLARATION")
        return true
    }
    else if (saveNext(RETURN_STATEMENT)) {
        syntaxTree.push("RETURN_STATEMENT")
        node.state.push("RETURN_STATEMENT")
        return true
    } else if (saveNext(EPSILON)) {
        syntaxTree.push("EPSILON")
        node.state.push("EPSILON")
        return true
    }

    return false
}

const VARIABLE_DECLARATION = () => {
    const node = {
        type: "VARIABLE_DECLARATION",
        state: [

        ]
    }
    const res = term("KEY_WORD_VAR", node.state) && term("ID", node.state) && 
    term("OPERATOR_ASSIGN", node.state) && 
    VALUE() && 
    term("SEMI_COLON", node.state) && 
    EXPRESSION(node)
    res && currentTerminals.push(node)
    return res
}

const RETURN_STATEMENT = () => {
    const node = {
        type: "RETURN_STATEMENT",
        state: [

        ]
    }
    const res = term("KEY_WORD_RETURN", node.state) && term("ID", node.state) && 
    term("SEMI_COLON", node.state)
    res && currentTerminals.push(node)
    return res
}

const EPSILON = () => {
    const node = {
        type: "EPSILON",
        state: [

        ]
    }
    const res = term("EPSILON", node.state)
    res && currentTerminals.push(node)
    return res
}

const VALUE = () => {
    let save = next;

    const saveNext = (callback) => {
        const result = callback();
        if (!result) next = save;
        return result;
    }

    const node = {
        type: "VALUE",
        state: [

        ]
    }

    if (saveNext(() => term("INT", node.state))) {
        syntaxTree.push(node)
        return true
    }

    return false
}

program()
console.log(syntaxTree)

const output = JSON.stringify(currentTerminals.reverse())
console.log(output)
fs.writeFile("output.json", util.inspect(output, { maxArrayLength: 10000 }), ["UTF-8"], () => {
    console.log("saved!")
})