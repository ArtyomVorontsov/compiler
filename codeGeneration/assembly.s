
    .text
    .globl main
    .ent main

    main: 
        .data
        
    # header_data
VALUE72: .asciiz "\nhello world\n"
VALUE126: .asciiz "\nbue world\n"
ASK_AGE: .asciiz "Enter you age:"
OLD_AGE: .word 17


    .text

    # ASK_AGE
    la $a0, ASK_AGE

    li $v0, 4
    syscall

    li $v0, 5 
    syscall

    move $t0, $v0
    
    # IF_OPERATION_STATEMENT
    
    move $a0, $t0
    
    
        # is_equal_zero 
        lw $t1, OLD_AGE
        bgt $a0, $t1, BRANCH94
    

    # branch body
    
        # KEY_WORD_PRINT
        
        la $a0, VALUE72
        
    # print_value
    li $v0, 4
    syscall

     # file_footer
    li $v0, 10
    syscall
    .end main
    
    
        BRANCH94:
    
    # IF_OPERATION_STATEMENT
    
    move $a0, $t0
    
    
        # is_equal_zero 
        lw $t1, OLD_AGE
        blt $a0, $t1 , BRANCH146
    

    # branch body
    
        # KEY_WORD_PRINT
        
        la $a0, VALUE126
        
    # print_value
    li $v0, 4
    syscall
    
    
        BRANCH146:
    
        BRANCH152:
    
        BRANCH154:
    
        BRANCH0:
    
    # file_footer
    li $v0, 10
    syscall
    .end main
    