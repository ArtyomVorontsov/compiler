exports.bracketsAndOperators = {
    openParentheses: {
        DFA: [
            { "(": 1 }
        ],
        TYPE: "PARENTHESES"
    },

    closeParentheses: {
        DFA: [
            { ")": 1 }
        ],
        TYPE: "PARENTHESES"
    },

    openBracket: {
        DFA: [
            { "{": 1 }
        ],
        TYPE: "BRACKETS"
    },

    closeBracket: {
        DFA: [
            { "}": 1 }
        ],
        TYPE: "BRACKETS"
    },

    multiply: {
        DFA: [
            { "*": 1 }
        ],
        TYPE: "MATH_OP_MULTIPLY"
    },

    divide: {
        DFA: [
            { "/": 1 }
        ],
        TYPE: "MATH_OP_DIVIDE"
    },

    substract: {
        DFA: [
            { "-": 1 }
        ],
        TYPE: "MATH_OP_MINUS"
    },

    addition: {
        DFA: [
            { "+": 1 }
        ],
        TYPE: "MATH_OP_PLUS"
    },

    comparison: {
        DFA: [
            { "=": 1 },
        ],
        TYPE: "MATH_OP_COMPARISON"
    },

    cols: {
        DFA: [
            { ";": 1 }
        ],
        TYPE: "COLS"
    },

    quotes: {
        DFA: [
            { '"': 1 }
        ],
        TYPE: "QUOTES"
    },


    space: {
        DFA: [
            { " ": 1 }
        ],
        TYPE: "SPACE"
    },

    newLine: {
        DFA: [
            { "\n": 1 }
        ],
        TYPE: "NEW_LINE"
    },

    tab: {
        DFA: [
            {"\t": 1}
        ],
        TYPE: "TAB"
    },

    moreSign: {
        DFA: [
            { "<": 1 }
        ],
        TYPE: "MATH_OP"
    },

    lessSign: {
        DFA: [
            { ">": 1 },
        ],
        TYPE: "MATH_OP"
    },

    moreOrEqualSign: {
        DFA: [
            { "<": 1 },
            { "=": 2 }
        ],
        TYPE: "MATH_OP"
    },

    lessOrEqualSign: {
        DFA: [
            { ">": 1 },
            { "=": 1 },
        ],
        TYPE: "MATH_OP"
    },

    commentDeclaration: {
        DFA: [
            { "/": 1 },
            { "/": 2 }
        ],
        TYPE: "COMMENT_DECLARATION"
    },

    assignment: {
        DFA: [
            { "<": 1 },
            { "-": 2 }
        ],
        TYPE: "ASSIGNMENT"
    },

    dot: {
        DFA: [
            { ".": 1 },
        ],
        TYPE: "DOT"
    },

    column: {
        DFA: [
            {":": 1}
        ],
        TYPE: "COLUMN"
    },

    comma: {
        DFA: [
            {",": 1}
        ],
        TYPE: "COMMA"
    },

    
}