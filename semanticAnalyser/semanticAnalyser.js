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
        return_type: Array<string> | string;
        class_properties: Object;
    }
*/
class IdentifierStructure {
    constructor({ identifier, type, is_declaration, position, return_type, class_properties }) {
        this.identifier = identifier
        this.TYPE = type;
        this.is_declaration = is_declaration
        this.position = position
        this.return_type = return_type ? return_type : type
        this.class_properties = class_properties
    }
}

/*
    Scope: {
        SCOPE_ID: number;
        IDENTIFIERS: IdentifierStructure[]
        IS_EXTENDS_SCOPE: boolean
    }
*/
class Scope {
    constructor(SCOPE_ID, IDENTIFIERS, IS_EXTENDS_SCOPE) {
        this.SCOPE_ID = SCOPE_ID;
        this.IDENTIFIERS = IDENTIFIERS;
        this.IS_EXTENDS_SCOPE = IS_EXTENDS_SCOPE
    }

    get get_identifiers() {
        return this.IDENTIFIERS;
    }

    get get_scope_id() {
        return this.SCOPE_ID;
    }

    set_identifiers({ identifier, type, is_declaration, position, return_type, class_properties }) {
        if (is_declaration) this.is_identifier_declared_in_scope_check(identifier);

        const identifier_structure = new IdentifierStructure({ identifier, type, is_declaration, position, return_type, class_properties });
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
    constructor(scope_stack, current_class) {
        this.scope_stack = scope_stack;
        this.current_class = current_class;
    }

    set_current_class(current_class) {
        this.current_class = current_class;
    }

    get get_scope_stack() {
        return this.scope_stack;
    }

    // Classic push method. (preferable to use create_scope method)
    scope_push(scope) {
        this.scope_stack.push(scope)
    }

    scope_pop() {
        // Pop last scope and all extends scopes with last scope
        let return_value;
        for (let i = this.scope_stack.length -1; i > 0; i--) {

            if(!return_value){
                return_value = this.scope_stack.pop(); 
            }else if(this.scope_stack.IS_EXTENDS_SCOPE){
                this.scope_stack.pop(); 
            }else{
                break;
            }
        }
        return return_value;
    }

    // Create scope without passing scope object into method.
    create_scope(scope_id, IS_EXTENDS_SCOPE = false) {
        const scope = new Scope(scope_id, [], IS_EXTENDS_SCOPE);
        this.scope_stack.push(scope)
    }

    update_last_scope({ identifier, type, is_declaration, position, extends_class, return_type, class_properties }) {

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
        identifier && last_scope_in_scope_stack && last_scope_in_scope_stack.set_identifiers({ identifier, type: types_inheritance, is_declaration, position, return_type, class_properties });
    }

    find(identifier) {
        const scope_stack = this.get_scope_stack;
        let exists = false;
        const reversed_scope_stack = [...scope_stack].reverse();
        reversed_scope_stack.forEach((scope) => {
            const scope_identifier = scope.find(identifier);
            if (scope_identifier) exists = scope_identifier;
        })

        return exists;
    }

    get get_last_scope_id() {
        return this.get_scope_stack[this.get_scope_stack.length - 1].get_scope_id;
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
    const initial_scope = new Scope("INITIAL_SCOPE", [], false)
    const symbol_table = new SymbolTable([initial_scope]);
    const symbol_table_snapshot = []
    traverseAstAndComputeScopes(AST[0].state, symbol_table, symbol_table_snapshot, 0)

    return symbol_table_snapshot;
}

const get_class_properties = (class_body) => {
    const class_properties = {}
    class_body.forEach((parameter) => {

        if (parameter.TYPE === "FUNCTION_STATEMENT") {
            class_properties[parameter.state[3].lexem] = {
                TYPE: parameter.TYPE,
                lexem: parameter.state[3].lexem,
                return_type: [parameter.state[1].lexem],
                identifier: parameter.state[3].lexem,
                is_declaration: true, 
                position: parameter.state[0].position, 
                class_properties: parameter.state[7].state[1].TYPE === "BODY" ? get_class_properties(parameter.state[7].state[1]) : null
            }
        }

        if (parameter.TYPE === "CLASS_PARAMETER_DECLARATION" ||
            parameter.TYPE === "CLASS_PARAMETER_DECLARATION_WITH_INIT") {
            class_properties[parameter.state[2].lexem] = {
                TYPE: parameter.TYPE,
                lexem: parameter.state[2].lexem,
                return_type: [parameter.state[1].lexem],
                identifier: parameter.state[2].lexem,
                is_declaration: true, 
                position: parameter.state[0].position, 
                class_properties: null
            }
        }
    })

    return class_properties;
}

const traverseAstAndComputeScopes = (AST, symbol_table, symbol_table_snapshot, index) => {
    ++index
    let return_value;
    AST.forEach((node) => {
        if (node.TYPE === "CLASS_DECLARATION") {
            const scope_id = node.state[1].position
            const current_class = node.state[1].lexem;

            // Update scope with class identifier
            const identifier = node.state[1].lexem;
            const position = node.state[1].position;
            const type = node.state[1].lexem;

            // Extends support
            const extends_class = node.state[2].lexem === "extends" ? node.state[3].lexem : null;
            if (extends_class && !symbol_table.find(extends_class)) {
                throw new CompilerError(`Class ${extends_class} is not declared. On position ${node.state[3].position}`).message
            };

            // To get class properties we should pass class body to get_class_properties function
            const class_properties = get_class_properties(node.state[extends_class ? 4 : 2].state);

            
            const compute_extends_scopes = (extends_class) => {
                const extends_class_object = symbol_table.find(extends_class);
                const extends_class_properties = Object.values(extends_class_object.class_properties);

                // If class extends class extends another class we compute that by recursive strategy 
                if (extends_class_object.return_type.length >= 2 && extends_class_object.return_type[1] !== "Object")
                    compute_extends_scopes(extends_class_object.return_type[1]);

                // Create scope for extends class
                symbol_table.create_scope(extends_class_object.position, true);

                // Add all extends class properties in last scope
                extends_class_properties.forEach(({identifier, TYPE, return_type, is_declaration, position, extends_class, class_properties}) => {
                    symbol_table.update_last_scope({ identifier, type: TYPE, is_declaration, position, extends_class, class_properties, return_type });
                })
            }

            // Add identifier inside scope
            symbol_table.update_last_scope({ identifier, type, is_declaration: true, position, extends_class, class_properties });

            extends_class && compute_extends_scopes(extends_class);

            // Create scope inside class
            symbol_table.create_scope(scope_id); 
        }

        if (node.TYPE === "VARIABLE_DECLARATION") {
            const identifier = node.state[2].lexem;
            const position = node.state[2].position;
            const type = node.state[1].lexem;


            const init_value = node.state[4];
            let initial_value_type = init_value.TYPE;

            if (init_value) {

                // Handle ARIFMETIC_OPERATION_STATEMENT
                if(initial_value_type === "ARIFMETIC_OPERATION_STATEMENT"){
                    if(init_value.state[0].TYPE === init_value.state[2].TYPE){
                        initial_value_type = init_value.state[0].TYPE;
                    }else{
                        throw new CompilerError(`Arifmetic operation ${init_value.state[1].lexem} can't be performed with types ${init_value.state[0].TYPE} and ${init_value.state[2].TYPE} types, on position ${position}`).message
                    }
                }

                if (initial_value_type === "ID") {
                    initial_value_type = symbol_table.find(init_value.lexem).return_type[0];
                }

                // Hande class init
                if (initial_value_type === "CLASS_INIT")
                    initial_value_type = init_value.state[1].lexem;

                // Handle access to object properties with dot
                // and variable declaration with this value.
                if (initial_value_type === "OBJECT_VALUES_ADRESSING") {
                    const INITIAL_SCOPE = symbol_table.get_scope_stack[0];
                    const current_scope = symbol_table.get_scope_stack[symbol_table.get_scope_stack.length - 1];
                    let class_property;
                    let used_class;
                    current_scope.IDENTIFIERS.forEach((identifier_structure) => {
                        if (identifier_structure.identifier === init_value.state[0].lexem) {
                            used_class = identifier_structure.return_type[0];
                        }
                    })
                    INITIAL_SCOPE.get_identifiers.forEach(identifier_structure => {
                        if (identifier_structure.identifier === used_class) {
                            class_property = identifier_structure.class_properties[init_value.state[2].lexem]
                        }
                    })

                    if (!class_property) {
                        throw new CompilerError(`Class property ${init_value.state[2].lexem} is not exists on class with type ${used_class}`).message
                    }

                    initial_value_type = class_property.return_type;
                }
            }

            if (initial_value_type !== type) throw new CompilerError(`Type ${initial_value_type} can't be assigned to variable with type ${type}, on position ${position}`).message

            symbol_table.update_last_scope({ identifier, type, is_declaration: true, position });
        }

        if (node.TYPE === "CLASS_PARAMETER_DECLARATION" ||
            node.TYPE === "CLASS_PARAMETER_DECLARATION_WITH_INIT") {
            const identifier = node.state[2].lexem;
            const position = node.state[2].position;
            let type = node.state[1].lexem;

            // TODO: multiple types computation
            const init_value = node.state[4];
            if (init_value) {
                let initial_value_type = init_value.TYPE;

                if(initial_value_type === "ID"){
                     const initial_value = symbol_table.find(init_value.lexem);
                     initial_value_type = initial_value && initial_value.return_type[0]
                }

                // Hande class init
                if (initial_value_type === "CLASS_INIT")
                    initial_value_type = init_value.state[1].lexem;

                if (!initial_value_type) throw new CompilerError(`Init variable is not declared, on position ${position}`).message
                if (initial_value_type !== type) throw new CompilerError(`Type ${initial_value_type} can't be assigned to variable with type ${type}, on position ${position}`).message
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
            if ((returned_value !== return_type) && !is_constructor)
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