const fs = require('fs');
const util = require('util');

var myArgs = process.argv.slice(2);
console.log('lexer_output_path: ', myArgs[0]);
const lexer_output_path = myArgs[0];
let tokens = []

try {
    const data = fs.readFileSync(lexer_output_path, 'utf8')
    tokens = JSON.parse(data);
} catch (err) {
    console.error(err)
}

console.log(tokens)

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
        TYPE: "PROGRAM",
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
    else if (saveNext(() => VARIABLE_ASSIGNEMENT(node))) {
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
    term("SEMI_COLON", node.state);
    res && parentNode.push(node)
    return res
}

const VARIABLE_ASSIGNEMENT = (parentNode) => {
    const node = {
        TYPE: "VARIABLE_ASSIGNEMENT",
        state: [

        ]
    }

    const res = term("ID", node.state) && 
    term("OPERATOR_ASSIGN", node.state) && 
    VALUE(node.state) && 
    term("SEMI_COLON", node.state);
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

fs.writeFileSync("/Users/artjoms/Desktop/parser/parser/output.json",output, ["UTF-8"], () => {
    console.log("saved!")
})