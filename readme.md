    ===== Usage =====
    
    format: alia="<command>" -d "description" -a "abstract" -t "tag1, tag2, tag3"

    example: rib regis example="echo 'helloworld' " -d "say hello world" -a "say hello world" -t "hello, world"
    
    ===== Advanced =====

    use <T> to replace the arguments dynamically

    example: 
        rib regis example="echo '<T>' " -d "echo" -a "echo" -t "echo"
        rib exec example -T "helloworld"
    
    output: echo 'helloworld'


    note: if there are multiple <T>, values will be assigned sequentially from right to left.

    example:
        rib regis example="echo '<T> <T>' " -d "echo" -a "echo" -t "echo"
        rib exec example -t "helloworld" "to you!"
    
    output: echo 'helloworld to you!'