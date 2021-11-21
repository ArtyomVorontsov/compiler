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
    state && termstate.push(tokens[next]);
    return state;
}

// General nodes.

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


    if (saveNext(() => PROGRAM_DECLARATION(node.state))) {
        currentTerminals.push(node)
        return true
    }

    return false
}

const PROGRAM_DECLARATION = (parentNode) => {

    const node = {
        TYPE: "PROGRAM_DECLARATION",
        state: [

        ]
    }

    const res = term("KEY_WORD_PROGRAM", node.state) && term("OPEN_BRACE", node.state) && MULTI_EXPRESSION(node.state) && term("CLOSE_BRACE", node.state);
    res && parentNode.push(...node.state)
    return res;
}

const MULTI_EXPRESSION = (state) => {
    const isValid = []
    do {
        isValid.push(EXPRESSION(state));
    } while (isValid[isValid.length - 1]);

    return isValid.includes(true);
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
    else if (saveNext(() => EPSILON(node))) {
        return true
    }
    else if (saveNext(() => FUNCTION_STATEMENT(node))) {
        return true
    }
    else if (saveNext(() => CLASS_PARAMETER_DECLARATION(node))) {
        return true
    }
    else if (saveNext(() => CLASS_PARAMETER_DECLARATION_WITH_INIT(node))) {
        return true
    }

    return false
}

const VALUE = (parentNode) => {
    let save = next;

    const saveNext = (callback) => {
        const result = callback();
        if (!result) next = save;
        return result;
    }

    if (saveNext(() => ARIFMETIC_OPERATION_STATEMENT(parentNode))) {
        return true
    }
    else if (saveNext(() => term("STRING", parentNode))) {
        return true
    }
    else if (saveNext(() => term("INT", parentNode))) {
        return true
    }
    else if (saveNext(() => CLASS_INIT(parentNode))) {
        return true
    }
    else if (saveNext(() => OBJECT_VALUES_ADRESSING(parentNode))) {
        return true
    }
    else if (saveNext(() => term("ID", parentNode))) {
        return true;
    }

    return false
}


const ACCESS_MODIFIERS = (parentNode) => {
    let save = next;

    const saveNext = (callback) => {
        const result = callback();
        if (!result) next = save;
        return result;
    }

    if (saveNext(() => term("KEY_WORD_PRIVATE", parentNode))) {
        return true
    }
    else if (saveNext(() => term("KEY_WORD_PROTECTED", parentNode))) {
        return true
    }
    else if (saveNext(() => term("KEY_WORD_PUBLIC", parentNode))) {
        return true
    }

    return false
}



const TYPE = (node) => {
    let save = next;

    const saveNext = (callback) => {
        const result = callback();
        if (!result) next = save;
        return result;
    }

    if (saveNext(() => term("TYPE_STRING", node))) {
        return true
    }
    else if (saveNext(() => term("TYPE_INT", node))) {
        return true;
    }
    else if (saveNext(() => term("INT", node))) {
        return true;
    }
    else if (saveNext(() => term("STRING", node))) {
        return true;
    }
    else if (saveNext(() => term("ID", node))) {
        return true;
    }

    return false
}

// Specific nodes.

const BODY = (parentNode) => {
    const node = {
        TYPE: "BODY",
        state: [

        ]
    }
    const res = term("OPEN_BRACE", node.state) && ((MULTI_EXPRESSION(node.state) && term("CLOSE_BRACE", node.state)) || term("CLOSE_BRACE", node.state));
    res && parentNode.push(node)
    return res
}

const CLASS_DECLARATION = (parentNode) => {
    const node = {
        TYPE: "CLASS_DECLARATION",
        state: [

        ]
    }
    const res = term("KEY_WORD_CLASS", node.state) && term("ID", node.state) && CLASS_DECLARATION_TYPE_STATEMENT(node.state);

    res && parentNode.push(node)
    return res
}

const CLASS_DECLARATION_TYPE_STATEMENT = (node) => {
    let save = next;

    const saveNext = (callback) => {
        const result = callback();
        if (!result) next = save;
        return result;
    }

    if (saveNext(() => BODY(node))) {
        return true
    }
    else if (saveNext(() => EXTENDS_STATEMENT(node))) {
        return true;
    }

    return false
}

const CLASS_INIT = (parentNode) => {
    const node = {
        TYPE: "CLASS_INIT",
        state: [

        ]
    }
    const res = term("KEY_WORD_NEW", node.state) && term("ID", node.state) &&
        term("OPEN_PARENTHESES", node.state) && FUNCTION_ARGUMENTS(node.state) &&
        term("CLOSE_PARENTHESES", node.state);
    res && parentNode.push(node)
    return res
}

