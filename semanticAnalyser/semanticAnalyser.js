const util = require('util');
const fs = require('fs');
const colors = require('colors');


class CompilerError {
    constructor(message, color = "red") {
        this.message = message[color];
    }
}

/*
    IdentifierStructure: {
        identifier: string;
        is_declaration: boolean;
        position: number;
    }
*/
class IdentifierStructure {
    constructor(identifier, is_declaration, position) {
        this.identifier = identifier
        this.is_declaration = is_declaration
        this.position = position
    }
}

/*
    Scope: {
        SCOPE_ID: number;
        IDENTIFIERS: IdentifierStructure[]
    }
*/
class Scope {
    constructor(SCOPE_ID, IDENTIFIERS) {
        this.SCOPE_ID = SCOPE_ID;
        this.IDENTIFIERS = IDENTIFIERS;
    }

    get get_identifiers() {
        return this.IDENTIFIERS;
    }

    get get_scope_id() {
        return this.SCOPE_ID;
    }

    set_identifiers(identifier, is_declaration, position) {
        if (is_declaration) this.is_identifier_declared_in_scope_check(identifier);

        const identifier_structure = new IdentifierStructure(identifier, is_declaration, position);
        return this.IDENTIFIERS.push(identifier_structure);
    }

    is_identifier_declared_in_scope_check(identifier) {
        // Checking identifier declatation in scope.
        this.IDENTIFIERS.forEach(identifierStructure => {
            if (identifierStructure.is_declaration) {
                if (identifierStructure.identifier === identifier) {
                    throw new CompilerError(`Identifier ${identifier} already declared in this scope. 
                    On position ${identifierStructure.position}`).message;
                }
            }
        })
    }

    find(identifier) {
        const scopeIdentifiers = this.get_identifiers;
        let exists = false;
        scopeIdentifiers.forEach((scopeIdentifier) => {
            if (scopeIdentifier.identifier === identifier) exists = true;
        })
        return exists;
    }
}

class SymbolTable {
    constructor(scope_stack) {
        this.scope_stack = scope_stack;
    }

    get get_scope_stack() {
        return this.scope_stack;
    }

    // Classic push method. (preferable to use create_scope method)
    scope_push(scope) {
        this.scope_stack.push(scope)
    }

    scope_pop() {
        return this.scope_stack.pop();
    }

    // Create scope without passing scope object into method.
    create_scope(scope_id) {
        const scope = new Scope(scope_id, []);
        this.scope_stack.push(scope)
    }

    update_last_scope(identifier, is_declaration, position) {

        // Check is variable declared
        if (!is_declaration && !this.find(identifier)) {
            throw new CompilerError(`Variable "${identifier}" is not declared. On position: ${position}.`).message;
        }

        const last_scope_in_scope_stack = this.scope_stack[this.scope_stack.length - 1];
        identifier && last_scope_in_scope_stack && last_scope_in_scope_stack.set_identifiers(identifier, is_declaration, position);
    }

    find(identifier) {
        const scope_stack = this.get_scope_stack;
        let exists = false;
        scope_stack.reverse().forEach((scope) => {
            if (scope.find(identifier)) exists = true;
        })

        return exists;
    }

}

const semanticAnalyser = () => {

    // Abstract Syntax Tree
    let AST = getAST();

    const scopes = scopeCreator(AST);
    console.log(util.inspect(scopes, false, null, true))
}


const getAST = () => {
    // Read AST from parser output.
    try {
        // Get path argument value.
        const parser_output_path = process.argv.slice(2)[0];
        if (!parser_output_path) throw new CompilerError("Parser output path is not provided.", "red");

        try {
            const AST_JSON = fs.readFileSync(parser_output_path, 'utf8');
            return JSON.parse(AST_JSON);

        } catch (error) {
            throw new CompilerError("No such file in directory provided", "red");
        }
    } catch (error) {
        throw error.message;
    }
}

const scopeCreator = (AST) => {
    const initial_scope = new Scope(AST[0].state[0].position, [])
    const symbol_table = new SymbolTable([initial_scope]);
    const symbol_table_snapshot = []
    traverseAstAndComputeScopes(AST[0].state, symbol_table, symbol_table_snapshot, 0)

    return symbol_table_snapshot;
}

const traverseAstAndComputeScopes = (AST, symbol_table, symbol_table_snapshot, index) => {
    AST.forEach((node) => {
        if (node.TYPE === "CLASS_DECLARATION") {
            const scope_id = node.state[0].position
            symbol_table.create_scope(scope_id);
        }

        if (node.TYPE === "VARIABLE_DECLARATION") {
            const identifier = node.state[2].lexem;
            const position = node.state[2].position;
            symbol_table.update_last_scope(identifier, true, position);
        }

        if (node.TYPE === "VARIABLE_ASSIGNEMENT") {
            const identifier = node.state[0].lexem;
            const position = node.state[0].position;
            symbol_table.update_last_scope(identifier, false, position);
        }

        if (node.TYPE === "ARIFMETIC_OPERATION_STATEMENT") {
            node.state.forEach((child_node) => {
                if (child_node.TYPE === "ID") {
                    const identifier = child_node.lexem;
                    const position = child_node.position;
                    symbol_table.update_last_scope(identifier, false, position);
                }
            })
        }

        node.state && traverseAstAndComputeScopes(node.state, symbol_table, symbol_table_snapshot, index);

        if (node.TYPE === "CLASS_DECLARATION") {
            // For testing purposes
            symbol_table_snapshot.push(symbol_table.scope_pop());
        }
    })
}

semanticAnalyser();