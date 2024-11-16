import { ValidationError, UniqueConstraintError } from "sequelize";

/**
 * Handles Sequelize errors and formats them for API responses
 * @param {Error} error - Sequelize error object
 * @returns {Object} - Formatted error response
 */
const errorChecker = (error) => {
  // hanlde error validation
  if (error instanceof ValidationError) {
    const validationErrors = error.errors.map(
      ({ path, message, validatorKey }) => ({
        field: path,
        message,
        validator: validatorKey,
      })
    );

    return {
      status: "validation_error",
      errors: validationErrors,
    };
  }

  // hanlde error Unique
  if (error instanceof UniqueConstraintError) {
    const uniqueErrors = error.errors.map(({ path, message }) => ({
      field: path,
      message,
    }));

    return {
      status: "unique_constraint_error",
      errors: uniqueErrors,
    };
  }

  // hanlde error database
  if (error.name === "SequelizeDatabaseError") {
    return {
      status: "database_error",
      message: error.message,
    };
  }

  if (error.name) {
    return {
      status: error.name,
      message: error.message,
    };
  }

  // Default error handling
  return {
    status: "unknown_error",
    message: error.message || "An unknown error occurred",
  };
};

const errorHandler = (error, res) => {
  const handledError = errorChecker(error);

  return res.status(error.statusCode || 500).json({
    status: handledError.status,
    errors: handledError.errors || [{ message: handledError.message }],
  });
};

export default errorHandler;
