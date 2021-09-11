const { bracketsAndOperators } = require("./dfa/bracketsAndOperators");
const { keywords } = require("./dfa/keywords");
const { stringsAndNumbers } = require("./dfa/stringsAndNumbers");
const fs = require('fs');
const util = require('util');

const {
    openParentheses,
    closeParentheses,
    openBracket,
    closeBracket,
    multiply,
    divide,
    substract,
    addition,
    assignment,
    comparison,
    cols,
    space,
    newLine,
    commentDeclaration,
    moreSign,
    lessSign,
    moreOrEqualSign,
    lessOrEqualSign,
    column,
    dot,
    tab,
    comma,
    quotes
} = bracketsAndOperators;

const {
    classK,
    elseK,
    booleanFalseK,
    booleanTrueK,
    ifK,
    fiK,
    inK,
    inheritsK,
    isvoidK,
    letK,
    loopK,
    poolK,
    thenK,
    whileK,
    caseK,
    esacK,
    newK,
    notK,
    ofK,
} = keywords;

const {
    variableIdentifier,
    number
} = stringsAndNumbers


let program = "";

try {
    const data = fs.readFileSync('./code.txt', 'utf8')
    program = data;
} catch (err) {
    console.error(err)
}

const fa = (dfa, initial, acceptable, s) => {
    let state = initial
    let lexem = "";

    for (let i = 0; i < s.length; i++) {
        state = dfa[state][s[i]] ? dfa[state][s[i]] : 0;
        if (state === 0) break;
        lexem = lexem + s[i];
        if (state === acceptable) {
            break;
        }
    }
    return { acceptable: state === acceptable, lexem };
}


const faId = (dfa, initial, acceptable, s) => {
    let state = initial;
    let lexem = "";

    for (let i = 0; i < s.length; i++) {
        state = dfa[state][s[i]] ? dfa[state][s[i]] : state;
        if (!dfa[state][s[i]]) break;
        lexem += s[i];
    }

    return { acceptable: state === acceptable, lexem };
}

const tildaReplacer = (count) => {
    let replacer = "";
    for (let i = 0; i < count; i++) {
        replacer += "~";
    }

    return replacer;
}

const runner = ({ DFA, TYPE }, acceptable, string, globalTokens, fa) => {
    let lastFAReturn = {
        acceptable: false,
        lexem: ""
    };

    let stringForFA = `${string}`;
    let position = 0;

    do {
        //handling FA
        lastFAReturn = fa(DFA, 0, acceptable, stringForFA);
        //removing charactes which was processed by FA
        stringForFA = stringForFA.substring(lastFAReturn.acceptable ? lastFAReturn.lexem.length : 1);

        //handling FA output
        if (lastFAReturn.acceptable) {
            globalTokens.push({ TYPE, position, lexem: lastFAReturn.lexem });
            string = string.replace(lastFAReturn.lexem, tildaReplacer(lastFAReturn.lexem.length));
        };

        //increasing position value
        if (lastFAReturn.acceptable) {
            position += lastFAReturn.lexem.length
        } else {
            ++position
        }

    } while (stringForFA.length);
    return string;
}

const sorter = (tokens) => {
    let temp;
    let offset = 0;
    let sortedTokens = [...tokens];

    do {
        for (let i = 0; i < sortedTokens.length - 1 - offset; i++) {
            if (sortedTokens[i].position > sortedTokens[i + 1].position) {
                //swap
                temp = sortedTokens[i];
                sortedTokens[i] = sortedTokens[i + 1];
                sortedTokens[i + 1] = temp;
            }
        }

        ++offset;
    } while (offset !== sortedTokens.length - 2);

    return sortedTokens;
}

const undeclaredSybmols = (string, tokens) => {
    for (let i = 0; i < string.length; i++) {
        if (string[i] !== "~") {
            tokens.push({ type: "ERROR", lexem: string[i], position: i });
            string = string.replace(string[i], "~");
        }
    }

    return string;
}

