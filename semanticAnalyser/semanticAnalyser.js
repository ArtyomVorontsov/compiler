const util = require('util');
const fs = require('fs');
const colors = require('colors');


class CompilerError {
    constructor(message, color = "red") {
        this.message = message[color];
    }
}

class Scope {
    constructor(SCOPE_ID, IDENTIFIERS, DECLARED_IDENTIFIERS) {
        this.SCOPE_ID = SCOPE_ID;
        this.IDENTIFIERS = IDENTIFIERS;
        this.DECLARED_IDENTIFIERS = DECLARED_IDENTIFIERS;
    }

    get get_identifiers() {
        return this.IDENTIFIERS;
    }

    get get_declared_identifiers() {
        return this.DECLARED_IDENTIFIERS;
    }

    get get_scope_id() {
        return this.SCOPE_ID;
    }

    set_identifiers(identifier) {
        return this.IDENTIFIERS.push(identifier);
    }

    set_declated_identifiers(declared_identifier) {
        return this.DECLARED_IDENTIFIERS.push(declared_identifier);
    }
}

class SymbolTable {
    constructor(scope_stack){
        this.scope_stack = scope_stack;
    }

    get get_scope_stack(){
        return this.scope_stack;
    }

    symbol_table_scope_push(scope){
        this.scope_stack.push(scope)
    }

    symbol_table_scope_pop(){
       return this.scope_stack.pop();
    }

    update_last_scope({identifier, declared_identifier}){

        const last_scope_in_scope_stack = this.scope_stack[this.scope_stack.length - 1];
        identifier && last_scope_in_scope_stack.set_identifiers(identifier);
        declared_identifier && last_scope_in_scope_stack.set_declated_identifiers(declared_identifier);
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
    const symbol_table = new SymbolTable([new Scope(AST[0].state[0].position, [], [])]);
    const symbol_table_snapshot = []
    traverseAstAndComputeScopes(AST[0].state, symbol_table, symbol_table_snapshot, 0)

    return symbol_table_snapshot;
}

const traverseAstAndComputeScopes = (AST, symbol_table, symbol_table_snapshot, index) => {
    AST.forEach((node) => {

        // Create scope.
        if (node.TYPE === "CLASS_DECLARATION") {    
        
             const identifier = { IDENTIFIER: node.state[1].lexem, TYPE_OF_EXPRESSION: node.state[0] };
            // Register class name in scope 
            symbol_table.update_last_scope({identifier, declared_identifier: node.state[1]});

            // Traverse each class node 
            node.state.forEach(class_node => {
                if (class_node.TYPE === "BODY") {
                    //Create new scope, and push it on top of the scope stack.
                    symbol_table.symbol_table_scope_push(new Scope(node.state[0].position, [], []));

                    traverseAstAndComputeScopes(class_node.state, symbol_table, symbol_table_snapshot, ++index)

                    // Clear symbol table scope.
                    symbol_table_snapshot.push(symbol_table.symbol_table_scope_pop());
                }
            })
        }

        // Register identifiers in symbol_table.
        if (node.TYPE === "VARIABLE_DECLARATION" || node.TYPE === "VARIABLE_ASSIGNEMENT") {

            // Register identifiers usage in scope
            node.state.forEach((terminal, index) => {
                if (terminal.TYPE === "ID") {
                    let TYPE_OF_EXPRESSION = node.state[index - 2];

                    if (!TYPE_OF_EXPRESSION) {
                        TYPE_OF_EXPRESSION = { TYPE: 'VARIABLE_ASSIGNEMENT', position: node.state[index].position, lexem: null }
                    }
                    symbol_table.update_last_scope({identifier: {IDENTIFIER: terminal.lexem, TYPE_OF_EXPRESSION }});
                }
            })

            // Register identifiers declaration in scope.
            if (node.TYPE === "VARIABLE_DECLARATION")
                symbol_table.update_last_scope({declared_identifier: node.state[2]});
        }
    });

    // Check for variable unique declaration in scope.
    symbol_table.get_scope_stack.forEach((scope) => {
        const unique_symbols = [];
        scope.DECLARED_IDENTIFIERS.forEach((declared_name) => {
            if (!unique_symbols.includes(declared_name.lexem)) {
                unique_symbols.push(declared_name.lexem)
            } else {
                const error = new CompilerError(`
                Error: Variable ${declared_name.lexem} already declared in this scope.\n
                On position ${declared_name.position}`, "red");
                throw error.message;
            }
        })
    })

    // Check for variable is declared.
    symbol_table.get_scope_stack.forEach((scope) => {
        scope.IDENTIFIERS.forEach((element) => {
            const declared_names = []
            scope.DECLARED_IDENTIFIERS.forEach((declared_name) => {
                declared_names.push(declared_name.lexem)
            })

            if (!declared_names.includes(element.IDENTIFIER)) {
                const error = new CompilerError(`
                Error: Variable ${element.IDENTIFIER} is not declared in this scope.\n
                On position ${element.TYPE_OF_EXPRESSION.position}`, "red");
                throw error.message;
            }
        })
    })

}

semanticAnalyser();