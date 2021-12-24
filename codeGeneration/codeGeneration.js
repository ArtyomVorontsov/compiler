fs = require('fs');

const readText = require("../utils/readText");

const code = readText('./code.json');

const print = (text) => {
    const filename = "assembly.s";
    fs.writeFile(filename, text, function (err) {
        if (err) return console.log(err);
        console.log(`${filename} > ${text}`);
    });
}

// Mips code templates

const file_header = () => {
    return `
    .text
    .globl main
    .ent main

    main: 
        .text
    `;
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
    li $v0, 1
    syscall
    `
}

const ARIFMETIC_OPERATION_STATEMENT = (code) => {

    const operation = "MATH_OP_PLUS" === code.state[1].TYPE ? "add" : "sub";
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

codeGeneration(code);