exports.keywords = {
    classK: {
        DFA: [
            { "c": 1 },
            { "l": 2 },
            { "a": 3 },
            { "s": 4 },
            { "s": 5 },
        ],
        TYPE: "KEY_WORD_CLASS"
    },

    elseK: {
        DFA: [
            { "e": 1 },
            { "l": 2 },
            { "s": 3 },
            { "e": 4 }
        ],
        TYPE: "KEY_WORD"
    },

    booleanFalseK: {
        DFA: [
            { "f": 1 },
            { "a": 2 },
            { "l": 3 },
            { "s": 4 },
            { "e": 5 }
        ],
        TYPE: "KEY_WORD"
    },

    booleanTrueK: {
        DFA: [
            { "t": 1 },
            { "r": 2 },
            { "u": 3 },
            { "e": 4 }
        ],
        TYPE: "KEY_WORD"
    },

    ifK: {
        DFA: [
            { "i": 1 },
            { "f": 2 },
        ],
        TYPE: "KEY_WORD"
    },

    fiK: {
        DFA: [
            { "f": 1 },
            { "i": 2 },
        ],
        TYPE: "KEY_WORD"
    },

    inK: {
        DFA: [
            { " ": 1 },
            { "i": 2 },
            { "n": 3 },
            { " ": 4 },
        ],
        TYPE: "KEY_WORD"
    },

    inheritsK: {
        DFA: [
            { "i": 1 },
            { "n": 2 },
            { "h": 3 },
            { "e": 4 },
            { "r": 5 },
            { "i": 6 },
            { "t": 7 },
            { "s": 8 },
        ],
        TYPE: "KEY_WORD"
    },

    isvoidK: {
        DFA: [
            { "i": 1 },
            { "s": 2 },
            { "v": 3 },
            { "o": 4 },
            { "i": 5 },
            { "d": 6 },
        ],
        TYPE: "KEY_WORD"
    },

    letK: {
        DFA: [
            { "l": 1 },
            { "e": 2 },
            { "t": 3 },
        ],
        TYPE: "KEY_WORD"
    },

    loopK: {
        DFA: [
            { "l": 1 },
            { "o": 2 },
            { "o": 3 },
            { "p": 4 },
        ],
        TYPE: "KEY_WORD"
    },

    poolK: {
        DFA: [
            { "p": 1 },
            { "o": 2 },
            { "o": 3 },
            { "l": 4 },
        ],
        TYPE: "KEY_WORD"
    },

    thenK: {
        DFA: [
            { "t": 1 },
            { "h": 2 },
            { "e": 3 },
            { "n": 4 },
        ],
        TYPE: "KEY_WORD"
    },

    whileK: {
        DFA: [
            { "w": 1 },
            { "h": 2 },
            { "i": 3 },
            { "l": 4 },
            { "e": 5 },
        ],
        TYPE: "KEY_WORD"
    },

    caseK: {
        DFA: [
            { "c": 1 },
            { "a": 2 },
            { "s": 3 },
            { "e": 4 },
        ],
        TYPE: "KEY_WORD"
    },

    esacK: {
        DFA: [
            { "e": 1 },
            { "s": 2 },
            { "a": 3 },
            { "c": 4 },
        ],
        TYPE: "KEY_WORD"
    },

    newK: {
        DFA: [
            { "n": 1 },
            { "e": 2 },
            { "w": 3 },
        ],
        TYPE: "KEY_WORD"
    },

    notK: {
        DFA: [
            { "n": 1 },
            { "o": 2 },
            { "t": 3 },
        ],
        TYPE: "KEY_WORD"
    },

    ofK: {
        DFA: [
            { "o": 1 },
            { "f": 2 },
        ],
        TYPE: "KEY_WORD"
    },

    returnK: {
        DFA: [
            { "r": 1 },
            { "e": 2 },
            { "t": 3 },
            { "u": 4 },
            { "r": 5 },
            { "n": 6 },
        ],
        TYPE: "KEY_WORD_RETURN"
    },

    varK: {
        DFA: [
            { "v": 1 },
            { "a": 2 },
            { "r": 3 }
        ],
        TYPE: "KEY_WORD_VAR"
    },

    extendsK: {
        DFA: [
            { "e": 1 },
            { "x": 2 },
            { "t": 3 },
            { "e": 4 },
            { "n": 5 },
            { "d": 6 },
            { "s": 7 }
        ],
        TYPE: "KEY_WORD_EXTENDS"
    },

    functionK: {
        DFA: [
            { "f": 1 },
            { "u": 2 },
            { "n": 3 },
            { "c": 4 },
            { "t": 5 },
            { "i": 6 },
            { "o": 7 },
            { "n": 8 }
        ],
        TYPE: "KEY_WORD_FUNCTION"
    },

    // Access modifiers

    privateK: {
        DFA: [
            { "p": 1 },
            { "r": 2 },
            { "i": 3 },
            { "v": 4 },
            { "a": 5 },
            { "t": 6 },
            { "e": 7 },
        ],
        TYPE: "KEY_WORD_PRIVATE"
    },

    protectedK: {
        DFA: [
            { "p": 1 },
            { "r": 2 },
            { "o": 3 },
            { "t": 4 },
            { "e": 5 },
            { "c": 6 },
            { "t": 7 },
            { "e": 8 },
            { "d": 9 }
        ],
        TYPE: "KEY_WORD_PROTECTED"
    },

    publicK: {
        DFA: [
            { "p": 1 },
            { "u": 2 },
            { "b": 3 },
            { "l": 4 },
            { "i": 5 },
            { "c": 6 },
        ],
        TYPE: "KEY_WORD_PUBLIC"
    }
}
