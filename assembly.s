
    .text
    .globl main
    .ent main

    main: 
        .data
        
    # header_data
VALUE72: .ascii "hello world"VALUE126: .ascii "bue world"

        .text
    
    # IF_OPERATION_STATEMENT
    
    li $a0, 0
    
    
        # is_equal_zero 
        beqz $a0, BRANCH56
    

    # branch body
    
        # KEY_WORD_PRINT
        
        la $a0, VALUE72
        
    # print_value
    li $v0, 4
    syscall
    
    
        $BRANCH94:
    
    # IF_OPERATION_STATEMENT
    
    li $a0, 1
    
    
        # is_equal_zero 
        beqz $a0, BRANCH108
    

    # branch body
    
        # KEY_WORD_PRINT
        
        la $a0, VALUE126
        
    # print_value
    li $v0, 4
    syscall
    
    
        $BRANCH146:
    
        $BRANCH152:
    
        $BRANCH154:
    
        $BRANCH0:
    
    # file_footer
    li $v0, 10
    syscall
    .end main
    