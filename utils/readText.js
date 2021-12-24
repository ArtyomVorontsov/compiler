const util = require('util');
const fs = require('fs');
const colors = require('colors');
const { __esModule } = require('@babel/traverse/lib/path');


class CompilerError {
    constructor(message, color = "red") {
        this.message = message[color];
    }
}


module.exports = readText = (path) => {
    // Read AST from parser output.
    try {
        if (!path) throw new CompilerError("Path is not provided.", "red");

        try {
            const AST_JSON = fs.readFileSync(path, 'utf8');
            return JSON.parse(AST_JSON);

        } catch (error) {
            throw new CompilerError("No such file in directory provided", "red");
        }
    } catch (error) {
        throw error.message;
    }
}