const commentHandler = (globalTokens) => {

    let tokens = [...globalTokens];



    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].lexem === "//") {
            for (let j = 0; j < tokens.length; j++) {
                if (tokens[j].lexem === "\n" || j === tokens.length - 1) {
                    tokens = tokens.filter((token, index) => {
                        let isTokenIsCommented = index >= i && index <= j
                        return !isTokenIsCommented
                    })
                }
            }
        }
    }



    return tokens;
}

const lexer = (string) => {
    const tokens = [];

    string = runner(letK, 3, string, tokens, fa);
    string = runner(ifK, 2, string, tokens, fa);
    string = runner(classK, 5, string, tokens, fa);
    string = runner(elseK, 4, string, tokens, fa);
    string = runner(booleanFalseK, 5, string, tokens, fa);
    string = runner(booleanTrueK, 4, string, tokens, fa);
    string = runner(fiK, 2, string, tokens, fa);
    string = runner(inK, 4, string, tokens, fa);
    string = runner(inheritsK, 8, string, tokens, fa);
    string = runner(isvoidK, 6, string, tokens, fa);
    string = runner(loopK, 4, string, tokens, fa);
    string = runner(poolK, 4, string, tokens, fa);
    string = runner(thenK, 4, string, tokens, fa);
    string = runner(whileK, 5, string, tokens, fa);
    string = runner(caseK, 4, string, tokens, fa);
    string = runner(esacK, 4, string, tokens, fa);
    string = runner(newK, 3, string, tokens, fa);
    string = runner(notK, 3, string, tokens, fa);
    string = runner(ofK, 2, string, tokens, fa);


    string = runner(newLine, 1, string, tokens, fa);
    string = runner(comparison, 1, string, tokens, fa)
    string = runner(commentDeclaration, 2, string, tokens, fa);


    string = runner(assignment, 1, string, tokens, fa);
    string = runner(column, 1, string, tokens, fa);
    string = runner(openParentheses, 1, string, tokens, fa);
    string = runner(closeParentheses, 1, string, tokens, fa);
    string = runner(openBracket, 1, string, tokens, fa);
    string = runner(closeBracket, 1, string, tokens, fa);
    string = runner(cols, 1, string, tokens, fa);
    string = runner(lessSign, 1, string, tokens, fa);
    string = runner(multiply, 1, string, tokens, fa);
    string = runner(divide, 1, string, tokens, fa);
    string = runner(addition, 1, string, tokens, fa);
    string = runner(substract, 1, string, tokens, fa);
    string = runner(moreSign, 1, string, tokens, fa);
    string = runner(lessSign, 1, string, tokens, fa);
    string = runner(moreOrEqualSign, 2, string, tokens, fa);
    string = runner(lessOrEqualSign, 2, string, tokens, fa);
    string = runner(tab, 1, string, tokens, fa);
    string = runner(comma, 1, string, tokens, fa);
    string = runner(dot, 1, string, tokens, fa);
    string = runner(quotes, 1, string, tokens, fa);

    string = runner(number, 1, string, tokens, faId);
    string = runner(variableIdentifier, 1, string, tokens, faId);
    string = runner(space, 1, string, tokens, fa);


    //error handling
    string = undeclaredSybmols(string, tokens);



    let sortedTokens = sorter(tokens);

    //comment handling
    sortedTokens = commentHandler(sortedTokens);

    const glueString = (tokens) => {
        const lexems = []

        tokens.forEach(token => {
            lexems.push(token.lexem);
        });

        return lexems.join("");
    }

    const gluedString = glueString(sortedTokens)

    return { sortedTokens, string, gluedString };
}

const output = lexer(program);
fs.writeFile("output.js", util.inspect(output.sortedTokens, { maxArrayLength: 10000 }), ["UTF-8"], () => {
    console.log("saved!")
})