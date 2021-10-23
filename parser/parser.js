const fs = require('fs');
const util = require('util');

const tokens = [
    { TYPE: 'KEY_WORD_CLASS', position: 0, lexem: 'class' },
    { TYPE: 'ID', position: 6, lexem: 'main' },
    { TYPE: 'OPEN_BRACE', position: 11, lexem: '{' },
    { TYPE: 'KEY_WORD_VAR', position: 17, lexem: 'var' },
    { TYPE: 'ID', position: 21, lexem: 'lol' },
    { TYPE: 'OPERATOR_ASSIGN', position: 25, lexem: '=' },
    { TYPE: 'INT', position: 27, lexem: '50' },
    { TYPE: 'SEMI_COLON', position: 29, lexem: ';' },
    { TYPE: 'KEY_WORD_RETURN', position: 35, lexem: 'return' },
    { TYPE: 'ID', position: 42, lexem: 'lol' },
    { TYPE: 'SEMI_COLON', position: 45, lexem: ';' },
    { TYPE: 'KEY_WORD_CLASS', position: 52, lexem: 'class' },
    { TYPE: 'ID', position: 58, lexem: 'hello' },
    { TYPE: 'OPEN_BRACE', position: 64, lexem: '{' },
    { TYPE: 'KEY_WORD_VAR', position: 74, lexem: 'var' },
    { TYPE: 'ID', position: 78, lexem: 'i' },
    { TYPE: 'OPERATOR_ASSIGN', position: 80, lexem: '=' },
    { TYPE: 'INT', position: 82, lexem: '50' },
    { TYPE: 'SEMI_COLON', position: 84, lexem: ';' },
    { TYPE: 'KEY_WORD_RETURN', position: 94, lexem: 'return' },
    { TYPE: 'ID', position: 101, lexem: 'i' },
    { TYPE: 'SEMI_COLON', position: 102, lexem: ';' },
    { TYPE: 'CLOSE_BRACE', position: 108, lexem: '}' },
    { TYPE: 'KEY_WORD_CLASS', position: 115, lexem: 'class' },
    { TYPE: 'ID', position: 121, lexem: 'bue' },
    { TYPE: 'OPEN_BRACE', position: 125, lexem: '{' },
    { TYPE: 'KEY_WORD_VAR', position: 135, lexem: 'var' },
    { TYPE: 'ID', position: 139, lexem: 'abc' },
    { TYPE: 'OPERATOR_ASSIGN', position: 143, lexem: '=' },
    { TYPE: 'INT', position: 145, lexem: '50' },
    { TYPE: 'SEMI_COLON', position: 147, lexem: ';' },
    { TYPE: 'KEY_WORD_RETURN', position: 157, lexem: 'return' },
    { TYPE: 'ID', position: 164, lexem: 'abc' },
    { TYPE: 'SEMI_COLON', position: 167, lexem: ';' },
    { TYPE: 'CLOSE_BRACE', position: 173, lexem: '}' },
    { TYPE: 'CLOSE_BRACE', position: 175, lexem: '}' }
  ]

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
        TYPE: "BODY",
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
        TYPE: "CLASS_DECLARATION",
        state: [

        ]
    }
    const res = term("KEY_WORD_CLASS", node.state) && term("ID", node.state) && BODY(node.state)
    res && parentNode.push(node)
    return res
}

const MULTI_EXPRESSION = (state) => {
    const isValid = []
    do {
        isValid.push(EXPRESSION(state));
    } while (isValid[isValid.length - 1]);

    return isValid.includes(true);
}

const BODY = (parentNode) => {
    const node = {
        TYPE: "BODY",
        state: [

        ]
    }
    const res = term("OPEN_BRACE", node.state) && MULTI_EXPRESSION(node.state) && term("CLOSE_BRACE", node.state);
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
        return true
    }
    else if (saveNext(() => RETURN_STATEMENT(node))) {
        return true
    } 
    else if (saveNext(() => CLASS_DECLARATION(node))) {
        return true
    } 
    else if (saveNext(() =>EPSILON(node))) {
        return true
    }

    return false
}

const VARIABLE_DECLARATION = (parentNode) => {
    const node = {
        TYPE: "VARIABLE_DECLARATION",
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
        TYPE: "RETURN_STATEMENT",
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
        TYPE: "EPSILON",
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