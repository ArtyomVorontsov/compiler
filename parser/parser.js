const fs = require('fs');
const util = require('util');

const tokens = [ { TYPE: 'KEY_WORD_CLASS', position: 0, lexem: 'class' },
{ TYPE: 'ID', position: 6, lexem: 'main' },
{ TYPE: 'OPEN_BRACE', position: 11, lexem: '{' },
{ TYPE: 'KEY_WORD_VAR', position: 17, lexem: 'var' },
{ TYPE: 'ID', position: 21, lexem: 'lol' },
{ TYPE: 'OPERATOR_ASSIGN', position: 25, lexem: '=' },
{ TYPE: 'INT', position: 27, lexem: '50' },
{ TYPE: 'SEMI_COLON', position: 29, lexem: ';' },
{ TYPE: 'KEY_WORD_RETURN', position: 35, lexem: 'return' },
{ TYPE: 'ID', position: 42, lexem: 'j' },
{ TYPE: 'SEMI_COLON', position: 43, lexem: ';' },
{ TYPE: 'CLOSE_BRACE', position: 45, lexem: '}' } ]

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

    const node = {
        type: "PROGRAM",
        state: [

        ]
    }


    if (saveNext(() => CLASS_DECLARATION(node.state))) {
        currentTerminals.push(node)
        return true
    }
    
    return false
}


const CLASS_DECLARATION = (parentNode) => {
    const node = {
        type: "CLASS_DECLARATION",
        state: [

        ]
    }
    const res = term("KEY_WORD_CLASS", node.state) && term("ID", node.state) && BODY(node.state)
    res && parentNode.push(node)
    return res
}

const BODY = (parentNode) => {
    const node = {
        type: "BODY",
        state: [

        ]
    }
    const res = term("OPEN_BRACE", node.state) && EXPRESSION(node.state) && term("CLOSE_BRACE", node.state);
    res && parentNode.push(node)
    return res
}

const EXPRESSION = (node) => {
    let save = next;

    const saveNext = (callback) => {
        const result = callback();
        if (!result) next = save;
        return result;
    }

    if (saveNext(() => VARIABLE_DECLARATION(node))) {
        //node.state.push({nextType: "VARIABLE_DECLARATION"})
        return true
    }
    else if (saveNext(() => RETURN_STATEMENT(node))) {
        //node.state.push({nextType: "RETURN_STATEMENT"})
        return true
    } else if (saveNext(() =>EPSILON(node))) {
        //node.state.push({nextType: "EPSILON"})
        return true
    }

    return false
}

const VARIABLE_DECLARATION = (parentNode) => {
    const node = {
        type: "VARIABLE_DECLARATION",
        state: [

        ]
    }

    const res = term("KEY_WORD_VAR", node.state) && term("ID", node.state) && 
    term("OPERATOR_ASSIGN", node.state) && 
    VALUE(node.state) && 
    term("SEMI_COLON", node.state) && 
    EXPRESSION(node.state)
    res && parentNode.push(node)
    return res
}

const RETURN_STATEMENT = (parentNode) => {
    const node = {
        type: "RETURN_STATEMENT",
        state: [

        ]
    }
    const res = term("KEY_WORD_RETURN", node.state) && term("ID", node.state) && 
    term("SEMI_COLON", node.state)
    res && parentNode.push(node)
    return res
}


const EPSILON = (parentNode) => {
    const node = {
        type: "EPSILON",
        state: [

        ]
    }
    const res = term("EPSILON", node.state)
    res && parentNode.push(node)
    return res
}

const VALUE = (parentNode) => {
    let save = next;

    const saveNext = (callback) => {
        const result = callback();
        if (!result) next = save;
        return result;
    }

    if (saveNext(() => term("INT", parentNode))) {
        return true
    }

    return false
}

program()

const output = JSON.stringify(currentTerminals.reverse())
console.log(output)
fs.writeFile("output.json", util.inspect(output, { maxArrayLength: 10000 }), ["UTF-8"], () => {
    console.log("saved!")
})