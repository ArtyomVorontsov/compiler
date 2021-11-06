exports.bracketsAndOperators = {
    openParentheses: {
        DFA: [
            { "(": 1 }
        ],
        TYPE: "OPEN_PARENTHESES"
    },

    closeParentheses: {
        DFA: [
            { ")": 1 }
        ],
        TYPE: "CLOSE_PARENTHESES"
    },

    openBracket: {
        DFA: [
            { "{": 1 }
        ],
        TYPE: "OPEN_BRACE"
    },

    closeBracket: {
        DFA: [
            { "}": 1 }
        ],
        TYPE: "CLOSE_BRACE"
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

    cols: {
        DFA: [
            { ";": 1 }
        ],
        TYPE: "SEMI_COLON"
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
            { "=": 1 },
        ],
        TYPE: "OPERATOR_ASSIGN"
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