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
        type: Array<string>;
        is_declaration: boolean;
        position: number;
        return_type: Array<string> | string
    }
*/
class IdentifierStructure {
    constructor({ identifier, type, is_declaration, position, return_type }) {
        this.identifier = identifier
        this.TYPE = type;
        this.is_declaration = is_declaration
        this.position = position
        this.return_type = return_type ? return_type : type
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

    set_identifiers({ identifier, type, is_declaration, position, return_type }) {
        if (is_declaration) this.is_identifier_declared_in_scope_check(identifier);

        const identifier_structure = new IdentifierStructure({ identifier, type, is_declaration, position, return_type });
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
            if (scopeIdentifier.identifier === identifier) return exists = scopeIdentifier;
        })

        return exists
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

    update_last_scope({ identifier, type, is_declaration, position, extends_class, return_type }) {

        // Check is variable declared
        if (!is_declaration) {
            if (!this.find(identifier)) {
                throw new CompilerError(`Variable "${identifier}" is not declared. On position: ${position}.`).message;
            }

            const identifierStructure = this.find(identifier);
            if (identifierStructure.TYPE[0] !== type) {
                throw new CompilerError(`Variable "${identifier}" has type ${identifierStructure.TYPE}, type ${type} was assigned. On position: ${position}.`).message
            };
        }

        const types_inheritance = extends_class ? [type, extends_class, "Object"] : [type, "Object"];

        const last_scope_in_scope_stack = this.scope_stack[this.scope_stack.length - 1];
        identifier && last_scope_in_scope_stack && last_scope_in_scope_stack.set_identifiers({ identifier, type: types_inheritance, is_declaration, position, return_type });
    }

    find(identifier) {
        const scope_stack = this.get_scope_stack;
        let exists = false;
        scope_stack.reverse().forEach((scope) => {
            const scope_identifier = scope.find(identifier);
            if (scope_identifier) exists = scope_identifier;
        })

        return exists;
    }

    get get_last_scope_id(){
        return this.get_scope_stack.reverse()[0].get_scope_id;
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
    ++index
    let return_value;
    AST.forEach((node) => {
        if (node.TYPE === "CLASS_DECLARATION") {
            const scope_id = node.state[0].position

            // Update scope with class identifier
            const identifier = node.state[1].lexem;
            const position = node.state[1].position;
            const type = node.state[1].lexem;

            // Extends support
            const extends_class = node.state[2].lexem === "extends" ? node.state[3].lexem : null;
            if (extends_class && !symbol_table.find(extends_class)) {
                throw new CompilerError(`Class ${extends_class} is not declared. On position ${node.state[3].position}`).message
            };

            // Add identifier inside scope
            symbol_table.update_last_scope({ identifier, type, is_declaration: true, position, extends_class });

            // Create scope inside class
            symbol_table.create_scope(scope_id);
        }

        if (node.TYPE === "VARIABLE_DECLARATION") {
            const identifier = node.state[2].lexem;
            const position = node.state[2].position;
            const type = node.state[1].lexem;

            // TODO: multiple types computation
            const initial_value_type = node.state[4].TYPE;
            if (initial_value_type !== type) throw new CompilerError(`Type ${initial_value_type} can't be assigned to variable with type ${type}`).message

            symbol_table.update_last_scope({ identifier, type, is_declaration: true, position });
        }

        if (node.TYPE === "CLASS_PARAMETER_DECLARATION" ||
            node.TYPE === "CLASS_PARAMETER_DECLARATION_WITH_INIT") {
            const identifier = node.state[2].lexem;
            const position = node.state[2].position;
            let type = node.state[1].lexem;

            // TODO: multiple types computation
            const initValue = node.state[4];
            if (initValue) {
                let initial_value_type = initValue.TYPE;

                // Hande class init
                if (initial_value_type === "CLASS_INIT")
                    initial_value_type = initValue.state[1].lexem;

                if (initial_value_type !== type) throw new CompilerError(`Type ${initial_value_type} can't be assigned to variable with type ${type}`).message
            }

            symbol_table.update_last_scope({ identifier, type, is_declaration: true, position });
        }

        if (node.TYPE === "FUNCTION_STATEMENT") {
            const identifier = node.state[3].lexem;
            const position = node.state[3].position;
            const type = node.state[2].lexem;
            const return_type = node.state[1].lexem;
            const scope_id = node.state[3].lexem;

            symbol_table.update_last_scope({ identifier, type, is_declaration: true, position, return_type });
            // Create scope inside function
            symbol_table.create_scope(scope_id);
        }

        if (node.TYPE === "RETURN_STATEMENT") {
            const return_type = node.state[1].TYPE;
            const lexem = node.state[1].lexem;
            if (return_type === "ID") {
                const identifier = symbol_table.find(lexem);
                if (!identifier) throw new CompilerError(`Variable ${lexem} is not declared.`).message
                return return_value = identifier.TYPE[0];
            }
            return return_value = return_type;
        }

        if (node.TYPE === "VARIABLE_ASSIGNEMENT") {
            const identifier = node.state[0].lexem;
            const position = node.state[0].position;
            const type = node.state[2].TYPE;
            symbol_table.update_last_scope({ identifier, type, is_declaration: false, position });
        }

        if (node.TYPE === "FUNCTION_ARGUMENT") {
            const identifier = node.state[1].lexem;
            const position = node.state[1].position;
            const type = node.state[0].lexem;
            symbol_table.update_last_scope({ identifier, type, is_declaration: true, position });
        }

        if (node.TYPE === "ARIFMETIC_OPERATION_STATEMENT") {
            node.state.forEach((child_node) => {
                if (child_node.TYPE === "ID") {
                    const identifier = child_node.lexem;
                    const position = child_node.position;
                    const type = child_node.TYPE;
                    symbol_table.update_last_scope({ identifier, type, is_declaration: false, position });
                }
            })
        }

        const returned_value = node.state && traverseAstAndComputeScopes(node.state, symbol_table, symbol_table_snapshot, index);

        if (node.TYPE === "BODY") {
            return_value = returned_value;
        }

        if (node.TYPE === "FUNCTION_STATEMENT") {
            const return_type = node.state[1].lexem;
            const is_constructor = symbol_table.get_last_scope_id === return_type;
            if ((returned_value !== return_type) && !is_constructor )
                throw new CompilerError(`Function return type is ${return_type} type ${returned_value} was returned.`).message
        }

        if (node.TYPE === "CLASS_DECLARATION" || node.TYPE === "FUNCTION_STATEMENT") {
            // For testing purposes
            symbol_table_snapshot.push(symbol_table.scope_pop());
        }
    })

    // If no type was returned, we return Undefined type.
    return return_value || "Undefined";
}

semanticAnalyser();