class CustomError extends Error {
  constructor(message, statusCode = 500, name = "unknown_error") {
    super(message);
    this.statusCode = statusCode;
    this.name = name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomError;
