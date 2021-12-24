
    .text
    .globl main
    .ent main

    main: 
        .text
    
    # ARIFMETIC_OPERATION_STATEMENT
    
    li $a0, 5
    
    
        sw $a0, 0($sp)
        addiu $sp, $sp, -4
    
    
    li $a0, 30
    
    
    lw $t1, 4($sp)
    add $a0, $a0, $t1
    
    
    addiu $sp, $sp, 4
    
    
    # print_value
    li $v0, 1
    syscall
    
    # file_footer
    li $v0, 10
    syscall
    .end main
    