const OBJECT_VALUES_ADRESSING = (parentNode) => {
    const node = {
        TYPE: "OBJECT_VALUES_ADRESSING",
        state: [

        ]
    }

    const res = term("ID", node.state) && term("DOT", node.state) && term("ID", node.state);

    res && parentNode.push(node);
    return res;
}

const EXTENDS_STATEMENT = (parentNode) => {
    const node = {
        TYPE: "EXTENDS_STATEMENT",
        state: [

        ]
    }
    const res = term("KEY_WORD_EXTENDS", node.state) && term("ID", node.state) && BODY(node.state)

    // If we want remove TYPE: "EXTENDS_STATEMENT" from AST, we can spread all subnodes into parent node
    res && parentNode.push(...node.state)
    return res
}

const FUNCTION_STATEMENT = (parentNode) => {
    const node = {
        TYPE: "FUNCTION_STATEMENT",
        state: [

        ]
    }
    const res = ACCESS_MODIFIERS(node.state) && TYPE(node.state) && term("KEY_WORD_FUNCTION", node.state) &&
        term("ID", node.state) && term("OPEN_PARENTHESES", node.state) &&
        FUNCTION_ARGUMENTS(node.state) && term("CLOSE_PARENTHESES", node.state) && BODY(node.state);


    res && parentNode.push(node)
    return res
}

const FUNCTION_ARGUMENTS = (parentNode) => {
    const node = {
        TYPE: "FUNCTION_ARGUMENTS",
        state: [

        ]
    }

    const isValid = []
    do {
        isValid.push(isValid.length > 0 ?
            (term("COMMA", node.state) && FUNCTION_ARGUMENT(node.state)) :
            FUNCTION_ARGUMENT(node.state));
    } while (isValid[isValid.length - 1]);
    // Code above will end cycle only if mistake will be taken (last value of isValid should be false)
    // We should perform backtacking (next = next - 1) to reset 'next' counter.
    next = isValid.length > 1 ? next - 1 : next;

    isValid && parentNode.push(node);
    return true;
}

const FUNCTION_ARGUMENT = (parentNode) => {
    const node = {
        TYPE: "FUNCTION_ARGUMENT",
        state: [

        ]
    }

    const res = TYPE(node.state) && term("ID", node.state)

    res && parentNode.push(node)
    return res
}

const CLASS_PARAMETER_DECLARATION = (parentNode) => {
    const node = {
        TYPE: "CLASS_PARAMETER_DECLARATION",
        state: [

        ]
    }

    const res = ACCESS_MODIFIERS(node.state) && TYPE(node.state) && term("ID", node.state) && term("SEMI_COLON", node.state);

    res && parentNode.push(node)
    return res
}

const CLASS_PARAMETER_DECLARATION_WITH_INIT = (parentNode) => {
    const node = {
        TYPE: "CLASS_PARAMETER_DECLARATION_WITH_INIT",
        state: [

        ]
    }

    const res = ACCESS_MODIFIERS(node.state) && TYPE(node.state) && term("ID", node.state) &&
        term("OPERATOR_ASSIGN", node.state) && VALUE(node.state) &&
        term("SEMI_COLON", node.state);

    res && parentNode.push(node)
    return res
}


const ARIFMETIC_OPERATION_STATEMENT = (parentNode) => {
    const node = {
        TYPE: "ARIFMETIC_OPERATION_STATEMENT",
        state: [

        ]
    }

    const res =
        (term("ID", node.state)) &&
        ARIFMETIC_OPERATOR(node.state) &&
        (term("ID", node.state));

    res && parentNode.push(node)
    return res
}


const ARIFMETIC_OPERATOR = (node) => {
    let save = next;

    const saveNext = (callback) => {
        const result = callback();
        if (!result) next = save;
        return result;
    }

    if (saveNext(() => term("MATH_OP_PLUS", node))) {
        return true
    }
    else if (saveNext(() => term("MATH_OP_MINUS", node))) {
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

    const res = term("KEY_WORD_VAR", node.state) &&
        TYPE(node.state) &&
        term("ID", node.state) &&
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

    const res = term("KEY_WORD_RETURN", node.state) && RETURN_STATEMENT_TYPE(node.state) &&
        term("SEMI_COLON", node.state)
    res && parentNode.push(node)
    return res
}

const RETURN_STATEMENT_TYPE = (node) => {
    let save = next;

    const saveNext = (callback) => {
        const result = callback();
        if (!result) next = save;
        return result;
    }

    if (saveNext(() => term("ID", node))) {
        return true
    }
    else if (saveNext(() => VALUE(node))) {
        return true
    }

    return false
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

program()

const output = JSON.stringify(currentTerminals.reverse())
console.log(output)

fs.writeFileSync("/Users/artjoms/Desktop/parser/parser/output.json", output, ["UTF-8"], () => {
    console.log("saved!")
})