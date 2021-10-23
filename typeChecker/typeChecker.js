const util = require('util');
const fs = require('fs');
const colors = require('colors');

let st = []

var myArgs = process.argv.slice(2);
const parser_output_path = "/Users/artjoms/Desktop/parser/parser/output.json" // myArgs[0];

try {
    const data = fs.readFileSync(parser_output_path, 'utf8')
    st = JSON.parse(data);
} catch (err) {
    console.error(err)
}




const SCOPES = [

]

const scopeChecker = (state) => {
    const errors = [];

    if(!state.length) errors.push("No state")

    state.forEach((TOKEN, index) => {
        if (TOKEN.TYPE === "BODY") {
            SCOPES.push({
                SCOPE_ID: Math.round(Math.random() * 10000000),
                IDENTIFIERS: [],
            })
        }

        // Register declared variable and check 
        // that variable already declared.
        if (TOKEN.TYPE === "KEY_WORD_VAR") {
            const declared_variable = state[index + 1];
            const scope_identifiers = SCOPES[SCOPES.length - 1].IDENTIFIERS;
            const error = `Variable already declared in this scope! Error position ${declared_variable.position}`

            scope_identifiers.forEach((identifier) => {
                try {
                    if (identifier.lexem === declared_variable.lexem) throw error
                } catch (error) {
                    console.error(error.black.bgRed);
                    throw new Error(error);
                }

            })

            scope_identifiers.push(declared_variable);
        }

        if (TOKEN.state) {
            scopeChecker(TOKEN.state)
        }
        return 
    })

    const successMessage = "Semantic analysis proceed successfully.";
    const errorMessage = "Semantic analysis failed";
    const message = errors.length ? errorMessage.bgRed.black : successMessage.bgGreen.black;  

    return message;
}

const message = scopeChecker(st)


console.log(message.bgGreen.black, "\n" + util.inspect(SCOPES, { showHidden: false, depth: null, colors: true }))