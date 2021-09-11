const tokens = [ { TYPE: 'INT', position: 0, lexem: '2' },
{ TYPE: 'MATH_OP_PLUS', position: 1, lexem: '+' },
{ TYPE: 'INT', position: 2, lexem: '40' },
{ TYPE: 'MATH_OP_MULTIPLY', position: 4, lexem: '*' },
{ TYPE: 'INT', position: 5, lexem: '8' } ]

const syntaxTree = [];
let next = -1;
let state = false;
let currentTerminals = []


const term = (token, termstate) => {
    next++
    if (!tokens[next]) {
        return false
    }

    //console.log({ "NEXT": next }, { "CHECKING:": token }, { "CURRENT": tokens[next].TYPE }, token === tokens[next].TYPE);
    state = token === tokens[next].TYPE;
    termstate.push(tokens[next]);
    return state;
}

const e = () => {
    let save = next;

    const saveNext = (callback) => {
        const result = callback();
        if (!result) next = save;
        return result;
    }


    if (saveNext(INT_PLUS_E1)) {
        syntaxTree.push("INT_PLUS_E1")
        return true
    } else if (saveNext(INT_MINUS_E1)) {
        syntaxTree.push("INT_MINUS_E1")
        return true
    }

    return false
}

const e1 = () => {
    let save = next;

    const saveNext = (callback) => {
        const result = callback();
        if (!result) next = save;
        return result;
    }

    if (saveNext(INT_MULTIPLY_E1)) {
        syntaxTree.push("INT_MULTIPLY_E1")
        return true
    }
    else if (saveNext(INT_DIVIDE_E1)) {
        syntaxTree.push("INT_DIVIDE_E1")
        return true
    }
    else if (saveNext(e)) {
        syntaxTree.push("E")
        return true
    }
    if (saveNext(INT)) {
        syntaxTree.push("INT")
        return true
    }

    return false
}

//e
const INT_PLUS_E1 = () => {
    const state = []
    const res = term("INT", state) && term("MATH_OP_PLUS", state) && e1()
    res && currentTerminals.push(state)
    return res
}

const INT_MINUS_E1 = () => {
    const state = []
    const res = term("INT", state) && term("MATH_OP_MINUS", state) && e1()
    res && currentTerminals.push(state)
    return res
}

//e1
const INT_MULTIPLY_E1 = () => {
    const state = []
    const res = term("INT", state) && term("MATH_OP_MULTIPLY", state) && e1()
    res && currentTerminals.push(state)
    return res
}

const INT_DIVIDE_E1 = () => {
    const state = []
    const res = term("INT", state) && term("MATH_OP_DIVIDE", state) && e1()
    res && currentTerminals.push(state)
    return res
}

const INT = () => {
    const state = []
    const res = term("INT", state);
    res && currentTerminals.push(state)
    return res
}

e()
console.log(syntaxTree)
console.log(currentTerminals)