fs = require('fs');

const readText = require("../utils/readText");

const code = readText('/Users/artjoms/Desktop/parser/parser/output.json');

const print = (text) => {
    const filename = "assembly.s";
    fs.writeFile(filename, text, function (err) {
        if (err) return console.log(err);
        console.log(`${filename} > ${text}`);
    });
}

// Mips code templates

let header_data = `
    # header_data
`;
const add_header_data = (data) => {
    header_data = header_data + data;
}

const file_header = (header_data) => {
    return `
    .text
    .globl main
    .ent main

    main: 
        .data
        ${header_data}

        .text
    `;
}

const add_asciiz_text = (name, text) => {
    add_header_data(`${name}: .asciiz ${text}\n`)
}

const file_footer = () => {
    return `
    # file_footer
    li $v0, 10
    syscall
    .end main
    `;
}

const stack_push = () => {
    return `
        sw $a0, 0($sp)
        addiu $sp, $sp, -4
    `
}

const stack_pop = () => {
    return `
    addiu $sp, $sp, 4
    `
}

const load_in_register = (value) => {
    return `
    li $a0, ${value}
    `
}

const add_values = () => {
    return `
    lw $t1, 4($sp)
    add $a0, $a0, $t1
    `
}

const sub_values = () => {
    return `
    lw $t1, 4($sp)
    add $a0, $a0, $t1
    `
}

const print_value = () => {
    return `
    # print_value
    li $v0, 4
    syscall
    `
}

const ARIFMETIC_OPERATION_STATEMENT = (code) => {

    const v0 = code.state[0].lexem
    const v1 = code.state[2].lexem
    return `
    # ARIFMETIC_OPERATION_STATEMENT
    ${load_in_register(v0)}
    ${stack_push()}
    ${load_in_register(v1)}
    ${ "MATH_OP_PLUS" === code.state[1].TYPE  ? add_values() : sub_values()}
    ${stack_pop()}
    `;
}

const IF_OPERATION_STATEMENT = (ast, branch_end_position) => {

    const a0 = ast.state[2].lexem
    const branch_id = "BRANCH" + branch_end_position
    return `
    # IF_OPERATION_STATEMENT
    ${load_in_register(a0)}
    ${is_equal_zero(branch_id)}

    # branch body
    `;
}

const KEY_WORD_PRINT = (ast) => {

    const value = ast.state[2].state[0].lexem;
    add_asciiz_text("VALUE" + ast.state[2].state[0].position, value);
    return `
        # KEY_WORD_PRINT
        
        la $a0, VALUE${ast.state[2].state[0].position}
        ${print_value()}
    `
}

const CREATE_BRANCH = (ast) => {
    
    return `
        BRANCH${ast.position}:
    `
}

const is_equal_zero = ( branch_id) => {
    return `
        # is_equal_zero 
        beqz $a0, ${branch_id}
    `
}


let glued_code = "";
const glue = (code) => {
    glued_code = glued_code + code
}

const codeGeneration = (code) => {
    console.log(code)
    glue(file_header());
    glue(ARIFMETIC_OPERATION_STATEMENT(code));
    glue(print_value());
    glue(file_footer());
    print(glued_code)
}

const ast_traverse = (ast) => {
    if(ast.state){
        
        ast.state.forEach(node => {
            console.log(node.TYPE)

            if(node.TYPE === "IF_STATEMENT"){
                glue(IF_OPERATION_STATEMENT(node, node.state[node.state.length - 1].state[
                    node.state[node.state.length - 1].state.length-1
                ].position));
            }
            else if(node.TYPE === "KEY_WORD_PRINT"){
                glue(KEY_WORD_PRINT(ast))
            }
            else if(node.TYPE === "CLOSE_BRACE"){
                glue(CREATE_BRANCH(node))
            }
            
            ast_traverse(node)
            
        })
    }else{
        ast
    }
}

const add_file_header = () => {
    glued_code = file_header(header_data) + glued_code; 
}

ast_traverse(code[0])
add_file_header(header_data)
glue(file_footer());
print(glued_code)