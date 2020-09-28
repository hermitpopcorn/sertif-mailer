class BaseError extends Error {
    constructor(message) {
        super(message);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        // This clips the constructor invocation from the stack trace.
        // It's not absolutely essential, but it does make the stack trace a little nicer.
        Error.captureStackTrace(this, this.constructor);
    }
}

class TextTooLongError extends BaseError {
    constructor(data) {
        let text = "Text is too long.";
        if (data.text) {
            text = "Text is too long (" + data.text + ").";
        }
        super(text);
        this.data = data;
    }
}

class InsufficientArgumentsError extends BaseError {
    constructor(data) {
        super("Insufficient arguments to start the program.");
        this.data = data;
    }
}

class SheetNotFoundError extends BaseError {
    constructor(data) {
        super("Specified sheet was not found in the file.");
        this.data = data;
    }
}

module.exports = {
  TextTooLongError,
  InsufficientArgumentsError,
  SheetNotFoundError
};
