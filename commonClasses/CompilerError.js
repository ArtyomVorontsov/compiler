export class CompilerError {
    constructor(message, color = "red") {
        this.message = message[color];
    }
}